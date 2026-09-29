const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { Runner, DEFAULTS, floorPrice, referenceCap, decision, eligible } = require('../src/auto-bid-core.js');

const tiers = [{min:100000,inc:1000},{min:50000,inc:500},{min:10000,inc:250},{min:1000,inc:100},{min:150,inc:50},{min:0,inc:150}];
const player = (id = 1, extra = {}) => ({ defId: id, rating: 87, position: 25, gk: 0,
    player: true, gold: true, special: false, name: 'Test ' + id, minimum: 0, ...extra });
function fixture(options = {}) {
    let time = 1000000, balance = options.coins ?? 100000, saved;
    const calls = [], catalog = options.players || [player()], market = options.market || [];
    const quote = value => ({ value, at: time, scope: '27:person:pc', sourceAt: time });
    const auction = (id, extra = {}) => ({...player(), auction: { tradeId: String(id), seconds: 55,
        current: 0, start: 750, buy: 100000, valid: true, active: true, highest: false,
        owner: false, won: false, stale: false, ...extra }});
    const recordCall = (name, fn) => async (...args) => { calls.push({ name, at: time, args }); return fn(...args); };
    const adapter = {
        scope: () => '27:person:pc', session: () => 'session', check: () => {}, player: p => p,
        auction: p => p.auction, floor: n => floorPrice(n, tiers),
        next: n => { const t=tiers.find(t=>n>=t.min);return Math.round((n+t.inc)/t.inc)*t.inc; },
        canBid: (p,n,c) => n<=c && n>p.auction.current && n<p.auction.buy,
        coins: () => balance, currencies: recordCall('coins', () => {}),
        discover: recordCall('discover', () => ({items:catalog,end:true})),
        loadCatalog:()=>snapshot(), saveCatalog:()=>{},
        catalogPage:recordCall('discover',()=>page()),
        search: recordCall('search', (p,cap,kind,page) => ({items:kind==='bid'?market:[],end:true})), watched: recordCall('watched', () => options.watched || []),
        refresh: recordCall('refresh', items => { options.onRefresh?.(items);return items.map(p=>p.auction.tradeId); }),
        bid: recordCall('bid', (item, amount) => {
            if (options.bidError) throw options.bidError;
            item.auction.current = amount; item.auction.highest = true; item.auction.seconds = 30;
            balance -= amount;
        }),
        save: data => { saved = structuredClone(data); }
    };
    const snapshot=()=>({version:1,scope:adapter.scope(),year:27,platform:'pc',complete:true,total:catalog.length,pages:1,
        fetchedAt:time,source:'https://www.futbin.com/players',rows:catalog.map(r=>({...r,value:options.price??40000,
        futbinId:r.defId,source:'https://www.futbin.com/27/player/'+r.defId+'/test',sourceAt:time}))});
    const page=()=>({year:27,platform:'pc',page:1,pages:1,total:catalog.length,at:time,
        source:'https://www.futbin.com/players',items:snapshot().rows});
    const runner = new Runner(adapter, { now: () => time, config: options.config });
    const tick = async (delta = 5000) => { time += delta; await runner.tick(); };
    const run = async (count=20) => { for(let i=0;i<count;i++)await tick(); };
    const track = (item, overrides = {}) => {
        const r = { item, tradeId:item.auction.tradeId, defId:item.defId, scope:adapter.scope(), name:item.name,
            state:'watching', cap:1000, refreshedAt:time, submitted:false, uncertain:false, ...overrides };
        runner.records.set(r.tradeId,r); runner.quotes.set(r.defId,quote(options.price ?? 40000)); return r;
    };
    return {runner,adapter,calls,quote,auction,track,tick,run,market,
        page,snapshot,setTime:n=>{time=n;},time:()=>time,setCoins:n=>{balance=n;},saved:()=>saved};
}

