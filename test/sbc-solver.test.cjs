const { test } = require('node:test');
const assert = require('node:assert/strict');
const solver = require('../src/sbc-solver.js');
const key = Object.fromEntries(['PLAYER_MIN_OVR', 'PLAYER_MAX_OVR', 'PLAYER_EXACT_OVR', 'PLAYER_QUALITY',
    'PLAYER_LEVEL', 'PLAYER_RARITY', 'PLAYER_RARITY_GROUP', 'NATION_ID', 'LEAGUE_ID', 'PLAYER_TRADABILITY',
    'CHEMISTRY_POINTS', 'TEAM_RATING'].map((k, i) => [k, i + 10]));
const scope = { GREATER: 1, LOWER: 2, EXACT: 0 };
const p = (id, rating, extras = {}) => ({ id, databaseId: id, rating, rareflag: 0, nationId: 1,
    leagueId: 1, tradable: false, getTier() { return this.rating < 65 ? 1 : this.rating < 75 ? 2 : 3; },
    belongsToGroup(id) { return id === 4 && this.rareflag === 1; }, ...extras });
function req(name, value, count, op = scope.GREATER, more = {}) {
    const pairs = { [key[name]]: [value], ...more };
    return { keys: () => Object.keys(pairs), getValue: k => pairs[k], count, scope: op, buildString: () => name };
}
const rules = (list, slots) => solver.normalize(list, { key, scope }, slots);
const run = (players, slots, requirements, extra = {}) => solver.solve({ players, slots,
    rules: rules(requirements, slots), yieldFn: async () => {}, ...extra });

