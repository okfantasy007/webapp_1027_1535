Ext.define('widget.helloGrid5aForm', {
    extend: 'Admin.view.base.CardForm',
    xtype: 'helloGrid5aForm',

    controller: {

        onSubmit: function() {
            var form = this.getView(),
                card = form.up(),
                grid = card.down('helloGrid5aGrid');

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/demo/employees/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        Ext.Msg.alert(_('Success'), action.result.msg);
                        card.setActiveItem(0);
                        grid.lookupController().onRefresh();
                    },
                    failure: function(form, action) {
                        Ext.MessageBox.alert(_('操作失败!'), action.result.msg);
                    }
                });                
            }
            else {
                Ext.MessageBox.alert(_('输入错误!'), '请检查输入错误！');
            }
        },

        onCancel: function() {
            this.getView().up().setActiveItem(0);
        },

        onReset: function() {
            this.getView().getForm().reset();
        },

    },

    margin: 10,
    items: [
    {
        xtype: 'fieldset',
        title: 'Employee Information',

        margin: 10,
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
        {
            xtype: 'hidden',
            name: 'emp_no'
        },
        {
            fieldLabel: 'First Name',
            emptyText: 'First Name',
            allowBlank: false,
            // vtype:'IPAddress',
            name: 'first_name'
        }, 
        {
            fieldLabel: 'Last Name',
            emptyText: 'Last Name',
            allowBlank: false,
            name: 'last_name'
        },
        {
            xtype: 'combobox',
            fieldLabel: 'Gender',
            name: 'gender',
            store: {
                autoLoad: true,             
                fields: [
                    'abbr',
                    'name'
                ],
                proxy: {
                    type: 'ajax',
                    url: '/demo/employees/gender',
                    reader: 'array'
                }
            },             
            valueField: 'abbr',
            displayField: 'name',
            queryMode: 'local',
            value: 'M',
            emptyText: 'Select a gender...'
        }, 
        {
            xtype: 'datefield',
            fieldLabel: 'Birthday',
            name: 'birth_date',
            format: 'Y-m-d',
            value: new Date(),
            maxValue: new Date()
        },
        {
            xtype: 'datefield',
            fieldLabel: 'Hire Date',
            name: 'hire_date',
            format: 'Y-m-d',
            value: new Date(),
            maxValue: new Date()
        }
        ]
    }],

    buttons: [
    {
        text: _('Reset'),
        iconCls:'x-fa fa-undo',
        handler: 'onReset',
    },
    {
        text: _('Cancel'),
        iconCls:'x-fa fa-close',
        handler: 'onCancel',
    },
    {
        text: _('Save'),
        iconCls:'x-fa fa-save',
        handler: 'onSubmit',
    }]

});
