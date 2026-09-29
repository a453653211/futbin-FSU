const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const file=require('node:path').join(__dirname,'../src/futbin-catalog-source.js');
const raw=id=>({ID:id,resource_id:100000+id,playerid:100000+id,rating:87,position:'CM',raretype:0,
    cardImage:'https://cdn3.futbin.com/content/fifa27/img/cards/hd/0_gold.png',specialPlayerImage:null,
    common_name:'Test '+id,pc_LCPrice:1,pc_MinPrice:700,pc_MaxPrice:100000});
const now=1789867200000;
test('FUTBIN source exhausts gold directory and prices ALL non-GK rows in exact batches <=10 before filtering',async()=>{
    assert.ok(fs.existsSync(file),'verified FUTBIN source implementation exists');
    const {Refresh}=require(file),calls=[],directory=Array.from({length:12},(_,i)=>raw(i+1));
    directory[11].position='GK';
    const job=new Refresh(async url=>{
        calls.push(url);const u=new URL(url);assert.equal(u.searchParams.get('platform'),'PC');
        if(url.includes('getFilteredPlayers'))return {at:now,httpAt:now,body:{errorcode:'200',data:u.searchParams.get('page')==='1'?directory:[]}};
        const ids=u.searchParams.get('player_ids').split(',').map(Number);assert.ok(ids.length<=10);
        return {at:now,httpAt:now,body:{errorcode:'200',data:ids.map(ID=>({ID,Player_Resource:100000+ID,Player_ID:100000+ID,
            LCPrice:ID===2?39999:40000,checked:'2026-09-20 02:20:00'}))}};
    });
    let result;for(let page=1;page<=4;page++)result=await job.next(page);
    assert.equal(result.total,10);assert.equal(result.items.some(x=>x.futbinId===2),false);
    assert.ok(calls[0].includes('rating=87-99'));assert.ok(calls[0].includes('version=gold'));
    assert.equal(result.items[0].defId,100001);assert.equal(result.items[0].sourceCheckedRaw,'2026-09-20 02:20:00');
    assert.equal(result.items[0].value,40000);assert.equal(result.sourceMeta.rawItemCount,12);
});
test('FUTBIN source rejects logical errors, empty initial directory, missing batch IDs and wrong resources',async()=>{
    assert.ok(fs.existsSync(file));const {Refresh}=require(file);
    for(const body of [{error:'Invalid platform',code:400},{errorcode:'200',data:[]}]){
        const job=new Refresh(async()=>({at:now,httpAt:now,body}));await assert.rejects(job.next(1));
    }
    for(const patch of [{data:[]},{data:[{ID:1,Player_Resource:999,Player_ID:100001,LCPrice:40000,checked:'2026-09-20 02:20:00'}]},
        {data:[{ID:1,Player_Resource:100001,Player_ID:100001,LCPrice:null,checked:'2026-09-20 02:20:00'}]}]){
        const job=new Refresh(async url=>({at:now,httpAt:now,body:url.includes('getFilteredPlayers')?
            {errorcode:'200',data:url.includes('page=1')?[raw(1)]:[]}:{errorcode:'200',...patch}}));
        await job.next(1);await job.next(2);await assert.rejects(job.next(3));
    }
});
test('variant cards in the gold directory are excluded before price lookup',async()=>{
    const {Refresh}=require(file),calls=[];
    const variant={...raw(2),resource_id:50578738,playerid:247090};
    const job=new Refresh(async url=>{
        calls.push(url);
        return {at:now,httpAt:now,body:{errorcode:'200',data:url.includes('getFilteredPlayers')?
            (url.includes('page=1')?[raw(1),variant]:[]):[{ID:1,Player_Resource:100001,
                Player_ID:100001,LCPrice:40000,checked:'2026-09-20 02:20:00'}]}};
    });
    await job.next(1);await job.next(2);const result=await job.next(3);
    assert.equal(result.total,1);
    assert.deepEqual(result.items.map(r=>r.defId),[100001]);
    assert.deepEqual(result.sourceMeta.excludedVariants.map(r=>r.defId),[50578738]);
    assert.ok(calls.at(-1).includes('player_ids=1&'));
    assert.ok(!calls.at(-1).includes('21975'));
});
test('malformed, non-gold or another-season directory cards still fail closed',async()=>{
    assert.ok(fs.existsSync(file));const {Refresh}=require(file);
    for(const patch of [{resource_id:null},{playerid:null},{raretype:3},{cardImage:'https://cdn3.futbin.com/content/fifa26/img/cards/hd/0_gold.png'},
        {specialPlayerImage:'special.png'}]){
        const job=new Refresh(async()=>({at:now,httpAt:now,body:{errorcode:'200',data:[{...raw(1),...patch}]}}));
        await assert.rejects(job.next(1));
    }
});
test('GM transport uses anonymous HTTPS, parses Date, and rejects HTTP/logical/HTML failures',async()=>{
    const {requestGM}=require(file);assert.equal(typeof requestGM,'function');
    let options;
    const good=requestGM(o=>{options=o;queueMicrotask(()=>o.onload({status:200,responseText:'{"errorcode":"200","data":[]}',
        responseHeaders:'Date: Sun, 20 Sep 2026 01:20:00 GMT\r\n'}));return {abort(){}};});
    const value=await good('https://www.futbin.org/futbin/api/27/getFilteredPlayers?platform=PC');
    assert.equal(options.anonymous,true);assert.equal(options.timeout,20000);assert.equal(value.httpAt,now);
    for(const response of [{status:429,responseText:'{}'},{status:403,responseText:'blocked'},
        {status:200,responseText:'<html>Cloudflare</html>'},{status:200,responseText:'{"error":"Invalid platform","code":400}'}]){
        const request=requestGM(o=>{queueMicrotask(()=>o.onload(response));return {abort(){}};});
        await assert.rejects(request('https://www.futbin.org/futbin/api/27/getFilteredPlayers?platform=PC'));
    }
});
test('observed zero PC price is explicitly unavailable and excluded, never a free quote or another card version',async()=>{
    const {Refresh}=require(file);
    const job=new Refresh(async url=>({at:now,httpAt:now,body:{errorcode:'200',data:url.includes('getFilteredPlayers')?
        (url.includes('page=1')?[raw(43)]:[]):[{ID:43,Player_Resource:100043,Player_ID:100043,LCPrice:0,checked:'2026-09-20 02:28:07'}]}}));
    await job.next(1);await job.next(2);const result=await job.next(3);
    assert.equal(result.items.length,0);assert.equal(result.sourceMeta.unpriced[0].defId,100043);
});
