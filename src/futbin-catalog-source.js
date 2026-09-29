/* FUTBIN internal API verified 2026-09-20; one HTTP request per next() call. */
const FsuFutbinSource = (() => {
    const BASE = 'https://www.futbin.org/futbin/api/27/';
    const SOURCE = 'https://www.futbin.com/27/players';
    const positions = { GK: 0, RB: 3, CB: 5, LB: 7, CDM: 10, RM: 12, CM: 14, LM: 16,
        CAM: 18, CF: 21, RW: 23, ST: 25, LW: 27, RWB: 2, LWB: 8 };
    const GALLERY_LEAGUES = [13, 2216, 53, 2222];
    const positive = n => Number.isInteger(n) && n > 0;
    function requestGM(gm) {
        return url => new Promise((resolve, reject) => {
            if (!url.startsWith(BASE) || !url.includes('platform=PC')) return reject(new Error('不允许的 FUTBIN 请求地址'));
            let done = false, handle;
            const finish = (error, data) => {
                if (done) return; done = true; clearTimeout(timer);
                error ? reject(Object.assign(error, { fatal: true })) : resolve(data);
            };
            const timer = setTimeout(() => { handle?.abort(); finish(new Error('FUTBIN 请求超时，本次完整刷新已取消')); }, 21000);
            try {
                handle = gm({ method: 'GET', url, anonymous: true, timeout: 20000,
                    onload(response) {
                        try {
                            if (response.status !== 200) throw new Error(`FUTBIN HTTP ${response.status}，停止刷新`);
                            if (response.finalUrl && !response.finalUrl.startsWith(BASE)) throw new Error('FUTBIN 重定向到非数据接口');
                            const body = JSON.parse(response.responseText);
                            if (body.error || Number(body.errorcode) !== 200 || !Array.isArray(body.data)) throw new Error('FUTBIN 返回逻辑错误或数据格式异常');
                            const headers = new Map((response.responseHeaders || '').split(/\r?\n/).map(line => {
                                const colon = line.indexOf(':');return [line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim()];
                            }));
                            const httpAt = Date.parse(headers.get('last-modified') || headers.get('date'));
                            if (!Number.isFinite(httpAt)) throw new Error('FUTBIN 缺少可校验的 HTTP 时间');
                            finish(null, { body, at: Date.now(), httpAt });
                        } catch (error) { finish(error); }
                    },
                    onerror: () => finish(new Error('FUTBIN 网络请求失败')),
                    ontimeout: () => finish(new Error('FUTBIN 请求超时')),
                    onabort: () => finish(new Error('FUTBIN 请求已取消'))
                });
            } catch (error) { finish(error); }
        });
    }
    function unpack(response) {
        const b = response?.body;
        if (!b || b.error || Number(b.errorcode) !== 200 || (b.code !== undefined && Number(b.code) !== 200) || !Array.isArray(b.data))
            throw Object.assign(new Error('FUTBIN 返回逻辑错误或非列表数据'), { fatal: true });
        if (!Number.isFinite(response.at) || !Number.isFinite(response.httpAt) || response.httpAt > response.at + 60000 ||
            response.at - response.httpAt > 600000)
            throw Object.assign(new Error('FUTBIN 响应时间无法校验或 CDN 数据过期'), { fatal: true });
        return b.data;
    }
    class Refresh {
        constructor(request, { kind = 'catalog' } = {}) {
            this.request = request; this.kind = kind; this.directoryPage = 1; this.step = 1;
            this.leagueIndex = 0;
            this.ids = new Set(); this.defIds = new Set(); this.directory = []; this.rows = []; this.offset = 0;
            this.sources = []; this.phase = 'directory'; this.rawCount = 0;
            this.unpriced = []; this.excludedVariants = [];
        }
        async next(step) {
            if (step !== this.step || this.phase === 'done') throw new Error('FUTBIN 刷新步骤不连续');
            const pending = () => ({ pending: true, page: step, year: 27, platform: 'pc' });
            if (this.phase === 'directory') {
                const leagueId = this.kind === 'gallery' ? GALLERY_LEAGUES[this.leagueIndex] : null;
                const url = BASE + 'getFilteredPlayers?platform=PC&rating=' + (this.kind === 'gallery' ? '85-99' : '87-99') +
                    '&sort=rating&order=desc&version=gold' + (leagueId ? '&league=' + leagueId : '') + '&page=' + this.directoryPage;
                const response = await this.request(url), items = unpack(response);
                if ((!this.rawCount || (this.kind === 'gallery' && this.directoryPage === 1)) && !items.length)
                    throw Object.assign(new Error('FUTBIN 基础金卡目录异常为空'), { fatal: true });
                const added = [];
                for (const r of items) {
                    const returnedLeague = Number(r.leagueId ?? r.league_id ?? r.leagueid ?? r.league);
                    if (!positive(r.ID) || !positive(r.resource_id) || !positive(r.playerid) || r.raretype !== 0 ||
                        !Number.isInteger(r.rating) || r.rating < (this.kind === 'gallery' ? 85 : 87) || r.rating > 99 ||
                        (leagueId && Number.isInteger(returnedLeague) && returnedLeague > 0 && returnedLeague !== leagueId) ||
                        positions[r.position] === undefined ||
                        !/\/content\/fifa27\/img\/cards\/hd\/0_gold\.png(?:\?|$)/.test(r.cardImage) ||
                        r.specialPlayerImage || this.ids.has(r.ID) || this.defIds.has(r.resource_id))
                        throw Object.assign(new Error('FUTBIN 目录卡版本、赛季或重复分页校验失败'), { fatal: true });
                    this.ids.add(r.ID); this.defIds.add(r.resource_id);
                    // FUTBIN's version=gold directory can include evolved/variant cards with
                    // the base gold image and raretype=0. Their resource ID differs from the
                    // base player ID; exclude them before requesting prices or searching EA.
                    if (r.resource_id !== r.playerid) {
                        this.excludedVariants.push({ futbinId: r.ID, defId: r.resource_id,
                            playerId: r.playerid, name: r.common_name || r.playername || r.name,
                            reason: '资源 ID 与基础球员 ID 不同，非基础金卡' });
                        continue;
                    }
                    if (this.kind === 'gallery' || r.position !== 'GK') added.push({ ...r, _galleryLeagueId: leagueId });
                }
                this.directory.push(...added); this.rawCount += items.length;
                this.sources.push({ url, at: response.at, httpAt: response.httpAt });
                this.pageSize ||= items.length;
                if (items.length < this.pageSize) {
                    if (this.kind === 'gallery' && this.leagueIndex < GALLERY_LEAGUES.length - 1) {
                        this.leagueIndex++; this.directoryPage = 1; this.pageSize = 0;
                    } else {
                        if (!this.directory.length) throw Object.assign(new Error('FUTBIN 目录没有目标球员，无法校验'), { fatal: true });
                        this.phase = 'prices';
                    }
                } else if (++this.directoryPage > 100) throw Object.assign(new Error('FUTBIN 目录分页未结束'), { fatal: true });
                this.step++; return pending();
            }
            const batch = this.directory.slice(this.offset, this.offset + 10);
            const url = BASE + 'getPlayersPrice?player_ids=' + batch.map(r => r.ID).join(',') + '&platform=PC';
            const response = await this.request(url), prices = unpack(response), found = new Map();
            for (const p of prices) {
                if (!positive(p.ID) || found.has(p.ID)) throw Object.assign(new Error('FUTBIN 批量价格 ID 重复或无效'), { fatal: true });
                found.set(p.ID, p);
            }
            if (prices.length !== batch.length || batch.some(r => !found.has(r.ID)))
                throw Object.assign(new Error('FUTBIN 批量报价不完整，保留旧缓存'), { fatal: true });
            const fresh = [];
            for (const r of batch) {
                const p = found.get(r.ID);
                if (p.Player_Resource !== r.resource_id || p.Player_ID !== r.playerid ||
                    !Number.isInteger(p.LCPrice) || p.LCPrice < 0 || p.LCPrice > 15000000 ||
                    typeof p.checked !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(p.checked))
                    throw Object.assign(new Error(`FUTBIN 卡 ${r.ID} 报价或 definitionId 无法校验`), { fatal: true });
                if (p.LCPrice === 0) {
                    this.unpriced.push({ futbinId: r.ID, defId: r.resource_id, name: r.common_name || r.name,
                        reason: 'PC 暂无有效最低报价', sourceCheckedRaw: p.checked });
                    continue;
                }
                if (p.LCPrice < (this.kind === 'gallery' ? 150 : 40000)) continue;
                fresh.push({ defId: r.resource_id, futbinId: r.ID, playerId: r.playerid,
                    name: r.common_name || r.playername || r.name, rating: r.rating, position: positions[r.position],
                    positionName: r.position, leagueId: r._galleryLeagueId || undefined,
                    gk: 0, player: true, gold: true, special: false, value: p.LCPrice,
                    source: `https://www.futbin.com/27/player/${r.ID}/` + encodeURIComponent((r.common_name || r.playername || r.name).replace(/\s+/g, '-').toLowerCase()),
                    // HTTP response time is distinct from the quote's timezone-less checked field.
                    sourceAt: Math.min(response.httpAt, response.at), sourceAtKind: 'http-response',
                    sourceCheckedRaw: p.checked, fetchedAt: response.at,
                    eaMinPrice: r.pc_MinPrice, eaMaxPrice: r.pc_MaxPrice });
            }
            this.rows.push(...fresh); this.offset += batch.length; this.step++;
            this.sources.push({ url, at: response.at, httpAt: response.httpAt });
            if (this.offset < this.directory.length) return pending();
            this.phase = 'done';
            return { page: step, pages: step, total: this.rows.length, year: 27, platform: 'pc',
                at: response.at, source: SOURCE, items: this.rows,
                sourceMeta: { rawItemCount: this.rawCount, nonGkCount: this.directory.length,
                    batchSize: 10, sources: this.sources, unpriced: this.unpriced,
                    excludedVariants: this.excludedVariants, checkedTimezone: 'unspecified',
                    kind: this.kind, leagueIds: this.kind === 'gallery' ? GALLERY_LEAGUES : undefined } };
        }
    }
    return { Refresh, unpack, requestGM, BASE, SOURCE };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FsuFutbinSource;
