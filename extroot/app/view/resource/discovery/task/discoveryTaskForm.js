Ext.define('Admin.view.resource.discovery.task.discoveryTaskForm', {
    extend: 'Admin.view.base.CardForm',
    xtype: 'discoveryTaskForm',
    
    requires: [
        'Ext.form.field.Tag'
    ],

    viewModel: {
        stores: {
            discovery_templates_array: {
                autoLoad: true,             
                fields: [
                    'id',
                    'name'
                ],
                proxy: {
                    type: 'ajax',
                    url: '/resource/discovery_template/array',
                    reader: 'array'
                }
            }
        }
    },

    controller: {

        onSubmit: function() {
            var form = this.getView(),
                card = form.up().up(),
                grid = card.down('discoveryTaskGrid');

            var curDetectType = form.down('radiogroup').getValue().scan_type;
            console.log('curDetectType', curDetectType);
            var care = [];
            if(curDetectType == 'ipSubnet') {
                care.push('ipSubnet1');
                care.push('ipSubnet2');
            }

            if(curDetectType == 'ipRange') {
                care.push('ipRange1');
                care.push('ipRange2');
            }

            if(curDetectType == 'ipList') {
                care.push('ipList');
            }
            console.log('care', care);
            var flag = form.down('tagfield').isValid();

            for(var itemName of care) {
                var oneItem = form.down('fieldset').getComponent(curDetectType).getComponent(itemName);
                if(!oneItem.isValid()) {
                    flag = false;
                    break;
                }
            }
            
            if(flag) {
                form.getForm().submit({
                    url: '/resource/discovery_task/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    submitEmptyText : false,
                    clientValidation: false,
                    success: function(form, action) {
                        card.setActiveItem(0);
                        grid.lookupController().onRefresh();
                        Ext.Msg.alert(_('Success'), action.result.msg);
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert(_('Failed'), action.result.msg);
                    }
                });                
            } else {
                Ext.MessageBox.alert(_('input error'), _('Please Check The Input Content'));
            }
        },

        onCancel: function() {
            this.getView().up().up().setActiveItem(0);
        },

        onReset: function() {
            this.getView().getForm().reset();
        },

        onChooseSubnet: function() {
            var me = this;
            var store = Ext.create('Ext.data.TreeStore', {
                idProperty : 'symbol_id',
                fields : [
                    {name : 'symbol_id',type : 'int'}, 
                    {name : 'text',type : 'string'}
                ],          
                proxy: {
                    type: 'ajax',
                    url: '/topo/topo_nodeorlink_info/get_topo_subnet',
                    extraParams: {ids : '-1'}
                },
                reader : {  
                    type : 'json',  
                    rootProperty : 'children'
                } 
            });

            var tree = Ext.create('Ext.tree.Panel', {
                rootVisible: false,
                store: store,
                lines: true,
                containerScroll: true,
                emptyText: 'No Record!',
                
                dockedItems : [{
                    xtype : 'toolbar',
                    items : [
                    {
                        tooltip: _('Full Expand'),
                        handler: function() {
                            tree.expandAll();
                        },
                        iconCls:'toggle_plus'
                    },
                    {
                        tooltip: _('Collapse All'),
                        handler: function() {
                            tree.collapseAll();
                        },
                        iconCls:'toggle_minus'
                    },
                    '->',
                    {
                        itemId: 'func_ids',
                        xtype: 'textfield',
                        name: 'func_ids',
                        width: 120
                    },
                    {
                        tooltip:_('Fast Search'),
                        iconCls:'topo_search_button',
                        handler : function() {
                            me.topo_fast_search(tree);
                        }
                    }]
                }],
                bbar: {
                    items: [
                        "->",
                        {
                            text:_('Save'),
                            handler: function() {
                                var fcSub = me.getView().down('fieldset').getComponent('designate');
                                var symbolid = fcSub.getComponent('wrapper1').getComponent('dest_subnet_id');
                                var symbolname = fcSub.getComponent('wrapper1').getComponent('dest_subnet_name');

                                symbolid.setValue(tree.getSelection()[0].data.symbol_id);
                                symbolname.setValue(tree.getSelection()[0].data.text);
                                this.up('window').close();
                            }
                        },
                        {
                            text:_('Cancel'),
                            handler: function() {
                                this.up('window').close();
                            }
                        }
                    ]
                }
            });

            var win = Ext.widget('window', {
                    title: _('Select Subnet'),
                    border: false,
                    layout: 'fit',
                    width: 280,
                    height: 480,
                    resizable: false,
                    modal: true,
                    items : tree
                });
            win.show();
        },
        topo_fast_search: function (tree) {
            var rootnodes = tree.getRootNode().childNodes;
            var name = tree.down('#func_ids').value;
            if (name.replace(/\s/ig, '') == '') {
                return;
            }
            
            var nodes = this.searchNodes(tree, rootnodes, name);

            var id = 0;
            if (tree.getSelection().length > 0) {
                id = tree.getSelection()[0].data['symbol_id'];
            }
            var exist = false;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].get('symbol_id') == id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                id = 0;
            }
            if (nodes.length==0) {
                Ext.MessageBox.alert(_('Tips'), _('No matching results, please modify the search condition and search again!'));
                return;
            } else {
                var indexNode = null;
                if (id == 0) {
                    indexNode = nodes[0];
                } else {
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i].get('symbol_id') == id) {
                            if (i + 1 < nodes.length) {
                                indexNode = nodes[i + 1];
                                break;
                            } else {
                                Ext.MessageBox.alert(_('Tips'), _('Search is finished!'));
                                indexNode = nodes[0];
                            }
                        } 
                    }
                }
                tree.selectPath(indexNode.getPath());
                tree.getSelectionModel().select(indexNode);
                tree.expandNode(indexNode.parentNode);
            }
        },
        searchNodes: function(tree, node, name) {
            var nodes=[];
            for (var i = 0; i < node.length; i++) {
                if (node[i].get('text').indexOf(name) > -1) {
                    nodes.push(node[i]);
                }
                var rootnode = node[i].childNodes;
                if (rootnode.length > 0) {
                    nodes = nodes.concat( this.searchNodes(tree, rootnode, name) );
                }
            }
            return nodes;
        }
    },

    fieldDefaults: {
        labelWidth: 140
    },

    items: [
    {
        xtype: 'fieldset',

        margin: 10,
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
        {
            xtype: 'hidden',
            name: 'id'
        },
        {
            xtype: 'radiogroup',
            fieldLabel: _('detect type'),
            items: [
                {name: 'scan_type',boxLabel: _('ipSubnet'), inputValue: 'ipSubnet', reference: 'ipSubnet'},
                {name: 'scan_type',boxLabel: _('ipRange'), inputValue: 'ipRange', checked: true, reference: 'ipRange'},
                {name: 'scan_type',boxLabel: _('ipList'), inputValue: 'ipList', reference: 'ipList'},
            ]
        },
        {
            xtype: 'fieldcontainer',
            layout: 'anchor',
            itemId: 'ipSubnet',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            bind: {
                hidden: '{!ipSubnet.checked}',
            },
            items: [
            {
                xtype: 'textfield',
                fieldLabel: _('ip subnet address'),
                emptyText: _('192.168.1.1'),
                vtype: 'IPAddress',
                allowBlank: false,
                itemId: 'ipSubnet1',
                name: 'ip_subnet'
            }, 
            {
                xtype: 'textfield',
                fieldLabel: _('subnet mask'),
                emptyText: _('255.255.255.0'),
                vtype: 'IPAddress',
                allowBlank: false,
                itemId: 'ipSubnet2',
                name: 'ip_netmask'
            }
            ]
        },
        {
            xtype: 'fieldcontainer',
            layout: 'anchor',
            itemId: 'ipRange',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            bind: {
                hidden: '{!ipRange.checked}',
            },
            items: [
            {
                xtype: 'textfield',
                fieldLabel: _('start address'),
                emptyText: _('192.168.1.1'),
                vtype: 'IPAddress',
                allowBlank: false,
                itemId: 'ipRange1',
                name: 'ip_range_start'
            }, 
            {
                xtype: 'textfield',
                fieldLabel: _('stop address'),
                emptyText: _('192.168.1.100'),
                vtype: 'IPAddress',
                allowBlank: false,
                itemId: 'ipRange2',
                name: 'ip_range_end'
            }
            ]
        },
        {
            xtype: 'fieldcontainer',
            layout: 'anchor',
            itemId: 'ipList',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            bind: {
                hidden: '{!ipList.checked}',
            },
            items: [
            {
                xtype: 'textarea',
                fieldLabel: _('ipList'),
                emptyText: '192.168.1.1, 192.168.1.2, 192.168.1.3',
                allowBlank: false,
                itemId: 'ipList',
                name: 'ip_list'
            }
            ]
        },
        {
            xtype: 'tagfield',
            filterPickList: true,
            allowBlank: false,
            fieldLabel: _('device discovery template'),
            name: 'templates',
            bind: {
                store: '{discovery_templates_array}',
            },                
            valueField: 'id',
            displayField: 'name',
            editable : false,
            selectOnFocus: false,   
            emptyText: _('choose one template')
        },
          
        {
            xtype: 'fieldcontainer',
            layout: 'hbox',
            itemId: 'designate',

            defaults: {
                xtype: 'fieldcontainer',
                border: false,
            },
            
            items: [
            {  
                itemId: 'wrapper1',
                layout: 'anchor',
                flex: 1,
                items: [
                {
                    xtype: 'textfield',
                    itemId: 'dest_subnet_id',
                    name: 'dest_subnet_id',
                    value: 0,
                    hidden: true
                },
                {
                    xtype: 'textfield',
                    itemId: 'dest_subnet_name',
                    name: 'dest_subnet_name',
                    value: 'topo',
                    fieldLabel: _('designate subnet'),
                    editable : false,
                    selectOnFocus: false,
                    anchor: '-5'
                }],
            },
            {
                items: [
                {
                    xtype: 'button',
                    text: _('choose'),
                    handler: 'onChooseSubnet'
                }]
            }]
        }]
    }],

    fbar: [
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
