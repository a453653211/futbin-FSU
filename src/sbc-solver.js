/* Local SBC extension. MIT. Pure solver; no account/network access. */
const FsuSbcSolver = (() => {
    const compare = (actual, op, target) => op === 'min' ? actual >= target
        : op === 'max' ? actual <= target : actual === target;

    function normalize(requirements, enums, slots) {
        const { key: K, scope: S } = enums;
        if (!requirements.length) throw new Error('挑战没有可读取的要求。');
        return requirements.map(req => {
            const keys = req.keys().map(Number);
            const op = req.scope === S.GREATER ? 'min' : req.scope === S.LOWER ? 'max'
                : req.scope === S.EXACT ? 'exact' : null;
            const label = typeof req.buildString === 'function' ? req.buildString() : keys.join(',');
            const unsupported = () => { throw new Error(`暂不支持此条件：${label}。原阵容未改动。`); };
            if (!op || !keys.length) return unsupported();
            const combined = keys.length > 1;
            const predicates = keys.map(key => {
                const v = req.getValue(key);
                if (!Array.isArray(v) || !v.length || !v.every(Number.isFinite)) return unsupported();
                // EA uses the first threshold for rating conditions, even if multiple values exist.
                if (key === K.PLAYER_MIN_OVR) return p => +(p.rating >= v[0]);
                if (key === K.PLAYER_MAX_OVR) return p => +(p.rating <= v[0]);
                if (key === K.PLAYER_EXACT_OVR) return p => +(p.rating === v[0]);
                // Only EA-supported combined predicates are accepted.
                if (key === K.NATION_ID) return p => combined ? +(p.nationId === v[0]) : v.filter(x => x === p.nationId).length;
                if (key === K.LEAGUE_ID) return p => combined ? +(p.leagueId === v[0]) : v.filter(x => x === p.leagueId).length;
                if (key === K.PLAYER_TRADABILITY) return p => +(p.tradable === (v[0] === 0));
                if (combined) return unsupported();
                if (key === K.PLAYER_RARITY) return p => v.filter(x => x === p.rareflag).length;
                if (key === K.PLAYER_RARITY_GROUP) return p => v.filter(x => p.belongsToGroup(x)).length;
                if (key === K.PLAYER_LEVEL) return p => v.filter(x => x === p.getTier()).length;
                if (key === K.PLAYER_QUALITY) return p => +compare(p.getTier(), op, v[0]);
                return unsupported();
            });
            const quality = !combined && keys[0] === K.PLAYER_QUALITY;
            const target = quality ? slots : req.count;
            if (!Number.isInteger(target) || target < 0) return unsupported();
            return { label, op: quality ? 'exact' : op, target,
                value: p => combined ? +predicates.every(fn => fn(p) > 0) : predicates[0](p) };
        });
    }

    // Min-cost flow: group quotas -> unique footballers. Reverse edges let a cheap
    // version move to another group without forcing an unnecessarily expensive card.
    function allocate(groups, quotas) {
        const active = groups.map((group, i) => ({ ...group, quota: quotas[i] })).filter(g => g.quota);
        const ids = new Map();
        active.forEach(g => g.players.forEach(p => {
            if (!ids.has(String(p.databaseId))) ids.set(String(p.databaseId), ids.size);
        }));
        const source = 0, firstId = active.length + 1, sink = firstId + ids.size;
        const graph = Array.from({ length: sink + 1 }, () => []);
        function edge(from, to, capacity, cost, player) {
            const forward = { to, capacity, cost, reverse: graph[to].length, player };
            graph[from].push(forward);
            graph[to].push({ to: from, capacity: 0, cost: -cost, reverse: graph[from].length - 1 });
        }
        active.forEach((g, i) => {
            edge(source, i + 1, g.quota, 0);
            g.players.forEach(p => edge(i + 1, firstId + ids.get(String(p.databaseId)), 1, p.rating, p));
        });
        ids.forEach(id => edge(firstId + id, sink, 1, 0));
        const count = quotas.reduce((n, q) => n + q, 0);
        for (let flow = 0; flow < count; flow++) {
            const distance = Array(graph.length).fill(Infinity), previous = [], queued = new Set([source]), queue = [source];
            distance[source] = 0;
            for (let head = 0; head < queue.length; head++) {
                const from = queue[head]; queued.delete(from);
                graph[from].forEach((e, i) => {
                    if (e.capacity && distance[e.to] > distance[from] + e.cost) {
                        distance[e.to] = distance[from] + e.cost;
                        previous[e.to] = [from, i];
                        if (!queued.has(e.to)) { queued.add(e.to); queue.push(e.to); }
                    }
                });
            }
            if (!Number.isFinite(distance[sink])) return null;
            for (let at = sink; at !== source;) {
                const [from, index] = previous[at], e = graph[from][index];
                e.capacity--; graph[at][e.reverse].capacity++; at = from;
            }
        }
        return graph.slice(1, firstId).flatMap(edges => edges.filter(e => e.player && !e.capacity).map(e => e.player))
            .sort((a, b) => a.rating - b.rating);
    }

    async function solve({ players, fixed = [], slots, rules, maxNodes = 150000,
        maxMs = 5000, stopAtFirst = false, onProgress = () => {}, onFinish = () => {},
        cancelled = () => false, yieldFn = () => new Promise(r => setTimeout(r, 0)) }) {
        if (!Number.isInteger(slots) || slots < 1 || slots > 11 || fixed.length > slots)
            throw new Error('阵容位置数量异常。');
        const fixedIds = new Set(fixed.map(p => String(p.databaseId)));
        if (fixedIds.size !== fixed.length) throw new Error('当前阵容包含同一球员的不同版本，请先移除重复球员。');
        const totals = rules.map(r => fixed.reduce((sum, p) => sum + r.value(p), 0));
        const grouped = new Map();
        for (const p of players.slice().sort((a, b) => a.rating - b.rating)) {
            if (fixedIds.has(String(p.databaseId))) continue;
            const values = rules.map(r => r.value(p));
            const signature = values.join(',');
            if (!grouped.has(signature)) grouped.set(signature, { values, players: [], ids: new Set() });
            const group = grouped.get(signature);
            if (!group.ids.has(String(p.databaseId))) {
                group.ids.add(String(p.databaseId));
                group.players.push(p);
            }
        }
        // Input preference order is preserved inside each equivalent group.
        const groups = Array.from(grouped.values());
        const quotas = groups.map(() => 0), need = slots - fixed.length;
        const capacity = Array(groups.length + 1).fill(0), suffix = Array(groups.length + 1);
        suffix[groups.length] = [];
        for (let i = groups.length - 1; i >= 0; i--) {
            capacity[i] = capacity[i + 1] + groups[i].players.length;
            suffix[i] = suffix[i + 1].concat(groups[i].players.slice(0, need).map(p => p.rating))
                .sort((a, b) => a - b).slice(0, need);
            groups[i].costs = [0];
            groups[i].players.slice(0, need).forEach(p => groups[i].costs.push(groups[i].costs.at(-1) + p.rating));
        }
        let nodes = 0, best = null, bestCost = Infinity;
        const budgetReached = Symbol('search budget reached');
        const firstFound = Symbol('first feasible solution found');
        const started = Date.now();
        async function visit(index, left, cost) {
            if (++nodes > maxNodes || Date.now() - started > maxMs) throw budgetReached;
            if (nodes === 1 || nodes % 200 === 0) {
                await yieldFn();
                if (cancelled()) throw new Error('页面或阵容已改变，本次填充已取消。');
            }
            if (capacity[index] < left) return null;
            // Optimistic bound ignores identity collisions; it can only underestimate cost.
            if (cost + suffix[index].slice(0, left).reduce((n, rating) => n + rating, 0) >= bestCost) return;
            for (let r = 0; r < rules.length; r++) {
                const rule = rules[r];
                let low = Infinity, high = -Infinity;
                for (let g = index; g < groups.length; g++) {
                    low = Math.min(low, groups[g].values[r]);
                    high = Math.max(high, groups[g].values[r]);
                }
                const min = totals[r] + (left ? left * low : 0);
                const max = totals[r] + (left ? left * high : 0);
                if ((rule.op !== 'min' && min > rule.target) || (rule.op !== 'max' && max < rule.target)) return null;
            }
            if (!left) {
                const result = allocate(groups, quotas);
                const rating = result?.reduce((n, p) => n + p.rating, 0);
                if (result && rating < bestCost) {
                    best = result; bestCost = rating;
                    onProgress({ additions: best.slice(), nodes, optimal: false });
                    if (stopAtFirst) throw firstFound;
                }
                return;
            }
            if (index === groups.length) return null;
            const group = groups[index];
            for (let count = Math.min(left, group.players.length); count >= 0; count--) {
                quotas[index] = count;
                group.values.forEach((v, r) => { totals[r] += v * count; });
                await visit(index + 1, left - count, cost + group.costs[count]);
                group.values.forEach((v, r) => { totals[r] -= v * count; });
                quotas[index] = 0;
            }
            return null;
        }
        try { await visit(0, need, 0); }
        catch (error) {
            if (error === firstFound) {
                onFinish({ feasible: true, optimal: false, nodes, reason: 'first-feasible' });
                return best;
            }
            if (error === budgetReached) {
                if (best) {
                    onFinish({ feasible: true, optimal: false, nodes, reason: 'budget' });
                    return best;
                }
                throw new Error('搜索达到上限，尚未找到可行阵容；这不代表库存不足或确定无解。请缩小候选范围后重试。');
            }
            throw error;
        }
        onFinish({ feasible: !!best, optimal: true, nodes, reason: best ? 'exhausted' : 'infeasible' });
        return best;
    }
    return { normalize, solve, allocate };
})();
if (typeof module !== 'undefined') module.exports = FsuSbcSolver;
