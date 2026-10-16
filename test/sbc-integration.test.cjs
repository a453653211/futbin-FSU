const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const FsuSbcSolver = require('../src/sbc-solver.js');
const source = fs.readFileSync(require('node:path').join(__dirname,'../src/sbc-integration.js'),'utf8');
const K = { PLAYER_MIN_OVR: 1, PLAYER_MAX_OVR: 2 };
const S = { GREATER: 1, LOWER: 2, EXACT: 0 };
const player = (id,rating,extras={}) => ({id,databaseId:id,definitionId:id,rating,rareflag:0,tradable:true,leagueId:13,
    isPlayer:()=>true,isLimitedUse:()=>false,isEnrolledInAcademy:()=>false,...extras});
function fixture(options={}) {
    const ps = options.players || [player(1,78),player(2,79),player(3,80)];
    const req = {keys:()=>[1],getValue:()=>[78],count:2,scope:1,buildString:()=>'>=78, >=2'};
    let items = Array.from({length:23},()=>({id:0,definitionId:0}));
    if(options.fixed) items[0] = options.fixed;
    const initial = items.slice(), messages=[], calls={save:0,club:[],storage:[],loader:0,unobserve:0,filters:[],popups:[]};
    const squad = {getPlayers:()=>items.map(item=>({getItem:()=>item})),
        getSlot:i=>({isBrick:()=>i>=2}),setPlayers:ps=>{items=ps.slice();}};
    const challenge={squad,eligibilityOperation:0,eligibilityRequirements:[req],onDataChange:{notify:()=>{}}};
    const controller={_challenge:challenge};
    const root={isConnected:true};
    const button={setInteractionState:v=>{calls.enabled=v;},getRootElement:()=>root,setText:t=>{calls.text=t;}};
    const observable = result => ({unobserve:()=>{calls.unobserve++;},observe(owner,cb){cb(this,result);}});
    const info={run:{},base:{},set:{goldenrange:82},build:{}};
    const events={ignorePlayerToCriteria:c=>({...c,NEleagueId:[13,16,19,31,53],tradable:false,removeSquad:true,rareflag:[0,1]}),
        getItemBy:(type,criteria,insert,snapshot)=>{
            calls.filters.push({...criteria});
            return (snapshot || (options.staleCache ? [] : ps)).filter(p=>{
                if(p.loan || p.evolution || p.concept) return false;
                if(criteria.lock===false && p.locked) return false;
                if(criteria.removeSquad && p.mainSquad) return false;
                if(criteria.LTrating!==undefined && p.rating>criteria.LTrating) return false;
                if(criteria.NEleagueId?.includes(p.leagueId)) return false;
                if(criteria.tradable!==undefined && p.tradable!==criteria.tradable) return false;
                if(criteria.rareflag && !criteria.rareflag.includes(p.rareflag)) return false;
                return true;
            });
        },popup:(...args)=>calls.popups.push(args),showLoader:()=>calls.loader++,hideLoader:()=>calls.loader--,
        saveOldSquad:()=>{},createVirtualChallenge:()=>({squad:{setPlayers:()=>{}},meetsRequirements:()=>options.valid!==false})};
    let persona={id:1,sku:'pc'};
    const services={
        User:{getUser:()=>({getSelectedPersona:()=>persona})},
        Squad:options.noSquad ? {} : {
            requestSquadList:()=>observable({success:true,data:{activeSquadId:1}}),
            requestSquadById:()=>observable({success:true,data:{squad:{getPlayers:()=>[]}}})},
        Notification:{queue:m=>messages.push(m)},
        Club:{getStats:()=>observable({success:true,response:{stats:[{type:'players',count:ps.length}]}}),
            search:c=>{calls.club.push(c.offset);if(options.navigate) root.isConnected=false;
                return observable({success:!options.loadFailure,response:{items:ps.slice(c.offset,c.offset+2)}});}},
        Item:{searchStorageItems:c=>{calls.storage.push(c.offset);return observable({success:true,
            response:{items:c.offset===0?(options.storagePlayers || (options.storagePages?[player(10,79)]:[])):[],endOfList:options.storagePages?c.offset>0:true}});}},
        SBC:{saveChallenge:()=>{calls.save++;return observable({success:!options.saveFailure,status:500});},
            submitChallenge:()=>{throw new Error('must never submit');}}
    };
    vm.runInNewContext(source,{events,info,services,FsuSbcSolver,SBCEligibilityKey:K,SBCEligibilityScope:S,
        SBCEligibilityOperation:{AND:0,OR:1},UINotificationType:{POSITIVE:1,NEGATIVE:2},
        ItemPile:{STORAGE:9},UTSearchCriteriaDTO:class {},repositories:{Item:{getUnassignedItems:()=>[]}},
        GM_getValue:()=>options.legacyFilters===true,enums:{UIDialogOptions:{OK:2}},
        setTimeout,clearTimeout,console:{warn:()=>{}}});
    return {events,info,controller,button,calls,messages,initial,squad,challenge, switchAccount:()=>{persona={id:2,sku:'pc'};}};
}
const fill = f => f.events.smartSbcFill(f.controller,f.button);

