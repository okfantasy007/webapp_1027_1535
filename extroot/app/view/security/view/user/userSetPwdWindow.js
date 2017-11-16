Ext.define('Admin.view.security.view.user.userSetPwdWindow', {
    extend: 'Ext.window.Window',
    requires: 'Admin.view.security.view.user.userSetPwdForm',
    title: _('set password'),
    iconCls: 'x-fa fa-key',
    closeToolText: _("Close"),
    layout: {
        type: "fit",
        anchor: '100%'
    },
    monitorResize: true,//如果需要，可以监听viewport resize事件并执行任何布局更新。 如果使用大小作为窗口的百分比，这是有用的。
    width: "33%",
    minWidth: 200,
    height: "42%",
    minHeight: 250,
    resizable: true,
    modal: true,
    items: [{
        xtype: 'userSetPwdForm'
    }]
});