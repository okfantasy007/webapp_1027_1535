Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSyncStatus', {
    extend: 'Ext.container.Container',
    xtype: 'AlarmSyncStatus',
    // height: 500,
    // width: 250,
    requires: [
        'Admin.view.base.PagedGrid',
        'Admin.view.alarms.queryBookMark.BookMarkButton'
    ],

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/AlarmSynMgt/getAlarmSynStatus',
					          extraParams: {condition: '15'},
					          actionMethods : {  
					              create : 'POST',
					              read   : 'POST',
					              update : 'POST',
					              destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
					          },  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'resultSize'
                    }
                }

            },
            comboStore1: {
                fields : ['value', 'text'],
                data : [
                ['=', '='],
                ['<>', '<>'],
                ['LIKE', 'LIKE'],
                ['IS NULL', '为空'],
                ['IS NOT NULL', '不为空']
                ]
            },
          	comboStore2: {
                fields : ['value', 'text'],
                data : [
                ['=', '='],
                ['<>', '<>'],
                ['IS NULL', '为空'],
                ['IS NOT NULL', '不为空']
                ]
            },
            comboStore3: {
                fields : ['value', 'text'],
                data : [
                ['=', '='],
                ['>', '>'],
                ['<', '<'],
                ['>=', '>='],
                ['<=', '<='],
                ['<>', '<>'],
                ['BETWEEN', 'BETWEEN']
                ]
            },
            comboStore4: {
                fields : ['value', 'text'],
                data : [
                ['1', _('未同步')],
                ['2', _('同步中')],
                ['3', _('同步完成')],
                ['4', _('失败')]
                ]
            },
            comboStore5: {
                fields : ['value', 'text'],
                data : [
                ['0', _('用户操作')],
                ['1', _('周期同步任务')],
                ['2', _('管理通道周期恢复')],
                ['3', _('新增网元同步')],
                ['4', _('服务器启动后同步')]
                ]
            }
        }
    },

    controller: {  
        onAfterrender: function(){
            var controller = this;
            var grid = this.lookupReference('pagedGrid');
            document.oncontextmenu = function (event) {
                if(window.location.hash.split('/').length>1&&window.location.hash.split('/')[1]=='sync-status'&&grid.getPosition()[0]<event.clientX&&grid.getPosition()[1]<event.clientY){
                    event.preventDefault();
                    controller.onItemRightClick(event);
                }
            }
        },
        onItemRightClick: function(e) {
            var controller = this;
            var mainMenu = Ext.create('Ext.menu.Menu', {
                items: [
                {
                    // name: 'add',
                    iconCls: 'x-fa fa-search', //图标文件
                    text: _('Query'),
                    handler: function() {
                        controller.onQuery();
                    }
                },
                {
                    // name: 'edit',
                    iconCls: 'x-fa fa-refresh',
                    text: _('Refresh'),
                    handler: function() {
                        controller.onRefresh();
                    }
                }
                ]
            });
            mainMenu.showAt([e.clientX,e.clientY]);
        },
        onBeginTimeCombo: function( me, newValue, oldValue, eOpts ) {
            var beginTimeField = this.lookupReference('beginTimeField');
            var beginTimeContainer = this.lookupReference('beginTimeContainer');
            if(newValue=='BETWEEN'){
                beginTimeContainer.setHidden(false);
                beginTimeField.setHidden(true);
            }else{
                beginTimeContainer.setHidden(true);
                beginTimeField.setHidden(false);
            }
        },
        onEndTimeCombo: function( me, newValue, oldValue, eOpts ) {
            var endTimeField = this.lookupReference('endTimeField');
            var endTimeContainer = this.lookupReference('endTimeContainer');
            if(newValue=='BETWEEN'){
                endTimeContainer.setHidden(false);
                endTimeField.setHidden(true);
            }else{
                endTimeContainer.setHidden(true);
                endTimeField.setHidden(false);
            }
        },
        onBeginTimeMinSelected: function(field, value, eOpts) {
        	var beginTimeMax = this.lookupReference('beginTimeMax');
        	beginTimeMax.setMinValue(value);
        },
        onBeginTimeMaxSelected: function(field, value, eOpts) {
        	var beginTimeMin = this.lookupReference('beginTimeMin');
        	beginTimeMin.setMaxValue(value);
        },
        onEndTimeMinSelected: function(field, value, eOpts) {
            var endTimeMax = this.lookupReference('endTimeMax');
            endTimeMax.setMinValue(value);
        },
        onEndTimeMaxSelected: function(field, value, eOpts) {
            var endTimeMin = this.lookupReference('endTimeMin');
            endTimeMin.setMaxValue(value);
        },
        onReset: function() {
            this.lookupReference('QueryForm').getForm().reset();
            // var beginTimeField = this.lookupReference('beginTimeField');
            // var beginTimeContainer = this.lookupReference('beginTimeContainer');
            // beginTimeField.setHidden(false);
            // beginTimeContainer.setHidden(true);
            // var endTimeField = this.lookupReference('endTimeField');
            // var endTimeContainer = this.lookupReference('endTimeContainer');
            // endTimeField.setHidden(false);
            // endTimeContainer.setHidden(true);
            this.lookupReference('beginTimeMin').setMaxValue(null);
            this.lookupReference('beginTimeMax').setMinValue(null);
            this.lookupReference('endTimeMin').setMaxValue(null);
            this.lookupReference('endTimeMax').setMinValue(null);
        },
        onQuery: function(){
            var grid = this.lookupReference('pagedGrid');   
            var form =this.lookupReference('QueryForm');
            grid.getStore().proxy.extraParams = form.getForm().getValues();
            grid.getStore().proxy.url='/alarm/AlarmSynMgt/queryAlarmSynStatus';
            grid.getStore().reload();   
        },
        isShow:function(obj,ischecked){
            if(ischecked){
            this.lookupReference('QueryForm').setVisible(true); 
            }else{
            this.lookupReference('QueryForm').setVisible(false);
            }
        },
        onRefresh: function() {
            var grid = this.lookupReference('pagedGrid');
            grid.getStore().reload();
        }
    },

    items: [
	{ 
        title:_('Query'),
        xtype: 'form',
        reference: 'QueryForm',
        region:'north',
        iconCls: 'x-fa fa-circle-o',
        //border : false,
        autoWidth : true,
        //autoHeight : true,
        height : 210,
        frame : false,
        autoScroll : true,
        bodyPadding :'20 0 20 0',
        layout:{type:'table',columns:3},
        //visible:false,
        // labelAlign : 'right',
        defaultType : 'container',
        fieldDefaults : {
            labelAlign : "right",
            margin : 5,
        },
        items : [
        {          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('Ne Name'),
                columnWidth : .5,
                name : 'userlabelSymbol',
                bind: {
                    store: '{comboStore1}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            },{
                xtype : 'textfield',
                // reference: 'RecordTime1',
                columnWidth : .5,
                name : 'userlabel'
            }
            ]
        },{
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('Trigger Mode'),
                columnWidth : .5,
                name : 'last_alarm_sync_triggermodeSymbol',
                bind: {
                    store: '{comboStore2}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }, {
                xtype : "combo",
                bind: {
                    store: '{comboStore5}'
                },
                columnWidth : .5,
                name : 'last_alarm_sync_triggermode',
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }
            ]
        },{
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('Alarm Sync Status'),
                columnWidth : .5,
                name : 'last_alarm_sync_statusSymbol',
                bind: {
                    store: '{comboStore2}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }, {
                xtype : "combo",
                bind: {
                    store: '{comboStore4}'
                },
                columnWidth : .5,
                name : 'last_alarm_sync_status',
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }
            ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
	        {
                xtype : "combo",
                fieldLabel : _('Last Alarm Sync Begin Time'),
                width : 220,
                rowspan: 2,
                name : 'last_alarm_sync_begin_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onBeginTimeCombo'
                }
            }, {
                xtype : 'datetimefield',
                rowspan: 2,
                reference: 'beginTimeField',
                width : 230,
                editable : false,
                name : 'last_alarm_sync_begin_time',
            }, {
                xtype : 'container',
                reference : 'beginTimeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'datetimefield',
                    width : 230,
                    reference: 'beginTimeMin',
                    fieldLabel : _('Minimum'),
                    labelWidth: 50,
                    editable : false,
                    name : 'last_alarm_sync_begin_time_min',
                    listeners: {
                        select: 'onBeginTimeMinSelected'
                    }
                }, {
                    xtype : 'datetimefield',
                    width : 230,
                    reference: 'beginTimeMax',
                    editable : false,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'last_alarm_sync_begin_time_max',
                    listeners: {
                        select: 'onBeginTimeMaxSelected'
                    }
                }
                ]
            }
	        ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
	        {
                xtype : "combo",
                fieldLabel : _('Last Alarm Sync End Time'),
                width : 220,
                rowspan: 2,
                name : 'last_alarm_sync_end_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onEndTimeCombo'
                }
            }, {
                xtype : 'datetimefield',
                reference: 'endTimeField',
                rowspan: 2,
                width : 230,
                editable : false,
                name : 'last_alarm_sync_end_time',
            }, {
                xtype : 'container',
                reference : 'endTimeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'datetimefield',
                    reference: 'endTimeMin',
                    fieldLabel : _('Minimum'),
                    width : 230,
                    labelWidth: 50,
                    editable : false,
                    name : 'last_alarm_sync_end_time_min',
                    listeners: {
                        select: 'onEndTimeMinSelected'
                    }
                }, {
                    xtype : 'datetimefield',
                    reference: 'endTimeMax',
                    editable : false,
                    width : 230,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'last_alarm_sync_end_time_max',
                    listeners: {
                        select: 'onEndTimeMaxSelected'
                    }
                }
                ]
            }
	        ]
        },{            
            xtype: 'radiogroup',
            fieldLabel: _('Operator'),
            name : 'queryAssociation',
            items: [
                {boxLabel: _('AND'), inputValue: 1, checked: true},
                {boxLabel: _('OR'), inputValue: 2},
            ]
        }]
  
    },
	{
        // title: '网元反转模式',
        header: false,
        xtype: 'PagedGrid',
        iconCls: 'x-fa fa-circle-o',
        reference: 'pagedGrid',
        // width: 860,
        autoWidth : true,
        autoHeight : true,
        columnLines : true,
        rowLines : true,
        // bodyPadding :50,
        // autoScroll : true,
        multiSelect: true,
        scrollable: true,
        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}'
        },
        // grid显示字段
        columns: [
                {   xtype: 'rownumberer', width: 60, sortable: true, align: 'center' },
                {
                    text : '网元ID',
                    dataIndex : 'neid',
                    width : 140,
                    align: 'center',
                    menuDisabled : false
                },{
                    text : '网元名称',
                    dataIndex : 'userlabel',
                    width : 140,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : '触发方式',
                    dataIndex : 'last_alarm_sync_triggermode',
                    width : 140,
                    align: 'center',
                    menuDisabled : true,
                    renderer: function getRevPatName(v,m,r){
                        if (v === '0') {
                            return  _('用户操作');
                        }
                        if (v == 1) {
                            return  _('周期同步任务');
                        }
                        if (v == 2) {
                            return  _('管理通道周期恢复');
                        }
                        if (v == 3) {
                            return  _('新增网元同步');
                        }
                        if (v == 4) {
                            return  _('服务器启动后同步');
                        }
                        return v;
                    }
                },{
                    text : '告警同步状态',
                    dataIndex : 'last_alarm_sync_status',
                    width : 140,
                    align: 'center',
                    menuDisabled : true,
                    renderer: function getRevPatName(v,m,r){
                        if (v == 1) {
                            return  '未同步';
                        }
                        if (v == 2) {
                            return  '同步中';
                        }
                        if (v == 3) {
                            return  '同步完成';
                        }
                        if (v == 4) {
                            return  '失败';
                        }
                        return v;
                    },
                },{
                    text : '同步开始时间',
                    dataIndex : 'last_alarm_sync_begin_time',
                    width : 140,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : '同步结束时间',
                    dataIndex : 'last_alarm_sync_end_time',
                    width : 140,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : '备注',
                    dataIndex : 'last_alarm_sync_remark',
                    flex : 1,
                    align: 'center',
                    menuDisabled : true
                }
        ],
        // 分页工具条位置
        //pagingbarDock: 'bottom',
        pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 15,
        // 分页策略
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

      // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {  
                    xtype:'checkbox',
                    boxLabel:_('Show Query'),  
                    tooltip:_('Show Query'), 
                    checked: true,
                    handler:'isShow'
                },{
                    text: '查询',
                    iconCls:'x-fa fa-search',
                    handler: 'onQuery'
                },{
                    text: '重置',
                    iconCls:'x-fa fa-edit',
                    handler: 'onReset',       
                },{
                    xtype:'BookMarkButton',
                    iconCls:'x-fa fa-edit',
                    containerType: 'AlarmSyncStatus',
                    formReference: 'QueryForm',
                    module:'AlarmSyncStatus',
                    defaultName: '告警同步状态--查询'
                }
                /*
                ,'|',
                '->',{  
                    text: '添加',
                    iconCls:'x-fa  fa-plus-square',
                    handler: 'onAdd',
                },{
                    text: '编辑',
                    reference:'editButton',
                    iconCls:'x-fa fa-edit',
                    handler: 'onEdit',
                    disabled: true
                },{
                    text: '删除',
                    reference:'removeButton',
                    iconCls:'x-fa fa-remove',
                    handler: 'onRemove',
                    disabled: true
                },{
                    text: '属性',
                    reference:'propertyButton',
                    iconCls:'x-fa fa-file-text-o',
                    handler: 'showProperty',
                    disabled: true
                }
                */
            ]
        }],

        listeners: {
            afterrender: 'onAfterrender'
            // selectionchange: 'onSelectionchange',
            // rowcontextmenu: 'onItemRightClick'
        }

    }
]

});



    
    
    
     
    
    
     
