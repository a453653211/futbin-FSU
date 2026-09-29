const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {version}=require('../release.json');
const file=path.join(__dirname,'../FSU-26.09.1-smart-sbc.user.js');

test('Tampermonkey installer fits the verified paste limit and contains a complete program',()=>{
    const data=fs.readFileSync(file);
    assert.ok(data.length<590000,`Installer is ${data.length} bytes; previous browser paste stopped at 596074 bytes`);
    const source=data.toString('utf8');
    assert.ok(source.length<560000,`Installer is ${source.length} characters; previous browser paste stopped at 567405`);
    assert.match(source,/\/\/ ==UserScript==/);
    assert.equal(source.match(/^\/\/ @version[ \t]+([^\r\n]+)$/m)?.[1],version);
    assert.match(source,/\/\/ ==\/UserScript==/);
    assert.match(source,/@match\s+https:\/\/www\.ea\.com\/ea-sports-fc\/ultimate-team\/web-app\/\*/);
    assert.match(source,/\.smartSbcGroup=/);
    assert.match(source,/\.autoBidAdapter=/);
    assert.match(source,/按所选搜索买一张/);
    assert.doesNotMatch(source,/指定球员与价格/);
    assert.match(source,/开始 \/ 继续收藏馆补卡/);
    assert.equal(source.trimEnd().split(/\r?\n/).at(-1),`// FSU_INSTALL_COMPLETE_${version.replace(/\./g,'_')}`);
    assert.doesNotThrow(()=>new vm.Script(source));
});
