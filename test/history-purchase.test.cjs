const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Runner, floorPrice, historyCap } = require('../src/auto-bid-core.js');

const tiers = [{ min: 10000, inc: 250 }, { min: 1000, inc: 100 }, { min: 150, inc: 50 }];
const floor = n => floorPrice(n, tiers);
const history = { maskedDefId: 42, name: 'Selected player', limit: 10000,
    criteria: { type: 'player', maskedDefId: 42, defId: [], minBuy: 500, maxBuy: 10000,
        league: 13, nation: 14, maxBid: 2000 } };

function fixture(listings = [], coins = 20000) {
    let now = 1000000, balance = coins;
    const calls = [], saved = [];
    const request = (name, fn) => async (...args) => { calls.push({ name, at: now, args }); return fn(...args); };
    const adapter = {
        check() {}, scope: () => '27:account:pc', session: () => 'sid',
        player: item => item, auction: item => item.auction,
        floor, next: n => n + 50, canBuy: () => true, canBid: () => true,
        coins: () => balance, currencies: request('coins', () => {}),
        watched: request('watched', () => []),
        search: request('search', (row, cap, kind) => ({ items: listings.filter(item =>
            (item.defId & 0xffffff) === row.maskedDefId && item.auction.buy <= cap), end: true })),
        refresh: request('refresh', items => items.map(item => item.auction.tradeId)),
        buy: request('buy', (item, amount) => { balance -= amount; item.auction.won = true; item.auction.closed = true; }),
        bid: request('bid', () => { throw Error('history mode must not bid'); }),
        loadCatalog: () => null, save: row => saved.push(row)
    };
    const runner = new Runner(adapter, { now: () => now });
    const tick = async () => { now += 2000; await runner.tick(); };
    return { runner, calls, saved, tick, adapter };
}

function listing(id, defId = 42, patch = {}) {
    return { defId, player: true, gold: false, special: true, rating: 80, name: 'Selected player',
        auction: { tradeId: String(id), seconds: 3600, current: 0, start: 750, buy: 10000,
            valid: true, active: true, owner: false, highest: false, stale: false, ...patch } };
}

test('history uses an inclusive legal maxBuy and rejects an absent cap', () => {
    assert.equal(historyCap(10000, { floor }), 10000);
    assert.equal(historyCap(10001, { floor }), 10000);
    assert.equal(historyCap(0, { floor }), 0);
    const f = fixture();
    assert.throws(() => f.runner.start(null, { history: { ...history, limit: 0, criteria: { ...history.criteria, maxBuy: 0 } } }), /最高价无效/);
});

test('selected recent search submits one BIN after the 2-second gap and stops on confirmed win', async () => {
    const f = fixture([listing(11), listing(12, 43)]);
    f.runner.start(null, { history });
    for (let i = 0; i < 7; i++) await f.tick();
    assert.deepEqual(f.calls.map(c => c.name), ['coins', 'watched', 'search', 'buy', 'refresh']);
    assert.equal(f.calls[2].args[0].criteria.league, 13);
    assert.equal(f.calls[2].args[1], 10000);
    assert.equal(f.calls[2].args[2], 'buy');
    assert.equal(f.calls[3].args[1], 10000);
    assert.equal(f.calls[3].at - f.calls[2].at, 2000);
    assert.equal(f.runner.mode, 'stopped');
    assert.equal(f.runner.stats.won, 1);
    assert.equal(f.calls.filter(c => c.name === 'buy').length, 1);
});

test('wrong player, below-minimum and above-maximum results cannot be bought', async () => {
    const f = fixture([listing(11, 43), listing(12, 42, { buy: 400 }), listing(13, 42, { buy: 10100 })]);
    f.runner.start(null, { history });
    for (let i = 0; i < 6; i++) await f.tick();
    assert.equal(f.calls.some(c => c.name === 'buy' || c.name === 'bid'), false);
});

test('history can buy a matching card revision and a card below 1000 coins', async () => {
    const revised = listing(11, 0x100002a, { buy: 500 });
    const f = fixture([revised], 900);
    f.runner.start(null, { history });
    for (let i = 0; i < 6; i++) await f.tick();
    assert.equal(f.calls.find(c => c.name === 'search').args[1], 900);
    assert.equal(f.calls.filter(c => c.name === 'buy').length, 1);
    assert.equal(f.runner.mode, 'stopped');
});

test('a submitted purchase blocks further searches until EA confirms it', async () => {
    const item = listing(11);
    const f = fixture([item]);
    f.adapter.buy = async (...args) => { f.calls.push({ name: 'buy', args }); };
    f.runner.start(null, { history });
    for (let i = 0; i < 9; i++) await f.tick();
    assert.equal(f.calls.filter(c => c.name === 'search').length, 1);
    assert.equal(f.calls.filter(c => c.name === 'buy').length, 1);
    assert.equal(f.runner.mode, 'running');
    assert.equal(f.saved.at(-1).pending.length, 1);
});

test('an unknown result survives reload and blocks the same player until manually cleared', () => {
    const f = fixture();
    f.runner.start(null, { history });
    f.runner.records.set('99', { tradeId: '99', defId: 42, custom: true,
        historyKey: f.runner.historyKey, state: 'unresolved', blockedAt: 1000000 });
    f.runner.stop();
    const saved = f.saved.at(-1);
    const g = fixture();
    assert.throws(() => g.runner.start(saved, { history }), /结果不明/);
    assert.equal(g.calls.length, 0);
    assert.equal(g.runner.clearHistoryBlock('99'), true);
    assert.equal(g.runner.start(g.saved.at(-1), { history }), true);
});