test('gold range rejects GK, special, missing fields, and 86; includes both basic rarity variants',()=>{
    assert.equal(eligible(player()),true);
    for(const patch of [{position:0},{special:true},{rating:86},{gold:false},{position:undefined},{player:false}])
        assert.equal(eligible(player(1,patch)),false);
});
test('caps round DOWN at all EA price tier boundaries, never exceeding the applicable percentage',()=>{
    const {adapter}=fixture();
    for(let reference=40000;reference<=15000000;reference+=1377)
        assert.ok(referenceCap(reference,adapter)<=reference*.7);
    assert.equal(floorPrice(799.9,tiers),750); assert.equal(floorPrice(1099,tiers),1000);
    assert.equal(floorPrice(10249,tiers),10000); assert.equal(floorPrice(149,tiers),0);
});

test('70% applies uniformly, with strict exclusion of equality',()=>{
    const {adapter}=fixture();
    for(const [reference,cap] of [[40000,27750],[50000,34750],[80000,55500]])
        assert.equal(referenceCap(reference,adapter),cap);
});
test('reference threshold, legal floor, exact cap and buy-now exclusion',()=>{
    const f=fixture(),r=f.track(f.auction(10));
    const decide=q=>decision(r,q,10000,f.time(),f.adapter);
    assert.equal(decide(f.quote(39999)).state,'price-needed');
    assert.equal(decide(f.quote(40000)).amount,750);
    r.item.auction.current=950;assert.equal(decide(f.quote(40000)).amount,1000);
    r.item.auction.current=1000;assert.equal(decide(f.quote(40000)).state,'skipped');
    r.item.auction.current=0;r.item.auction.buy=750;assert.equal(decide(f.quote(40000)).state,'skipped');
    r.item.auction.buy=100000;r.item.auction.minimum=800;assert.equal(decide(f.quote(40000)).state,'skipped');
});
test('stale prices, wrong platform, stale auction and unknown outcome never produce bids',()=>{
    const f=fixture(),r=f.track(f.auction(10));
    for(const q of [null,{...f.quote(40000),scope:'ps'},{...f.quote(40000),at:f.time()-3600001}])
        assert.notEqual(decision(r,q,10000,f.time(),f.adapter).state,'bid');
    r.uncertain=true;assert.equal(decision(r,f.quote(40000),10000,f.time(),f.adapter).state,'refresh-needed');
    r.uncertain=false;r.refreshedAt-=12001;
    assert.equal(decision(r,f.quote(40000),10000,f.time(),f.adapter).state,'refresh-needed');
});
test('highest bidder waits; zero countdown is pending settlement, only server closed/highest wins',()=>{
    const f=fixture(),r=f.track(f.auction(10,{highest:true,seconds:0}));
    assert.equal(decision(r,f.quote(40000),10000,f.time(),f.adapter).state,'leading');
    r.item.auction.highest=false;assert.equal(decision(r,f.quote(40000),10000,f.time(),f.adapter).state,'settling');
    r.item.auction.closed=true;r.item.auction.won=true;
    assert.equal(decision(r,null,0,f.time(),f.adapter).state,'won');
});
test('full loop discovers/prices/searches/refreshes/bids once, never bids against itself',async()=>{
    const f=fixture();f.market.push(f.auction(42));f.runner.start();await f.run();
    assert.equal(f.calls.filter(c=>c.name==='bid').length,1);
    assert.equal(f.runner.stats.bids,1);assert.equal(f.runner.stats.won,0);
    assert.equal(f.runner.records.get('42').state,'leading');
    const names=f.calls.map(c=>c.name);assert.ok(names.indexOf('refresh')<names.indexOf('bid'));
    for(let i=1;i<f.calls.length;i++)assert.ok(f.calls[i].at-f.calls[i-1].at>=5000);
});

test('high-value cards use the same strict 70% cap for market search and bidding, then stop at that cap',async()=>{
    const f=fixture({price:80000,coins:100000});
    const item=f.auction(42,{current:55000,buy:100000});
    f.market.push(item);f.runner.start();await f.run(10);
    assert.equal(f.calls.find(c=>c.name==='search').args[1],55500);
    const bids=f.calls.filter(c=>c.name==='bid');
    assert.equal(bids.length,1);assert.equal(bids[0].args[1],55500);
    item.auction.highest=false;item.auction.outbid=true;item.auction.seconds=30;
    await f.run(7);
    assert.equal(f.calls.filter(c=>c.name==='bid').length,1);
});

