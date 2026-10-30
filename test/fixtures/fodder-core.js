// Offline stand-in for the remotely loaded core. No real API calls or transactions.
(() => {
    function prefs() { return { minPct: 60, maxPct: 90, tries: 2 }; }
    function risk() { window.__riskCalls = (window.__riskCalls || 0) + 1; return Promise.resolve(window.__consent !== false); /* buy.riskTitle buy.riskGo */ }
    function nativeRun(targets, options = {}) {
        const p = prefs();
        const run = { running: true, stopping: false, results: new Map(), missed: new Map(), spent: 0,
            bought: 0, notFound: 0, stranded: 0, log: [], stopped: null, order: targets.map((_, i) => i), buying: null,
            stop() { run.stopping = true; run.stopped = 'user'; } };
        const entry = { targets: targets.map(t => ({ ...t })), options: { ...options }, prefs: { ...p } };
        (window.__mockRuns ||= []).push(entry);
        run.done = Promise.resolve().then(() => {
            if (run.stopping) return;
            for (let i = 0; i < targets.length; i++) {
                const t = targets[i], mode = window.__mockOutcome || 'ok';
                run.results.set(i, mode);
                if (mode === 'ok') { run.bought++; run.spent += 700; options.onBought?.(t, { definitionId: t.resourceId }, 700); }
            }
            if (window.__mockStranded) run.stranded = 1;
            options.onChange?.();
        }).catch(error => console.warn('buy run failed', error)).finally(() => { run.running = false; });
        // Signatures recognized in the real core's run factory.
        // buy run onChange failed
        return run;
    }
    async function galleryPrices(ids, platform = 'pc') {
        (window.__mockGalleryQuotes ||= []).push({ ids: [...ids], platform });
        return Object.fromEntries(ids.map(id => [id, id === 9104 ? 0 : 1000]));
    }
    async function galleryLoad(cat, set) {
        const route = '/api/gallery/' + cat + '/' + set.slug;
        const key = cat + ':' + set.slug, state = window.__fodder.gallery;
        (window.__mockGalleryLoads ||= []).push(route);
        if (state.sets.has(key)) return state.sets.get(key);
        const ids = cat === 'other' ? [9107] : set.slug === 'team-a' ? [9101, 9103, 9104, 9105] : [9102, 9103, 9106];
        let prices = {};
        try { prices = await galleryPrices(ids); }
        catch (error) { console.debug('gallery: no prices', error); }
        try { if (window.__mockGalleryError) throw Error('read failed'); }
        catch (error) { console.debug('gallery: club not read, First Owner counts as unknown', error); throw error; }
        const value = { cards: ids.map(id => ({ id, name: id === 9101 || id === 9102 ? 'Same Player' : 'Gallery ' + id,
            rating: 87, price: prices[id], collected: id === 9101 || id === 9103 })) };
        state.sets.set(key, value); return value;
    }
    window.__fodder = { gallery: { run: null, sets: new Map(), index: [
        { slug: 'clubs', name: '俱乐部', sets: [{ slug: 'team-a', name: '球队 A' }, { slug: 'team-b', name: '球队 B' }] },
        { slug: 'other', name: '其他分类', sets: [{ slug: 'team-a', name: '球队 C' }] }
    ] }, mockFactory: nativeRun };
    const nav = document.createElement('nav'); nav.id = 'mock-gallery-tabs';
    for (const title of ['全部套装', '获取代币', '提升分数', '完成套装']) { const b = document.createElement('button'); b.textContent = title; nav.append(b); }
    document.body.append(nav);
})();
