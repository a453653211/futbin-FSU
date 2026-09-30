/* FSU market purchase scheduler. MIT. No browser or EA dependencies. */
const FsuAutoBid = (() => {
    const Catalog = typeof module !== 'undefined' && module.exports ? require('./market-catalog.js') : FsuMarketCatalog;
    const DEFAULTS = Object.freeze({ minRating: 87, minReference: 40000, ratio: 0.7,
        maxSeconds: 60, stopCoins: 1000, intervalMs: 2000, runMs: 600000,
        restMs: 300000, priceTtlMs: 3600000, refreshMs: 10000,
        maxSnapshotMs: 12000, maxTracked: 12, authWaitMs: 30000 });
    const terminal = new Set(['won', 'lost', 'skipped', 'unresolved']);
    function floorPrice(value, tiers) {
        if (!Number.isFinite(value) || value < 150) return 0;
        const tier = [...tiers].sort((a, b) => b.min - a.min).find(t => value >= t.min);
        return tier && tier.inc > 0 ? Math.floor(value / tier.inc) * tier.inc : 0;
    }
    function referenceCap(value, adapter, config = DEFAULTS) {
        // Integer arithmetic preserves strict '< 70%' at exact tier boundaries.
        return adapter.floor(Math.ceil(value * 7 / 10) - 1);
    }
    function historyCap(value, adapter) {
        return Number.isSafeInteger(value) && value >= 150 && value <= 15000000 ? adapter.floor(value) : 0;
    }
    function eligible(p, config = DEFAULTS) {
        return p && p.player === true && p.gold === true && p.special === false &&
            Number.isInteger(p.rating) && p.rating >= config.minRating &&
            Number.isInteger(p.position) && (config.allowGk === true || p.position !== p.gk) && p.position >= 0 &&
            (!config.allowedLeagues || config.allowedLeagues.includes(p.leagueId)) &&
            Number.isInteger(p.defId) && p.defId > 0;
    }
    function quoteValid(q, scope, now, config = DEFAULTS) {
        return q && q.scope === scope && Number.isFinite(q.value) && q.value >= config.minReference &&
            Number.isFinite(q.at) && now >= q.at && now - q.at < config.priceTtlMs &&
            Number.isFinite(q.sourceAt) && now >= q.sourceAt && now - q.sourceAt < config.priceTtlMs;
    }
    function decision(record, quote, coins, now, adapter, config = DEFAULTS) {
        const a = adapter.auction(record.item);
        if (a.tradeId !== record.tradeId || adapter.player(record.item).defId !== record.defId) return { state: 'skipped' };
        if ((a.won || a.closed || a.expired) && (record.uncertain || a.stale || now - record.refreshedAt > config.maxSnapshotMs))
            return { state: 'refresh-needed' };
        if (a.won) return { state: 'won' };
        if (a.closed || a.expired) return { state: 'lost' };
        if (!a.valid || !a.active || a.owner) return { state: 'skipped' };
        if (a.highest) return { state: 'leading' };
        if (a.seconds <= 0) return { state: 'settling' };
        if (!Number.isFinite(a.seconds)) return { state: 'skipped' };
        if (record.kind !== 'buy' && a.seconds > config.maxSeconds) return { state: 'watching' };
        if (record.custom ? adapter.player(record.item).player !== true : !eligible(adapter.player(record.item), config)) return { state: 'skipped' };
        if (!record.custom && !quoteValid(quote, record.scope, now, config)) return { state: 'price-needed' };
        const cap = record.custom ? record.cap : Math.min(record.cap, referenceCap(quote.value, adapter, config));
        if (record.readOnly) return { state: 'monitoring' };
        // A buy acknowledgement without settlement must be reconciled, never resubmitted.
        if (record.kind === 'buy' && record.submitted) return { state: 'confirming' };
        const amount = record.kind === 'buy' ? a.buy : (a.current > 0 ? adapter.next(a.current) : a.start);
        if (!Number.isInteger(amount) || amount <= 0 || adapter.floor(amount) !== amount || amount > cap ||
            (record.custom && Number.isInteger(record.minBuy) && amount < record.minBuy) ||
            (record.kind !== 'buy' && a.buy > 0 && amount >= a.buy) ||
            (a.minimum > 0 && amount < a.minimum)) return { state: 'skipped' };
        if (!Number.isFinite(coins) || coins < (record.custom ? 150 : config.stopCoins) || amount > coins) return { state: 'funds' };
        if (record.uncertain || a.stale || now - record.refreshedAt > config.maxSnapshotMs) return { state: 'refresh-needed' };
        if (!(record.kind === 'buy' ? adapter.canBuy(record.item, coins) : adapter.canBid(record.item, amount, coins)))
            return { state: 'refresh-needed' };
        return { state: record.kind === 'buy' ? 'buy' : 'bid', amount, cap };
    }
    class Runner {
        constructor(adapter, { now = Date.now, config = {}, onChange = () => {} } = {}) {
            this.a = adapter; this.now = now; this.c = { ...DEFAULTS, ...config }; this.onChange = onChange;
            this.mode = 'idle'; this.message = '尚未启动'; this.records = new Map(); this.players = [];
            this.quotes = new Map(); this.logs = []; this.stats = { requests: 0, bids: 0, buys: 0, won: 0, spent: 0, skipped: 0 };
            this.busy = false; this.nextAt = 0; this.cycleEnd = 0; this.restUntil = 0;
            this.cursor = 0; this.offset = 0; this.poolDone = false; this.pages = 0;
            this.currencyAt = -Infinity; this.refreshAt = -Infinity; this.failures = 0;
            this.pendingBid = null; this.needRecovery = false; this.recovered = []; this.revision = 0;
            this.authWaitSince = null;
            this.catalog = null; this.builder = null; this.scan = new Map(); this.searchTurn = 0;
            this.strategy = 'catalog'; this.history = null; this.historyKey = null;
            this.historyPlan = []; this.historyKeys = []; this.historyDone = new Set();
            this.historyIndex = 0; this.historyProgressActive = false;
            this.owned = new Map();
            this.catalogRefreshMs = this.c.priceTtlMs;
        }
        setRefreshHours(hours) {
            if (![1, 2].includes(hours)) throw new Error('刷新间隔仅支持 1 或 2 小时');
            this.catalogRefreshMs = hours * Catalog.HOUR;
            if (this.strategy !== 'gallery') this.c.priceTtlMs = this.catalogRefreshMs;
            this.pendingBid = null; this.changed();
        }
        useCatalog(snapshot) {
            this.catalog = snapshot; this.previousCatalog = snapshot; this.players = snapshot.rows; this.quotes.clear();
            for (const row of this.players) this.quotes.set(row.defId, { ...row, at: snapshot.fetchedAt, scope: this.scope });
            this.scan.clear(); this.cursor = 0; this.searchTurn = 0;
        }
        loadOwned() {
            const data = this.a.loadOwned?.() || { version: 1, scope: this.scope, rows: [] };
            if (data.version !== 1 || data.scope !== this.scope || !Array.isArray(data.rows))
                throw Object.assign(new Error('本地收藏记录格式异常，已停止购买'), { fatal: true });
            const next = new Map();
            for (const row of data.rows) {
                if (!Number.isSafeInteger(row?.defId) || row.defId <= 0 || next.has(row.defId) ||
                    typeof row.name !== 'string' || !Number.isFinite(row.at) || row.at <= 0 ||
                    !['manual', 'purchase'].includes(row.source))
                    throw Object.assign(new Error('本地收藏记录含无效或重复版本 ID，已停止购买'), { fatal: true });
                next.set(row.defId, row);
            }
            this.owned = next;
        }
        markOwned(defId, name, source = 'manual', tradeId = '') {
            if (!Number.isSafeInteger(defId) || defId <= 0 || !['manual', 'purchase'].includes(source))
                throw new Error('球员版本 ID 无效');
            if (this.owned.has(defId)) return false;
            const row = { defId, name: String(name || `球员 ${defId}`), source, at: this.now(), tradeId: String(tradeId) };
            const next = new Map(this.owned); next.set(defId, row);
            this.a.saveOwned?.({ version: 1, scope: this.scope, rows: [...next.values()] });
            this.owned = next; this.changed(); return true;
        }
        unmarkOwned(defId) {
            if (!this.owned.has(defId)) return false;
            const next = new Map(this.owned); next.delete(defId);
            this.a.saveOwned?.({ version: 1, scope: this.scope, rows: [...next.values()] });
            this.owned = next; this.changed(); return true;
        }
        clearGalleryBlock(defId) {
            const blocked = [...this.records.values()].filter(r => r.gallery && r.defId === defId &&
                r.state === 'unresolved');
            if (!blocked.length) return false;
            for (const r of blocked) this.records.delete(r.tradeId);
            try { this.save(); }
            catch (error) { for (const r of blocked) this.records.set(r.tradeId, r); throw error; }
            this.changed(); return true;
        }
        clearHistoryBlock(tradeId) {
            if (['running', 'rest', 'draining'].includes(this.mode)) throw new Error('请先停止购买再解除阻塞');
            const r = this.records.get(String(tradeId));
            if (!r?.custom || r.state !== 'unresolved') return false;
            this.records.delete(String(tradeId));
            try { this.save(); } catch (error) { this.records.set(String(tradeId), r); throw error; }
            this.changed(); return true;
        }
        evaluate(r, coins = this.a.coins()) {
            const d = decision(r, this.quotes.get(r.defId), coins, this.now(), this.a, this.c);
            if (r.submitted && ['skipped', 'price-needed', 'funds'].includes(d.state)) return { state: 'monitoring' };
            return d;
        }
        log(message) { this.logs.unshift({ at: this.now(), message }); this.logs.length = Math.min(100, this.logs.length); }
        changed() { this.onChange(this); }
        snapshot() {
            return { version: 2, scope: this.scope, strategy: this.strategy, cycleEnd: this.cycleEnd, restUntil: this.restUntil,
                historyProgress: this.strategy === 'history' ? {
                    keys: this.historyKeys, done: [...this.historyDone], active: this.historyProgressActive
                } : null,
                nextAt: this.nextAt, pending: [...this.recovered, ...[...this.records.values()].filter(r => r.submitted && !terminal.has(r.state))
                    .map(r => ({ tradeId: r.tradeId, defId: r.defId, cap: r.cap, lastBid: r.lastBid || 0,
                        name: r.name, kind: r.kind || 'bid', custom: r.custom === true, gallery: r.gallery === true,
                        minBuy: r.minBuy || 0, historyKey: r.historyKey || null,
                        readOnly: r.readOnly, submitted: true, uncertain: r.uncertain }))],
                blocked: [...this.records.values()].filter(r => r.state === 'unresolved')
                    .map(r => ({ tradeId: r.tradeId, defId: r.defId, gallery: r.gallery === true,
                        custom: r.custom === true, historyKey: r.historyKey || null,
                        at: r.blockedAt || this.now() })) };
        }
        save() { if (this.scope) this.a.save?.(this.snapshot()); }
        start(saved, { referenceOnly = false, history = null, gallery = false } = {}) {
            if (this.busy || ['running', 'rest', 'draining'].includes(this.mode)) return false;
            this.a.check();
            const scope = this.a.scope();
            if (this.scope && scope !== this.scope) throw new Error('账户或平台已改变，请刷新网页后启动。');
            const selected = history === null ? null : Array.isArray(history) ? history : [history];
            if (selected && (selected.length < 1 || selected.length > 6))
                throw new Error('请选择一至六条最近搜索条件');
            const selectedKeys = selected?.map(row => {
                if (!row || !Number.isSafeInteger(row.maskedDefId) || row.maskedDefId <= 0 ||
                    row.maskedDefId > 0xffffff || typeof row.name !== 'string' || !row.name.trim() ||
                    !row.criteria || !Number.isSafeInteger(row.criteria.maskedDefId) ||
                    (row.criteria.maskedDefId & 0xffffff) !== row.maskedDefId ||
                    row.criteria.maxBuy !== row.limit || historyCap(row.limit, this.a) < 150)
                    throw new Error('最近搜索条件或一口价最高价无效');
                return JSON.stringify(row.criteria);
            });
            if (selectedKeys && new Set(selectedKeys).size !== selectedKeys.length)
                throw new Error('所选最近搜索包含重复条件，请只选其中一条');
            const valid = [1, 2].includes(saved?.version) && saved.scope === scope;
            const progress = valid && saved.historyProgress;
            const resume = selectedKeys && progress?.active === true;
            if (resume && (!Array.isArray(progress.keys) || !Array.isArray(progress.done) ||
                new Set(progress.keys).size !== progress.keys.length ||
                progress.keys.length !== selectedKeys.length || !progress.keys.every(key => selectedKeys.includes(key)) ||
                !progress.done.every(key => selectedKeys.includes(key))))
                throw new Error('已有未完成的最近搜索任务；请勾选同一组条件继续，或先停止旧任务');
            this.scope = scope; this.session = this.a.session(); this.authWaitSince = null; this.revision++;
            const previousStrategy = this.strategy;
            this.strategy = gallery ? 'gallery' : history === null ? 'catalog' : 'history';
            this.c.minRating = gallery ? 85 : DEFAULTS.minRating;
            this.c.minReference = gallery ? 150 : DEFAULTS.minReference;
            this.c.allowGk = gallery;
            this.c.allowedLeagues = gallery ? Catalog.GALLERY_LEAGUES : null;
            this.c.priceTtlMs = gallery ? Catalog.HOUR : this.catalogRefreshMs;
            if (gallery) this.loadOwned();
            if (this.strategy === 'history') {
                this.historyPlan = selected; this.historyKeys = selectedKeys;
                this.historyDone = new Set(resume ? progress.done : []);
                this.historyIndex = selectedKeys.findIndex(key => !this.historyDone.has(key));
                if (this.historyIndex < 0) throw new Error('所选最近搜索已全部完成，请停止旧任务后重新启动');
                this.history = selected[this.historyIndex]; this.historyKey = selectedKeys[this.historyIndex];
                this.historyProgressActive = true;
            } else {
                this.history = null; this.historyKey = null; this.historyPlan = []; this.historyKeys = [];
                this.historyDone = new Set(); this.historyIndex = 0; this.historyProgressActive = false;
            }
            if (previousStrategy !== this.strategy) { this.cycleEnd = 0; this.restUntil = 0; }
            for (const r of this.active()) if (Boolean(r.custom) !== (this.strategy === 'history') ||
                Boolean(r.gallery) !== gallery) {
                if (r.submitted) r.readOnly = true;
                else this.finish(r, 'skipped');
            }
            if (valid && !this.records.size) this.recovered = (saved.pending || []).filter(r =>
                /^\d+$/.test(r.tradeId) && Number.isInteger(r.defId) && r.defId > 0 &&
                Number.isFinite(r.cap) && r.cap >= 150 && Number.isFinite(r.lastBid) && r.lastBid >= 0)
                .map(r => ({ ...r, submitted: true, readOnly: saved.version === 1 || r.readOnly === true || r.uncertain === true ||
                    Boolean(r.custom) !== (this.strategy === 'history') || Boolean(r.gallery) !== gallery,
                    kind: r.kind === 'buy' ? 'buy' : 'bid' }));
            if (this.strategy === 'history') for (const r of [...this.active(), ...this.recovered]) {
                if (!r.custom) continue;
                // An older manual-list purchase cannot silently join the selected search.
                const matching = this.historyPlan.find(row => JSON.stringify(row.criteria) === r.historyKey &&
                    row.maskedDefId === (r.defId & 0xffffff));
                if (!matching || r.kind !== 'buy') r.readOnly = true;
                if (matching) r.cap = Math.min(r.cap, historyCap(matching.limit, this.a));
            }
            const kind = gallery ? 'gallery' : 'catalog';
            const cached = this.catalog && (this.catalog.kind || 'catalog') === kind ?
                this.catalog : this.a.loadCatalog?.(kind);
            // Preserve the census even when its prices are too old for trading.
            if (cached?.scope === scope && (cached.kind || 'catalog') === kind) this.previousCatalog = cached;
            if (this.strategy === 'history') {
                this.catalog = null; this.players = this.historyPlan.filter((row, i) => !this.historyDone.has(this.historyKeys[i]));
                this.quotes.clear();
                this.scan.clear(); this.searchTurn = 0;
            } else if (Catalog.valid(cached, scope, this.now(), this.c.priceTtlMs, kind)) this.useCatalog(cached);
            else { this.catalog = null; this.players = []; this.quotes.clear(); }
            this.builder = null;
            this.referenceOnly = referenceOnly;
            if (referenceOnly) this.catalog = null;
            const now = this.now();
            if (valid) {
                for (const r of saved.blocked || []) {
                    if (/^\d+$/.test(r.tradeId) && Number.isFinite(r.at) && r.at <= now &&
                        (r.gallery === true || r.custom === true || now - r.at < 86400000) && !this.records.has(r.tradeId))
                        this.records.set(r.tradeId, { tradeId: r.tradeId, defId: r.defId,
                            gallery: r.gallery === true, custom: r.custom === true,
                            historyKey: r.historyKey || null, scope, state: 'unresolved', blockedAt: r.at });
                }
                // Only bounded, future deadlines survive reloads. Never resume automatically.
                this.restUntil = Math.max(this.restUntil, saved.restUntil > now && saved.restUntil <= now + this.c.restMs ? saved.restUntil : 0);
                this.cycleEnd = Math.max(this.cycleEnd, saved.cycleEnd > now && saved.cycleEnd <= now + this.c.runMs ? saved.cycleEnd : 0);
                this.nextAt = Math.max(this.nextAt, saved.nextAt > now && saved.nextAt <= now + this.c.intervalMs ? saved.nextAt : 0);
            }
            if (this.strategy === 'history' && [...this.records.values()].some(r => r.custom &&
                r.state === 'unresolved' && (this.historyKeys.includes(r.historyKey) ||
                    this.historyPlan.some(row => (r.defId & 0xffffff) === row.maskedDefId))))
                throw new Error('这名球员有结果不明的旧交易；请核对转会目标，确认未成交后再解除阻塞');
            if (this.strategy === 'history' || referenceOnly) { this.restUntil = 0; this.cycleEnd = Infinity; }
            else if (!Number.isFinite(this.cycleEnd) || !this.cycleEnd ||
                (now >= this.cycleEnd + this.c.restMs)) this.cycleEnd = now + this.c.runMs;
            this.mode = 'running'; this.message = '读取金币并核对已有竞拍'; this.needRecovery = true;
            this.currencyAt = -Infinity; this.pendingBid = null; this.failures = 0;
            this.log(this.strategy === 'history' ? `已启动 ${this.historyPlan.length} 条最近搜索，轮流查询未完成条件；每条确认一张后移出轮询` :
                gallery ? '已启动收藏馆购买：四个联赛 85+ 基础金卡，逐卡最多一张，严格低于 PC 参考价 70%' :
                '已启动：FC27 基础金卡、87+ 非门将、PC 参考价 ≥40,000，严格低于 70% 竞拍或一口价');
            this.save(); this.changed(); return true;
        }
        pause(reason = '已暂停') {
            this.mode = 'paused'; this.message = reason; this.pendingBid = null; this.revision++;
            this.log(reason);
            try { this.save(); } catch { this.message += '（无法保存记录，请在转会目标核对）'; }
            this.changed();
        }
        stop() {
            this.historyProgressActive = false;
            this.pause('已停止；已提交的报价仍然有效，结果可在转会目标查看');
            this.mode = 'stopped'; this.changed();
        }
        active() { return [...this.records.values()].filter(r => !terminal.has(r.state)); }
        finish(r, state) {
            if (terminal.has(r.state)) return;
            if (state === 'won' && r.gallery) {
                try {
                    if (this.a.loadOwned) this.loadOwned();
                    this.markOwned(r.defId, r.name, 'purchase', r.tradeId);
                } catch (error) {
                    throw Object.assign(new Error('无法保存收藏馆成交记录：' + error.message), { fatal: true });
                }
            }
            r.state = state;
            if (state === 'won') {
                const price = r.kind === 'buy' ? r.lastBid : this.a.auction(r.item).current;
                this.stats.won++; this.stats.spent += price;
                this.log(`已确认成交：${r.name}，${price.toLocaleString()} 金币（在转会目标领取）`);
                if (this.strategy === 'history' && r.custom && this.historyKeys.includes(r.historyKey) &&
                    !this.historyDone.has(r.historyKey)) {
                    this.historyDone.add(r.historyKey);
                    for (const other of this.active()) if (other !== r && other.custom &&
                        other.historyKey === r.historyKey && !other.submitted) {
                        other.state = 'skipped'; this.stats.skipped++;
                    }
                    this.pendingBid = null;
                    this.historyIndex = this.historyKeys.findIndex(key => !this.historyDone.has(key));
                    if (this.historyIndex < 0) {
                        this.historyProgressActive = false;
                        this.mode = 'stopped'; this.message = `已完成 ${this.historyPlan.length} 条最近搜索，每条买到一张`;
                    } else {
                        this.history = this.historyPlan[this.historyIndex]; this.historyKey = this.historyKeys[this.historyIndex];
                        this.players = this.historyPlan.filter((row, i) => !this.historyDone.has(this.historyKeys[i]));
                        this.scan.clear(); this.searchTurn = 0;
                        this.message = `已完成 ${this.historyDone.size} / ${this.historyPlan.length} 条，继续轮询其余条件`;
                        this.log(this.message);
                    }
                }
            } else if (state === 'lost') this.log(`竞拍结束：${r.name}，未中标`);
            else if (state === 'unresolved') {
                r.blockedAt = this.now();
                this.log(`无法确认 ${r.name} 的结果，请在转会目标核对`);
            }
            else this.stats.skipped++;
            if (this.strategy === 'history' && r.custom && this.historyKeys.includes(r.historyKey) &&
                r.submitted && state !== 'won') {
                this.mode = 'stopped'; this.message = '已提交交易未确认成交，请在转会目标核对';
            }
            // Keep recent rows without growing memory for a long unattended session.
            const ended = [...this.records.values()].filter(x => terminal.has(x.state) && x.state !== 'unresolved');
            if (ended.length > 100) ended.slice(0, ended.length - 100).forEach(x => this.records.delete(x.tradeId));
            this.save();
        }
        async request(label, fn) {
            this.message = label; this.stats.requests++; this.changed();
            try { const value = await fn(); this.failures = 0; return value; }
            catch (error) {
                // Preserve code/fatal/uncertain flags while identifying the failed step.
                throw Object.assign(new Error(`${label}：${error?.message || String(error)}`), {
                    code: error?.code, fatal: error?.fatal, uncertain: error?.uncertain
                });
            }
            finally { this.nextAt = this.now() + this.c.intervalMs; this.save(); }
        }
        async tick() {
            if (this.busy || !['running', 'rest', 'draining'].includes(this.mode)) return;
            this.busy = true;
            try { await this.step(); }
            catch (error) {
                if (error?.code === 'CANCELLED') return;
                this.failures++;
                this.log(`请求未完成：${error?.message || String(error)}`);
                if (error?.fatal || error?.uncertain || this.failures >= 3) this.pause('异常暂停：' + (error?.message || String(error)));
            } finally { this.busy = false; this.changed(); }
        }
        checkAccount() {
            this.a.check();
            if (this.a.scope() !== this.scope) {
                this.pause('账户或平台已改变，请刷新网页'); return false;
            }
            return true;
        }
        syncSession() {
            // Native EA requests already use the latest SID. It is not an account identity.
            const session = this.a.session();
            if (!session || session !== this.session || this.authWaitSince !== null) {
                this.pendingBid = null; this.needRecovery = true;
                this.currencyAt = -Infinity; this.refreshAt = -Infinity;
            }
            if (!session) {
                this.authWaitSince ??= this.now();
                this.message = 'EA 正在续期登录会话，等待完成';
                if (this.now() - this.authWaitSince >= this.c.authWaitMs)
                    this.pause('EA 登录会话续期超时，请确认网页登录状态后继续');
                return false;
            }
            if (session !== this.session || this.authWaitSince !== null)
                this.log('EA 登录会话已更新，先核对金币和已有竞拍');
            this.session = session; this.authWaitSince = null;
            return true;
        }
        async step() {
            const now = this.now();
            if (!this.checkAccount()) return;
            if (this.strategy !== 'history' && this.restUntil > now) { this.mode = 'rest'; this.message = '休息中，不发送请求、不追价'; return; }
            if (this.mode === 'rest') {
                this.mode = this.draining ? 'draining' : 'running'; this.restUntil = 0;
                this.cycleEnd = now + this.c.runMs; this.needRecovery = true; this.currencyAt = -Infinity;
                this.pendingBid = null; this.log('休息结束，先核对金币和竞拍状态'); this.save();
            }
            if (this.strategy !== 'history' && now >= this.cycleEnd) {
                this.restUntil = now + this.c.restMs; this.mode = 'rest'; this.pendingBid = null;
                this.log('已运行 10 分钟，休息 5 分钟'); this.save(); return;
            }
            if (!this.syncSession()) return;
            if (now < this.nextAt) return;
            const revision = this.revision, requestSession = this.session;
            // A native request can reauthenticate while in flight. Discard its old snapshot
            // and reconcile next tick; never carry a queued bid across the session boundary.
            const stillRunning = () => revision === this.revision && ['running', 'draining'].includes(this.mode) &&
                this.checkAccount() && this.syncSession() && this.session === requestSession;
            if (now - this.currencyAt >= 60000) {
                await this.request('同步可用金币', () => this.a.currencies());
                if (!stillRunning()) return;
                this.currencyAt = this.now(); return;
            }
            const coins = this.a.coins();
            if (!Number.isFinite(coins) || coins < 0) throw Object.assign(new Error('无法读取可用金币'), { fatal: true });
            if (coins < (this.strategy === 'history' ? 150 : this.c.stopCoins) && !this.draining && !this.referenceOnly) {
                this.draining = true; this.mode = 'draining'; this.pendingBid = null;
                this.log('可用金币低于 1,000，停止出价，仅核对已有竞拍');
            }
            if (this.needRecovery) {
                const items = await this.request('核对已有竞拍', () => this.a.watched());
                if (!stillRunning()) return;
                const byId = new Map(items.map(p => [this.a.auction(p).tradeId, p]));
                for (const saved of this.recovered) {
                    const item = byId.get(saved.tradeId);
                    if (!item) {
                        this.log(`历史竞拍 ${saved.tradeId} 未在目标中找到，请手动核对；不会补拍`);
                        this.records.set(saved.tradeId, { ...saved, state: 'unresolved', blockedAt: this.now() });
                        continue;
                    }
                    this.records.set(saved.tradeId, { ...saved, item, scope: this.scope, state: 'watching',
                        refreshedAt: this.now(), uncertain: false });
                }
                this.recovered = [];
                for (const r of this.active()) {
                    const item = byId.get(r.tradeId);
                    if (item) { r.item = item; r.refreshedAt = this.now(); r.uncertain = false; }
                    else r.refreshedAt = -Infinity;
                }
                this.needRecovery = false; this.refreshAt = -Infinity; this.save();
                if (this.strategy === 'history' && [...this.records.values()].some(r => r.custom &&
                    r.state === 'unresolved' && (this.historyKeys.includes(r.historyKey) ||
                        this.historyPlan.some(row => (r.defId & 0xffffff) === row.maskedDefId))))
                    this.pause('已有最近搜索交易结果不明，请先核对转会目标');
                return;
            }
            if (this.strategy !== 'history' && !this.draining && !Catalog.valid(this.catalog, this.scope, now,
                this.c.priceTtlMs, this.strategy === 'gallery' ? 'gallery' : 'catalog')) {
                this.pendingBid = null;
                const kind = this.strategy === 'gallery' ? 'gallery' : 'catalog';
                this.builder ||= new Catalog.Builder(this.scope, kind);
                const page = await this.request('更新 FUTBIN PC 完整参考名单', () => this.a.catalogPage(this.builder.page, kind));
                if (!stillRunning()) { this.builder = null; return; }
                let completed;
                try { completed = this.builder.add(page, this.now(), this.c.priceTtlMs); }
                catch (e) { this.builder = null; throw Object.assign(e, { fatal: true }); }
                if (completed) {
                    Catalog.assertContinuity(this.previousCatalog, completed);
                    this.a.saveCatalog(completed); this.useCatalog(completed); this.builder = null;
                    this.log(`完整名单已保存：${completed.total} 张卡，逐卡 PC 参考价已校验`);
                    if (this.referenceOnly) { this.mode = 'stopped'; this.message = '参考名单已更新并保存，未启动购买'; }
                }
                return;
            }
            if (this.strategy === 'gallery' && this.a.loadOwned) this.loadOwned();
            if (this.pendingBid && !this.draining) {
                const r = this.records.get(this.pendingBid); this.pendingBid = null;
                if (r && !terminal.has(r.state)) {
                    if (r.gallery && this.owned.has(r.defId) && !r.submitted) {
                        this.finish(r, 'skipped'); return;
                    }
                    const d = this.evaluate(r, coins);
                    if (d.state === 'bid' || d.state === 'buy') {
                        r.submitted = true; r.uncertain = true; r.lastBid = d.amount; r.state = 'submitting';
                        // Persist intent before the request; a reload/timeout must never cause a blind retry.
                        this.save();
                        try {
                            await this.request(`${d.state === 'buy' ? '一口价' : '出价'}：${r.name} ${d.amount}`,
                                () => d.state === 'buy' ? this.a.buy(r.item, d.amount) : this.a.bid(r.item, d.amount));
                        } catch (error) {
                            r.readOnly = true; this.save(); throw Object.assign(error, { uncertain: true });
                        }
                        this.stats[d.state === 'buy' ? 'buys' : 'bids']++; r.state = 'confirming'; r.refreshedAt = -Infinity;
                        this.refreshAt = -Infinity;
                        this.log(`报价已提交：${r.name} ${d.amount}，等待服务器确认`); this.save(); return;
                    }
                }
            }
            for (const r of this.active()) {
                if (r.gallery && this.owned.has(r.defId) && !r.submitted) {
                    this.finish(r, 'skipped'); continue;
                }
                const d = this.evaluate(r, coins);
                // Never infer settlement from an unrefreshed countdown or an uncertain bid response.
                if (terminal.has(d.state) && !r.uncertain) this.finish(r, d.state);
                else if (d.state === 'price-needed' && !r.submitted) this.finish(r, 'skipped');
                else r.state = d.state;
            }
            const active = this.active();
            if (this.strategy === 'history' && this.mode === 'stopped') return;
            if (this.draining && !active.some(r => r.submitted)) {
                this.mode = 'stopped'; this.message = '金币不足，已有竞拍已核对完毕'; this.save(); return;
            }
            if (active.length && (now - this.refreshAt >= this.c.refreshMs || active.some(r => r.uncertain))) {
                const targets = this.draining ? active.filter(r => r.submitted) : active;
                const refreshed = await this.request('刷新关注中的拍卖', () => this.a.refresh(targets.map(r => r.item)));
                if (!stillRunning()) return;
                const ids = new Set(refreshed);
                for (const r of targets) {
                    if (!ids.has(r.tradeId)) {
                        r.refreshedAt = -Infinity;
                        r.misses = (r.misses || 0) + 1;
                        if (r.misses >= 3) this.finish(r, r.submitted ? 'unresolved' : 'skipped');
                        continue;
                    }
                    r.misses = 0; r.refreshedAt = this.now(); r.uncertain = false;
                    const d = this.evaluate(r);
                    if (terminal.has(d.state)) this.finish(r, d.state);
                    else r.state = d.state;
                }
                this.refreshAt = this.now();
                const ready = this.active().filter(r => ['bid', 'buy'].includes(r.state))
                    .sort((x, y) => this.a.auction(x.item).seconds - this.a.auction(y.item).seconds);
                if (!this.draining && ready.length) this.pendingBid = ready[0].tradeId;
                this.save(); return;
            }
            if (this.draining) return;
            if (this.strategy === 'history' && active.some(r => r.custom && r.submitted)) {
                this.message = '已提交一笔购买，等待 EA 确认；不再搜索'; return;
            }
            if (active.length >= this.c.maxTracked || !this.players.length) {
                if (!this.players.length) this.message = '完整名单为空，等待下次定时更新';
                return;
            }
            const budget = this.a.floor(coins);
            if (this.searchBudget !== budget) {
                this.searchBudget = budget; this.scan.clear();
            }
            // Use the local reference snapshot to avoid any market/price request for
            // a card whose full strategy cap cannot be covered by available coins.
            const affordable = this.players.filter(p => {
                if (this.strategy === 'gallery' && (this.owned.has(p.defId) ||
                    [...this.records.values(), ...this.recovered].some(r => r.gallery && r.defId === p.defId &&
                        (!terminal.has(r.state) || r.state === 'unresolved')))) return false;
                if (this.strategy === 'history')
                    return historyCap(p.limit, this.a) >= 150 && this.a.floor(Math.min(p.limit, coins)) >= 150;
                const q = this.quotes.get(p.defId);
                if (!quoteValid(q, this.scope, now, this.c)) return false;
                const cap = referenceCap(q.value, this.a, this.c);
                return cap > 0 && cap <= budget &&
                    !(Number.isInteger(p.eaMinPrice) && p.eaMinPrice > cap);
            });
            if (!affordable.length) {
                this.message = `当前可用金币 ${coins.toLocaleString()}，暂无买得起的目标，等待余额更新`;
                return;
            }
            // Alternate both search modes and rotate players after every page. A busy market
            // cannot monopolize searches. Each player/mode keeps its own page cursor.
            const kind = this.strategy === 'history' || this.searchTurn % 2 === 0 ? 'buy' : 'bid';
            const p = affordable[(this.strategy === 'history' ? this.searchTurn : Math.floor(this.searchTurn / 2)) % affordable.length];
            this.searchTurn++;
            const q = this.quotes.get(p.defId);
            if (this.strategy !== 'history' && !quoteValid(q, this.scope, now, this.c)) return;
            const cap = this.strategy === 'history' ? historyCap(p.limit, this.a) : referenceCap(q.value, this.a, this.c);
            const searchCap = this.strategy === 'history' ? Math.min(cap, this.a.floor(coins)) : cap;
            const key = (this.strategy === 'history' ? JSON.stringify(p.criteria) : p.defId) + ':' + kind;
            const scan = this.scan.get(key) || { page: 1, seen: new Set(), rounds: 0 };
            const page = await this.request((kind === 'buy' ? '一口价全时段搜索：' : '临期竞拍搜索：') + p.name + ' · 第 ' + scan.page + ' 页 · 上限 ' + searchCap,
                () => this.a.search(p, searchCap, kind, scan.page));
            if (!stillRunning()) return;
            if (!Array.isArray(page?.items) || typeof page.end !== 'boolean') throw Object.assign(new Error('EA 市场分页格式异常'), { fatal: true });
            const items = page.items;
            const fingerprint = items.map(x => this.a.auction(x).tradeId).join(',');
            if (items.length && scan.seen.has(fingerprint)) {
                this.log('EA 返回重复市场页，' + p.name + ' 本轮覆盖不完整，将从第一页重扫');
                scan.page = 1; scan.seen.clear();
            } else if (page.end) {
                scan.page = 1; scan.seen.clear(); scan.rounds++;
            } else {
                if (items.length) scan.seen.add(fingerprint);
                scan.page++;
                if (scan.page > 100) {
                    this.log(p.name + ' 达到分页安全界限，覆盖不完整；从第一页重扫');
                    scan.page = 1; scan.seen.clear();
                }
            }
            this.scan.set(key, scan);
            let slots = this.c.maxTracked - this.active().length;
            for (const found of this.strategy === 'history' && kind === 'buy' ?
                [...items].sort((x, y) => this.a.auction(x).buy - this.a.auction(y).buy) : items) {
                if (slots <= 0) break;
                const a = this.a.auction(found), fp = this.a.player(found);
                if (this.records.has(a.tradeId) || !/^\d+$/.test(a.tradeId) ||
                    (this.strategy === 'history' ? (fp.defId & 0xffffff) !== p.maskedDefId : fp.defId !== p.defId) ||
                    (this.strategy === 'gallery' && (fp.leagueId !== p.leagueId ||
                        [...this.records.values()].some(r => r.gallery && r.defId === p.defId &&
                            (!terminal.has(r.state) || r.state === 'unresolved')))) ||
                    (this.strategy !== 'history' && (fp.rating !== p.rating || !eligible(fp, this.c))) || fp.player !== true ||
                    !a.valid || !a.active || a.owner || !Number.isFinite(a.seconds) || a.seconds <= 0 ||
                    (kind === 'bid' && a.seconds > this.c.maxSeconds)) continue;
                if (a.highest || a.outbid) continue;
                const immediateBuy = this.strategy === 'history' && kind === 'buy';
                const r = { item: found, tradeId: a.tradeId, defId: fp.defId, name: fp.name || p.name, cap, kind,
                    minBuy: this.strategy === 'history' ? Number(p.criteria.minBuy) || 0 : 0,
                    historyKey: this.strategy === 'history' ? JSON.stringify(p.criteria) : null,
                    custom: this.strategy === 'history', gallery: this.strategy === 'gallery',
                    scope: this.scope, state: 'watching',
                    refreshedAt: immediateBuy ? this.now() : -Infinity, submitted: false, uncertain: false };
                const d = this.evaluate(r);
                if (terminal.has(d.state) || d.state === 'funds') continue;
                this.records.set(a.tradeId, r); slots--;
                this.log('发现' + (kind === 'buy' ? '一口价' : '临期竞拍') + '：' + p.name +
                    (this.strategy === 'history' ? '，搜索最高一口价 ' + p.limit : '，PC 参考 ' + q.value) + '，上限 ' + cap);
                if (immediateBuy && !this.pendingBid && d.state === 'buy') this.pendingBid = a.tradeId;
                if (immediateBuy) break;
            }
            if (!this.pendingBid) this.refreshAt = -Infinity;
        }
    }
    return { DEFAULTS, floorPrice, referenceCap, historyCap, eligible, quoteValid, decision, Runner };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FsuAutoBid;
