Ext.define('Admin.view.alarms.alarmReverse.AlarmReSet', {
    extend: 'Ext.panel.Panel',
    xtype: 'AlarmReSet',
    width: 500,
    height: 700,
    title: 'TreeList',
    controller: {
        onItemClick:  function( me, record, item, index, e, eOpts ) {
            var comboForpanel = this.lookupReference('comboForTreepanel');
            if(record.data.leaf==true&&record.data.VERSION_SUPPORT=='1'){
                var pattern = record.data.REVERSE_PATTERN;
                comboForpanel.setValue(pattern);
                this.getViewModel().set('reversePattern', pattern);
                var panel = this.lookupReference('treepanel');
                panel.getStore().proxy.extraParams = {NE_NAME: record.data.text,IRCNETNODEID: record.data.IRCNETNODEID,IPADDRESS: record.data.IPADDRESS};
                panel.getStore().reload();
            }        
        },
        onRowcontextmenu: function( me, record, item, index, e, eOpts ) {
            var controller = this;
            var treepanel = this.lookupReference('treepanel');
            var selections = treepanel.getSelection();
            e.preventDefault();  
            e.stopEvent();
            
            if (index < 0) {
                return;
            }
            var stopDisabled = true;
            var startDisabled = true;
            var startAllDisabled = true;
            var stopAllDisabled = true;
            var resetDisabled = true;
            var reversePattern = this.getViewModel().get('reversePattern');
            if(reversePattern>1){
                startAllDisabled = false;
                stopAllDisabled = false;
                resetDisabled = false;
                for(var i in selections){
                    if(selections[i].getDepth()==3){
                        if(selections[i].data.checked==true){
                            stopDisabled = false;
                        }else{
                            startDisabled = false;
                        }
                    }
                
                }
            }
            

            var menu = new Ext.menu.Menu();
            menu.add({
                text: _("Select Item"),
                disabled: startDisabled,
                handler: function(){
                    controller.start();
                }
            }, 
            {
                text: _("Cancel Select"),
                disabled: stopDisabled,
                handler: function(){
                    controller.stop();
                }
            },
            {
                text: _("Select All Items"),
                disabled: startAllDisabled,
                handler: function(){
                    controller.startAll();
                }
            },
            {
                text: _("Cancel All Selected"),
                disabled: stopAllDisabled,
                handler: function(){
                    controller.stopAll();
                }
            },
            {
                text: _("Original Selection"),
                disabled: resetDisabled,
                handler: function(){
                    controller.reset();
                }
            }
            );
            
            menu.showAt(e.getPoint());
        },
        onExpandAllClick: function () {
            this.lookupReference('treelist').expandAll();
        },
        onCollapseAllClick: function () {
            this.lookupReference('treelist').collapseAll();
        },
        onSyn: function () {
            var panel = this.lookupReference('treepanel');
        // var pstore = panel.getStore();
        // var tt = pstore.getModifiedRecords();
        // var qq = panel.getSelection();
            var qqq = panel.getChecked();
        },
        onSelectionChange: function (grid, selection) {
        // var qq = 1;
        // var panel = this.lookupReference('treepanel');
        // var pstore = panel.getStore();
        // var tt = pstore.getModifiedRecords();
        // var qq = panel.getSelection();
        // var qqq = panel.getChecked();
        },
        onCheckchange: function ( node, checked, e, eOpts ){
            if(node.getDepth()==3&&checked){
                node.parentNode.set('checked',true);
                node.parentNode.parentNode.set('checked',true);
            }
            if((!checked)&&node.getDepth()==3){
                this.checkParent(node.parentNode);
                node.parentNode.parentNode.eachChild(function(childNode){
                    if(childNode.data.checked==true){
                        return false;
                    }else if(childNode.isLast()){
                        childNode.parentNode.set('checked',false);
                    }
                });
            }
            if((!checked)&&node.getDepth()==2){
                node.parentNode.eachChild(function(childNode){
                    if(childNode.data.checked==true){
                        return false;
                    }else if(childNode.isLast()){
                        childNode.parentNode.set('checked',false);
                    }
                });
            }
        },
        onRefresh: function() {
            var listStore = this.lookupReference('treelist').getStore();
            listStore.reload();
        },
        onLoad: function(me, records, successful, operation, node, eOpts ) {
            me.beginUpdate();
            if(node!=null){
                this.checkParent(node);
            }
            me.endUpdate();
        },
        checkParent: function(node) {
            var controller = this;
            if(node.isLeaf()){
                if(node.data.checked==true){
                    node.parentNode.set('checked',true);
                    node.parentNode.parentNode.set('checked',true);
                    return false;
                }else if(node.isLast()){
                    node.parentNode.set('checked',false);
                } 
            }else if(node.hasChildNodes()){
                node.eachChild(function(childNode){
                    return controller.checkParent(childNode);
                });
            }
        },
        start: function() {
            var selections = this.lookupReference('treepanel').getSelection();
            for(var i in selections){
                if(selections[i].getDepth()==3){
                    selections[i].set('checked',true);
                    this.onCheckchange(selections[i],true);
                }
            }
        },
        stop: function() {
            var selections = this.lookupReference('treepanel').getSelection();
            for(var i in selections){
                if(selections[i].getDepth()==3){
                    selections[i].set('checked',false);
                    this.onCheckchange(selections[i],false);
                }
            }          
        },
        startAll: function() {
            var panelStore = this.lookupReference('treepanel').getStore();
            var data = panelStore.getData().items;
            for(var i in data){
                data[i].set('checked',true);
            }
        },
        stopAll: function() {
            var panelStore = this.lookupReference('treepanel').getStore();
            var data = panelStore.getData().items;
            for(var i in data){
                data[i].set('checked',false);
            }
        },
        reset: function() {
            var panel = this.lookupReference('treepanel');
            panel.getStore().reload();
        },
        onComboChange: function(me, newValue, oldValue, eOpts) {
            this.getViewModel().set('reversePattern', newValue);
        }
    }, 
    

    iconCls: 'x-fa fa-gears',
    layout: 'border',

    viewModel: {
        stores: {
        navItems: {
            type: 'tree',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'alarm/AlarmReverse/getAlarmRevTree',
                reader: {
                    type: 'json',
                }
            }
        },neRevSet: {
            type: 'tree',
            // autoLoad: true,
            filters: [
                function(data) {
                    return (! (data.get('children')==null&&data.get('CONTAINER')=='CARD'));
                    }
                ],
            proxy: {
                type: 'ajax',
                url: 'alarm/AlarmReverse/getNeRevInfo',
                actionMethods : {  
                    create : 'POST',
                    read   : 'POST',
                    update : 'POST',
                    destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
                    }, 
                reader: {
                    type: 'json',
                    }
            },
            listeners: {
                load: 'onLoad'
            }
        },
        revPatStore: {
            fields : ['value', 'text'],
            data : [['1', _('None Return')],
                    ['2', _('Manual Return')],
                    ['3', _('Auto Return')]]
        }
    },
    data: {
        reversePattern: '0'
    }
    },

    items: [{
        region: 'west',
        width: 250,
        split: true,
        reference: 'treelistContainer',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        border: false,
        scrollable: 'y',
        tbar: {
                reference: 'tbarForTreelist',
                items:[
                
                {
                    text: _('Refresh'),
                    handler: 'onRefresh'
                },{
                    text: '+',
                    handler: 'onExpandAllClick'
                },{
                    text: '-',
                    handler: 'onCollapseAllClick'
                }
            ]
        },
        items: [{
            //xtype: 'treelist',
            xtype: 'treepanel',
            height: 700,
            useArrows: true,
            rootVisible: false,
            reference: 'treelist',
            bind: '{navItems}',
            listeners: {
            itemclick: 'onItemClick',
            }
        }]
    }, {
        region: 'center',
        bodyPadding: 10,
        tbar: {
                reference: 'tbarForTreepanel',
                items:[
                {
                    xtype : "combo",
                    reference: 'comboForTreepanel',
                    fieldLabel :_('NE alarm inverse pattern'),
                    name : 'REVERSE_PATTERN',
                    bind: {
                        store: '{revPatStore}'
                    },
                    displayField : 'text',
                    valueField : 'value',
                    value : '',
                    editable : false,
                    width : 250,
                    labelWidth : 120,
                    labelAlign : "right",
                    margin : 5,
                    listeners: {
                        change: 'onComboChange'
                    }
                },
                '->',
                {
                    text: _('Synchronization'),
                    iconCls:'x-fa fa-exchange',
                    handler: 'onSyn'
                },{
                     text: _('Apply'),
                    iconCls:'x-fa fa-wrench',
                }
            ]
        },
        items:[{
        xtype: 'fieldset',
        title: _('Alarm Reverse Configuration'),
        // defaults: {
        //     anchor: '100%'
        // },
        items: [{
            xtype: 'treepanel',
            rootVisible: false,
            // checkPropagation: 'both',
            checkPropagation: 'down',
            multiSelect: true,
            height: 500,
            anchor: '100%',
            reference: 'treepanel',
            bind: {
                store: '{neRevSet}'
            },
            listeners: {
                selectionchange: 'onSelectionChange',
                rowcontextmenu: 'onRowcontextmenu',
                checkchange: 'onCheckchange'
            }
        }]
    }]
    }]
});