test('four <=75 and four >=78, including threshold equality', async () => {
    const ps = [74,75,75,75,76,77,78,78,79,80].map((r, i) => p(i + 1, r));
    const result = await run(ps, 8, [req('PLAYER_MAX_OVR',75,4), req('PLAYER_MIN_OVR',78,4)]);
    assert.equal(result.filter(p => p.rating <= 75).length, 4);
    assert.equal(result.filter(p => p.rating >= 78).length, 4);
});
test('overlapping requirements count the same player in both conditions', async () => {
    const result = await run([p(1,78),p(2,78),p(3,79),p(4,80)], 4,
        [req('PLAYER_MIN_OVR',78,4),req('PLAYER_MAX_OVR',80,4)]);
    assert.equal(result.length, 4);
});
test('maximum qualifying count is separate from maximum rating', async () => {
    const ps = [70,71,75,78,79].map((r,i) => p(i + 1,r));
    const result = await run(ps, 4, [req('PLAYER_MAX_OVR',75,2,scope.LOWER)]);
    assert.equal(result.filter(p => p.rating <= 75).length,2);
});
test('exact qualifying count and exact rating', async () => {
    const result = await run([p(1,78),p(2,78),p(3,78),p(4,79)], 3,
        [req('PLAYER_EXACT_OVR',78,2,scope.EXACT)]);
    assert.equal(result.filter(p => p.rating === 78).length,2);
});
test('same card and different versions of a player cannot fill two slots', async () => {
    assert.equal(await run([p(1,75),p(1,75),p(2,78,{databaseId:1})],2,
        [req('PLAYER_MAX_OVR',75,1),req('PLAYER_MIN_OVR',78,1)]),null);
});
test('matching reassigns versions when greedy allocation would fail', () => {
    const a = p(1,75), b = p(2,75), a2 = p(3,78,{databaseId:1});
    const result = solver.allocate([{players:[a,b]}, {players:[a2]}],[1,1]);
    assert.deepEqual(new Set(result.map(p => p.databaseId)),new Set([1,2]));
});
test('preserves fixed players and counts them toward requirements', async () => {
    const result = await run([p(1,78),p(2,78),p(3,70)],2,[req('PLAYER_MIN_OVR',78,2)],{fixed:[p(1,78)]});
    assert.deepEqual(result.map(p => p.id),[2]);
});
test('fixed players can make exact constraints impossible', async () => {
    assert.equal(await run([p(3,70)],3,[req('PLAYER_MIN_OVR',78,1,scope.EXACT)],
        {fixed:[p(1,78),p(2,78)]}),null);
});
test('already complete squad returns no additions', async () => {
    assert.deepEqual(await run([],1,[req('PLAYER_MIN_OVR',78,1)],{fixed:[p(1,78)]}),[]);
});
test('zero matching players and insufficient inventory return no solution', async () => {
    assert.equal(await run([p(1,74)],1,[req('PLAYER_MIN_OVR',78,1)]),null);
    assert.equal(await run([p(1,78)],4,[req('PLAYER_MIN_OVR',78,4)]),null);
});
test('quality applies to all usable slots and respects rating tier boundaries', async () => {
    const result = await run([p(1,64),p(2,65),p(3,74),p(4,75)],2,
        [req('PLAYER_QUALITY',2,-1,scope.EXACT)]);
    assert.deepEqual(result.map(p => p.rating).sort(),[65,74]);
});
test('rare count and rating requirements are solved together', async () => {
    const result = await run([p(1,78),p(2,78),p(3,78,{rareflag:1})],2,
        [req('PLAYER_MIN_OVR',78,2),req('PLAYER_RARITY',1,1,scope.EXACT)]);
    assert.equal(result.filter(p => p.rareflag === 1).length,1);
});
test('combined criteria require one player to satisfy all predicates', async () => {
    const result = await run([p(1,70),p(2,79,{nationId:2}),p(3,80)],1,
        [req('PLAYER_MIN_OVR',78,1,scope.EXACT,{[key.NATION_ID]:[1]})]);
    assert.deepEqual(result.map(p => p.id),[3]);
});
test('unknown requirements/scopes are rejected instead of ignored', () => {
    assert.throws(() => rules([req('TEAM_RATING',80,-1)],11),/暂不支持/);
    assert.throws(() => rules([req('CHEMISTRY_POINTS',10,-1)],11),/暂不支持/);
    assert.throws(() => rules([req('PLAYER_MIN_OVR',78,4,99)],4),/暂不支持/);
    assert.throws(() => rules([req('PLAYER_MIN_OVR',78,-1)],4),/暂不支持/);
});
test('cancellation and search limit are distinct from no solution', async () => {
    await assert.rejects(run([p(1,78)],1,[req('PLAYER_MIN_OVR',78,1)],{cancelled:()=>true}),/取消/);
    await assert.rejects(run([p(1,78)],1,[req('PLAYER_MIN_OVR',78,1)],{maxNodes:0}),/搜索达到上限/);
});
test('keeps a verified feasible result when improvement runs out of search budget', async () => {
    let finish;
    const result = await run([p(1,70), p(2,71)], 1, [req('PLAYER_MIN_OVR', 70, 1)],
        { maxNodes: 2, onFinish: state => { finish = state; } });
    assert.deepEqual(result.map(player => player.id), [1]);
    assert.deepEqual({ feasible: finish.feasible, optimal: finish.optimal, reason: finish.reason },
        { feasible: true, optimal: false, reason: 'budget' });
});
test('can stop on first feasible result without claiming optimality', async () => {
    let finish;
    const result = await run([p(1,70), p(2,71)], 1, [req('PLAYER_MIN_OVR', 70, 1)],
        { stopAtFirst: true, onFinish: state => { finish = state; } });
    assert.equal(result.length, 1);
    assert.equal(finish.feasible, true);
    assert.equal(finish.optimal, false);
    assert.equal(finish.reason, 'first-feasible');
});
test('large inventory stays responsive and solves a basic upgrade', async () => {
    const players = Array.from({length:4000},(_,i)=>p(i+1,60+(i%25)));
    players.sort((a,b)=>a.rating-b.rating);
    let yields = 0;
    const result = await run(players,11,[req('PLAYER_MIN_OVR',78,4),req('PLAYER_MAX_OVR',75,4)],
        {yieldFn:async()=>{yields++;}});
    assert.equal(result.length,11);
    assert.ok(yields > 0);
});
test('low rating wins across different constraint groups, not just within a group', async () => {
    const result = await run([p(1,60),p(2,61,{nationId:2}),p(3,62,{nationId:2}),p(4,90)],2,
        [req('NATION_ID',1,0)]);
    assert.deepEqual(result.map(p=>p.rating).sort((a,b)=>a-b),[60,61]);
});
test('allocation minimizes rating even when versions compete for the same player', () => {
    const result = solver.allocate([{players:[p(1,60),p(2,61)]},
        {players:[p(3,60,{databaseId:1}),p(4,90,{databaseId:3})]}],[1,1]);
    assert.equal(result.reduce((n,p)=>n+p.rating,0),121);
});
test('300 deterministic randomized cases agree with exhaustive search', async () => {
    let seed = 31;
    const rand = n => (seed = (Math.imul(seed,1664525)+1013904223)>>>0) % n;
    for(let t=0;t<300;t++) {
        const ps=Array.from({length:8},(_,i)=>p(i+1,73+rand(8),{databaseId:1+rand(7)}));
        const slots=1+rand(4);
        const rs=rules(Array.from({length:1+rand(3)},()=>req(
            ['PLAYER_MIN_OVR','PLAYER_MAX_OVR','PLAYER_EXACT_OVR'][rand(3)],75+rand(4),rand(slots+1),rand(3))),slots);
        let exists=false, minimum=Infinity;
        for(let mask=0;mask<(1<<ps.length);mask++) {
            const selection=ps.filter((_,i)=>mask&(1<<i));
            if(selection.length!==slots || new Set(selection.map(p=>p.databaseId)).size!==slots) continue;
            if(rs.every(r=>{const n=selection.reduce((n,p)=>n+r.value(p),0);return r.op==='min'?n>=r.target:r.op==='max'?n<=r.target:n===r.target;})) {
                exists=true;minimum=Math.min(minimum,selection.reduce((n,p)=>n+p.rating,0));
            }
        }
        const result=await solver.solve({players:ps,slots,rules:rs,yieldFn:async()=>{}});
        assert.equal(result!==null,exists,`case ${t}`);
        if(result) {
            assert.equal(new Set(result.map(p=>p.databaseId)).size,slots);
            assert.equal(result.reduce((n,p)=>n+p.rating,0),minimum,`minimum rating case ${t}`);
        }
    }
});
