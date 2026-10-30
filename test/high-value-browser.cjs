const assert = require('node:assert/strict');
const sample = [
    [101, 83, 1600], [102, 83, 1500], [103, 83, 9000], [104, 70, 1200], [105, 70, 1100],
    [1000106, 83, 1800], [106, 83, 9000], [107, 83, 1800], [108, 83, 1900], [109, 83, 2000],
    [110, 83, 9000], [111, 83, 0], [112, 84, 9000], [114, 65, 1150], [115, 70, 2000]
];
const cheapestHTML = '<h1>EA FC 27 Cheapest Players</h1>' + ['pc', 'ps'].flatMap(platform => [[81, 650], [83, 1000], [85, 2200]].map(([rating, price]) =>
    `<div class="stc-player-column hide-not-${platform}"><div class="stc-rating">${rating}</div>` +
    [price + 100, price].map(p => `<a class="stc-player-wrapper hide-not-${platform}" href="/27/player/1/p"><span class="price-segment">${platform === 'pc' ? p : p * 2}</span><span class="item-score-segment">1</span></a>`).join('') + '</div>')).join('');
function publicBody(url) {
    const u = new URL(url);
    if (u.pathname === '/27/squad-building-challenges/cheapest') return cheapestHTML;
    if (u.pathname.includes('getFilteredPlayers')) {
        const rating = Number(u.searchParams.get('rating').split('-')[0]);
        return JSON.stringify({ data: Number(u.searchParams.get('page')) > 1 ? [] : sample.filter(row => row[1] === rating)
            .map(([id, rating, price]) => ({ ID: id, resource_id: id, rating, pc_LCPrice: price, ps_LCPrice: price * 2 })) });
    }
}
async function run(page) {
    await page.clock.install();
    const parser = await page.evaluate(({ core, html }) => {
        const h = new Function(core + ';return FsuHighValue;')();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let blocked = false;
        try { h.parseCheapest(new DOMParser().parseFromString('<h1>Verify you are human</h1>', 'text/html'), 'pc'); }
        catch { blocked = true; }
        return { pc: h.parseCheapest(doc, 'pc'), ps: h.parseCheapest(doc, 'ps'), blocked };
    }, { core: require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/high-value-core.js'), 'utf8'), html: cheapestHTML });
    assert.equal(parser.pc[81], 650); assert.equal(parser.ps[81], 1300); assert.equal(parser.pc[85], 2200); assert.equal(parser.blocked, true);
    const settle = async () => {
        for (let i = 0; i < 100; i++) {
            if (!(await page.evaluate(() => !!info.run.highValue))) return;
            await page.clock.fastForward(5000); await page.waitForTimeout(10);
        }
        throw new Error('High-value flow did not settle: ' + await page.locator('#fsu-high-value [role=status]').innerText());
    };
    const setup = async (mode = 'ok', start = true) => {
        await page.evaluate(mode => {
            document.querySelector('#fsu-high-value')?.remove();
            const response = data => ({ observe(owner, cb) { cb(this, { success: true, ...data }); }, unobserve() {} });
            window.__hvOriginalUserGet ||= services.User.getUser; services.User.getUser = __hvOriginalUserGet;
            window.__hv = { mode, moves: [], reads: [], transfers: [], capacity: mode === 'full' ? 0 : mode === 'partial-full' ? 1 : 20, stats: 0, squadReads: 0, squadIds: [] };
            info.base.year = 27; info.base.platform = 'pc';
            info.lock = [107];
            window.__inventory = [mockPlayer(101, { rating: 83 }), mockPlayer(102, { rating: 83 }), mockPlayer(103, { rating: 83, untradeableCount: 1 }),
                mockPlayer(104, { rating: 70 }), mockPlayer(105, { rating: 70 }), mockPlayer(106, { definitionId: 1000106, rating: 83 }),
                mockPlayer(107, { rating: 83 }), mockPlayer(108, { rating: 83 }), mockPlayer(109, { rating: 83, upgrades: {} }),
                mockPlayer(110, { rating: 83, tradable: false }), mockPlayer(111, { rating: 83 }), mockPlayer(112, { rating: 84 }),
                mockPlayer(114, { rating: 65 }), mockPlayer(115, { rating: 70, loans: 5 })];
            ItemPile.TRANSFER = 5;
            services.Squad.requestSquadList = () => { __hv.squadReads++; return response({ data: { activeSquadId: mode === 'active-missing' ? undefined : 0 } }); };
            services.Squad.requestSquadById = id => {
                __hv.squadIds.push(id);
                return response({ data: { squad: mockSquad([__inventory.find(p => p.id === 108),
                    ...(__hv.mode === 'new-active' && __hv.squadReads > 1 ? [__inventory.find(p => p.id === 101)] : [])]) } });
            };
            services.Club.getStats = () => {
                __hv.stats++; __hv.reads.push(Date.now());
                if (__hv.mode === 'new-lock' && __hv.stats > 1) info.lock.push(101, 104, 106);
                return response({ response: { stats: [{ type: 'players', count: __inventory.length }] } });
            };
            services.Club.search = c => {
                __hv.reads.push(Date.now());
                if (__hv.mode === 'account') { const get = __hvOriginalUserGet; services.User.getUser = () => ({ ...get(), getSelectedPersona: () => ({ ...get().getSelectedPersona(), id: 99 }) }); }
                if (__hv.mode === 'platform') info.base.platform = 'ps';
                return response({ response: { items: __inventory.slice(c.offset, c.offset + 3), retrievedAll: c.offset + 3 >= __inventory.length } });
            };
            services.Item.requestTransferItems = () => { __hv.reads.push(Date.now()); return response({ response: { items: __hv.transfers } }); };
            services.Item.move = (items, pile) => {
                if (pile !== ItemPile.TRANSFER || items.length !== 1 || !items[0].tradable || items[0].untradeableCount) throw new Error('Invalid move');
                const item = items[0]; __hv.moves.push({ id: item.id, def: item.definitionId, at: Date.now() });
                __hv.intent = JSON.parse(GM_getValue('fsuHighValueMove.v1.27:12:pc27:pc', 'null'));
                if (__hv.mode === 'fail') return { observe(owner, cb) { cb(this, { success: false, status: 500 }); }, unobserve() {} };
                if (__hv.mode === 'timeout') return { observe() {}, unobserve() {} };
                if (__hv.mode === 'held-move') return {
                    observe(owner, cb) { __hv.finishMove = () => {
                        __inventory = __inventory.filter(p => p.id !== item.id); item.pile = ItemPile.TRANSFER; __hv.transfers.push(item);
                        cb(this, { success: true });
                    }; }, unobserve() { __hv.moveDetached = (__hv.moveDetached || 0) + 1; }
                };
                __inventory = __inventory.filter(p => p.id !== item.id); item.pile = ItemPile.TRANSFER;
                if (__hv.mode !== 'unconfirmed') __hv.transfers.push(item);
                return response({});
            };
            services.Item.list = () => { throw new Error('High-value flow must never list players'); };
            repositories.Item.getPileSize = () => __hv.capacity;
            repositories.Item.club.items = { values: () => __inventory };
            window.__hvOriginalBaselines ||= events.highValueBaselines;
            events.highValueBaselines = async (platform, signal) => {
                const data = await __hvOriginalBaselines(platform, signal);
                return __hv.mode === 'stale' ? { ...data, at: Date.now() - 900001 } : data;
            };
            const view = new UTClubHubView(); view.__root = document.createElement('div'); view.addTileStats = () => {};
            const grid = document.createElement('div'); grid.className = 'grid'; view.getRootElement().append(grid);
            document.querySelector('#hv-club-fixture')?.remove(); const host = document.createElement('div'); host.id = 'hv-club-fixture'; host.append(view.getRootElement()); document.body.append(host);
            const prior = services.Configuration.checkFeatureEnabled; services.Configuration.checkFeatureEnabled = () => false;
            view.clearTileContent(); view.clearTileContent(); services.Configuration.checkFeatureEnabled = prior;
            if (view.getRootElement().querySelector('.fsu-high-value-open')) throw new Error('High-value action must not appear on the club home');
            window.UTTransferSectionListViewModel = { SECTION: { UNSOLD: 'unsold', AVAILABLE: 'available' } };
            document.querySelector('#hv-transfer-fixture')?.remove();
            const transferRoot = document.createElement('div'); transferRoot.id = 'hv-transfer-fixture'; document.body.append(transferRoot);
            transferRoot.style.cssText = 'max-width:650px;';
            const transfer = new UTTransferListViewController();
            let sections;
            transfer._view = { getSection: key => sections[key] };
            const renderHeader = () => {
                const header = document.createElement('header'); header.className = 'ut-section-header-view';
                header.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;padding:16px;box-sizing:border-box;gap:4px;';
                const title = document.createElement('h2'); title.textContent = '可用球员'; title.style.cssText = 'flex:1;overflow:hidden;white-space:nowrap;'; header.append(title);
                const add = new UTStandardButtonControl(); add.setText('添加球员'); header.append(add.getRootElement());
                window.__hv.addPlayer = 0; add.getRootElement().onclick = () => { __hv.addPlayer++; };
                transferRoot.replaceChildren(header);
                sections = { unsold: { listRows: [] }, available: { listRows: [], _header: { _actionButton: add, getRootElement: () => header } } };
            };
            renderHeader(); transfer._renderView(); transfer._renderView();
            if (transferRoot.querySelectorAll('.fsu-high-value-open').length !== 1) throw new Error('Duplicate action after repeated render');
            renderHeader(); transfer._renderView();
            if (sections.available._header._actionButton.getRootElement().nextElementSibling?.textContent !== '一键添加高价值球员') throw new Error('High-value action must follow Add Player');
        }, mode);
        assert.equal(await page.locator('.fsu-high-value-open').count(), 1);
        await page.getByRole('button', { name: '添加球员', exact: true }).click();
        assert.equal(await page.evaluate(() => __hv.addPlayer), 1);
        for (const width of [390, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            const bounds = await page.locator('.fsu-high-value-open').boundingBox();
            assert.ok(bounds.width > 0 && bounds.x >= 0 && bounds.x + bounds.width <= width);
        }
        assert.equal(await page.evaluate(() => __hv.reads.length + __hv.moves.length), 0);
        if (!start) return;
        await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
        assert.equal(await page.evaluate(() => {
            try { __fodder.mockFactory([{ resourceId: 9001, price: 1000 }]); return false; }
            catch (error) { return /高价值卡/.test(error.message); }
        }), true);
        const saves = await page.evaluate(() => __eaCalls.saves);
        await page.evaluate(() => events.smartSbcFill(__sbcController, __sbcController._fsu.smartSbcBtn));
        assert.equal(await page.evaluate(() => __eaCalls.saves), saves);
        await settle();
    };
    await setup();
    const status = page.locator('#fsu-high-value [role=status]');
    assert.match(await status.innerText(), /保护卡 4 张/);
    assert.match(await status.innerText(), /价格未知 1 张/);
    assert.match(await status.innerText(), /缺少 84 分基准/);
    assert.equal(await page.locator('#fsu-high-value input, #fsu-high-value table').count(), 0);
    assert.equal(await page.getByRole('dialog', { name: '高价值可交易卡' }).count(), 0);
    for (const [width, height] of [[390, 844], [1440, 1000]]) {
        await page.setViewportSize({ width, height });
        const bounds = await page.locator('#fsu-high-value').boundingBox();
        assert.ok(bounds.x >= 0 && bounds.width <= width && bounds.height <= height * 0.36);
    }
    await page.screenshot({ path: require('node:path').join(__dirname, '../.gstack/high-value-browser.png') });
    const moved = await page.evaluate(() => ({ moves: __hv.moves, intent: __hv.intent, squadIds: __hv.squadIds }));
    assert.deepEqual(moved.moves.map(row => row.id).sort(), [101, 104, 106]);
    assert.ok(moved.moves.some(row => row.def === 1000106)); assert.ok(moved.intent.id);
    assert.deepEqual(moved.squadIds, [0, 0], 'zero active squad ID must be read and rechecked before moving');
    for (let i = 1; i < moved.moves.length; i++) assert.ok(moved.moves[i].at - moved.moves[i - 1].at >= 5000);
    assert.match(await status.innerText(), /已移入转会列表 3 张/);
    console.log('PASS one click automatically scans and moves with default rule, no forms or confirmations; active squad ID 0, exact versions, tradeability and paced verification');
    assert.equal(await page.locator('#fsu-high-value').getByRole('button', { name: '关闭', exact: true }).count(), 1);
    await page.locator('#fsu-high-value').getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.locator('#fsu-high-value').count(), 0);

    // Reproduce a stop while the public price request has not returned at all.
    await setup('ok', false);
    await page.evaluate(() => {
        window.__hvSavedGM = GM_xmlhttpRequest;
        window.__hvAborts = 0;
        window.GM_xmlhttpRequest = options => {
            window.__hvHeld = options;
            return { abort() { window.__hvAborts++; options.onabort?.(); } };
        };
    });
    try {
        await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
        await page.getByRole('button', { name: '停止', exact: true }).click();
        assert.equal(await page.locator('#fsu-high-value').count(), 0, 'stop must immediately close the bottom-right panel');
        await page.waitForFunction(() => !info.run.highValue, undefined, { timeout: 2000 });
        assert.equal(await page.evaluate(() => __hvAborts), 1, 'stop must cancel the pending public GET');
        assert.equal(await page.evaluate(() => __hv.moves.length), 0);
    } finally {
        await page.evaluate(html => { GM_xmlhttpRequest = __hvSavedGM; __hvHeld?.onload({ status: 200, responseText: html }); }, cheapestHTML);
        await settle();
    }
    console.log('PASS stop cancels a held price request, closes the panel, releases the task and ignores late responses');

    const batchPricing = await page.evaluate(async () => {
        const original = events.highValueGet, calls = [];
        const items = Array.from({ length: 15 }, (_, i) => ({ definitionId: 5000 + i, rating: i < 10 ? 83 : 82,
            nationId: i + 1, leagueId: i + 2, teamId: i + 3 }));
        try {
            events.highValueGet = async url => {
                const p = new URL(url).searchParams; calls.push(Object.fromEntries(p));
                return JSON.stringify({ data: p.get('page') === '1' ? items.filter(card => card.rating === Number(p.get('rating').split('-')[0]))
                    .map(card => ({ resource_id: card.definitionId, rating: card.rating, pc_LCPrice: card.definitionId, ps_LCPrice: 1 })) : [] });
            };
            const get = events.highValuePrices('pc', () => {}, { items });
            const values = await Promise.all(items.map(get));
            return { calls, values };
        } finally { events.highValueGet = original; }
    });
    assert.equal(batchPricing.calls.length, 2, '10 different 83 cards and 5 different 82 cards share two quote pages');
    assert.deepEqual(batchPricing.values, Array.from({ length: 15 }, (_, i) => 5000 + i));
    assert.ok(batchPricing.calls.every(call => !('nation' in call) && !('club' in call) && !('league' in call)));
    const paginated = await page.evaluate(async () => {
        const original = events.highValueGet, pages = [];
        const items = [{ definitionId: 6001, rating: 83 }, { definitionId: 6002, rating: 83 }, { definitionId: 6003, rating: 83 }];
        try {
            events.highValueGet = async url => {
                const page = Number(new URL(url).searchParams.get('page')); pages.push(page);
                return JSON.stringify({ data: page === 1 ? [{ resource_id: 6001, rating: 83, pc_LCPrice: 1800 }]
                    : page === 2 ? [{ resource_id: 6002, rating: 83, pc_LCPrice: 2200 }, { resource_id: 6003, rating: 83, ps_LCPrice: 9000 }] : [] });
            };
            const get = events.highValuePrices('pc', () => {}, { items });
            return { prices: await Promise.all(items.map(get)), pages };
        } finally { events.highValueGet = original; }
    });
    assert.deepEqual(paginated, { prices: [1800, 2200, null], pages: [1, 2] });
    console.log('PASS 10×83 + 5×82 use two batch requests, with per-version/platform prices and bounded pagination');

    await setup('ok', false);
    await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
    await page.waitForFunction(() => __hv.squadReads === 1, undefined, { timeout: 3000 });
    const readsBeforeStop = await page.evaluate(() => __hv.squadIds.length);
    await page.getByRole('button', { name: '停止', exact: true }).click();
    await page.waitForFunction(() => !info.run.highValue, undefined, { timeout: 2000 });
    assert.equal(await page.locator('#fsu-high-value').count(), 0);
    await page.clock.fastForward(30000);
    assert.equal(await page.evaluate(() => __hv.squadIds.length), readsBeforeStop);
    assert.equal(await page.evaluate(() => __hv.moves.length), 0);
    console.log('PASS stop wakes the five-second EA pacing wait and schedules no later request');

    const readCancel = await page.evaluate(async () => {
        const controller = new AbortController(); let callback, detached = 0;
        const pending = events.highValueObserve(() => ({ observe(owner, cb) { callback = cb; }, unobserve() { detached++; } }), controller.signal)
            .then(() => 'unexpected success', error => error.message);
        controller.abort(); const message = await pending;
        callback(null, { success: true });
        return { message, detached };
    });
    assert.match(readCancel.message, /停止/); assert.equal(readCancel.detached, 1);

    await page.evaluate(() => {
        window.__hvSavedGM = GM_xmlhttpRequest; window.__hvDeadline = null; window.__hvTimeoutAborts = 0;
        window.GM_xmlhttpRequest = () => ({ abort() { __hvTimeoutAborts++; } });
        events.highValueGet('https://www.futbin.com/27/squad-building-challenges/cheapest')
            .then(() => { __hvDeadline = 'unexpected success'; }, error => { __hvDeadline = error.message; });
    });
    try {
        await page.clock.fastForward(20001);
        assert.match(await page.evaluate(() => __hvDeadline), /超时/);
        assert.equal(await page.evaluate(() => __hvTimeoutAborts), 1);
    } finally { await page.evaluate(() => { GM_xmlhttpRequest = __hvSavedGM; }); }

    await setup('held-move', false);
    await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
    for (let i = 0; i < 30 && !(await page.evaluate(() => !!__hv.finishMove)); i++) {
        await page.clock.fastForward(5000); await page.waitForTimeout(10);
    }
    assert.equal(await page.evaluate(() => __hv.moves.length), 1);
    await page.getByRole('button', { name: '停止', exact: true }).click();
    assert.equal(await page.locator('#fsu-high-value').count(), 0);
    assert.equal(await page.evaluate(() => info.run.highValue), true, 'a dispatched move retains task ownership until it responds');
    assert.equal(await page.evaluate(() => __hv.moveDetached || 0), 0, 'never cancel an already dispatched move observer');
    await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
    assert.equal(await page.evaluate(() => __hv.moves.length), 1);
    await page.evaluate(() => __hv.finishMove());
    await page.waitForFunction(() => !info.run.highValue, undefined, { timeout: 2000 });
    assert.equal(await page.evaluate(() => __hv.moves.length), 1);
    assert.equal(await page.evaluate(() => JSON.parse(GM_getValue('fsuHighValueMove.v1.27:12:pc27:pc')).id),
        String(await page.evaluate(() => __hv.moves[0].id)));
    console.log('PASS cancellable EA reads, independent GET deadline, completed-result close and stop during a dispatched move without duplicate or lost intent');

    for (const mode of ['full', 'fail', 'timeout', 'unconfirmed', 'new-lock', 'stop', 'stale', 'account', 'platform', 'lease', 'active-missing', 'partial-full', 'new-active']) {
        await page.evaluate(() => GM_setValue('fsuHighValueMove.v1.27:12:pc27:pc', 'null'));
        await setup(mode, false);
        if (mode === 'lease') await page.evaluate(() => { window.__hvLock = navigator.locks.request; navigator.locks.request = async (name, options, cb) => cb(null); });
        await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
        if (mode === 'stop') await page.getByRole('button', { name: '停止', exact: true }).click();
        else await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click();
        await settle();
        const count = await page.evaluate(() => __hv.moves.length);
        assert.equal(count, mode === 'new-active' ? 2 : ['fail', 'timeout', 'unconfirmed', 'partial-full'].includes(mode) ? 1 : 0,
            mode + ': ' + (await status.count() ? await status.innerText() : 'panel closed'));
        assert.equal(await page.evaluate(() => info.run.highValue), false);
        if (mode === 'lease') await page.evaluate(() => { navigator.locks.request = __hvLock; });
        if (mode === 'unconfirmed') {
            await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click(); await settle();
            assert.equal(await page.evaluate(() => __hv.moves.length), 1, 'unresolved physical item blocks every later move');
            assert.match(await status.innerText(), /上次移卡结果待核对/);
        }
    }
    console.log('PASS full list, changed protections, stop, stale prices, account/platform switch, instance lock, failure/timeout and durable unknown-result recovery');

    await page.evaluate(() => GM_setValue('fsuHighValueMove.v1.27:12:pc27:pc', 'null'));
    await setup('ok', false);
    const syncContext = await page.context().browser().newContext();
    const syncPage = await syncContext.newPage();
    try {
        await syncPage.route('**/*', route => route.fulfill({ contentType: 'text/html', body: cheapestHTML }));
        await syncPage.goto('https://www.futbin.com/27/squad-building-challenges/cheapest');
        await syncPage.clock.install({ time: await page.evaluate(() => Date.now()) });
        await syncPage.addScriptTag({ path: require.resolve('lodash/lodash.js') });
        await syncPage.evaluate(() => { window.unsafeWindow = window; window.GM_setValue = (key, value) => { window.__snapshot = value; }; });
        const installer = require('./helpers.cjs').read(require('../release.json').fsu.file);
        await syncPage.addScriptTag({ content: installer }); await syncPage.addScriptTag({ content: installer });
        assert.equal(await syncPage.locator('#fsu-high-value-sync').count(), 1);
        await syncPage.getByRole('button', { name: '同步最低价到 FSU', exact: true }).click();
        const snapshot = await syncPage.evaluate(() => __snapshot);
        await page.evaluate(snapshot => {
            GM_setValue('fsuHighValueBaselines.v1', snapshot);
            window.__hvOriginalGet = GM_xmlhttpRequest;
            window.GM_xmlhttpRequest = options => options.url.endsWith('/squad-building-challenges/cheapest')
                ? options.onload({ status: 403, responseText: 'Verify you are human' }) : __hvOriginalGet(options);
        }, snapshot);
        await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click(); await settle();
        assert.match(await status.innerText(), /FUTBIN 手动同步/);
        assert.equal(await page.evaluate(() => __hv.moves.length), 3);
        await page.clock.fastForward(900001);
        await page.getByRole('button', { name: '一键添加高价值球员', exact: true }).click(); await settle();
        assert.match(await status.innerText(), /同步最低价到 FSU/);
        assert.equal(await page.evaluate(() => __hv.moves.length), 3);
        await page.evaluate(() => { GM_xmlhttpRequest = __hvOriginalGet; });
        console.log('PASS PC/console coin-only parser, blocked page rejection, full-installer manual FUTBIN sync, duplicate guard, fallback and expiry');
    } finally { await syncContext.close(); }
    await page.evaluate(() => { document.querySelector('#fsu-high-value')?.remove(); GM_setValue('fsuHighValueMove.v1.27:12:pc27:pc', 'null'); });
}
module.exports = { run, publicBody, cheapestHTML };
