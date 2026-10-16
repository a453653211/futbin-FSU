/* A manual fallback when FUTBIN blocks a cross-site GET. Uses the same userscript's GM storage. */
if (location.hostname === 'www.futbin.com' && location.pathname.replace(/\/$/, '') === '/27/squad-building-challenges/cheapest' &&
    !document.getElementById('fsu-high-value-sync')) {
    const sync = document.createElement('button');
    sync.id = 'fsu-high-value-sync';
    sync.textContent = '同步最低价到 FSU';
    sync.style.cssText = 'position:fixed;right:18px;bottom:24px;z-index:2147483647;padding:12px 18px;background:#d7fa36;color:#121820;border:1px solid #39444e;border-radius:8px;cursor:pointer;font:600 14px sans-serif';
    sync.onclick = () => {
        try {
            const data = FsuHighValue.snapshot(document);
            GM_setValue(FsuHighValue.snapshotKey, JSON.stringify(data));
            sync.textContent = '已同步，返回 EA 点击扫描（15 分钟有效）';
        } catch (error) { sync.textContent = error.message; }
    };
    document.body.append(sync);
}
