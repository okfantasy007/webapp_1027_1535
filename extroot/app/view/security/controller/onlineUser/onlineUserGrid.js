Ext.define('Admin.view.security.controller.onlineUser.onlineUserGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.onlineUserGrid',
    onRemoveUser: function () { //强制用户退出
        var meView = this.getView();
        var records = meView.getSelectionModel().getSelection();
        var names = [];
        var log_parm = [];
        names.push(_('The following users will be forced to exit </ br>'));
        Ext.Array.each(records, function (rec) {
            names.push(rec.get('user_name'));
            log_parm.push(rec.get("sessionID") + "*" + rec.get("user_name") + "*" + rec.get("ip_address") + "*3")
        });
        Ext.MessageBox.confirm(_('Whether to remove it'), names.join('<br/>'),
            function (np) {
                if (np == 'yes') {
                    Ext.create('Ext.form.Panel').getForm().submit({
                        url: '/kickoffuser',
                        params: { log_parm: log_parm.join(",") },
                        waitTitle: _("Please wait..."),
                        waitMsg: _("Please wait..."),
                        success: function (form, action) {
                            Ext.Msg.alert(_("Notice"), _(action.result.msg), function () {
                                meView.getStore().reload();
                                meView.up('secUserLeftTree').lookupController().onRefresh();
                            });
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert(_("Notice"), _(action.result.msg));
                        }
                    });
                }
            });
    },

    onSelectChange: function (grid, selection, eOpts) {
        var me = this;
        var meView = me.getView();
        var mark = false;
        for (var i in selection) {
            if (selection[i].get('sessionID') == APP.sessionID) {
                mark = true;
            }
        }
        meView.down("#removeButton").setDisabled(selection.length == 0 || mark);
    },

    onContextMenu: function (self, e, eOpts) {
        this.rightMenu(e);
    },

    onItemContextMenu: function (self, record, item, index, e, eOpts) {
        this.rightMenu(e);
    },

    rightMenu: function (e) {
        e.preventDefault();
        e.stopEvent();
        var grid = this.view;
        var me = this;
        var rightMenu = new Ext.menu.Menu({
            items: [
                {
                    text: _('Refresh'),
                    funcid: '040120',
                    iconCls: 'x-fa fa-sign-in',
                    handler: function () {
                        me.view.store.reload();
                    }
                }
            ]
        });
        rightMenu.showAt(e.getXY());
        grid.add(rightMenu);
    }
});