test('a quote falling to 50,000 immediately reduces the allowed bid; rising cannot raise an existing cap',()=>{
    const f=fixture({price:80000,coins:100000});
    const r=f.track(f.auction(42,{current:55000,buy:100000}),{cap:55500});
    assert.equal(decision(r,f.quote(80000),100000,f.time(),f.adapter).amount,55500);
    assert.equal(decision(r,f.quote(50000),100000,f.time(),f.adapter).state,'skipped');
    r.cap=5000;r.item.auction.current=5000;
    assert.equal(decision(r,f.quote(80000),100000,f.time(),f.adapter).state,'skipped');
});
test('outbid within cap is raised at the next legal step and renewed 30 seconds are tracked',async()=>{
    const f=fixture();const item=f.auction(42);f.market.push(item);f.runner.start();await f.run(10);
    item.auction.highest=false;item.auction.outbid=true;item.auction.current=800;item.auction.seconds=30;
    await f.run(7);
    const bids=f.calls.filter(c=>c.name==='bid');assert.equal(bids.length,2);assert.equal(bids[1].args[1],850);
    item.auction.highest=false;item.auction.current=27750;await f.run(7);
    assert.equal(f.calls.filter(c=>c.name==='bid').length,2);
});
test('a newly higher reference never increases an existing auction cap',()=>{
    const f=fixture(),r=f.track(f.auction(42,{current:1000}));
    assert.equal(decision(r,f.quote(80000),100000,f.time(),f.adapter).state,'skipped');
});
test('bid acknowledgement is not a win; server settlement counts once',async()=>{
    const f=fixture();const item=f.auction(42);f.market.push(item);f.runner.start();await f.run(10);
    item.auction.won=true;item.auction.closed=true;item.auction.active=false;
    await f.run(10);assert.equal(f.runner.stats.won,1);assert.equal(f.runner.stats.spent,750);
});
test('work/rest boundary blocks pending bids and ALL reads for the full five minutes',async()=>{
    const f=fixture();f.runner.start();f.setTime(f.runner.cycleEnd);await f.tick(0);
    assert.equal(f.runner.mode,'rest');const before=f.calls.length;
    await f.run(59);assert.equal(f.calls.length,before);
    await f.tick();assert.equal(f.calls.at(-1).name,'coins');
    assert.equal(f.runner.mode,'running');
});
test('999 coins drains existing bids but does not resume buying after a refund; 1000 may bid',async()=>{
    const f=fixture({coins:999});f.runner.start();const r=f.track(f.auction(42,{highest:true}),{submitted:true});
    await f.run(5);assert.equal(f.runner.mode,'draining');assert.equal(f.calls.some(c=>c.name==='bid'),false);
    f.setCoins(10000);await f.run(3);assert.equal(f.runner.mode,'draining');
    r.item.auction.closed=true;r.item.auction.won=true;await f.run(5);assert.equal(f.runner.mode,'stopped');
    const g=fixture({coins:1000}),r2=g.track(g.auction(43));
    assert.equal(decision(r2,g.quote(40000),1000,g.time(),g.adapter).state,'bid');
});
test('no cumulative budget: successful purchases can exceed initial per-card cap',async()=>{
    const f=fixture();f.runner.start();await f.run(5);
    for(let i=1;i<=4;i++){
        const r=f.track(f.auction(100+i,{highest:true,current:750,closed:true,won:true}),{submitted:true});
        await f.tick();assert.equal(r.state,'won');
    }
    assert.equal(f.runner.stats.spent,3000);assert.equal(f.runner.mode,'running');
});
test('stop while a refresh is in flight cannot schedule a later bid',async()=>{
    const f=fixture();f.runner.start();await f.run(2);f.track(f.auction(42));
    let resolve;f.adapter.refresh=()=>new Promise(r=>{resolve=r;});const work=f.tick();
    await Promise.resolve();f.runner.stop();resolve(['42']);await work;await f.run(3);
    assert.equal(f.calls.some(c=>c.name==='bid'),false);assert.equal(f.runner.pendingBid,null);
});
test('concurrent ticks share one in-flight request',async()=>{
    const f=fixture();let resolve;f.adapter.currencies=()=>new Promise(r=>{resolve=r;});f.runner.start();
    const one=f.tick();await f.tick();assert.equal(f.runner.stats.requests,1);resolve();await one;
});
test('uncertain bid pauses, persists intent, and never retries automatically',async()=>{
    const f=fixture({bidError:Object.assign(new Error('timeout'),{uncertain:true})});f.market.push(f.auction(42));
    f.runner.start();await f.run();assert.equal(f.runner.mode,'paused');
    assert.equal(f.calls.filter(c=>c.name==='bid').length,1);
    assert.equal(f.saved().pending[0].uncertain,true);assert.equal(f.saved().pending[0].lastBid,750);
});
test('reload keeps rest deadline and pending intent until recovery; never auto-starts',async()=>{
    const f=fixture(),saved={version:1,scope:f.adapter.scope(),cycleEnd:f.time()+600000,restUntil:f.time()+300000,
        pending:[{tradeId:'42',defId:1,cap:1000,lastBid:750,submitted:true,uncertain:true,name:'Test'}]};
    await f.runner.tick();assert.equal(f.calls.length,0);f.runner.start(saved);
    assert.equal(f.saved().pending.length,1);await f.tick();assert.equal(f.runner.mode,'rest');assert.equal(f.calls.length,0);
});
test('recovery adopts only this script stored IDs, never manual bids',async()=>{
    const f=fixture();const ours=f.auction(42,{highest:true}),manual=f.auction(43,{highest:true});
    f.adapter.watched=async()=>[ours,manual];
    f.runner.start({version:1,scope:f.adapter.scope(),pending:[{tradeId:'42',defId:1,cap:1000,lastBid:750,name:'Ours'}]});
    await f.run(2);assert.ok(f.runner.records.has('42'));assert.equal(f.runner.records.has('43'),false);
});
test('a missing recovered trade remains blocked from discovery and survives another reload',async()=>{
    const f=fixture();f.market.push(f.auction(42));
    f.runner.start({version:1,scope:f.adapter.scope(),pending:[{tradeId:'42',defId:1,cap:1000,lastBid:750,name:'Missing'}]});
    await f.run(15);assert.equal(f.runner.records.get('42').state,'unresolved');assert.equal(f.runner.stats.bids,0);
    assert.equal(f.saved().blocked[0].tradeId,'42');
    const next=fixture();next.setTime(f.time());next.runner.start(f.saved());assert.equal(next.runner.records.get('42').state,'unresolved');
});
test('same-account session renewal clears queued bids and rechecks coins/watchlist/status before bidding',async()=>{
    const f=fixture();f.runner.start();await f.run(2);const r=f.track(f.auction(42));
    f.runner.pendingBid=r.tradeId;f.runner.refreshAt=f.time();const deadline=f.runner.cycleEnd;
    f.adapter.session=()=> 'renewed';const before=f.calls.length;
    await f.tick();assert.equal(f.runner.mode,'running');assert.equal(f.runner.pendingBid,null);
    assert.equal(f.runner.session,'renewed');assert.equal(f.runner.cycleEnd,deadline);
    await f.run(3);
    assert.deepEqual(f.calls.slice(before).map(c=>c.name),['coins','watched','refresh','bid']);
    for(let i=before;i<f.calls.length;i++) assert.ok(f.calls[i].at-f.calls[i-1].at>=5000);
    assert.ok(!JSON.stringify(f.saved()).includes('renewed'));
});

