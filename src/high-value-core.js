/* Shared by the EA adapter and the optional FUTBIN page sync. Prices are coins, never item scores. */
const FsuHighValue = (() => {
    const source = 'https://www.futbin.com/27/squad-building-challenges/cheapest';
    const maxAge = 15 * 60 * 1000;
    const snapshotKey = 'fsuHighValueBaselines.v1';
    function coins(value) {
        if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0 ? value : null;
        const match = String(value ?? '').trim().replace(/,/g, '').match(/^(\d+(?:\.\d+)?)\s*([KM])?$/i);
        if (!match) return null;
        const amount = Number(match[1]) * ({ K: 1000, M: 1000000 }[match[2]?.toUpperCase()] || 1);
        return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
    }
    function threshold(base, percent = 50, minimum = 500) {
        base = coins(base);
        if (!base || !Number.isFinite(percent) || percent < 0 || percent > 1000 ||
            !Number.isSafeInteger(minimum) || minimum < 0) throw new Error('溢价比例或最低差价无效。');
        return base + Math.max(base * percent / 100, minimum);
    }
    function assess(rating, price, baselines, percent = 50, minimum = 500) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 99) return null;
        const baselineRating = Math.max(81, rating), base = coins(baselines[baselineRating]), value = coins(price);
        if (!base || !value) return null;
        const limit = threshold(base, percent, minimum);
        return { base, baselineRating, price: value, threshold: limit, premium: value - base, high: value > limit };
    }
    function parseCheapest(doc, platform) {
        if (!['pc', 'ps'].includes(platform)) throw new Error('无法识别 FUTBIN 市场平台。');
        const result = {};
        for (const column of doc.querySelectorAll(`.stc-player-column.hide-not-${platform}`)) {
            const rating = Number(column.querySelector('.stc-rating')?.textContent.trim());
            if (!Number.isInteger(rating) || rating < 81 || rating > 99) continue;
            const prices = [...column.querySelectorAll(`a.stc-player-wrapper.hide-not-${platform}[href^="/27/player/"] .price-segment`)]
                .map(node => coins(node.textContent)).filter(Boolean);
            if (prices.length) result[rating] = Math.min(...prices);
        }
        if (!result[81]) throw new Error('未能读取 FUTBIN 81 分最低价；页面可能需要验证或结构已改变。');
        return result;
    }
    function snapshot(doc, now = Date.now()) {
        return { source, year: 27, at: now, platforms: { pc: parseCheapest(doc, 'pc'), ps: parseCheapest(doc, 'ps') } };
    }
    function fresh(data, platform, now = Date.now()) {
        return data?.source === source && data.year === 27 && Number.isFinite(data.at) &&
            data.at <= now && now - data.at <= maxAge && !!coins(data.platforms?.[platform]?.[81]);
    }
    function exactPrice(data, definitionId, rating, platform) {
        if (!['pc', 'ps'].includes(platform) || !Array.isArray(data?.data)) return null;
        const rows = data.data.filter(row => Number(row.Player_Resource ?? row.resource_id) === Number(definitionId));
        if (rows.length !== 1 || Number(rows[0].Player_Rating ?? rows[0].rating) !== rating) return null;
        const row = rows[0];
        if (row.isSbc || row.isObjective || Number(row.untradeable) > 0) return null;
        // Explicit platform fields only. A missing PC price must never fall back to a console price.
        return coins(row[`${platform}_LCPrice`]);
    }
    function protection(item, locked, active) {
        if (locked.has(String(item.id))) return '锁定卡';
        if (active.has(String(item.id))) return '主力／替补／储备';
        if (item.upgrades != null || item.isEnrolledInAcademy?.() === true || item.academy != null) return '进化卡';
        if (item.loans !== -1 || item.endTime !== -1 || item.isLimitedUse?.() === true) return '租借／限用卡';
        return '';
    }
    function tradable(item) {
        return !!item?.id && !!item.definitionId && !item.concept && item.isPlayer?.() === true &&
            item.tradable === true && !(Number(item.untradeableCount) > 0);
    }
    return { source, maxAge, snapshotKey, coins, threshold, assess, parseCheapest, snapshot, fresh, exactPrice, protection, tradable };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FsuHighValue;
