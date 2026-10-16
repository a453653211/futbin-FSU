const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const C=require('../src/sbc-complex');
const context={floatRating:true,thresholds:[
    {abbr:'NAT',thresholds:[{requirement:2,points:1},{requirement:5,points:1},{requirement:8,points:1}]},
    {abbr:'LEA',thresholds:[{requirement:3,points:1},{requirement:5,points:1},{requirement:8,points:1}]},
    {abbr:'CLU',thresholds:[{requirement:2,points:1},{requirement:4,points:1},{requirement:7,points:1}]}]};
const p=(id,extra={})=>({id:String(id),databaseId:id,definitionId:id,rating:80,tier:3,nationId:1,leagueId:1,clubId:1,positions:[14],owners:1,...extra});
const req=(name,value,scope='GREATER',count=0)=>({label:name,scope,count,keys:[{name,value:[value]}]});
test('compiles live aggregate requirements and rejects unknown or mixed aggregate rules',()=>{
    const rules=C.compile([req('NATION_COUNT',2,'EXACT'),req('SAME_LEAGUE_COUNT',6,'LOWER'),req('TEAM_RATING',81),req('CHEMISTRY_POINTS',25)],11);
    assert.deepEqual(rules.map(r=>[r.kind,r.op,r.target]),[['distinct','exact',2],['same','max',6],['rating','min',81],['chemistry','min',25]]);
    assert.throws(()=>C.compile([req('NEW_UNKNOWN',1)],11),/暂不支持/);
    assert.throws(()=>C.compile([{...req('TEAM_RATING',81),keys:[{name:'TEAM_RATING',value:[81]},{name:'LEAGUE_COUNT',value:[4]}]}],11));
});
test('rating agrees with saved EA implementation across float and integer modes',()=>{
    const src=require('./fixtures/ea-methods.cjs').rating;
    for(const floating of [true,false]){
        const env={UTSquadEntity:{prototype:{},FIELD_PLAYERS:11},services:{Configuration:{checkFeatureEnabled:()=>floating}},UTServerSettingsRepository:{KEY:{}}};
        vm.runInNewContext(src,env);
        for(let seed=0;seed<100;seed++){
            const players=Array.from({length:11},(_,i)=>p(i,{rating:45+(seed*19+i*37)%55}));
            const squad={isSBC:()=>true,getFieldPlayers:()=>players.map(p=>({item:{...p,isValid:()=>true}}))};
            env.UTSquadEntity.prototype._calculateRating.call(squad);
            assert.equal(C.rating(players,floating),squad._rating);
        }
    }
});
test('out of position card gets zero chemistry and does not contribute; linked club is shared',()=>{
    const players=[p(1,{leagueId:1,nationId:1,clubId:90}),p(2,{leagueId:2,nationId:2,clubId:90}),p(3,{leagueId:3,nationId:3,clubId:90})];
    assert.deepEqual(C.chemistry(players,[14,14,0],context),{total:2,points:[1,1,0]});
    assert.throws(()=>C.chemistry([p(1,{standardChemistry:false})],[14],context),/EA 默契/);
});
test('exact nation count and dominant same-club count are simultaneous conditions',()=>{
    const rules=C.compile([req('NATION_COUNT',2,'EXACT'),req('SAME_CLUB_COUNT',2,'LOWER')],3);
    assert.equal(C.evaluate([p(1),p(2),p(3,{nationId:2,clubId:2})],[14,14,14],rules,context).valid,true);
    assert.equal(C.evaluate([p(1),p(2),p(3,{nationId:2})],[14,14,14],rules,context).valid,false);
});
test('major matches filler uses bronze after satisfying silver and chemistry requirements',async()=>{
    const rules=C.compile([req('NATION_ID',1,'GREATER',1),req('CLUB_COUNT',4),
        req('PLAYER_LEVEL',2,'GREATER',3),req('PLAYER_QUALITY',1),req('CHEMISTRY_POINTS',14)],11);
    const players=[];
    for(const [tier,rating] of [[1,60],[2,65],[3,75]])for(let i=0;i<16;i++){
        const id=players.length+1;
        players.push(p(id,{rating,tier,clubId:i%4+1,owned:true}));
    }
    const fixed=[p(100,{rating:69,tier:2,clubId:1,owned:true}),
        p(101,{rating:60,tier:1,clubId:2,owned:true})];
    const result=await C.search({players,positions:Array(11).fill(14),rules,context,
        fixed,seed:1,maxMs:1000,stopAtFirst:true,yieldFn:async()=>{}});
    assert.equal(result.status,'feasible');
    assert.equal(C.evaluate(result.solution,Array(11).fill(14),rules,context).valid,true);
    assert.deepEqual(result.solution.slice(0,2).map(card=>card.id),['100','101']);
    assert.deepEqual(result.solution.map(card=>card.tier).sort(),[1,1,1,1,1,1,1,1,2,2,2]);
});
test('budget exhaustion is unknown; cancelled planning cannot produce a purchasable plan',async()=>{
    const options={players:[p(1)],positions:[14],rules:[],context,maxMs:0};
    assert.equal((await C.search(options)).status,'unknown');
    await assert.rejects(C.search({...options,cancelled:()=>true}),/取消/);
    assert.throws(()=>C.needs({status:'unknown',solutions:[]}),/完整/);
    assert.throws(()=>C.needs({status:'feasible',solutions:[]}),/完整/);
});
test('joint planning reserves physical cards, preserves fixed positions and never duplicates identity within a squad',async()=>{
    const players=[p(1),p(2),p(3),p(4)],challenges=[{id:1,positions:[14,14],rules:[],fixed:[p(1)]},{id:2,positions:[14,14],rules:[]}];
    const plan=await C.planGroup({players,challenges,context,maxMs:1000,yieldFn:async()=>{}});
    assert.equal(plan.status,'feasible');assert.equal(C.needs(plan).length,0);
    assert.equal(plan.solutions.find(s=>s.challengeId===1).solution[0].id,'1');
    assert.equal(new Set(plan.solutions.flatMap(s=>s.solution.map(p=>p.id))).size,4);
    await assert.rejects(C.planGroup({players,challenges:[challenges[0],{...challenges[1],fixed:[p(1)]}],context}),/实体卡/);
    const result=await C.search({players:[p(1),p(2,{databaseId:1})],positions:[14,14],rules:[],context});
    assert.equal(result.status,'infeasible');
});
test('procurement needs retain exact versions, slots and quantities',()=>{
    const card=p(3,{owned:false,definitionId:333});
    const plan={status:'feasible',solutions:[{challengeId:1,solution:[p(1),card],metrics:{valid:true}},{challengeId:2,solution:[p(2),card],metrics:{valid:true}}]};
    const needs=C.needs(plan);assert.equal(needs.length,2);assert.notEqual(needs[0].key,needs[1].key);
    assert.ok(needs.every(n=>n.definitionId===333));
    plan.solutions[1].solution[0]=p(1);assert.throws(()=>C.needs(plan),/重复/);
});
