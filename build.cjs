const fs = require('node:fs');
const path = require('node:path');
const { minify } = require('terser');
const { upstreamVersion, version } = require('./release.json');
const completionMarker = `FSU_INSTALL_COMPLETE_${version.replace(/\./g, '_')}`;
const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let source = read('【FSU】EAFC FUT WEB 增强器-26.09.txt');
function replaceOnce(anchor, replacement) {
    if (source.split(anchor).length !== 2) throw new Error(`Expected exactly one anchor: ${anchor}`);
    source = source.replace(anchor, () => replacement);
}
replaceOnce('// @name         【FSU】EAFC FUT WEB 增强器', '// @name         【FSU】EAFC FUT WEB 增强器 · 智能SBC与市场购买');
replaceOnce(`// @version      ${upstreamVersion}`, `// @version      ${version}`);
source = source.replace(/^\/\/ @(?:downloadURL|updateURL).*\r?\n/gm, '');
// Route every FSU dialog through the adapter, including settings and pack dialogs.
const dialogCalls = source.match(/new EADialogViewController\(/g) || [];
if (dialogCalls.length !== 8) throw new Error(`Unexpected FSU dialog count: ${dialogCalls.length}`);
source = source.replace(/new EADialogViewController\(/g, 'events.createDialog(');
replaceOnce('        events.popup = (t,m,c,o,i,n,s) => {',
    read('src/dialog-compat.js') + '\n        events.popup = (t,m,c,o,i,n,s) => {');
replaceOnce('        //26.04 SBC初始化需求内容',
    read('src/sbc-solver.js').replace(/if \(typeof module[^\n]+\n?$/, '') + '\n' +
    read('src/sbc-complex.js').replace(/if \(typeof module[^\n]+\n?$/, '') + '\n' +
    read('src/sbc-procurement.js').replace(/if \(typeof module[^\n]+\n?$/, '') + '\n' +
    read('src/sbc-integration.js') + '\n' + read('src/sbc-group-integration.js') + '\n        //26.04 SBC初始化需求内容');
const marketModules =
    read('src/market-catalog.js').replace(/if \(typeof module[^\n]+\n?$/, '') + '\n' +
    read('src/futbin-catalog-source.js').replace(/if \(typeof module[^\n]+\n?$/, '') + '\n' +
    read('src/auto-bid-core.js').replace(/if \(typeof module[^\n]+\n?$/, '') + '\n' +
    read('src/auto-bid-integration.js');
replaceOnce('        //26.07 FG计算', '__FSU_MARKET_MODULES__\n        //26.07 FG计算');
replaceOnce('                let hasChemistry = 0, hasRating = 0, exactRating = 0;',
    `                this._fsu.smartSbcBtn = events.createButton(new UTStandardButtonControl(),
                    '智能填充（按任务条件）',
                    button => events.smartSbcFill(thisController, button), 'call-to-action');
                this._fsu.smartSbcBtn.getRootElement().title = '保留已放入球员，按任务条件补齐空位；不会自动提交';
                this._fsu.smartSbcGroupBtn = events.createButton(new UTStandardButtonControl(),
                    '整组规划 / 缺卡补购', button => events.smartSbcGroup(thisController, button), 'call-to-action');
                this._fsu.smartSbcScopeBtn = events.createButton(new UTStandardButtonControl(),
                    events.smartSbcScopeText(), button => {
                        GM_setValue('smartSbcLegacyFilters', !events.smartSbcLegacyFilters());
                        button.setText(events.smartSbcScopeText());
                    }, 'mini');
                this._fsu.smartSbcScopeBtn.getRootElement().title = '点击切换：全部联赛含可交易 / 沿用原 FSU 筛选。两种模式均保护锁卡、主力和进化球员，并遵守最高评分和允许卡种设置。';
                let hasChemistry = 0, hasRating = 0, exactRating = 0;`);
replaceOnce('            const exchangeElement = view._btnExchange.getRootElement();',
    `            const exchangeElement = view._btnExchange.getRootElement();
            if (fsu?.smartSbcScopeBtn) exchangeElement.before(fsu.smartSbcScopeBtn.getRootElement());
            if (fsu?.smartSbcGroupBtn) exchangeElement.before(fsu.smartSbcGroupBtn.getRootElement());
            if (fsu?.smartSbcBtn) exchangeElement.before(fsu.smartSbcBtn.getRootElement());`);
// Existing FSU assumes the optional template button always exists; avoid blocking the new UI.
replaceOnce('                Object.assign(fsu.fillSquadBtn.getRootElement().style,{',
    '                if (fsu.fillSquadBtn) Object.assign(fsu.fillSquadBtn.getRootElement().style,{');
replaceOnce('                fsu.fillSquadBtn.addClass("mini");',
    '                if (fsu.fillSquadBtn) fsu.fillSquadBtn.addClass("mini");');
// Tampermonkey saved the previous 1 MB paste only through source line 17011.
// Keep the metadata block intact and preserve the original FSU names
// so grants and URL matches continue to work. The old 601 KB paste was cut short.
const marker = '// ==/UserScript==';
const afterHeader = source.indexOf(marker) + marker.length;
if (afterHeader < marker.length) throw new Error('Missing userscript metadata');
// Only shorten local names in our self-contained market modules. The original FSU
// program and shared top-level names keep their spelling for compatibility.
minify(marketModules, { compress: { passes: 2 }, mangle: true,
    format: { comments: false } }).then(market => {
    if (!market.code) throw new Error('Market minification returned an empty program');
    source = source.replace('__FSU_MARKET_MODULES__', market.code);
    return minify(source.slice(afterHeader), { compress: { passes: 2 }, mangle: false,
    format: { comments: false, beautify: false, max_line_len: 500 } }).then(result => {
    if (!result.code) throw new Error('Terser returned an empty program');
    const compact = source.slice(0, afterHeader) + '\n' + result.code + `\n// ${completionMarker}\n`;
    const size = Buffer.byteLength(compact, 'utf8');
    if (size >= 590000 || compact.length >= 560000) throw new Error(`Installer grew beyond the verified paste size: ${size} bytes / ${compact.length} characters`);
    fs.writeFileSync(path.join(root, 'FSU-26.09.1-smart-sbc.user.js'), compact);
    console.log(`Built FSU-26.09.1-smart-sbc.user.js (version ${version}, ${size} bytes)`);
    });
}).catch(error => { console.error(error); process.exitCode = 1; });
