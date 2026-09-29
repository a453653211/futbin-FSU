const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const FsuAutoBid = require('../src/auto-bid-core.js');
const FsuMarketCatalog = require('../src/market-catalog.js');
const source=fs.readFileSync(path.join(__dirname,'../src/auto-bid-integration.js'),'utf8');
// Use EA's real getter so the fixture cannot silently turn selectedPersona (an ID)
// into a persona object again. The getter is local-only and does not make requests.
const ea=fs.readFileSync(path.join(__dirname,'../.reference/ocompiled.decoded.js'),'utf8');
const getterStart=ea.indexOf('prototype.getSelectedPersona=')+'prototype.getSelectedPersona='.length;
const getterEnd=ea.indexOf(',_0x591ab9.prototype.getCurrentPersonaGen4Console=',getterStart);
assert.ok(getterStart>0 && getterEnd>getterStart,'EA persona getter source available');
const getSelectedPersona=vm.runInNewContext('('+ea.slice(getterStart,getterEnd)+')',{_0x4abae4:()=>{}});
const conceptStart=ea.indexOf('_0x50f626.prototype.searchConceptItems=')+'_0x50f626.prototype.searchConceptItems='.length;
const conceptEnd=ea.indexOf(',_0x50f626.prototype.searchTransferMarket=',conceptStart);
assert.ok(conceptStart>0 && conceptEnd>conceptStart,'EA concept DAO source available');
function setup() {
    const calls=[], storage=new Map();let response={success:true,response:{items:[],endOfList:true}};
    const observable=value=>({unobserve:()=>calls.push('unobserve'),observe(owner,fn){fn(this,value);}});
    function Hub() {} Hub.prototype.init=function(){};
    const user={tradeAccess:1,selectedPersona:12,_personas:new Map([[12,{id:12,sku:'pc27'}]]),
        getSelectedPersona,getCurrency:()=>({amount:5000})};
    const ctx={console,Date,Map,Set,Promise,Error,Number,setTimeout,clearTimeout,FsuAutoBid,FsuMarketCatalog,
        UTTransfersHubView:Hub,UTSearchCriteriaDTO:class {},
        SearchType:{PLAYER:'player'},SearchCategory:{ANY:'any'},SearchLevel:{GOLD:'gold'},PlayerPosition:{GK:0},
        GameCurrency:{COINS:'coins'},GameSku:{PC:'pc27'},TradeAccessLevel:{ALLOWED:1},ItemPile:{INBOX:8},APP_YEAR_SHORT:27,ZONE_NO_GK_VALUE:9,
        UtasErrorCode:{CAPTCHA_REQUIRED:458,PERMISSION_DENIED:461},
        AuthenticationState:{UNAUTHENTICATED:0,AUTHENTICATING:1,AUTHENTICATED:2},
        UTCurrencyInputControl:{PRICE_TIERS:[{min:1000,inc:100},{min:150,inc:50}],getIncrementAboveVal:n=>n+50},
        GM_setValue:(k,v)=>storage.set(k,v),GM_getValue:(k,d)=>storage.get(k)||d,
        info:{base:{year:27,platform:'pc'},futbinId:{},roster:{data:{}}},
        events:{getCachePrice:id=>({num:ctx.info.roster.data[id]?.n||0})},
        futbinId:{setPrice:(data,id)=>{ctx.info.roster.data[id]={n:data.price};},
            getId:async p=>{calls.push('price-id');ctx.futbinId.setPrice({price:10000},p.definitionId);},
            getPrice:async id=>{calls.push('price');ctx.futbinId.setPrice({price:12000},id);}},
        repositories:{Item:{setDirty:p=>calls.push(['dirty',p])}},
        services:{Authentication:{utasSession:{id:'sid',state:2,isAuthenticated(){return this.state===2;}}},User:{getUser:()=>user,
            requestCurrencies:()=>{calls.push('currencies');return observable({success:true});}},
            Item:{searchConceptItems:c=>{calls.push(['concept',c]);return observable(response);},
                searchTransferMarket:(c,p)=>{calls.push(['search',c,p]);return observable(response);},
                clearTransferMarketCache:()=>calls.push('clear'),
                requestWatchedItems:()=>{calls.push('watch');return observable(response);},
                refreshAuctions:()=>{throw Error('would fire an unthrottled currency read');},
                transfersDao:{getAuctionData:items=>{calls.push(['refresh',items]);return observable(response);}},
                itemDao:{searchTransferMarket:c=>{calls.push(['search',c]);return observable(response);}},
                bid:(item,amount)=>{calls.push(['bid',item,amount]);return observable(response);}}}};
    vm.createContext(ctx);vm.runInContext(source,ctx);
    const adapter=ctx.events.autoBidAdapter();
    return {ctx,adapter,calls,storage,user,setResponse:v=>{response=v;}};
}
test('logged-in EA user has a numeric selectedPersona; startup resolves its persona through the native getter',async()=>{
    const f=setup();assert.equal(typeof f.user.selectedPersona,'number');
    assert.equal(f.user.getSelectedPersona().id,12);
    assert.equal(f.adapter.scope(),'27:12:pc27:pc');
    const runner=new FsuAutoBid.Runner(f.adapter);
    assert.equal(runner.start(f.adapter.load()),true);
    await runner.tick();assert.equal(f.calls.includes('currencies'),true);
});
test('account scopes use the selected persona and remain distinct when switching accounts or platforms',()=>{
    const f=setup();f.user._personas.set(34,{id:34,sku:'ps27'});
    const original=f.adapter.scope();f.adapter.save({version:1,scope:original,pending:[{tradeId:'42'}]});
    f.user.selectedPersona=34;f.ctx.info.base.platform='ps';
    assert.equal(f.adapter.scope(),'27:34:ps27:ps');assert.equal(f.adapter.load().version,undefined);
    f.adapter.save({version:1,scope:original,pending:[{tradeId:'42'}]});
    assert.equal(f.adapter.load().version,undefined);
});
test('missing user or missing selected persona still blocks startup without any network request',()=>{
    const f=setup();f.user._personas.clear();
    assert.throws(()=>f.adapter.scope(),/账号信息尚未就绪/);
    f.ctx.services.User.getUser=()=>null;
    assert.throws(()=>f.adapter.scope(),/账号信息尚未就绪/);
    assert.equal(f.calls.length,0);
});