test('missing active-squad interface fails closed before saving',async()=>{
    const f=fixture({noSquad:true});await fill(f);assert.equal(f.calls.save,0);assert.match(f.messages.at(-1)[0],/主力阵容/);
});
test('account switching during inventory load cancels without saving',async()=>{
    const f=fixture();const original=f.events.smartSbcInventory;
    f.events.smartSbcInventory=async(...args)=>{const result=await original(...args);f.switchAccount();return result;};
    await fill(f);assert.equal(f.calls.save,0);assert.match(f.messages.at(-1)[0],/账号/);
});
test('upstream automatic SBC job blocks smart fill before inventory reads',async()=>{
    const f=fixture();f.info.autoSbc={running:true};await fill(f);assert.equal(f.calls.save,0);assert.equal(f.calls.club.length,0);
});
test('integration saves a validated lineup once and never submits',async()=>{
    const f=fixture();await fill(f);
    assert.equal(f.calls.save,1);
    assert.deepEqual(f.squad.getPlayers().slice(0,2).map(s=>s.getItem().rating),[78,79]);
    assert.equal(f.calls.loader,0);assert.equal(f.calls.enabled,true);assert.equal(f.info.run.smartSbc,false);
    assert.match(f.messages.at(-1)[0],/手动提交/);
});
test('club pagination advances by actual returned page size; storage loads every page',async()=>{
    const f=fixture({storagePages:true});await fill(f);
    assert.deepEqual(f.calls.club,[0,2]);assert.deepEqual(f.calls.storage,[0,1]);
});
test('save failure restores all original slots and clears busy state',async()=>{
    const f=fixture({saveFailure:true});await fill(f);
    assert.equal(f.calls.save,1);assert.deepEqual(f.squad.getPlayers().map(s=>s.getItem()),f.initial);
    assert.equal(f.info.base.savesquad,false);assert.equal(f.calls.loader,0);
});
test('native validation failure never changes the real squad or saves',async()=>{
    const f=fixture({valid:false});await fill(f);assert.equal(f.calls.save,0);
    assert.deepEqual(f.squad.getPlayers().map(s=>s.getItem()),f.initial);
    assert.match(f.messages.at(-1)[0],/完整条件校验未通过/);
});
test('navigation while loading cancels without saving',async()=>{
    const f=fixture({navigate:true});await fill(f);assert.equal(f.calls.save,0);
    assert.match(f.messages.at(-1)[0],/取消/);
});
test('inventory failure never runs save',async()=>{
    const f=fixture({loadFailure:true});await fill(f);assert.equal(f.calls.save,0);
    assert.match(f.messages.at(-1)[0],/EA 请求失败/);
});
test('no solution keeps existing squad and explains exclusions',async()=>{
    const f=fixture({players:[player(1,70)]});await fill(f);assert.equal(f.calls.save,0);
    assert.deepEqual(f.squad.getPlayers().map(s=>s.getItem()),f.initial);
    assert.match(f.calls.popups.at(-1)[0],/未找到合格阵容/);
});
test('existing players are preserved in their original positions',async()=>{
    const fixed=player(3,80);const f=fixture({fixed});await fill(f);
    assert.equal(f.squad.getPlayers()[0].getItem(),fixed);assert.equal(f.calls.save,1);
});
test('double-click/concurrent FSU save guard prevents duplicate requests',async()=>{
    const f=fixture();f.info.run.smartSbc=true;await fill(f);assert.equal(f.calls.club.length,0);
    f.info.run.smartSbc=false;f.info.base.savesquad=true;await fill(f);assert.equal(f.calls.save,0);
});
test('default scope includes tradable major-league cards excluded by FSU defaults',async()=>{
    const f=fixture();await fill(f);assert.equal(f.calls.save,1);
    assert.equal(f.calls.filters.some(c=>c.tradable===false || c.NEleagueId),false);
});
test('legacy scope remains available and explains exactly what was excluded',async()=>{
    const f=fixture({legacyFilters:true});await fill(f);assert.equal(f.calls.save,0);
    assert.match(f.calls.popups[0][1],/FSU 联赛排除：排除 3 张/);
});
test('uses freshly loaded inventory even if repository cache is empty',async()=>{
    const f=fixture({staleCache:true});await fill(f);assert.equal(f.calls.save,1);
});
test('storage-only eligible players are included in the actual candidate pool',async()=>{
    const f=fixture({players:[],storagePlayers:[player(10,78),player(11,79)],staleCache:true});
    await fill(f);assert.equal(f.calls.save,1);
    assert.deepEqual(f.squad.getPlayers().slice(0,2).map(s=>s.getItem().id),[10,11]);
});
test('new scope still excludes locked, main squad, special, loan, evolution and high-rated cards',async()=>{
    const f=fixture({players:[player(1,78,{locked:true}),player(2,78,{mainSquad:true}),player(3,78,{rareflag:3}),
        player(4,78,{loan:true}),player(5,78,{evolution:true}),player(6,90)]});
    await fill(f);assert.equal(f.calls.save,0);
    assert.match(f.calls.popups[0][1],/锁定球员：排除 1 张/);
    assert.match(f.calls.popups[0][1],/主力阵容：排除 1 张/);
    assert.match(f.calls.popups[0][1],/能力值高于 82：排除 1 张/);
});
test('low rated tradable card beats a higher rated untradable card',async()=>{
    const f=fixture({players:[player(1,80,{tradable:false}),player(2,78),player(3,79)]});
    await fill(f);assert.deepEqual(f.squad.getPlayers().slice(0,2).map(s=>s.getItem().rating),[78,79]);
});
