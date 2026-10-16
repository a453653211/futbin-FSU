// ==UserScript==
// @name         Fodder — SBC tools for FC 26
// @namespace    https://fodder.gg
// @version      0.5.6
// @description  最新卡单独设置每个球员购买数量（1–20张）；保持新旧图鉴入口、原购买引擎及5分钟重试。非官方本地增强版。
// @match        https://www.ea.com/*
// @run-at       document-idle
// @noframes
// @updateURL    none
// @downloadURL    none
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGi0lEQVR4nOxaXWwURRz/zexxvRYsAYoYaCnlFoqCmGifBExE0BBNVGLVxBjCG/FJiDESE22i+KAJD01ffND4Ig/WGKKJIQEMCAFNjKAYasu1zYklkCiftfR6tzPOfs/s7tXZ8woh4Z9sprd3s/f7/ef/fc3gDpcM7nC5S+B2y/8i8MhPH8/N5kp7DEKeBGcrKBE3OR8llJ+jnA2DogALBQpeOLzmjbOYASGoUdb/1vsQBzlMwBeIC4SIC+FFxWvYK8JV3D8PwguU82EqSIqPDHPKCo1Nc4b623bdRA1SE4FHz/a1E2b9KDS+iHAGR/PwVu6B5xIJ5777PhGfI/bq7wv3HyMU/eXr9JNvunomdLFQ1CCUVfYahC+iAozhaF5eBaDYagWrfRKUWw454tz39oFvoIz15u4pH+0+t3uhLpbUPvDEQN8Ci5W3wjeTQIPc0wZzwXEeaJp4mo9oXH0d3u+iDMfEH6t08KQ+AWaV1qma9jUoa9ol4Wjc17yncVnz0ROk4dr5yuCb23TwpCYgHm7aIB0btu1ZAkE9ED54FZSlrMQ2I2e/S5oEZF3lGMR6RgdPahMSIdKkctSJrkgwG+d0IDnydPuD14t18KQmIDSYd0DUbuMI93NpvxytnCh2nx6etAQIX+GaCdOycVKp4NLBIdWcOAvMhQb3QzPyfOyqFh6kkG7+hSGctYOqDjetjQ/1nsBg70lM/X1DAh0NtUEolZ9b0MGUisDNgcHlDoBYHLecL7dBy6SKn5/Gpe9GhNUw/PHlWRc8QhJE0rwhObR3svUnkDGYGdU4SVhtcBcPFTC67xfAKSWAsQMFlC+PJ2s+strKMWaCgEgCZnIcV19f+XkMv/f+oG6dslDcP6RonnJLytSeUrxMTYhVfwKi6jST43io+esDl3Dmg2PgFovt//PACCo3Jr39XsZWkl54sjwjqtl6E6CkkjcSHdhdJ8eu4XTPUVQmysEeIl3l8SkUvy7EHN73qZAEm+xb+ukFLUxIISKBmXLGpJ4Z2H9Xrk3g1LtHUL4xpYAPxfWFkf0FsFI5BMutSOa2zYedg6akPAHLTIrjvDSFUz3f458L4wFwEoD2L1fK42UUvx1NLDsCc+J6DpyKwMsDby0TJ2BES2XRF+DXD0/i6uBlCbgPPi72+0P9w+IUSooDOyHYD7EGrz+BrFEx/RhOpDhum8B48VpVjcvAfXKTl0soHhyLhdCgkON6DpyKgDAU00jIoIaopvJbTUwHOu4LHINfjYJYFakaDZVCaKX+J5ABz4eZU43j7ZtbkZufi4GPgpZJzmuf7SpA0jz1+gpi0foTILYDy/W/FMezOQMru/MB8KToI0vL/c3YsHs1DIMHmvcdWkQga8/yfUXUm4D4EpMk9Lh+HM8/3YbsnFkR4Cp4m1jzkkZsem8tGnIk0HgY1RxH1g6h6Qg4nZjaeclJKNtA0Pl8e1Xg9tXU0oBN769F09yMkgQj1a22A7u4NGTH4I4lokbJeRqSqlE1jq98dimMBiMG3JZZTQY271mDea05qRoN+4mwptLPAdoEjFk8L6V5qQxQ43hTswFzy5KYHxARqTa+sxot+TlVyxA3D6RLYtoExENNuVbxNZ8Ux9e+1CZOQX4sx4adK9HWNTfo4ILOi1vxZshA/QkIbZpqAcaUNlCO47NbsjA3LYLvCw+/2o7Op+6trvlIO5pBaQZOQHJgZQ7EWWIcf/AFYUYGwernFqNrW1usb/A7ODkQeM+xWlubR5FCtKYSApypTOBIOPsMRiI8XOe3NeKxnWag+emmFcGs1FlJ8UXSbyGFaBEQZrOQVJvnQAIv3X9gy8L4KAXhCCVhDmSfTKocoE+A8AkfpKz5dHMgF7ysefVzznNT5QB9AmDjVSdpMhkvOvkj9dC8EjQf2+/4VioHdrFpiPiS/eo8p3ocJ0p0YUqvS4k6APbrf3/WmjaJaRPI8uxHAsSInEGNanE8Qo5CLReoFMWivyewinUcKUWLQE/HZ5MiZK4TYE7H5zmRhtzrkdVMHe0jolNt28TYgdfaj19BStEu5no6+i825RrXG5TvEqBPROM4JcmaDjN2YCZQqlo4969kwF5HDVLzj3x7z3c3cqu0ykJluWEQk9tDL4q8iFbi10reGs0X1X4zE47/V4axjdvbTp5BDVIzgf+SvuLjomOhHQasTu6UIlx0PA65Zd7vCEPiJA7Rqezb2zuOaE2ik2TGCNwqufuvBrdb7ngC/wIAAP//ixEeWwAAAAZJREFUAwA8NWeA6Tt1TAAAAABJRU5ErkJggg==
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      www.futbin.com
// @connect      futbin.com
// @connect      www.futbin.org
// @connect      futbin.org
// ==/UserScript==

