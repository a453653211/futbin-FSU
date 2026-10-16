const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const ea = require('./fixtures/ea-methods.cjs');
const source = fs.readFileSync(path.join(__dirname, '../src/sbc-market-adapter.js'), 'utf8');
function setup() {
    const calls = [], storage = new Map();
    let response = { success: true, response: { items: [] } };
    const observable = value => ({ unobserve: () => calls.push('unobserve'), observe(owner, cb) { cb(this, value); } });
    const user = { tradeAccess: 1, selectedPersona: 12, _personas: new Map([[12, { id: 12, sku: 'pc27' }]]),
        getSelectedPersona: vm.runInNewContext('(' + ea.persona + ')', { _0x4abae4: () => {} }), getCurrency: () => ({ amount: 5000 }) };
    const ctx = { events: {}, info: { base: { year: 27, platform: 'pc' } }, setTimeout, clearTimeout,
        UTSearchCriteriaDTO: class {}, SearchType: { PLAYER: 'player' }, SearchCategory: { ANY: 'any' },
        PlayerPosition: { GK: 0 }, GameSku: { PC: 'pc27', STEAM: 'steam27' }, GameCurrency: { COINS: 'coins' },
        TradeAccessLevel: { ALLOWED: 1 }, APP_YEAR_SHORT: 27, ItemPile: { INBOX: 8 }, AuthenticationState: { AUTHENTICATING: 1 },
        GM_getValue: (k, d) => storage.get(k) ?? d, UtasErrorCode: { CAPTCHA_REQUIRED: 458 },
        services: { Authentication: { utasSession: { id: 'mock-session', state: 2, isAuthenticated() { return this.state === 2; } } },
            User: { getUser: () => user, requestCurrencies: () => { calls.push('currencies'); return observable(response); } },
            Item: { searchConceptItems() {}, itemDao: { searchTransferMarket(c) { calls.push(['search', c]); return observable(response); } },
                transfersDao: { getAuctionData(items) { calls.push(['refresh', items]); return observable(response); } },
                bid(item, amount) { calls.push(['buy', item, amount]); return observable(response); } } } };
    vm.createContext(ctx); vm.runInContext(source, ctx);
    return { ctx, calls, storage, user, adapter: ctx.events.smartSbcMarketAdapter(), setResponse: v => { response = v; } };
}

test('SBC market uses native numeric-persona getter and isolates legacy pending records', () => {
    const f = setup(); f.adapter.check();
    assert.equal(f.user.selectedPersona, 12); assert.equal(f.adapter.scope(), '27:12:pc27:pc');
    f.storage.set('fsuMarket.v2.' + f.adapter.scope(), '{"pending":[{"tradeId":"42"}]}');
    assert.equal(f.adapter.load().pending.length, 1);
    f.user._personas.set(34, { id: 34, sku: 'ps27' }); f.user.selectedPersona = 34; f.ctx.info.base.platform = 'ps';
    assert.equal(f.adapter.scope(), '27:34:ps27:ps'); assert.equal(f.adapter.load().pending, undefined);
    f.user._personas.clear(); assert.throws(() => f.adapter.scope(), /账号/); assert.equal(f.calls.length, 0);
});
test('SBC market rejects wrong platform/season/access and supports Steam PC', () => {
    const f = setup(); f.user.getSelectedPersona().sku = 'steam27'; f.adapter.check();
    f.ctx.info.base.platform = 'ps'; assert.throws(() => f.adapter.check(), /PC/);
    f.ctx.info.base.platform = 'pc'; f.ctx.info.base.year = 26; assert.throws(() => f.adapter.check(), /赛季/);
    f.ctx.info.base.year = 27; f.user.tradeAccess = 0; assert.throws(() => f.adapter.check(), /权限/);
});
test('reauthentication and SID rotation remain native; expired sessions fail', () => {
    const f = setup(), s = f.ctx.services.Authentication.utasSession;
    assert.equal(f.adapter.session(), 'mock-session'); s.id = 'rotated'; assert.equal(f.adapter.session(), 'rotated');
    s.state = 1; assert.equal(f.adapter.session(), null); s.state = 0; assert.throws(() => f.adapter.session(), /会话/);
    const apply = vm.runInNewContext('(' + ea.headers + ')', { _0x529c2b: () => {}, _0x322716: { prototype: { _setDefaultHeaders() {} } } });
    const headers = [], request = { authDelegate: { getUtasSession: () => s }, http: { setRequestHeader: (k, v) => headers.push([k, v]) } };
    apply.call(request); s.id = 'next'; apply.call(request);
    assert.deepEqual(headers, [['X-UT-SID', 'rotated'], ['X-UT-SID', 'next']]);
});
test('SBC search keeps exact version, BIN cap and pagination, and sends only explicit buy amount', async () => {
    const f = setup(); await f.adapter.search({ defId: 101 }, 23750, 'buy', 3);
    const c = f.calls.find(x => x[0] === 'search')[1];
    assert.deepEqual([...c.defId], [101]); assert.equal(c.maxBuy, 23750); assert.equal(c.maxBid, undefined);
    assert.equal(c.offset, 40); assert.equal(c.count, 20);
    await assert.rejects(f.adapter.search({ defId: 101 }, 1000, 'bid'), /一口价/);
    await f.adapter.buy({}, 23750); assert.equal(f.calls.find(x => x[0] === 'buy')[2], 23750);
});
test('auction refresh uses native DAO without implicit currency reads', async () => {
    const f = setup(); let updated = false;
    const item = { getAuctionData: () => ({ tradeId: '42', update: () => { updated = true; }, isWon: () => true }) };
    f.setResponse({ success: true, response: { items: [{ id: 23, duplicateId: 0, getAuctionData: () => ({ tradeId: '42' }) }] } });
    assert.deepEqual([...await f.adapter.refresh([item])], ['42']); assert.ok(updated); assert.equal(item.pile, 8);
    assert.ok(!f.calls.includes('currencies'));
});
test('permission failures detach observers and timeout blocks later purchases', async () => {
    const f = setup(); f.setResponse({ success: false, error: { code: 458 } });
    await assert.rejects(f.adapter.currencies(), e => e.fatal); assert.ok(f.calls.includes('unobserve'));
    let detached = false;
    await assert.rejects(f.ctx.events.smartSbcMarketObserve(() => ({ observe() {}, unobserve() { detached = true; } }), 1), e => e.uncertain);
    assert.ok(detached); assert.throws(() => f.adapter.check(), /刷新/);
});
