Ext.define('Admin.view.security.controller.user.userGeneric', {
    extend: 'Admin.view.security.secBaseController.genericController',
    alias: 'controller.userGeneric',

    onPwdChange: function (self, nv, ov, op) {
        var meView = this.getView();
        var numberfield = meView.down('#password_valid_days');
        numberfield.setDisabled(nv);
        var value = numberfield.getValue();
        if (nv == 1) {
            numberfield.setValue(0);
        } 
        if(nv ==0){
            if(value == 0) 
            numberfield.setValue(180);
            else
            numberfield.setValue(value);
        } 
    },

    onOnlineChange: function (self, nv, ov, op) {
        var meView = this.getView();
        var numberfield = meView.down('#max_online_num');
        numberfield.setDisabled(nv);
        var value = numberfield.getValue();
        if (nv == 1) {
            numberfield.setValue(0);
        } 
        if(nv == 0){
            if(value == 0)
            numberfield.setValue(30);
            else
            numberfield.setValue(value);
        }
    },

    onExitChange: function (self, nv, ov, op) {
        var meView = this.getView();
        var numberfield = meView.down('#auto_exit_wait_time');
        numberfield.setDisabled(nv);
        if (nv) {
            numberfield.setValue(0);
        } else {
            numberfield.setValue(10);
        }
    },

    onNoChangePwd: function (self, nv, ov, op) {
        var meView = this.getView();
        var value = meView.down('#cannot_change_password').getValue();
        meView.down('#change_password_next_login').setDisabled(value);

    },

    onLoginPwdChange: function () {
        var meView = this.getView();
        var value = meView.down('#change_password_next_login').getValue();
        meView.down('#cannot_change_password').setDisabled(value);
    },

    onPeriodChange: function (self, nv, ov, op) {
        var meView = this.getView();
        var fieldcontainer = meView.down('#time_period_falg_fields');
        fieldcontainer.setVisible(nv).setDisabled(!nv);
    },

    onApply: function () {
        this.onSubmit(null);
    },

    onChange: function (self, nv, ov, eOpts) {
        var meView = this.getView();
        meView.down('#user_type').setDisabled(true);
        meView.down('#full_name').setReadOnly(nv == 1);
        if(nv == 1) {
        meView.down('#full_name').addCls("x-item-disabled");
        } else {
        meView.down('#full_name').removeCls("x-item-disabled");
        }
        meView.up("userTab").down("userControlList").down("#rigthRadio").setDisabled(nv == 1);
        if (nv == 1) {
            var store = meView.down('#user_type').getStore();
            store.add({ type: _('Superuser'), id: 0 });
        }
    }
});