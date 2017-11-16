Ext.define('Admin.view.security.controller.user.userOfGroup', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userOfGroup',

    onRemove: function () {
        var me = this;
        var meView = me.getView();
        var records = meView.down('#centerGrid').getSelectionModel().getSelection();
        var selectedId = meView.selectedId;
        for (var i in records) {
            var id = records[i].get('sec_usergroup_id');
            if (Ext.Array.contains(selectedId, id)) {
                Ext.Array.remove(selectedId, id);
            }
        };
        me.refereshGrid();
    },

    centerGridRefresh: function () {
        var meView = this.getView();
        meView.down('#centerGrid').store.reload();
    },

    onSelect: function (self, rec) {
        var me = this;
        var meView = me.getView();
        var records = meView.down('#southGrid').getSelectionModel().getSelection();
        var selectedId = meView.selectedId;
        for (var i in records) {
            var id = records[i].get('sec_usergroup_id');
            if (!Ext.Array.contains(selectedId, id)) {
                selectedId.push(id);
            }
        };
        me.refereshGrid();

    },

    southGridRefresh: function () {
        var meView = this.getView();
        meView.down('#southGrid').store.reload();
    },

    refereshGrid: function () {
        var meView = this.getView();
        var southStore = meView.down('#southGrid').getStore();
        var centerStore = meView.down('#centerGrid').getStore();
        var selectedId = meView.selectedId;
        centerStore.clearFilter();
        southStore.clearFilter();
        centerStore.filterBy(function (rec) {
            return Ext.Array.contains(selectedId, rec.get('sec_usergroup_id'))
        });
        southStore.filterBy(function (rec) {
            return !Ext.Array.contains(selectedId, rec.get('sec_usergroup_id'))
        })
    },

    onApply: function () {
        var meView = this.getView();
        var tree = meView.up('secUserLeftTree');
        var name = meView.up('userTab').name;
        Ext.create('Ext.form.Panel').getForm().submit({
            url: '/security/userOfusergroup_modify',
            params: {
                name: name,
                sec_user_id: meView.userId,
                selectedId: meView.selectedId.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg),
                    function () {
                        tree.down('#security_user_view').lookupController().onRefresh();
                        tree.lookupController().onRefresh();
                    });
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg));
            }
        });
    },

    loadPages: function (rec) {
        var me = this;
        var meView = this.getView();
        var userOfGroupToolbar = meView.down("#userOfGroupToolbar");
        if (rec != null) {
            meView.userId = rec.get('sec_user_id');
        }
        userOfGroupToolbar.setDisabled( meView.userId == 1);//用户为超级用户禁止应用按钮
        Ext.Ajax.request({
            url: '/security/userOfusergroupLoad',
            params: {
                sec_user_id: meView.userId
            },
            success: function (response, opts) {
                var obj = Ext.decode(response.responseText);
                meView.selectedId = obj.selectedId;
                me.onActivate();
            }
        });
    },

    onActivate: function () {
        var me = this;
        var meView = this.getView();
        var southStore = meView.down('#southGrid').getStore();
        me.refereshGrid();
        var user_type = meView.up().down('#user_type').getValue();
        southStore.proxy.extraParams = {
            'user_type': user_type
        };
        southStore.load();
        meView.down('#centerGrid').store.load();
    },

    centerChange: function (me, selected, eOpts) {
        var meView = this.getView();
        var centerGrid = meView.down('#centerGrid');
        var userId = meView.userId;
        var n = (selected.length == 0);
        if (userId == 1) {
            for (var i in selected) {
                var rec = selected[i];
                if (rec.get('sec_usergroup_id') == 1) {
                    n = true;
                }
            }
        }
        centerGrid.down('#remove').setDisabled(n);
    },

    southChange: function (me, selected, eOpts) {
        var meView = this.getView();
        var southGrid = meView.down('#southGrid');
        southGrid.down('#select').setDisabled(selected.length == 0);
    }
});