/* Inside FSU's futweb closure. No listing, buying, bidding, discarding or SBC submission. */
events.highValueScope = () => {
    const persona = services.User.getUser()?.getSelectedPersona?.();
    const platform = persona?.isPC || [GameSku.PC, GameSku.STEAM].includes(persona?.sku) ? 'pc'
        : persona?.isXbox || persona?.isPlaystation ? 'ps' : null;
    if (!persona?.id || !persona.sku || !platform || Number(info.base.year) !== 27 || Number(APP_YEAR_SHORT) !== 27)
        throw new Error('FC27 账号或平台尚未就绪。');
    if (platform !== info.base.platform) throw new Error('账号平台正在切换，请刷新后再扫描。');
    return { platform, key: `27:${persona.id}:${persona.sku}:${platform}` };
};
events.highValueGet = url => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({ method: 'GET', url, timeout: 20000,
        onload: result => result.status === 200 ? resolve(result.responseText) : reject(new Error(`FUTBIN 读取失败（${result.status}）。`)),
        onerror: () => reject(new Error('FUTBIN 网络请求失败。')),
        ontimeout: () => reject(new Error('FUTBIN 请求超时。')) });
});
events.highValueBaselines = async platform => {
    try {
        const html = await events.highValueGet(FsuHighValue.source);
        const prices = FsuHighValue.parseCheapest(new DOMParser().parseFromString(html, 'text/html'), platform);
        return { source: FsuHighValue.source, year: 27, at: Date.now(), platforms: { [platform]: prices }, manual: false };
    } catch (error) {
        let saved;
        try { saved = JSON.parse(GM_getValue(FsuHighValue.snapshotKey, 'null')); } catch { /* invalid cache is unavailable */ }
        if (FsuHighValue.fresh(saved, platform)) return { ...saved, manual: true };
        throw new Error(`${error.message} 请打开 FUTBIN 页面完成验证，点击“同步最低价到 FSU”后返回 EA 再点一键添加。`);
    }
};
events.highValuePrices = (platform, check) => {
    const cache = new Map();
    let lastRead = 0;
    return async item => {
        const params = new URLSearchParams({ platform: platform === 'pc' ? 'PC' : 'PS', nation: item.nationId,
            league: item.leagueId, club: item.teamId, rating: `${item.rating}-${item.rating}`, sort: 'rating', order: 'desc' });
        const key = params.toString();
        if (!cache.has(key)) {
            const rows = [], seen = new Set();
            for (let page = 1; page <= 10; page++) {
                check();
                const delay = Math.max(0, lastRead + 500 - Date.now());
                if (delay) await new Promise(resolve => setTimeout(resolve, delay));
                check(); lastRead = Date.now();
                const raw = await events.highValueGet(`https://www.futbin.org/futbin/api/27/getFilteredPlayers?${key}&page=${page}`);
                check();
                const data = JSON.parse(raw);
                if (!Array.isArray(data.data)) throw new Error('FUTBIN 球员数据结构已改变。');
                if (!data.data.length) break;
                const signature = data.data.map(row => `${row.ID}:${row.resource_id}`).join('|');
                if (seen.has(signature)) break;
                seen.add(signature); rows.push(...data.data);
                // Do not infer the page size: stop only on an empty page or a repeated page.
                if (page === 10) throw new Error('FUTBIN 球员分页过多，无法确认完整版本。');
            }
            cache.set(key, { data: rows });
        }
        return FsuHighValue.exactPrice(cache.get(key), item.definitionId, item.rating, platform);
    };
};
events.highValueInventory = async (check, request) => {
    const stats = await request(() => services.Club.getStats());
    const count = stats.response?.stats?.find(row => row.type === 'players')?.count;
    if (!Number.isInteger(count) || count < 0) throw new Error('无法读取俱乐部球员总数。');
    const items = new Map();
    for (let offset = 0, page = 0; offset < count; page++) {
        if (page >= 500) throw new Error('俱乐部分页异常，扫描已停止。');
        check();
        const criteria = new UTSearchCriteriaDTO();
        Object.assign(criteria, { type: 'player', sortBy: 'ovr', sort: 'desc', count: 200, offset });
        const result = await request(() => services.Club.search(criteria)), batch = result.response?.items;
        if (!Array.isArray(batch) || !batch.length) throw new Error('俱乐部球员未完整载入，请重新扫描。');
        for (const item of batch) {
            if (!item?.id || items.has(String(item.id))) throw new Error('俱乐部库存发生变化，请重新扫描。');
            items.set(String(item.id), item);
        }
        offset += batch.length;
        if (result.response.retrievedAll === true) break;
    }
    if (items.size !== count) throw new Error('俱乐部球员数量发生变化，请重新扫描。');
    check(); return [...items.values()];
};
events.highValueObserve = create => new Promise((resolve, reject) => {
    const owner = {}; let observable, done = false;
    const finish = (error, result) => {
        if (done) return;
        done = true; clearTimeout(timer); observable?.unobserve(owner);
        error ? reject(error) : resolve(result);
    };
    const timer = setTimeout(() => finish(new Error('EA 请求超时，已停止；如正在移卡，请核对转会列表后重新扫描。')), 25000);
    try {
        observable = create();
        observable.observe(owner, (sender, result) => result?.success ? finish(null, result)
            : finish(new Error(`EA 请求失败（${result?.status ?? '未知状态'}），已停止。`)));
    } catch (error) { finish(error); }
});
events.highValueMount = view => {
    const section = view?.getSection(UTTransferSectionListViewModel.SECTION.AVAILABLE);
    const header = section?._header?.getRootElement(), addPlayer = section?._header?._actionButton?.getRootElement();
    if (!header || !addPlayer || !header.contains(addPlayer) || header.querySelector('.fsu-high-value-open')) return;
    const button = events.createButton(new UTStandardButtonControl(), '一键添加高价值球员', () => events.highValueOpen(), 'section-header-btn mini primary');
    const root = button.getRootElement();
    root.classList.add('fsu-high-value-open');
    root.title = '按默认规则自动查找高价值可交易球员并移入转会列表';
    Object.assign(root.style, { marginInlineStart: '6px', maxWidth: '100%', whiteSpace: 'normal' });
    addPlayer.after(root);
};
events.highValueOpen = async () => {
    if (info.run.highValue) return;
    document.querySelector('#fsu-high-value')?.remove();
    const panel = document.createElement('section'); panel.id = 'fsu-high-value';
    panel.setAttribute('aria-label', '高价值球员进度');
    panel.style.cssText = 'position:fixed;right:16px;bottom:16px;width:min(440px,calc(100vw - 32px));max-height:35vh;overflow:auto;z-index:10000;padding:14px;box-sizing:border-box;background:#202630;color:white;border:1px solid #596773;border-radius:8px;font:14px/1.5 sans-serif;box-shadow:0 6px 30px #0008;';
    const status = document.createElement('p'); status.setAttribute('role', 'status');
    status.style.cssText = 'margin:0 0 8px;font:inherit;'; status.textContent = '正在读取价格与俱乐部球员…'; panel.append(status);
    const stop = document.createElement('button'); stop.textContent = '停止'; stop.className = 'btn-standard mini';
    stop.style.cssText = 'width:auto;height:auto;padding:6px 16px;font:inherit;line-height:1.4;'; panel.append(stop);
    const link = document.createElement('a'); link.textContent = '打开 FUTBIN 同步最低价'; link.hidden = true;
    link.href = FsuHighValue.source; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = '#d7fa36'; panel.append(link);
    document.body.append(panel);
    let stopped = false, scope, data, active = new Set(), lastRequest = 0, acquired = false, moved = 0, skipped = 0;
    let protectedCount = 0, unknown = 0, missingBase = new Set();
    const locked = () => new Set(info.lock.map(String));
    stop.onclick = () => { stopped = true; stop.disabled = true; status.textContent = '正在停止，已发送的请求完成后不再继续。'; };
    const check = () => {
        events.smartSbcCheckIdle(true);
        if (info.run.smartSbc || info.base.savesquad) throw new Error('请先停止智能 SBC / 阵容保存任务。');
        if (stopped || !panel.isConnected) throw new Error('任务已停止。');
        if (scope && events.highValueScope().key !== scope.key) throw new Error('账号或平台已改变，请重新点击一键添加。');
        if (services.User.getUser()?.tradeAccess !== TradeAccessLevel.ALLOWED) throw new Error('当前账号没有转会市场访问权限。');
    };
    const request = async create => {
        check();
        const delay = Math.max(0, lastRequest + 5000 - Date.now());
        if (delay) await new Promise(resolve => setTimeout(resolve, delay));
        check();
        try { const result = await events.highValueObserve(create); check(); return result; }
        finally { lastRequest = Date.now(); }
    };
    const readActive = async () => {
        const summary = (await request(() => services.Squad.requestSquadList())).data;
        // EA uses 0 for an active squad too; falsy is not the same as a missing ID.
        if (!Number.isInteger(summary?.activeSquadId) || summary.activeSquadId < 0) throw new Error('无法核对当前阵容。');
        const squad = (await request(() => services.Squad.requestSquadById(summary.activeSquadId))).data?.squad;
        if (!squad?.getPlayers) throw new Error('无法核对当前阵容球员。');
        active = new Set(squad.getPlayers().map(slot => String(slot.getItem()?.id)));
    };
    const transfers = async () => {
        const result = await request(() => services.Item.requestTransferItems());
        if (!Array.isArray(result.response?.items)) throw new Error('无法核对转会列表。');
        return result.response.items;
    };
    const recordKey = () => `fsuHighValueMove.v1.${scope.key}`;
    const reconcile = async () => {
        const record = JSON.parse(GM_getValue(recordKey(), 'null'));
        if (!record) return;
        const found = (await transfers()).find(item => String(item.id) === record.id && Number(item.definitionId) === record.definitionId);
        if (!found) {
            const club = await events.highValueInventory(check, request);
            if (!club.some(item => String(item.id) === record.id && Number(item.definitionId) === record.definitionId && item.pile === ItemPile.CLUB))
                throw new Error(`上次移卡结果待核对（卡 ${record.id}），请刷新并检查俱乐部和转会列表；不会自动重试。`);
        }
        GM_setValue(recordKey(), 'null');
    };
    try {
        check(); scope = events.highValueScope(); info.run.highValue = true; acquired = true;
        if (!navigator.locks?.request) throw new Error('浏览器不支持转会任务单实例锁。');
        await navigator.locks.request(`fsu-auto-bid:${scope.key}`, { ifAvailable: true }, async lease => {
            if (!lease) throw new Error('其他转会任务正在运行，请先停止。');
            status.textContent = '读取 FUTBIN 同分最低价…'; data = await events.highValueBaselines(scope.platform); check();
            await reconcile(); await readActive();
            status.textContent = '读取俱乐部全部球员…';
            const inventory = await events.highValueInventory(check, request), candidates = inventory.filter(FsuHighValue.tradable);
            const getPrice = events.highValuePrices(scope.platform, check), rows = [];
            for (let i = 0; i < candidates.length; i++) {
                check(); status.textContent = `正在查价 ${i + 1} / ${candidates.length}，随后自动移入…`;
                const item = candidates[i];
                if (FsuHighValue.protection(item, locked(), active)) { protectedCount++; continue; }
                if (!data.platforms[scope.platform][Math.max(81, item.rating)]) { missingBase.add(Math.max(81, item.rating)); continue; }
                const price = await getPrice(item); check();
                const assessment = FsuHighValue.assess(item.rating, price, data.platforms[scope.platform]);
                if (!assessment) { unknown++; continue; }
                if (assessment.high) rows.push({ ...assessment, item, name: item.getStaticData()?.name || `球员 ${item.definitionId}` });
            }
            if (!FsuHighValue.fresh(data, scope.platform)) throw new Error('扫描期间基准价已超过 15 分钟，请重新点击入口。');
            rows.sort((a, b) => b.premium - a.premium);
            if (!rows.length) return;
            status.textContent = `找到 ${rows.length} 张，正在复核库存并自动移入…`;
            await readActive();
            const fresh = new Map((await events.highValueInventory(check, request)).map(item => [String(item.id), item]));
            let current = await transfers();
            for (const row of rows) {
                check();
                if (!FsuHighValue.fresh(data, scope.platform)) throw new Error('基准价已超过 15 分钟，请重新点击一键添加。');
                const item = fresh.get(String(row.item.id));
                if (!item || item.pile !== ItemPile.CLUB || Number(item.definitionId) !== Number(row.item.definitionId) ||
                    !FsuHighValue.tradable(item) || FsuHighValue.protection(item, locked(), active)) { skipped++; continue; }
                const capacity = repositories.Item.getPileSize(ItemPile.TRANSFER);
                if (!Number.isInteger(capacity) || current.length >= capacity) throw new Error('转会列表已满或容量未知，请腾出位置后重新点击一键添加。');
                status.textContent = `已移入 ${moved} 张，正在移入 ${row.name}…`;
                // Record intent immediately before the mutation, after the pacing wait and final checks.
                await request(() => {
                    if (!FsuHighValue.fresh(data, scope.platform)) throw new Error('基准价已过期，请重新点击一键添加。');
                    if (!FsuHighValue.tradable(item) || FsuHighValue.protection(item, locked(), active)) throw new Error('球员保护状态已改变，请重新点击一键添加。');
                    GM_setValue(recordKey(), JSON.stringify({ id: String(item.id), definitionId: Number(item.definitionId) }));
                    return services.Item.move([item], ItemPile.TRANSFER);
                });
                current = await transfers();
                const confirmed = current.some(card => String(card.id) === String(item.id) && Number(card.definitionId) === Number(item.definitionId));
                if (!confirmed) throw new Error('移卡结果未能确认，请核对转会列表；已停止后续移卡。');
                GM_setValue(recordKey(), 'null'); moved++;
            }
        });
        status.textContent = `完成：已移入转会列表 ${moved} 张。跳过保护卡 ${protectedCount} 张、状态变化 ${skipped} 张、价格未知 ${unknown} 张${missingBase.size ? `；缺少 ${[...missingBase].join('、')} 分基准，已跳过` : ''}。${data.manual ? '（使用 FUTBIN 手动同步基准）' : ''}`;
    } catch (error) {
        status.textContent = `已确认移入 ${moved} 张。${error.message}`;
        link.hidden = !/FUTBIN/.test(error.message);
    } finally {
        if (acquired) info.run.highValue = false;
        stop.hidden = true;
    }
};
