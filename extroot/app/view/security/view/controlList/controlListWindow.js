Ext.define('Admin.view.security.view.controlList.controlListWindow', {
    extend: 'Ext.window.Window',
    requires: 'Admin.view.security.view.controlList.controlListForm',
    layout: {
        type: "fit",
        anchor: '100%'
    },
    border: false,
    closeToolText: _('Close'),
    monitorResize: true,//如果需要，可以监听viewport resize事件并执行任何布局更新。 如果使用大小作为窗口的百分比，这是有用的。
    width: "40%",
    minWidth: 200,
    height: "55%",
    minHeight: 300,
    modal: true,
    items: [
        {
            xtype: 'controlListForm'
        }
    ]
});