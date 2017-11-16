Ext.define("Admin.view.security.view.user.userMgDomainWindow", {
    extend: "Ext.window.Window",
    requires: "Admin.view.security.view.user.userMgDomainForm",
    controller: {
        onClose: function () {
            var me = this;
            var meView = me.getView();
            var arr = meView.down("userMgDomainForm").arr;
            arr.splice(0, arr.length);
            Ext.Ajax.request({
                url: '',
                method: 'post'
            })
        }
    },
    title: _("Edit the admin domain"),
    iconCls: "x-fa fa-plus",
    closeToolText: _("Close"),
    layout: {
        type: "fit",
        anchor: '100%'
    },
    monitorResize: true,//如果需要，可以监听viewport resize事件并执行任何布局更新。 如果使用大小作为窗口的百分比，这是有用的。
    width: "60%",
    minWidth: 200,
    height: "80%",
    minHeight: 300,
    resizable: true,
    modal: true,
    items: [
        { xtype: "userMgDomainForm" }
    ],
    listeners: {
        close: "onClose"
    }
});