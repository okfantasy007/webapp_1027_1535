Ext.define("Admin.view.security.controller.controlList.controlListForm", {
    extend: "Ext.app.ViewController",
    alias: "controller.controlListForm",
    onChange: function (cb, nv, ov) {
        var meView = this.getView();
        meView.down("#ip_range").setDisabled(!nv).setVisible(nv);
        meView.down("#ip_range_from").setDisabled(nv).setVisible(!nv);
        meView.down("#ip_range_to").setDisabled(nv).setVisible(!nv);
        meView.down("#ip_subnet_tips").setDisabled(!nv).setVisible(nv);
        meView.down("#ip_range_tips").setDisabled(nv).setVisible(!nv);
    },

    onOk: function () {
        var meView = this.getView();
        var values = meView.getValues();
        if (meView.isValid()) {
            meView.submit({
                url: "/security/security_control/add_upadte",
                waitTitle: _("Please wait..."),
                waitMsg: _("Please wait..."),
                success: function (self, action) {
                    Ext.Msg.alert(_("Notice"), _(action.result.msg), function () {
                        meView.up('controlListGrid').lookupController().onRefresh();
                        var tree = meView.up("secUserLeftTree");
                        if (tree) {//在用户界面中调用生效，产生刷新功能
                            var grid = tree.down("userControlList");
                            grid.lookupController().onControlListRefresh();
                        }
                        meView.up('window').close();
                    });
                },
                failure: function (self, action) {
                    Ext.Msg.alert(_("Notice"), _(action.result.msg));
                }
            });
        } else {
            Ext.Msg.alert(_("Notice"), _("Data format input error"));
        }

    },

    onCancel: function () {
        var meView = this.getView();
        meView.up().close();
    }
});