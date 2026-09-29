const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const file=path.join(__dirname,'../src/market-catalog.js');
test('catalog validates complete snapshots and rejects partial, wrong season/platform and ambiguous versions',()=>{
    assert.ok(fs.existsSync(file),'catalog validator must exist');
    const C=require(file),now=1000000,scope='27:12:FFA27PCC:pc';
    const row={defId:1,futbinId:2,rating:87,position:25,gk:0,player:true,gold:true,special:false,name:'Test',
        value:40000,source:'https://www.futbin.com/27/player/2/test',sourceAt:now};
    const snapshot={version:1,scope,year:27,platform:'pc',complete:true,total:1,pages:1,fetchedAt:now,
        source:'https://www.futbin.com/players',rows:[row]};
    assert.ok(C.valid(snapshot,scope,now,3600000));
    for(const patch of [{complete:false},{year:26},{platform:'ps'},{total:2},{scope:'other'},
        {fetchedAt:now+1},{rows:[{...row,sourceAt:null}]},{rows:[{...row,sourceAt:now-7200001}]},
        {rows:[{...row,defId:0}]},{rows:[{...row,special:true}]},{rows:[{...row,position:0}]},
        {rows:[{...row,source:'https://www.futbin.com/26/player/2/test'}]},
        {total:2,rows:[row,row]}])assert.equal(C.valid({...snapshot,...patch},scope,now,3600000),false,JSON.stringify(patch));
    assert.equal(C.valid(snapshot,scope,now+3600000,3600000),false);
});
test('catalog builder commits only after consistent, exhaustive pagination',()=>{
    assert.ok(fs.existsSync(file));const C=require(file),scope='27:12:FFA27PCC:pc',now=1000000;
    const row=id=>({defId:id,futbinId:id,rating:87,position:25,gk:0,player:true,gold:true,special:false,name:'Test',
        value:40000,source:`https://www.futbin.com/27/player/${id}/test`,sourceAt:now});
    const page=(n,ids)=>({page:n,pages:2,total:2,year:27,platform:'pc',at:now,source:'https://www.futbin.com/players',items:ids.map(row)});
    const b=new C.Builder(scope);assert.equal(b.add(page(1,[1]),now),null);
    assert.ok(b.add(page(2,[2]),now).complete);
    const bad=new C.Builder(scope);bad.add(page(1,[1]),now);
    assert.throws(()=>bad.add(page(2,[1]),now),/重复|完整|分页/);
    const drift=new C.Builder(scope);drift.add(page(1,[1]),now);
    assert.throws(()=>drift.add({...page(2,[2]),total:3},now),/分页/);
});