(function () {
  "use strict";
/* The privileged side can fetch only public FC 27 catalogue/player metadata, using GET without
 * cookies. No EA endpoint, account token, arbitrary URL, write request or CAPTCHA bypass exists here.
 */
function installFodderPublicBridge(w, channel) {
  const queue = [];
  let inflight = 0, hourly = [];
  const seen = new Set();
  function allowed(raw) {
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' || u.port || u.username || u.password || u.hash) return false;
      if (['www.futbin.com','futbin.com'].includes(u.hostname)) {
        if (/^\/27\/squads\/?$/.test(u.pathname)) return !u.search;
        if (!/^\/27\/totw\/[A-Za-z0-9_-]+\/?$/.test(u.pathname)) return false;
        // FUTBIN serves the same promo's Holo roster under this one public query parameter.
        // Do not allow arbitrary queries, redirects, account endpoints, or another season.
        return !u.search || (Array.from(u.searchParams).length === 1 && u.searchParams.get('holo') === 'true');
      }
      if (!['www.futbin.org','futbin.org'].includes(u.hostname) || u.pathname !== '/futbin/api/27/fetchPlayerInformationMinimal') return false;
      const keys = Array.from(u.searchParams.keys());
      return keys.length === 2 && keys.includes('ID') && keys.includes('platform') &&
        /^\d{1,9}$/.test(u.searchParams.get('ID')) && Number(u.searchParams.get('ID')) > 0 && /^(PC|PS)$/.test(u.searchParams.get('platform'));
    } catch (_) { return false; }
  }
  function reply(id, text, error) {
    w.postMessage({ type:'fgnew-public-reply', channel, id, text: text || '', error: error || '' }, w.location.origin);
  }
  function pump() {
    while (queue.length && inflight < 2) {
      const req = queue.shift(); inflight++;
      let finished = false;
      const finish = (text, error) => {
        if (finished) return; finished = true;
        reply(req.id, text, error);
        w.setTimeout(() => { inflight--; pump(); }, 220);
      };
      try {
        GM_xmlhttpRequest({ method:'GET', url:req.url, anonymous:true, timeout:25000,
          headers:{ Accept:'text/html,application/json;q=0.9' },
          onload: res => {
            if (res.finalUrl && !allowed(res.finalUrl)) return finish('', '数据源跳转到未授权地址，请直接访问 FUTBIN 检查；未继续请求');
            if (res.status === 403 || res.status === 429) return finish('', `FUTBIN 访问受限（HTTP ${res.status}），请稍后刷新；不会自动绕过验证`);
            if (res.status !== 200) return finish('', `公开数据加载失败（HTTP ${res.status}），请稍后重试`);
            const text = String(res.responseText || '');
            if (!text || text.length > 8000000) return finish('', '公开数据响应为空或超出大小限制');
            finish(text, '');
          },
          ontimeout: () => finish('', 'FUTBIN 公开数据请求超时'),
          onerror: () => finish('', '无法连接 FUTBIN 数据源，请检查网络及油猴的跨站请求权限')
        });
      } catch (_) { finish('', '未取得油猴跨站请求权限，请确认脚本已在油猴中启用'); }
    }
  }
  w.addEventListener('message', e => {
    const m = e.data;
    if (e.source !== w || e.origin !== w.location.origin || !m || m.type !== 'fgnew-public-request' || m.channel !== channel) return;
    if (typeof m.id !== 'string' || !/^fgnew-[\w.-]+$/.test(m.id) || seen.has(m.id)) return;
    seen.add(m.id); if (seen.size > 2000) seen.delete(seen.values().next().value);
    if (!allowed(m.url)) { reply(m.id, '', '已拒绝非公开目录/球员元数据请求'); return; }
    const now = Date.now(); hourly = hourly.filter(t => now-t<3600000);
    if (hourly.length >= 300 || queue.length >= 80) { reply(m.id, '', '公开数据请求过于频繁，请稍后再试'); return; }
    hourly.push(now); queue.push(m); pump();
  });
  return { allowed };
}

  const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const channel = 'fgnew-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  installFodderPublicBridge(page, channel);
  function bootFodderPage(channel) {


(async () => {
  'use strict';
  if (window.__fodderGalleryRetry5m) {
    console.warn('[Fodder 弹窗循环] 请勿同时启用两份 Fodder 脚本。');
    return;
  }
/* Gallery purchase-modal retry control. Native buying/authentication stays untouched. */
function createFodderModalRetry(w) {
  'use strict';
  const d = w.document;
  const INTERVAL = 300000;
  const VERSION = '0.5.6';
  let ready = false, failure = '', selectedModal = null, panel = null, enabled = false;
  let arm = null, active = null, ticker = null, observer = null, queued = false;
  let message = '加载循环功能…';
  const safe = (f, fallback = null) => { try { return f(); } catch (_) { return fallback; } };
  const log = (...args) => console.info('[Fodder 弹窗循环]', ...args);
  const sig = (obj) => JSON.stringify(obj, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
    ? Object.keys(v).sort().reduce((a, k) => { a[k] = v[k]; return a; }, {}) : v);
  const str = (el) => String(el && (el.innerText || el.textContent) || '').replace(/\s+/g, ' ').trim();
  const setText = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
  const fieldRE = /^(?:每[名个位位]?球[员員].*(?:尝试|嘗試|尝試)|(?:Attempts|Tries) per player|Tentatives par joueur|Intentos por jugador|Tentativas por jogador)/i;
  const startRE = /^(?:开始购买|開始購買|Start buying|Start purchase|Auto[ -]?buy|自动购买|自動購買)(?:\b|\s|[（(\d]|$)/i;
  const closeRE = /^(?:关闭|關閉|Close|取消|Cancel)(?:\s|Esc|$)/i;
  const gradeRE = /(?:分数|分數|收藏馆|收藏館|图鉴|圖鑑|Gallery|Grades?)/i;

  function visible(el) {
    if (!el || !el.isConnected) return false;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const css = safe(() => w.getComputedStyle(node));
      if (node.hidden || (css && (css.display === 'none' || css.visibility === 'hidden'))) return false;
    }
    return true;
  }
  const buttons = (root) => Array.from(root.querySelectorAll('button,[role="button"]')).filter(visible);
  const isStart = (el) => startRE.test(str(el).replace(/(?:Enter|↵|⏎)/g, '').trim());
  const hasGallery = (root) => {
    const headings = root.querySelectorAll('h1,h2,h3,header,[role="heading"],[class*="title"]');
    return Array.from(headings).some((el) => str(el).length < 110 && gradeRE.test(str(el))) ||
      /(?:gallery|fdgal|grade)/i.test(root.className + ' ' + root.id);
  };
  function findModal() {
    const latestModal = d.querySelector('[data-fg-latest-buy="true"]');
    if (latestModal && visible(latestModal)) {
      const field = latestModal.querySelector('.fgnew-attempts');
      if (field) return { modal: latestModal, field };
    }
    // Anchor on the native settings label, not a minified JS name or an outside floating panel.
    const fields = Array.from(d.querySelectorAll('label,span,p,div,h3,h4'))
      .filter(el => !el.closest('#fg5m-buy-option') && el.childElementCount <= 3 &&
        str(el).length < 80 && fieldRE.test(str(el)) && visible(el));
    for (const label of fields) {
      let field = label;
      for (let k = 0; field && k < 5; k++, field = field.parentElement) {
        const nums = buttons(field).map(str).filter(v => /^[1-5]$/.test(v));
        if (new Set(nums).size < 3) continue;
        for (let modal = field, j = 0; modal && modal !== d.body && j < 10; modal = modal.parentElement, j++) {
          const bs = buttons(modal);
          if (bs.some(isStart) && (bs.some(b => closeRE.test(str(b))) || modal.getAttribute('role') === 'dialog') &&
              hasGallery(modal)) return { modal, field };
        }
        break;
      }
    }
    // The same dialog may swap the settings for progress while buying. Keep our control inside it.
    if (active && visible(active.modal)) return { modal: active.modal, field: null };
    return null;
  }
  function detach() { if (panel) panel.remove(); panel = null; }
  function mount(hit) {
    if (selectedModal !== hit.modal) {
      if (active) stop('已切换购买窗口，循环停止');
      detach(); enabled = false; arm = null; selectedModal = hit.modal;
    }
    if (!panel) {
      panel = d.createElement('div'); panel.id = 'fg5m-buy-option';
      panel.dataset.fodderLoopVersion = VERSION;
      panel.style.cssText = 'position:relative;box-sizing:border-box;flex:none;max-width:100%;margin:18px 0 0;padding:14px 0 0;border-top:1px solid rgba(255,255,255,.12);color:#e9edf4;font:13px/1.6 inherit;';
      panel.innerHTML = '<label style="display:flex;align-items:flex-start;gap:9px;cursor:pointer;font-weight:600;line-height:1.6">' +
        '<input id="fg5m-buy-checkbox" type="checkbox" style="appearance:auto!important;-webkit-appearance:checkbox!important;display:inline-block!important;position:static!important;opacity:1!important;width:17px!important;height:17px!important;min-width:17px;margin:3px 0 0!important;accent-color:#10b98a;cursor:pointer">' +
        '<span>自动循环购买（每轮间隔5分钟）</span></label>' +
        '<div style="margin:5px 0 0 26px;color:#aeb7c6;font-size:12px">仅重试本次未买到的球员，买齐自动停止。</div>' +
        '<div id="fg5m-buy-status" style="margin:5px 0 0 26px;font-size:12px;white-space:normal;overflow-wrap:anywhere"></div>' +
        '<button id="fg5m-buy-stop" type="button" style="display:none;margin:9px 0 0 26px;padding:5px 12px;min-height:0;width:auto;border:1px solid #677383;border-radius:6px;background:transparent;color:inherit;font-size:12px;line-height:1.5;cursor:pointer">停止循环</button>';
      panel.querySelector('input').addEventListener('change', e => {
        enabled = ready && e.target.checked;
        if (!enabled) { arm = null; stop('已取消勾选，循环停止'); }
        message = enabled ? '已启用；点击下方“开始购买”。' : '未勾选时仍只购买一轮。';
        draw();
      });
      panel.querySelector('button').addEventListener('click', e => { e.stopPropagation(); stop('已手动停止循环'); });
      // Prevent the original Enter-to-buy shortcut when interacting with the added controls.
      panel.addEventListener('keydown', e => { if (e.key === 'Enter') e.stopPropagation(); });
    }
    if (hit.field && !hit.field.contains(panel)) hit.field.appendChild(panel);
    else if (!panel.isConnected) {
      const footer = hit.modal.querySelector('footer,[class*="footer"]');
      if (footer) footer.before(panel); else hit.modal.appendChild(panel);
    }
  }
  function pending(s) {
    // Mark only a confirmed purchase/collection complete; never infer success from button text.
    const g = safe(() => w.__fodder.gallery);
    if (!s.options.__fgLatestBuy && g && g.sets && typeof g.sets.values === 'function') {
      for (const set of g.sets.values()) {
        for (const c of (set && Array.isArray(set.cards) ? set.cards : [])) {
          if (c.collected === true && s.ids.has(Number(c.id))) s.bought.add(Number(c.id));
        }
      }
    }
    return s.targets.filter(t => !s.bought.has(Number(t.resourceId)));
  }
  function draw() {
    if (!panel || !panel.isConnected) return;
    const check = panel.querySelector('input');
    check.disabled = !ready; check.checked = enabled;
    const status = panel.querySelector('#fg5m-buy-status');
    const stopBtn = panel.querySelector('#fg5m-buy-stop');
    const showStop = !!active;
    if (stopBtn.style.display !== (showStop ? 'inline-block' : 'none')) stopBtn.style.display = showStop ? 'inline-block' : 'none';
    if (!ready) { setText(status, failure ? '循环功能未接入：' + failure + '。原购买功能不变。' : message); return; }
    if (!active) { setText(status, message + ' · v' + VERSION); return; }
    const s = active;
    if (s.cancelled) setText(status, s.reason + '；正在结束当前请求，不会再启动下一轮。');
    else if (s.phase === 'waiting') {
      const sec = Math.max(0, Math.ceil((s.due - Date.now()) / 1000));
      setText(status, `第${s.round}轮结束，剩余${pending(s).length}人；下一轮 ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`);
    } else setText(status, `第${s.round || 1}轮购买中，剩余${pending(s).length}人。`);
  }
  function scan() {
    const hit = findModal();
    if (hit) { mount(hit); draw(); }
    else {
      if (active) stop('购买窗口已关闭，循环停止');
      detach(); selectedModal = null; enabled = false; arm = null;
    }
  }
  function queueScan() {
    if (queued) return;
    queued = true;
    w.setTimeout(() => { queued = false; safe(scan); }, 80);
  }
  function onActivate(e) {
    const target = e.target && e.target.closest ? e.target.closest('button,[role="button"]') : null;
    if (e.target && e.target.closest && e.target.closest('#fg5m-buy-option')) return;
    // Capture before the native shortcut handler. Native risk acknowledgement is NOT automated.
    const enter = e.type === 'keydown' && e.key === 'Enter' && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    const escape = e.type === 'keydown' && e.key === 'Escape';
    if (escape || (target && selectedModal && selectedModal.contains(target) && closeRE.test(str(target)))) {
      arm = null; stop('已关闭或取消购买，循环停止'); return;
    }
    const hit = findModal();
    if (!hit || !enabled || !ready) return;
    if (enter || (target && hit.modal.contains(target) && isStart(target) && !target.disabled)) {
      if (active) {
        // Do not overlap a second manually-started run with a waiting/active loop.
        e.preventDefault(); e.stopImmediatePropagation(); draw(); return;
      }
      arm = { modal: hit.modal, at: Date.now() };
    }
  }
  function emit(s) {
    sync(s);
    safe(() => { if (typeof s.options.onChange === 'function') s.options.onChange(s.facade); });
    draw();
  }
  function sync(s) {
    const r = s.native;
    if (r) {
      s.facade.buying = r.buying ? Object.assign({}, r.buying, { i: s.index.get(Number(r.buying.id)) ?? r.buying.i }) : null;
      s.facade.spent = s.pastSpent + (Number(r.spent) || 0);
      s.facade.log = (Array.isArray(r.log) ? r.log : []).concat(s.pastLog).slice(0, 250);
      s.facade.stranded = Number(r.stranded) || 0;
      if (r.results && typeof r.results.entries === 'function') {
        for (const [i, value] of r.results) {
          const item = s.roundTargets[Number(i)];
          if (item) s.facade.results.set(s.index.get(Number(item.resourceId)), value);
        }
      }
      if (r.missed && typeof r.missed.entries === 'function') {
        for (const [id, cap] of r.missed) s.facade.missed.set(Number(id), cap);
      }
    }
    for (const id of s.bought) { s.facade.missed.delete(id); s.facade.results.set(s.index.get(id), 'ok'); }
    s.facade.bought = s.bought.size;
    s.facade.notFound = s.facade.missed.size;
  }
  function wake(s) {
    if (s.timer != null) { w.clearTimeout(s.timer); s.timer = null; }
    if (s.resolveWait) { const f = s.resolveWait; s.resolveWait = null; f(); }
    s.due = 0;
  }
  function stop(reason = '已手动停止循环') {
    arm = null;
    const s = active;
    if (!s) return false;
    s.cancelled = true; s.reason = s.reason || reason;
    s.facade.stopping = true; s.facade.stopped = s.facade.stopped || 'user';
    wake(s);
    if (s.native && s.native.running && typeof s.native.stop === 'function') safe(() => s.native.stop());
    emit(s);
    return true;
  }
  function validate(s) {
    if (s.cancelled) return false;
    if (!enabled) { stop('已取消勾选，循环停止'); return false; }
    if (!visible(s.modal)) { stop('购买窗口已关闭，循环停止'); return false; }
    if (sig(s.getPrefs()) !== s.preferences) { stop('购买价格或尝试次数已改变，请重新开始'); return false; }
    return true;
  }
  function wait(s) {
    s.phase = 'waiting'; s.due = Date.now() + INTERVAL; emit(s);
    return new Promise(resolve => {
      s.resolveWait = resolve;
      const later = () => {
        if (s.cancelled || !validate(s)) { wake(s); return; }
        const remaining = s.due - Date.now();
        if (remaining > 0) { s.timer = w.setTimeout(later, remaining); return; }
        wake(s); // No catch-up burst if a background tab was suspended.
      };
      s.timer = w.setTimeout(later, INTERVAL);
    });
  }
  async function loop(s) {
    while (validate(s)) {
      const left = pending(s);
      if (!left.length) { s.reason = '本次待购球员已全部买齐，循环结束。'; break; }
      s.phase = 'buying'; s.round++; s.roundTargets = left; s.native = null;
      for (const item of left) s.facade.results.delete(s.index.get(Number(item.resourceId)));
      emit(s);
      const opts = Object.assign({}, s.options, {
        onChange: () => { if (s.native) emit(s); },
        onBought: (...args) => {
          const id = Number(args[0] && args[0].resourceId);
          if (s.ids.has(id)) s.bought.add(id);
          // Preserve the native Gallery/inventory bookkeeping, including its error behavior.
          if (typeof s.options.onBought === 'function') s.options.onBought(...args);
          emit(s);
        }
      });
      s.native = s.factory.apply(s.thisArg, [left.map(x => Object.assign({}, x)), opts, ...s.extraArgs]);
      if (!s.native || !s.native.done || typeof s.native.done.then !== 'function' || typeof s.native.stop !== 'function')
        throw new Error('原购买流程接口不匹配，已停止循环');
      if (s.cancelled && s.native.running) s.native.stop();
      emit(s);
      await s.native.done;
      sync(s);
      if (s.cancelled) break;
      const r = s.native;
      if (r.running || r.stopping) throw new Error('无法确认本轮已经结束，已停止循环');
      if (r.stopped) { s.facade.stopped = r.stopped; s.reason = '原购买流程已中止（' + String(r.stopped) + '），不自动重试。'; break; }
      if (Number(r.stranded) > 0) { s.reason = '有购买后未处理完成的球员，循环停止。'; break; }
      if (!r.results || typeof r.results.get !== 'function' || r.results.size !== left.length)
        throw new Error('无法确认完整购买结果，已停止循环');
      for (let i = 0; i < left.length; i++) {
        const outcome = r.results.get(i);
        if (outcome === 'ok') s.bought.add(Number(left[i].resourceId));
        else if (outcome !== 'bad') throw new Error('购买结果无法识别，已停止循环');
      }
      sync(s);
      s.pastSpent += Number(r.spent) || 0;
      s.pastLog = s.facade.log.slice();
      s.native = null; s.facade.buying = null;
      if (!pending(s).length) { s.reason = '本次待购球员已全部买齐，循环结束。'; break; }
      if (!validate(s)) break;
      log(`第${s.round}轮结束，剩余${pending(s).length}人，5分钟后重试`);
      await wait(s);
    }
  }
  function createRun(factory, thisArg, args, getPrefs) {
    // Only a checked Gallery/Grades purchase dialog plus a manual Start authorizes looping.
    const permission = arm;
    if (!ready || !enabled || !permission || Date.now() - permission.at > 120000 ||
        !visible(permission.modal) || active) return factory.apply(thisArg, args);
    arm = null;
    const input = Array.isArray(args[0]) ? args[0] : [];
    const targets = input.filter(t => t && Number(t.resourceId) > 0 && Number(t.price) > 0)
      .map(t => Object.assign({}, t, { resourceId: Number(t.resourceId), price: Number(t.price) }));
    const ids = new Set(targets.map(t => t.resourceId));
    if (!targets.length || ids.size !== targets.length || typeof getPrefs !== 'function') {
      message = '本次名单无法用于循环，保留原单轮购买。'; draw(); return factory.apply(thisArg, args);
    }
    let preferences;
    try { preferences = sig(getPrefs()); } catch (_) {
      message = '无法读取价格设置，保留原单轮购买。'; draw(); return factory.apply(thisArg, args);
    }
    const facade = { running: true, stopping: false, order: targets.map((_, i) => i), buying: null,
      results: new Map(), missed: new Map(), bought: 0, notFound: 0, spent: 0, stopped: null, stranded: 0,
      log: [], stop: () => stop('已手动停止循环'), done: null };
    const s = active = { factory, thisArg, targets, ids, index: new Map(targets.map((t, i) => [t.resourceId, i])),
      options: args[1] || {}, extraArgs: args.slice(2), getPrefs, preferences, facade,
      modal: permission.modal, bought: new Set(), pastSpent: 0, pastLog: [], native: null,
      round: 0, phase: 'buying', roundTargets: [], cancelled: false, reason: '', timer: null, resolveWait: null, due: 0 };
    // Defer until the caller assigns the returned run object to its native view state.
    facade.done = Promise.resolve().then(async () => {
      try {
        if (w.navigator.locks && w.navigator.locks.request) {
          await w.navigator.locks.request('fodder-gallery-retry-5m', { ifAvailable: true }, async lock => {
            if (!lock) { s.reason = '另一个标签页正在循环购买，本页未启动。'; facade.stopped = 'busy'; return; }
            await loop(s);
          });
        } else await loop(s);
      } catch (error) {
        s.reason = error && error.message || '循环出现异常，已停止'; facade.stopped = facade.stopped || 'other';
        if (s.native && s.native.running) safe(() => s.native.stop());
        console.warn('[Fodder 弹窗循环]', error);
      } finally {
        wake(s); sync(s);
        facade.running = false; facade.stopping = false; facade.buying = null;
        message = s.reason || '循环已停止。';
        if (active === s) active = null;
        emit(s); log(message);
      }
      return facade;
    });
    draw(); return facade;
  }
  function init() {
    if (!d.body) { d.addEventListener('DOMContentLoaded', init, { once: true }); return; }
    observer = new w.MutationObserver(mutations => {
      if (mutations.some(m => !(m.target.nodeType === 1 ? m.target : m.target.parentElement)?.closest('#fg5m-buy-option'))) queueScan();
    });
    observer.observe(d.body, { childList: true, subtree: true });
    for (const type of ['pointerdown', 'click', 'keydown']) w.addEventListener(type, onActivate, true);
    ticker = w.setInterval(() => {
      if (active && !active.cancelled) validate(active);
      safe(scan);
    }, 1000);
    scan();
  }
  w.addEventListener('pagehide', () => { stop('页面关闭或刷新，循环停止'); if (ticker) w.clearInterval(ticker); if (observer) observer.disconnect(); });
  init();
  return Object.freeze({ createRun, stop,
    ready: () => { ready = true; failure = ''; message = '勾选后，点击下方“开始购买”。'; queueScan(); },
    unavailable: e => { ready = false; failure = String(e && e.message || e || '核心接口不匹配'); queueScan(); },
    status: () => ({ version: VERSION, ready, enabled, phase: active ? active.phase : 'idle', round: active ? active.round : 0,
      remaining: active ? pending(active).length : 0, message, error: failure })
  });
}

/* AST adapter: hook the shared native run factory, NOT the obsolete per-set Gallery button. */
function patchFodderBuyRun(source, parser) {
  if (typeof source !== 'string' || !source) throw new Error('核心脚本为空');
  const ast = parser.parse(source, { ecmaVersion: 'latest', sourceType: 'script' });
  const candidates = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'FunctionDeclaration' && node.id && node.end - node.start < 15000) {
      const body = source.slice(node.body.start, node.body.end);
      if (body.includes('buy run onChange failed') && body.includes('buy run failed') && body.includes('onBought') &&
          /\bresults\s*:/.test(body) && /\bstopping\s*:/.test(body) && /\bdone\s*[:=]/.test(body)) candidates.push(node);
    }
    for (const key of Object.keys(node)) {
      if (['start','end','loc','range'].includes(key)) continue;
      const v = node[key];
      if (Array.isArray(v)) v.forEach(n => { if (n && n.type) visit(n); });
      else if (v && v.type) visit(v);
    }
  }
  visit(ast);
  if (candidates.length !== 1) throw new Error('未识别到唯一的购买引擎');
  const node = candidates[0];
  if (node.async || node.generator || node.params.length < 1) throw new Error('购买引擎结构已变化');
  const vars = node.body.body.find(x => x.type === 'VariableDeclaration');
  const getter = vars && vars.declarations[0] && vars.declarations[0].init;
  if (!getter || getter.type !== 'CallExpression' || getter.callee.type !== 'Identifier' || getter.arguments.length)
    throw new Error('未识别到原价格设置接口');
  const name = node.id.name, nativeName = '__fg5m_native_run_' + name;
  if (source.includes(nativeName)) throw new Error('检测到重复循环补丁');
  const native = source.slice(node.start, node.id.start) + nativeName + source.slice(node.id.end, node.end);
  const wrapper = `\nfunction ${name}(...args){if(window.info?.run?.smartSbc||window.info?.run?.highValue)throw new Error("请先停止智能 SBC / 高价值卡任务。");return window.__fodderGalleryRetry5m.createRun(${nativeName},this,args,()=>args[1]&&args[1].__fgLatestBuy===true?args[1].__fgLatestPrefs:${getter.callee.name}());}\n`;
  const patched = source.slice(0, node.start) + native + wrapper + source.slice(node.end);
  parser.parse(patched, { ecmaVersion: 'latest', sourceType: 'script' });
  return { source: patched, adapter: { factory: name, preferences: getter.callee.name } };
}

/* Export only the existing buyer, its settings and its original risk acknowledgement.
 * The original Gallery adapter remains independently usable when this optional adapter fails.
 */
function patchFodderLatestBridge(source, parser, adapter) {
  const ast = parser.parse(source, { ecmaVersion: 'latest', sourceType: 'script' });
  const functions = [];
  function walk(node, scope = null) {
    if (!node || typeof node !== 'object') return;
    const isFunction = /^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type);
    if (node.type === 'FunctionDeclaration') functions.push({ node, scope });
    const childScope = isFunction ? node : scope;
    for (const k of Object.keys(node)) {
      if (['start','end','loc'].includes(k)) continue;
      const value = node[k];
      if (Array.isArray(value)) value.forEach(x => { if (x?.type) walk(x, childScope); });
      else if (value?.type) walk(value, childScope);
    }
  }
  walk(ast);
  const nativeName = '__fg5m_native_run_' + adapter.factory;
  const factories = functions.filter(f => f.node.id?.name === nativeName);
  if (factories.length !== 1) throw new Error('未能定位原购买引擎，新卡功能未接入');
  const factory = factories[0], node = factory.node;
  const param = node.params[1];
  const options = param?.type === 'Identifier' ? param.name : param?.type === 'AssignmentPattern' && param.left.type === 'Identifier' ? param.left.name : null;
  if (!options) throw new Error('原购买参数结构已变化');
  const init = node.body.body.find(x => x.type === 'VariableDeclaration')?.declarations?.[0]?.init;
  if (!init || init.type !== 'CallExpression' || init.callee.name !== adapter.preferences) throw new Error('原价格设置入口无法确认');
  const risks = functions.filter(f => f.scope === factory.scope && f.node.params.length === 0 &&
    f.node.end - f.node.start < 18000 && source.slice(f.node.start, f.node.end).includes('buy.riskTitle') &&
    source.slice(f.node.start, f.node.end).includes('buy.riskGo'));
  if (risks.length !== 1) throw new Error('未能确认原版购买风险确认接口；不会绕过确认');
  const risk = risks[0].node.id.name;
  const bridge = `\nwindow.__fodderLatestBridge=Object.freeze({
    preferences:()=>${adapter.preferences}(),
    risk:()=>${risk}(),
    run:(targets,options)=>{
      const p=options&&options.__fgLatestPrefs;
      if(!options||options.__fgLatestBuy!==true||!p||![p.minPct,p.maxPct,p.tries].every(Number.isFinite)||p.minPct<0||p.maxPct>200||p.minPct>p.maxPct||!Number.isInteger(p.tries)||p.tries<1||p.tries>5)throw new Error("新卡购买价格参数无法确认");
      if(!Array.isArray(targets)||!targets.length||targets.length>100||targets.some(t=>!Number.isSafeInteger(t.resourceId)||t.resourceId<=0||!Number.isFinite(t.price)||t.price<=0)||new Set(targets.map(t=>t.resourceId)).size!==targets.length)throw new Error("新卡购买名单无效或重复");
      return ${adapter.factory}(targets,options);
    }
  });\n`;
  // Original Gallery calls still use the original getter. New-card prices are a per-task snapshot,
  // not a write to the global Fodder price settings, and are never raised between retry rounds.
  const preferenceExpression = `(${options}&&${options}.__fgLatestBuy===true&&${options}.__fgLatestPrefs?${options}.__fgLatestPrefs:${source.slice(init.start, init.end)})`;
  const changes = [{ start: init.start, end: init.end, text: preferenceExpression }, { start: node.end, end: node.end, text: bridge }];
  let output = source;
  for (const edit of changes.sort((a,b)=>b.start-a.start)) output = output.slice(0,edit.start)+edit.text+output.slice(edit.end);
  parser.parse(output, { ecmaVersion:'latest', sourceType:'script' });
  return { source: output, adapter: { risk, preferences: adapter.preferences, factory: adapter.factory } };
}

/* Recent promo selector. Public FUTBIN catalogue -> exact EA resource ID -> native card and buyer.
 * This module never submits to Gallery, lists/sells cards, or implements transfer-market requests.
 */
function createFodderLatestCards(w, channel) {
  'use strict';
  const d = w.document, YEAR = 27, VERSION = '0.5.6';
  const MAX_PER_CARD = 20, MAX_TOTAL_COPIES = 100, RETRY_INTERVAL = 5 * 60 * 1000;
  const LIST_URL = `https://www.futbin.com/${YEAR}/squads`;
  const LIST_TTL = 10 * 60 * 1000, PRICE_TTL = 5 * 60 * 1000;
  const cacheKey = 'fg-latest-public-catalogue-v2-' + YEAR;
  let bridgeReady = false, bridgeError = '', picker = null, dialog = null, entry = null;
  let squads = [], listAt = 0, current = null, generation = 0, loading = false, listing = false;
  let variantFilter = 'all';
  let entities = new Map(), selected = new Map(), quantities = new Map(), cards = new Map(), views = [], buyViews = [];
  let currentRun = null, starting = false, statusTimer = null, entryTimer = null;
  const outstanding = new Map(), metadataCache = new Map(), batchCache = new Map();
  const safe = (fn, fallback = null) => { try { return fn(); } catch (_) { return fallback; } };
  const norm = value => String(value || '').replace(/\s+/g, ' ').trim();
  const txt = element => norm(element && element.textContent);
  const num = v => v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
  const setText = (el, text) => { if (el && el.textContent !== text) el.textContent = text; };
  const format = n => Number(n || 0).toLocaleString('en-US');
  const sleep = ms => new Promise(resolve => w.setTimeout(resolve, ms));
  const isVisible = el => {
    if (!el || !el.isConnected) return false;
    for (let p = el; p && p.nodeType === 1; p = p.parentElement) {
      const s = w.getComputedStyle(p);
      if (p.hidden || s.display === 'none' || s.visibility === 'hidden') return false;
    }
    return true;
  };
  function el(tag, cls, content) {
    const n = d.createElement(tag);
    if (cls) n.className = cls;
    if (content !== undefined) n.textContent = content;
    return n;
  }
  function button(text, fn, cls = '') {
    const b = el('button', 'fgnew-btn ' + cls, text); b.type = 'button';
    if (fn) b.addEventListener('click', fn);
    return b;
  }
  function link(text, href) {
    const a = el('a', 'fgnew-link', text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function showMessage(message, error = false) {
    const n = picker && picker.querySelector('.fgnew-message');
    setText(n, message); if (n) n.classList.toggle('fgnew-error', error);
  }
  function platform() {
    const p = safe(() => w.services.User.getUser().getSelectedPersona());
    if (!p) throw new Error('尚未读取到游戏平台，请登录 Web 后重试');
    if (p.isXbox || p.isPlaystation || p.isStadia) return 'PS';
    if (p.isPC || p.isPc || p.isPcPersona || /pc|origin|steam/i.test(String(p.platform || p.platformName || ''))) return 'PC';
    // Same persona convention used by the attached FSU: non-console is PC.
    if ('isXbox' in p || 'isPlaystation' in p) return 'PC';
    throw new Error('无法确认 PC / 主机平台，暂不读取或使用价格');
  }
  function assertYear() {
    const actual = safe(() => Number(w.APP_YEAR_SHORT));
    if (actual && actual !== YEAR) throw new Error(`当前 Web 的版本是 FC ${actual}，与新卡来源 FC ${YEAR} 不同，已禁止混用`);
  }
  function publicText(url) {
    const id = 'fgnew-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    return new Promise((resolve, reject) => {
      const timer = w.setTimeout(() => { outstanding.delete(id); reject(new Error('公开数据请求超时，请稍后刷新')); }, 45000);
      outstanding.set(id, { resolve, reject, timer });
      w.postMessage({ type: 'fgnew-public-request', channel, id, url }, w.location.origin);
    });
  }
  w.addEventListener('message', event => {
    const m = event.data;
    if (event.source !== w || event.origin !== w.location.origin || !m || m.channel !== channel || m.type !== 'fgnew-public-reply') return;
    const pending = outstanding.get(m.id); if (!pending) return;
    outstanding.delete(m.id); w.clearTimeout(pending.timer);
    if (m.error) pending.reject(new Error(m.error)); else pending.resolve(String(m.text || ''));
  });
  function htmlDocument(html) {
    if (typeof html !== 'string' || html.length < 30) throw new Error('FUTBIN 返回的页面内容不完整');
    const doc = new w.DOMParser().parseFromString(html, 'text/html');
    const title = txt(doc.querySelector('title'));
    if (/just a moment|attention required|verify.*human|access denied|验证|人机/i.test(title) ||
        (!doc.querySelector('a[href*="/player/"],a[href*="/totw/"]') && /cf-chl-|challenge-platform|captcha/i.test(html))) {
      throw new Error('FUTBIN 返回了访问验证页，无法读取新卡；本次未发起购买');
    }
    return doc;
  }
  function dateFrom(text) {
    let m = String(text || '').match(/(?:Created\s*[:：]?\s*)?(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2}|\d{2})(?!\d)/i);
    if (!m) return null;
    const day = Number(m[1]), month = Number(m[2]), year = Number(m[3]) + (m[3].length === 2 ? 2000 : 0);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return { timestamp: date.getTime(), label: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  }
  function squadTitle(raw, slug = '') {
    // Only title/link text BEFORE "Created" is used. A preview card's .name is a player,
    // not the promo title (the v0.5.0 bug). Detail-page h1 is the authoritative title.
    let name = norm(raw).split(/Created\s*[:：]?|View all\s+\d+\s+Players/i)[0];
    name = name.replace(/\s*\|\s*FUTBIN.*$/i, '')
      .replace(/\s+\d{1,2}[.\/-]\d{1,2}[.\/-](?:20)?\d{2}\s*$/, '').trim();
    if (slug) {
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      name = name.replace(new RegExp('\\s+-\\s+' + escaped + '$', 'i'), '');
    }
    if (!name || name.length > 120 || /^\d|^go back\b|^all (?:EA )?FC\b/i.test(name) || /\b(?:PAC|SHO|DRI|PHY)\b/.test(name)) return '';
    const year = name.match(/^(?:EA\s+)?FC\s+(\d{2})\b/i);
    if (year && Number(year[1]) !== YEAR) return '';
    return /^(?:EA\s+)?FC\s+27\b/i.test(name)
      ? name.replace(/^(?:EA\s+)?FC\s+27\s*/i, 'EA FC 27 ')
      : `EA FC ${YEAR} ${name}`;
  }
  function parseSquads(html) {
    const doc = htmlDocument(html), found = new Map();
    let order = 0;
    for (const a of doc.querySelectorAll('a[href]')) {
      let u; try { u = new URL(a.getAttribute('href'), LIST_URL); } catch (_) { continue; }
      const match = u.pathname.match(new RegExp('^/' + YEAR + '/totw/([A-Za-z0-9_-]+)/?$'));
      if (!match || u.protocol !== 'https:' || !['www.futbin.com', 'futbin.com'].includes(u.hostname)) continue;
      // Normal and Holo are variants within ONE activity, never two of the three recent activities.
      if (u.search && !(Array.from(u.searchParams).length === 1 && u.searchParams.get('holo') === 'true')) continue;
      const raw = txt(a);
      let context = raw, date = dateFrom(context);
      if (!date) {
        for (let p = a.parentElement, i = 0; p && i < 3; p = p.parentElement, i++) {
          const urls = new Set(Array.from(p.querySelectorAll('a[href]')).map(n => n.getAttribute('href')).filter(v => /\/totw\//.test(v)));
          if (urls.size > 1 || txt(p).length > 3500) break;
          if (/created/i.test(txt(p))) { context = txt(p); date = dateFrom(context); if (date) break; }
        }
      }
      const preview = !!a.querySelector('img,[class*="player"],[class*="card"]');
      const hasCreated = /Created\s*[:：]?/i.test(raw);
      // Simple navigation links and the text prefix in the preview agree on the actual squad name.
      const fromSource = (hasCreated || !preview) ? squadTitle(raw, match[1]) : '';
      const name = fromSource || `EA FC ${YEAR} ${match[1].replace(/([a-z])([A-Z])/g, '$1 $2')}`;
      const confidence = fromSource ? (hasCreated ? 3 : 4) : 0;
      const countMatch = context.match(/View all\s+(\d+)\s+Players/i);
      const record = { slug: match[1], name, nameConfidence: confidence,
        url: `https://www.futbin.com/${YEAR}/totw/${match[1]}`,
        date: date ? date.label : '', time: date ? date.timestamp : null, order: order++,
        expected: countMatch ? Number(countMatch[1]) : null };
      const old = found.get(record.slug);
      if (!old) found.set(record.slug, record);
      else {
        // A later preview may add its count/date without overwriting the correct nav-link title.
        if (confidence > old.nameConfidence) { old.name = name; old.nameConfidence = confidence; }
        if (record.date && !old.date) { old.date = record.date; old.time = record.time; }
        if (record.expected && !old.expected && !u.search) old.expected = record.expected;
      }
    }
    const all = Array.from(found.values());
    if (!all.length) throw new Error('未在 FUTBIN 阵容目录中找到 FC 27 的活动批次；没有使用其他赛季的数据');
    all.sort((a, b) => (b.time ?? -1) - (a.time ?? -1) || a.order - b.order);
    return all.slice(0, 3);
  }
  function parseBatchMeta(html, batch) {
    const doc = htmlDocument(html);
    const headings = Array.from(doc.querySelectorAll('h1')).map(txt);
    const exact = headings.find(t => new RegExp('^(?:EA\\s+)?FC\\s+' + YEAR + '\\b', 'i').test(t));
    const title = squadTitle(exact || txt(doc.querySelector('title')), batch.slug) || batch.name;
    let holoUrl = '';
    for (const a of doc.querySelectorAll('a[href]')) {
      const u = safe(() => new URL(a.getAttribute('href'), batch.url));
      if (!u || u.protocol !== 'https:' || !['www.futbin.com','futbin.com'].includes(u.hostname) || u.port || u.username || u.password || u.hash) continue;
      if (u.pathname.replace(/\/$/, '') !== `/27/totw/${batch.slug}`) continue;
      if (Array.from(u.searchParams).length === 1 && u.searchParams.get('holo') === 'true') {
        holoUrl = `https://www.futbin.com/27/totw/${batch.slug}?holo=true`; break;
      }
    }
    return { title, holoUrl };
  }
  function parseTeam(html, batch, variant = 'normal') {
    if (!['normal', 'holo'].includes(variant)) throw new Error('未知卡片版本，已停止读取');
    const doc = htmlDocument(html), rows = new Map();
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    for (const a of anchors) {
      let u; try { u = new URL(a.getAttribute('href'), batch.url); } catch (_) { continue; }
      const m = u.pathname.match(new RegExp('^/' + YEAR + '/player/(\\d+)/([^/]+)/?$'));
      if (!m || !['www.futbin.com', 'futbin.com'].includes(u.hostname)) continue;
      if (a.closest('nav,footer,header')) continue;
      const id = Number(m[1]);
      const row = a.closest('tr');
      const name = txt(a);
      if (!row) continue;
      let record = rows.get(id);
      if (!record) {
        const cells = Array.from(row.querySelectorAll('td'));
        const ratingCell = cells.find(n => /^\d{2}$/.test(txt(n)) && Number(txt(n)) >= 40 && Number(txt(n)) <= 99);
        record = { futbinId: id, name: '', rating: ratingCell ? Number(txt(ratingCell)) : null,
          url: `https://www.futbin.com${u.pathname}`, batch: batch.slug, variant, status: 'loading', error: '' };
        rows.set(id, record);
      }
      if (/[A-Za-z\u00C0-\u024F]/.test(name) && name.length <= 95 && (!record.name || name.length < record.name.length)) record.name = name;
    }
    if (!rows.size) {
      const main = doc.querySelector('main') || doc.body;
      for (const a of main.querySelectorAll('a[href]')) {
        const u = safe(() => new URL(a.getAttribute('href'), batch.url));
        const m = u && u.pathname.match(new RegExp('^/' + YEAR + '/player/(\\d+)/([^/]+)/?$'));
        if (!m || !['www.futbin.com','futbin.com'].includes(u.hostname) || a.closest('nav,footer,header')) continue;
        if (!a.querySelector('img,[class*="card"],[class*="rating"]')) continue;
        const id = Number(m[1]);
        if (rows.has(id)) continue;
        rows.set(id, { futbinId: id, name: decodeURIComponent(m[2]).replace(/-/g, ' '), rating: null,
          url: `https://www.futbin.com${u.pathname}`, batch: batch.slug, variant, status: 'loading', error: '' });
      }
    }
    const result = Array.from(rows.values());
    if (!result.length || result.length > 100) throw new Error('未能识别这批阵容的完整球员名单，已停止加载');
    // The catalogue's count describes Normal; Holo availability need not have the same count.
    // Check each source separately, never compare Normal+Holo against the Normal player count.
    if (variant === 'normal' && batch.expected && result.length !== batch.expected)
      throw new Error(`阵容目录标记${batch.expected}人，但普通版详情读取到${result.length}人，请刷新后重试`);
    for (const r of result) if (!r.name) r.name = decodeURIComponent(r.url.split('/').pop()).replace(/-/g, ' ');
    return result;
  }
  function mergeRosters(normal, holo) {
    const normalIds = new Set(normal.map(c => c.futbinId));
    const different = holo.filter(c => !normalIds.has(c.futbinId));
    const overlap = holo.length - different.length;
    // No ID arithmetic, name matching or relabelling of a Normal card as its Holo counterpart.
    return { rows: normal.concat(different), normalCount: normal.length, holoCount: different.length,
      warning: overlap ? `Holo 来源有${overlap}条与普通版使用相同编号，已排除这些无法区分版本的记录。` : '' };
  }
  function checkVariantIds(rows) {
    const groups = new Map();
    for (const c of rows) {
      if (!c.resourceId) continue;
      if (!groups.has(c.resourceId)) groups.set(c.resourceId, []);
      groups.get(c.resourceId).push(c);
    }
    for (const group of groups.values()) {
      if (new Set(group.map(c => c.variant)).size < 2) continue;
      for (const c of group) { c.status = 'error'; c.error = '不同版本被数据源映射到同一游戏编号，已禁止购买'; }
    }
    return rows;
  }
  const variantName = c => c.variant === 'holo' ? '签名／全息版' : '普通版';
  const purchaseName = c => `${c.name} · ${variantName(c)}`;
  const filteredRows = () => (batchCache.get(current?.slug)?.rows || []).filter(c => variantFilter === 'all' || c.variant === variantFilter);
  function saveCatalogue() { safe(() => w.localStorage.setItem(cacheKey, JSON.stringify({ at: listAt, squads }))); }
  function parsePlayer(data, row, plat) {
    let body; try { body = typeof data === 'string' ? JSON.parse(data) : data; } catch (_) { throw new Error('FUTBIN 球员接口未返回有效 JSON，暂不可购买'); }
    const payload = body && body.data;
    const list = Array.isArray(payload) ? payload : payload && typeof payload === 'object'
      ? (('Player_Resource' in payload || 'resource_id' in payload) ? [payload] : Object.values(payload)) : [];
    const explicit = list.filter(p => p && Number(p.ID ?? p.id ?? p.Player_ID) === row.futbinId);
    const p = explicit.length === 1 ? explicit[0] : list.length === 1 && list[0] &&
      (list[0].ID ?? list[0].id ?? list[0].Player_ID) == null ? list[0] : null;
    if (!p) throw new Error('FUTBIN 球员编号未唯一匹配，未使用姓名猜测版本');
    const rid = num(p.Player_Resource ?? p.resource_id ?? p.resourceId ?? p.eaId);
    if (!Number.isSafeInteger(rid) || rid <= 0 || rid > 0x7fffffff) throw new Error('缺少明确的游戏卡片编号，暂不可购买');
    const prefix = plat === 'PC' ? 'pc_' : 'ps_';
    const price = num(p[prefix + 'LCPrice'] ?? p.LCPrice ?? p.price);
    const min = num(p[prefix + 'MinPrice'] ?? p.MinPrice);
    const max = num(p[prefix + 'MaxPrice'] ?? p.MaxPrice);
    const reward = p.isSbc === true || p.isObjective === true || (min === 0 && max === 0);
    const market = !reward && min !== null && min > 0 && max !== null && max >= min;
    return Object.assign({}, row, { resourceId: rid, price: price && price > 0 ? price : 0, min, max,
      market, priceAt: Date.now(), platform: plat, status: 'metadata',
      error: reward ? 'SBC / 任务奖励卡，不能市场购买' : !market ? '缺少可交易价格范围，暂不可购买' : !price || price <= 0 ? '暂时没有参考价格' : '' });
  }
  async function playerMetadata(row, plat, force = false) {
    const key = plat + ':' + row.futbinId, old = metadataCache.get(key);
    if (!force && old && Date.now() - old.priceAt < PRICE_TTL) return Object.assign({}, row, old, { batch: row.batch, variant: row.variant, url: row.url, name: row.name });
    const api = `https://www.futbin.org/futbin/api/${YEAR}/fetchPlayerInformationMinimal?ID=${row.futbinId}&platform=${plat}`;
    const value = parsePlayer(await publicText(api), row, plat);
    metadataCache.set(key, value); return value;
  }
  async function conceptItems(ids) {
    assertYear();
    const result = new Map();
    if (!w.UTSearchCriteriaDTO || !w.services?.Item?.searchConceptItems) throw new Error('游戏卡片查询组件尚未就绪');
    for (let i = 0; i < ids.length; i += 30) {
      const batch = ids.slice(i, i + 30), owner = {};
      const response = await new Promise((resolve, reject) => {
        let observable, settled = false;
        const finish = (ok, value) => {
          if (settled) return; settled = true; w.clearTimeout(timer);
          safe(() => observable.unobserve(owner)); ok ? resolve(value) : reject(value);
        };
        const timer = w.setTimeout(() => finish(false, new Error('游戏卡片读取超时，未发起购买')), 20000);
        try {
          const criteria = new w.UTSearchCriteriaDTO(); criteria.count = 200; criteria.defId = batch;
          observable = w.services.Item.searchConceptItems(criteria);
          observable.observe(owner, (_event, value) => finish(true, value));
        } catch (e) { finish(false, e); }
      });
      if (!response?.success || !Array.isArray(response.response?.items)) throw new Error('游戏未返回可确认的球员卡数据');
      for (const item of response.response.items) {
        const rid = Number(item && item.definitionId);
        if (batch.includes(rid) && safe(() => item.isPlayer(), false)) result.set(rid, item);
      }
    }
    return result;
  }
  function nativePreferences() {
    if (!bridgeReady || !w.__fodderLatestBridge) throw new Error(bridgeError || '新卡购买接口尚未就绪');
    const prefs = w.__fodderLatestBridge.preferences();
    if (!prefs || typeof prefs !== 'object' || ![prefs.minPct, prefs.maxPct, prefs.tries].every(Number.isFinite) ||
        prefs.minPct < 0 || prefs.maxPct > 200 || prefs.minPct > prefs.maxPct || !Number.isInteger(prefs.tries) || prefs.tries < 1 || prefs.tries > 5)
      throw new Error('原价格设置接口结构已变化；收藏馆原功能不受影响');
    return Object.assign({}, prefs);
  }
  function nativeBusy() {
    const r = safe(() => w.__fodderGalleryRetry5m.status());
    return !!w.info?.run?.smartSbc || !!w.info?.run?.highValue || !!currentRun?.running || starting || !!(r && r.phase !== 'idle') || !!safe(() => w.__fodder.gallery.run.running, false);
  }
  function eligible(c) { return c && c.status === 'ready' && c.market && c.price > 0 && entities.has(c.resourceId); }
  function destroyViews() { for (const view of views) safe(() => view.dealloc()); views = []; }
  function nativeFace(c, small = false, bucket = views) {
    const holder = el('div', small ? 'fgnew-mini-face' : 'fgnew-card-face');
    const original = entities.get(c.resourceId);
    if (!original || !w.UTItemViewFactory?.createLargeItem) {
      holder.append(el('div', 'fgnew-face-placeholder', c.status === 'loading' ? '读取卡面…' : '卡面暂不可用')); return holder;
    }
    try {
      // Render a separate concept copy, never mutate a live club item or Gallery collected flag.
      const copy = new w.UTItemEntity(original);
      if (original.getMetaData && copy.setMetaData) copy.setMetaData(original.getMetaData());
      copy.concept = false; copy.id = Number(c.resourceId);
      const view = w.UTItemViewFactory.createLargeItem(copy);
      view.init(); view.render(copy); bucket.push(view);
      const host = el('div', 'fgnew-native-card'); host.append(view.getRootElement()); holder.append(host);
    } catch (_) { holder.append(el('div', 'fgnew-face-placeholder', '原生卡面暂不可用')); }
    return holder;
  }
  function selectedQuantity(id) {
    const value = Number(quantities.get(Number(id)));
    return Number.isSafeInteger(value) && value >= 1 && value <= MAX_PER_CARD ? value : 1;
  }
  function selectedCopyCount() {
    let result = 0;
    for (const id of selected.keys()) result += selectedQuantity(id);
    return result;
  }
  function removeSelected(id) { selected.delete(Number(id)); quantities.delete(Number(id)); }
  function setSelectedQuantity(id, proposed) {
    id = Number(id);
    if (!selected.has(id)) return;
    const n = Number(proposed);
    if (!Number.isSafeInteger(n) || n < 1 || n > MAX_PER_CARD) {
      showMessage(`每张卡可购买1–${MAX_PER_CARD}张，请填写有效整数。`, true);
      updateSummary(); return;
    }
    if (selectedCopyCount() - selectedQuantity(id) + n > MAX_TOTAL_COPIES) {
      showMessage(`一次购买最多${MAX_TOTAL_COPIES}张，请减少某张卡的数量。`, true);
      updateSummary(); return;
    }
    quantities.set(id, n);
    updateSummary();
  }
  function updateSummary() {
    if (!picker) return;
    const banner = picker.querySelector('.fgnew-bridge-status');
    if (banner) { banner.hidden = bridgeReady; setText(banner, bridgeError ? '新卡购买接口未接入：' + bridgeError + '。收藏馆原功能不受影响。' : '正在连接原购买组件，尚不能开始新卡购买…'); }
    const list = Array.from(selected.values()).filter(eligible);
    const copies = list.reduce((sum, c) => sum + selectedQuantity(c.resourceId), 0);
    setText(picker.querySelector('.fgnew-count'), `已选 ${list.length} 种 · 合计 ${copies} 张 · 参考总价 ${format(list.reduce((sum, c) => sum + c.price * selectedQuantity(c.resourceId), 0))}`);
    const b = picker.querySelector('.fgnew-purchase'); if (b) b.disabled = !list.length || loading || !bridgeReady;
    for (const n of picker.querySelectorAll('[data-fgnew-card]')) {
      const on = selected.has(Number(n.dataset.fgnewCard));
      n.classList.toggle('selected', on); n.setAttribute('aria-pressed', String(on));
      setText(n.querySelector('.fgnew-card-tick'), on ? '✓' : '+');
      const tile = n.closest('.fgnew-card-tile');
      if (!tile) continue;
      tile.classList.toggle('selected', on);
      const id = Number(n.dataset.fgnewCard);
      const field = tile.querySelector('.fgnew-qty-input');
      if (field && d.activeElement !== field) field.value = String(on ? selectedQuantity(id) : 1);
      if (field) field.disabled = !on;
      const minus = tile.querySelector('.fgnew-qty-minus');
      const plus = tile.querySelector('.fgnew-qty-plus');
      if (minus) minus.disabled = !on || selectedQuantity(id) <= 1;
      if (plus) plus.disabled = !on || selectedQuantity(id) >= MAX_PER_CARD || selectedCopyCount() >= MAX_TOTAL_COPIES;
    }
  }
  function renderCards() {
    if (!picker || !current) return;
    destroyViews();
    const grid = picker.querySelector('.fgnew-grid'); grid.replaceChildren();
    const list = filteredRows();
    for (const c of list) {
      const tile = el('div', 'fgnew-card-tile');
      const b = button('', () => {
        if (!eligible(c)) return;
        if (selected.has(c.resourceId)) removeSelected(c.resourceId); else {
          if (selected.size >= 100 || selectedCopyCount() >= MAX_TOTAL_COPIES) {
            showMessage(`一次最多选择${MAX_TOTAL_COPIES}张，请先购买或减少选择。`, true); return;
          }
          selected.set(c.resourceId, c); quantities.set(c.resourceId, 1);
        }
        updateSummary();
      }, 'fgnew-card');
      b.dataset.fgnewCard = String(c.resourceId || -c.futbinId); b.disabled = !eligible(c);
      b.setAttribute('aria-label', `${purchaseName(c)} ${c.rating || ''} ${c.error || ''}`);
      b.append(el('span', 'fgnew-card-tick', '+'), nativeFace(c), el('span', 'fgnew-variant-label ' + (c.variant || 'normal'), variantName(c)), el('strong', 'fgnew-card-name', c.name));
      b.append(el('span', 'fgnew-card-price', c.price > 0 ? format(c.price) + ' 金币' : '暂无参考价'));
      const hint = c.error || (c.status === 'ready' ? '点击卡面选择' : '正在核对游戏版本…');
      b.append(el('span', 'fgnew-card-note', hint)); tile.append(b);
      const qtyBox = el('div', 'fgnew-card-qty');
      const label = el('span', 'fgnew-qty-label', '购买数量');
      const minus = button('−', () => setSelectedQuantity(c.resourceId, selectedQuantity(c.resourceId) - 1), 'fgnew-qty-minus');
      const field = el('input', 'fgnew-qty-input'); field.type = 'number';
      field.min = '1'; field.max = String(MAX_PER_CARD); field.step = '1'; field.inputMode = 'numeric';
      field.value = String(selectedQuantity(c.resourceId));
      field.setAttribute('aria-label', `${purchaseName(c)}购买数量`);
      field.addEventListener('change', () => setSelectedQuantity(c.resourceId, field.value));
      field.addEventListener('blur', updateSummary);
      field.addEventListener('keydown', event => event.stopPropagation());
      const plus = button('+', () => setSelectedQuantity(c.resourceId, selectedQuantity(c.resourceId) + 1), 'fgnew-qty-plus');
      qtyBox.append(label, minus, field, plus); tile.append(qtyBox); grid.append(tile);
    }
    if (!list.length) grid.append(el('p', 'fgnew-empty', loading ? '读取这一版本的卡片中…' : '当前筛选没有已读取的卡片；请查看上方加载提示。'));
    renderVariantFilters(); updateSummary();
  }
  function renderTabs() {
    const tabs = picker && picker.querySelector('.fgnew-batches'); if (!tabs) return;
    tabs.replaceChildren();
    for (const batch of squads) {
      const b = button('', () => { if (!loading && current !== batch) loadBatch(batch); }, 'fgnew-batch');
      b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(current?.slug === batch.slug));
      b.classList.toggle('active', current?.slug === batch.slug); b.disabled = loading;
      b.append(el('strong', '', batch.name), el('span', '', batch.date || '按来源顺序')); tabs.append(b);
    }
  }
  function renderVariantFilters() {
    const host = picker && picker.querySelector('.fgnew-variants'); if (!host) return;
    const rows = batchCache.get(current?.slug)?.rows || [];
    for (const b of host.querySelectorAll('[data-variant-filter]')) {
      const value = b.dataset.variantFilter;
      const n = rows.filter(c => value === 'all' || c.variant === value).length;
      const label = value === 'all' ? '全部' : value === 'normal' ? '普通版' : '签名／全息版';
      setText(b, `${label} ${n}`); b.classList.toggle('active', variantFilter === value);
      b.setAttribute('aria-pressed', String(variantFilter === value)); b.disabled = loading;
    }
    setText(picker.querySelector('.fgnew-select-visible'), variantFilter === 'all' ? '全选本批可购卡' : '全选当前版本可购卡');
  }
  async function loadBatch(batch, force = false) {
    if (loading || !picker) return;
    const gen = ++generation; current = batch; loading = true; renderTabs(); renderCards(); updateSummary();
    try {
      assertYear(); const plat = platform();
      let cached = batchCache.get(batch.slug);
      if (!cached || force || cached.platform !== plat || Date.now() - cached.at > LIST_TTL || cached.holoFailed) {
        showMessage(`读取 ${batch.name} 的普通版和签名／全息版名单…`);
        const normalHTML = await publicText(batch.url);
        if (!picker || gen !== generation) return;
        const meta = parseBatchMeta(normalHTML, batch);
        batch.name = meta.title; batch.holoUrl = meta.holoUrl; saveCatalogue(); renderTabs();
        const normal = parseTeam(normalHTML, batch, 'normal');
        let holo = [], warning = '', holoFailed = false;
        if (meta.holoUrl) {
          try {
            const holoHTML = await publicText(meta.holoUrl);
            if (!picker || gen !== generation) return;
            const holoMeta = parseBatchMeta(holoHTML, batch);
            if (holoMeta.title !== meta.title) throw new Error('Holo 页面返回了不同的活动标题');
            holo = parseTeam(holoHTML, batch, 'holo');
          } catch (error) {
            warning = '签名／全息版未加载成功：' + (error.message || String(error)) + '；点击“刷新批次 / 价格”可重试。';
            holoFailed = true;
          }
        } else warning = '来源页面未提供 Holo 名单入口，暂只显示普通版；未自行猜测签名卡编号。';
        const merged = mergeRosters(normal, holo);
        warning = [warning, merged.warning].filter(Boolean).join(' ');
        cached = { rows: merged.rows, at: Date.now(), platform: plat, warning, holoFailed,
          normalCount: merged.normalCount, holoCount: merged.holoCount };
        batchCache.set(batch.slug, cached);
      }
      if (!picker || gen !== generation) return;
      renderCards();
      let done = 0, cursor = 0;
      const out = new Array(cached.rows.length);
      const worker = async () => {
        while (cursor < cached.rows.length && picker && gen === generation) {
          const index = cursor++, row = cached.rows[index];
          try { out[index] = await playerMetadata(row, plat, force); }
          catch (error) { out[index] = Object.assign({}, row, { status: 'error', error: error.message }); }
          done++; showMessage(`正在核对 ${batch.name}：${done}/${cached.rows.length} 张（含签名／全息版，${plat === 'PC' ? 'PC' : '主机'}价格）`);
          await sleep(160);
        }
      };
      await Promise.all([worker(), worker()]);
      if (!picker || gen !== generation) return;
      cached.rows = checkVariantIds(out.filter(Boolean));
      const ids = Array.from(new Set(cached.rows.filter(c => c.status !== 'error').map(c => c.resourceId).filter(Boolean)));
      if (ids.length) {
        const incoming = await conceptItems(ids);
        if (!picker || gen !== generation) return;
        for (const [id, item] of incoming) entities.set(id, item);
      }
      for (const c of cached.rows) {
        if (c.status === 'error') { if (c.resourceId) removeSelected(c.resourceId); continue; }
        const entity = entities.get(c.resourceId);
        c.status = entity ? 'ready' : 'error';
        if (!entity) c.error = '游戏未匹配到同一卡片编号，暂不可购买';
        if (entity && Number.isFinite(Number(entity.rating))) c.rating = Number(entity.rating);
        cards.set(c.resourceId, c);
        if (selected.has(c.resourceId)) { if (eligible(c)) selected.set(c.resourceId, c); else removeSelected(c.resourceId); }
      }
      const count = cached.rows.filter(eligible).length;
      renderCards();
      showMessage(`${batch.name} · 普通版 ${cached.normalCount} 张 + 签名／全息版 ${cached.holoCount} 张 · ${count} 张可选 · ${plat === 'PC' ? 'PC' : '主机'}参考价。` +
        (cached.warning ? '\n' + cached.warning : '点击卡面选择球员，可为每张卡设置购买数量（1–20）；灰色卡片不可选择。'), !!cached.warning || count === 0);
    } catch (error) { if (picker && gen === generation) showMessage(error.message, true); }
    finally { if (gen === generation) { loading = false; renderTabs(); renderVariantFilters(); updateSummary(); } }
  }
  async function loadList(force = false) {
    if (loading || listing || !picker) return;
    listing = true; const ownerPicker = picker;
    try {
      assertYear(); platform();
      if (force || !squads.length || Date.now() - listAt > LIST_TTL) {
        showMessage('读取 FUTBIN 最近3批阵容…');
        const html = await publicText(LIST_URL);
        if (picker !== ownerPicker) return;
        squads = parseSquads(html); listAt = Date.now(); saveCatalogue();
      }
      if (!picker) return;
      const batch = squads.find(s => s.slug === current?.slug) || squads[0];
      if (force && selected.size) {
        const plat = platform();
        for (const old of Array.from(selected.values()).filter(c => c.batch !== batch.slug)) {
          showMessage('刷新跨批次所选球员的价格…');
          try {
            const c = await playerMetadata(old, plat, true);
            if (c.resourceId !== old.resourceId || !c.market || !entities.has(c.resourceId)) { removeSelected(old.resourceId); continue; }
            c.status = 'ready'; cards.set(c.resourceId, c); selected.set(c.resourceId, c);
            const group = batchCache.get(c.batch);
            if (group) group.rows = group.rows.map(r => r.resourceId === c.resourceId ? c : r);
          } catch (_) { removeSelected(old.resourceId); }
        }
      }
      renderTabs(); await loadBatch(batch, force);
    } catch (error) { if (picker === ownerPicker) showMessage(error.message, true); }
    finally { if (picker === ownerPicker || !picker) listing = false; }
  }
  function closePicker() {
    if (dialog) { closeDialog(); if (dialog) return; }
    generation++; loading = false; listing = false;
    if (picker) picker.remove(); picker = null; destroyViews();
    if (entry) { entry.classList.remove('fgnew-entry-open'); entry.setAttribute('aria-expanded', 'false'); }
  }
  function openPicker() {
    if (picker) return;
    if (nativeBusy()) { w.alert('当前已有购买任务，请先停止或等待它结束，再打开最新卡。'); return; }
    installStyles();
    picker = el('div', 'fgnew-overlay'); picker.id = 'fgnew-picker-overlay';
    const shell = el('section', 'fgnew-shell'); shell.setAttribute('role', 'dialog'); shell.setAttribute('aria-modal', 'true');
    shell.setAttribute('aria-label', '最新卡');
    const header = el('header', 'fgnew-header');
    const topTabs = el('div', 'fgnew-mode-tabs');
    topTabs.append(button('收藏馆', closePicker), button('最新卡', null, 'active')); header.append(topTabs, button('关闭', closePicker));
    const intro = el('div', 'fgnew-intro');
    const title = el('div'); title.append(el('h2', '', '最新卡'), el('p', '', '最近3批活动阵容 · 普通版与签名／全息版均可选择'));
    intro.append(title, link('FUTBIN 来源', LIST_URL));
    const tabs = el('div', 'fgnew-batches'); tabs.setAttribute('role', 'tablist');
    const tools = el('div', 'fgnew-tools');
    tools.append(button('全选本批可购卡', () => {
      if (loading || !current) return;
      for (const c of filteredRows()) {
        if (!eligible(c)) continue;
        if (selected.has(c.resourceId)) { selected.set(c.resourceId, c); continue; }
        if (selectedCopyCount() >= MAX_TOTAL_COPIES) break;
        selected.set(c.resourceId, c); quantities.set(c.resourceId, 1);
      }
      updateSummary();
    }, 'fgnew-select-visible'), button('清空选择', () => { selected.clear(); quantities.clear(); updateSummary(); }), button('刷新批次 / 价格', () => loadList(true)));
    const variants = el('div', 'fgnew-variants'); variants.setAttribute('role', 'group'); variants.setAttribute('aria-label', '卡片版本筛选');
    for (const type of ['all', 'normal', 'holo']) {
      const b = button('', () => { if (loading) return; variantFilter = type; renderCards(); }, 'fgnew-variant-filter');
      b.dataset.variantFilter = type; variants.append(b);
    }
    const message = el('div', 'fgnew-message', '准备读取新卡…'); message.setAttribute('role', 'status');
    const bridgeBanner = el('div', 'fgnew-bridge-status fgnew-message fgnew-error'); bridgeBanner.setAttribute('role', 'status');
    const grid = el('div', 'fgnew-grid');
    const footer = el('footer', 'fgnew-footer');
    footer.append(el('div', 'fgnew-count', '已选 0 种 · 合计 0 张'), button('购买所选球员', openPurchase, 'primary fgnew-purchase'));
    shell.append(header, intro, tabs, variants, tools, message, bridgeBanner, grid, footer); picker.append(shell); d.body.append(picker);
    renderVariantFilters();
    if (entry) { entry.classList.add('fgnew-entry-open'); entry.setAttribute('aria-expanded', 'true'); }
    picker.addEventListener('click', e => { if (e.target === picker) closePicker(); });
    picker.addEventListener('keydown', e => {
      // Keep the existing site's Enter shortcuts from starting a separate unrelated operation.
      if (e.key === 'Escape') { e.stopPropagation(); closePicker(); }
      else if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
    });
    if (!bridgeReady && bridgeError) showMessage('新卡购买接口未接入：' + bridgeError, true);
    loadList(false);
  }
  function closeDialog() {
    if (!dialog) return;
    if (starting || currentRun?.running) {
      safe(() => currentRun?.stop()); safe(() => w.__fodderGalleryRetry5m.stop('已关闭新卡购买窗口'));
    }
    if (statusTimer) w.clearInterval(statusTimer); statusTimer = null;
    dialog.remove(); dialog = null; starting = false;
    for (const view of buyViews) safe(() => view.dealloc()); buyViews = [];
    // Stop accounting continues on its own; do not detach or replace a native in-flight request.
  }
  /* One visual rail with two native, keyboard-accessible range thumbs. */
  function priceRange(prefs, changed) {
    const host = el('div', 'fgnew-range');
    host.setAttribute('role', 'group'); host.setAttribute('aria-label', '价格范围');
    const track = el('div', 'fgnew-range-track'); track.setAttribute('aria-hidden', 'true');
    const fill = el('div', 'fgnew-range-fill'); track.append(fill);
    const low = el('input', 'fgnew-range-low'), high = el('input', 'fgnew-range-high');
    // Both inputs use the SAME coordinates and limits. Never change the scale of one thumb alone.
    const floor = Math.min(5, prefs.minPct), ceiling = Math.max(150, prefs.maxPct);
    for (const input of [low, high]) {
      input.type = 'range'; input.min = String(floor); input.max = String(ceiling); input.step = '1';
    }
    low.setAttribute('aria-label', '最低参考价百分比'); high.setAttribute('aria-label', '最高参考价百分比');
    host.append(track, low, high);
    const paint = () => {
      low.value = String(prefs.minPct); high.value = String(prefs.maxPct);
      const a = (prefs.minPct - floor) * 100 / (ceiling - floor), b = (prefs.maxPct - floor) * 100 / (ceiling - floor);
      fill.style.left = a + '%'; fill.style.width = (b - a) + '%';
      low.setAttribute('aria-valuetext', prefs.minPct + '%'); high.setAttribute('aria-valuetext', prefs.maxPct + '%');
      // Equal thumbs can still be separated: focus + arrows, or a click on either side of the rail.
      low.style.zIndex = low === d.activeElement ? '4' : '2';
      high.style.zIndex = high === d.activeElement ? '4' : '3';
    };
    const update = (input, value) => {
      if (input.disabled || !Number.isFinite(value)) return;
      value = Math.max(floor, Math.min(ceiling, Math.round(value)));
      if (input === low) prefs.minPct = Math.min(value, prefs.maxPct);
      else prefs.maxPct = Math.max(value, prefs.minPct);
      paint(); changed();
    };
    for (const input of [low, high]) {
      input.addEventListener('input', () => update(input, Number(input.value)));
      input.addEventListener('focus', paint); input.addEventListener('blur', paint);
    }
    // Native thumb dragging remains native; empty-rail dragging moves the nearest endpoint.
    let dragInput = null;
    const fromPointer = event => {
      const box = track.getBoundingClientRect();
      return box.width ? floor + (event.clientX - box.left) / box.width * (ceiling - floor) : prefs.minPct;
    };
    host.addEventListener('pointerdown', event => {
      if (event.target === low || event.target === high || low.disabled || event.button !== 0) return;
      const value = fromPointer(event);
      dragInput = Math.abs(value - prefs.minPct) < Math.abs(value - prefs.maxPct) ? low : high;
      if (prefs.minPct === prefs.maxPct) dragInput = value < prefs.minPct ? low : high;
      event.preventDefault(); dragInput.focus(); safe(() => host.setPointerCapture(event.pointerId));
      update(dragInput, value);
    });
    host.addEventListener('pointermove', event => { if (dragInput) update(dragInput, fromPointer(event)); });
    const release = () => { dragInput = null; };
    host.addEventListener('pointerup', release); host.addEventListener('pointercancel', release); host.addEventListener('lostpointercapture', release);
    paint();
    return { element: host, paint, disable(value) { low.disabled = high.disabled = value; host.classList.toggle('disabled', value); if (value) release(); } };
  }
  function openPurchase() {
    if (dialog || loading || nativeBusy()) return;
    let prefs; try { assertYear(); prefs = nativePreferences(); } catch (e) { showMessage(e.message, true); return; }
    // Freeze one row per distinct EA resource ID. Quantity is tracked separately and we send
    // a single instance of each card per native buying round; the engine rejects duplicate IDs.
    const targets = Array.from(selected.values()).filter(eligible)
      .map(c => Object.assign({}, c, { need: selectedQuantity(c.resourceId) }));
    if (!targets.length) return;
    const totalCopies = targets.reduce((n, c) => n + c.need, 0);
    if (totalCopies > MAX_TOTAL_COPIES) { showMessage('本次购买数量超过100张，请减少数量。', true); return; }
    const multi = targets.some(c => c.need > 1);
    if (targets.some(c => c.platform !== platform())) { showMessage('价格平台已改变，请先刷新价格', true); return; }
    if (targets.some(c => Date.now() - c.priceAt > PRICE_TTL)) { showMessage('所选卡的参考价格已超过5分钟，请先点击“刷新批次 / 价格”后重新确认', true); return; }
    const ownDialog = dialog = el('div', 'fgnew-overlay fgnew-buy-overlay'); ownDialog.id = 'fgnew-buy-overlay';
    const modal = el('section', 'fgnew-shell fgnew-buy-shell'); modal.dataset.fgLatestBuy = 'true';
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', '最新卡购买');
    const head = el('header', 'fgnew-header'); head.append(el('h2', '', '最新卡购买'));
    const body = el('div', 'fgnew-buy-body'), tableWrap = el('div', 'fgnew-buy-table');
    const table = el('table'); table.innerHTML = '<thead><tr><th>总评</th><th>球员</th><th>状态</th><th>价格</th></tr></thead>';
    const tbody = el('tbody'); table.append(tbody); tableWrap.append(table);
    const rows = new Map(), boughtCounts = new Map(), payments = new Map(), lastOutcome = new Map();
    const targetMap = new Map(targets.map(c => [c.resourceId, c]));
    let uiRun = null, ownTimer = null, completed = false, notice = '', lastFocus = null;
    let purchaseTask = null, round = 0, roundIndex = new Map(), nextAt = 0;
    let waitTimer = null, waitResolve = null, pastSpent = 0;
    currentRun = null;
    for (const c of targets) {
      const tr = el('tr', 'fgnew-buy-row'); tr.dataset.resourceId = String(c.resourceId); tr.dataset.state = 'pending';
      const rating = el('td', 'fgnew-rating-cell'), ratingBox = el('div', 'fgnew-rating-box');
      ratingBox.append(nativeFace(c, true, buyViews), el('strong', '', String(c.rating || '—'))); rating.append(ratingBox);
      const who = el('td', 'fgnew-buy-who');
      who.append(el('strong', 'fgnew-buy-name', c.name), el('span', 'fgnew-buy-variant ' + (c.variant === 'holo' ? 'holo' : ''), variantName(c)),
        el('span', 'fgnew-buy-quantity', `目标 ${c.need} 张`));
      const state = el('td', 'fgnew-outcome'), badge = el('div', 'fgnew-state-badge');
      const icon = el('span', 'fgnew-state-icon', '·'), label = el('span', 'fgnew-state-label', '待购买');
      icon.setAttribute('aria-hidden', 'true'); badge.append(icon, label);
      const detail = el('div', 'fgnew-state-detail', `已买 0/${c.need} 张`); state.append(badge, detail);
      const money = el('td', 'fgnew-buy-money'), value = el('strong', 'fgnew-row-range'), priceNote = el('span', 'fgnew-price-note', '预估区间');
      money.append(value, priceNote); tr.append(rating, who, state, money); tbody.append(tr);
      rows.set(c.resourceId, { tr, icon, label, detail, value, priceNote });
      boughtCounts.set(c.resourceId, 0); payments.set(c.resourceId, []);
    }
    const right = el('aside', 'fgnew-buy-settings');
    const rangeTitle = el('div', 'fgnew-range-title'); rangeTitle.append(el('span', '', '价格范围'), el('strong', 'fgnew-range-text'));
    const range = priceRange(prefs, paintSettings);
    const attempts = el('div', 'fgnew-attempts'); attempts.append(el('div', '', '每名球员尝试次数'));
    const attemptButtons = el('div', 'fgnew-attempt-buttons'); attempts.append(attemptButtons);
    for (let n = 1; n <= 5; n++) {
      const b = button(String(n), () => { if (starting || purchaseTask?.running) return; prefs.tries = n; paintSettings(); }, 'fgnew-try');
      b.dataset.tries = String(n); attemptButtons.append(b);
    }
    const note = el('p', 'fgnew-muted', multi
      ? '按每张卡设置的目标数量购买。同一版本每轮最多买1张；未买够则每5分钟重试。仍由原购买引擎执行，买到后留在未分配区。'
      : '每个所选版本本次只买1张；买到后留在未分配区，不提交收藏馆。');
    const progress = el('section', 'fgnew-run-summary'); progress.hidden = true;
    progress.setAttribute('aria-label', '购买进度');
    const progressLine = el('div', 'fgnew-progress-line');
    const phaseText = el('strong', 'fgnew-phase'), progressCount = el('strong', 'fgnew-progress-count'); progressLine.append(phaseText, progressCount);
    const bar = el('progress', 'fgnew-progress-bar'); bar.max = totalCopies; bar.value = 0; bar.setAttribute('aria-label', '已买到的球员张数');
    const stats = el('div', 'fgnew-result-counts');
    const boughtN = el('span', 'fgnew-stat-bought'), leftN = el('span', 'fgnew-stat-left'); stats.append(boughtN, leftN);
    const focusName = el('div', 'fgnew-current-player');
    const spentLine = el('div', 'fgnew-spent'); spentLine.append(el('span', '', '已花费'), el('strong', 'fgnew-spent-value', '0'));
    progress.append(progressLine, bar, stats, focusName, spentLine);
    const totals = el('div', 'fgnew-totals');
    const totalValues = new Map();
    for (const [key, text] of [['players','球员'],['low','最低总计（预估）'],['high','最高总计（预估）']]) {
      const line = el('div', 'fgnew-total-line'); const value = el('strong');
      line.append(el('span', '', text), value); totals.append(line); totalValues.set(key, value);
    }
    const runInfo = el('div', 'fgnew-run-info'); runInfo.setAttribute('role', 'status'); runInfo.setAttribute('aria-live', 'polite');
    right.append(rangeTitle, range.element, attempts, note, progress, totals, runInfo); body.append(tableWrap, right);
    const foot = el('footer', 'fgnew-footer');
    const close = button('关闭', closeDialog), start = button('开始购买', startBuying, 'primary');
    const stopSingle = button('停止购买', () => stopTask('已手动停止购买'), 'fgnew-single-stop'); stopSingle.hidden = true;
    foot.append(close, stopSingle, start); modal.append(head, body, foot); ownDialog.append(modal); d.body.append(ownDialog);
    function estimate(c) { return { low: Math.floor(c.price * prefs.minPct / 100), high: Math.floor(c.price * prefs.maxPct / 100) }; }
    function paintSettings() {
      setText(rangeTitle.querySelector('strong'), `${prefs.minPct}% – ${prefs.maxPct}%`);
      for (const b of attemptButtons.children) {
        b.classList.toggle('active', Number(b.dataset.tries) === prefs.tries);
        b.setAttribute('aria-pressed', String(Number(b.dataset.tries) === prefs.tries));
      }
      let lower = 0, upper = 0;
      for (const c of targets) {
        const p = estimate(c); lower += p.low * c.need; upper += p.high * c.need;
        if (!purchaseTask) setText(rows.get(c.resourceId).value, `${format(p.low)} – ${format(p.high)}`);
      }
      setText(totalValues.get('players'), `${totalCopies} 张（${targets.length} 种）`);
      setText(totalValues.get('low'), format(lower)); setText(totalValues.get('high'), format(upper));
    }
    function lockSettings(value) { range.disable(value); for (const b of attemptButtons.children) b.disabled = value; }
    function boughtTotal() { let sum = 0; for (const n of boughtCounts.values()) sum += n; return sum; }
    function stopTask(reason = '已手动停止购买') {
      const task = purchaseTask;
      if (!task || !task.running || task.stopping) return;
      task.stopping = true; task.stopped = 'user'; notice = reason;
      if (waitTimer !== null) { w.clearTimeout(waitTimer); waitTimer = null; }
      if (waitResolve) { const finish = waitResolve; waitResolve = null; finish(); }
      if (uiRun?.running && typeof uiRun.stop === 'function') safe(() => uiRun.stop());
      paintRun();
    }
    function recordBought(id, paid) {
      id = Number(id);
      const c = targetMap.get(id);
      if (!c || !purchaseTask || purchasedThisRound.has(id)) return;
      purchasedThisRound.add(id);
      const count = boughtCounts.get(id) || 0;
      if (count >= c.need) return;
      boughtCounts.set(id, count + 1);
      const cost = Number(paid);
      payments.get(id).push(Number.isFinite(cost) && cost > 0 ? cost : null);
      const left = c.need - count - 1;
      if (left === 0) removeSelected(id);
      else if (selected.has(id)) quantities.set(id, left);
      updateSummary(); paintRun();
    }
    let purchasedThisRound = new Set();
    function paintRun() {
      if (dialog !== ownDialog || !ownDialog.isConnected || !purchaseTask) return;
      const task = purchaseTask, waiting = task.running && nextAt > Date.now();
      let bought = 0;
      for (const c of targets) {
        const id = c.resourceId, r = rows.get(id), got = boughtCounts.get(id) || 0;
        bought += got;
        const p = estimate(c), done = got >= c.need;
        const activeCard = !done && task.running && !waiting && Number(uiRun?.buying?.id) === id;
        const result = uiRun?.results?.get(roundIndex.get(id));
        let state = 'pending', symbol = '·', label = got ? `已买 ${got}/${c.need}` : '待购买', detail = `已买 ${got}/${c.need} 张`;
        let value = `${format(p.low)} – ${format(p.high)}`, priceNote = '预估区间';
        if (done) { state = 'bought'; symbol = '✓'; label = `已买 ${got}/${c.need}`; detail = '已达到目标数量'; }
        else if (activeCard) {
          state = 'buying'; symbol = '↻'; label = `已买 ${got}/${c.need}`;
          const at = Number(uiRun.buying.at), of = Number(uiRun.buying.of);
          detail = at > 0 && of > 0 ? `第 ${at}/${of} 次尝试` : '正在查询市场';
          const cap = Number(uiRun.buying.cap);
          if (cap > 0 && Number.isFinite(cap)) { value = '≤ ' + format(cap); priceNote = '当前查询上限'; }
        } else if (result === 'bad' || lastOutcome.get(id)?.state === 'bad') {
          state = 'missed'; symbol = '×'; label = `已买 ${got}/${c.need}`;
          detail = waiting ? '本轮未买到 · 等待重试' : task.running ? '本轮未找到合适挂牌' : '未买够目标数量';
          const cap = Number(lastOutcome.get(id)?.cap ?? uiRun?.missed?.get(id));
          if (cap > 0 && Number.isFinite(cap)) { value = '≤ ' + format(cap); priceNote = '本轮查询上限'; }
        } else if (waiting) { label = `已买 ${got}/${c.need}`; detail = '等待5分钟后继续购买'; }
        else if (!task.running || task.stopping) { state = 'stopped'; symbol = '—'; label = `已买 ${got}/${c.need}`; detail = '任务已停止'; }
        if (payments.get(id)?.length) {
          const latestPrice = payments.get(id).filter(n => n !== null).at(-1);
          if (latestPrice > 0 && !activeCard) { value = format(latestPrice); priceNote = '最近实际成交价'; }
        }
        r.tr.dataset.state = state; setText(r.icon, symbol); setText(r.label, label); setText(r.detail, detail);
        setText(r.value, value); setText(r.priceNote, priceNote);
      }
      const remaining = totalCopies - bought;
      progress.hidden = false; bar.value = bought;
      setText(progressCount, `${bought} / ${totalCopies}`);
      setText(boughtN, `✓ 已买到 ${bought} 张`); setText(leftN, `待购买 ${remaining} 张`);
      setText(spentLine.querySelector('strong'), format(pastSpent + (Number(uiRun?.spent) || 0)) + ' 金币');
      const phase = task.stopping ? '正在停止' : waiting ? `第${round}轮结束 · 等待重试` : task.running ? `第${round}轮购买中`
        : remaining ? '购买已停止' : '全部买齐';
      setText(phaseText, phase);
      if (task.running) { setText(start, task.stopping ? '正在停止' : waiting ? '等待下一轮' : '购买中'); start.disabled = true; }
      const buying = task.running && uiRun?.buying;
      const countdown = Math.max(0, Math.ceil((nextAt - Date.now()) / 1000));
      setText(focusName, buying ? `正在购买：${buying.name || ''}` : waiting ? `仍需 ${remaining} 张，下一轮 ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}。` : '');
      focusName.hidden = !focusName.textContent;
      const id = Number(buying?.id);
      if (id && id !== lastFocus && rows.has(id)) {
        lastFocus = id;
        const rowBox = rows.get(id).tr.getBoundingClientRect(), listBox = tableWrap.getBoundingClientRect();
        if (rowBox.bottom > listBox.bottom) tableWrap.scrollTop += rowBox.bottom - listBox.bottom + 12;
        else if (rowBox.top < listBox.top + 40) tableWrap.scrollTop += rowBox.top - listBox.top - 40;
      }
      stopSingle.hidden = !task.running || task.stopping;
      if (completed) {
        const reason = task.stopped === 'user' ? '已手动停止' : task.stopped ? `购买已中止（${String(task.stopped)}）`
          : remaining ? '本次购买未完成' : '本次已全部买齐';
        setText(runInfo, `${reason}：已买 ${bought}/${totalCopies} 张，尚需 ${remaining} 张。${notice || ''}`);
      } else setText(runInfo, notice);
    }
    function waitFiveMinutes(task) {
      nextAt = Date.now() + RETRY_INTERVAL; uiRun = null; paintRun();
      return new Promise(resolve => {
        waitResolve = resolve;
        const later = () => {
          if (task.stopping || dialog !== ownDialog) { waitTimer = null; waitResolve = null; resolve(); return; }
          const left = nextAt - Date.now();
          if (left > 0) { waitTimer = w.setTimeout(later, left); return; }
          waitTimer = null; waitResolve = null; resolve();
        };
        waitTimer = w.setTimeout(later, RETRY_INTERVAL);
      }).finally(() => { nextAt = 0; paintRun(); });
    }
    async function startBuying() {
      if (starting || purchaseTask?.running || dialog !== ownDialog) return;
      if (nativeBusy()) { setText(runInfo, '其他购买任务仍在运行，请先结束它。'); return; }
      starting = true; start.disabled = true; lockSettings(true); notice = '';
      try {
        assertYear();
        // Risk confirmation stays in the original Fodder component; never bypass this step.
        ownDialog.style.zIndex = '50'; if (picker) picker.style.zIndex = '49';
        const consent = await w.__fodderLatestBridge.risk();
        ownDialog.style.zIndex = ''; if (dialog === ownDialog && picker) picker.style.zIndex = '';
        if (!consent) return;
        if (dialog !== ownDialog || !ownDialog.isConnected) return;
        if (targets.some(c => Date.now() - c.priceAt > PRICE_TTL)) throw new Error('参考价格已过期，请关闭窗口、刷新价格并重新确认');
        const frozenPrefs = Object.freeze(Object.assign({}, prefs));
        const task = purchaseTask = { running:true, stopping:false, stopped:null, stop:() => stopTask() };
        currentRun = task;
        ownTimer = statusTimer = w.setInterval(paintRun, 1000);
        while (!task.stopping && dialog === ownDialog) {
          const stillNeeded = targets.filter(c => (boughtCounts.get(c.resourceId) || 0) < c.need);
          if (!stillNeeded.length) break;
          round++; purchasedThisRound = new Set();
          roundIndex = new Map(stillNeeded.map((c, i) => [c.resourceId, i]));
          for (const c of stillNeeded) lastOutcome.delete(c.resourceId);
          // Every round has unique card IDs; native runner handles the real EA buy transaction.
          const native = w.__fodderLatestBridge.run(stillNeeded.map(c => ({ resourceId: c.resourceId, price: c.price, name: purchaseName(c) })), {
            leaveUnassigned:true, keepDuplicates:true, __fgLatestBuy:true, __fgLatestPrefs:frozenPrefs,
            onBought:(target, _item, paid) => recordBought(target.resourceId, paid),
            onChange:() => paintRun()
          });
          if (!native?.done || typeof native.stop !== 'function') throw new Error('原购买接口结构已变化，已停止');
          uiRun = native; paintRun();
          if (task.stopping && native.running) native.stop();
          await native.done;
          // The original runner finished. Account spent coins once, even on manual stop.
          uiRun = null; pastSpent += Number(native.spent) || 0;
          // Validate the full round before retrying to avoid duplicate purchases on ambiguous results.
          if (task.stopping) break;
          if (native.stopped || Number(native.stranded) > 0) {
            task.stopped = native.stopped || 'stranded';
            notice = native.stopped ? '原购买流程已中止，不再自动重试。' : '有球员尚未分配完成，请检查未分配区。';
            uiRun = null; break;
          }
          if (!native.results || typeof native.results.get !== 'function' || native.results.size !== stillNeeded.length)
            throw new Error('购买结果不完整，已停止重试，避免重复买卡');
          for (let i = 0; i < stillNeeded.length; i++) {
            const c = stillNeeded[i], outcome = native.results.get(i);
            if (outcome === 'ok') recordBought(c.resourceId, null);
            else if (outcome === 'bad') lastOutcome.set(c.resourceId, { state:'bad', cap:Number(native.missed?.get(c.resourceId)) || 0 });
            else throw new Error('购买结果不明确，已停止重试');
          }
          uiRun = null; paintRun();
          if (boughtTotal() >= totalCopies) break;
          if (!multi) break; // All quantity=1: preserve the original single-pass behaviour.
          if (task.stopping || dialog !== ownDialog) break;
          await waitFiveMinutes(task);
        }
      } catch (error) {
        notice = error.message || '购买未能启动';
        if (purchaseTask) purchaseTask.stopped = 'other';
        safe(() => uiRun?.stop()); console.warn('[Fodder 最新卡]', error);
      } finally {
        ownDialog.style.zIndex = '';
        if (waitTimer !== null) { w.clearTimeout(waitTimer); waitTimer = null; }
        if (waitResolve) { const resolve = waitResolve; waitResolve = null; resolve(); }
        nextAt = 0; uiRun = null;
        if (purchaseTask) { purchaseTask.running = false; purchaseTask.stopping = false; }
        if (currentRun === purchaseTask) currentRun = null;
        if (ownTimer) { w.clearInterval(ownTimer); if (statusTimer === ownTimer) statusTimer = null; ownTimer = null; }
        if (dialog === ownDialog) {
          if (picker) picker.style.zIndex = '';
          starting = false; completed = !!purchaseTask; paintRun();
          stopSingle.hidden = true;
          if (purchaseTask) {
            start.textContent = '返回选卡'; start.removeEventListener('click', startBuying);
            start.addEventListener('click', closeDialog, { once:true }); start.disabled = false;
          } else { start.disabled = false; lockSettings(false); setText(runInfo, notice); }
        }
      }
    }
    ownDialog.addEventListener('click', event => { if (event.target === ownDialog) closeDialog(); });
    ownDialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); closeDialog(); }
      if (event.key === 'Enter') { event.stopPropagation(); event.preventDefault(); }
    });
    paintSettings();
  }
  function findGalleryTabRow() {
    // Fodder's Gallery labels changed in Oct 2026:
    // 分类 / 代币 / 分数 / 套装 -> 全部套装 / 获取代币 / 提升分数 / 完成套装.
    // Keep both wordings and their English/Traditional-Chinese equivalents. The last
    // section, rather than the top-level "图鉴" heading, anchors our custom tab.
    const types = [
      /^(?:分类|分類|Categories|全部套装|全部套裝|All\s+Sets?)$/i,
      /^(?:代币|代幣|Tokens?|获取代币|獲取代幣|Earn\s+Tokens?|Get\s+Tokens?)$/i,
      /^(?:分数|分數|Grades?|提升分数|提升分數|Raise\s+Grades?|Improve\s+Grades?)$/i,
      /^(?:套装|套裝|Sets?|完成套装|完成套裝|Complete\s+Sets?)$/i
    ];
    const kind = n => types.findIndex(re => re.test(txt(n)));
    const isCandidate = n => !n.closest('.fgnew-overlay,#fgnew-latest-tab') &&
      txt(n).length <= 40 && kind(n) >= 0 && isVisible(n);
    const controls = Array.from(d.querySelectorAll('button,[role="tab"],[role="button"],a,[class*="tab"]'))
      .filter(isCandidate);
    let candidates = controls;
    // Some releases replaced buttons by div/span-based tabs. Fall back to their
    // short leaf labels only if the regular controls didn't produce enough matches.
    if (new Set(controls.map(kind)).size < 3) {
      const leaves = Array.from(d.querySelectorAll('span,div,li'))
        .filter(n => n.childElementCount <= 1 && isCandidate(n));
      candidates = Array.from(new Set([...controls, ...leaves]));
    }
    for (const n of candidates) {
      for (let row = n.parentElement, depth = 0; row && row !== d.body && depth < 6; row = row.parentElement, depth++) {
        const children = candidates.filter(x => row.contains(x));
        if (new Set(children.map(kind)).size < 3) continue;
        if (row.getBoundingClientRect().height > 120) break;
        const last = children.find(x => kind(x) === 3);
        if (!last) continue;
        const native = last.closest('button,[role="tab"],[role="button"],a') || last;
        let slot = native;
        while (slot.parentElement && slot.parentElement !== row) slot = slot.parentElement;
        if (slot === row || !row.contains(slot)) continue;
        return { row, slot, sample: native };
      }
    }
    return null;
  }
  function attachEntry() {
    if (!d.body || !w.services?.Item || !w.repositories) return;
    const hit = findGalleryTabRow();
    if (!hit) { if (entry) entry.hidden = true; return; }
    if (!entry) {
      entry = button('最新卡', event => { event.stopPropagation(); openPicker(); }, 'fgnew-entry');
      entry.id = 'fgnew-latest-tab'; entry.title = '最近3批活动阵容，含普通版及签名／全息版';
      entry.setAttribute('aria-haspopup', 'dialog'); entry.setAttribute('aria-controls', 'fgnew-picker-overlay');
      entry.setAttribute('aria-expanded', 'false');
      entry.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); });
    }
    // Copy visual typography only, never clone native handlers, route IDs or React/Preact props.
    // No absolute coordinates: the new control flows after Sets and reflows with the native row.
    if (entry.parentElement !== hit.row || entry.previousElementSibling !== hit.slot) {
      hit.slot.insertAdjacentElement('afterend', entry);
      const css = w.getComputedStyle(hit.sample);
      for (const key of ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing']) entry.style[key] = css[key];
      entry.style.removeProperty('left'); entry.style.removeProperty('top');
    }
    entry.hidden = false;
  }
  function installStyles() {
    if (d.getElementById('fgnew-styles')) return;
    const style = el('style'); style.id = 'fgnew-styles';
    style.textContent = `
#fgnew-latest-tab{position:relative;inset:auto;display:inline-flex;align-items:center;justify-content:center;align-self:stretch;flex:0 0 auto;vertical-align:middle;box-sizing:border-box;margin:0 0 0 8px;padding:8px 4px;min-height:0;height:auto;width:auto;font-family:inherit;font-size:14px;font-weight:600;line-height:1.4;background:transparent;color:inherit;opacity:.7;border:0;border-bottom:2px solid transparent;border-radius:0;box-shadow:none;white-space:nowrap;cursor:pointer;text-transform:none}
#fgnew-latest-tab:hover,#fgnew-latest-tab:focus-visible,#fgnew-latest-tab.fgnew-entry-open{color:#e9edf4;opacity:1;border-bottom-color:#16c79a;background:transparent}
.fgnew-variants{display:flex;gap:8px;padding:5px 22px;flex:none;flex-wrap:wrap}.fgnew-variant-filter.fgnew-btn{font-size:12px;padding:4px 12px;min-height:28px;border-radius:18px}.fgnew-variant-label{font-size:10px;line-height:16px;color:#a2b2c4;border:1px solid #435165;border-radius:4px;padding:1px 8px}.fgnew-variant-label.holo{color:#ccbbff;border-color:#8879bd;background:#6b52a322}.fgnew-message{white-space:pre-line}.fgnew-empty{grid-column:1/-1;color:#9eafc0;font-size:13px;padding:24px;text-align:center}
#fgnew-latest-tab[hidden]{display:none!important}
.fgnew-overlay{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(2,8,15,.75);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#e9edf4}
.fgnew-overlay *{box-sizing:border-box}.fgnew-overlay [hidden]{display:none!important}
.fgnew-shell{width:min(1120px,95vw);height:min(900px,92vh);max-height:94vh;background:linear-gradient(130deg,#171d29,#0e1d25);border:1px solid #3b4656;border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px #0007}
.fgnew-header,.fgnew-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 22px;flex:none}.fgnew-header{border-bottom:1px solid #ffffff16}.fgnew-footer{border-top:1px solid #ffffff16;background:#10352f55}
.fgnew-header h2,.fgnew-intro h2{font-size:20px;font-weight:700;margin:0;line-height:1.5;color:#e9edf4}
.fgnew-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;position:relative;padding:8px 15px;min-height:34px;width:auto;border:1px solid #ffffff20;border-radius:7px;background:#ffffff06;color:#e9edf4;font:600 13px/1.5 inherit;cursor:pointer;white-space:normal;text-transform:none;box-shadow:none}
.fgnew-btn:hover{background:#ffffff13}.fgnew-btn:disabled{opacity:.45;cursor:default}.fgnew-btn.primary{background:#0db98b;border-color:#0db98b;color:#06251d;min-width:170px;font-weight:700}.fgnew-btn.primary:hover{background:#22c99c}
.fgnew-mode-tabs{display:flex;gap:10px}.fgnew-mode-tabs .active,.fgnew-btn.active{color:#51e3bb;border-color:#159679;background:#168e782b}
.fgnew-intro{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 22px 10px;flex:none}.fgnew-intro p{margin:4px 0 0;font-size:12px;color:#a5b2c3}.fgnew-link{color:#55d7b5;font-size:12px;white-space:nowrap;text-decoration:none}
.fgnew-batches{display:flex;gap:12px;padding:10px 22px;flex:none}.fgnew-batch{flex:1;min-width:0;overflow-wrap:anywhere;display:flex;flex-direction:column;align-items:flex-start;padding:12px 16px;text-align:left;border-radius:10px}.fgnew-batch strong{font-size:14px;white-space:normal;overflow-wrap:anywhere}.fgnew-batch span{font-size:11px;color:#a7b5c4}.fgnew-batch.active{background:#13483f7a;border-color:#269d82;color:#6df0c9}
.fgnew-tools{display:flex;flex-wrap:wrap;gap:10px;padding:6px 22px;flex:none}.fgnew-tools .fgnew-btn{font-size:12px;padding:5px 10px;min-height:30px}.fgnew-message{min-height:32px;margin:8px 22px 5px;color:#9eafc0;font-size:12px;flex:none;overflow-wrap:anywhere}.fgnew-error{color:#ffb3a9}
.fgnew-grid{flex:1;min-height:0;overflow:auto;display:grid;grid-auto-rows:max-content;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:14px;padding:14px 22px 22px;align-content:start}
.fgnew-card-tile{min-width:0;min-height:max-content;align-self:start;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:#111923;border:1px solid #ffffff12}.fgnew-card-tile.selected{border-color:#0eca98}.fgnew-card-tile>.fgnew-card{flex:1;max-width:100%;width:100%}
.fgnew-card.fgnew-btn{display:flex;flex-direction:column;justify-content:flex-start;gap:6px;min-height:305px;padding:12px 8px 13px;border-radius:12px;background:#111923;border:1px solid #ffffff12;overflow:hidden;opacity:1}.fgnew-card.fgnew-btn:disabled{opacity:.45}.fgnew-card.fgnew-btn.selected{border:2px solid #0eca98;background:#103b344f;padding:11px 7px 12px;box-shadow:0 0 0 2px #0eca9815}
.fgnew-card-tick{position:absolute;top:9px;right:9px;z-index:2;width:22px;height:22px;line-height:20px;text-align:center;border:1px solid #ffffff40;border-radius:50%;color:#a8bbca;font-size:16px}.fgnew-card.selected .fgnew-card-tick{background:#0dbe8e;color:#082820;border-color:#0dbe8e}
.fgnew-card-face{width:165px;height:210px;position:relative;pointer-events:none;display:flex;align-items:center;justify-content:center;overflow:visible}.fgnew-native-card{transform:scale(.8);transform-origin:center center;flex:none}.fgnew-native-card>.item{position:relative!important}.fgnew-face-placeholder{color:#8293a5;font-size:12px}
.fgnew-card-qty{display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 7px;border-top:1px solid #ffffff16;min-height:45px}.fgnew-card-tile:not(.selected) .fgnew-card-qty{opacity:.55}
.fgnew-qty-label{font-size:11px;color:#aebaca;white-space:nowrap;margin-right:auto}.fgnew-card-qty .fgnew-btn{min-height:27px;height:27px;min-width:27px;padding:0 6px;font-size:16px;line-height:1}.fgnew-card-qty input[type=number]{min-height:27px!important;height:27px!important;width:40px!important;max-width:40px!important;padding:2px 3px!important;border:1px solid #526475!important;border-radius:5px!important;background:#1e2b35!important;color:#e9edf4!important;text-align:center;font:600 13px/1.5 system-ui,sans-serif!important;appearance:textfield!important;-moz-appearance:textfield!important}.fgnew-card-qty input::-webkit-inner-spin-button,.fgnew-card-qty input::-webkit-outer-spin-button{appearance:none!important;margin:0}
.fgnew-card-name{font-size:13px;line-height:18px;text-align:center;min-height:18px;max-width:100%;overflow-wrap:anywhere;color:#e9edf4}.fgnew-card-price{color:#2bd4a1;font-size:14px;font-weight:700}.fgnew-card-note{font-size:11px;line-height:16px;color:#9fafbe;text-align:center;min-height:16px}.fgnew-count{font-size:13px;color:#d3dfeb}
.fgnew-buy-overlay{z-index:100010;background:rgba(2,8,15,.86)}
.fgnew-buy-shell{width:min(1060px,95vw);height:min(820px,91vh)}
.fgnew-buy-body{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,1fr);flex:1;min-height:0;padding:22px;gap:24px}
.fgnew-buy-table{min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#425261 transparent}
.fgnew-buy-table table{border-collapse:collapse;table-layout:fixed;width:100%;font-size:13px;color:#e9edf4;background:transparent}
.fgnew-buy-table th{font-size:11px;font-weight:500;color:#8998aa;text-align:left;padding:0 6px 14px;position:sticky;top:0;background:#161f29;z-index:3}
.fgnew-buy-table th:nth-child(1){width:80px}.fgnew-buy-table th:nth-child(2){width:31%}.fgnew-buy-table th:nth-child(3){width:26%}.fgnew-buy-table th:last-child{text-align:right}
.fgnew-buy-table td{padding:11px 6px;border-top:1px solid #ffffff16;text-align:left;white-space:normal;line-height:1.5;vertical-align:middle;overflow-wrap:anywhere;background:transparent}
.fgnew-buy-table td.fgnew-buy-money{text-align:right;font-variant-numeric:tabular-nums}
.fgnew-rating-box{display:flex;align-items:center;gap:8px}.fgnew-rating-box>strong{font-size:15px}
.fgnew-mini-face{width:32px;height:46px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;pointer-events:none}
.fgnew-mini-face .fgnew-native-card{transform:scale(.17);transform-origin:center center;flex:none}
.fgnew-mini-face .fgnew-face-placeholder{font-size:9px;line-height:12px}
.fgnew-buy-name{display:block;font-size:13px;font-weight:650;line-height:1.4}.fgnew-buy-variant{display:block;font-size:10px;color:#92a3b6;margin-top:4px;font-weight:400}
.fgnew-buy-variant.holo{color:#c3acec}.fgnew-buy-quantity{display:block;font-size:11px;color:#36caa3;margin-top:4px}.fgnew-state-badge{display:flex;align-items:center;gap:5px;line-height:1.35}
.fgnew-state-icon{height:17px;width:17px;border-radius:50%;background:#ffffff09;text-align:center;line-height:17px;flex:none;font-size:12px;font-weight:700}
.fgnew-state-label{font-size:12px;font-weight:600;color:#afbccb}.fgnew-state-detail,.fgnew-price-note{display:block;font-size:10px;font-weight:400;line-height:1.5;color:#8192a6;margin-top:4px}
.fgnew-row-range{display:block;font-size:13px;line-height:1.4;color:#2ad5a2;font-weight:700}
.fgnew-buy-row[data-state=bought]{background:#13b88b09}.fgnew-buy-row[data-state=bought] .fgnew-state-icon{background:#14b88b;color:#082820}
.fgnew-buy-row[data-state=bought] .fgnew-state-label,.fgnew-buy-row[data-state=bought] .fgnew-row-range{color:#3be1ac}
.fgnew-buy-row[data-state=missed] .fgnew-state-icon{background:#d34d5620;color:#f28b8b}.fgnew-buy-row[data-state=missed] .fgnew-state-label,.fgnew-buy-row[data-state=missed] .fgnew-row-range{color:#f09087}
.fgnew-buy-row[data-state=buying]{background:#339bcc14}.fgnew-buy-row[data-state=buying] .fgnew-state-label,.fgnew-buy-row[data-state=buying] .fgnew-row-range{color:#6fcdec}
.fgnew-buy-row[data-state=buying] .fgnew-state-icon{color:#6fcdec;animation:fgnew-spin 1.6s linear infinite}
.fgnew-buy-row[data-state=stopped] .fgnew-row-range{color:#8192a6}
@keyframes fgnew-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.fgnew-buy-row[data-state=buying] .fgnew-state-icon{animation:none}}
.fgnew-buy-settings{border-left:1px solid #ffffff16;padding-left:22px;display:flex;flex-direction:column;gap:10px;min-height:0;overflow:auto}
.fgnew-range-title{display:flex;justify-content:space-between;gap:12px;font-size:13px}.fgnew-range-title>span{color:#aab5c5}.fgnew-range-text{white-space:nowrap}
.fgnew-range{height:26px;min-height:26px;position:relative;margin:0 0 6px;touch-action:none;direction:ltr}
.fgnew-range-track{position:absolute;left:7px;right:7px;top:11px;height:4px;border-radius:4px;background:#313c4c;cursor:pointer}
.fgnew-range-fill{position:absolute;top:0;height:4px;border-radius:4px;background:#32c5a1;pointer-events:none}
.fgnew-buy-shell .fgnew-range input[type=range]{appearance:none!important;-webkit-appearance:none!important;position:absolute!important;inset:0!important;display:block!important;opacity:1!important;width:100%!important;height:26px!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;pointer-events:none;direction:ltr;outline:0;transform:none!important}
.fgnew-range input[type=range]::-webkit-slider-runnable-track{height:4px;background:transparent;border:0;box-shadow:none}
.fgnew-range input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:0;border-radius:50%;background:#e9edf4;box-shadow:0 1px 3px #0004;pointer-events:auto;cursor:grab}
.fgnew-range input[type=range]::-moz-range-track{height:4px;background:transparent;border:0;box-shadow:none}
.fgnew-range input[type=range]::-moz-range-progress{height:4px;background:transparent}
.fgnew-range input[type=range]::-moz-range-thumb{width:14px;height:14px;border:0;border-radius:50%;background:#e9edf4;pointer-events:auto;cursor:grab}
.fgnew-range input[type=range]:focus-visible::-webkit-slider-thumb{outline:2px solid #29d8aa;outline-offset:3px}
.fgnew-range input[type=range]:focus-visible::-moz-range-thumb{outline:2px solid #29d8aa;outline-offset:3px}
.fgnew-range.disabled{opacity:.55}.fgnew-range input[type=range]:disabled::-webkit-slider-thumb{cursor:default;pointer-events:none}.fgnew-range input[type=range]:disabled::-moz-range-thumb{cursor:default;pointer-events:none}
.fgnew-attempts{margin-top:4px;color:#aab5c5;font-size:13px}.fgnew-attempt-buttons{display:flex;gap:7px;margin-top:10px}.fgnew-try.fgnew-btn{width:31px;height:31px;min-height:31px;border-radius:50%;padding:0}
.fgnew-muted{font-size:11px;color:#90a0b2;line-height:1.7;margin:12px 0 8px}
.fgnew-run-summary{border-top:1px solid #ffffff16;padding:16px 0 10px;margin-top:3px}.fgnew-progress-line{display:flex;justify-content:space-between;gap:10px;font-size:12px}
.fgnew-phase{font-size:12px;font-weight:600}.fgnew-progress-count{color:#3cddb2;font-variant-numeric:tabular-nums}
.fgnew-progress-bar{display:block;width:100%;height:5px;border:0;border-radius:4px;margin:12px 0 10px;appearance:none;accent-color:#22c59a;background:#303d4d}
.fgnew-progress-bar::-webkit-progress-bar{background:#303d4d;border-radius:4px}.fgnew-progress-bar::-webkit-progress-value{background:#22c59a;border-radius:4px}.fgnew-progress-bar::-moz-progress-bar{background:#22c59a;border-radius:4px}
.fgnew-result-counts{display:flex;justify-content:space-between;font-size:12px;color:#efab97;gap:8px}.fgnew-stat-bought{color:#39dfad}.fgnew-current-player{font-size:11px;color:#a8bbce;margin-top:12px;line-height:1.6;overflow-wrap:anywhere}
.fgnew-spent{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:#a7b6c7;margin-top:15px}.fgnew-spent-value{color:#ecf3fa;font-size:15px;font-variant-numeric:tabular-nums}
.fgnew-totals{border-top:1px solid #ffffff16;padding-top:12px;margin-top:auto;font-size:12px;color:#b8c4d2}.fgnew-total-line{display:flex;justify-content:space-between;gap:10px;margin:6px 0}.fgnew-total-line>strong{color:#e9edf4;font-size:13px;font-variant-numeric:tabular-nums}.fgnew-total-line:last-child>strong{color:#25d4a3}
.fgnew-run-info{font-size:12px;color:#c8d6e5;line-height:1.6;overflow-wrap:anywhere}.fgnew-run-info:empty{display:none}
@media(max-width:700px){.fgnew-shell{width:98vw;height:96vh;border-radius:12px;max-height:96vh}.fgnew-batches{padding:8px;gap:6px}.fgnew-batch{padding:8px}.fgnew-batch strong{font-size:11px}.fgnew-intro,.fgnew-header,.fgnew-footer{padding:12px}.fgnew-tools{padding:6px 10px;gap:5px}.fgnew-message{margin:6px 10px}.fgnew-grid{padding:10px;gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}.fgnew-card.fgnew-btn{min-height:270px}.fgnew-card-face{height:180px;width:150px}.fgnew-native-card{transform:scale(.67)}.fgnew-buy-body{padding:12px;gap:12px;grid-template-columns:1fr;overflow:auto}.fgnew-buy-table{max-height:37vh;min-height:180px;flex:none}.fgnew-buy-settings{border-left:0;padding-left:0;min-height:340px;overflow:visible}.fgnew-intro p{max-width:70vw}.fgnew-footer .fgnew-btn.primary{min-width:120px}.fgnew-count{font-size:11px}}
@media(max-width:700px){.fgnew-buy-body{grid-template-columns:minmax(0,1fr);padding:12px}.fgnew-buy-table table{min-width:390px}.fgnew-buy-table th:nth-child(1){width:65px}.fgnew-buy-table th:nth-child(2){width:29%}.fgnew-rating-box{gap:3px}.fgnew-mini-face{width:26px}.fgnew-buy-settings{border-left:0;padding-left:0}.fgnew-mini-face .fgnew-native-card{transform:scale(.15)}.fgnew-buy-table .fgnew-buy-name{font-size:12px}.fgnew-buy-table .fgnew-row-range{font-size:12px}}

`;
    d.head.append(style);
  }
  function init() {
    installStyles();
    const cached = safe(() => JSON.parse(w.localStorage.getItem(cacheKey)));
    if (cached && Array.isArray(cached.squads) && Date.now() - cached.at < LIST_TTL &&
        cached.squads.length > 0 && cached.squads.length <= 3 && cached.squads.every(s => typeof s.slug === 'string' && /^[A-Za-z0-9_-]+$/.test(s.slug) && typeof s.name === 'string' && /^EA FC 27 /.test(s.name))) {
      squads = cached.squads.map(s => Object.assign({}, s, { url: `https://www.futbin.com/${YEAR}/totw/${s.slug}` })); listAt = cached.at;
    }
    entryTimer = w.setInterval(attachEntry, 1000); attachEntry();
  }
  if (d.body) init(); else d.addEventListener('DOMContentLoaded', init, { once: true });
  w.addEventListener('pagehide', () => {
    generation++; safe(() => currentRun?.stop());
    if (entryTimer) w.clearInterval(entryTimer); if (statusTimer) w.clearInterval(statusTimer);
    for (const q of outstanding.values()) { w.clearTimeout(q.timer); q.reject(new Error('页面已关闭')); } outstanding.clear();
    destroyViews(); for (const view of buyViews) safe(() => view.dealloc()); buyViews = [];
  });
  return Object.freeze({
    ready: () => { bridgeReady = true; bridgeError = ''; updateSummary(); },
    unavailable: e => { bridgeReady = false; bridgeError = String(e?.message || e || '核心结构不匹配'); updateSummary(); },
    status: () => ({ version: VERSION, ready: bridgeReady, running: !!(starting || currentRun?.running), error: bridgeError, batches: squads.map(s => s.name), selected: selected.size, tabMatched: !!findGalleryTabRow(), entryVisible: !!(entry && isVisible(entry)) }),
    // Pure, read-only parsers for local regression tests. They never execute requests or purchase anything.
    parsers: Object.freeze({ parseSquads, parseTeam, parsePlayer, dateFrom, squadTitle, parseBatchMeta, mergeRosters, checkVariantIds })
  });
}