test('adapter distinguishes authenticated SID rotation, reauthentication, and an expired session',()=>{
    const f=setup(),s=f.ctx.services.Authentication.utasSession;
    assert.equal(f.adapter.session(),'sid');s.id='renewed';assert.equal(f.adapter.session(),'renewed');
    s.state=1;assert.equal(f.adapter.session(),null);
    s.state=0;assert.throws(()=>f.adapter.session(),e=>e.fatal&&/登录会话已失效/.test(e.message));
    s.state=2;s.id='';assert.throws(()=>f.adapter.session(),e=>e.fatal);
    f.ctx.services.Authentication.utasSession=null;assert.throws(()=>f.adapter.session(),e=>e.fatal);
    assert.equal(f.calls.length,0);
});

test('EA native HTTP headers read the current SID for every send instead of caching it',()=>{
    const from=ea.indexOf('_0x377755.prototype._setDefaultHeaders=')+'_0x377755.prototype._setDefaultHeaders='.length;
    const to=ea.indexOf(',_0x377755.prototype.send=',from);assert.ok(from>0&&to>from);
    const applyHeaders=vm.runInNewContext('('+ea.slice(from,to)+')',{
        _0x529c2b:()=>{},_0x322716:{prototype:{_setDefaultHeaders(){}}}});
    const headers=[],s={id:'old-test-sid'},request={authDelegate:{getUtasSession:()=>s},
        http:{setRequestHeader:(k,v)=>headers.push([k,v])}};
    applyHeaders.call(request);s.id='new-test-sid';applyHeaders.call(request);
    assert.deepEqual(headers,[['X-UT-SID','old-test-sid'],['X-UT-SID','new-test-sid']]);
});
test('native bid search uses exact card ID and maxBid, with explicit pagination',async()=>{
    const f=setup();await f.adapter.search({defId:101},750,'bid',2);
    const call=f.calls.find(x=>x[0]==='search');assert.equal(call[1].maxBid,750);
    assert.equal(call[1].maxBuy,undefined);assert.deepEqual([...call[1].defId],[101]);
    assert.equal(call[1].offset,20);assert.equal(call[1].count,20);
});
test('buy search sets maxBuy without a bid or expiry filter; canBuy and bid submit the exact BIN',async()=>{
    const f=setup();await f.adapter.search({defId:101},23750,'buy',3);
    const c=f.calls.find(x=>x[0]==='search')[1];
    assert.equal(c.maxBuy,23750);assert.equal(c.maxBid,undefined);assert.equal(c.offset,40);
    assert.equal(c.maxSeconds,undefined);
    const item={getAuctionData:()=>({canBuy:n=>n>=23750})};
    assert.equal(f.adapter.canBuy(item,23750),true);assert.equal(f.adapter.canBuy(item,1000),false);
    await f.adapter.buy(item,23750);assert.equal(f.calls.find(x=>x[0]==='bid')[2],23750);
});
test('FSU recent-search values reconstruct the native criteria and keep every filter',async()=>{
    const f=setup();
    f.ctx.UTSearchCriteriaDTO=class {constructor(){Object.assign(this,{_type:'player',maskedDefId:0,defId:[],
        minBuy:0,maxBuy:0,minBid:0,maxBid:0,league:-1,nation:-1,count:20,offset:0});}
        get type(){return this._type;}};
    f.ctx.repositories.Item.getStaticDataByDefId=()=>({name:'Selected player'});
    const criteria=new f.ctx.UTSearchCriteriaDTO();
    Object.assign(criteria,{maskedDefId:42,minBuy:500,maxBuy:10000,maxBid:2000,league:13,nation:14});
    f.ctx.info.market={mb:[Object.values(criteria)],ts:1};
    const row=f.ctx.events.autoBidRecentSearches()[0];
    assert.equal(row.maskedDefId,42);assert.equal(row.name,'Selected player');
    await f.adapter.search(row,9700,'buy',2);
    const sent=f.calls.find(x=>x[0]==='search')[1];
    assert.equal(sent.maskedDefId,42);assert.equal(sent.league,13);assert.equal(sent.nation,14);
    assert.equal(sent.minBuy,500);assert.equal(sent.maxBid,2000);assert.equal(sent.maxBuy,9700);
    assert.equal(sent.offset,20);assert.equal(sent.count,20);
    assert.deepEqual([...sent.defId],[]);
    assert.equal(row.criteria.maxBuy,10000);
});
test('recent search without a BIN limit or matching DTO layout is disabled',()=>{
    const f=setup();
    f.ctx.UTSearchCriteriaDTO=class {constructor(){Object.assign(this,{_type:'player',maskedDefId:42,defId:[],maxBuy:0});}
        get type(){return this._type;}};
    f.ctx.info.market={mb:[Object.values(new f.ctx.UTSearchCriteriaDTO()),[42]],ts:1};
    assert.deepEqual(f.ctx.events.autoBidRecentSearches(),[null,null]);
});
test('a saved masked player ID with revision bits is normalized for local card checks',()=>{
    const f=setup();
    f.ctx.UTSearchCriteriaDTO=class {constructor(){Object.assign(this,{_type:'any',maskedDefId:0,defId:[],maxBuy:0});}
        get type(){return this._type;}};
    f.ctx.repositories.Item.getStaticDataByDefId=()=>({name:'Revised player'});
    const c=new f.ctx.UTSearchCriteriaDTO();c.maskedDefId=0x100002a;c.maxBuy=10000;
    f.ctx.info.market={mb:[Object.values(c)],ts:1};
    const row=f.ctx.events.autoBidRecentSearches()[0];
    assert.equal(row.maskedDefId,42);
    assert.equal(row.criteria.maskedDefId,0x100002a);
});
test('PC platform must agree with selected persona SKU and current FC27 season',()=>{
    const f=setup();f.adapter.check();f.ctx.info.base.platform='ps';assert.throws(()=>f.adapter.check(),/PC/);
    f.ctx.info.base.platform='pc';f.user.getSelectedPersona().sku='ps27';assert.throws(()=>f.adapter.check(),/PC/);
    f.user.getSelectedPersona().sku='pc27';f.ctx.info.base.year=26;assert.throws(()=>f.adapter.check(),/赛季/);
});
test('candidate list requests gold quality and pagination; position/rating filtering stays local',async()=>{
    const f=setup();await f.adapter.discover(200);const c=f.calls[0][1];
    assert.equal(c.level,'gold');assert.equal(c.zone,undefined);assert.equal(c.offset,200);assert.equal(c.count,200);
    assert.equal(c.rarities,undefined);assert.equal(c.ovrMin,undefined);
});

