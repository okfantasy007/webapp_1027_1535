
Ext.define('Admin.view.topology.main.topoAddPopWindow', {
    extend: 'Ext.window.Window',
    xtype: 'topoAddPopWindow',

    reference: 'topoAddPopWindow',

    title: 'add',
    width: 800,
    height: 600,
    layout: 'fit',
    resizable: true,
    modal: true,
    defaultFocus: 'firstName',
    closeAction: 'hide',

    items: [
    {
        xtype: 'panel',
        border : false,
        layout : 'border',
        items : [
        {
            xtype: 'nodeTypeTreeView',
            region: 'west',
            width: 350, 
            split: true,
        },
        {
            xtype: 'form',
            region: 'center',

            labelWidth: 50, 
            items: [{
                xtype:'fieldset',
                title: _('Basic Properties'),
                // collapsible: true,
                margin: 10,
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%'
                },

                items :[{
                    fieldLabel: '*' + _('Node Name'),
                    name: 'nodename',
                    allowBlank : false,
                    value: ''
                }, {
                    fieldLabel: '&nbsp;&nbsp;' + _('Remark'),
                    name: 'remark',
                    value: ''
                }, {
                    fieldLabel: '*' + _('Node Type'),
                    name: 'text',
                    value: '',
                    editable : false,
                    allowBlank : false
                }, {
                    xtype: 'hidden',
                    name: 'topo_type_id',
                    value: ''
                }, {
                    xtype: 'hidden',
                    name: 'map_parent_id',
                    // value: parentid
                }, {
                    xtype: 'hidden',
                    name: 'tree_parent_id',
                    // value: parentid
                }, {
                    xtype: 'hidden',
                    name: 'map_hierarchy',
                    // value: hierarchy
                }, {
                    xtype: 'hidden',
                    name: 'x',
                    // value: x
                }, {
                    xtype: 'hidden',
                    name: 'y',
                    // value: y
                }, {
                    xtype: 'hidden',
                    name: 'restypename',
                    // value: restypename
                }, {
                    xtype: 'hidden',
                    name: 'symbol_style',
                    // value: symbolstyle
                }]
            }] //form

        }],

        buttons: [{
            text: 'Cancel',
            handler: 'onFormCancel'
        }, {
            text: 'Send',
            handler: 'onFormSubmit'
        }]

    }]
});