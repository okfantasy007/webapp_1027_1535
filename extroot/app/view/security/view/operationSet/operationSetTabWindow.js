Ext.define('Admin.view.security.view.operationSet.operationSetTabWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'Admin.view.security.view.operationSet.operationSetTab'
    ],
    title: _('Create a new set of operations'),
    iconCls: 'x-fa x-fa fa-plus',
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
    controller: {
        afterRender: function () {
            var formvals = this.getView().down('#operset_form_generic').getForm().getValues();
            this.getView().down('#operset_select_funcs').lookupController().load_form({
                sec_operator_set_id: formvals.sec_operator_set_id,
                sec_operator_set_type: formvals.sec_operator_set_type
            });
        }
    },
    items: [
        { xtype: 'operationSetTab' }
    ]
});