test('EA concept DAO sends type=player; FC27 rejects playernonGK with HTTP 400',async()=>{
    const f=setup();const requests=[];
    // Defaults consumed by the real serializer; the production DTO supplies these.
    f.ctx.UTSearchCriteriaDTO=class {constructor(){Object.assign(this,{sort:'desc',zone:-1,
        position:'any',defId:[],rarities:[],club:-1,league:-1,nation:-1,playStyle:-1});}};
    const dto=defId=>({definitionId:defId,rating:87,preferredPosition:defId===1?0:18,
        isPlayer:()=>true,isGoldRating:()=>true,isSpecial:()=>false});
    const context={_0x46c0b3:()=>{},SearchType:{PLAYER:'player',ANY:'any'},SearchLevel:{GOLD:'gold',ANY:'any'},
        ZONE_DEFENDER_VALUE:130,ZONE_MIDFIELDER_VALUE:131,ZONE_ATTACKER_VALUE:132,ZONE_NO_GK_VALUE:9,
        GAME_NAME:'fc27',DebugUtils:{Assert:assert.ok},
        EAObservable:class {notify(value){this.value=value;}observe(owner,fn){fn(this,this.value);}unobserve(){}},
        UTHttpRequest:class {setPath(p){this.path=p;}setUrlVariables(q){this.query=q;}},UTHttpResponseDTO:class {},
        JSUtils:{assignPropertyValues:Object.assign,isObject:v=>typeof v==='object'},
        factories:{Item:{generateItemsFromItemData:v=>v}},
        services:{UTUtasRequestQueue:{send(req){requests.push(req);return {
            observe(owner,fn){const ok=req.query.type==='player';fn({unobserve(){}},
                {success:ok,status:ok?200:400,error:ok?null:{code:400},response:{itemData:[dto(1),dto(2)]}});}};}}}};
    // EA's assignPropertyValues has (source, destination) argument order.
    context.JSUtils.assignPropertyValues=(source,target)=>Object.assign(target,source);
    const search=vm.runInNewContext('('+ea.slice(conceptStart,conceptEnd)+')',context);
    f.ctx.services.Item.searchConceptItems=c=>search.call({},c);
    const page=await f.adapter.discover(200);
    assert.equal(requests[0].path,'/ut/game/fc27/defid');
    assert.deepEqual({...requests[0].query},{count:200,sort:'desc',start:200,type:'player',level:'gold'});
    assert.equal(page.end,true);
    assert.deepEqual(page.items.filter(p=>FsuAutoBid.eligible(f.adapter.player(p))).map(p=>p.definitionId),[2]);
});
test('market catalog never adopts legacy un-timestamped FSU price cache',()=>{
    const f=setup();f.ctx.info.roster.data[101]={n:999999};
    assert.equal(f.adapter.loadCatalog(),null);assert.equal(f.adapter.price,undefined);
});
test('catalog snapshots are stored atomically in the selected account scope',()=>{
    const f=setup(),snapshot={version:1,scope:f.adapter.scope(),rows:[{defId:101,value:40000}]};
    f.adapter.saveCatalog(snapshot);assert.deepEqual(JSON.parse(JSON.stringify(f.adapter.loadCatalog())),snapshot);
    f.user._personas.set(34,{id:34,sku:'pc27'});f.user.selectedPersona=34;
    assert.equal(f.adapter.loadCatalog(),null);
});
test('gallery catalog and owned IDs use separate account-scoped storage',()=>{
    const f=setup(),scope=f.adapter.scope();
    const snapshot={version:2,kind:'gallery',scope,rows:[{defId:101,leagueId:2216,value:1200}]};
    f.adapter.saveCatalog(snapshot);
    assert.deepEqual(JSON.parse(JSON.stringify(f.adapter.loadCatalog('gallery'))),snapshot);
    assert.equal(f.adapter.loadCatalog(),null);
    const owned={version:1,scope,rows:[{defId:101,name:'Test',source:'manual',at:1000,tradeId:''}]};
    f.adapter.saveOwned(owned);
    assert.deepEqual(JSON.parse(JSON.stringify(f.adapter.loadOwned())),owned);
    f.user._personas.set(34,{id:34,sku:'pc27'});f.user.selectedPersona=34;
    assert.equal(f.adapter.loadCatalog('gallery'),null);
    assert.deepEqual(JSON.parse(JSON.stringify(f.adapter.loadOwned().rows)),[]);
});
test('refresh reuses DAO/parser, updates the item, and does not start an implicit currency request',async()=>{
    const f=setup();let updated=false;const a={tradeId:'42',update:()=>{updated=true;},isWon:()=>true};
    const item={getAuctionData:()=>a};
    f.setResponse({success:true,response:{items:[{id:23,duplicateId:0,getAuctionData:()=>({tradeId:'42'})}]}});
    const ids=await f.adapter.refresh([item]);assert.deepEqual([...ids],['42']);assert.ok(updated);assert.equal(item.pile,8);
    assert.equal(f.calls.includes('currencies'),false);
});
test('watch list bypasses cached data and persistent records are account/platform/year scoped',async()=>{
    const f=setup();await f.adapter.watched();assert.deepEqual(f.calls[0],['dirty',8]);
    f.adapter.save({version:1,scope:f.adapter.scope()});assert.equal(f.adapter.load().version,1);
    assert.equal([...f.storage.keys()][0],'fsuMarket.v2.27:12:pc27:pc');
});
test('permission/captcha errors fail closed; observers are removed on success and failure',async()=>{
    const f=setup();f.setResponse({success:false,error:{code:458}});
    await assert.rejects(f.adapter.currencies().then(()=>f.adapter.search({defId:1},750,'bid')),e=>e.fatal===true);
    assert.ok(f.calls.includes('unobserve'));
});
test('observable timeout poisons the session to prevent overlapping late requests after resume',async()=>{
    const f=setup();let unobserved=false;
    await assert.rejects(f.ctx.events.autoBidObserve(()=>({observe:()=>{},unobserve:()=>{unobserved=true;}}),1),e=>e.uncertain);
    assert.ok(unobserved);assert.throws(()=>f.adapter.check(),/刷新网页/);
});
