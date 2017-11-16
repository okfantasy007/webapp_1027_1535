/**
 * This form is a popup window used by the ChildSession view. This view is
 * added as a contained window so we use the same ViewController instance.
 */
Ext.define('Admin.view.system.options.uiConfigDialog', {
    extend: 'Ext.window.Window',
    xtype: 'uiConfigDialog',

    bind: {
        title: '{title}'
    },
    layout: 'fit',
    modal: true,
    width: 500,
    height: 430,
    closable: true,

    items: {
        xtype: 'form',
        reference: 'form',
        bodyPadding: 10,
        border: false,
        // use the Model's validations for displaying form errors
        // modelValidation: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Name',
            reference: 'name',
            msgTarget: 'side',
            // bind: '{record.name}'
            // bind: '{theCompany.name}'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Phone',
            reference: 'phone',
            msgTarget: 'side',
            // bind: '{record.phone}'
        }, 
        // {
        //     xtype: 'grid',
        //     autoLoad: true,
        //     flex: 1,
        //     reference: 'orders',
        //     margin: '10 0 0 0',
        //     title: 'Orders',
        //     // bind: '{theCompany.orders}',
        //     tbar: [{
        //         text: 'Add Order',
        //         handler: 'onAddOrderClick'
        //     }],
        //     columns: [{
        //         text: 'Id',
        //         dataIndex: 'id',
        //         width: 50,
        //         renderer: 'renderOrderId'
        //     }, {
        //         xtype: 'datecolumn',
        //         text: 'Date',
        //         dataIndex: 'date',
        //         format: 'Y-m-d',
        //         flex: 1
        //     }, {
        //         xtype: 'checkcolumn',
        //         text: 'Shipped', 
        //         dataIndex: 'shipped'
        //     }, {
        //        xtype: 'widgetcolumn',
        //         width: 90,
        //         widget: {
        //             xtype: 'button',
        //             text: 'Remove',
        //             handler: 'onRemoveOrderClick'
        //         }
        //     }]
        // }
        ]
    },

    buttons: [{
        text: 'Save',
        handler: 'onSaveClick'
    }, {
        text: 'Cancel',
        handler: 'onCancelClick'
    }]
});