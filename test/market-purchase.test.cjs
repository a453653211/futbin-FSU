const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Runner,DEFAULTS,referenceCap,floorPrice,decision}=require('../src/auto-bid-core.js');
const tiers=[{min:100000,inc:1000},{min:50000,inc:500},{min:10000,inc:250},{min:1000,inc:100},{min:150,inc:50}];
const row=(defId=1)=>({defId,rating:87,position:25,gk:0,player:true,gold:true,special:false,name:'Test '+defId,
    value:40000,futbinId:defId,source:`https://www.futbin.com/27/player/${defId}/test`,sourceAt:1000000});
function fixture(options={}){
    let time=1000000,balance=100000,savedCatalog;
    const calls=[],items=[];
    const scope='27:12:FFA27PCC:pc';
    const snap=()=>({version:1,scope,year:27,platform:'pc',complete:true,total:2,pages:1,
        fetchedAt:time,source:'https://www.futbin.com/players',rows:[row(1),row(2)].map(r=>({...r,sourceAt:time}))});
    const call=(name,fn)=>async(...args)=>{calls.push({name,args,at:time});return fn(...args);};
    const a={scope:()=>scope,check(){},session:()=> 'sid',player:x=>x,auction:x=>x.auction,
        floor:n=>floorPrice(n,tiers),next:n=>n+50,canBid:(x,n)=>n<x.auction.buy,canBuy:()=>true,
        coins:()=>balance,currencies:call('coins',()=>{}),watched:call('watched',()=>[]),
        loadCatalog:()=>options.cached===false?null:snap(),saveCatalog:x=>{savedCatalog=x;},
        catalogPage:call('catalog',()=>({year:27,platform:'pc',page:1,pages:1,total:2,at:time,
            source:'https://www.futbin.com/players',items:snap().rows})),
        search:call('search',(r,cap,mode,page)=>({items:items.filter(x=>x.defId===r.defId),end:true})),
        refresh:call('refresh',xs=>xs.map(x=>x.auction.tradeId)),save(){},
        bid:call('bid',(x,n)=>{x.auction.current=n;x.auction.highest=true;balance-=n;}),
        buy:call('buy',(x,n)=>{if(options.buyError)throw options.buyError;
            x.auction.current=n;x.auction.bought=true;x.auction.won=true;x.auction.closed=true;x.auction.active=false;balance-=n;})};
    const runner=new Runner(a,{now:()=>time});
    const listing=(id,extra={})=>({...row(1),auction:{tradeId:String(id),seconds:3600,current:0,start:27750,buy:27750,
        valid:true,active:true,owner:false,highest:false,stale:false,...extra}});
    const tick=async(delta=5000)=>{time+=delta;await runner.tick();};
    const run=async(n=20)=>{for(let i=0;i<n;i++)await tick();};
    return {runner,a,calls,items,listing,tick,run,snap,time:()=>time,setTime:t=>{time=t;},setCoins:n=>{balance=n;},saved:()=>savedCatalog};
}
test('new rule is >=40000 PC reference and strictly less than 70% at every EA tier',()=>{
    const f=fixture();assert.equal(DEFAULTS.minReference,40000);assert.equal(DEFAULTS.ratio,.7);
    for(const [value,cap] of [[40000,27750],[50000,34750],[80000,55500],[100000,69500]])
        assert.equal(referenceCap(value,f.a),cap);
    for(let n=40000;n<15000000;n+=1377){const cap=referenceCap(n,f.a);assert.ok(cap*10<n*7);assert.equal(f.a.floor(cap),cap);}
});
test('one-hour default and only one/two-hour refresh options',()=>{
    const f=fixture();assert.equal(f.runner.c.priceTtlMs,3600000);
    f.runner.setRefreshHours(2);assert.equal(f.runner.c.priceTtlMs,7200000);
    assert.throws(()=>f.runner.setRefreshHours(5));
});
test('buy now finds long-lived listings through independent buy filters and confirms once',async()=>{
    const f=fixture();f.items.push(f.listing(42));f.runner.start();await f.run(30);
    assert.equal(f.calls.filter(c=>c.name==='buy').length,1);
    assert.equal(f.calls.filter(c=>c.name==='bid').length,0);
    assert.equal(f.runner.stats.won,1);assert.equal(f.runner.stats.spent,27750);
    assert.ok(f.calls.some(c=>c.name==='search'&&c.args[2]==='buy'));
    for(let i=1;i<f.calls.length;i++)assert.ok(f.calls[i].at-f.calls[i-1].at>=5000);
});
test('both search modes advance each card and pagination, never report full coverage on a repeated page',async()=>{
    const f=fixture();f.a.search=async(r,cap,mode,page)=>{
        f.calls.push({name:'search',args:[r,cap,mode,page],at:f.time()});
        return {items:[],end:page===2};
    };
    f.runner.start();await f.run(24);
    for(const mode of ['bid','buy'])for(const id of [1,2])
        assert.ok(f.calls.some(c=>c.name==='search'&&c.args[0].defId===id&&c.args[2]===mode&&c.args[3]===2));
});
test('expired cache is refreshed completely before any purchase; failure cannot use it',async()=>{
    const f=fixture();const old=f.snap();old.fetchedAt-=7200001;f.a.loadCatalog=()=>old;
    f.a.catalogPage=async()=>{throw Error('source unavailable');};
    f.items.push(f.listing(42));f.runner.start();await f.run(12);
    assert.equal(f.calls.some(c=>['buy','bid','search'].includes(c.name)),false);
    assert.equal(f.runner.mode,'paused');
});
test('buy timeout saves uncertain intent, pauses, and never blindly resubmits',async()=>{
    const f=fixture({buyError:Object.assign(Error('unknown'),{uncertain:true})});
    f.items.push(f.listing(42));f.runner.start();await f.run(20);
    assert.equal(f.calls.filter(c=>c.name==='buy').length,1);assert.equal(f.runner.mode,'paused');
    assert.equal(f.runner.stats.won,0);assert.equal(f.runner.snapshot().pending[0].kind,'buy');
});
test('exact 70%, illegal tiers, wrong definition and special cards never reach purchase',async()=>{
    const f=fixture();f.items.push(f.listing(40,{buy:28000}),f.listing(41,{buy:27751}),
        {...f.listing(42),defId:999},{...f.listing(43),special:true});
    f.runner.start();await f.run(25);assert.equal(f.calls.some(c=>['buy','bid'].includes(c.name)),false);
});
test('submission success alone is not a buy-now win',async()=>{
    const f=fixture();f.a.buy=async()=>{};f.items.push(f.listing(42));f.runner.start();await f.run(22);
    assert.equal(f.runner.stats.won,0);
});
test('reference-only refresh cannot bid or buy and stops after atomically saving the catalog',async()=>{
    const f=fixture();f.items.push(f.listing(42));f.runner.start(null,{referenceOnly:true});await f.run(8);
    assert.equal(f.runner.mode,'stopped');assert.equal(f.saved().total,2);
    assert.equal(f.calls.some(c=>['bid','buy','search'].includes(c.name)),false);
});
test('one-hour expiry and two-hour setting refresh the whole catalog before resuming searches',async()=>{
    for(const hours of [1,2]){
        const f=fixture();f.runner.setRefreshHours(hours);f.runner.start();await f.run(4);
        const expiry=f.runner.catalog.fetchedAt+hours*3600000;
        f.setTime(expiry);f.runner.cycleEnd=expiry+600000;f.runner.restUntil=0;
        const begin=f.calls.length;await f.run(5);
        const requests=f.calls.slice(begin).map(c=>c.name);
        assert.ok(requests.includes('catalog'));assert.ok(requests.indexOf('catalog')<requests.indexOf('search'));
    }
});
test('a staged catalog refresh keeps the old snapshot until the final validated step',async()=>{
    const f=fixture(),old=f.snap();old.fetchedAt-=7200001;f.a.loadCatalog=()=>old;
    f.a.catalogPage=async page=>page===1?{pending:true,page:1,year:27,platform:'pc'}:
        {page:2,pages:2,year:27,platform:'pc',total:2,at:f.time(),source:old.source,items:f.snap().rows};
    f.runner.start();await f.run(3);assert.equal(f.saved(),undefined);assert.equal(f.runner.players.length,0);
    await f.tick();assert.equal(f.saved().total,2);
});
test('generic submission failure is uncertain and remains read-only after resuming and reconciling',async()=>{
    const f=fixture({buyError:Error('network interrupted')});f.items.push(f.listing(42));f.runner.start();await f.run(12);
    assert.equal(f.runner.mode,'paused');assert.equal(f.runner.records.get('42').readOnly,true);
    f.runner.start();await f.run(20);assert.equal(f.calls.filter(c=>c.name==='buy').length,1);
});
test('reload during an in-flight bid recovers uncertain intent as read-only even if watchlist shows no bid',async()=>{
    const f=fixture(),item=f.listing(42,{start:750,buy:100000,seconds:30});f.a.watched=async()=>[item];
    f.runner.start({version:2,scope:f.a.scope(),pending:[{tradeId:'42',defId:1,cap:27750,lastBid:750,
        name:'Test',kind:'bid',submitted:true,uncertain:true}]});
    await f.run(15);assert.equal(f.calls.some(c=>c.name==='bid'),false);
    assert.equal(f.runner.records.get('42').readOnly,true);
});
test('expired and forced refreshes retain the previous full census as a completeness guard',async()=>{
    for(const referenceOnly of [false,true]){
        const f=fixture(),old=f.snap();old.sourceMeta={rawItemCount:73};
        if(!referenceOnly)old.fetchedAt-=7200001;
        f.a.loadCatalog=()=>old;
        f.a.catalogPage=async()=>({page:1,pages:1,year:27,platform:'pc',total:2,at:f.time(),
            source:old.source,items:f.snap().rows,sourceMeta:{rawItemCount:32}});
        f.runner.start(null,{referenceOnly});await f.run(6);
        assert.equal(f.saved(),undefined);assert.equal(f.runner.mode,'paused');
    }
});
test('unaffordable reference caps are skipped before either market search, with no extra price reads',async()=>{
    const f=fixture(),catalog=f.snap();catalog.rows[0].value=200000;f.a.loadCatalog=()=>catalog;f.setCoins(30000);
    f.runner.start();await f.run(12);
    const searches=f.calls.filter(c=>c.name==='search');assert.ok(searches.length>0);
    assert.ok(searches.every(c=>c.args[0].defId===2));
    assert.deepEqual([...new Set(searches.map(c=>c.args[2]))].sort(),['bid','buy']);
    assert.equal(f.calls.some(c=>c.name==='catalog'),false);
});
test('no affordable targets waits without market queries; the exact legal cap is affordable',async()=>{
    const f=fixture();f.setCoins(27749);f.runner.start();await f.run(8);
    assert.equal(f.calls.some(c=>c.name==='search'),false);assert.equal(f.runner.mode,'running');
    assert.match(f.runner.message,/金币|余额/);
    f.setCoins(27750);await f.run(4);
    assert.ok(f.calls.some(c=>c.name==='search'&&c.args[1]===27750));
});
test('balance changes rebuild affordability and restart pagination from page one',async()=>{
    const f=fixture();f.a.search=async(r,cap,mode,page)=>{
        f.calls.push({name:'search',args:[r,cap,mode,page],at:f.time()});return {items:[],end:false};
    };
    f.runner.start();await f.run(8);assert.ok(f.calls.some(c=>c.name==='search'&&c.args[3]===2));
    f.setCoins(20000);const before=f.calls.length;await f.run(4);
    assert.equal(f.calls.slice(before).some(c=>c.name==='search'),false);
    f.setCoins(30000);const after=f.calls.length;await f.run(3);
    assert.equal(f.calls.slice(after).find(c=>c.name==='search').args[3],1);
});
test('known legal card minimum above the permitted cap prevents a pointless query',async()=>{
    const f=fixture(),catalog=f.snap();catalog.rows.forEach(r=>{r.eaMinPrice=28000;});f.a.loadCatalog=()=>catalog;
    f.runner.start();await f.run(8);assert.equal(f.calls.some(c=>c.name==='search'),false);
});
module.exports={fixture,row};
