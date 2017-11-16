Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSynTaskGroup', {
    extend: 'Ext.window.Window',
    xtype:'AlarmSynTaskGroup',
    modal:true,
    title: '任务分组',
    height: 500,
    width: 800,
    startPanel:'',
    action: 'add',
    oldGroupname: '',
    layout: 'border',
    cls: 'shadow',
    liveDrag: true,

    controller: {
        onSelect:function(){
           var grid = this.lookupReference('taskGroupGrid');
            if(this.getView().startPanel=='form'){
                record = grid.getSelectionModel().getSelection()[0];
                if(null!=(record)){
                    var name = record.get('group_name');
                    var id = record.get('syn_task_group_id');
                    var platForm = this.getView().initialConfig.AlarmSynTaskForm;
                    var group_name =platForm.lookup('group_textfield');
                    var group_id =platForm.lookup('groupid_textfield');
                    group_name.setValue(name);
                    group_id.setValue(id);
                    grid.up('window').close();
                }else{
                    Ext.MessageBox.alert(_('操作失误!'), '请选择任务分组');
                }
           }else if(this.getView().startPanel=='tree'){
                grid.up('window').close();
           }
        },
        onRowcontextmenu: function( me, record, item, index, e, eOpts ) {
            var controller = this;
            var taskGrid = this.lookupReference('taskGroupGrid');
            var selections = taskGrid.getSelection();
            e.preventDefault();  
            e.stopEvent();
            
            if (index < 0) {
                return;
            }

            var menu = new Ext.menu.Menu();
            menu.add({
                text: _("Add"),
                handler: function(){
                    controller.onAdd();
                }
            }, 
            {
                text: _("edit-modify"),
                itemId: 'editItem',
                handler: function(){
                    controller.onEdit(record,true);
                }
            },
            {
                text: _("Delete"),
                handler: function(){
                    controller.onDelete(record,true);
                }
            });
            if(selections.length>1){
                record = selections;
                menu.remove('editItem');
            }
            menu.showAt(e.getPoint());
        },
        onAdd: function() {
            var form = this.lookupReference('taskGroupForm');
            this.getView().action = 'add';
            this.getView().oldGroupname = '';
            form.setHidden(false);
        },
        onRefresh: function() {
            this.lookupReference('taskGroupGrid').getStore().reload();
            var tree;
            if(this.getView().startPanel=='form'){
                tree = this.getView().initialConfig.AlarmSynTaskForm.up('AlarmSyncTaskMainView').down('AlarmSynTaskTree').down('treepanel');
                tree.getStore().reload();
            }else if(this.getView().startPanel=='tree'){
                tree = this.getView().initialConfig.AlarmSynTaskTree.down('treepanel');
                tree.getStore().reload();
            }
            this.lookupReference('taskGroupForm').setHidden(true);        
        },
       
        onReset: function() {
            this.lookupReference('taskGroupForm').getForm().reset();
        },
        onCancel: function() {
            this.lookupReference('taskGroupForm').setHidden(true);
        },
        onEdit: function() {
            var grid = this.lookupReference('taskGroupGrid');
            var form = this.lookupReference('taskGroupForm');
            var record = grid.getSelection()[0];
            this.getView().action = 'edit';
            this.getView().oldGroupname = record.get('group_name');
            form.getForm().loadRecord(record);
            form.setHidden(false);
        },
        onSubmit: function() {
            var grid = this.lookupReference('taskGroupGrid');
            var groupnames = grid.getStore().collect('group_name');
            var form = this.lookupReference('taskGroupForm');
            var newGroupname = form.getValues(false).group_name;
            var oldGroupname = this.getView().oldGroupname;
            var action = this.getView().action;
            var match = false;
            Ext.Array.each(groupnames, function(element) {
                if(element==newGroupname){
                    if(newGroupname!=oldGroupname){
                        match = true;
                        return false;
                    }
                }
            });
            var controller = this;
            if (form.getForm().isValid()&&(!match)) {
                if(action=='add'){
                    form.getForm().submit({
                        url: '/alarm/AlarmSynMgt/addSynTaskGroup',
                        waitTitle : _('Please wait...'), 
                        waitMsg : _('Please wait...'),  
                        success: function(form, action) {
                            Ext.Msg.alert(_('Success'), action.result.msg);
                            controller.onRefresh();
                        },
                        failure: function(form, action) {
                            Ext.MessageBox.alert(_('操作失败!'), action.result.msg);
                        }
                    });
                }else if(action=='edit'){
                    form.getForm().submit({
                        url: '/alarm/AlarmSynMgt/editSynTaskGroup',
                        waitTitle : _('Please wait...'), 
                        waitMsg : _('Please wait...'),  
                        success: function(form, action) {
                            Ext.Msg.alert(_('Success'), action.result.msg);
                            controller.onRefresh();
                        },
                        failure: function(form, action) {
                            Ext.MessageBox.alert(_('操作失败!'), action.result.msg);
                        }
                    });
                }            
            }else {
                if(match){
                    Ext.MessageBox.alert(_('输入错误!'), '分组名称重复！');
                }else{
                    Ext.MessageBox.alert(_('输入错误!'), '请检查输入错误！');
                }
            }
        },
        onDelete: function() {
            var grid = this.lookupReference('taskGroupGrid');
            var records = grid.getSelectionModel().getSelection();
            var names = [], group_ids=[];
            var controller = this;
            for (var i in records) {
                if(records[i].get('syn_task_group_id')=='1'){
                    Ext.Msg.alert(_('Tips'), '不能删除默认组！');
                    return;
                }
                console.log('delete... ', records[i].get('group_name'));
                names.push(records[i].get('group_name'));
                group_ids.push(records[i].get('syn_task_group_id'));
            }
            Ext.MessageBox.confirm(_('Confirmation'), "您选择的分组：<br />" + names.join('<br />') + "<br />将被彻底删除，是否继续？",
                function(btn) {
                    if (btn=='yes') {
                         Ext.Ajax.request({
                            method:'post',
                            url:"/alarm/AlarmSynMgt/deleteSynTaskGroup",
                            params:{'syn_task_group_id': group_ids},
                            success:function(response){
                                if(response.responseText){
                                    controller.onRefresh();
                                    Ext.Msg.alert(_('Success'), "删除成功！");
                                    console.log(response.responseText);
                                }else{
                                    Ext.Msg.alert(_('Success'), "删除失败！");
                                }
                            },
                            failure: function(response) {
                                Ext.Msg.alert(_('Tips'), '删除失败！');
                            }
                        }); 
                    } 
                }
            );
        },
        onSelectionchange:function( me , records , eOpts ){
            if(records.length>0){
                var form = this.lookupReference('taskGroupForm');
                form.getForm().loadRecord(records[0]);
            }
            var editButton = this.lookupReference('editButton');
            if(records.length!=1){
                editButton.setDisabled(true);
            }else{
                editButton.setDisabled(false);
            }
        }
    },

    items:[
    {
        xtype: 'PagedGrid',
        region: 'center',
        bodyPadding: 10,
        margin: '0 0 0 5',
        autoScroll : true,
        multiSelect: true,
        reference: 'taskGroupGrid',
        store: {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'alarm/AlarmSynMgt/getSynTaskGroup',
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty : 'resultSize'
                },
                actionMethods : {  
                    create : 'POST',
                    read   : 'POST',
                    update : 'POST',
                    destroy: 'POST' 
                }  
            }
        },
        columns: [
            { text: 'ID',  dataIndex: 'syn_task_group_id', width: 80 },
            { text: '分组名称', dataIndex: 'group_name', width: 200 },
            { text: '备注', dataIndex: 'remark', flex:1 }
        ], 
        pagingbarDefaultValue: 15,
           // dock: 'bottom',
            pagingbarConfig: {
                fields: [{name: 'val', type: 'int'}],
                data: [
                    {val: 15},
                    {val: 20},
                    {val: 30},
                    {val: 50},
                    {val: 100}
                ]
            },
        listeners:{
            selectionchange :'onSelectionchange' ,
            rowcontextmenu: 'onRowcontextmenu'
           
        }
    },
    {
        xtype: 'form',
        bodyPadding: 10,
        reference: 'taskGroupForm',
        region: 'west',
        hidden:true,
       
        split: true,
        width: 280,
        items: [
        {
            xtype: 'fieldset',
            title:'分组信息',
            margin: 10,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },

            items: [
            {
                xtype: 'hidden',
                name: 'syn_task_group_id'
            },
            {
                fieldLabel: '分组名称',
                emptyText: '分组名称',
                allowBlank: false,
                name: 'group_name'
            }, 
            {
                fieldLabel: '备注',
                emptyText: '备注',
                name: 'remark'
            }
            // ,
            // {
            //     xtype:'hidden',
            //     name:'task_type',
            //     value:1
            // }
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

    },
    {

        region: 'north',
        border:'true',
        tbar:[      
        {
            tooltip: _('Add'),
            iconCls:'x-fa fa-plus',
            handler:'onAdd',
        },
        {
            tooltip: _('Edit Properties'),
            reference: 'editButton',
            // itemId: 'topo_node_edit_properties',
            iconCls: 'x-fa fa-edit',
            handler: 'onEdit',
        },
        
        {
            tooltip: _('Delete'),
            // itemId: 'topo_node_delete',
            iconCls: 'x-fa fa-trash',
            handler: 'onDelete',
            bind: {
                disabled: '{!taskGroupGrid.selection}'
            }
        },
                        
        {
            text:_('Refresh'),
            tooltip:_('Refresh'),
            iconCls:'x-fa fa-refresh',
            handler: 'onRefresh',
        }
    ],
    }
    ],

    buttons: [
        {
            text: _('Cancel'),
            iconCls:'x-fa fa-close',
            handler: function() {
                this.up('window').close();
        },
        },
        {
            text: _('确定'),
            iconCls:'x-fa fa-save',
            handler: 'onSelect',
    }],
    listeners: {
       // itemdblclick: 'onItemDoubleClick'
       // activate: 'onActive',
    }
 
   
});