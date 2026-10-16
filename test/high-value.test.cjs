const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const high = require('../src/high-value-core');
const { parse } = require('acorn');

test('EA active squad ID zero is valid and still protects its physical players', async () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/high-value-integration.js'), 'utf8');
    let reader;
    const visit = node => {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'VariableDeclarator' && node.id?.name === 'readActive') reader = source.slice(node.init.start, node.init.end);
        for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value?.type) visit(value);
    };
    visit(parse(source, { ecmaVersion: 'latest' }));
    assert.ok(reader);
    const requested = [], env = { active: new Set(), request: async create => create(), services: { Squad: {
        requestSquadList: () => ({ data: { activeSquadId: 0, squads: [] } }),
        requestSquadById: id => { requested.push(id); return { data: { squad: { getPlayers: () => [
            { getItem: () => ({ id: 108 }) }, { getItem: () => ({ id: 109 }) }
        ] } } }; }
    } } };
    await vm.runInNewContext(`(${reader})`, env)();
    assert.deepEqual(requested, [0]); assert.deepEqual([...env.active], ['108', '109']);
});

test('high value requires strictly more than 50 percent and at least 500 extra coins', () => {
    assert.equal(high.threshold(1000), 1500);
    assert.equal(high.threshold(200), 700);
    assert.equal(high.threshold(650), 1150);
    assert.equal(high.threshold(2000), 3000);
    assert.equal(high.assess(83, 1500, { 83: 1000 }).high, false);
    assert.equal(high.assess(83, 1501, { 83: 1000 }).high, true);
    assert.equal(high.assess(83, 300, { 83: 200 }).high, false);
    assert.equal(high.threshold(1000, 75, 900), 1900);
    for (const args of [[0], [NaN], [1000, -1], [1000, 50, -1], [1000, 50, 0.5]])
        assert.throws(() => high.threshold(...args));
});
test('all ratings below 81 share 81; unavailable higher ratings and unknown prices are skipped', () => {
    for (const rating of [46, 65, 70, 80, 81]) {
        const row = high.assess(rating, 1200, { 81: 650 });
        assert.equal(row.high, true); assert.equal(row.baselineRating, 81); assert.equal(row.threshold, 1150);
        assert.equal(high.assess(rating, 1150, { 81: 650 }).high, false);
    }
    for (const row of [high.assess(82, 10000, { 81: 650 }), high.assess(81, 0, { 81: 650 }), high.assess(100, 9999, { 81: 650 })])
        assert.equal(row, null);
});
test('coin parsing supports FUTBIN K/M and separators without accepting scores or malformed values', () => {
    for (const [value, result] of [['1,250', 1250], ['2.2K', 2200], ['1.04M', 1040000], ['650280 score', null], ['-', null], [0, null], [null, null]])
        assert.equal(high.coins(value), result);
});
test('fresh baseline snapshots are FC27 source-bound, platform-bound and expire in 15 minutes', () => {
    const data = { source: high.source, year: 27, at: 1000000, platforms: { pc: { 81: 650 } } };
    assert.equal(high.fresh(data, 'pc', data.at + high.maxAge), true);
    assert.equal(high.fresh(data, 'ps', data.at), false);
    assert.equal(high.fresh(data, 'pc', data.at + high.maxAge + 1), false);
    assert.equal(high.fresh(data, 'pc', data.at - 1), false);
    assert.equal(high.fresh({ ...data, year: 26 }, 'pc', data.at), false);
    assert.equal(high.fresh({ ...data, source: 'https://other.example' }, 'pc', data.at), false);
});
test('quotes require exact resource, rating and explicit platform; wrong versions never substitute', () => {
    const data = { data: [{ resource_id: 123, rating: 83, pc_LCPrice: 1600, ps_LCPrice: 3000 },
        { resource_id: 999, rating: 83, pc_LCPrice: 10000 }] };
    assert.equal(high.exactPrice(data, 123, 83, 'pc'), 1600);
    assert.equal(high.exactPrice(data, 123, 83, 'ps'), 3000);
    assert.equal(high.exactPrice(data, 123, 84, 'pc'), null);
    assert.equal(high.exactPrice(data, 124, 83, 'pc'), null);
    assert.equal(high.exactPrice({ data: [data.data[0], data.data[0]] }, 123, 83, 'pc'), null);
    assert.equal(high.exactPrice({ data: [{ ...data.data[0], pc_LCPrice: null }] }, 123, 83, 'pc'), null);
    assert.equal(high.exactPrice({ data: [{ ...data.data[0], isSbc: true }] }, 123, 83, 'pc'), null);
});
test('tradability is explicit; lock, active squad, evolution and loans retain protections', () => {
    const item = { id: 1, definitionId: 123, tradable: true, isPlayer: () => true, loans: -1, endTime: -1 };
    assert.equal(high.tradable(item), true);
    for (const extra of [{ tradable: false }, { tradable: undefined }, { untradeableCount: 1 }, { concept: true }, { isPlayer: () => false }])
        assert.equal(high.tradable({ ...item, ...extra }), false);
    assert.equal(high.protection(item, new Set(['1']), new Set()), '锁定卡');
    assert.equal(high.protection(item, new Set(), new Set(['1'])), '主力／替补／储备');
    for (const extra of [{ upgrades: {} }, { academy: {} }, { isEnrolledInAcademy: () => true }])
        assert.equal(high.protection({ ...item, ...extra }, new Set(), new Set()), '进化卡');
    assert.equal(high.protection({ ...item, loans: 5 }, new Set(), new Set()), '租借／限用卡');
});
test('inventory rejects an early end, repeated physical items or changing player count', async () => {
    const events = {}, context = { events, FsuHighValue: high, UTSearchCriteriaDTO: class {}, services: { Club: {
        getStats: () => ({ response: { stats: [{ type: 'players', count: 3 }] } }),
        search: () => ({ response: { items: [{ id: 1 }], retrievedAll: true } }) } } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/high-value-integration.js'), 'utf8'), context);
    const request = async create => create();
    await assert.rejects(events.highValueInventory(() => {}, request), /数量发生变化/);
    context.services.Club.search = () => ({ response: { items: [{ id: 1 }] } });
    await assert.rejects(events.highValueInventory(() => {}, request), /库存发生变化/);
    const offsets = [];
    context.services.Club.search = c => { offsets.push(c.offset); return { response: { items: [{ id: c.offset + 1 }] } }; };
    assert.equal((await events.highValueInventory(() => {}, request)).length, 3);
    assert.deepEqual(offsets, [0, 1, 2]);
});
