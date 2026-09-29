const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Refresh } = require('../src/futbin-catalog-source.js');
const Catalog = require('../src/market-catalog.js');
const { Runner, floorPrice, eligible } = require('../src/auto-bid-core.js');

const now = 1789867200000;
const leagues = [13, 2216, 53, 2222];
const raw = (id, league) => ({ ID: id, resource_id: 100000 + id, playerid: 100000 + id,
    league, rating: 85, position: league === 2216 ? 'GK' : 'CM', raretype: 0,
    cardImage: 'https://cdn3.futbin.com/content/fifa27/img/cards/hd/0_gold.png',
    specialPlayerImage: null, common_name: 'Test ' + id });

test('gallery census covers four exact leagues, 85-rated gold keepers, and low priced cards', async () => {
    const calls = [], job = new Refresh(async url => {
        calls.push(url);
        const u = new URL(url), league = Number(u.searchParams.get('league'));
        if (url.includes('getFilteredPlayers')) return { at: now, httpAt: now,
            body: { errorcode: 200, data: u.searchParams.get('page') === '1' ? [raw(leagues.indexOf(league) + 1, league)] : [] } };
        const ids = u.searchParams.get('player_ids').split(',').map(Number);
        return { at: now, httpAt: now, body: { errorcode: 200, data: ids.map(ID => ({ ID,
            Player_Resource: 100000 + ID, Player_ID: 100000 + ID, LCPrice: 1200,
            checked: '2026-09-20 02:20:00' })) } };
    }, { kind: 'gallery' });
    let result;
    const builder = new Catalog.Builder('27:person:pc', 'gallery');
    for (let step = 1; step <= 9; step++) {
        result = await job.next(step);
        if (step < 9) assert.equal(builder.add(result, now), null);
    }
    assert.equal(result.total, 4);
    assert.deepEqual(result.items.map(r => r.leagueId), leagues);
    assert.equal(result.items[1].position, 0);
    assert.equal(result.items[0].value, 1200);
    assert.equal(calls.filter(x => x.includes('getFilteredPlayers')).length, 8);
    const snapshot = builder.add(result, now);
    assert.equal(Catalog.valid(snapshot, '27:person:pc', now, Catalog.HOUR, 'gallery'), true);
    assert.equal(Catalog.valid(snapshot, '27:person:pc', now, Catalog.HOUR, 'catalog'), false);
});

test('gallery rejects a league mismatch from FUTBIN instead of trusting the filter', async () => {
    const job = new Refresh(async () => ({ at: now, httpAt: now,
        body: { errorcode: 200, data: [raw(1, 53)] } }), { kind: 'gallery' });
    await assert.rejects(job.next(1), /联赛|目录卡版本/);
});

function fixture(owned = [], startTime = 1000000) {
    let time = startTime, balance = 100000, ledger = { version: 1, scope: '27:person:pc', rows: owned };
    const calls = [], tiers = [{ min: 1000, inc: 100 }, { min: 150, inc: 50 }];
    const row = { defId: 100001, futbinId: 1, name: 'Gold GK', rating: 85, position: 0, gk: 0,
        leagueId: 2216, player: true, gold: true, special: false, value: 1200,
        source: 'https://www.futbin.com/27/player/1/gold-gk', sourceAt: time };
    const snapshot = { version: 2, kind: 'gallery', scope: ledger.scope, year: 27, platform: 'pc',
        complete: true, total: 1, pages: 1, fetchedAt: time, source: 'https://www.futbin.com/27/players', rows: [row] };
    const item = { ...row, auction: { tradeId: '42', seconds: 3600, current: 0, start: 750, buy: 800,
        valid: true, active: true, owner: false, highest: false, stale: false } };
    const items = [item];
    const call = (name, fn) => async (...args) => { calls.push({ name, args }); return fn(...args); };
    const a = { scope: () => ledger.scope, session: () => 'sid', check() {}, player: x => x,
        auction: x => x.auction, floor: n => floorPrice(n, tiers), next: n => n + 50,
        canBid: () => true, canBuy: () => true, coins: () => balance,
        currencies: call('coins', () => {}), watched: call('watched', () => []),
        loadCatalog: kind => kind === 'gallery' ? snapshot : null, saveCatalog() {},
        catalogPage: call('catalog', (page, kind) => ({ page, pages: 1, total: 1, year: 27,
            platform: 'pc', at: time, source: snapshot.source, items: snapshot.rows,
            sourceMeta: { rawItemCount: 4, kind } })),
        loadOwned: () => ledger, saveOwned: value => { ledger = structuredClone(value); },
        search: call('search', (p, cap, kind) => ({ items: kind === 'buy' ? items : [], end: true })),
        refresh: call('refresh', xs => xs.map(x => x.auction.tradeId)),
        buy: call('buy', (x, amount) => { x.auction.current = amount; x.auction.won = true;
            x.auction.closed = true; x.auction.active = false; balance -= amount; }),
        bid: call('bid', () => {}), save() {} };
    const runner = new Runner(a, { now: () => time });
    const tick = async () => { time += 5000; await runner.tick(); };
    return { runner, calls, item, items, tick, ledger: () => ledger, snapshot };
}

