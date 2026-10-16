const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const acorn = require('acorn');
const { functions, read } = require('./helpers.cjs');
const source = read(require('../release.json').fodder.file);
const names = ['installFodderPublicBridge', 'patchFodderBuyRun', 'patchFodderLatestBridge', 'parsePlayer', 'mergeRosters', 'checkVariantIds'];
const code = Object.values(functions(source, names)).join('\n');
function setup(window = {}) {
    const ctx = { window, URL, Set, Map, Date, console, GM_xmlhttpRequest: () => { throw new Error('No live requests permitted'); },
        num: v => v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null };
    vm.createContext(ctx); vm.runInContext(code, ctx); return ctx;
}
test('Fodder public bridge only allows explicit FC27 catalogue/player GET sources', () => {
    const replies = [], ctx = setup();
    const w = { location: { origin: 'https://www.ea.com' }, addEventListener() {}, postMessage: value => replies.push(value) };
    const allow = ctx.installFodderPublicBridge(w, 'test-channel').allowed;
    for (const url of ['https://www.futbin.com/27/squads', 'https://www.futbin.com/27/totw/RTTK?holo=true',
        'https://www.futbin.org/futbin/api/27/fetchPlayerInformationMinimal?ID=100&platform=PC']) assert.equal(allow(url), true, url);
    for (const url of ['https://www.ea.com/ut/game/fc27/transfermarket', 'https://www.futbin.com/26/squads',
        'https://www.futbin.com/27/squads?token=secret', 'https://www.futbin.com/27/totw/RTTK?x=1',
        'https://user:password@www.futbin.com/27/squads', 'http://www.futbin.com/27/squads']) assert.equal(allow(url), false, url);
});
test('Fodder minimal metadata binds exact resource/version and platform price, rewards stay unavailable', () => {
    const c = setup(), row = { futbinId: 123, variant: 'holo' };
    const data = { data: [{ ID: 123, Player_Resource: 456, pc_LCPrice: 900, ps_LCPrice: 700, pc_MinPrice: 150, pc_MaxPrice: 10000 }] };
    assert.equal(c.parsePlayer(data, row, 'PC').resourceId, 456); assert.equal(c.parsePlayer(data, row, 'PC').price, 900);
    assert.equal(c.parsePlayer({ data: [{ ...data.data[0], isSbc: true }] }, row, 'PC').market, false);
    assert.throws(() => c.parsePlayer(data, { futbinId: 124 }, 'PC'), /编号未唯一匹配/);
    assert.throws(() => c.parsePlayer({ data: [{ ID: 123, Player_Resource: 0 }] }, row, 'PC'), /卡片编号/);
});
test('Fodder ambiguous normal/holo version IDs cannot become separately purchasable cards', () => {
    const c = setup();
    const merged = c.mergeRosters([{ futbinId: 1 }], [{ futbinId: 1 }, { futbinId: 2 }]);
    assert.equal(merged.rows.length, 2); assert.match(merged.warning, /排除/);
    const rows = c.checkVariantIds([{ resourceId: 777, variant: 'normal', status: 'metadata' },
        { resourceId: 777, variant: 'holo', status: 'metadata' }]);
    assert.ok(rows.every(r => r.status === 'error'));
});
test('Fodder adapter fails on unknown/duplicate factory or missing risk confirmation', () => {
    const c = setup(), core = read('test/fixtures/fodder-core.js');
    const patch = c.patchFodderBuyRun(core, acorn);
    const latest = c.patchFodderLatestBridge(patch.source, acorn, patch.adapter);
    assert.doesNotThrow(() => new vm.Script(latest.source));
    assert.throws(() => c.patchFodderBuyRun('function unknown(){}', acorn), /未识别/);
    assert.throws(() => c.patchFodderBuyRun(core + core, acorn), /未识别/);
    assert.throws(() => c.patchFodderLatestBridge(patch.source.replace('buy.riskTitle', 'changed'), acorn, patch.adapter), /风险确认/);
});
