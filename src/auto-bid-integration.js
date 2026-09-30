/* Uses the EA/FSU functions already loaded by the userscript. Never auto-starts. */
events.autoBidObserve = (create, timeoutMs = 20000) => new Promise((resolve, reject) => {
    const owner = {}; let observable, done = false;
    const finish = (error, result) => {
        if (done) return;
        done = true; clearTimeout(timer); observable?.unobserve(owner);
        error ? reject(error) : resolve(result);
    };
    const timer = setTimeout(() => {
        info.autoBidTainted = true;
        finish(Object.assign(new Error('请求超时；请刷新网页后核对已有竞拍'), { uncertain: true, fatal: true }));
    }, timeoutMs);
    try {
        observable = create();
        observable.observe(owner, (sender, result) => {
            if (result?.success) finish(null, result);
            else {
                const code = Number(result?.error?.code ?? result?.status);
                const names = ['CAPTCHA_REQUIRED', 'PERMISSION_DENIED', 'LOCKED_TRANSFER_MARKET',
                    'NO_USER', 'LOGGED_IN_ON_CONSOLE_LEGACY', 'SESSION_EXPIRED', 'NO_BID_TOKENS'];
                const restricted = names.some(name => typeof UtasErrorCode !== 'undefined' && UtasErrorCode[name] === code);
                finish(Object.assign(new Error(`EA 请求失败（${Number.isFinite(code) ? code : '未知状态'}）`),
                    { code, fatal: restricted || [401, 403, 429, 458, 459, 512, 521].includes(code) }));
            }
        });
    } catch (error) { finish(error); }
});

// FSU stores Object.values(searchCriteria) for its six recent searches.
// Rebuild against the current DTO shape and reject a mismatched upstream layout.
events.autoBidRecentSearches = () => {
    const template = new UTSearchCriteriaDTO(), keys = Object.keys(template);
    const saved = info.market?.mb;
    if (!Array.isArray(saved)) return [];
    return saved.slice(0, 6).map((values, index) => {
        if (!Array.isArray(values) || values.length !== keys.length) return null;
        const criteria = new UTSearchCriteriaDTO();
        keys.forEach((key, i) => { criteria[key] = values[i]; });
        const rawMaskedId = Number(criteria.maskedDefId);
        const maskedDefId = rawMaskedId & 0xffffff;
        const limit = Number(criteria.maxBuy);
        if (!Number.isSafeInteger(rawMaskedId) || rawMaskedId <= 0 || maskedDefId <= 0 ||
            !Array.isArray(criteria.defId) || criteria.defId.length ||
            !Number.isSafeInteger(limit) || limit < 150 || limit > 15000000 ||
            (criteria.minBuy && (!Number.isSafeInteger(criteria.minBuy) || criteria.minBuy > limit))) return null;
        const name = (repositories.Item.getStaticDataByDefId(rawMaskedId) ||
            repositories.Item.getStaticDataByDefId(maskedDefId))?.name || `球员 ${maskedDefId}`;
        return { index, maskedDefId, name, limit, criteria };
    });
};

