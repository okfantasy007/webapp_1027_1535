Ext.define('Admin.view.security.view.user.userTabWindow', {
    extend: 'Ext.window.Window',
    requires: 'Admin.view.security.view.user.userTab',
    layout: {
        type: "fit",
        anchor: '100%'
    },
    title: _('Create User'),
    iconCls: 'x-fa fa-plus',
    closeToolText: _('Close'),
    monitorResize: true,//如果需要，可以监听viewport resize事件并执行任何布局更新。 如果使用大小作为窗口的百分比，这是有用的。
    width: "60%",
    minWidth: 200,
    height: "80%",
    minHeight: 300,
    resizable: true,
    modal: true,
    items: [{
        xtype: 'userTab'
    }]
});