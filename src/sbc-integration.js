/* Runs inside FSU's futweb closure. Uses its existing EA entities and exclusion settings. */
events.smartSbcObserve = (observable) => new Promise((resolve, reject) => {
    const observer = {};
    let settled = false;
    const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        observable.unobserve(observer);
        reject(new Error('EA 请求超时。若发生在保存阶段，请重新打开挑战确认服务器上的阵容。'));
    }, 25000);
    try {
        observable.observe(observer, (source, result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            source.unobserve(observer);
            if (result?.success) resolve(result);
            else reject(new Error(`EA 请求失败（${result?.status ?? '未知状态'}），未提交 SBC。`));
        });
    } catch (error) {
        settled = true;
        clearTimeout(timer);
        observable.unobserve(observer);
        reject(error);
    }
});

events.smartSbcInventory = async (check, request = create => events.smartSbcObserve(create())) => {
    const inventory = new Map();
    const collect = items => items.forEach(p => { if (p?.id) inventory.set(String(p.id), p); });
    const stats = await request(() => services.Club.getStats());
    const count = stats.response?.stats?.find(s => s.type === 'players')?.count;
    if (!Number.isInteger(count) || count < 0) throw new Error('无法读取俱乐部球员数量。');
    for (let offset = 0; offset < count;) {
        check();
        const criteria = new UTSearchCriteriaDTO();
        Object.assign(criteria, { type: 'player', sortBy: 'ovr', sort: 'desc', count: 200, offset });
        const result = await request(() => services.Club.search(criteria));
        const items = result.response?.items;
        if (!Array.isArray(items) || !items.length) throw new Error('俱乐部球员未完整载入，请刷新网页后重试。');
        collect(items);
        offset += items.length;
        if (result.response.retrievedAll === true) break;
    }
    check();
    for (let offset = 0, page = 0;; page++) {
        if (page >= 50) throw new Error('仓库分页数量异常，已停止读取。');
        check();
        const criteria = new UTSearchCriteriaDTO();
        Object.assign(criteria, { type: 'player', count: 200, offset });
        const result = await request(() => services.Item.searchStorageItems(criteria));
        const items = result.response?.items;
        if (!Array.isArray(items)) throw new Error('无法读取仓库球员。');
        collect(items);
        if (result.response.endOfList === true) break;
        if (!items.length) throw new Error('仓库分页状态异常，请刷新网页后重试。');
        offset += items.length;
    }
    check();
    return Array.from(inventory.values());
};

events.smartSbcLegacyFilters = () => GM_getValue('smartSbcLegacyFilters', false) === true;
events.smartSbcScopeText = () => events.smartSbcLegacyFilters()
    ? '选人范围：沿用 FSU 筛选' : '选人范围：全部联赛（含可交易）';

events.smartSbcCandidates = inventory => {
    const criteria = events.ignorePlayerToCriteria({ lock: false });
    criteria.upgrades = null;
    delete criteria.firststorage;
    // FSU's defaults exclude the five major leagues and every tradable card.
    // Smart filling makes these two preferences explicit; hard protections remain.
    if (!events.smartSbcLegacyFilters()) {
        delete criteria.NEleagueId;
        delete criteria.tradable;
    }
    const cap = Number(info.set.goldenrange);
    if (!Number.isFinite(cap)) throw new Error('无法读取排除设置中的最高评分。');
    criteria.LTrating = cap;
    const names = { lock: '锁定球员', removeSquad: '主力阵容', LTrating: `能力值高于 ${cap}`,
        rareflag: '未允许的特殊卡种', upgrades: '进化卡保护', NEleagueId: 'FSU 联赛排除', tradable: 'FSU 排除可交易' };
    let candidates = events.getItemBy(2, {}, undefined, inventory).filter(p => p.id && p.databaseId && !p.concept);
    const exclusions = [{ label: '租借／限用／进化中／无效卡', count: inventory.length - candidates.length }];
    // Count removals at each real filter stage instead of guessing from raw fields.
    for (const [key, value] of Object.entries(criteria)) {
        const next = events.getItemBy(2, { [key]: value }, undefined, candidates);
        exclusions.push({ label: names[key] || key, count: candidates.length - next.length });
        candidates = next;
    }
    return { players: candidates, exclusions, cap };
};

