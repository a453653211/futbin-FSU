const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Buyer,quote}=require('../src/sbc-procurement');
const need={key:'25:4',challengeId:25,definitionId:100,rating:78,name:'Test Player'};
function fixture(options={}){
    const state={records:null,bought:0,claimed:0,approvals:[],refreshes:0,owned:false,stopped:false,amount:options.amount||1000};
    const item={id:123},a={scope:()=> '27:person:pc',check:()=>{if(state.stopped)throw new Error('stopped');},
        loadPurchases:()=>state.records,savePurchases:d=>{state.records=structuredClone(d);},
        player:()=>({player:true,defId:100,rating:78}),auction:()=>({tradeId:'777',buy:state.amount,valid:true,active:!state.bought,closed:!!state.bought,won:!!state.bought,highest:!!state.bought}),
        findOwned:async()=>state.owned?item:null,ensureNeed:async()=>!state.owned,
        maxPrice:()=>10000,search:async()=>({items:[item],end:true}),
        refresh:async()=>{state.refreshes++;options.onRefresh?.(state);return ['777'];},currencies:async()=>{},coins:()=>20000,canBuy:()=>true,
        confirm:async q=>{state.approvals.push(q.amount);options.onConfirm?.(state);return options.approve!==false;},
        buy:async()=>{assert.equal(state.records.records.at(-1).state,'intent');state.bought++;if(options.uncertain)throw new Error('timeout');},
        recoverTrade:async()=>options.missingTrade?null:item,
        claim:async()=>{state.claimed++;if(options.unclaimable)return null;state.owned=true;return item;}};
    return {state,a};
}
test('1000 is per-card threshold; exact missing quantity bought once and intent is durable first',async()=>{
    const {state,a}=fixture(),b=new Buyer(a);
    await b.buy(need,'p1');await b.buy(need,'p1');
    assert.equal(state.bought,1);assert.equal(state.claimed,1);assert.deepEqual(state.approvals,[]);
    assert.equal(state.records.records[0].state,'claimed');
});
test('higher than 1000 requires concrete approval and higher replacement price requires another approval',async()=>{
    const {state,a}=fixture({amount:1100,onConfirm:s=>{if(s.approvals.length===1)s.amount=1200;}});
    await new Buyer(a).buy(need,'p1');assert.deepEqual(state.approvals,[1100,1200]);assert.equal(state.bought,1);
    assert.equal(state.records.records[0].amount,1200);
});
test('declined quote, wrong version and cancellation produce no buy',async()=>{
    const {state,a}=fixture({amount:1100,approve:false});
    assert.equal((await new Buyer(a).buy(need,'p')).status,'declined');assert.equal(state.bought,0);
    assert.equal(quote({}, {...need,definitionId:200},a),null);
    const f=fixture({amount:1100,onConfirm:s=>{s.stopped=true;}});
    await assert.rejects(new Buyer(f.a).buy(need,'p'),/stopped/);assert.equal(f.state.bought,0);
});
test('unknown outcome persists across reload and blocks another need until recovered',async()=>{
    const {state,a}=fixture({uncertain:true,missingTrade:true});
    await assert.rejects(new Buyer(a).buy(need,'p'),/timeout/);
    assert.equal(state.records.records[0].state,'unresolved');
    await assert.rejects(new Buyer(a).buy({...need,key:'25:5'},'p'),/历史交易/);
    assert.equal(state.bought,1);
});
test('confirmed win not yet claimed cannot count as usable inventory or trigger repeat buying',async()=>{
    const {state,a}=fixture({unclaimable:true});
    await assert.rejects(new Buyer(a).buy(need,'p'),/尚未进入/);
    assert.equal(state.records.records[0].state,'won');
    await assert.rejects(new Buyer(a).buy(need,'p'),/尚未进入/);assert.equal(state.bought,1);
});
test('recovery recognizes the already claimed physical card before requesting an old trade',async()=>{
    const {state,a}=fixture();await new Buyer(a).buy(need,'p');
    state.records.records[0].state='confirming';a.recoverTrade=async()=>{throw new Error('must not request');};
    await new Buyer(a).recover();assert.equal(state.records.records[0].state,'claimed');assert.equal(state.bought,1);
});
test('restored record from another account is rejected before any request',()=>{
    const {state,a}=fixture();state.records={scope:'another',records:[]};assert.throws(()=>new Buyer(a),/无法核对/);
});
