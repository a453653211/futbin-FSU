/* Read-only export using the exact same source/parser as the userscript. */
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);
const { Refresh } = require('../src/futbin-catalog-source.js');
const { Builder, assertContinuity } = require('../src/market-catalog.js');
const { floorPrice, referenceCap } = require('../src/auto-bid-core.js');
const tiers = [{min:100000,inc:1000},{min:50000,inc:500},{min:10000,inc:250},{min:1000,inc:100},{min:150,inc:50}];
async function main() {
    const request = async url => {
        if (process.platform === 'win32') {
            // Use the native Windows HTTP client (same environment as the verified
            // read-only research). No cookies, account headers or browser profile.
            const { stdout } = await execFile('pwsh', ['-NoProfile', '-Command',
                "$ErrorActionPreference='Stop'; $r=Invoke-WebRequest -Uri $env:FSU_CATALOG_URL -TimeoutSec 20; " +
                "@{body=($r.Content|ConvertFrom-Json);at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds();" +
                "httpAt=[DateTimeOffset]::Parse((($r.Headers['Last-Modified'] -join '') + ($r.Headers['Date'] -join '')).Substring(0,29)).ToUnixTimeMilliseconds()}|ConvertTo-Json -Depth 30 -Compress -EscapeHandling EscapeNonAscii"],
                { windowsHide: true, env: { ...process.env, FSU_CATALOG_URL: url }, maxBuffer: 4000000 });
            return JSON.parse(stdout);
        }
        const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' });
        if (!response.ok) throw new Error(`FUTBIN HTTP ${response.status}`);
        const body = await response.json();
        return { body, at: Date.now(), httpAt: Date.parse(response.headers.get('last-modified') || response.headers.get('date')) };
    };
    const job = new Refresh(request), builder = new Builder('27:public-catalog:PC');
    let snapshot;
    while (!snapshot) {
        const step = builder.page;
        const page = await job.next(step);
        snapshot = builder.add(page, Date.now());
        console.log(`FUTBIN refresh step ${step}: ${page.pending ? 'collecting' : page.total + ' eligible cards'}`);
        if (!snapshot) await new Promise(resolve => setTimeout(resolve, 5000));
    }
    const outputDir = path.resolve(__dirname, '../data');fs.mkdirSync(outputDir, { recursive: true });
    const jsonPath = path.join(outputDir, 'futbin-fc27-pc-reference.json');
    if (fs.existsSync(jsonPath)) assertContinuity(JSON.parse(fs.readFileSync(jsonPath, 'utf8')), snapshot);
    // Only a completely validated snapshot replaces a previous export.
    const tempPath = jsonPath + '.tmp';fs.writeFileSync(tempPath, JSON.stringify(snapshot, null, 2) + '\n');
    fs.renameSync(tempPath, jsonPath);
    const lines = ['# FUTBIN FC27 PC 基础金卡参考名单', '',
        `完整抓取：${new Date(snapshot.fetchedAt).toISOString()}；默认有效期 1 小时。`,
        `完整目录 ${snapshot.sourceMeta.rawItemCount} 张，非门将 ${snapshot.sourceMeta.nonGkCount} 张；逐批读取价格后符合 ≥40,000 的 ${snapshot.total} 张。`,
        '源报价时间没有时区，按 FUTBIN 原文保留。购买上限严格低于 PC 参考价的 60%。', '',
        '| 球员 | 评分 | 位置 | EA definitionId | FUTBIN ID | PC 最低参考价 | 购买上限 | 源报价时间（原文） |',
        '|---|---:|---|---:|---:|---:|---:|---|'];
    for (const r of snapshot.rows) lines.push(`| [${r.name.replaceAll('|', '')}](${r.source}) | ${r.rating} | ${r.positionName} | ${r.defId} | ${r.futbinId} | ${r.value.toLocaleString('en-US')} | ${referenceCap(r.value, {floor:n=>floorPrice(n,tiers)}).toLocaleString('en-US')} | ${r.sourceCheckedRaw} |`);
    for (const r of snapshot.sourceMeta.unpriced || []) lines.push(`\n未纳入购买：${r.name}（${r.defId}），${r.reason}。`);
    fs.writeFileSync(path.join(outputDir, 'futbin-fc27-pc-reference.md'), lines.join('\n') + '\n');
    console.log(`Saved ${snapshot.total} verified cards to ${jsonPath}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
