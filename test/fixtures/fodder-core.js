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
    window.__fodder = { gallery: { run: null }, mockFactory: nativeRun };
    const nav = document.createElement('nav'); nav.id = 'mock-gallery-tabs';
    for (const title of ['全部套装', '获取代币', '提升分数', '完成套装']) { const b = document.createElement('button'); b.textContent = title; nav.append(b); }
    document.body.append(nav);
})();