events.autoBidAdapter = () => {
    let catalogJob;
    const scope = () => {
        // selectedPersona is a numeric ID; EA resolves its account/platform data via this getter.
        const persona = services.User.getUser()?.getSelectedPersona?.();
        if (!persona?.id || !persona?.sku || !info.base.year) throw Object.assign(new Error('账号信息尚未就绪'), { fatal: true });
        return `${info.base.year}:${persona.id}:${persona.sku}:${info.base.platform}`;
    };
    const storageKey = () => `fsuMarket.v2.${scope()}`;
    const checkedItems = result => {
        const items = result?.response?.items ?? result?.data?.items;
        if (!Array.isArray(items)) throw Object.assign(new Error('EA 返回的球员列表格式已改变'), { fatal: true });
        return items;
    };
    return {
        scope,
        session() {
            const session = services.Authentication.utasSession;
            // EA performs reauthentication itself; never copy or refresh tokens independently.
            if (session?.state === AuthenticationState.AUTHENTICATING) return null;
            if (!session?.id || session.isAuthenticated?.() !== true)
                throw Object.assign(new Error('登录会话已失效，请重新登录后继续'), { fatal: true });
            return session.id;
        },
        check() {
            if (info.autoBidTainted) throw Object.assign(new Error('上次请求结果不确定，请刷新网页后继续'), { fatal: true });
            if (Number(info.base.year) !== 27 || Number(APP_YEAR_SHORT) !== 27) throw Object.assign(new Error('赛季必须是 FC27，请刷新网页'), { fatal: true });
            const personaSku = services.User.getUser()?.getSelectedPersona?.()?.sku;
            if (info.base.platform !== 'pc' || (personaSku !== GameSku.PC && personaSku !== GameSku.STEAM))
                throw Object.assign(new Error('本功能只使用 FC27 PC（含 Steam）市场；账号平台与 PC 市场不一致'), { fatal: true });
            if (services.User.getUser()?.tradeAccess !== TradeAccessLevel.ALLOWED)
                throw Object.assign(new Error('当前账号没有转会市场访问权限'), { fatal: true });
            for (const name of ['searchConceptItems', 'searchTransferMarket', 'bid', 'requestWatchedItems'])
                if (typeof services.Item[name] !== 'function') throw Object.assign(new Error(`客户端缺少 ${name}`), { fatal: true });
            if (typeof services.Item.transfersDao?.getAuctionData !== 'function')
                throw Object.assign(new Error('当前客户端不支持拍卖状态读取'), { fatal: true });
            if (typeof services.Item.itemDao?.searchTransferMarket !== 'function')
                throw Object.assign(new Error('当前客户端不支持市场分页读取'), { fatal: true });
        },
        player(item) {
            return { defId: Number(item.definitionId), rating: Number(item.rating), position: item.preferredPosition,
                leagueId: Number(item.leagueId),
                gk: PlayerPosition.GK, player: item.isPlayer?.() === true, gold: item.isGoldRating?.() === true,
                special: item.isSpecial?.() !== false, name: item.getStaticData?.()?.name || `球员 ${item.definitionId}`,
                minimum: Number(item.getPriceLimits?.()?.minimum || 0) };
        },
        auction(item) {
            const a = item.getAuctionData();
            return { tradeId: String(a.tradeId), seconds: a.getSecondsRemaining(), current: a.currentBid,
                start: a.startingBid, buy: a.buyNowPrice, valid: a.isValid(), owner: a.tradeOwner,
                active: a.isActiveTrade(), closed: a.isClosedTrade(), expired: a.isExpired(),
                highest: a.isHighestBid(), outbid: a.isOutbid(), won: a.isWon(), stale: a.isStale(),
                minimum: Number(item.getPriceLimits?.()?.minimum || 0) };
        },
        next: value => UTCurrencyInputControl.getIncrementAboveVal(value),
        floor: value => FsuAutoBid.floorPrice(value, UTCurrencyInputControl.PRICE_TIERS),
        canBid: (item, amount, coins) => item.getAuctionData().canBid(amount, coins),
        canBuy: (item, coins) => item.getAuctionData().canBuy(coins),
        coins: () => services.User.getUser().getCurrency(GameCurrency.COINS).amount,
        currencies: () => events.autoBidObserve(() => services.User.requestCurrencies()),
        async discover(offset) {
            const criteria = new UTSearchCriteriaDTO();
            criteria.type = SearchType.PLAYER; criteria.level = SearchLevel.GOLD;
            criteria.count = 200; criteria.offset = offset;
            // FC27 /defid rejects the native non-GK zone (type=playernonGK) with 400.
            // Keep type=player; the scheduler filters both position and rating locally.
            const result = await events.autoBidObserve(() => services.Item.searchConceptItems(criteria));
            return { items: checkedItems(result), end: result.response?.endOfList === true };
        },
        async search(row, cap, kind, page = 1) {
            const criteria = new UTSearchCriteriaDTO();
            if (row.criteria) {
                if (kind !== 'buy' || cap > row.limit || row.criteria.maxBuy !== row.limit)
                    throw new Error('最近搜索的价格条件已改变');
                Object.assign(criteria, row.criteria);
            } else {
                criteria.type = SearchType.PLAYER; criteria.category = SearchCategory.ANY;
                criteria.defId = [row.defId];
            }
            criteria.count = 20; criteria.offset = (page - 1) * criteria.count;
            if (kind === 'buy') criteria.maxBuy = cap;
            else if (kind === 'bid') criteria.maxBid = cap;
            else throw new Error('未知交易搜索模式');
            // The service layer can issue extra player-metadata/currency requests. This
            // verified DAO performs one HTTP read and parses auction items directly.
            const items = checkedItems(await events.autoBidObserve(() => services.Item.itemDao.searchTransferMarket(criteria)));
            return { items, end: items.length < criteria.count };
        },
        async refresh(items) {
            // refreshAuctions() also starts a currency request inside its callback. Use its existing
            // DAO/parser here and schedule currency refreshes separately to preserve the 2-second gap.
            const result = await events.autoBidObserve(() => services.Item.transfersDao.getAuctionData(items));
            const updated = checkedItems(result), found = new Map(updated.map(p => [String(p.getAuctionData().tradeId), p]));
            const ids = [];
            for (const item of items) {
                const a = item.getAuctionData(), fresh = found.get(String(a.tradeId));
                if (!fresh) continue;
                if (fresh.getAuctionData().currentBid < a.currentBid) { a.isUpdating = false; continue; }
                a.update(fresh.getAuctionData());
                if (fresh.id) item.id = fresh.id;
                item.duplicateId = fresh.duplicateId;
                if (a.isWon()) item.pile = ItemPile.INBOX;
                ids.push(String(a.tradeId));
            }
            return ids;
        },
        async watched() {
            repositories.Item.setDirty(ItemPile.INBOX);
            return checkedItems(await events.autoBidObserve(() => services.Item.requestWatchedItems()));
        },
        bid: (item, amount) => events.autoBidObserve(() => services.Item.bid(item, amount)),
        buy: (item, amount) => events.autoBidObserve(() => services.Item.bid(item, amount)),
        // Preserve the original account's record even if logout/account switching triggered the pause.
        save: data => GM_setValue(`fsuMarket.v2.${data.scope}`, JSON.stringify(data)),
        load() {
            try { return JSON.parse(GM_getValue(storageKey(), GM_getValue(`fsuAutoBid.v1.${scope()}`, '{}'))); } catch { return null; }
        },
        loadCatalog(kind = 'catalog') {
            try { return JSON.parse(GM_getValue(`fsuMarket.${kind === 'gallery' ? 'galleryCatalog.v2' : 'catalog.v1'}.${scope()}`, 'null')); } catch { return null; }
        },
        saveCatalog: data => GM_setValue(`fsuMarket.${data.kind === 'gallery' ? 'galleryCatalog.v2' : 'catalog.v1'}.${data.scope}`, JSON.stringify(data)),
        loadOwned() {
            return JSON.parse(GM_getValue(`fsuMarket.galleryOwned.v1.${scope()}`,
                JSON.stringify({ version: 1, scope: scope(), rows: [] })));
        },
        saveOwned: data => GM_setValue(`fsuMarket.galleryOwned.v1.${data.scope}`, JSON.stringify(data)),
        catalogPage: (page, kind = 'catalog') => {
            if (page === 1) catalogJob = new FsuFutbinSource.Refresh(FsuFutbinSource.requestGM(GM_xmlhttpRequest), { kind });
            if (!catalogJob) throw new Error('FUTBIN 刷新状态丢失，请重新启动');
            return catalogJob.next(page);
        }
    };
};