test('session renewal at ten minutes and during rest preserves the full five-minute break',async()=>{
    const f=fixture();f.runner.start();await f.run(2);const deadline=f.runner.cycleEnd;
    f.setTime(deadline);f.adapter.session=()=> 'renewed';await f.tick(0);
    assert.equal(f.runner.mode,'rest');const until=f.runner.restUntil,before=f.calls.length;
    assert.equal(until,deadline+300000);f.adapter.session=()=> 'renewed-again';
    await f.run(59);assert.equal(f.calls.length,before);assert.equal(f.runner.restUntil,until);
    await f.tick();assert.equal(f.runner.mode,'running');assert.equal(f.calls.at(-1).name,'coins');
    await f.tick();assert.equal(f.calls.at(-1).name,'watched');
});

test('in-progress authentication waits without requests and rechecks even if SID is unchanged',async()=>{
    const f=fixture();f.runner.start();await f.run(2);f.track(f.auction(42));
    f.runner.pendingBid='42';const before=f.calls.length,deadline=f.runner.cycleEnd;
    f.adapter.session=()=>null;await f.run(3);
    assert.equal(f.calls.length,before);assert.equal(f.runner.mode,'running');assert.equal(f.runner.pendingBid,null);
    f.adapter.session=()=> 'session';await f.tick();
    assert.equal(f.calls.at(-1).name,'coins');assert.equal(f.runner.cycleEnd,deadline);
    await f.tick();assert.equal(f.calls.at(-1).name,'watched');
});

