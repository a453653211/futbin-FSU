/* SBC-only EA purchase adapter, extracted from the former market integration. No independent market UI or strategy. */
events.smartSbcMarketObserve = (create, timeoutMs = 20000) => new Promise((resolve, reject) => {
    const owner = {}; let observable, done = false;
    const finish = (error, result) => {
        if (done) return;
        done = true; clearTimeout(timer); observable?.unobserve(owner);
        error ? reject(error) : resolve(result);
    };
    const timer = setTimeout(() => {
        info.smartSbcMarketTainted = true;
        finish(Object.assign(new Error('请求超时；请刷新网页后核对 SBC 补购'), { uncertain: true, fatal: true }));
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
events.smartSbcMarketAdapter = () => {
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
            if (info.smartSbcMarketTainted) throw Object.assign(new Error('上次请求结果不确定，请刷新网页后继续'), { fatal: true });
            if (Number(info.base.year) !== 27 || Number(APP_YEAR_SHORT) !== 27) throw Object.assign(new Error('赛季必须是 FC27，请刷新网页'), { fatal: true });
            const personaSku = services.User.getUser()?.getSelectedPersona?.()?.sku;
            if (info.base.platform !== 'pc' || (personaSku !== GameSku.PC && personaSku !== GameSku.STEAM))
                throw Object.assign(new Error('本功能只使用 FC27 PC（含 Steam）市场；账号平台与 PC 市场不一致'), { fatal: true });
            if (services.User.getUser()?.tradeAccess !== TradeAccessLevel.ALLOWED)
                throw Object.assign(new Error('当前账号没有转会市场访问权限'), { fatal: true });
            for (const name of ['searchConceptItems', 'bid'])
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
        canBuy: (item, coins) => item.getAuctionData().canBuy(coins),
        coins: () => services.User.getUser().getCurrency(GameCurrency.COINS).amount,
        currencies: () => events.smartSbcMarketObserve(() => services.User.requestCurrencies()),
        async search(row, cap, kind, page = 1) {
            const criteria = new UTSearchCriteriaDTO();
            if (kind !== 'buy') throw new Error('SBC 补购只支持一口价');
            criteria.type = SearchType.PLAYER; criteria.category = SearchCategory.ANY;
            criteria.defId = [row.defId];
            criteria.count = 20; criteria.offset = (page - 1) * criteria.count;
            criteria.maxBuy = cap;
            // The service layer can issue extra player-metadata/currency requests. This
            // verified DAO performs one HTTP read and parses auction items directly.
            const items = checkedItems(await events.smartSbcMarketObserve(() => services.Item.itemDao.searchTransferMarket(criteria)));
            return { items, end: items.length < criteria.count };
        },
        async refresh(items) {
            // refreshAuctions() also starts a currency request inside its callback. Use its existing
            // DAO/parser here and let the group planner preserve its five-second request gap.
            const result = await events.smartSbcMarketObserve(() => services.Item.transfersDao.getAuctionData(items));
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
        buy: (item, amount) => events.smartSbcMarketObserve(() => services.Item.bid(item, amount)),
        // Read old pending records only to block unresolved transactions; retired strategies are not loaded.
        load() {
            try { return JSON.parse(GM_getValue(storageKey(), GM_getValue(`fsuAutoBid.v1.${scope()}`, '{}'))); }
            catch { throw new Error('旧交易记录无法读取，请先核对转会目标，未启动补购。'); }
        },
    };
};
