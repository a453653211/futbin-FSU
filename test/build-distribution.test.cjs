const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const release=require('../release.json');
const {version}=release.fsu;
const {parse}=require('acorn');
const {prepareFsu,sha256}=require('../build.cjs');
const file=path.join(__dirname,'../dist/FSU-smart-sbc.user.js');

test('exactly three complete installers match the release config',()=>{
    assert.deepEqual(fs.readdirSync(path.join(__dirname,'../dist')).sort(),['FSU-smart-sbc.user.js','Fodder.user.js','OAO.user.js']);
    for(const key of ['fsu','fodder','oao']){
        const c=release[key],data=fs.readFileSync(path.join(__dirname,'..',c.file),'utf8');
        assert.equal(data.match(/^\/\/ @version[ \t]+([^\r\n]+)/m)?.[1],c.version);
        assert.doesNotThrow(()=>new vm.Script(data));
        assert.match(data,/==UserScript==/);assert.match(data,/==\/UserScript==/);
    }
    const source=fs.readFileSync(file,'utf8');
    assert.match(source,/\.smartSbcGroup=/);assert.match(source,/\.smartSbcMarketAdapter=/);
    assert.match(source,/\.highValueOpen=/);assert.match(source,/\.highValueBaselines=/);
    assert.match(source,/fsu-high-value-sync/);
    assert.doesNotMatch(source,/FsuAutoBid|FsuMarketCatalog|FsuFutbinSource|mountAutoBid/);
    assert.doesNotMatch(source,/^\/\/ @(downloadURL|updateURL)/m);
    assert.equal(source.trimEnd().split(/\r?\n/).at(-1),'// FSU_INSTALL_COMPLETE_'+version.replace(/\./g,'_'));
    assert.equal(sha256(fs.readFileSync(path.join(__dirname,'..',release.fsu.source))),release.fsu.sha256);
    assert.equal(sha256(fs.readFileSync(path.join(__dirname,'..',release.oao.file))),release.oao.sha256);
});
test('missing or repeated upstream anchors block the build',()=>{
    const upstream=fs.readFileSync(path.join(__dirname,'..',release.fsu.source),'utf8');
    for (const anchor of ['        //26.04 SBC初始化需求内容', "    'use strict';\r\n    !function",
        '        UTTransferListViewController.prototype._renderView = function(...args) {\r\n            call.view.transfer.call(this, ...args);']) {
        const actual = upstream.includes(anchor) ? anchor : anchor.replace(/\r\n/g, '\n');
        assert.throws(()=>prepareFsu(upstream.replace(actual,'')),/exactly one/);
        assert.throws(()=>prepareFsu(upstream+'\n'+actual),/exactly one/);
    }
});

test('compressed SBC solver exports in the installer keep their behavior',async()=>{
    const source=fs.readFileSync(file,'utf8');
    const found={};
    function walk(node){
        if(!node||typeof node!=='object')return;
        if(node.type==='VariableDeclarator'&&['FsuSbcSolver','FsuSbcComplex'].includes(node.id.name))found[node.id.name]=source.slice(node.init.start,node.init.end);
        for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value?.type)walk(value);
    }
    walk(parse(source,{ecmaVersion:'latest'}));
    assert.equal(Object.keys(found).length,2);
    const solver=vm.runInNewContext(found.FsuSbcSolver),complex=vm.runInNewContext(found.FsuSbcComplex);
    const p=(id,rating,db=id)=>({id,databaseId:db,rating});
    const allocated=solver.allocate([{players:[p(1,75),p(2,75)]},{players:[p(3,78,1)]}],[1,1]);
    assert.deepEqual(Array.from(allocated,card=>card.databaseId).sort(),[1,2]);
    const ratings=Array.from({length:11},(_,i)=>({rating:60+i*3}));
    assert.equal(complex.rating(ratings,true),require('../src/sbc-complex.js').rating(ratings,true));
    const req=(name,value,count=0)=>({label:name,scope:'GREATER',count,keys:[{name,value:[value]}]});
    const rules=complex.compile([req('CLUB_COUNT',4),req('PLAYER_LEVEL',2,3),
        req('PLAYER_QUALITY',1),req('CHEMISTRY_POINTS',14)],11);
    const players=[];
    for(const [tier,rating] of [[1,60],[2,65],[3,75]])for(let i=0;i<16;i++){
        const id=players.length+1;
        players.push({id:String(id),databaseId:id,rating,tier,clubId:i%4+1,positions:[14],owned:true});
    }
    const context={floatRating:true,chemistry:()=>({total:14,points:Array(11).fill(0)})};
    const result=await complex.search({players,positions:Array(11).fill(14),rules,context,
        seed:1,maxMs:1000,stopAtFirst:true,yieldFn:async()=>{}});
    assert.equal(result.status,'feasible');
    assert.deepEqual(Array.from(result.solution,card=>card.tier).sort(),[1,1,1,1,1,1,1,1,2,2,2]);
});