/* Bundled Acorn parser (MIT), used only to inspect JS; no extra CDN request.
MIT License

Copyright (C) 2012-2022 by various contributors (see AUTHORS)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
const fg5mParser = (() => {
const module = {exports:{}}; const exports=module.exports;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.acorn = {}));
})(this, (function (exports) { 'use strict';

  // This file was generated. Do not modify manually!
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 80, 3, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 343, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 726, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

  // This file was generated. Do not modify manually!
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 2, 60, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 42, 9, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 496, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0897-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c8a\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7cd\ua7d0\ua7d1\ua7d3\ua7d5-\ua7dc\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range.

  // Reserved word lists for various dialects of the language

  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  var keywordRelationalOperator = /^in(stanceof)?$/;

  // ## Character categories

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) { return false }
      pos += set[i + 1];
      if (pos >= code) { return true }
    }
    return false
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) { return code === 36 }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes)
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) { return code === 36 }
    if (code < 58) { return true }
    if (code < 65) { return false }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  }

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var TokenType = function TokenType(label, conf) {
    if ( conf === void 0 ) conf = {};

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec})
  }
  var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  // Map keyword names to token types.

  var keywords = {};

  // Succinct definitions of keyword token types
  function kw(name, options) {
    if ( options === void 0 ) options = {};

    options.keyword = name;
    return keywords[name] = new TokenType(name, options)
  }

  var types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),
    coalesce: binop("??", 1),

    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
  }

  function nextLineBreak(code, from, end) {
    if ( end === void 0 ) end = code.length;

    for (var i = from; i < end; i++) {
      var next = code.charCodeAt(i);
      if (isNewLine(next))
        { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
    }
    return -1
  }

  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;

  var hasOwn = Object.hasOwn || (function (obj, propName) { return (
    hasOwnProperty.call(obj, propName)
  ); });

  var isArray = Array.isArray || (function (obj) { return (
    toString.call(obj) === "[object Array]"
  ); });

  var regexpCache = Object.create(null);

  function wordsRegexp(words) {
    return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
  }

  function codePointToString(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) { return String.fromCharCode(code) }
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = function Position(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function offset (n) {
    return new Position(this.line, this.column + n)
  };

  var SourceLocation = function SourceLocation(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) { this.source = p.sourceFile; }
  };

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      var nextBreak = nextLineBreak(input, cur, offset);
      if (nextBreak < 0) { return new Position(line, offset - cur) }
      ++line;
      cur = nextBreak;
    }
  }

  // A second argument must be given to configure the parser process.
  // These options are recognized (only `ecmaVersion` is required):

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
    // (the latest version the library supports). This influences
    // support for strict mode, the set of reserved words, and support
    // for new syntax features.
    ecmaVersion: null,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"` or `"module"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called when
    // a semicolon is automatically inserted. It will be passed the
    // position of the inserted semicolon as an offset, and if
    // `locations` is enabled, it is given the location as a `{line,
    // column}` object as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program, and an import.meta expression
    // in a script isn't considered an error.
    allowImportExportEverywhere: false,
    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: null,
    // When enabled, super identifiers are not constrained to
    // appearing in methods and do not raise an error when they appear elsewhere.
    allowSuperOutsideMethod: null,
    // When enabled, hashbang directive in the beginning of file is
    // allowed and treated as a line comment. Enabled by default when
    // `ecmaVersion` >= 2023.
    allowHashBang: false,
    // By default, the parser will verify that private properties are
    // only used in places where they are valid and have been declared.
    // Set this to false to turn such checks off.
    checkPrivateFields: true,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    // When this option has an array as value, objects representing the
    // comments are pushed to it.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };

  // Interpret and default an options object

  var warnedAboutEcmaVersion = false;

  function getOptions(opts) {
    var options = {};

    for (var opt in defaultOptions)
      { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

    if (options.ecmaVersion === "latest") {
      options.ecmaVersion = 1e8;
    } else if (options.ecmaVersion == null) {
      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
        warnedAboutEcmaVersion = true;
        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
      }
      options.ecmaVersion = 11;
    } else if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }

    if (options.allowReserved == null)
      { options.allowReserved = options.ecmaVersion < 5; }

    if (!opts || opts.allowHashBang == null)
      { options.allowHashBang = options.ecmaVersion >= 14; }

    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) { return tokens.push(token); };
    }
    if (isArray(options.onComment))
      { options.onComment = pushComment(options, options.onComment); }

    return options
  }

  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start: start,
        end: end
      };
      if (options.locations)
        { comment.loc = new SourceLocation(this, startLoc, endLoc); }
      if (options.ranges)
        { comment.range = [start, end]; }
      array.push(comment);
    }
  }

  // Each scope gets a bitset that may contain these flags
  var
      SCOPE_TOP = 1,
      SCOPE_FUNCTION = 2,
      SCOPE_ASYNC = 4,
      SCOPE_GENERATOR = 8,
      SCOPE_ARROW = 16,
      SCOPE_SIMPLE_CATCH = 32,
      SCOPE_SUPER = 64,
      SCOPE_DIRECT_SUPER = 128,
      SCOPE_CLASS_STATIC_BLOCK = 256,
      SCOPE_CLASS_FIELD_INIT = 512,
      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
  }

  // Used in checkLVal* and declareName to determine the type of a binding
  var
      BIND_NONE = 0, // Not a binding
      BIND_VAR = 1, // Var-style binding
      BIND_LEXICAL = 2, // Let- or const-style binding
      BIND_FUNCTION = 3, // Function declaration
      BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
      BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") { reserved += " await"; }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = types$1.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos);

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false;

    // Positions to delayed-check that yield/await does not exist in default parameters.
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    // Labels in scope.
    this.labels = [];
    // Thus-far undefined exports.
    this.undefinedExports = Object.create(null);

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
      { this.skipLineComment(2); }

    // Scope tracking for duplicate variable names (see scope.js)
    this.scopeStack = [];
    this.enterScope(SCOPE_TOP);

    // For RegExp validation
    this.regexpState = null;

    // The stack of private names.
    // Each element has two properties: 'declared' and 'used'.
    // When it exited from the outermost class definition, all used private names must be declared.
    this.privateNameStack = [];
  };

  var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

  Parser.prototype.parse = function parse () {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node)
  };

  prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

  prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 };

  prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 };

  prototypeAccessors.canAwait.get = function () {
    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
      var ref = this.scopeStack[i];
        var flags = ref.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) { return false }
      if (flags & SCOPE_FUNCTION) { return (flags & SCOPE_ASYNC) > 0 }
    }
    return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
  };

  prototypeAccessors.allowSuper.get = function () {
    var ref = this.currentThisScope();
      var flags = ref.flags;
    return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod
  };

  prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

  prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

  prototypeAccessors.allowNewDotTarget.get = function () {
    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
      var ref = this.scopeStack[i];
        var flags = ref.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) ||
          ((flags & SCOPE_FUNCTION) && !(flags & SCOPE_ARROW))) { return true }
    }
    return false
  };

  prototypeAccessors.inClassStaticBlock.get = function () {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
  };

  Parser.extend = function extend () {
      var plugins = [], len = arguments.length;
      while ( len-- ) plugins[ len ] = arguments[ len ];

    var cls = this;
    for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
    return cls
  };

  Parser.parse = function parse (input, options) {
    return new this(options, input).parse()
  };

  Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
  };

  Parser.tokenizer = function tokenizer (input, options) {
    return new this(options, input)
  };

  Object.defineProperties( Parser.prototype, prototypeAccessors );

  var pp$9 = Parser.prototype;

  // ## Parser utilities

  var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) { return false }
    for (;;) {
      // Try to find string literal.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) { return false }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" ||
          (lineBreak.test(spaceAfter[0]) &&
           !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
      }
      start += match[0].length;

      // Skip semicolon, if any.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";")
        { start++; }
    }
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true
    } else {
      return false
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc
  };

  // Consumes contextual keyword if possible.

  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) { return false }
    this.next();
    return true
  };

  // Asserts that following token is given contextual keyword.

  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) { this.unexpected(); }
  };

  // Test whether a semicolon can be inserted at the current position.

  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof ||
      this.type === types$1.braceR ||
      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon)
        { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
      return true
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
  };

  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma)
        { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
      if (!notNext)
        { this.next(); }
      return true
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  var DestructuringErrors = function DestructuringErrors() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1;
  };

  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) { return }
    if (refDestructuringErrors.trailingComma > -1)
      { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
  };

  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) { return false }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
    if (shorthandAssign >= 0)
      { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
    if (doubleProto >= 0)
      { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
  };

  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
    if (this.awaitPos)
      { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
  };

  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      { return this.isSimpleAssignTarget(expr.expression) }
    return expr.type === "Identifier" || expr.type === "MemberExpression"
  };

  var pp$8 = Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp$8.parseTopLevel = function(node) {
    var exports = Object.create(null);
    if (!node.body) { node.body = []; }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports);
      node.body.push(stmt);
    }
    if (this.inModule)
      { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
        {
          var name = list[i];

          this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
        } }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType;
    return this.finishNode(node, "Program")
  };

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
    // For ambiguous cases, determine if a LexicalDeclaration (or only a
    // Statement) is allowed here. If context is not empty then only a Statement
    // is allowed. However, `let [` is an explicit negative lookahead for
    // ExpressionStatement, so special-case it first.
    if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
    if (context) { return false }

    if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
    if (isIdentifierStart(nextCh, true)) {
      var pos = next + 1;
      while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
      if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
      var ident = this.input.slice(next, pos);
      if (!keywordRelationalOperator.test(ident)) { return true }
    }
    return false
  };

  // check 'async [no LineTerminator here] function'
  // - 'async /*foo*/ function' is OK.
  // - 'async /*\n*/ function' is invalid.
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 === this.input.length ||
       !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
  };

  pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
    if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;

    if (lineBreak.test(this.input.slice(this.pos, next))) { return false }

    if (isAwaitUsing) {
      var awaitEndPos = next + 5 /* await */, after;
      if (this.input.slice(next, awaitEndPos) !== "using" ||
        awaitEndPos === this.input.length ||
        isIdentifierChar(after = this.input.charCodeAt(awaitEndPos)) ||
        (after > 0xd7ff && after < 0xdc00)
      ) { return false }

      skipWhiteSpace.lastIndex = awaitEndPos;
      var skipAfterUsing = skipWhiteSpace.exec(this.input);
      if (skipAfterUsing && lineBreak.test(this.input.slice(awaitEndPos, awaitEndPos + skipAfterUsing[0].length))) { return false }
    }

    if (isFor) {
      var ofEndPos = next + 2 /* of */, after$1;
      if (this.input.slice(next, ofEndPos) === "of") {
        if (ofEndPos === this.input.length ||
          (!isIdentifierChar(after$1 = this.input.charCodeAt(ofEndPos)) && !(after$1 > 0xd7ff && after$1 < 0xdc00))) { return false }
      }
    }

    var ch = this.input.charCodeAt(next);
    return isIdentifierStart(ch, true) || ch === 92 // '\'
  };

  pp$8.isAwaitUsing = function(isFor) {
    return this.isUsingKeyword(true, isFor)
  };

  pp$8.isUsing = function(isFor) {
    return this.isUsingKeyword(false, isFor)
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp$8.parseStatement = function(context, topLevel, exports) {
    var starttype = this.type, node = this.startNode(), kind;

    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
    case types$1._debugger: return this.parseDebuggerStatement(node)
    case types$1._do: return this.parseDoStatement(node)
    case types$1._for: return this.parseForStatement(node)
    case types$1._function:
      // Function as sole body of either an if statement or a labeled statement
      // works, but not when it is part of a labeled statement that is the sole
      // body of an if statement.
      if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
      return this.parseFunctionStatement(node, false, !context)
    case types$1._class:
      if (context) { this.unexpected(); }
      return this.parseClass(node, true)
    case types$1._if: return this.parseIfStatement(node)
    case types$1._return: return this.parseReturnStatement(node)
    case types$1._switch: return this.parseSwitchStatement(node)
    case types$1._throw: return this.parseThrowStatement(node)
    case types$1._try: return this.parseTryStatement(node)
    case types$1._const: case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") { this.unexpected(); }
      return this.parseVarStatement(node, kind)
    case types$1._while: return this.parseWhileStatement(node)
    case types$1._with: return this.parseWithStatement(node)
    case types$1.braceL: return this.parseBlock(true, node)
    case types$1.semi: return this.parseEmptyStatement(node)
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) // '(' or '.'
          { return this.parseExpressionStatement(node, this.parseExpression()) }
      }

      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel)
          { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
        if (!this.inModule)
          { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) { this.unexpected(); }
        this.next();
        return this.parseFunctionStatement(node, true, !context)
      }

      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
      if (usingKind) {
        if (topLevel && this.options.sourceType === "script") {
          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script`");
        }
        if (usingKind === "await using") {
          if (!this.canAwait) {
            this.raise(this.start, "Await using cannot appear outside of async function");
          }
          this.next();
        }
        this.next();
        this.parseVar(node, false, usingKind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration")
      }

      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
        { return this.parseLabeledStatement(node, maybeName, expr, context) }
      else { return this.parseExpressionStatement(node, expr) }
    }
  };

  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
    else if (this.type !== types$1.name) { this.unexpected(); }
    else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    var i = 0;
    for (; i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
        if (node.label && isBreak) { break }
      }
    }
    if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  };

  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")
  };

  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6)
      { this.eat(types$1.semi); }
    else
      { this.semicolon(); }
    return this.finishNode(node, "DoWhileStatement")
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, null)
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      return this.parseForAfterInit(node, init$1, awaitAt)
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;

    var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
    if (usingKind) {
      var init$2 = this.startNode();
      this.next();
      if (usingKind === "await using") { this.next(); }
      this.parseVar(init$2, true, usingKind);
      this.finishNode(init$2, "VariableDeclaration");
      return this.parseForAfterInit(node, init$2, awaitAt)
    }
    var containsEsc = this.containsEsc;
    var refDestructuringErrors = new DestructuringErrors;
    var initPos = this.start;
    var init = awaitAt > -1
      ? this.parseExprSubscripts(refDestructuringErrors, "await")
      : this.parseExpression(true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
        if (this.type === types$1._in) { this.unexpected(awaitAt); }
        node.await = true;
      } else if (isForOf && this.options.ecmaVersion >= 8) {
        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
        else if (this.options.ecmaVersion >= 9) { node.await = false; }
      }
      if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init)
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  // Helper method to parse for loop after variable initialization
  pp$8.parseForAfterInit = function(node, init, awaitAt) {
    if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init.declarations.length === 1) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types$1._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      return this.parseForIn(node, init)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
  };

  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    // allow function declarations in branches, but only in non-strict mode
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement")
  };

  pp$8.parseReturnStatement = function(node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction)
      { this.raise(this.start, "'return' outside of function"); }
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")
  };

  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(0);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    var cur;
    for (var sawDefault = false; this.type !== types$1.braceR;) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) { this.finishNode(cur, "SwitchCase"); }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) { this.unexpected(); }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) { this.finishNode(cur, "SwitchCase"); }
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement")
  };

  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
      { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")
  };

  // Reused empty array added for node fields that are always empty.

  var empty$1 = [];

  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);

    return param
  };

  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) { this.unexpected(); }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer)
      { this.raise(node.start, "Missing catch or finally clause"); }
    return this.finishNode(node, "TryStatement")
  };

  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration")
  };

  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement")
  };

  pp$8.parseWithStatement = function(node) {
    if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement")
  };

  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement")
  };

  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
      {
      var label = list[i$1];

      if (label.name === maybeName)
        { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    } }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i = this.labels.length - 1; i >= 0; i--) {
      var label$1 = this.labels[i];
      if (label$1.statementStart === node.start) {
        // Update information about previous labels on this node
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else { break }
    }
    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement")
  };

  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement")
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
    if ( node === void 0 ) node = this.startNode();

    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) { this.enterScope(0); }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) { this.strict = false; }
    this.next();
    if (createNewLexicalScope) { this.exitScope(); }
    return this.finishNode(node, "BlockStatement")
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement")
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();

    if (
      init.type === "VariableDeclaration" &&
      init.declarations[0].init != null &&
      (
        !isForIn ||
        this.options.ecmaVersion < 8 ||
        this.strict ||
        init.kind !== "var" ||
        init.declarations[0].id.type !== "Identifier"
      )
    ) {
      this.raise(
        init.start,
        ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
      );
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
  };

  // Parse a list of variable declarations.

  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
        this.unexpected();
      } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
        this.raise(this.lastTokEnd, ("Missing initializer in " + kind + " declaration"));
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) { break }
    }
    return node
  };

  pp$8.parseVarId = function(decl, kind) {
    decl.id = kind === "using" || kind === "await using"
      ? this.parseIdent()
      : this.parseBindingAtom();

    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };

  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

  // Parse a function declaration or literal (depending on the
  // `statement & FUNC_STATEMENT`).

  // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
        { this.unexpected(); }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    if (statement & FUNC_STATEMENT) {
      node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT))
        // If it is a regular function declaration in sloppy mode, then it is
        // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
        // mode depends on properties of the current scope (see
        // treatFunctionsAsVar).
        { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
    }

    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));

    if (!(statement & FUNC_STATEMENT))
      { node.id = this.type === types$1.name ? this.parseIdent() : null; }

    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
  };

  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp$8.parseClass = function(node, isStatement) {
    this.next();

    // ecma-262 14.6 Class Definitions
    // A class definition is always strict mode code.
    var oldStrict = this.strict;
    this.strict = true;

    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  };

  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) { return null }

    var ecmaVersion = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;

    if (this.eatContextual("static")) {
      // Parse static init block
      if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }

    // Parse element name
    if (keyName) {
      // 'async', 'get', 'set', or 'static' were not a keyword contextually.
      // The last token is any of those. Make it the element name.
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }

    // Parse element value
    if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
      if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }

    return node
  };

  pp$8.isClassElementNameStart = function() {
    return (
      this.type === types$1.name ||
      this.type === types$1.privateId ||
      this.type === types$1.num ||
      this.type === types$1.string ||
      this.type === types$1.bracketL ||
      this.type.keyword
    )
  };

  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };

  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    // Check key and flags
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
      if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }

    // Parse value
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

    // Check value
    if (method.kind === "get" && value.params.length !== 0)
      { this.raiseRecoverable(value.start, "getter should have no params"); }
    if (method.kind === "set" && value.params.length !== 1)
      { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
    if (method.kind === "set" && value.params[0].type === "RestElement")
      { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

    return this.finishNode(method, "MethodDefinition")
  };

  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }

    if (this.eat(types$1.eq)) {
      // To raise SyntaxError if 'arguments' exists in the initializer.
      this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
      field.value = this.parseMaybeAssign();
      this.exitScope();
    } else {
      field.value = null;
    }
    this.semicolon();

    return this.finishNode(field, "PropertyDefinition")
  };

  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];

    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;

    return this.finishNode(node, "StaticBlock")
  };

  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement)
        { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
    } else {
      if (isStatement === true)
        { this.unexpected(); }
      node.id = null;
    }
  };

  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };

  pp$8.enterClassBody = function() {
    var element = {declared: Object.create(null), used: []};
    this.privateNameStack.push(element);
    return element.declared
  };

  pp$8.exitClassBody = function() {
    var ref = this.privateNameStack.pop();
    var declared = ref.declared;
    var used = ref.used;
    if (!this.options.checkPrivateFields) { return }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i = 0; i < used.length; ++i) {
      var id = used[i];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
        }
      }
    }
  };

  function isPrivateNameConflicted(privateNameMap, element) {
    var name = element.key.name;
    var curr = privateNameMap[name];

    var next = "true";
    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
      next = (element.static ? "s" : "i") + element.kind;
    }

    // `class { get #a(){}; static set #a(_){} }` is also conflict.
    if (
      curr === "iget" && next === "iset" ||
      curr === "iset" && next === "iget" ||
      curr === "sget" && next === "sset" ||
      curr === "sset" && next === "sget"
    ) {
      privateNameMap[name] = "true";
      return false
    } else if (!curr) {
      privateNameMap[name] = next;
      return false
    } else {
      return true
    }
  }

  function checkKeyName(node, name) {
    var computed = node.computed;
    var key = node.key;
    return !computed && (
      key.type === "Identifier" && key.name === name ||
      key.type === "Literal" && key.value === name
    )
  }

  // Parses module export declaration.

  pp$8.parseExportAllDeclaration = function(node, exports) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    if (this.options.ecmaVersion >= 16)
      { node.attributes = this.parseWithClause(); }
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  };

  pp$8.parseExport = function(node, exports) {
    this.next();
    // export * from '...'
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports)
    }
    if (this.eat(types$1._default)) { // export default ...
      this.checkExport(exports, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration")
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration")
        { this.checkVariableExport(exports, node.declaration.declarations); }
      else
        { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
      node.specifiers = [];
      node.source = null;
      if (this.options.ecmaVersion >= 16)
        { node.attributes = []; }
    } else { // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) { this.unexpected(); }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16)
          { node.attributes = this.parseWithClause(); }
      } else {
        for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
          // check for keywords used as local names
          var spec = list[i];

          this.checkUnreserved(spec.local);
          // check if export is defined
          this.checkLocalExport(spec.local);

          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }

        node.source = null;
        if (this.options.ecmaVersion >= 16)
          { node.attributes = []; }
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration")
  };

  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null)
  };

  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID")
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration
    }
  };

  pp$8.checkExport = function(exports, name, pos) {
    if (!exports) { return }
    if (typeof name !== "string")
      { name = name.type === "Identifier" ? name.name : name.value; }
    if (hasOwn(exports, name))
      { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
    exports[name] = true;
  };

  pp$8.checkPatternExport = function(exports, pat) {
    var type = pat.type;
    if (type === "Identifier")
      { this.checkExport(exports, pat, pat.start); }
    else if (type === "ObjectPattern")
      { for (var i = 0, list = pat.properties; i < list.length; i += 1)
        {
          var prop = list[i];

          this.checkPatternExport(exports, prop);
        } }
    else if (type === "ArrayPattern")
      { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];

          if (elt) { this.checkPatternExport(exports, elt); }
      } }
    else if (type === "Property")
      { this.checkPatternExport(exports, pat.value); }
    else if (type === "AssignmentPattern")
      { this.checkPatternExport(exports, pat.left); }
    else if (type === "RestElement")
      { this.checkPatternExport(exports, pat.argument); }
  };

  pp$8.checkVariableExport = function(exports, decls) {
    if (!exports) { return }
    for (var i = 0, list = decls; i < list.length; i += 1)
      {
      var decl = list[i];

      this.checkPatternExport(exports, decl.id);
    }
  };

  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" ||
      this.type.keyword === "const" ||
      this.type.keyword === "class" ||
      this.type.keyword === "function" ||
      this.isLet() ||
      this.isAsyncFunction()
  };

  // Parses a comma-separated list of module exports.

  pp$8.parseExportSpecifier = function(exports) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();

    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(
      exports,
      node.exported,
      node.exported.start
    );

    return this.finishNode(node, "ExportSpecifier")
  };

  pp$8.parseExportSpecifiers = function(exports) {
    var nodes = [], first = true;
    // export { x, y as z } [from '...']
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseExportSpecifier(exports));
    }
    return nodes
  };

  // Parses import declaration.

  pp$8.parseImport = function(node) {
    this.next();

    // import '...'
    if (this.type === types$1.string) {
      node.specifiers = empty$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    if (this.options.ecmaVersion >= 16)
      { node.attributes = this.parseWithClause(); }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration")
  };

  // Parses a comma-separated list of module imports.

  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();

    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);

    return this.finishNode(node, "ImportSpecifier")
  };

  pp$8.parseImportDefaultSpecifier = function() {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier")
  };

  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier")
  };

  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) { return nodes }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseImportSpecifier());
    }
    return nodes
  };

  pp$8.parseWithClause = function() {
    var nodes = [];
    if (!this.eat(types$1._with)) {
      return nodes
    }
    this.expect(types$1.braceL);
    var attributeKeys = {};
    var first = true;
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var attr = this.parseImportAttribute();
      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
      if (hasOwn(attributeKeys, keyName))
        { this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'"); }
      attributeKeys[keyName] = true;
      nodes.push(attr);
    }
    return nodes
  };

  pp$8.parseImportAttribute = function() {
    var node = this.startNode();
    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    this.expect(types$1.colon);
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.value = this.parseExprAtom();
    return this.finishNode(node, "ImportAttribute")
  };

  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral
    }
    return this.parseIdent(true)
  };

  // Set `ExpressionStatement#directive` property for directive prologues.
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
      statements[i].directive = statements[i].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return (
      this.options.ecmaVersion >= 5 &&
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "Literal" &&
      typeof statement.expression.value === "string" &&
      // Reject parenthesized strings.
      (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
    )
  };

  var pp$7 = Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await")
          { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
        break

      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break

      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];

        this.toAssignable(prop, isBinding);
          // Early error:
          //   AssignmentRestProperty[Yield, Await] :
          //     `...` DestructuringAssignmentTarget[Yield, Await]
          //
          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
          if (
            prop.type === "RestElement" &&
            (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
          ) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break

      case "Property":
        // AssignmentProperty has type === "Property"
        if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
        this.toAssignable(node.value, isBinding);
        break

      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        this.toAssignableList(node.elements, isBinding);
        break

      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern")
          { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
        break

      case "AssignmentExpression":
        if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break

      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break

      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break

      case "MemberExpression":
        if (!isBinding) { break }

      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
    return node
  };

  // Convert list of expression atoms to binding list.

  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) { this.toAssignable(elt, isBinding); }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        { this.unexpected(last.argument.start); }
    }
    return exprList
  };

  // Parses spread element.

  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement")
  };

  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
      { this.unexpected(); }

    node.argument = this.parseBindingAtom();

    return this.finishNode(node, "RestElement")
  };

  // Parses lvalue (assignable) atom.

  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern")

      case types$1.braceL:
        return this.parseObj(true)
      }
    }
    return this.parseIdent()
  };

  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) { first = false; }
      else { this.expect(types$1.comma); }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
        this.expect(close);
        break
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts
  };

  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem
  };

  pp$7.parseBindingListItem = function(param) {
    return param
  };

  // Parses assignment pattern around given atom if possible.

  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern")
  };

  // The following three functions all verify that a node is an lvalue —
  // something that can be bound, or assigned to. In order to do so, they perform
  // a variety of checks:
  //
  // - Check that none of the bound/assigned-to identifiers are reserved words.
  // - Record name declarations for bindings in the appropriate scope.
  // - Check duplicate argument names, if checkClashes is set.
  //
  // If a complex binding pattern is encountered (e.g., object and array
  // destructuring), the entire pattern is recursively checked.
  //
  // There are three versions of checkLVal*() appropriate for different
  // circumstances:
  //
  // - checkLValSimple() shall be used if the syntactic construct supports
  //   nothing other than identifiers and member expressions. Parenthesized
  //   expressions are also correctly handled. This is generally appropriate for
  //   constructs for which the spec says
  //
  //   > It is a Syntax Error if AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   It is also appropriate for checking if an identifier is valid and not
  //   defined elsewhere, like import declarations or function/class identifiers.
  //
  //   Examples where this is used include:
  //     a += …;
  //     import a from '…';
  //   where a is the node to be checked.
  //
  // - checkLValPattern() shall be used if the syntactic construct supports
  //   anything checkLValSimple() supports, as well as object and array
  //   destructuring patterns. This is generally appropriate for constructs for
  //   which the spec says
  //
  //   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
  //   > an ArrayLiteral and AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   Examples where this is used include:
  //     (a = …);
  //     const a = …;
  //     try { … } catch (a) { … }
  //   where a is the node to be checked.
  //
  // - checkLValInnerPattern() shall be used if the syntactic construct supports
  //   anything checkLValPattern() supports, as well as default assignment
  //   patterns, rest elements, and other constructs that may appear within an
  //   object or array destructuring pattern.
  //
  //   As a special case, function parameters also use checkLValInnerPattern(),
  //   as they also support defaults and rest constructs.
  //
  // These functions deliberately support both assignment and binding constructs,
  // as the logic for both is exceedingly similar. If the node is the target of
  // an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
  // should be set to the appropriate BIND_* constant, like BIND_VAR or
  // BIND_LEXICAL.
  //
  // If the function is called with a non-BIND_NONE bindingType, then
  // additionally a checkClashes object may be specified to allow checking for
  // duplicate argument names. checkClashes is ignored if the provided construct
  // is an assignment (i.e., bindingType is BIND_NONE).

  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    var isBind = bindingType !== BIND_NONE;

    switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let")
          { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name))
            { this.raiseRecoverable(expr.start, "Argument name clash"); }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
      }
      break

    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
      break

    case "ParenthesizedExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes)

    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break

    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];

      if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
      }
      break

    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };

  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "Property":
      // AssignmentProperty has type === "Property"
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break

    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break

    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break

    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };

  // The algorithm used to determine whether a regexp can appear at a
  // given point in the program is loosely based on sweet.js' approach.
  // See https://github.com/mozilla/sweet.js/wiki/design


  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };

  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };

  var pp$6 = Parser.prototype;

  pp$6.initialContext = function() {
    return [types.b_stat]
  };

  pp$6.curContext = function() {
    return this.context[this.context.length - 1]
  };

  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types.f_expr || parent === types.f_stat)
      { return true }
    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
      { return !parent.isExpr }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
      { return true }
    if (prevType === types$1.braceL)
      { return parent === types.b_stat }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
      { return false }
    return !this.exprAllowed
  };

  pp$6.inGeneratorContext = function() {
    for (var i = this.context.length - 1; i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function")
        { return context.generator }
    }
    return false
  };

  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot)
      { this.exprAllowed = false; }
    else if (update = type.updateContext)
      { update.call(this, prevType); }
    else
      { this.exprAllowed = type.beforeExpr; }
  };

  // Used to handle edge cases when token context could not be inferred correctly during tokenization phase

  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };

  // Token-specific context update code

  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };

  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };

  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };

  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };

  types$1.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else &&
        !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
        !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
        !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
      { this.context.push(types.f_expr); }
    else
      { this.context.push(types.f_stat); }
    this.exprAllowed = false;
  };

  types$1.colon.updateContext = function() {
    if (this.curContext().token === "function") { this.context.pop(); }
    this.exprAllowed = true;
  };

  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl)
      { this.context.pop(); }
    else
      { this.context.push(types.q_tmpl); }
    this.exprAllowed = false;
  };

  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types.f_expr)
        { this.context[index] = types.f_expr_gen; }
      else
        { this.context[index] = types.f_gen; }
    }
    this.exprAllowed = true;
  };

  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed ||
          this.value === "yield" && this.inGeneratorContext())
        { allowed = true; }
    }
    this.exprAllowed = allowed;
  };

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


  var pp$5 = Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
      { return }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      { return }
    var key = prop.key;
    var name;
    switch (key.type) {
    case "Identifier": name = key.name; break
    case "Literal": name = String(key.value); break
    default: return
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition)
        { this.raiseRecoverable(key.start, "Redefinition of property"); }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
    if (this.type === types$1.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
      return this.finishNode(node, "SequenceExpression")
    }
    return expr
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) { return this.parseYield(forInit) }
      // The tokenizer will assume an expression is allowed after
      // `yield`, but this isn't that kind of yield
      else { this.exprAllowed = false; }
    }

    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq)
        { left = this.toAssignable(left, false, refDestructuringErrors); }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start)
        { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
      if (this.type === types$1.eq)
        { this.checkLValPattern(left); }
      else
        { this.checkLValSimple(left); }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
      return this.finishNode(node, "AssignmentExpression")
    } else {
      if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
    }
    if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
    if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
    return left
  };

  // Parse a ternary conditional (`?:`) operator.

  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    if (this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression")
    }
    return expr
  };

  // Start the precedence parser.

  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
          // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
      }
    }
    return left
  };

  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  };

  // Parse unary operators, both prefix and postfix.

  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) { this.checkLValSimple(node.argument); }
      else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
        { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
      else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
        { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
      else { sawUnary = true; }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
      expr = this.parsePrivateIdent();
      // only could be private fields in 'in', such as #x in obj
      if (this.type !== types$1._in) { this.unexpected(); }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }

    if (!incDec && this.eat(types$1.starstar)) {
      if (sawUnary)
        { this.unexpected(this.lastTokStart); }
      else
        { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
    } else {
      return expr
    }
  };

  function isLocalVariableAccess(node) {
    return (
      node.type === "Identifier" ||
      node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
    )
  }

  function isPrivateFieldAccess(node) {
    return (
      node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
      node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
      node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
    )
  }

  // Parse call, dot, and `[]`-subscript expressions.

  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
      { return expr }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
      if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
      if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
    }
    return result
  };

  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
        this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
        this.potentialArrowAt === base.start;
    var optionalChained = false;

    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

      if (element.optional) { optionalChained = true; }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element
      }

      base = element;
    }
  };

  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow)
  };

  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
  };

  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

    var computed = this.eat(types$1.bracketL);
    if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0)
          { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({isTagged: true});
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    // If a division operator appears in an expression position, the
    // tokenizer got confused, and we force it to read a regexp instead.
    if (this.type === types$1.slash) { this.readRegexp(); }

    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
    case types$1._super:
      if (!this.allowSuper)
        { this.raise(this.start, "'super' keyword outside a method"); }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper)
        { this.raise(node.start, "super() call outside constructor of a subclass"); }
      // The `super` keyword can appear at below:
      // SuperProperty:
      //     super [ Expression ]
      //     super . IdentifierName
      // SuperCall:
      //     super ( Arguments )
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
        { this.unexpected(); }
      return this.finishNode(node, "Super")

    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression")

    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow))
          { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
            (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
            { this.unexpected(); }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
        }
      }
      return id

    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {pattern: value.pattern, flags: value.flags};
      return node

    case types$1.num: case types$1.string:
      return this.parseLiteral(this.value)

    case types$1._null: case types$1._true: case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal")

    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
          { refDestructuringErrors.parenthesizedAssign = start; }
        if (refDestructuringErrors.parenthesizedBind < 0)
          { refDestructuringErrors.parenthesizedBind = start; }
      }
      return expr

    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression")

    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors)

    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0)

    case types$1._class:
      return this.parseClass(this.startNode(), false)

    case types$1._new:
      return this.parseNew()

    case types$1.backQuote:
      return this.parseTemplate()

    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew)
      } else {
        return this.unexpected()
      }

    default:
      return this.parseExprAtomDefault()
    }
  };

  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };

  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();

    // Consume `import` as an identifier for `import.meta`.
    // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
    this.next();

    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node)
    } else if (this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "import";
      node.meta = this.finishNode(meta, "Identifier");
      return this.parseImportMeta(node)
    } else {
      this.unexpected();
    }
  };

  pp$5.parseDynamicImport = function(node) {
    this.next(); // skip `(`

    // Parse node.source.
    node.source = this.parseMaybeAssign();

    if (this.options.ecmaVersion >= 16) {
      if (!this.eat(types$1.parenR)) {
        this.expect(types$1.comma);
        if (!this.afterTrailingComma(types$1.parenR)) {
          node.options = this.parseMaybeAssign();
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              this.unexpected();
            }
          }
        } else {
          node.options = null;
        }
      } else {
        node.options = null;
      }
    } else {
      // Verify ending.
      if (!this.eat(types$1.parenR)) {
        var errorPos = this.start;
        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }
    }

    return this.finishNode(node, "ImportExpression")
  };

  pp$5.parseImportMeta = function(node) {
    this.next(); // skip `.`

    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);

    if (node.property.name !== "meta")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
      { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

    return this.finishNode(node, "MetaProperty")
  };

  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110)
      { node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, ""); }
    this.next();
    return this.finishNode(node, "Literal")
  };

  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val
  };

  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon()
  };

  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      // Do not save awaitIdentPos to allow checking awaits nested in parameters
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            );
          }
          break
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);

      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
      }

      if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
      if (spreadStart) { this.unexpected(spreadStart); }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression")
    } else {
      return val
    }
  };

  pp$5.parseParenItem = function(item) {
    return item
  };

  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty = [];

  pp$5.parseNew = function() {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "new";
      node.meta = this.finishNode(meta, "Identifier");
      this.next();
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target")
        { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
      if (containsEsc)
        { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
      if (!this.allowNewDotTarget)
        { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
      return this.finishNode(node, "MetaProperty")
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
    else { node.arguments = empty; }
    return this.finishNode(node, "NewExpression")
  };

  // Parse template expression.

  pp$5.parseTemplateElement = function(ref) {
    var isTagged = ref.isTagged;

    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value.replace(/\r\n?/g, "\n"),
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement")
  };

  pp$5.parseTemplate = function(ref) {
    if ( ref === void 0 ) ref = {};
    var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({isTagged: isTagged});
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral")
  };

  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
      (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
      !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  // Parse an object literal or binding pattern.

  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  };

  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement")
      }
      // Parse argument.
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      // To disallow trailing comma via `this.toAssignable()`.
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      // Finish
      return this.finishNode(prop, "SpreadElement")
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern)
        { isGenerator = this.eat(types$1.star); }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property")
  };

  pp$5.parseGetterSetter = function(prop) {
    var kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    prop.kind = kind;
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  };

  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon)
      { this.unexpected(); }

    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) { this.unexpected(); }
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
      prop.kind = "init";
    } else if (!isPattern && !containsEsc &&
               this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
               (prop.key.name === "get" || prop.key.name === "set") &&
               (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = startPos; }
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0)
          { refDestructuringErrors.shorthandAssign = this.start; }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.kind = "init";
      prop.shorthand = true;
    } else { this.unexpected(); }
  };

  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
  };

  // Initialize empty function node.

  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
    if (this.options.ecmaVersion >= 8) { node.async = false; }
  };

  // Parse object or class method.

  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 6)
      { node.generator = isGenerator; }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression")
  };

  // Parse arrow function expression with given parameters.

  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;

    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression")
  };

  // Parse function body and check parameters.

  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (useStrict && nonSimple)
          { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
      }
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) { this.strict = true; }

      // Add the params to varDeclaredNames to ensure that an error is thrown
      // if a let/const declaration in the function clashes with one of the params.
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
      if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
      node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };

  pp$5.isSimpleParamList = function(params) {
    for (var i = 0, list = params; i < list.length; i += 1)
      {
      var param = list[i];

      if (param.type !== "Identifier") { return false
    } }
    return true
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = Object.create(null);
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
      } else { first = false; }

      var elt = (void 0);
      if (allowEmpty && this.type === types$1.comma)
        { elt = null; }
      else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
          { refDestructuringErrors.trailingComma = this.start; }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  pp$5.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;

    if (this.inGenerator && name === "yield")
      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
    if (this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
    if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments")
      { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
      { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
    if (this.keywords.test(name))
      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
    if (this.options.ecmaVersion < 6 &&
      this.input.slice(start, end).indexOf("\\") !== -1) { return }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
    }
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = node.start; }
    }
    return node
  };

  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;

      // To fix https://github.com/acornjs/acorn/issues/575
      // `class` and `function` keywords push new context into this.context.
      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
      if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
      this.type = types$1.name;
    } else {
      this.unexpected();
    }
    return node
  };

  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");

    // For validating existence
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }

    return node
  };

  // Parses yield expression inside generator.

  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) { this.yieldPos = this.start; }

    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) { this.awaitPos = this.start; }

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    if (this.sourceFile) {
      message += " in " + this.sourceFile;
    }
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var pp$3 = Parser.prototype;

  var Scope = function Scope(flags) {
    this.flags = flags;
    // A list of var-declared names in the current lexical scope
    this.var = [];
    // A list of lexically-declared names in the current lexical scope
    this.lexical = [];
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = [];
  };

  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };

  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  };

  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && (scope.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar)
        { redeclared = scope$2.lexical.indexOf(name) > -1; }
      else
        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break
        }
        scope$3.var.push(name);
        if (this.inModule && (scope$3.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
        if (scope$3.flags & SCOPE_VAR) { break }
      }
    }
    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  };

  pp$3.checkLocalExport = function(id) {
    // scope.functions must be empty as Module code is always strict.
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
        this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };

  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1]
  };

  pp$3.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) { return scope }
    }
  };

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  pp$3.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) &&
          !(scope.flags & SCOPE_ARROW)) { return scope }
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      { this.loc = new SourceLocation(parser, loc); }
    if (parser.options.directSourceFile)
      { this.sourceFile = parser.options.directSourceFile; }
    if (parser.options.ranges)
      { this.range = [pos, 0]; }
  };

  // Start an AST node, attaching a start offset.

  var pp$2 = Parser.prototype;

  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      { node.loc.end = loc; }
    if (this.options.ranges)
      { node.range[1] = pos; }
    return node
  }

  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) { newNode[prop] = node[prop]; }
    return newNode
  };

  // This file was generated by "bin/generate-unicode-script-values.js". Do not modify manually!
  var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";

  // This file contains Unicode properties extracted from the ECMAScript specification.
  // The lists are extracted like so:
  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  // #table-binary-unicode-properties
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  var ecma13BinaryProperties = ecma12BinaryProperties;
  var ecma14BinaryProperties = ecma13BinaryProperties;

  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };

  // #table-binary-unicode-properties-of-strings
  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

  var unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };

  // #table-unicode-general-category-values
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  // #table-unicode-script-values
  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;

  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };

  var data = {};
  function buildUnicodeData(ecmaVersion) {
    var d = data[ecmaVersion] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;

    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }

  for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
    var ecmaVersion = list[i];

    buildUnicodeData(ecmaVersion);
  }

  var pp$1 = Parser.prototype;

  // Track disjunction structure to determine whether a duplicate
  // capture group name is allowed because it is in a separate branch.
  var BranchID = function BranchID(parent, base) {
    // Parent disjunction branch
    this.parent = parent;
    // Identifies this set of sibling branches
    this.base = base || this;
  };

  BranchID.prototype.separatedFrom = function separatedFrom (alt) {
    // A branch is separate from another branch if they or any of
    // their parents are siblings in a given disjunction
    for (var self = this; self; self = self.parent) {
      for (var other = alt; other; other = other.parent) {
        if (self.base === other.base && self !== other) { return true }
      }
    }
    return false
  };

  BranchID.prototype.sibling = function sibling () {
    return new BranchID(this.parent, this.base)
  };

  var RegExpValidationState = function RegExpValidationState(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchV = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = Object.create(null);
    this.backReferenceNames = [];
    this.branchID = null;
  };

  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };

  RegExpValidationState.prototype.raise = function raise (message) {
    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  };

  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  RegExpValidationState.prototype.at = function at (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1
    }
    var c = s.charCodeAt(i);
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    var next = s.charCodeAt(i + 1);
    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  };

  RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l
    }
    var c = s.charCodeAt(i), next;
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
      return i + 1
    }
    return i + 2
  };

  RegExpValidationState.prototype.current = function current (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.pos, forceU)
  };

  RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.nextIndex(this.pos, forceU), forceU)
  };

  RegExpValidationState.prototype.advance = function advance (forceU) {
      if ( forceU === void 0 ) forceU = false;

    this.pos = this.nextIndex(this.pos, forceU);
  };

  RegExpValidationState.prototype.eat = function eat (ch, forceU) {
      if ( forceU === void 0 ) forceU = false;

    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true
    }
    return false
  };

  RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var pos = this.pos;
    for (var i = 0, list = chs; i < list.length; i += 1) {
      var ch = list[i];

        var current = this.at(pos, forceU);
      if (current === -1 || current !== ch) {
        return false
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true
  };

  /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;

    var u = false;
    var v = false;

    for (var i = 0; i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") { u = true; }
      if (flag === "v") { v = true; }
    }
    if (this.options.ecmaVersion >= 15 && u && v) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };

  function hasProp(obj) {
    for (var _ in obj) { return true }
    return false
  }

  /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);

    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
    // parsing contains a |GroupName|, reparse with the goal symbol
    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
    // exception if _P_ did not conform to the grammar, if any elements of _P_
    // were not matched by the parse, or if any Early Error conditions exist.
    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames = Object.create(null);
    state.backReferenceNames.length = 0;
    state.branchID = null;

    this.regexp_disjunction(state);

    if (state.pos !== state.source.length) {
      // Make the same messages as V8.
      if (state.eat(0x29 /* ) */)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
      var name = list[i];

      if (!state.groupNames[name]) {
        state.raise("Invalid named capture referenced");
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  pp$1.regexp_disjunction = function(state) {
    var trackDisjunction = this.options.ecmaVersion >= 16;
    if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
    this.regexp_alternative(state);
    while (state.eat(0x7C /* | */)) {
      if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
      this.regexp_alternative(state);
    }
    if (trackDisjunction) { state.branchID = state.branchID.parent; }

    // Make the same message as V8.
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(0x7B /* { */)) {
      state.raise("Lone quantifier brackets");
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      // Handle `QuantifiableAssertion Quantifier` alternative.
      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
      // is a QuantifiableAssertion.
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        // Make the same message as V8.
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true
    }

    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;

    // ^, $
    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
      return true
    }

    // \b \B
    if (state.eat(0x5C /* \ */)) {
      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
        return true
      }
      state.pos = start;
    }

    // Lookahead / Lookbehind
    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(0x3C /* < */);
      }
      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
        this.regexp_disjunction(state);
        if (!state.eat(0x29 /* ) */)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true
      }
    }

    state.pos = start;
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if ( noError === void 0 ) noError = false;

    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(0x3F /* ? */);
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return (
      state.eat(0x2A /* * */) ||
      state.eat(0x2B /* + */) ||
      state.eat(0x3F /* ? */) ||
      this.regexp_eatBracedQuantifier(state, noError)
    )
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(0x7B /* { */)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(0x7D /* } */)) {
          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  pp$1.regexp_eatAtom = function(state) {
    return (
      this.regexp_eatPatternCharacters(state) ||
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state)
    )
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(0x28 /* ( */)) {
      if (state.eat(0x3F /* ? */)) {
        if (this.options.ecmaVersion >= 16) {
          var addModifiers = this.regexp_eatModifiers(state);
          var hasHyphen = state.eat(0x2D /* - */);
          if (addModifiers || hasHyphen) {
            for (var i = 0; i < addModifiers.length; i++) {
              var modifier = addModifiers.charAt(i);
              if (addModifiers.indexOf(modifier, i + 1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
            if (hasHyphen) {
              var removeModifiers = this.regexp_eatModifiers(state);
              if (!addModifiers && !removeModifiers && state.current() === 0x3A /* : */) {
                state.raise("Invalid regular expression modifiers");
              }
              for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
                var modifier$1 = removeModifiers.charAt(i$1);
                if (
                  removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 ||
                  addModifiers.indexOf(modifier$1) > -1
                ) {
                  state.raise("Duplicate regular expression modifiers");
                }
              }
            }
          }
        }
        if (state.eat(0x3A /* : */)) {
          this.regexp_disjunction(state);
          if (state.eat(0x29 /* ) */)) {
            return true
          }
          state.raise("Unterminated group");
        }
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(0x28 /* ( */)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 0x3F /* ? */) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        state.numCapturingParens += 1;
        return true
      }
      state.raise("Unterminated group");
    }
    return false
  };
  // RegularExpressionModifiers ::
  //   [empty]
  //   RegularExpressionModifiers RegularExpressionModifier
  pp$1.regexp_eatModifiers = function(state) {
    var modifiers = "";
    var ch = 0;
    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
      modifiers += codePointToString(ch);
      state.advance();
    }
    return modifiers
  };
  // RegularExpressionModifier :: one of
  //   `i` `m` `s`
  function isRegularExpressionModifier(ch) {
    return ch === 0x69 /* i */ || ch === 0x6d /* m */ || ch === 0x73 /* s */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  pp$1.regexp_eatExtendedAtom = function(state) {
    return (
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state) ||
      this.regexp_eatInvalidBracedQuantifier(state) ||
      this.regexp_eatExtendedPatternCharacter(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };
  function isSyntaxCharacter(ch) {
    return (
      ch === 0x24 /* $ */ ||
      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
      ch === 0x2E /* . */ ||
      ch === 0x3F /* ? */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  // But eat eager.
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (
      ch !== -1 &&
      ch !== 0x24 /* $ */ &&
      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
      ch !== 0x2E /* . */ &&
      ch !== 0x3F /* ? */ &&
      ch !== 0x5B /* [ */ &&
      ch !== 0x5E /* ^ */ &&
      ch !== 0x7C /* | */
    ) {
      state.advance();
      return true
    }
    return false
  };

  // GroupSpecifier ::
  //   [empty]
  //   `?` GroupName
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(0x3F /* ? */)) {
      if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
      var trackDisjunction = this.options.ecmaVersion >= 16;
      var known = state.groupNames[state.lastStringValue];
      if (known) {
        if (trackDisjunction) {
          for (var i = 0, list = known; i < list.length; i += 1) {
            var altID = list[i];

            if (!altID.separatedFrom(state.branchID))
              { state.raise("Duplicate capture group name"); }
          }
        } else {
          state.raise("Duplicate capture group name");
        }
      }
      if (trackDisjunction) {
        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
      } else {
        state.groupNames[state.lastStringValue] = true;
      }
    }
  };

  // GroupName ::
  //   `<` RegExpIdentifierName `>`
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(0x3C /* < */)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
        return true
      }
      state.raise("Invalid capture group name");
    }
    return false
  };

  // RegExpIdentifierName ::
  //   RegExpIdentifierStart
  //   RegExpIdentifierName RegExpIdentifierPart
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true
    }
    return false
  };

  // RegExpIdentifierStart ::
  //   UnicodeIDStart
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  }

  // RegExpIdentifierPart ::
  //   UnicodeIDContinue
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  //   <ZWNJ>
  //   <ZWJ>
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  pp$1.regexp_eatAtomEscape = function(state) {
    if (
      this.regexp_eatBackReference(state) ||
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state) ||
      (state.switchN && this.regexp_eatKGroupName(state))
    ) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      if (state.current() === 0x63 /* c */) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true
      }
      if (n <= state.numCapturingParens) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(0x6B /* k */)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true
      }
      state.raise("Invalid named reference");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  pp$1.regexp_eatCharacterEscape = function(state) {
    return (
      this.regexp_eatControlEscape(state) ||
      this.regexp_eatCControlLetter(state) ||
      this.regexp_eatZero(state) ||
      this.regexp_eatHexEscapeSequence(state) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
      this.regexp_eatIdentityEscape(state)
    )
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(0x63 /* c */)) {
      if (this.regexp_eatControlLetter(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 0x74 /* t */) {
      state.lastIntValue = 0x09; /* \t */
      state.advance();
      return true
    }
    if (ch === 0x6E /* n */) {
      state.lastIntValue = 0x0A; /* \n */
      state.advance();
      return true
    }
    if (ch === 0x76 /* v */) {
      state.lastIntValue = 0x0B; /* \v */
      state.advance();
      return true
    }
    if (ch === 0x66 /* f */) {
      state.lastIntValue = 0x0C; /* \f */
      state.advance();
      return true
    }
    if (ch === 0x72 /* r */) {
      state.lastIntValue = 0x0D; /* \r */
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };
  function isControlLetter(ch) {
    return (
      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if ( forceU === void 0 ) forceU = false;

    var start = state.pos;
    var switchU = forceU || state.switchU;

    if (state.eat(0x75 /* u */)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 0xDC00 && trail <= 0xDFFF) {
              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              return true
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true
      }
      if (
        switchU &&
        state.eat(0x7B /* { */) &&
        this.regexp_eatHexDigits(state) &&
        state.eat(0x7D /* } */) &&
        isValidUnicode(state.lastIntValue)
      ) {
        return true
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }

    return false
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 0x10FFFF
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true
      }
      if (state.eat(0x2F /* / */)) {
        state.lastIntValue = 0x2F; /* / */
        return true
      }
      return false
    }

    var ch = state.current();
    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
      return true
    }
    return false
  };

  // Return values used by character set parsing methods, needed to
  // forbid negation of sets that can match strings.
  var CharSetNone = 0; // Nothing parsed
  var CharSetOk = 1; // Construct parsed, cannot contain strings
  var CharSetString = 2; // Construct parsed, can contain strings

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();

    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk
    }

    var negate = false;
    if (
      state.switchU &&
      this.options.ecmaVersion >= 9 &&
      ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
    ) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (
        state.eat(0x7B /* { */) &&
        (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
        state.eat(0x7D /* } */)
      ) {
        if (negate && result === CharSetString) { state.raise("Invalid property name"); }
        return result
      }
      state.raise("Invalid property name");
    }

    return CharSetNone
  };

  function isCharacterClassEscape(ch) {
    return (
      ch === 0x64 /* d */ ||
      ch === 0x44 /* D */ ||
      ch === 0x73 /* s */ ||
      ch === 0x53 /* S */ ||
      ch === 0x77 /* w */ ||
      ch === 0x57 /* W */
    )
  }

  // UnicodePropertyValueExpression ::
  //   UnicodePropertyName `=` UnicodePropertyValue
  //   LoneUnicodePropertyNameOrValue
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;

    // UnicodePropertyName `=` UnicodePropertyValue
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk
      }
    }
    state.pos = start;

    // LoneUnicodePropertyNameOrValue
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
    }
    return CharSetNone
  };

  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name))
      { state.raise("Invalid property name"); }
    if (!state.unicodeProperties.nonBinary[name].test(value))
      { state.raise("Invalid property value"); }
  };

  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
    state.raise("Invalid property name");
  };

  // UnicodePropertyName ::
  //   UnicodePropertyNameCharacters
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };

  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 0x5F /* _ */
  }

  // UnicodePropertyValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  }

  // LoneUnicodePropertyNameOrValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state)
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (!state.eat(0x5D /* ] */))
        { state.raise("Unterminated character class"); }
      if (negate && result === CharSetString)
        { state.raise("Negated character class may contain strings"); }
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassContents
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 0x5D /* ] */) { return CharSetOk }
    if (state.switchV) { return this.regexp_classSetExpression(state) }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;

    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatClassEscape(state)) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        var ch$1 = state.current();
        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }

    var ch = state.current();
    if (ch !== 0x5D /* ] */) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;

    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }

    if (state.switchU && state.eat(0x2D /* - */)) {
      state.lastIntValue = 0x2D; /* - */
      return true
    }

    if (!state.switchU && state.eat(0x63 /* c */)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true
      }
      state.pos = start;
    }

    return (
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state)
    )
  };

  // https://tc39.es/ecma262/#prod-ClassSetExpression
  // https://tc39.es/ecma262/#prod-ClassUnion
  // https://tc39.es/ecma262/#prod-ClassIntersection
  // https://tc39.es/ecma262/#prod-ClassSubtraction
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) { result = CharSetString; }
      // https://tc39.es/ecma262/#prod-ClassIntersection
      var start = state.pos;
      while (state.eatChars([0x26, 0x26] /* && */)) {
        if (
          state.current() !== 0x26 /* & */ &&
          (subResult = this.regexp_eatClassSetOperand(state))
        ) {
          if (subResult !== CharSetString) { result = CharSetOk; }
          continue
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
      // https://tc39.es/ecma262/#prod-ClassSubtraction
      while (state.eatChars([0x2D, 0x2D] /* -- */)) {
        if (this.regexp_eatClassSetOperand(state)) { continue }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
    } else {
      state.raise("Invalid character in character class");
    }
    // https://tc39.es/ecma262/#prod-ClassUnion
    for (;;) {
      if (this.regexp_eatClassSetRange(state)) { continue }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) { return result }
      if (subResult === CharSetString) { result = CharSetString; }
    }
  };

  // https://tc39.es/ecma262/#prod-ClassSetRange
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true
      }
      state.pos = start;
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetOperand
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
  };

  // https://tc39.es/ecma262/#prod-NestedClass
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (state.eat(0x5D /* ] */)) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result
      }
      state.pos = start;
    }
    if (state.eat(0x5C /* \ */)) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunction
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars([0x5C, 0x71] /* \q */)) {
      if (state.eat(0x7B /* { */)) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(0x7D /* } */)) {
          return result
        }
      } else {
        // Make the same message as V8.
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(0x7C /* | */)) {
      if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
    }
    return result
  };

  // https://tc39.es/ecma262/#prod-ClassString
  // https://tc39.es/ecma262/#prod-NonEmptyClassString
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) { count++; }
    return count === 1 ? CharSetOk : CharSetString
  };

  // https://tc39.es/ecma262/#prod-ClassSetCharacter
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (
        this.regexp_eatCharacterEscape(state) ||
        this.regexp_eatClassSetReservedPunctuator(state)
      ) {
        return true
      }
      if (state.eat(0x62 /* b */)) {
        state.lastIntValue = 0x08; /* <BS> */
        return true
      }
      state.pos = start;
      return false
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
    if (isClassSetSyntaxCharacter(ch)) { return false }
    state.advance();
    state.lastIntValue = ch;
    return true
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
  function isClassSetReservedDoublePunctuatorCharacter(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
      ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
      ch === 0x2E /* . */ ||
      ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
      ch === 0x5E /* ^ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
  function isClassSetSyntaxCharacter(ch) {
    return (
      ch === 0x28 /* ( */ ||
      ch === 0x29 /* ) */ ||
      ch === 0x2D /* - */ ||
      ch === 0x2F /* / */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  function isClassSetReservedPunctuator(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch === 0x23 /* # */ ||
      ch === 0x25 /* % */ ||
      ch === 0x26 /* & */ ||
      ch === 0x2C /* , */ ||
      ch === 0x2D /* - */ ||
      ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
      ch === 0x40 /* @ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(0x78 /* x */)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    }
    return state.pos !== start
  };
  function isDecimalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start
  };
  function isHexDigit(ch) {
    return (
      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
    )
  }
  function hexToInt(ch) {
    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
      return 10 + (ch - 0x41 /* A */)
    }
    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
      return 10 + (ch - 0x61 /* a */)
    }
    return ch - 0x30 /* 0 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  // Allows only 0-377(octal) i.e. 0-255(decimal).
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 0x30; /* 0 */
      state.advance();
      return true
    }
    state.lastIntValue = 0;
    return false
  };
  function isOctalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0; i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // ## Tokenizer

  var pp = Parser.prototype;

  // Move to the next token

  pp.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    { pp[Symbol.iterator] = function() {
      var this$1$1 = this;

      return {
        next: function () {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          }
        }
      }
    }; }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  // Read a single token, updating the parser object's token-related
  // properties.

  pp.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

    this.start = this.pos;
    if (this.options.locations) { this.startLoc = this.curPosition(); }
    if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

    if (curContext.override) { return curContext.override(this) }
    else { this.readToken(this.fullCharCodeAtPos()); }
  };

  pp.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }

    return this.getTokenFromCode(code)
  };

  pp.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xdc00) { return code }
    var next = this.input.charCodeAt(this.pos + 1);
    return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
  };

  pp.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment)
      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  pp.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment)
      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos;
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10: case 8232: case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment();
          break
        case 47:
          this.skipLineComment(2);
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop
        }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) { this.endLoc = this.curPosition(); }
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) { return this.readNumber(true) }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(types$1.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot)
    }
  };

  pp.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.slash, 1)
  };

  pp.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(tokentype, size)
  };

  pp.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
  };

  pp.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.bitwiseXOR, 1)
  };

  pp.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(types$1.incDec, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.plusMin, 1)
  };

  pp.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
      return this.finishOp(types$1.bitShift, size)
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) { size = 2; }
    return this.finishOp(types$1.relational, size)
  };

  pp.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(types$1.arrow)
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
  };

  pp.readToken_question = function() { // '?'
    var ecmaVersion = this.options.ecmaVersion;
    if (ecmaVersion >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
      }
      if (next === 63) {
        if (ecmaVersion >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
        }
        return this.finishOp(types$1.coalesce, 2)
      }
    }
    return this.finishOp(types$1.question, 1)
  };

  pp.readToken_numberSign = function() { // '#'
    var ecmaVersion = this.options.ecmaVersion;
    var code = 35; // '#'
    if (ecmaVersion >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
        return this.finishToken(types$1.privateId, this.readWord1())
      }
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.getTokenFromCode = function(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

    // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(types$1.parenL)
    case 41: ++this.pos; return this.finishToken(types$1.parenR)
    case 59: ++this.pos; return this.finishToken(types$1.semi)
    case 44: ++this.pos; return this.finishToken(types$1.comma)
    case 91: ++this.pos; return this.finishToken(types$1.bracketL)
    case 93: ++this.pos; return this.finishToken(types$1.bracketR)
    case 123: ++this.pos; return this.finishToken(types$1.braceL)
    case 125: ++this.pos; return this.finishToken(types$1.braceR)
    case 58: ++this.pos; return this.finishToken(types$1.colon)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) { break }
      ++this.pos;
      return this.finishToken(types$1.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.
    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 63: // '?'
      return this.readToken_question()

    case 126: // '~'
      return this.finishOp(types$1.prefix, 1)

    case 35: // '#'
      return this.readToken_numberSign()
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  pp.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
      if (!escaped) {
        if (ch === "[") { inClass = true; }
        else if (ch === "]" && inClass) { inClass = false; }
        else if (ch === "/" && !inClass) { break }
        escaped = ch === "\\";
      } else { escaped = false; }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) { this.unexpected(flagsStart); }

    // Validate pattern
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);

    // Create Literal#value property value.
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      // ESTree requires null if it failed to instantiate RegExp object.
      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
    }

    return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    // `len` is used for character escape sequences. In that case, disallow separators.
    var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

    // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
    // and isn't fraction part nor exponent part. In that case, if the first digit
    // is zero then disallow separators.
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

    var start = this.pos, total = 0, lastCode = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = (void 0);

      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
        if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
        if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
        lastCode = code;
        continue
      }

      if (code >= 97) { val = code - 97 + 10; } // a
      else if (code >= 65) { val = code - 65 + 10; } // A
      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
      else { val = Infinity; }
      if (val >= radix) { break }
      lastCode = code;
      total = total * radix + val;
    }

    if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
    if (this.pos === start || len != null && this.pos - start !== len) { return null }

    return total
  };

  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8)
    }

    // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
    return parseFloat(str.replace(/_/g, ""))
  }

  function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null
    }

    // `BigInt(value)` throws syntax error if the string contains numeric separators.
    return BigInt(str.replace(/_/g, ""))
  }

  pp.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) { this.raise(start, "Invalid number"); }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types$1.num, val$1)
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) { ++this.pos; } // '+-'
      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) { // '{'
      if (this.options.ecmaVersion < 6) { this.unexpected(); }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  pp.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) { break }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 0x2028 || ch === 0x2029) {
        if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out)
  };

  // Reads template string tokens.

  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  pp.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err
      }
    }

    this.inTemplateElement = false;
  };

  pp.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR
    } else {
      this.raise(position, message);
    }
  };

  pp.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL)
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote)
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out)
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
        case 10:
          out += "\n";
          break
        default:
          out += String.fromCharCode(ch);
          break
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Reads a template token to search for the end, without validating any escape sequences
  pp.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break

      case "$":
        if (this.input[this.pos + 1] !== "{") { break }
        // fall through
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

      case "\r":
        if (this.input[this.pos + 1] === "\n") { ++this.pos; }
        // fall through
      case "\n": case "\u2028": case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break
      }
    }
    this.raise(this.start, "Unterminated template");
  };

  // Used to read escaped characters

  pp.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;

        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate
              ? "Octal literal in template string"
              : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
        return ""
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word)
  };

  // Acorn is a tiny, fast JavaScript parser written in JavaScript.
  //
  // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
  // various contributors and released under an MIT license.
  //
  // Git repositories for Acorn are available at
  //
  //     http://marijnhaverbeke.nl/git/acorn
  //     https://github.com/acornjs/acorn.git
  //
  // Please use the [github bug tracker][ghbt] to report issues.
  //
  // [ghbt]: https://github.com/acornjs/acorn/issues


  var version = "8.15.0";

  Parser.acorn = {
    Parser: Parser,
    version: version,
    defaultOptions: defaultOptions,
    Position: Position,
    SourceLocation: SourceLocation,
    getLineInfo: getLineInfo,
    Node: Node,
    TokenType: TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext: TokContext,
    tokContexts: types,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
    Token: Token,
    isNewLine: isNewLine,
    lineBreak: lineBreak,
    lineBreakG: lineBreakG,
    nonASCIIwhitespace: nonASCIIwhitespace
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and returns
  // an abstract syntax tree as specified by the [ESTree spec][estree].
  //
  // [estree]: https://github.com/estree/estree

  function parse(input, options) {
    return Parser.parse(input, options)
  }

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  function parseExpressionAt(input, pos, options) {
    return Parser.parseExpressionAt(input, pos, options)
  }

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenizer` export provides an interface to the tokenizer.

  function tokenizer(input, options) {
    return Parser.tokenizer(input, options)
  }

  exports.Node = Node;
  exports.Parser = Parser;
  exports.Position = Position;
  exports.SourceLocation = SourceLocation;
  exports.TokContext = TokContext;
  exports.Token = Token;
  exports.TokenType = TokenType;
  exports.defaultOptions = defaultOptions;
  exports.getLineInfo = getLineInfo;
  exports.isIdentifierChar = isIdentifierChar;
  exports.isIdentifierStart = isIdentifierStart;
  exports.isNewLine = isNewLine;
  exports.keywordTypes = keywords;
  exports.lineBreak = lineBreak;
  exports.lineBreakG = lineBreakG;
  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  exports.parse = parse;
  exports.parseExpressionAt = parseExpressionAt;
  exports.tokContexts = types;
  exports.tokTypes = types$1;
  exports.tokenizer = tokenizer;
  exports.version = version;

}));

return module.exports;
})();

  const retry = window.__fodderGalleryRetry5m = createFodderModalRetry(window);
  const latest = window.__fodderLatestCards = createFodderLatestCards(window, channel);
  const BACKEND = window.FODDER_GG_BACKEND || 'https://fodder.gg';
  try { document.documentElement.dataset.fodderGgSurface = 'usc'; } catch (_) {}
  // Preserve the original sign-in hand-off. Never transmit or expose the token.
  try {
    const m = String(location.hash || '').match(/(?:^#|&)token=([^&]+)/);
    if (m) {
      localStorage.setItem('fodder_gg_token', decodeURIComponent(m[1]));
      history.replaceState(null, '', location.pathname + location.search);
    }
  } catch (_) {}
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let appReady = false;
  for (let i = 0; i < 120; i++) {
    if (window.services && window.repositories) { appReady = true; break; }
    await sleep(500);
  }
  if (!appReady) { retry.unavailable('游戏页面尚未就绪，请登录后刷新'); return; }
  const localeOverlay = async () => {
    try {
      const lang = (localStorage.getItem('UT_LOCALE') || '').toLowerCase().split(/[-_]/)[0];
      if (!['fr','es','pt','ko','zh'].includes(lang)) return null;
      const res = await fetch(BACKEND + '/i18n/' + lang + '.json', { cache: 'no-store' });
      return res.ok ? { lang, dict: await res.json() } : null;
    } catch (_) { return null; }
  };
  try {
    const [source, overlay] = await Promise.all([
      fetch(BACKEND + '/client.core.js', { cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error('核心脚本加载失败：HTTP ' + r.status);
        return r.text();
      }), localeOverlay()
    ]);
    if (overlay) window.__fodderI18n = Object.assign(window.__fodderI18n || {}, { [overlay.lang]: overlay.dict });
    let selected = source, patched = false;
    try {
      const result = patchFodderBuyRun(source, fg5mParser);
      selected = result.source; patched = true;
      console.info('[Fodder 弹窗循环] 购买引擎已接入', result.adapter);
      try {
        const extra = patchFodderLatestBridge(selected, fg5mParser, result.adapter);
        selected = extra.source;
        console.info('[Fodder 最新卡] 原购买接口已接入', extra.adapter);
      } catch (error) { latest.unavailable(error); }
    } catch (error) { retry.unavailable(error); }
    // Execute the selected core ONCE. Never re-evaluate it after a runtime error.
    (0, eval)(selected);
    if (patched) retry.ready();
    if (window.__fodderLatestBridge) latest.ready();
    else if (!patched) latest.unavailable('原购买引擎未接入，请检查循环功能提示');
  } catch (error) {
    retry.unavailable(error); latest.unavailable(error);
    console.warn('[Fodder 弹窗循环] 加载失败', error);
  }
})();

  }
  try {
    page.eval('(' + bootFodderPage.toString() + ')(' + JSON.stringify(channel) + ');');
  } catch (error) {
    console.error('[Fodder 最新卡] 页面脚本启动失败', error);
    const show = () => {
      const n = document.createElement('div');
      n.style.cssText = 'position:fixed;top:16px;left:110px;z-index:2147483647;background:#522;color:white;padding:14px;max-width:500px';
      n.textContent = 'Fodder 增强版未启动：请检查油猴的网页脚本执行权限，确保只启用一份 Fodder，再刷新网页。';
      document.body.appendChild(n);
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show, { once:true });
  }
})();