test('authentication that never finishes pauses after a bounded wait without network requests',async()=>{
    const f=fixture();f.runner.start();await f.tick();const before=f.calls.length;
    f.adapter.session=()=>null;await f.run(7);
    assert.equal(f.calls.length,before);assert.equal(f.runner.mode,'paused');assert.match(f.runner.message,/续期.*超时/);
});

test('renewal during an in-flight read discards that response and begins reconciliation after the request gap',async()=>{
    const f=fixture();f.runner.start();await f.run(2);
    f.runner.catalog=null;f.runner.players=[];let resolve;f.adapter.catalogPage=()=>new Promise(r=>{resolve=r;});const work=f.tick();
    await Promise.resolve();f.adapter.session=()=> 'renewed';resolve({...f.page(),items:[player(123)]});await work;
    assert.equal(f.runner.players.length,0);assert.equal(f.runner.offset,0);
    const before=f.calls.length;await f.tick(1999);assert.equal(f.calls.length,before);
    await f.tick(1);assert.equal(f.calls.at(-1).name,'coins');
});

test('renewal after a successful bid reconciles the existing leading trade without repeating it',async()=>{
    const f=fixture();const item=f.auction(42);f.market.push(item);f.adapter.watched=async()=>[item];
    const bid=f.adapter.bid;f.adapter.bid=async(...args)=>{await bid(...args);f.adapter.session=()=> 'renewed';};
    f.runner.start();await f.run(20);
    assert.equal(f.calls.filter(c=>c.name==='bid').length,1);assert.equal(f.runner.mode,'running');
    assert.equal(f.runner.records.get('42').state,'leading');
});

test('account/platform change pauses before the next request even if SID is unchanged',async()=>{
    const f=fixture();f.runner.start();await f.tick();f.adapter.scope=()=> '27:other:ps';const before=f.calls.length;
    await f.tick();assert.equal(f.calls.length,before);assert.equal(f.runner.mode,'paused');
});

test('account change during an in-flight read discards the old response and pauses',async()=>{
    const f=fixture();f.runner.start();await f.run(2);
    f.runner.catalog=null;f.runner.players=[];
    let resolve;f.adapter.catalogPage=()=>new Promise(r=>{resolve=r;});const work=f.tick();
    await Promise.resolve();f.adapter.scope=()=> '27:other:ps';resolve(f.page());await work;
    assert.equal(f.runner.players.length,0);assert.equal(f.runner.mode,'paused');
    assert.equal(f.saved().scope,'27:person:pc');
});
test('three consecutive read errors pause; restricted response pauses immediately',async()=>{
    const f=fixture();f.adapter.currencies=async()=>{throw new Error('server');};f.runner.start();await f.run(3);
    assert.equal(f.runner.mode,'paused');assert.equal(f.runner.stats.requests,3);
    const g=fixture();g.adapter.currencies=async()=>{throw Object.assign(new Error('captcha'),{fatal:true});};
    g.runner.start();await g.tick();assert.equal(g.runner.mode,'paused');
});

