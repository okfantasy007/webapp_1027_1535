Ext.define('Admin.view.security.controller.userGroup.userGroupMember', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userGroupMember',

    onRemove: function () {
        var me = this;
        var meView = me.getView();
        var records = meView.down('#centerGrid').getSelectionModel().getSelection();
        var selectedId = meView.selectedId;
        for (var i in records) {
            var id = records[i].get('user_id');
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

    onSelect: function () {
        var me = this;
        var meView = me.getView();
        var records = meView.down('#southGrid').getSelectionModel().getSelection();
        var selectedId = meView.selectedId;
        for (var i in records) {
            var id = records[i].get('user_id');
            if (!Ext.Array.contains(selectedId, id)) {
                Ext.Array.push(selectedId, id);
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
        var selectedId = meView.selectedId;
        var southStore = meView.down('#southGrid').getStore();
        var centerStore = meView.down('#centerGrid').getStore();
        centerStore.clearFilter();
        southStore.clearFilter();
        centerStore.filterBy(function (rec) {
            return Ext.Array.contains(selectedId, rec.get('user_id'));
        });
        southStore.filterBy(function (rec) {
            return !Ext.Array.contains(selectedId, rec.get('user_id'));
        });
    },
    onApply: function () {
        var meView = this.getView(),
            tree = meView.up('secUserLeftTree'),
            name = meView.up('userGroupTab').name;
        Ext.create('Ext.form.Panel').getForm().submit({
            url: '/security/security_group/update_users',
            params: {
                name: name,
                sec_usergroup_id: meView.groupId,
                selectedId: meView.selectedId.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg),
                    function () {
                        tree.down('#security_group_view').lookupController().onRefresh();
                        tree.lookupController().onRefresh();
                    });
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Notice'), action.result.msg);
            }
        });
    },

    loadPages: function (rec) {
        var me = this;
        var meView = me.getView();
        if (rec != null) {
            meView.groupId = rec.get('sec_usergroup_id');
        }
        Ext.Ajax.request({
            url: '/security/security_group/user_selected',
            params: {
                sec_usergroup_id: meView.groupId
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
        var sec_usergroup_type = meView.up().down('#sec_usergroup_type').getValue();
        me.refereshGrid();
        southStore.proxy.extraParams = {
            'usergroup_type': sec_usergroup_type
        };
        southStore.load();
        meView.down('#centerGrid').store.load();
    },

    centerChange: function (me, selected, eOpts) {
        var meView = this.getView();
        var groupId = meView.groupId;
        var centerGrid = meView.down('#centerGrid');
        var n = (selected.length == 0);
        if (groupId == 1) {
            for (var i in selected) {
                var rec = selected[i];
                if (rec.get('user_id') == 1) {
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