Ext.define('Admin.view.alarms.AlarmReparExp.addForm', {
    extend: 'Ext.container.Container',
    xtype:'addForm',
    controller: { 
                onAdd: function(){
                    var alarmReparExp = this.getView().initialConfig.AlarmReparExp;
                    var historyAlarmView = Ext.create("Admin.view.alarms.alarmhistory.historyAlarmView");                    
                    var treepanel = historyAlarmView.down('treepanel');
                    var historyAlarmDockedItems = historyAlarmView.down('historyAlarmDockedItems');
                    var controller = historyAlarmView.getController();
                    // controller.onAlarmTreeLoad = function(me,re,ope){
                    //     var alarmview = alarmReparExp.up('alarmsView');
                    //     var sec_filter = alarmview.getViewModel().get('historyalarm_sec_filter');
                    //     me.proxy.extraParams.secFilter = sec_filter;
                    // };
                    // controller.onPagingTreeLoad = function(me,re,ope){
                    //     var alarmview = alarmReparExp.up('alarmsView');
                    //     var sec_filter = alarmview.getViewModel().get('historyalarm_sec_filter');
                    //     me.proxy.extraParams.secFilter = sec_filter;
                    // };
                    // controller.onQuery = function(){
                    //     var alarmview = alarmReparExp.up('alarmsView');
                    //     var sec_filter = alarmview.getViewModel().get('historyalarm_sec_filter');
                    //     var treepanel = controller.lookupReference('historyAlarmTree'); 
                    //     var alarmCheckForm = controller.lookupReference('alarmCheckForm');
                    //     var pagingToolBar = controller.lookupReference('pagingToolBar');
                    //     pagingToolBar.alarm_page_isqurey=1;
                    //     pagingToolBar.alarm_page_start=0;
                    //     var combobox = pagingToolBar.down('combobox');
                    //     pagingToolBar.alarm_page_limit=combobox.value;
                    //     treepanel.getStore().proxy.url='alarm/historyAlarm/getMainAlarmByParam?limit=' + pagingToolBar.alarm_page_limit + '&start=' + pagingToolBar.alarm_page_start;
                    //     treepanel.getStore().proxy.extraParams=alarmCheckForm.getForm().getValues();

                    //     pagingToolBar.getStore().proxy.extraParams = alarmCheckForm.getForm().getValues();
                    //     pagingToolBar.getStore().proxy.url = 'alarm/historyAlarm/getHistoryAlarmCount';
                    //     pagingToolBar.getStore().reload();
                    // };
                    for(var i=0; i<7; i++){
                        var item = historyAlarmDockedItems.items.items[i];
                        item.setHidden(true);
                    }
                    
                    treepanel.un({
                        itemcontextmenu: 'onItemRightClick'
                    });
                    treepanel.on({
                        itemcontextmenu: {fn:function( self, record, item, index, e, eOpts ){
                            var items = treepanel.getStore().getData().items;
                            e.preventDefault();  
                            e.stopEvent();
                            if (index < 0) {
                                return;
                            }
                            var menu = new Ext.menu.Menu();
                            menu.add(
                            // {
                            //     text: _("Select"),
                            //     handler: function() {
                            //         record.set('checked',true);
                            //     }
                            // }, 
                            {
                                text: _("Select All"),
                                handler: function() {
                                    treepanel.setSelection(items);
                                    // for(var i in items){
                                    //     items[i].set('checked',true);
                                    //     if(items[i].hasChildNodes()){
                                    //         items[i].eachChild(function(node){
                                    //             node.set('checked',true);
                                    //         });
                                    //     }
                                    // }
                                }
                            },
                            {
                                text: _("Deselect"),
                                handler: function() {
                                    treepanel.setSelection(null);
                                    // for(var i in items){
                                    //     items[i].set('checked',false);
                                    //     if(items[i].hasChildNodes()){
                                    //         items[i].eachChild(function(node){
                                    //             node.set('checked',false);
                                    //         });
                                    //     }
                                    // }
                                }
                            });
                            menu.showAt(e.getPoint());
                        }}
                    });
                    
                    var historyAlarmWin = this.createPopWindow(historyAlarmView);
                    historyAlarmWin.show();
                },
                createPopWindow: function(popItem) {
                    var grid = this.lookupReference('symptomGrid');
                    var container = this.getView();
            var popWindow = Ext.create("Ext.window.Window", {
                title: _('Add'),
                closable: true,
                autowidth: true,
                autoheight: true,
                scrollable: true,
                border: false,
                layout: 'auto',
                bodyStyle: "padding:20px;",
                items: popItem,
                closeAction: 'hide',
                width: 900,
                height: 600,
                modal:true,
                maximizable: true,
                minimizable: true,
                buttons: [{
                    xtype: "button",
                    text: _('Confirm'),
                    handler: function() {
                        var treepanel = popItem.down('treepanel');
                        // var selection = treepanel.getChecked();
                        var selection = treepanel.getSelection();
                        var gridStore = grid.getStore();
                        var IDs = gridStore.collect('iRCAlarmLogID');
                        for(var i in selection){
                            if(!Ext.Array.contains(IDs,selection[i].get('iRCAlarmLogID'))){
                                gridStore.add(selection[i]);
                            }
                        }
                        popWindow.close();
                    }
                },
                {
                    xtype: "button",
                    text: _('Cancle'),
                    handler: function() {
                        popWindow.close();
                    }
                }]
            });
         
            return popWindow;
        },
                onDelete: function(){
                    var container = this.getView();
                    var grid = this.lookupReference('symptomGrid');
                    var selection = grid.getSelection();
                    var gridStore = grid.getStore();
                    var gridStoreData = gridStore.getData();
                    gridStoreData.remove(selection);
                },
                onItemclick: function ( me, record, item, index, e, eOpts ) {
                    this.lookupReference('deleteButton').setDisabled(false);
                },
                getmainMenu: function() {
            var controller = this;
            var mainMenu = Ext.create('Ext.menu.Menu', {
                //reference: "alarmMainMenu",
                items: [
                {
                    name: 'add',
                    //  icon: 'images/write.gif', //图标文件
                    text: _('Add'),
                    handler: function() {
                        controller.onAdd();
                    }
                },
                {
                    name: 'delete',
                    // icon: 'images/write2.gif', //图标文件
                    handler: function() {
                        controller.onDelete();
                    },
                    text: _('Delete')
                }
                        ]                
                    });
            return mainMenu;

        },
        onItemRightClick: function(me, record, tr, index, e, eOpts ) {
            e.preventDefault();
            e.stopEvent();
            var mainMenu = this.getmainMenu();
            mainMenu.showAt(e.getXY());  
        },
        validatefield: function(me, isValid, eOpts){
            if(!me.validate()){
                Ext.Msg.alert(_('Error Message'), me.getFieldLabel() + _('Can not be empty!') );
            }
        }
    }, 
    items: [
        { 
                xtype: 'form',
                title: _('Basic Info'),
                width : 750,
                height: 200,
                header: true,
                border: true,
                collapsible: true,
                layout: {
                    type: 'table',
                    columns: 2
                },
                fieldDefaults : {
                    width : 250,
                    labelWidth : 90,
                    labelAlign : "right",
                    margin: 10
                },
                items: [

                {
                    xtype: 'textfield',
                    fieldLabel: _('Noter'),
                    name: 'recorder',
                    value: APP.user,
                    readOnly: true,

                },
                {
                    xtype: 'textfield',
                    fieldLabel:  _('Recording Time'),
                    name: 'record_time',
                    reference:'timeTextfield',
                    value: Ext.Date.format(new Date(), 'Y-m-d H:i:s'),
                    readOnly: true,

                },

                {
                    xtype: 'textarea',
                    fieldLabel: _('Fault Description'),
                    name: 'reason',
                    readOnly: false,
                    allowBlank: false,
                    listeners: {
                        validitychange: 'validatefield',
                    }

                },
                {
                    xtype: 'textarea',
                    fieldLabel: _('Fault Solution'),
                    name: 'resolve_result',
                    readOnly: false,
                    allowBlank: false,
                    listeners: {
                        validitychange: 'validatefield',
                    }

                }
                ]
        },
        {
            title: _('History Alarms Related to the Fault'),
            header: true,
            xtype: 'gridpanel',
            reference:'symptomGrid',
            //iconCls: 'x-fa fa-circle-o',
            width: 750,
            height: 250,
            border: true,
            autoScroll : true,
            store: {},
            tbar: {
                //reference: 'tbarForTreepanel',
                items:[
                {
                    text: _('Add'),
                    iconCls:'x-fa fa-plus-square',
                    handler: 'onAdd'
                },{
                    text: _('Delete'),
                    iconCls:'x-fa fa-remove',
                    reference:'deleteButton',
                    iconCls:'x-fa fa-remove',
                    handler: 'onDelete',
                    disabled: true
                }
                ]
            },
            columns: [
                {   xtype: 'rownumberer', width: 60, sortable: true, align: 'center' },
                {
                    text : _('Alarm Name'),
                    dataIndex : 'strName',
                    width : 120,
                    align: 'center',
                    menuDisabled : false
                },{
                    text : _('Alarm Source'),
                    dataIndex : 'strDeviceName',
                    width : 120,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Specific Location'),
                    dataIndex : 'strLocation',
                    width : 100,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Generate Time'),
                    dataIndex : 'strUptime',
                    width : 160,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Device Type'),
                    dataIndex : 'iRCNETypeID',
                    width : 120,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Alarm ID'),
                    dataIndex : 'iRCAlarmLogID',
                    width : 120,
                    align: 'center',
                    menuDisabled : true
                }],
            listeners: {
                itemclick: 'onItemclick',
                rowcontextmenu: 'onItemRightClick'
            }
        }
            ]
    });