events.mountAutoBid = view => {
    const root = view.getRootElement();
    if (root.querySelector('.fsu-auto-bid')) return;
    const panel = document.createElement('section'); panel.className = 'fsu-auto-bid';
    panel.style.cssText = 'box-sizing:border-box;width:100%;padding:16px;margin:10px 0;background:#202630;color:#f4f4f4;border:1px solid #627b3e;border-radius:8px;line-height:1.5;';
    const add = (tag, text, parent = panel) => {
        const node = document.createElement(tag); node.textContent = text; parent.appendChild(node); return node;
    };
    add('h2', '市场购买 · FC27 PC');
    add('h3', '按最近搜索买一张');
    add('p', '先在转会市场搜索球员并设置“一口价最高价”，再回到这里选择最近的一条搜索。按该条完整条件查询，买到一张后自动结束。');
    const historySelect = add('select', '');
    historySelect.style.cssText = 'display:block;box-sizing:border-box;width:100%;max-width:620px;margin:8px 0;padding:8px;background:#303947;color:white;border:1px solid #748391;border-radius:4px;';
    add('p', '最高一口价是包含该金额的硬上限；没有设置上限的历史记录不能启动。不使用 FUTBIN 报价、87+ 或 70% 条件。');
    add('h3', '参考名单模式');
    add('p', '87+ 基础金卡 · 排除门将 · PC 最低参考价 ≥40,000 · 买入价严格低于参考价 70%');
    add('p', '竞拍关注 60 秒内挂牌；一口价按逐卡价格条件分页搜索，不限制剩余时间。');
    add('p', '先按当前可用金币筛选：最高买入价超过余额的卡不查询；余额变化后重新筛选。');
    add('p', '请求至少间隔 2 秒；参考名单模式执行 10 分钟 / 休息 5 分钟，金币不足 1,000 停手。');
    add('h3', '收藏馆补卡模式');
    add('p', '英超 / Barclays WSL / 西甲 / Liga F 的 85+ 基础金卡，包含门将；无 40,000 参考价门槛。竞拍和一口价都严格低于 FUTBIN PC 参考价 70%，每小时完整刷新。每个确切球员版本最多买一张。');
    add('p', '本地已收录表只记录本脚本确认成交或你手动补录的卡，不会自动知道安装前已进过收藏馆的球员。请先补录已有卡的版本 ID。');
    const ownedInput = add('textarea', '');
    ownedInput.placeholder = '已收录版本 ID，逗号或换行分隔'; ownedInput.rows = 2;
    ownedInput.style.cssText = 'display:block;box-sizing:border-box;width:100%;max-width:620px;margin:8px 0;padding:8px;background:#303947;color:white;border:1px solid #748391;border-radius:4px;';
    const ownedActions = add('div', ''); ownedActions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const ownedStatus = add('p', '本地收藏记录尚未读取');
    const ownedDetails = add('details', ''); add('summary', '查看本地已收录表', ownedDetails);
    const ownedRows = add('div', '', ownedDetails); ownedRows.style.cssText = 'overflow:auto;max-height:300px;';
    const status = add('p', '尚未启动'), stats = add('p', ''), actions = add('div', '');
    actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const settings = add('label', '参考名单更新间隔：');
    const frequency = add('select', '', settings);
    [1, 2].forEach(hours => { const opt = add('option', `${hours} 小时`, frequency); opt.value = String(hours); });
    frequency.style.cssText = 'margin:12px 8px;padding:6px;background:#303947;color:white;border:1px solid #748391;border-radius:4px;';
    const catalogStatus = add('p', '尚无本地参考名单');
    const catalogDetails = add('details', ''); add('summary', '当前模式完整名单与逐卡 PC 参考价', catalogDetails);
    const catalogRows = add('div', '', catalogDetails); catalogRows.style.cssText = 'overflow:auto;max-height:420px;';
    add('p', 'FUTBIN 是第三方参考价。源报价时间按原文显示（时区未注明）；缓存按完整抓取时间计时。', catalogDetails);
    add('p', '运行时每 1/2 小时完整更新；暂停、停止或关闭网页期间不更新，继续时先校验过期数据。');
    add('p', '搜索逐卡、逐页轮询，市场随时变化，不保证瞬间覆盖全部挂牌或抢到每个机会。');
    const details = add('details', ''); add('summary', '关注中的拍卖与运行记录', details);
    const rows = add('div', '', details), logs = add('pre', '', details);
    logs.style.cssText = 'max-height:220px;overflow:auto;white-space:pre-wrap;font-size:12px;';
    add('p', '离开转会中心会暂停。已提交竞价或购买无法撤回；成交卡在转会目标中领取。');
    root.prepend(panel);

    let runtime = info.autoBid;
    if (!runtime) {
        const adapter = events.autoBidAdapter();
        runtime = info.autoBid = { adapter, runner: new FsuAutoBid.Runner(adapter), release: null, starting: false, timer: null };
    }
    runtime.panel = panel;
    const runner = runtime.runner;
    let displayedCatalog = null;
    let historyStamp = null;
    const refreshHistory = () => {
        if (historyStamp === info.market?.ts) return;
        const previous = historySelect.value;
        historySelect.replaceChildren();
        const placeholder = add('option', '选择最近搜索条件', historySelect); placeholder.value = '';
        events.autoBidRecentSearches().forEach((row, index) => {
            const option = add('option', row ? `第 ${index + 1} 条 · ${row.name} · 一口价 ${row.criteria.minBuy || '不限'}–${row.limit.toLocaleString()}` :
                `第 ${index + 1} 条 · 条件无效或未设一口价上限`, historySelect);
            option.value = String(index);
            option.disabled = !row;
        });
        historySelect.value = [...historySelect.options].some(o => o.value === previous) ? previous : '';
        historyStamp = info.market?.ts;
    };
    historySelect.onfocus = refreshHistory;
    historySelect.onpointerdown = refreshHistory;
    try {
        runtime.displayCatalog = runtime.adapter.loadCatalog();
        runtime.displayGallery = runtime.adapter.loadCatalog('gallery');
        runner.scope = runtime.adapter.scope(); runner.loadOwned();
        runner.setRefreshHours(Number(GM_getValue(`fsuMarket.hours.${runtime.adapter.scope()}`, 1)) === 2 ? 2 : 1);
    } catch { /* Login may still be loading; startup gives the actionable error. */ }
    frequency.value = String(runner.c.priceTtlMs / FsuMarketCatalog.HOUR);
    frequency.onchange = () => {
        runner.setRefreshHours(Number(frequency.value));
        try { GM_setValue(`fsuMarket.hours.${runtime.adapter.scope()}`, Number(frequency.value)); }
        catch (error) { runner.pause(error.message); }
    };
    const stateNames = { watching: '关注中', leading: '当前领先', bid: '准备出价', submitting: '提交中',
        confirming: '等待确认', settling: '等待结算', 'price-needed': '需更新参考价', 'refresh-needed': '需刷新',
        buy: '准备一口价', monitoring: '仅核对结果', funds: '金币不足', won: '已成交', lost: '未成交', skipped: '已放弃', unresolved: '需手动核对' };
    const render = () => {
        refreshHistory();
        const resting = runner.mode === 'rest';
        status.textContent = `${runner.message}${resting ? ` · 剩余 ${Math.ceil(Math.max(0, runner.restUntil - Date.now()) / 1000)} 秒` : ''}`;
        stats.textContent = `候选 ${runner.players.length} · 关注 ${runner.active().length} · 竞价提交 ${runner.stats.bids} · 一口价提交 ${runner.stats.buys} · 已确认成交 ${runner.stats.won} · ${runner.stats.spent.toLocaleString()} 金币`;
        const galleryMode = runner.strategy === 'gallery';
        const cached = galleryMode ? (runner.catalog?.kind === 'gallery' ? runner.catalog : runtime.displayGallery) :
            (runner.catalog?.kind === 'gallery' ? runtime.displayCatalog : runner.catalog || runtime.displayCatalog);
        ownedStatus.textContent = `本地已收录 ${runner.owned.size} 张 · 按当前 FC27 PC 账号隔离`;
        ownedRows.replaceChildren();
        for (const row of [...runner.owned.values()].sort((a, b) => a.defId - b.defId))
            add('p', `${row.name} / ${row.defId} · ${row.source === 'purchase' ? '本脚本成交' : '手动补录'} · ${new Date(row.at).toLocaleString()}`, ownedRows);
        if (cached) {
            let usable = false;
            try { usable = FsuMarketCatalog.valid(cached, runtime.adapter.scope(), Date.now(),
                galleryMode ? FsuMarketCatalog.HOUR : runner.c.priceTtlMs, galleryMode ? 'gallery' : 'catalog'); } catch {}
            catalogStatus.textContent = `${galleryMode ? '收藏馆' : '参考名单'}本地 ${cached.rows?.length || 0} 张 · ${usable ? '有效' : '过期或尚未通过校验，需刷新'} · 完整抓取 ${new Date(cached.fetchedAt).toLocaleString()} · 下次更新 ${new Date(cached.fetchedAt + (galleryMode ? FsuMarketCatalog.HOUR : runner.c.priceTtlMs)).toLocaleString()} · 非基础卡排除 ${cached.sourceMeta?.excludedVariants?.length || 0} 张 · 无报价排除 ${cached.sourceMeta?.unpriced?.length || 0} 张`;
            if (displayedCatalog !== cached) {
                displayedCatalog = cached; catalogRows.replaceChildren();
                const table = add('table', '', catalogRows); table.style.cssText = 'width:100%;border-collapse:collapse;text-align:left;white-space:nowrap;';
                const head = add('tr', '', add('thead', '', table));
                ['球员 / 版本ID', '评分', '联赛ID', 'PC 参考价', '购买上限', '源报价时间（原文）'].forEach(t => add('th', t, head));
                const body = add('tbody', '', table);
                for (const r of cached.rows || []) {
                    const tr = add('tr', '', body), name = add('td', '', tr);
                    const link = add('a', `${r.name} / ${r.defId}`, name);
                    if (/^https:\/\/www\.futbin\.com\/27\/player\//.test(r.source)) { link.href = r.source; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
                    link.style.color = '#b0e763';
                    [r.rating, r.leagueId || '-', Number(r.value).toLocaleString(), FsuAutoBid.referenceCap(r.value, runtime.adapter).toLocaleString(),
                        r.sourceCheckedRaw || '未提供'].forEach(v => { const td = add('td', String(v), tr); td.style.padding = '6px 12px 6px 0'; });
                }
                for (const r of cached.sourceMeta?.unpriced || []) add('p', `${r.name} / ${r.defId}：${r.reason}，禁止购买`, catalogRows);
                for (const r of cached.sourceMeta?.excludedVariants || []) add('p', `${r.name} / ${r.defId}：${r.reason}，禁止购买`, catalogRows);
            }
        }
        else catalogStatus.textContent = `${galleryMode ? '收藏馆' : '参考名单'}本地名单尚未获取`;
        rows.replaceChildren();
        runner.active().forEach(r => add('p', `${r.name} · 上限 ${r.cap} · ${stateNames[r.state] || r.state}`, rows));
        for (const r of runner.records.values()) if (r.custom && r.state === 'unresolved') {
            const line = add('div', '', rows);
            add('span', `交易 ${r.tradeId} 结果不明 · `, line);
            const unlock = events.createButton(new UTStandardButtonControl(), '核实未成交后解锁', () => {
                try { runner.clearHistoryBlock(r.tradeId); runner.message = '阻塞已解除'; render(); }
                catch (error) { runner.message = error.message; render(); }
            }, 'mini');
            unlock.setInteractionState(!['running', 'rest', 'draining'].includes(runner.mode));
            line.appendChild(unlock.getRootElement());
        }
        logs.textContent = runner.logs.map(l => `${new Date(l.at).toLocaleTimeString()} ${l.message}`).join('\n');
        start.setInteractionState(!runtime.starting && !runner.busy && !['running', 'rest', 'draining'].includes(runner.mode));
        galleryStart.setInteractionState(!runtime.starting && !runner.busy && !['running', 'rest', 'draining'].includes(runner.mode));
        galleryUpdate.setInteractionState(!runtime.starting && !runner.busy && !['running', 'rest', 'draining'].includes(runner.mode));
        historyStart.setInteractionState(!runtime.starting && !runner.busy && !['running', 'rest', 'draining'].includes(runner.mode));
        update.setInteractionState(!runtime.starting && !runner.busy && !['running', 'rest', 'draining'].includes(runner.mode));
        exportList.setInteractionState(!!cached);
        pause.setInteractionState(['running', 'rest', 'draining'].includes(runner.mode));
        stop.setInteractionState(runner.mode !== 'idle' && runner.mode !== 'stopped');
        addOwned.setInteractionState(!runtime.starting && !['running', 'rest', 'draining'].includes(runner.mode));
        removeOwned.setInteractionState(!runtime.starting && !['running', 'rest', 'draining'].includes(runner.mode));
    };
    const releaseIfStopped = () => {
        if (!runner.busy && !['running', 'rest', 'draining'].includes(runner.mode)) {
            runtime.release?.(); runtime.release = null;
        }
    };
    const pump = async () => {
        runtime.timer = null;
        if ((!runtime.panel.isConnected || !runtime.panel.getClientRects().length) && ['running', 'rest', 'draining'].includes(runner.mode)) runner.pause('已离开转会中心，市场购买暂停');
        await runner.tick(); releaseIfStopped(); runtime.render?.();
        if (['running', 'rest', 'draining'].includes(runner.mode)) runtime.timer = setTimeout(pump, 1000);
    };
    const startRun = async (referenceOnly = false, useHistory = false, gallery = false) => {
        if (runtime.starting || runner.busy) return;
        runtime.starting = true; render();
        try {
            const history = useHistory ? events.autoBidRecentSearches()[Number(historySelect.value)] : null;
            if (useHistory && (!historySelect.value || !history))
                throw new Error('请选择有有效一口价最高价的最近搜索');
            if (!navigator.locks?.request) throw new Error('浏览器不支持单实例锁，请使用新版 Chrome / Edge');
            const name = `fsu-auto-bid:${runtime.adapter.scope()}`;
            // Keep the Web Lock until stopped AND the last in-flight request has finished.
            void navigator.locks.request(name, { ifAvailable: true }, async lock => {
                if (!lock) { runtime.starting = false; runner.pause('另一个标签页正在竞拍，请先停止那一页'); render(); return; }
                try {
                    runtime.adapter.check();
                    const sbcPurchases = JSON.parse(GM_getValue(`fsuSbcPurchases.v1.${runtime.adapter.scope()}`, 'null'));
                    if (sbcPurchases?.records?.some(r => !['claimed', 'lost'].includes(r.state)))
                        throw new Error('SBC 补购仍有待核对交易，请先回到 SBC 规划核对领取');
                    runner.draining = false;
                    if (!runner.start(runtime.adapter.load(), { referenceOnly, history, gallery })) return;
                    runtime.starting = false;
                    const held = new Promise(resolve => { runtime.release = resolve; });
                    clearTimeout(runtime.timer); runtime.timer = setTimeout(pump, 0);
                    render(); await held;
                } catch (error) { runtime.starting = false; runner.pause(error.message); render(); }
            }).catch(error => { runtime.starting = false; runner.pause(error.message); render(); });
        } catch (error) { runtime.starting = false; runner.pause(error.message); render(); }
    };
    const editOwned = remove => {
        try {
            if (['running', 'rest', 'draining'].includes(runner.mode)) throw new Error('请先暂停购买再修改已收录表');
            const raw = ownedInput.value.trim();
            const fields = raw.split(/[,，\s]+/).filter(Boolean);
            if (!fields.length || fields.some(s => !/^\d+$/.test(s) || !Number.isSafeInteger(Number(s)) || Number(s) <= 0))
                throw new Error('请填写有效的球员版本 ID，逗号或换行分隔');
            const ids = [...new Set(fields.map(Number))];
            runner.scope = runtime.adapter.scope(); runner.loadOwned();
            const names = new Map(((runner.catalog?.kind === 'gallery' ? runner.catalog : runtime.displayGallery)?.rows || [])
                .map(r => [r.defId, r.name]));
            for (const id of ids) {
                if (remove) { runner.unmarkOwned(id); runner.clearGalleryBlock(id); }
                else runner.markOwned(id, names.get(id) || `球员 ${id}`);
            }
            ownedInput.value = '';
            runner.message = `${remove ? '已移除' : '已补录'} ${ids.length} 个版本 ID`; render();
        } catch (error) { runner.message = error.message; render(); }
    };
    const addOwned = events.createButton(new UTStandardButtonControl(), '补录为已收录', () => editOwned(false), '');
    const removeOwned = events.createButton(new UTStandardButtonControl(), '移除记录 / 核实未成交后解锁', () => editOwned(true), '');
    [addOwned, removeOwned].forEach(b => ownedActions.appendChild(b.getRootElement()));
    const start = events.createButton(new UTStandardButtonControl(), '开始 / 继续参考名单购买', () => startRun(false), 'call-to-action');
    const galleryStart = events.createButton(new UTStandardButtonControl(), '开始 / 继续收藏馆补卡', () => startRun(false, false, true), 'call-to-action');
    const galleryUpdate = events.createButton(new UTStandardButtonControl(), '仅更新收藏馆名单', () => startRun(true, false, true), '');
    const historyStart = events.createButton(new UTStandardButtonControl(), '按所选搜索买一张', () => startRun(false, true), 'call-to-action');
    const update = events.createButton(new UTStandardButtonControl(), '仅更新名单', () => startRun(true), '');
    const exportList = events.createButton(new UTStandardButtonControl(), '导出本地名单', () => {
        const cached = runner.strategy === 'gallery' ? (runner.catalog || runtime.displayGallery) :
            (runner.catalog?.kind === 'gallery' ? runtime.displayCatalog : runner.catalog || runtime.displayCatalog);
        if (!cached) return;
        const url = URL.createObjectURL(new Blob([JSON.stringify(cached, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url;
        link.download = runner.strategy === 'gallery' ? 'futbin-fc27-pc-gallery.json' : 'futbin-fc27-pc-reference.json';
        link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, '');
    const pause = events.createButton(new UTStandardButtonControl(), '暂停', () => { runner.pause(); releaseIfStopped(); }, '');
    const stop = events.createButton(new UTStandardButtonControl(), '停止', () => { runner.stop(); releaseIfStopped(); }, '');
    [historyStart, start, galleryStart, galleryUpdate, pause, stop, update, exportList]
        .forEach(b => actions.appendChild(b.getRootElement()));
    runtime.render = render; runner.onChange = render; render();
};

const fsuAutoBidHubInit = UTTransfersHubView.prototype.init;
UTTransfersHubView.prototype.init = function(...args) {
    const result = fsuAutoBidHubInit.apply(this, args);
    events.mountAutoBid(this);
    return result;
};