events.smartSbcExplain = (inventory, candidates, fixed, slots, rules, exclusions) => {
    const unique = players => new Set(players.map(p => String(p.databaseId))).size;
    const fixedIds = new Set(fixed.map(p => String(p.databaseId)));
    const available = candidates.filter(p => !fixedIds.has(String(p.databaseId)));
    const lines = [
        `已读取 ${inventory.length} 张俱乐部／仓库卡；筛选后 ${unique(candidates)} 名不同球员。`,
        `保留阵容内 ${fixed.length} 人，还需 ${slots - fixed.length} 人；可新增 ${unique(available)} 人。`,
        ...exclusions.filter(e => e.count > 0).map(e => `${e.label}：排除 ${e.count} 张。`),
        ...rules.map(r => `${r.label}：已放入匹配 ${fixed.filter(p => r.value(p) > 0).length} 人，可新增匹配 ${unique(available.filter(p => r.value(p) > 0))} 人。`),
        '单项人数足够，也可能因条件同时成立、同一球员版本冲突或保留球员不合适而无解。可检查排除设置，或清空当前阵容后重试。'
    ];
    const escape = text => text.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
    events.popup('智能填充：未找到合格阵容', lines.map(escape).join('<br><br>'), () => {},
        [{ labelEnum: enums.UIDialogOptions.OK }]);
};

