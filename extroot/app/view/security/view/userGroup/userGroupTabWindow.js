Ext.define('Admin.view.security.view.userGroup.userGroupTabWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'Admin.view.security.view.userGroup.userGroupTab'
    ],
    title: _('Create a new user group'),
    iconCls: 'x-fa fa-plus',
    layout: {
        type: "fit",
        anchor: '100%'
    },
    closeToolText: _('Close'),
    monitorResize: true,//如果需要，可以监听viewport resize事件并执行任何布局更新。 如果使用大小作为窗口的百分比，这是有用的。
    width: "60%",
    minWidth: 200,
    height: "80%",
    minHeight: 300,
    resizable: true,
    modal: true,
    items: [{
        xtype: 'userGroupTab'
    }]
});