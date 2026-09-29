/* Adapt only FSU-created dialogs. EA's own popup constructors/prototypes stay untouched. */
events.createDialog = config => {
    const options = config.dialogOptions || [];
    const ids = enums.UIDialogOptions;
    const controller = new EADialogViewController(config);
    controller.options = options;
    const createView = controller._getViewInstanceFromData;
    controller._getViewInstanceFromData = function () {
        // The new controller accepts only continueOption/cancelOption. Build the full
        // legacy option list on its native view, including FSU's third/fourth actions.
        const continueOption = this.continueOption, cancelOption = this.cancelOption;
        this.continueOption = undefined;
        this.cancelOption = undefined;
        let view;
        try {
            view = createView.call(this);
        } finally {
            this.continueOption = continueOption;
            this.cancelOption = cancelOption;
        }
        if (view.dialogOptionEnums && typeof view.createOption === 'function') {
            const cancelIds = [ids.CANCEL, ids.NO, 44403, 44409];
            this.continueOption = options.find(o => o.primaryActionFlag)
                || options.find(o => [ids.OK, ids.YES, 44408].includes(o.labelEnum));
            this.cancelOption = options.find(o => cancelIds.includes(o.labelEnum));
            for (const option of options) {
                const label = option.labelEnum >= 44400
                    ? fy(`popupButtonsText.${option.labelEnum}`)
                    : utils.PopupManager.getLocalizedDialogOption(option.labelEnum);
                view.createOption(label, option === this.continueOption ? 'continue' : 'cancel',
                    option.labelEnum, option.mini);
            }
            // Existing FSU code styles dialogOptions and indexes controller.options.
            view.dialogOptions = Array.from(view.dialogOptionEnums.keys());
            view.layoutSubviews();
            this.handleKeyUpEvent = function (event) {
                if (event.key === KeyboardKey.ESCAPE || event.key === KeyboardKey.MS_ESCAPE)
                    this.onExit.notify(this.cancelOption?.labelEnum ?? ids.CANCEL);
                else if (event.key === KeyboardKey.ENTER && this.continueOption)
                    this.onExit.notify(this.continueOption.labelEnum);
            };
        }
        return view;
    };
    return controller;
};
