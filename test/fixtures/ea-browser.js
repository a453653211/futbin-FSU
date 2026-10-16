// Deliberately simulated EA boundary. Production scripts run in full on a real Chromium DOM.
function installEaMocks(prototypes) {
    window.unsafeWindow = window;
    const shield = document.createElement('div'); shield.className = 'ut-click-shield'; document.body.append(shield);
    const loader = document.createElement('div'); loader.className = 'loaderIcon'; shield.append(loader);
    window.__eaCalls = { saves: 0, submits: 0, buys: 0, notifications: [] };
    window.__gm = new Map();
    window.GM_getValue = (key, fallback) => window.__gm.has(key) ? window.__gm.get(key) : fallback;
    window.GM_setValue = (key, value) => window.__gm.set(key, value);
    window.GM_deleteValue = key => window.__gm.delete(key);
    window.GM_addStyle = css => { const s = document.createElement('style'); s.textContent = css; document.head.append(s); return s; };
    window.GM_openInTab = () => {};
    window.APP_YEAR_SHORT = 27; window.APP_YEAR = 2027;
    window.EventType = { TAP: 'tap' }; window.ItemPile = { CLUB: 7, STORAGE: 10, INBOX: 8 };
    window.ItemRarity = { NONE: 0, RARE: 1 }; window.ItemType = { PLAYER: 'player' };
    window.UINotificationType = { POSITIVE: 1, NEGATIVE: 2 };
    window.SBCEligibilityKey = { PLAYER_MIN_OVR: 1, 1: 'PLAYER_MIN_OVR' };
    window.SBCEligibilityScope = { EXACT: 0, GREATER: 1, LOWER: 2, 0: 'EXACT', 1: 'GREATER', 2: 'LOWER' };
    window.SBCEligibilityOperation = { AND: 0, OR: 1 };
    window.SBCChallengeStatus = { COMPLETED: 2 }; window.UTServerSettingsRepository = { KEY: {} };
    window.GameCurrency = { COINS: 'coins' }; window.GameSku = { PC: 'pc27', STEAM: 'steam27' };
    window.AuthenticationState = { AUTHENTICATING: 1 }; window.TradeAccessLevel = { ALLOWED: 1 };
    window.SearchType = { PLAYER: 'player' }; window.SearchCategory = { ANY: 'any' }; window.PlayerPosition = { GK: 0 };
    window.enums = { UIDialogOptions: { OK: 2, CANCEL: 1, YES: 3, NO: 4 } };
    window.L10n = { localize: key => key }; window.isPhone = () => false;
    window.PlayerAttribute = new Proxy({}, { get: (_, key) => key });
    window.ItemSubAttribute = new Proxy({}, { get: (_, key) => key });
    window.JSUtils = { inherits: (child, parent) => { child.prototype = Object.create(parent.prototype); child.prototype.constructor = child; },
        isObject: v => v && typeof v === 'object', assignPropertyValues: (a, b) => Object.assign(b, a) };
    function Control() { this.__root = document.createElement('button'); }
    Object.assign(Control.prototype, {
        init() {}, getRootElement() { return this.__root; }, setText(t) { this.__root.textContent = t; },
        setInteractionState(value) { this.__root.disabled = !value; },
        setImage() {}, setTooltipText() {},
        addClass(c) { this.__root.classList.add(c); }, hide() { this.__root.hidden = true; }, show() { this.__root.hidden = false; },
        addTarget(owner, cb) { this.__root.addEventListener('click', () => cb.call(owner, this, 'tap')); },
        getView() { return this._view; }
    });
    for (const [name, methods] of Object.entries(prototypes)) {
        if (window[name]) continue;
        const C = function () { Control.call(this); };
        C.prototype = Object.create(Control.prototype); C.prototype.constructor = C;
        for (const method of methods) if (!C.prototype[method]) C.prototype[method] = function () {};
        window[name] = C;
    }
    window.UTStandardButtonControl = Control;
    window.EAView = Control;
    window.UTAcademyUtils = {};
    window.UTSearchCriteriaDTO = class {};
    const observe = data => ({ observe(owner, cb) { cb(this, { success: true, ...data }); }, unobserve() {} });
    const persona = { id: 12, sku: 'pc27', isPC: true, isXbox: false, isPlaystation: false };
    window.services = {
        User: { getUser: () => ({ selectedPersona: 12, getSelectedPersona: () => persona, tradeAccess: 1, getCurrency: () => ({ amount: 50000 }) }),
            requestCurrencies: () => observe({}) },
        Localization: { localize: key => key }, Notification: { queue: n => window.__eaCalls.notifications.push(n) },
        Configuration: { checkFeatureEnabled: () => true }, Authentication: { utasSession: { id: 'mock-session', isAuthenticated: () => true } },
        Club: { getStats: () => observe({ response: { stats: [{ type: 'players', count: window.__inventory.length }] } }),
            search: c => observe({ response: { items: window.__inventory.slice(c.offset, c.offset + 200), retrievedAll: true } }) },
        Squad: { requestSquadList: () => observe({ data: { activeSquadId: 1 } }),
            requestSquadById: () => observe({ data: { squad: window.mockSquad([window.__inventory[4]]) } }) },
        Item: { searchStorageItems: () => observe({ response: { items: [], endOfList: true } }),
            searchConceptItems: c => observe({ response: { items: c.defId.map(id => mockPlayer(id)), endOfList: true } }),
            bid() { window.__eaCalls.buys++; throw new Error('Real purchases forbidden in fixture'); } },
        SBC: { saveChallenge(c) { window.__eaCalls.saves++; return observe({}); },
            submitChallenge() { window.__eaCalls.submits++; throw new Error('Submit forbidden'); } }
    };
    window.repositories = { Item: { getUnassignedItems: () => [], getStorageItems: () => [], club: { items: new Map() } },
        Squad: { squads: new Map() }, TeamConfig: { getLinkedTeam: x => x, teamLinks: new Map() }, PlayerMeta: new Map() };
    window.mockPlayer = (id = 0, extra = {}) => ({ id, definitionId: id, databaseId: id, rating: id ? 78 : 0,
        possiblePositions: [14], preferredPosition: 14, teamId: 1, leagueId: 13, nationId: 1, rareflag: 0, pile: 7,
        concept: false, tradable: true, owners: 1, loans: -1, endTime: -1, upgrades: null, groups: [],
        isPlayer: () => !!id, isLimitedUse: () => false, isEnrolledInAcademy: () => false, getTier: () => 3,
        isValid: () => !!id, isSpecial: () => false, getStaticData: () => ({ name: 'Player ' + id }),
        getPriceLimits: () => ({ minimum: 150, maximum: 10000 }), ...extra });
    window.UTItemEntity = function (original) { Object.assign(this, mockPlayer(), original); };
    window.UTNullItemEntity = window.UTItemEntity;
    window.UTItemViewFactory = { createLargeItem(item) {
        const root = document.createElement('div'); root.style.cssText = 'height:230px;width:150px;background:#476477;color:white;display:grid;place-items:center';
        root.textContent = 'EA simulated card ' + item.definitionId;
        return { init() {}, render() {}, dealloc() {}, getRootElement: () => root };
    } };
    window.mockSquad = (initial = []) => {
        let items = Array.from({ length: 23 }, (_, i) => initial[i] || mockPlayer());
        const slot = i => ({ index: i, get item() { return items[i]; }, getItem: () => items[i],
            isBrick: () => i >= 2, isValid: () => !!items[i].id, getGeneralPosition: () => 14 });
        return { getPlayers: () => items.map((_, i) => slot(i)), getFieldPlayers: () => items.slice(0, 11).map((_, i) => slot(i)),
            simpleBrickIndices: [2,3,4,5,6,7,8,9,10], getAllBrickIndices: () => [2,3,4,5,6,7,8,9,10],
            isSBC: () => true, isDream: () => false, getSlot: slot, getFormation: () => ({ name: '442' }), setPlayers: next => { items = next.slice(); },
            chemCalculator: { calculate: () => ({ chemistry: 0, slots: Array.from({ length: 11 }, () => ({ points: 0 })) }) } };
    };
    window.UTSquadEntity = function () { Object.assign(this, mockSquad()); };
    window.UTSquadChemCalculatorUtils = function () {};
    window.factories = { Squad: { generateSBCSquadConstructorOptions: data => data } };
    window.services.SBC.sbcDAO = { factory: {} };
    window.UTSBCChallengeEntity = function (data) {
        Object.assign(this, data); this.squad = mockSquad(); this.eligibilityRequirements = data.requirements;
        this.meetsRequirements = () => this.squad.getPlayers().slice(0, 2).every(s => s.item.rating >= 78);
    };
    window.__inventory = Array.from({ length: 6 }, (_, i) => mockPlayer(i + 1));
    window.getAppMain = () => ({ getRootViewController: () => ({}) });
}
if (typeof module !== 'undefined') module.exports = installEaMocks;
