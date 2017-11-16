Ext.define('Admin.view.resource.discovery.template.discoveryTemplateGridView', {
    extend: 'Admin.view.base.PagedGrid',
    xtype: 'discoveryTemplateGridView',
    reference: 'discoveryTemplateGrid',

    viewModel: {
        stores: {
            discovery_template_store: {
                autoLoad: true,
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/resource/discovery_template/select/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    },
                }
            }
        }
    },

    controller: {
        onAdd: function(me, e, eOpts) {
            var container = this.getView().up().up();
            var form = container.down(me.viewtype);
            var formContainer = form.up();
            form.lookupController().clearForm();
            container.setActiveItem( formContainer );
        },

        onEdit: function(me, e, eOpts) {
            var record = this.getView().getSelectionModel().getSelection()[0];
            var container = this.getView().up().up();
            var form = container.down(record.get('viewtype'));
            var formContainer = form.up(); 
            form.lookupController().loadFormRecord(record);
            container.setActiveItem( formContainer );
        },

        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var container = this.getView().up().up();
            var form = container.down(record.get('viewtype'));
            var formContainer = form.up(); 
            form.lookupController().loadFormRecord(record);
            container.setActiveItem( formContainer );
        },

        onDelete: function(me, e, eOpts) {
            var grid = this.getView(),
                records = grid.getSelectionModel().getSelection(),
                names = [], ids=[];

            for (var i in records) {
                console.log('delete... ', records[i].get('name'));
                names.push(records[i].get('name'));
                ids.push(records[i].get('id'));
            }

            Ext.MessageBox.confirm(_('Confirmation'), _('Confirm to delete ') + '<br />' +  names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'ids', value:  ids.join(',')},
                                {xtype: 'hidden', name: 'names', value:  names.join(',')}
                            ]
                        }).getForm().submit({
                            url: '/resource/discovery_template/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                grid.store.reload();
                                Ext.Msg.alert(_('Success'), action.result.msg);
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Failed'), action.result.msg);
                            }
                        });
                    }
                }
            );
        },

        onRefresh: function(me, e, eOpts) {
            var grid = this.getView();
            grid.getStore().reload();
        },

        onSelectionchange: function(me, selected, eOpts) {
            var editBtn = this.getView().down('toolbar').getComponent('theEditBtn');
            if( selected.length == 1) {
                editBtn.setDisabled(false);
            } else {
                editBtn.setDisabled(true);
            }
        }

    },

    bind: {
        store: '{discovery_template_store}',
    },

    selModel: {
        type: 'checkboxmodel'
    },

    columns: [
        { xtype: 'rownumberer', width: 60, sortable: false, align: 'center' }, 
        { text: _('Name'), dataIndex: 'name', width: 200 },
        { text: _('Type'), dataIndex: 'type', width: 120 },
        { text: _('Config'), dataIndex: 'config', flex: 1 },
    ],

    pagingbarDock: 'top',
    pagingbarDefaultValue: 15,
    pagingbarConfig: {
        fields: [{name: 'val', type: 'int'}],
        data: [
            {val: 15},
            {val: 30},
            {val: 60},
            {val: 100},
            {val: 200},
            {val: 500},
            {val: 1000},
            {val: 2000},
        ]
    },

    dockedItems: [
    {
        xtype: 'toolbar',
        dock: 'top',
        border: true,
        items: [
            {
                text: _('Add'),
                iconCls:'x-fa fa-plus',
                hidden: SEC.hidden('01030201'),
                menu: [
                    {
                        text: _('SNMP Template'),
                        iconCls:'x-fa fa-circle-o',
                        hidden: SEC.hidden('0103020101'),
                        viewtype: 'snmpFormView',
                        handler: 'onAdd'
                    },
                    {
                        text: _('ICMP Template'),
                        iconCls:'x-fa fa-circle-o',
                        hidden: SEC.hidden('0103020102'),
                        hidden: true,
                        viewtype: 'icmpFormView',
                        handler: 'onAdd'
                    },
                    {
                        text: _('NETCONF Template'),
                        iconCls:'x-fa fa-circle-o',
                        hidden: SEC.hidden('0103020103'),
                        viewtype: 'netconfFormView',
                        handler: 'onAdd'
                    },
                ]            
            },

            {
                text: _('Edit'),
                iconCls:'x-fa fa-edit',
                hidden: SEC.hidden('01030202'),
                handler: 'onEdit',
                itemId: 'theEditBtn',
                disabled: true
            },
            {
                text: _('Delete'),
                iconCls:'x-fa fa-trash',
                hidden: SEC.hidden('01030203'),
                handler: 'onDelete',
                bind: {
                    disabled: '{!discoveryTemplateGrid.selection}'
                }                    
            },
            '->',
            {
                text: _('Refresh'),
                iconCls:'x-fa fa-refresh',
                handler: 'onRefresh'
            }
        ]
    }],

    listeners: {
        itemdblclick: 'onItemDoubleClick',
        selectionchange: 'onSelectionchange'
    }

});
