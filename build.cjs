const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { minify } = require('terser');
const release = require('./release.json');
const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');

function prepareFsu(input = read(release.fsu.source)) {
    let source = input.replace(/\r\n/g, '\n');
    function replaceOnce(anchor, replacement) {
        if (source.split(anchor).length !== 2) throw new Error(`Expected exactly one FSU 27.1 anchor: ${anchor}`);
        source = source.replace(anchor, () => replacement);
    }
    replaceOnce('// @name                      【FSU】EAFC FUT WEB 增强器 plus',
        '// @name                      【FSU】EAFC FUT WEB 增强器 plus · 智能SBC');
    replaceOnce(`// @version                   ${release.fsu.upstreamVersion}`, `// @version                   ${release.fsu.version}`);
    source = source.replace(/^\/\/ @(?:downloadURL|updateURL).*\n/gm, '');
    const dialogCalls = source.match(/new EADialogViewController\(/g) || [];
    if (dialogCalls.length !== 12) throw new Error(`Unexpected FSU dialog count: ${dialogCalls.length}`);
    source = source.replace(/new EADialogViewController\(/g, 'events.createDialog(');
    replaceOnce('        events.popup = (t,m,c,o,i,n,s) => {',
        read('src/dialog-compat.js') + '\n        events.popup = (t,m,c,o,i,n,s) => {');
    const modules = ['sbc-solver', 'sbc-complex', 'sbc-procurement', 'sbc-market-adapter', 'sbc-integration', 'sbc-group-integration', 'high-value-integration'];
    replaceOnce('        //26.04 SBC初始化需求内容', modules.map(name =>
        read(`src/${name}.js`).replace(/^if \(typeof module[^\n]+\n?/gm, '')).join('\n') + '\n        //26.04 SBC初始化需求内容');
    replaceOnce('                let hasChemistry = 0, hasRating = 0, exactRating = 0;', `
                this._fsu.smartSbcBtn = events.createButton(new UTStandardButtonControl(),
                    '智能填充（按任务条件）', button => events.smartSbcFill(thisController, button), 'call-to-action');
                this._fsu.smartSbcBtn.getRootElement().title = '保留已放入球员，按真实挑战条件补齐空位；保存前通过 EA 校验，不自动提交';
                this._fsu.smartSbcGroupBtn = events.createButton(new UTStandardButtonControl(),
                    '整组规划 / 缺卡补购', button => events.smartSbcGroup(thisController, button), 'call-to-action');
                this._fsu.smartSbcScopeBtn = events.createButton(new UTStandardButtonControl(),
                    events.smartSbcScopeText(), button => {
                        if (info.run.smartSbc) return;
                        GM_setValue('smartSbcLegacyFilters', !events.smartSbcLegacyFilters());
                        button.setText(events.smartSbcScopeText());
                    }, 'mini');
                this._fsu.smartSbcScopeBtn.getRootElement().title = '切换全部联赛含可交易 / 沿用 FSU 筛选；始终保护锁卡、主力、进化和租借，遵守评分及卡种设置';
                let hasChemistry = 0, hasRating = 0, exactRating = 0;`);
    replaceOnce('            const exchangeElement = view._btnExchange.getRootElement();', `
            const exchangeElement = view._btnExchange.getRootElement();
            if (fsu?.smartSbcScopeBtn) exchangeElement.before(fsu.smartSbcScopeBtn.getRootElement());
            if (fsu?.smartSbcGroupBtn) exchangeElement.before(fsu.smartSbcGroupBtn.getRootElement());
            if (fsu?.smartSbcBtn) exchangeElement.before(fsu.smartSbcBtn.getRootElement());`);
    replaceOnce('                Object.assign(fsu.fillSquadBtn.getRootElement().style,{',
        '                if (fsu.fillSquadBtn) Object.assign(fsu.fillSquadBtn.getRootElement().style,{');
    replaceOnce('                fsu.fillSquadBtn.addClass("mini");', '                if (fsu.fillSquadBtn) fsu.fillSquadBtn.addClass("mini");');
    // Reserve the same inventory against the upstream template / automatic SBC flows.
    for (const anchor of [
        'events.startAutoSbcLoop = async(controller) => {',
        'events.openPacksWithSBC = async (packId, packName, packNum, excludeLeague, sbcKey, minRatingThreshold = 84) => {',
        'events.getTemplate = async function(e,type,sId,options = {}){',
        'events.buyConceptPlayer = async (players, view) => {',
        'events.losAuctionSell = async(e,t) => {'
    ]) replaceOnce(anchor, anchor + '\n            if (info.run.smartSbc || info.run.highValue) { events.notice("请先停止智能 SBC / 高价值卡任务。", 2); return; }');
    replaceOnce("    'use strict';\n    !function", "    'use strict';\n" +
        read('src/high-value-core.js').replace(/^if \(typeof module[^\n]+\n?/gm, '') + '\n' +
        read('src/high-value-futbin.js') + '\n    !function');
    replaceOnce('        UTTransferListViewController.prototype._renderView = function(...args) {\n            call.view.transfer.call(this, ...args);',
        '        UTTransferListViewController.prototype._renderView = function(...args) {\n            call.view.transfer.call(this, ...args);\n            events.highValueMount(this.getView());');
    // One FSU installation owns all prototype hooks. Keep metadata identity for in-place upgrades.
    replaceOnce('    function futweb() {', `    function futweb() {
        if (unsafeWindow.__fsuSmartSbcInstalled) return;
        unsafeWindow.__fsuSmartSbcInstalled = '${release.fsu.version}';`);
    return source;
}

async function build() {
    const original = fs.readFileSync(path.join(root, release.fsu.source));
    if (sha256(original) !== release.fsu.sha256) throw new Error('FSU upstream hash changed; compare and update the adapter explicitly.');
    fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
    const source = prepareFsu();
    const end = source.indexOf('// ==/UserScript==') + '// ==/UserScript=='.length;
    const compact = await minify(source.slice(end), { compress: { passes: 2 }, mangle: false,
        format: { comments: false, max_line_len: 500 } });
    if (!compact.code) throw new Error('Empty FSU build');
    const output = source.slice(0, end) + '\n' + compact.code + `\n// FSU_INSTALL_COMPLETE_${release.fsu.version.replace(/\./g, '_')}\n`;
    fs.writeFileSync(path.join(root, release.fsu.file), output);
    for (const name of ['fodder', 'oao']) {
        const config = release[name];
        let data = fs.readFileSync(path.join(root, config.source));
        if (name === 'fodder') {
            let code = data.toString('utf8');
            const base = config.baseVersion.replace(/\./g, '\\.');
            const versions = new RegExp(`(@version[ \\t]+|VERSION = ')${base}`, 'g');
            if ((code.match(versions) || []).length !== 3) throw new Error('Fodder version anchors changed');
            code = code.replace(versions, (_, prefix) => prefix + config.version);
            data = Buffer.from(code);
        }
        const actual = data.toString('utf8').match(/^\/\/ @version\s+([^\r\n]+)/m)?.[1];
        if (actual !== config.version) throw new Error(`${name} metadata version does not match release.json`);
        fs.writeFileSync(path.join(root, config.file), data);
    }
    for (const name of ['fodder', 'fsu', 'oao']) console.log(`${release[name].file} · ${release[name].version} · ${fs.statSync(path.join(root, release[name].file)).size} bytes`);
}
module.exports = { build, prepareFsu, sha256 };
if (require.main === module) build().catch(error => { console.error(error); process.exitCode = 1; });
