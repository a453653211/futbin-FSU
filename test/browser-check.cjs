const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { read, root } = require('./helpers.cjs');
const installEaMocks = require('./fixtures/ea-browser.js');
const release = require('../release.json');
const highValue = require('./high-value-browser.cjs');
const eaURL = 'https://www.ea.com/ea-sports-fc/ultimate-team/web-app/';
const fsu = read(release.fsu.file), fodder = read(release.fodder.file), oao = read(release.oao.file);
const prototypes = {};
for (const m of fsu.matchAll(/\b([A-Za-z_$][\w$]*)\.prototype\.([A-Za-z_$][\w$]*)/g)) (prototypes[m[1]] ||= []).push(m[2]);
for (const m of fsu.matchAll(/\bnew ((?:UT|EA|FC)[\w$]+)\b/g)) prototypes[m[1]] ||= [];
const listHTML = Array.from({ length: 5 }, (_, i) => `<a href="/27/totw/Batch${i}">EA FC 27 Batch ${i} Created: October ${16 - i}, 2026</a>`).join('');
const teamHTML = slug => `<h1>EA FC 27 ${slug}</h1><table>${Array.from({ length: 30 }, (_, i) => `<tr><td>87</td><td><a href="/27/player/${i + 100}/player-${i}">Player ${i}</a></td></tr>`).join('')}</table>`;
function publicBody(url) {
    const highValueBody = highValue.publicBody(url);
    if (highValueBody !== undefined) return highValueBody;
    const u = new URL(url);
    if (u.pathname === '/27/squads') return listHTML;
    if (u.pathname.includes('/27/totw/')) return teamHTML(u.pathname.split('/').at(-1));
    if (u.pathname.includes('fetchPlayerInformationMinimal')) return JSON.stringify({ data: [{ ID: Number(u.searchParams.get('ID')),
        Player_Resource: Number(u.searchParams.get('ID')) + 1000, pc_LCPrice: 1000, pc_MinPrice: 150, pc_MaxPrice: 10000 }] });
    return '{}';
}
async function main() {
    const browser = await chromium.launch({ headless: true, ...(process.env.FC27_CHROMIUM_PATH ? { executablePath: process.env.FC27_CHROMIUM_PATH } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => {
            const u = new URL(route.request().url());
            if (u.href === eaURL) return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head></head><body><h1>FC27 offline test</h1></body></html>' });
            if (u.pathname === '/client.core.js') return route.fulfill({ contentType: 'application/javascript', body: read('test/fixtures/fodder-core.js'), headers: { 'access-control-allow-origin': '*' } });
            if (u.pathname === '/public') return route.fulfill({ contentType: 'text/plain', body: publicBody(u.searchParams.get('url')) });
            return route.fulfill({ contentType: 'application/json', body: '{}', headers: { 'access-control-allow-origin': '*' } });
        });
        await page.goto(eaURL);
        await page.addScriptTag({ path: require.resolve('lodash/lodash.js') });
        await page.evaluate(installEaMocks, prototypes);
        await page.evaluate(() => {
            window.GM_xmlhttpRequest = options => {
                fetch('/public?url=' + encodeURIComponent(options.url)).then(r => r.text()).then(text =>
                    options.onload?.({ status: 200, responseText: text, finalUrl: options.url })).catch(error => options.onerror?.(error));
                return { abort() {} };
            };
        });
        await page.addScriptTag({ content: fsu });
        assert.equal(await page.evaluate(() => !!window.events?.smartSbcFill), true, errors.join('\n'));
        await page.addScriptTag({ content: oao });
        await page.addScriptTag({ content: fodder });
        await page.waitForFunction(() => window.__fodderLatestCards?.status().ready, { timeout: 10000 });
        assert.deepEqual(errors, []);
        assert.equal(await page.evaluate(() => window.__eaCalls.buys + window.__eaCalls.saves + window.__eaCalls.submits), 0);
        console.log('PASS full FSU + OAO + Fodder startup; no automatic saves, purchases or submits');
        await page.evaluate(() => {
            Object.assign(info.set, { goldenrange: 82, shield_flag: [], shield_league: [] });
            info.lock = [1];
            window.__inventory = [mockPlayer(1), mockPlayer(2, { loans: 5 }), mockPlayer(3, { upgrades: {} }), mockPlayer(4), mockPlayer(5),
                mockPlayer(6, { rating: 90 }), mockPlayer(7, { rareflag: 20 }), mockPlayer(8, { isEnrolledInAcademy: () => true }),
                mockPlayer(9, { endTime: 999999 }), mockPlayer(10)];
            const squad = mockSquad([mockPlayer(11)]);
            const req = { keys: () => [1], getFirstKey: () => 1, getFirstValue: () => 78, getValue: () => [78], count: 2, scope: 1, buildString: () => '>=78' };
            const challenge = { id: 25, setId: 7, name: 'Offline challenge', eligibilityOperation: 0, eligibilityRequirements: [req], squad,
                onDataChange: { notify() {} } };
            const controller = new UTSBCSquadOverviewViewController();
            window._appMain = { _rootViewController: { currentController: { currentController: { currentController: controller } } } };
            controller._challenge = challenge; controller._squad = squad;
            controller.initWithSBCSet();
            const detail = new UTSBCSquadDetailPanelViewController(); detail._challenge = challenge;
            const host = document.createElement('div'); host.id = 'sbc-actions'; document.body.append(host);
            const view = { _btnExchange: new UTStandardButtonControl(), _btnSquadBuilder: new UTStandardButtonControl(),
                _challengeDetails: { getRootElement: () => host, _groupRewardList: { getRootElement: () => host } } };
            view._btnExchange.setText('EA exchange'); host.append(view._btnExchange.getRootElement());
            detail._view = view; detail.initWithSBCSet();
            window.__sbcController = controller;
        });
        assert.equal(await page.getByRole('button', { name: '智能填充（按任务条件）', exact: true }).count(), 1);
        assert.equal(await page.getByRole('button', { name: '整组规划 / 缺卡补购', exact: true }).count(), 1);
        await page.getByRole('button', { name: '智能填充（按任务条件）', exact: true }).click();
        await page.waitForFunction(() => !info.run.smartSbc);
        const outcome = await page.evaluate(() => ({ ...__eaCalls, ids: __sbcController._challenge.squad.getPlayers().slice(0, 2).map(s => s.item.id) }));
        assert.equal(outcome.saves, 1, JSON.stringify(outcome)); assert.equal(outcome.submits, 0); assert.equal(outcome.buys, 0);
        assert.deepEqual(outcome.ids, [11, 4], 'keep the placed player; reject lock, loan, evolution, active squad, high rating and special cards');
        console.log('PASS actual FSU27.1 challenge hooks, unique buttons, real filters and smart-fill save without submit');
        const hooks = await page.evaluate(() => UTSBCSquadOverviewViewController.prototype.initWithSBCSet.toString());
        await page.addScriptTag({ content: fsu });
        assert.equal(await page.evaluate(() => UTSBCSquadOverviewViewController.prototype.initWithSBCSet.toString()), hooks);
        await highValue.run(page);
        await page.getByRole('button', { name: '最新卡', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('.fgnew-card:not(:disabled)').length === 30);
        assert.equal(await page.locator('.fgnew-batch').count(), 3);
        const layout = await page.evaluate(() => {
            const grid = document.querySelector('.fgnew-grid'), card = document.querySelector('.fgnew-card-tile');
            return { tile: card.getBoundingClientRect().height, scrollHeight: grid.scrollHeight, height: grid.clientHeight,
                qty: card.querySelector('input').getBoundingClientRect().height };
        });
        assert.ok(layout.tile >= 350 && layout.qty >= 27 && layout.scrollHeight > layout.height, JSON.stringify(layout));
        for (const [width, height] of [[1280, 720], [390, 844]]) {
            await page.setViewportSize({ width, height });
            const small = await page.evaluate(() => {
                const grid = document.querySelector('.fgnew-grid');
                return { card: document.querySelector('.fgnew-card-tile').getBoundingClientRect().height,
                    width: grid.clientWidth, scrollWidth: grid.scrollWidth, height: grid.clientHeight, scrollHeight: grid.scrollHeight };
            });
            assert.ok(small.card >= 350 && small.height > 0 && small.scrollHeight > small.height && small.scrollWidth <= small.width + 1,
                `${width}x${height}: ${JSON.stringify(small)}`);
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
        console.log('PASS 3 recent batches, 30 full-height native card faces, quantity controls and internal scrolling');
        const tile = i => page.locator('.fgnew-card-tile').nth(i);
        const choose = async (i, count) => {
            await tile(i).locator('.fgnew-card').click();
            if (count !== 1) { await tile(i).locator('input').fill(String(count)); await tile(i).locator('input').press('Tab'); }
        };
        // Quantity caps: an out-of-range number is rejected, and total copies cannot exceed 100.
        for (let i = 0; i < 5; i++) await choose(i, 20);
        await tile(5).locator('.fgnew-card').click();
        assert.match(await page.locator('.fgnew-count').innerText(), /合计 100 张/);
        await page.getByRole('button', { name: '清空选择', exact: true }).click();
        await choose(0, 1); await tile(0).locator('input').fill('21'); await tile(0).locator('input').press('Tab');
        assert.equal(await tile(0).locator('input').inputValue(), '1');
        await tile(0).locator('input').fill('3'); await tile(0).locator('input').press('Tab'); await choose(1, 1);
        await page.getByRole('button', { name: '购买所选球员', exact: true }).click();
        await page.getByRole('button', { name: '开始购买', exact: true }).click();
        await page.waitForFunction(() => __mockRuns?.length === 1 && document.querySelector('.fgnew-phase')?.textContent.includes('等待'));
        assert.equal(await page.evaluate(() => __fodderLatestCards.status().running), true);
        await page.evaluate(() => events.smartSbcFill(__sbcController, __sbcController._fsu.smartSbcBtn));
        assert.equal(await page.evaluate(() => __eaCalls.saves), 1, 'Fodder active task must block smart SBC');
        await page.clock.fastForward(300000);
        await page.waitForFunction(() => __mockRuns.length === 2);
        await page.clock.fastForward(300000);
        await page.waitForFunction(() => !__fodderLatestCards.status().running);
        const rounds = await page.evaluate(() => ({ risk: __riskCalls, runs: __mockRuns.map(r => ({ ids: r.targets.map(t => t.resourceId), prefs: r.prefs,
            flags: [r.options.leaveUnassigned, r.options.keepDuplicates] })), cards: document.querySelector('.fgnew-progress-count').textContent }));
        assert.deepEqual(rounds.runs.map(r => r.ids), [[1100, 1101], [1100], [1100]]);
        assert.equal(rounds.risk, 1); assert.match(rounds.cards, /4\s*\/\s*4/);
        for (const r of rounds.runs) { assert.deepEqual(r.prefs, { minPct: 60, maxPct: 90, tries: 2 }); assert.deepEqual(r.flags, [true, true]); }
        console.log('PASS 1–20/100 caps, exact-version 3+1 quantities, no double counting, only shortages retried every 5 minutes, fixed price settings');
        // Stop during the five-minute wait must prevent any later round.
        await page.getByRole('button', { name: '返回选卡', exact: true }).click();
        await page.getByRole('button', { name: '刷新批次 / 价格', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('.fgnew-card:not(:disabled)').length === 30 && !document.querySelector('.fgnew-select-visible').disabled);
        await choose(2, 2);
        await page.getByRole('button', { name: '购买所选球员', exact: true }).click();
        await page.getByRole('button', { name: '开始购买', exact: true }).click();
        await page.waitForFunction(() => __mockRuns.length === 4);
        await page.getByRole('button', { name: '停止购买', exact: true }).click();
        await page.clock.fastForward(600000);
        assert.equal(await page.evaluate(() => __mockRuns.length), 4);
        assert.equal(await page.evaluate(() => __fodderLatestCards.status().running), false);
        console.log('PASS stop cancels remaining quantities and future retry timers');
        await page.getByRole('button', { name: '返回选卡', exact: true }).click();
        await page.getByRole('button', { name: '清空选择', exact: true }).click();
        await page.getByRole('button', { name: '刷新批次 / 价格', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('.fgnew-card:not(:disabled)').length === 30 && !document.querySelector('.fgnew-select-visible').disabled);
        await page.evaluate(() => { window.__mockOutcome = 'unknown'; });
        await choose(3, 2);
        await page.getByRole('button', { name: '购买所选球员', exact: true }).click();
        await page.getByRole('button', { name: '开始购买', exact: true }).click();
        await page.waitForFunction(() => __mockRuns.length === 5 && !__fodderLatestCards.status().running);
        await page.clock.fastForward(600000);
        assert.equal(await page.evaluate(() => __mockRuns.length), 5);
        assert.match(await page.locator('.fgnew-run-info').innerText(), /不明确/);
        console.log('PASS ambiguous native outcome halts quantity retries');
        // The shared native factory also protects original Gallery purchases during smart SBC.
        const blocked = await page.evaluate(() => {
            info.run.smartSbc = true;
            try { __fodder.mockFactory([{ resourceId: 9001, price: 1000 }]); return false; }
            catch (error) { return /智能 SBC/.test(error.message); }
            finally { info.run.smartSbc = false; }
        });
        assert.equal(blocked, true);
        console.log('PASS smart SBC blocks the shared Fodder purchase factory; duplicate FSU does not install hooks twice');
        await page.getByRole('button', { name: '返回选卡', exact: true }).click();
        await page.getByRole('button', { name: '收藏馆', exact: true }).click();
        await page.evaluate(() => {
            window.__mockOutcome = 'bad';
            const modal = document.createElement('section'); modal.id = 'mock-gallery-modal'; modal.setAttribute('role', 'dialog');
            modal.style.cssText = 'padding:20px;background:#172536;color:white';
            modal.innerHTML = '<h3>收藏馆购买</h3><div><label>每名球员尝试次数</label><button>1</button><button>2</button><button>3</button></div><button id="gallery-start">开始购买</button><button>关闭</button>';
            document.body.append(modal);
            modal.querySelector('#gallery-start').onclick = () => {
                __fodder.gallery.run = __fodder.mockFactory([{ resourceId: 9001, price: 1000 }]);
            };
        });
        await page.locator('#fg5m-buy-checkbox').check();
        await page.locator('#gallery-start').click();
        await page.waitForFunction(() => __fodderGalleryRetry5m.status().phase === 'waiting');
        assert.equal(await page.evaluate(() => __mockRuns.length), 6);
        // The clock also advances between protocol calls; keep a one-second margin.
        await page.clock.fastForward(299000);
        assert.equal(await page.evaluate(() => __mockRuns.length), 6);
        await page.evaluate(() => { window.__mockOutcome = 'ok'; });
        await page.clock.fastForward(2000);
        await page.waitForFunction(() => __fodderGalleryRetry5m.status().phase === 'idle');
        assert.equal(await page.evaluate(() => __mockRuns.length), 7);
        assert.equal(await page.evaluate(() => __fodder.gallery.run.bought), 1);
        console.log('PASS original Gallery checkbox: missed cards wait a full 5 minutes, then bought cards leave the retry list');
        await page.screenshot({ path: path.join(root, '.git/three-script-browser.png') });
        assert.deepEqual(errors, []);
    } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