test('failure logs name the failed request and retain the original status and pause flags',async()=>{
    const f=fixture();
    f.adapter.loadCatalog=()=>null;f.adapter.catalogPage=async()=>{throw Object.assign(new Error('EA 请求失败（400）'),{code:400});};
    f.runner.start();await f.run(5);
    assert.equal(f.runner.mode,'paused');
    assert.match(f.runner.message,/更新 FUTBIN PC 完整参考名单：EA 请求失败（400）/);
    assert.ok(f.runner.logs.some(l=>l.message.includes('请求未完成：更新 FUTBIN PC 完整参考名单：')));
    await assert.rejects(f.runner.request('出价',async()=>{throw Object.assign(new Error('timeout'),
        {code:504,fatal:true,uncertain:true});}),e=>e.code===504&&e.fatal&&e.uncertain&&e.message==='出价：timeout');
});
test('missing trade status never counts as a win and stops tracking after three failed snapshots',async()=>{
    const f=fixture();f.runner.start();await f.run(2);const r=f.track(f.auction(42),{submitted:true,uncertain:true});
    f.adapter.refresh=async()=>[];await f.run(8);
    assert.equal(r.state,'unresolved');assert.equal(f.runner.stats.won,0);assert.equal(f.runner.stats.bids,0);
});

// Check bid decisions against the actual EA auction entity saved on 2026-09-18.
test('official EA auction entity confirms extensions, outbid, highest and settled-won semantics',()=>{
    const source=fs.readFileSync(path.join(__dirname,'../.reference/ocompiled.decoded.js'),'utf8');
    const from=source.indexOf('UTAuctionEntity='), to=source.indexOf('}(EAObject)',from)+'}(EAObject)'.length;
    const context={a0_0x38d798:()=>{},a0_0x2b75:()=>{},EAObject:function(){},EAObservable:function(){this.notify=()=>{};},
        __extends:(c,p)=>{c.prototype=Object.create(p.prototype);c.prototype.constructor=c;},
        AuctionBidStateEnum:{NONE:'none',HIGHEST:'highest',OUTBID:'outbid',BUYNOW:'buyNow'},
        AuctionTradeStateEnum:{ACTIVE:'active',CLOSED:'closed',EXPIRED:'expired',INACTIVE:'inactive',INVALID:'invalid'},
        JSUtils:{isNumber:v=>typeof v==='number',isBoolean:v=>typeof v==='boolean'},AUCTION_MAX_BID:15000000,
        Date:{now:()=>100000},getDefaultDispatcher:()=>({notify:()=>{}}),AppNotification:{AUCTION_CLOSE:'closed'}};
    vm.runInNewContext(source.slice(from,to)+';',context);
    const a=new context.UTAuctionEntity({tradeId:'42',tradeState:'active',bidState:'highest',currentBid:750,
        startingBid:750,buyNowPrice:10000,expires:30,timestamp:100000});
    assert.equal(a.isHighestBid(),true);assert.equal(a.isWon(),false);assert.equal(a.getSecondsRemaining(),30);
    a.update(new context.UTAuctionEntity({tradeId:'42',tradeState:'active',bidState:'outbid',currentBid:800,
        startingBid:750,buyNowPrice:10000,expires:30,timestamp:100000}));
    assert.equal(a.isOutbid(),true);assert.equal(a.canBid(850,1000),true);assert.equal(a.canBid(10000,10000),false);
    a.update(new context.UTAuctionEntity({tradeId:'42',tradeState:'closed',bidState:'highest',currentBid:850}));
    assert.equal(a.isWon(),true);
});