test('gallery buys one exact 85-rated gold card below 70%, records the win, and never repeats', async () => {
    const f = fixture();
    assert.equal(eligible(f.item, { minRating: 85, allowGk: true, allowedLeagues: leagues }), true);
    f.runner.start(null, { gallery: true });
    for (let i = 0; i < 25; i++) await f.tick();
    assert.equal(f.calls.filter(c => c.name === 'buy').length, 1);
    assert.equal(f.calls.find(c => c.name === 'buy').args[1], 800);
    assert.equal(f.runner.stats.won, 1);
    assert.equal(f.ledger().rows[0].defId, 100001);
    const searches = f.calls.filter(c => c.name === 'search').length;
    for (let i = 0; i < 10; i++) await f.tick();
    assert.equal(f.calls.filter(c => c.name === 'search').length, searches);
});

test('manual history and an unresolved prior trade both block another gallery purchase', async () => {
    const owned = [{ defId: 100001, name: 'Gold GK', source: 'manual', at: 999999, tradeId: '' }];
    const f = fixture(owned); f.runner.start(null, { gallery: true });
    for (let i = 0; i < 10; i++) await f.tick();
    assert.equal(f.calls.some(c => c.name === 'search'), false);
    const g = fixture();
    g.runner.start({ version: 2, scope: '27:person:pc', pending: [{ tradeId: '99', defId: 100001,
        name: 'Gold GK', cap: 800, lastBid: 750, submitted: true, gallery: true }], blocked: [] }, { gallery: true });
    for (let i = 0; i < 10; i++) await g.tick();
    assert.equal(g.calls.some(c => c.name === 'search'), false);
});

test('two listings of one player never create concurrent purchases; wrong league cannot pass EA check', async () => {
    const f = fixture();
    f.items.push({ ...f.item, auction: { ...f.item.auction, tradeId: '43' } });
    f.runner.start(null, { gallery: true });
    for (let i = 0; i < 25; i++) await f.tick();
    assert.equal(f.calls.filter(c => c.name === 'buy').length, 1);
    assert.equal(f.runner.records.has('43'), false);
    const g = fixture(); g.item.leagueId = 53;
    g.runner.start(null, { gallery: true });
    for (let i = 0; i < 20; i++) await g.tick();
    assert.equal(g.calls.filter(c => c.name === 'buy').length, 0);
});

test('gallery list-only update stops before any market search', async () => {
    const f = fixture();
    f.runner.start(null, { gallery: true });
    f.runner.pause(); f.runner.restUntil = 1200000;
    f.runner.start(null, { gallery: true, referenceOnly: true });
    for (let i = 0; i < 8; i++) await f.tick();
    assert.equal(f.runner.mode, 'stopped');
    assert.equal(f.calls.filter(c => c.name === 'catalog').length, 1);
    assert.equal(f.calls.some(c => c.name === 'search' || c.name === 'buy'), false);
});

test('unresolved gallery purchase remains blocked after a day until explicitly cleared', () => {
    const f = fixture([], 100000000);
    f.runner.start({ version: 2, scope: '27:person:pc', pending: [],
        blocked: [{ tradeId: '99', defId: 100001, gallery: true, at: 1000000 }] }, { gallery: true });
    assert.equal(f.runner.records.get('99').state, 'unresolved');
    assert.equal(f.runner.clearGalleryBlock(100001), true);
    assert.equal(f.runner.records.has('99'), false);
});
