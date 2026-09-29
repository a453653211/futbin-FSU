const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual EA dialog constructors/methods inspected in the official bundle.
// The DOM/base UI scaffolding is mocked; option creation and tap dispatch are EA code.
const ea = fs.readFileSync(path.join(__dirname, '../.reference/compiled_2.js'), 'utf8');
function extract(name, parent) {
    const start = ea.indexOf(`${name}=(i=>{`);
    const end = ea.indexOf(`})(${parent})`, start);
    assert.ok(start >= 0 && end > start, `EA ${name} source available`);
    return ea.slice(start, end + `})(${parent})`.length) + ';';
}
function setup(legacy = false) {
    function Base() { this.init(); }
    Base.prototype.init = function () {
        this.__msg = {}; this.__secMsg = {}; this.__title = {};
        this.__btnContainer = { children: [] }; this.targets = [];
    };
    Base.prototype.addClass = function () {};
    Base.prototype.layoutSubviews = function () {};
    Base.prototype.addSubview = function (button, container) { container.children.push(button); };
    Base.prototype.addTarget = function (owner, cb, event) { this.targets.push({ owner, cb, event }); };
    Base.prototype._triggerActions = function (event, data) {
        this.targets.filter(t => t.event === event).forEach(t => t.cb.call(t.owner, this, event, data));
    };
    function Controller() {
        this.onExit = { values: [], notify(value) { this.values.push(value); } };
    }
    Controller.prototype.init = function () { this.view = this._getViewInstanceFromData(); };
    Controller.prototype.getView = function () { return this.view; };
    Controller.prototype.viewDidAppear = function () {};
    Controller.prototype.decorateLinks = function () {};
    function Button() { this.classes = new Set(); }
    Button.prototype.init = function () {};
    Button.prototype.setText = function (text) { this.text = text; this.__text = { innerHTML: text }; };
    Button.prototype.addClass = function (name) { this.classes.add(name); };
    Button.prototype.addTarget = function (owner, cb, event) { this.tap = () => cb.call(owner, this, event); };
    const context = {
        events: {}, EATargetActionView: Base, BasePopupViewController: Controller,
        UTGroupButtonControl: Button, EventType: { TAP: 'tap' }, KeyboardKey: { ESCAPE: 'Escape', MS_ESCAPE: 'Esc', ENTER: 'Enter' },
        enums: { UIDialogOptions: { OK: 2, CANCEL: 1, YES: 3, NO: 4 } },
        utils: { PopupManager: { getLocalizedDialogOption: id => ({ 1:'取消', 2:'确定', 3:'是', 4:'否' }[id] || '*') } },
        fy: key => ({ 'popupButtonsText.44401':'前往网站计算', 'popupButtonsText.44403':'关闭',
            'popupButtonsText.44404':'前往设置排除联赛', 'popupButtonsText.44405':'前往设置黄金球员范围',
            'popupButtonsText.44407':'前往设置可使用特殊球员', 'popupButtonsText.44408':'继续', 'popupButtonsText.44409':'放弃' }[key] || key),
        __extends: (child, parent) => { Object.setPrototypeOf(child, parent); child.prototype = Object.create(parent.prototype); child.prototype.constructor = child; }
    };
    vm.createContext(context);
    vm.runInContext(extract('EADialogView', 'EATargetActionView') + extract('EADialogViewController', 'BasePopupViewController'), context);
    if (legacy) {
        vm.runInContext(`EADialogViewController = function (config) {
            this.options = config.dialogOptions;
            this._getViewInstanceFromData = () => ({dialogOptions: this.options.map(o => ({text: String(o.labelEnum)}))});
            this.init = function () { this.view = this._getViewInstanceFromData(); };
            this.getView = function () { return this.view; };
        };`, context);
    }
    const fixPath = path.join(__dirname, '../src/dialog-compat.js');
    vm.runInContext(fs.existsSync(fixPath) ? fs.readFileSync(fixPath, 'utf8')
        : 'events.createDialog = config => new EADialogViewController(config);', context);
    return context;
}
function open(context, ids) {
    const dialog = context.events.createDialog({ dialogOptions: ids.map(labelEnum => ({labelEnum})),
        title: '阵容补全提示', message: '请输入评分', type: context.EADialogView.Type.MESSAGE });
    dialog.init();
    if (dialog.viewDidAppear) dialog.viewDidAppear();
    return dialog;
}
test('EA current constructor ignores old dialogOptions (root-cause reproduction)', () => {
    const c = setup();
    const dialog = new c.EADialogViewController({dialogOptions:[{labelEnum:2},{labelEnum:1}]});
    dialog.init();
    assert.equal(dialog.getView().dialogOptionEnums.size, 0);
});
test('squad completion dialog renders OK, cancel and calculation buttons', () => {
    const dialog = open(setup(), [2,1,44401]);
    const buttons = dialog.getView().__btnContainer.children;
    assert.deepEqual(buttons.map(b=>b.text), ['确定','取消','前往网站计算']);
    assert.ok(buttons[0].classes.has('primary'));
    buttons.forEach(b=>b.tap());
    assert.deepEqual(dialog.onExit.values,[2,1,44401]);
    assert.equal(dialog.getView().dialogOptions.length,3);
    assert.equal(dialog.options[2].labelEnum,44401);
});
test('settings dialog retains all four custom actions and labels', () => {
    const dialog = open(setup(),[44404,44407,44405,44403]);
    const buttons = dialog.getView().__btnContainer.children;
    assert.equal(buttons.length,4);
    assert.equal(buttons.at(-1).text,'关闭');
    buttons.forEach(b=>b.tap());
    assert.deepEqual(dialog.onExit.values,[44404,44407,44405,44403]);
});
test('keyboard maps Enter and Escape to the correct original action IDs', () => {
    const dialog = open(setup(),[2,1,44401]);
    dialog.handleKeyUpEvent({key:'Enter'});dialog.handleKeyUpEvent({key:'Escape'});
    assert.deepEqual(dialog.onExit.values,[2,1]);
    const custom = open(setup(),[44408,44409]);
    custom.handleKeyUpEvent({key:'Enter'});
    custom.handleKeyUpEvent({key:'Escape'});
    assert.deepEqual(custom.onExit.values,[44408,44409]);
    const menu = open(setup(),[44404,44407,44405,44403]);
    menu.handleKeyUpEvent({key:'Enter'});
    assert.deepEqual(menu.onExit.values,[]);
    menu.handleKeyUpEvent({key:'Escape'});
    assert.deepEqual(menu.onExit.values,[44403]);
});
test('single-button alerts render a usable OK button', () => {
    const dialog = open(setup(),[2]);
    assert.equal(dialog.getView().__btnContainer.children.length,1);
    dialog.getView().__btnContainer.children[0].tap();
    assert.deepEqual(dialog.onExit.values,[2]);
});
test('old EA view remains usable without duplicate buttons', () => {
    const dialog = open(setup(true),[2,1]);
    assert.equal(dialog.getView().dialogOptions.length,2);
});
test('recreating the view does not duplicate buttons or lose custom options', () => {
    const dialog = open(setup(),[2,1,44401]);
    const recreated = dialog._getViewInstanceFromData();
    assert.equal(recreated.dialogOptionEnums.size,3);
    assert.deepEqual(recreated.__btnContainer.children.map(b=>b.text),['确定','取消','前往网站计算']);
});
test('factory does not change EA native controller/prototypes', () => {
    const c=setup();
    const method=c.EADialogViewController.prototype._getViewInstanceFromData;
    open(c,[2,1]);
    assert.equal(c.EADialogViewController.prototype._getViewInstanceFromData,method);
    const dialog = new c.EADialogViewController({continueOption:{labelEnum:2},cancelOption:{labelEnum:1}});
    dialog.init();
    assert.equal(dialog.getView().dialogOptionEnums.size,2);
});
