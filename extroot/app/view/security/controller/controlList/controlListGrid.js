Ext.define("Admin.view.security.controller.controlList.controlListGrid", {
    extend: "Ext.app.ViewController",
    alias: "controller.controlListGrid",
    onSelectChange: function (thisModel, selRecords) {
        var meView = this.getView();
        var length = selRecords.length;
        meView.down("#remove").setDisabled(length == 0);//当选中记录时删除按钮亮
        meView.down("#edit").setDisabled(length != 1);//当选中记录大于一条时编辑按钮灰
        if (length == 1 && selRecords[0].get("id") == 1) {//超级用户不可编辑修改
            meView.down("#remove").setDisabled(true);
            meView.down("#edit").setDisabled(true);
        }
    },

    ondbClick: function (self, record, item, index, e, eOpts) {//双击进入编辑视图
        var me = this;
        var id = record.get("id");
        if (id != 1) {//超级用户不可编辑
            me.onEdit();
        }
    },

    onAdd: function () {//添加功能
        var window = this.onRendWindow();//获取window对象
        window.setTitle(_("Add system access control"));//添加标题
        window.setIconCls("x-fa fa-plus");
        window.show();//显示window
        this.getView().add(window);//将window对象加入当前视图中
    },

    onEdit: function () {//删除功能
        var window = this.onRendWindow();
        var form = window.down("form");
        var record = this.getView().getSelectionModel().getSelection()[0];//获取选中记录
        window.setTitle(_("Modify system access control"));
        window.setIconCls("x-fa fa-edit");
        window.show();
        this.getView().add(window);
        if (record.get("ip_limit_type") == 1) {
            form.down("#ipRange").setDisabled(true);//限制用户不可修改ip地址表示方式
        } else {
            form.down("#ipSubnet").setDisabled(true);
        }
        form.getForm().loadRecord(record);//加载数据
    },

    onRendWindow: function () {
        var window = new Admin.view.security.view.controlList.controlListWindow();
        return window;
    },

    onRemove: function () {//移除功能
        var records = this.getView().getSelectionModel().getSelection();
        var names = [], ids = [], ip_range = [], me = this;
        names.push(_("The following access control lists will be deleted:</br>"));
        Ext.Array.each(records, function (rec) {
            names.push("'" + rec.get("ip_range") + "'");
            ids.push(rec.get("id"));
            ip_range.push(rec.get("ip_range"));
        });
        if (Ext.Array.contains(ids, 1)) {
            Ext.Msg.alert(_("Notice"), _("You can not delete the default access control list"));
        } else {
            Ext.Msg.confirm(_("Delete confirmation"), names.join("<br/>"),
                function (btn) {
                    if (btn == "yes") {
                        Ext.create("Ext.form.Panel").getForm().submit({
                            url: "/security/security_control/delete",
                            params: {
                                ids: ids.join(","),
                                ip_range: ip_range.join(" ; ")
                            },
                            waitTitle: _("Please wait..."),
                            waitMsg: _("Please wait..."),
                            success: function (form, action) {
                                Ext.Msg.alert(_("Notice"), _(action.result.msg), function () {
                                    me.onRefresh();
                                });
                            },
                            failure: function (form, action) {
                                Ext.Msg.alert(_("Notice"), _(action.result.msg));
                            }
                        });
                    }
                });
        }
    },

    onRefresh: function () {//刷新
        var meView = this.getView();
        meView.getStore().reload();
    }
});