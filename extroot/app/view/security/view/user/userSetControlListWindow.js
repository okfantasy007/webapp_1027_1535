Ext.define('Admin.view.security.view.user.userSetControlListWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'Admin.view.security.view.controlList.controlListGrid',
        'Admin.view.security.controller.user.userSetControlListWindow'
    ],
    border: false,
    closeToolText: _('Close'),
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
    xtype: "userSetControlListWindow",
    controller: 'userSetControlListWindow',
    items: [
        { xtype: 'controlListGrid' }
    ],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        defaults: {
            minWidth: 60,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Close'), iconCls: 'x-fa fa-close', handler: 'onClose' }
        ]
    }]
});