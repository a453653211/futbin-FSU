const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const complex=require('../src/sbc-complex'),procurement=require('../src/sbc-procurement');
function fixture(options={}){
    let now=10000;const calls={saved:[],reads:[],buys:0},nodes=[];
    class Element{
        constructor(tag){this.tag=tag;this.children=[];this.style={};this.isConnected=true;nodes.push(this);}
        append(n){this.children.push(n);}after(n){this.next=n;}replaceChildren(){this.children=[];}remove(){this.isConnected=false;}
    }
    const item=(id=0)=>({id,definitionId:id,databaseId:id,rating:id?80:0,rareflag:0,possiblePositions:[14],teamId:1,leagueId:1,nationId:1,owners:1,
        getTier:()=>3,getStaticData:()=>({name:`Player ${id}`}),isPlayer:()=>!!id,isLimitedUse:()=>false,isEnrolledInAcademy:()=>false});
    const inventory=Array.from({length:5},(_,i)=>item(i+1));
    function squad(initial=[]){let items=Array.from({length:23},(_,i)=>initial[i]||item());
        const slot=i=>({index:i,getItem:()=>items[i],isBrick:()=>i>=2,getGeneralPosition:()=>14});
        return {getPlayers:()=>items.map((_,i)=>slot(i)),getFieldPlayers:()=>items.slice(0,11).map((_,i)=>slot(i)),getFormation:()=>({name:'test'}),
            setPlayers:p=>{items=p.slice();},getRating:()=>80,getChemistry:()=>0,chemCalculator:{calculate:()=>({chemistry:0,slots:Array.from({length:11},()=>({points:0}))})}};
    }
    const req={keys:()=>[1],getValue:()=>[78],count:2,scope:0,buildString:()=>'>=78'};
    const challenge=id=>({id,setId:7,name:`Challenge ${id}`,status:'NOT_STARTED',eligibilityOperation:'AND',eligibilityRequirements:[req],squad:squad(),isInProgress:()=>false,
        meetsRequirements(){return this.squad.getPlayers().slice(0,2).every(s=>s.getItem().id);},onDataChange:{notify:()=>{}}});
    const challenges=[challenge(25),challenge(26)],server=new Map(challenges.map(c=>[c.id,squad()]));
    const observable=result=>({observe(owner,cb){cb(this,result);},unobserve(){}});
    const response=data=>observable({success:true,...data});
    const services={Authentication:{},Configuration:{checkFeatureEnabled:()=>true},
        Squad:{requestSquadList:()=>response({data:{activeSquadId:9}}),requestSquadById:()=>response({data:{squad:squad([inventory[4]])}})},
        Club:{getStats:()=>response({response:{stats:[{type:'players',count:inventory.length}]}}),search:()=>response({response:{items:inventory,retrievedAll:true}})},
        Item:{searchStorageItems:()=>response({response:{items:[],endOfList:true}})},
        SBC:{requestSets:()=>response({data:{sets:[{id:7}]}}),requestChallengesForSet:()=>response({data:{challenges}}),loadChallenge:()=>response({data:{}}),
            sbcDAO:{loadChallenge:id=>{calls.reads.push(id);return response({response:{squad:server.get(id)}});}},
            saveChallenge:c=>{calls.saved.push(c.id);if(options.failSecond&&calls.saved.length===2)return observable({success:false,status:500});
                server.set(c.id,squad(c.squad.getPlayers().map(s=>s.getItem())));return response({});},
            submitChallenge:()=>{throw new Error('Must never submit');}}};
    const info={run:{},base:{},set:{goldenrange:83},build:{},lock:[]};
    const adapter={scope:()=> '27:user:pc',session:()=>true,check:()=>{},load:()=>null};
    const events={smartSbcMarketAdapter:()=>adapter,smartSbcMarketObserve:create=>new Promise((resolve,reject)=>create().observe({},(_,r)=>r.success?resolve(r):reject(new Error('save failed')))),
        ignorePlayerToCriteria:()=>({rareflag:[0,1],removeSquad:true}),getItemBy:(_,criteria,__,items)=>items,
        createVirtualChallenge:c=>({...challenge(888),eligibilityRequirements:c.eligibilityRequirements,squad:squad(c.squad.getPlayers().map(s=>s.getItem()))})};
    const document={createElement:tag=>new Element(tag)},button={getRootElement:()=>root},root=new Element('button'),controller={_challenge:challenges[0]};
    const env={events,info,services,document,console:{warn:()=>{}},GM_getValue:(_,def)=>def,GM_setValue:()=>{},
        FsuSbcComplex:complex,FsuSbcProcurement:procurement,SBCEligibilityOperation:{AND:'AND'},SBCEligibilityScope:{0:'GREATER'},SBCEligibilityKey:{1:'PLAYER_MIN_OVR'},
        SBCChallengeStatus:{COMPLETED:'COMPLETED'},UTServerSettingsRepository:{KEY:{}},UTNullItemEntity:class{},UTItemEntity:class{},UTSearchCriteriaDTO:class{},
        repositories:{TeamConfig:{getLinkedTeam:x=>x}},Date:{now:()=>now},setTimeout:(fn,ms)=>{now+=ms;queueMicrotask(fn);},clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},navigator:{}};
    for(const file of ['sbc-integration.js','sbc-group-integration.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),env);
    const start=()=>events.smartSbcGroup(controller,button),find=text=>nodes.find(n=>n.textContent===text);
    return {start,find,nodes,calls,info,server,challenges,inventory};
}
test('group UI plans two challenges, protects active squad, saves and independently reads each result',async()=>{
    const f=fixture();await f.start();const save=f.find('保存整组阵容');assert.equal(save.disabled,false);
    await save.onclick();assert.deepEqual(f.calls.saved,[25,26]);assert.equal(f.calls.reads.length,4);
    const ids=[...f.server.values()].flatMap(s=>s.getPlayers().slice(0,2).map(s=>s.getItem().id));
    assert.equal(new Set(ids).size,4);assert.ok(!ids.includes(5));assert.equal(f.calls.buys,0);
    assert.ok(f.nodes.some(n=>/已保存并从服务器复核 2 关/.test(n.textContent)));
    f.find('停止 / 关闭').onclick();assert.equal(f.info.run.smartSbc,false);
});
test('settings change cancels group save before mutation',async()=>{
    const f=fixture();await f.start();f.info.set.goldenrange=82;await f.find('保存整组阵容').onclick();assert.deepEqual(f.calls.saved,[]);
    assert.ok(f.nodes.some(n=>/设置已改变/.test(n.textContent)));
});
test('server squad change cancels group save even when local view did not update',async()=>{
    const f=fixture();await f.start();f.server.get(25).setPlayers(f.challenges[0].squad.getPlayers().map((s,i)=>i===0?f.inventory[0]:s.getItem()));
    await f.find('保存整组阵容').onclick();assert.deepEqual(f.calls.saved,[]);
    assert.ok(f.nodes.some(n=>/服务器上的阵容已变化/.test(n.textContent)));
});
test('partial save failure reports completed count and never submits or retries automatically',async()=>{
    const f=fixture({failSecond:true});await f.start();await f.find('保存整组阵容').onclick();assert.deepEqual(f.calls.saved,[25,26]);
    assert.ok(f.nodes.some(n=>/已保存 1 关/.test(n.textContent)));
    assert.equal(f.challenges[1].squad.getPlayers()[0].getItem().id,0);
});
