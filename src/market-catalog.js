/* Versioned, atomic FUTBIN PC reference snapshots. No EA or DOM dependencies. */
const FsuMarketCatalog = (() => {
    const HOUR = 3600000;
    const sourceUrl = (url, year, id) => typeof url === 'string' &&
        new RegExp(`^https://www\\.futbin\\.com/${year}/player/${id}/[^?#]+`).test(url);
    const GALLERY_LEAGUES = Object.freeze([13, 2216, 53, 2222]);
    function rowValid(r, now, ttl, kind = 'catalog') {
        const gallery = kind === 'gallery';
        return r && Number.isInteger(r.defId) && r.defId > 0 && Number.isInteger(r.futbinId) && r.futbinId > 0 &&
            r.player === true && r.gold === true && r.special === false &&
            Number.isInteger(r.rating) && r.rating >= (gallery ? 85 : 87) && r.rating <= 99 &&
            Number.isInteger(r.position) && r.position >= (gallery ? 0 : 1) && r.position <= 27 && r.gk === 0 &&
            (!gallery || GALLERY_LEAGUES.includes(r.leagueId)) &&
            typeof r.name === 'string' && r.name.length > 0 && Number.isInteger(r.value) && r.value >= (gallery ? 150 : 40000) &&
            r.value <= 15000000 && sourceUrl(r.source, 27, r.futbinId) &&
            Number.isFinite(r.sourceAt) && r.sourceAt > 0 && r.sourceAt <= now && now - r.sourceAt < ttl;
    }
    function valid(s, scope, now, ttl = HOUR, kind = 'catalog') {
        if (!s || s.version !== (kind === 'gallery' ? 2 : 1) ||
            (kind === 'gallery' ? s.kind !== 'gallery' : s.kind === 'gallery') ||
            s.scope !== scope || s.year !== 27 || s.platform !== 'pc' || s.complete !== true ||
            !Number.isFinite(s.fetchedAt) || s.fetchedAt > now || now - s.fetchedAt >= ttl ||
            !Number.isInteger(s.pages) || s.pages < 1 || !Number.isInteger(s.total) || s.total < 0 ||
            !Array.isArray(s.rows) || s.rows.length !== s.total || !/^https:\/\/www\.futbin\.com\//.test(s.source)) return false;
        const ids = new Set(), futbinIds = new Set();
        return s.rows.every(r => {
            if (!rowValid(r, now, ttl, kind) || ids.has(r.defId) || futbinIds.has(r.futbinId)) return false;
            ids.add(r.defId); futbinIds.add(r.futbinId); return true;
        });
    }
    function assertContinuity(previous, next) {
        if (previous?.scope !== next.scope || previous?.year !== 27 || previous?.platform !== 'pc' || previous?.complete !== true ||
            (previous.kind || 'catalog') !== (next.kind || 'catalog')) return;
        const oldCount = previous.sourceMeta?.rawItemCount, newCount = next.sourceMeta?.rawItemCount;
        if (Number.isInteger(oldCount) && oldCount > 0 && (!Number.isInteger(newCount) || newCount < oldCount * 0.8))
            throw Object.assign(new Error('FUTBIN 目录数量异常减少，保留旧缓存并暂停'), { fatal: true });
    }
    class Builder {
        constructor(scope, kind = 'catalog') { this.scope = scope; this.kind = kind; this.page = 1; this.rows = []; }
        add(p, now, ttl = HOUR) {
            if (p?.pending === true && p.page === this.page && p.year === 27 && p.platform === 'pc' && this.page < 150) {
                this.page++; return null;
            }
            if (!p || p.year !== 27 || p.platform !== 'pc' || p.page !== this.page ||
                !Number.isInteger(p.pages) || p.pages < this.page || p.pages > 100 ||
                !Number.isInteger(p.total) || p.total < 0 || !Array.isArray(p.items) ||
                !Number.isFinite(p.at) || p.at > now || now - p.at >= ttl ||
                (this.first && (p.total !== this.first.total || p.pages !== this.first.pages || p.source !== this.first.source)))
                throw new Error('FUTBIN 名单分页、平台或赛季校验失败');
            this.first ||= p;
            this.rows.push(...p.items); this.page++;
            if (p.page < p.pages) return null;
            const snapshot = { version: this.kind === 'gallery' ? 2 : 1, kind: this.kind,
                scope: this.scope, year: 27, platform: 'pc', complete: true,
                total: p.total, pages: p.pages, fetchedAt: this.first.at, source: p.source, rows: this.rows,
                sourceMeta: p.sourceMeta };
            if (!valid(snapshot, this.scope, now, ttl, this.kind)) throw new Error('FUTBIN 名单不完整、重复卡版本或参考价无效/过期');
            return snapshot;
        }
    }
    return { HOUR, GALLERY_LEAGUES, rowValid, valid, assertContinuity, Builder };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FsuMarketCatalog;
