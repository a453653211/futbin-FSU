const assert = require('node:assert/strict');
const path = require('node:path');

// All services and the remote core are supplied by browser-check's offline fixtures.
async function run(page) {
    await page.evaluate(() => {
        document.querySelector('#mock-gallery-modal')?.remove();
        window.__mockOutcome = 'ok';
        const search = services.Item.searchConceptItems;
        services.Item.searchConceptItems = criteria => {
            const obs = search(criteria), observe = obs.observe;
            obs.observe = (owner, cb) => observe.call(obs, owner, (event, result) => {
                // EA concept entities may have no itemPriceLimits, even when an exact quote exists.
                for (const item of result.response.items) if (item.definitionId >= 9101 && item.definitionId <= 9107)
                    item.getPriceLimits = () => item.definitionId === 9105 ? { minimum: 0, maximum: 0 } : null;
                cb(event, result);
            });
            return obs;
        };
        window.__galleryBefore = { runs: __mockRuns.length, risk: __riskCalls,
            calls: { ...__eaCalls }, persona: services.User.getUser().getSelectedPersona().id };
    });
    await page.waitForFunction(() => !document.querySelector('#fg5m-buy-checkbox'));
    const picker = page.locator('#fgnew-picker-overlay');
    const card = id => picker.locator(`[data-fgnew-card="${id}"]`);
    const quantity = id => card(id).locator('..').locator('input');
    const ready = async id => page.waitForFunction(id => {
        const c = document.querySelector(`[data-fgnew-card="${id}"]`);
        return c && !c.disabled && !document.querySelector('.fgnew-gallery-set')?.disabled;
    }, id);
    await page.locator('#fgnew-gallery-tab').click();
    await page.waitForFunction(() => document.querySelector('[data-fgnew-card="9101"] .fgnew-card-price')?.textContent.includes('1,000') &&
        !document.querySelector('.fgnew-gallery-set')?.disabled);
    assert.equal(await card(9101).isDisabled(), false, 'an exact quote must remain selectable when EA concept price limits are null');
    await ready(9101);
    assert.match(await card(9101).innerText(), /已收藏.*仍可购买/);
    assert.equal(await card(9104).isDisabled(), true, 'no quote is not purchasable');
    assert.equal(await card(9105).isDisabled(), true, 'unmarketable reward is not purchasable');
    await card(9101).click(); await quantity(9101).fill('2'); await quantity(9101).press('Tab');
    await card(9103).click();
    await picker.locator('.fgnew-gallery-set').selectOption('team-b'); await ready(9102);
    assert.equal(await card(9103).getAttribute('aria-pressed'), 'true', 'same version in another team stays selected once');
    await card(9102).click();
    await picker.locator('.fgnew-gallery-category').selectOption('other'); await ready(9107);
    await card(9107).click();
    assert.match(await picker.locator('.fgnew-count').innerText(), /4 种.*5 张/);
    await picker.locator('.fgnew-review').click();
    assert.deepEqual(await picker.locator('[data-fgnew-card]').evaluateAll(nodes => nodes.map(n => Number(n.dataset.fgnewCard)).sort()), [9101, 9102, 9103, 9107]);
    assert.equal(await quantity(9101).inputValue(), '2');
    await page.screenshot({ path: path.join(__dirname, '../.gstack/gallery-free-buy.png') });
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
        await page.setViewportSize(viewport);
        const layout = await picker.locator('.fgnew-grid').evaluate(n => ({ width: n.clientWidth, scrollWidth: n.scrollWidth, height: n.clientHeight }));
        assert.ok(layout.height > 0 && layout.scrollWidth <= layout.width + 1, JSON.stringify(layout));
    }
    await picker.locator('.fgnew-mode-tabs').getByRole('button', { name: '最新卡', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.fgnew-select-visible').disabled);
    await picker.locator('.fgnew-mode-tabs').getByRole('button', { name: '自由选购', exact: true }).click();
    await ready(9107);
    assert.match(await picker.locator('.fgnew-count').innerText(), /4 种.*5 张/, 'source switching preserves a separate Gallery selection');
    await page.clock.fastForward(300001);
    await picker.locator('.fgnew-purchase').click();
    assert.equal(await page.locator('#fgnew-buy-overlay').count(), 0);
    assert.match(await picker.locator('.fgnew-message:not(.fgnew-bridge-status)').innerText(), /超过5分钟/);
    await picker.getByRole('button', { name: '刷新球队 / 价格', exact: true }).click(); await ready(9107);
    const quote = await page.evaluate(() => __mockGalleryQuotes.at(-1));
    assert.deepEqual(quote.ids.sort(), [9101, 9102, 9103, 9107]); assert.equal(quote.platform, 'pc');
    assert.equal(await page.evaluate(() => __mockRuns.length), await page.evaluate(() => __galleryBefore.runs), 'navigation and refresh never start buying');
    await picker.locator('.fgnew-purchase').click();
    const buy = page.locator('#fgnew-buy-overlay');
    assert.equal(await buy.locator('.fgnew-buy-row').count(), 4);
    await page.evaluate(() => { window.__consent = false; });
    await buy.getByRole('button', { name: '开始购买', exact: true }).click();
    await page.waitForFunction(() => __riskCalls === __galleryBefore.risk + 1 && !__fodderLatestCards.status().running);
    assert.equal(await page.evaluate(() => __mockRuns.length), await page.evaluate(() => __galleryBefore.runs));
    await page.evaluate(() => { window.__consent = true; });
    await buy.getByRole('button', { name: '开始购买', exact: true }).click();
    await page.waitForFunction(() => __mockRuns.length === __galleryBefore.runs + 1 && document.querySelector('.fgnew-phase').textContent.includes('等待'));
    const first = await page.evaluate(() => __mockRuns.at(-1));
    assert.deepEqual(first.targets.map(c => c.resourceId).sort(), [9101, 9102, 9103, 9107]);
    assert.deepEqual([first.options.leaveUnassigned, first.options.keepDuplicates], [true, true]);
    assert.deepEqual(first.prefs, { minPct: 60, maxPct: 90, tries: 2 });
    await page.clock.fastForward(300000);
    await page.waitForFunction(() => !__fodderLatestCards.status().running);
    assert.deepEqual(await page.evaluate(() => __mockRuns.at(-1).targets.map(t => t.resourceId)), [9101]);
    assert.match(await buy.locator('.fgnew-progress-count').innerText(), /5\s*\/\s*5/);
    assert.equal(await page.evaluate(() => __fodder.gallery.sets.get('clubs:team-a').cards.find(c => c.id === 9101).collected), true);
    assert.equal(await page.evaluate(() => __fodder.gallery.sets.get('clubs:team-b').cards.find(c => c.id === 9102).collected), false);
    await buy.getByRole('button', { name: '返回选卡', exact: true }).click();
    await card(9107).click(); await quantity(9107).fill('2'); await quantity(9107).press('Tab');
    await picker.getByRole('button', { name: '刷新球队 / 价格', exact: true }).click(); await ready(9107);
    await picker.locator('.fgnew-purchase').click();
    await buy.getByRole('button', { name: '开始购买', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.fgnew-phase').textContent.includes('等待'));
    const count = await page.evaluate(() => __mockRuns.length);
    await page.evaluate(() => { services.User.getUser().getSelectedPersona().id = 99; });
    await page.clock.fastForward(300000);
    await page.waitForFunction(() => !__fodderLatestCards.status().running);
    assert.equal(await page.evaluate(() => __mockRuns.length), count, 'account change must prevent a later buying round');
    assert.match(await buy.locator('.fgnew-run-info').innerText(), /账号或平台已改变/);
    await buy.getByRole('button', { name: '返回选卡', exact: true }).click();
    await picker.locator('.fgnew-mode-tabs').getByRole('button', { name: '收藏馆', exact: true }).click();
    await page.evaluate(() => { services.User.getUser().getSelectedPersona().id = __galleryBefore.persona; });
    console.log('PASS Gallery cross-team/category selections, historical ownership, exact-version deduplication, shared quantities/risk/5-minute retries, fresh quotes and account isolation');
}
module.exports = { run };