events.smartSbcFill = async (controller, button) => {
    if (info.run.smartSbc || info.base.savesquad) return;
    const challenge = controller._challenge, squad = challenge?.squad;
    if (!squad) return;
    info.run.smartSbc = true;
    button.setInteractionState(false);
    const original = squad.getPlayers().map(slot => slot.getItem());
    const signature = () => squad.getPlayers().map(s => `${s.getItem()?.id}:${s.getItem()?.definitionId}`).join('|');
    const initialSignature = signature();
    const initialScope = events.smartSbcLegacyFilters();
    const settings = () => JSON.stringify([info.set, info.build, info.lock]);
    const initialSettings = settings();
    const check = () => {
        if (settings() !== initialSettings || events.smartSbcLegacyFilters() !== initialScope || info.base.savesquad || !button.getRootElement().isConnected || controller._challenge !== challenge || challenge.squad !== squad || signature() !== initialSignature)
            throw new Error('页面或阵容已改变，本次填充已取消。');
    };
    const notify = (text, ok = false) => services.Notification.queue([text, ok ? UINotificationType.POSITIVE : UINotificationType.NEGATIVE]);
    let saving = false, loader = false;
    try {
        if (challenge.eligibilityOperation !== SBCEligibilityOperation.AND)
            throw new Error('暂不支持“任一条件成立”的挑战，原阵容未改动。');
        const indices = [];
        for (let i = 0; i < 11; i++) if (!squad.getSlot(i).isBrick()) indices.push(i);
        let rules, complex;
        try { rules = FsuSbcSolver.normalize(challenge.eligibilityRequirements,
            { key: SBCEligibilityKey, scope: SBCEligibilityScope }, indices.length); }
        catch (error) {
            if (typeof FsuSbcComplex === 'undefined') throw error;
            complex = events.smartSbcDescriptor(challenge);
        }
        button.setText('读取球员…');
        let activeIds = new Set();
        if (services.Squad?.requestSquadList && services.Squad?.requestSquadById) {
            const list = (await events.smartSbcObserve(services.Squad.requestSquadList())).data;
            check();
            const active = (await events.smartSbcObserve(services.Squad.requestSquadById(list.activeSquadId))).data.squad;
            activeIds = new Set(active.getPlayers().map(s => String(s.getItem()?.id)));
        }
        const inventory = await events.smartSbcInventory(check);
        const fixed = [], empty = [];
        for (const index of indices) {
            const item = original[index];
            if (item?.id && !item.concept) {
                if (!item.isPlayer() || item.isLimitedUse() || item.isEnrolledInAcademy())
                    throw new Error('当前阵容含租借、限用或进化中的球员，请先移除。');
                fixed.push(item);
            } else empty.push(index);
        }
        const candidates = events.smartSbcCandidates(inventory);
        const players = candidates.players.filter(p => !activeIds.has(String(p.id)));
        const exclusions = candidates.exclusions.concat({label:'当前主力／替补／储备',count:candidates.players.length-players.length});
        const dupIds = new Set(repositories.Item.getUnassignedItems().map(p => p.duplicateId));
        players.sort((a, b) => a.rating - b.rating
            || Number(dupIds.has(b.id)) - Number(dupIds.has(a.id))
            || (info.build.firststorage ? Number(b.pile === ItemPile.STORAGE) - Number(a.pile === ItemPile.STORAGE) : 0)
            || Number(a.tradable) - Number(b.tradable) || a.rareflag - b.rareflag);
        button.setText('计算合格阵容…');
        let searchState = null;
        let additions, complexResult;
        if (complex) {
            complexResult = await FsuSbcComplex.search({...complex, players: players.map(events.smartSbcCard),
                context: events.smartSbcContext(complex), maxMs:15000, stopAtFirst:true,
                cancelled: () => { try { check(); return false; } catch { return true; } } });
            if (!complexResult.solution) throw new Error('本轮搜索未找到可行阵容；这不代表库存不足。可使用整组规划扩大搜索。');
            additions = empty.map(index => complexResult.solution[indices.indexOf(index)].entity);
        } else additions = await FsuSbcSolver.solve({ players, fixed, slots: indices.length, rules,
            onProgress: () => button.setText('已找到可行阵容，继续改进…'),
            onFinish: state => { searchState = state; },
            cancelled: () => { try { check(); return false; } catch { return true; } } });
        check();
        if (!additions) {
            events.smartSbcExplain(inventory, players, fixed, indices.length, rules, exclusions);
            return;
        }
        const proposed = original.slice();
        empty.forEach((index, i) => { proposed[index] = additions[i]; });
        const virtual = events.createVirtualChallenge(challenge);
        virtual.squad.setPlayers(proposed, true);
        if (!virtual.meetsRequirements())
            throw new Error('EA 完整条件校验未通过，原阵容未改动；此挑战可能使用了新的规则。');
        if (!additions.length) { notify('当前阵容已满足条件，可检查后提交。', true); return; }
        check();
        button.setText('保存阵容…');
        events.showLoader();
        loader = true;
        info.base.savesquad = true;
        saving = true;
        squad.setPlayers(proposed, true);
        await events.smartSbcObserve(services.SBC.saveChallenge(challenge));
        // Saving a squad is reversible. Never invoke submitChallenge or exchange here.
        info.base.savesquad = false;
        saving = false;
        events.saveOldSquad(squad, false);
        challenge.onDataChange.notify({ squad });
        notify(`已填入 ${additions.length} 人并通过 EA 条件校验${searchState?.optimal ? '，完成评分优化' : '；搜索提前结束，未证明评分最低'}。请检查阵容后手动提交。`, true);
    } catch (error) {
        if (saving) {
            squad.setPlayers(original, true);
            info.base.savesquad = false;
            challenge.onDataChange.notify({ squad });
        }
        console.warn('[FSU 智能 SBC]', error);
        notify(error.message || '智能填充失败，未提交 SBC。');
    } finally {
        if (loader) events.hideLoader();
        info.run.smartSbc = false;
        button.setText('智能填充（按任务条件）');
        button.setInteractionState(true);
    }
};
