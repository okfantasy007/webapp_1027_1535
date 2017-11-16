/***
*分组监控中，添加编辑规则中的添加网元、机箱等资产信息的部分
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperAddResources', {
    extend: 'Ext.grid.Panel',
    xtype: 'amRuleOperAddResources',
    emptyText : _('Empty'),
    border:true,
    width : 250,
    height: 250,
    initComponent:function(){
        this.callParent();
        this.contentsid = new Array();
        this.contentsinfo = new Array();
    },
    requires:[
        'Ext.window.Window',
        'Admin.view.inventory.inventoryNeView',
        'Admin.view.inventory.inventoryChassisView',
        'Admin.view.inventory.inventoryCardView',
        'Admin.view.inventory.inventoryNeTypeView',
        'Admin.view.alarms.alarmtype.alarmTypeView'
    ],
    controller:{
        createInfoWin:function(view,title){
            var me = this.getView();
            var meindex = me.tabIndex;
            var mename = me.title;
            var parenttabindex = me.up().tabIndex;
            if(parenttabindex==null || parenttabindex=='' || meindex==null || meindex==''){
                return;
            }
            var amRuleOperView = me.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;

            var InfoWin = Ext.create("Ext.window.Window", {
                title:title,
                closable: true,
                scrollable: true,
                border: false,
                layout: 'auto',
                bodyStyle: "padding:20px;",
                items: view,
                closeAction: 'hide',
                width: 700,
                height: 400,
                maximizable: true,
                minimizable: true,
                buttons: [{
                    xtype: "button",
                    text: _('OK'),
                    handler: function() {
                        var pagedgrid = view.down('PagedGrid');
                        if (pagedgrid.getSelectionModel().hasSelection()) {
                            var records = pagedgrid.getSelectionModel().getSelection();
                            Ext.Array.forEach(records,function(str,index,array){
                                var strid = "";
                                var strname="";
                                if(meindex==22){//网元
                                    strid = str.get('neid');
                                    strname = str.get('hostname');
                                }else if(meindex==23){//机箱
                                    strid = str.get('chassis_id');
                                    strname = str.get('neid')+'@'+str.get('chassis_name');
                                }else if(meindex==24){//card
                                    strid = str.get('card_id');
                                    strname = str.get('neid')+'@'+str.get('chassis_id')+'@'+str.get('card_name');
                                }else if(meindex==6){//告警类型
                                    strid = str.get('id');
                                    strname = str.get('alarmName');
                                }else if(meindex==26){//设备类型
                                    strid = str.get('netypename');
                                    strname = str.get('netypename');
                                }
                                if(strid!=""&&strname!="" && me.contentsid.indexOf(strid)<0){
                                    me.contentsid.push(strid);
                                    me.contentsinfo.push(strname);
                                    rec = new Ext.data.Record({
                                        id: strid,
                                        name: strname
                                    }); 
                                    me.getStore().add(rec);

                                    //在规则条件表中显示
                                    var booleanhas=false;
                                    Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                                        if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                                            booleanhas=true;
                                            str.set('condition_value' , me.contentsid.join(';'));
                                            str.set('condition_text' , me.contentsinfo.join(';'));
                                        }
                                    });
                                    if(!booleanhas){
                                        rec = new Ext.data.Record({
                                            condition_group: parenttabindex,
                                            pattern_id: meindex,
                                            condition_name: mename,
                                            condition_value: me.contentsid.join(';'),
                                            condition_text: me.contentsinfo.join(';')
                                        });
                                        alarmsourcestore.add(rec);
                                    }
                                }
                            });
                        }
                        
                        InfoWin.close();
                    }
                },{
                    xtype: "button",
                    text: _('Cancel'),
                    handler: function() {
                        InfoWin.close();
                    }
                }]
            });
            return InfoWin;
        },
        //得到网元view
        createNeInfoWin:function(){
            var inventoryNe = Ext.create('Admin.view.inventory.inventoryNeView');
            var neInfoView = inventoryNe.lookupReference('inventoryFormGrid');
            neInfoView.header=false;
            /*var neColumns = neInfoView.columns;
            for(var i in neColumns){
                var column = neColumns[i];
                if(column.dataIndex=="neid" || column.dataIndex=="hostname" || column.dataIndex=="netypeid" || column.dataIndex=="location" || column.dataIndex=="resourcestate"){
                    column.setHidden(false);
                }else{
                    column.setHidden(true);
                }
            }*/
            var sdnTabpanel = inventoryNe.lookupReference('sdnTabpanel');
            sdnTabpanel.setHidden(true);
            var toolMenuCard = inventoryNe.lookupReference('toolMenuCard');
            toolMenuCard.setHidden(true);
            var toolMenuCls = inventoryNe.lookupReference('toolMenuCls');
            for(var i=0; i<13; i++){
                var item = toolMenuCls.items.items[i];
                item.setHidden(true);
            }
            var neGrid = inventoryNe.lookupReference('neGrid');
            neGrid.un({
                itemcontextmenu: 'oncontextMenu', 
                selectionchange: "onselectionchange"
            });
            var title = _('Device List');
            return this.createInfoWin(inventoryNe,title);
        },
        //得到机箱view
        createChassisInfoWin:function(){
            var inventoryChassis = Ext.create('Admin.view.inventory.inventoryChassisView');
            var chassisInfoView = inventoryChassis.lookupReference('chassisGrid');
            chassisInfoView.header=false;
            var toolMenuCard = inventoryChassis.lookupReference('toolMenuCard');
            toolMenuCard.setHidden(true);
            var toolMenuCls = inventoryChassis.lookupReference('toolMenuCls');
            for(var i=0; i<7; i++){
                var item = toolMenuCls.items.items[i];
                item.setHidden(true);
            }
            chassisInfoView.un({
                selectionchange: "onselectionchange",
                itemdblclick: 'onItemDoubleClick'
            });
            
            var title=_('Chassis');
            return this.createInfoWin(inventoryChassis,title);
        },
        //得到板卡view
        createCardInfoWin:function(){
            var inventoryCard = Ext.create('Admin.view.inventory.inventoryCardView');
            var inventoryFormGrid = inventoryCard.lookupReference('inventoryFormGrid');
            var cardInfoView = inventoryCard.lookupReference('cardGrid');
            cardInfoView.header=false;
            var toolMenuCard = inventoryCard.lookupReference('toolMenuCard');
            toolMenuCard.setHidden(true);
            var toolMenuCls = inventoryCard.lookupReference('toolMenuCls');
            for(var i=0; i<7; i++){
                var item = toolMenuCls.items.items[i];
                item.setHidden(true);
            }
            cardInfoView.un({
                itemdblclick: 'onItemDoubleClick',
                selectionchange: "onselectionchange"
            });
            var title=_('Card');
            return this.createInfoWin(inventoryCard,title);
        },
        //得到设备类型view
        createNeTypeInfoWin:function(){
            var neTypeView = Ext.create('Admin.view.inventory.inventoryNeTypeView');
            var inventoryTypeFormGrid = neTypeView.lookupReference('inventoryTypeFormGrid');
            inventoryTypeFormGrid.header=false;
            inventoryTypeFormGrid.down('toolbar').setHidden(true);

            var title=_('ne type');
            return this.createInfoWin(neTypeView,title);
        },
        //得到告警类型view
        createAlarmTypeInfoWin:function(){
            var alarmTypeView = Ext.create('Admin.view.alarms.alarmtype.alarmTypeView');
            alarmTypeView.down('panel').setHidden(true);
            var alarmGrid = alarmTypeView.lookupReference('alarmGrid');
            alarmGrid.selModel.mode= 'MULTI';
            alarmGrid.selModel.selectionMode= 'MULTI';
            alarmGrid.un({
                itemcontextmenu: 'onItemRightClick'
            });
            var title=_('Alarm Type');
            return this.createInfoWin(alarmTypeView,title);
        },

        onUserRuleAdd:function(){
            var metabIndex = this.getView().tabIndex;
            if(metabIndex==22){//网元
                this.createNeInfoWin().show();
            }else if(metabIndex==23){//机箱
                this.createChassisInfoWin().show();
            }else if(metabIndex==24){//card
                this.createCardInfoWin().show();
            }else if(metabIndex==6){//告警类型
                this.createAlarmTypeInfoWin().show();
            }else if(metabIndex==26){//设备类型
               this.createNeTypeInfoWin().show();
            }
        },
        onRemove:function(){
            var me = this.getView();
            var mestore = me.getStore();
            var amRuleOperView = me.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;
            var meindex = me.tabIndex;
            var parenttabindex = me.up().tabIndex;
            if(parenttabindex==null || parenttabindex=='' || meindex==null || meindex==''){
                return;
            }
            if (me.getSelectionModel().hasSelection()) {
                var records = me.getSelectionModel().getSelection();
                Ext.Array.forEach(records,function(str,index,array){ //遍历衍生告警数组
                    if(me.contentsid.indexOf(str.get('id'))>=0){
                        
                        var index = mestore.find('id',str.get('id'));
                        mestore.remove(mestore.getAt(index));
                        //在规则条件表中显示
                        if(me.contentsid.length>1){
                            Ext.Array.remove(me.contentsid,str.get('id'));
                            Ext.Array.remove(me.contentsinfo,str.get('name'));
                            Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                                if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                                    str.set('condition_value' , me.contentsid.join(';'));
                                    str.set('condition_text' , me.contentsinfo.join(';'));
                                }
                            });
                        }else{
                            Ext.Array.remove(me.contentsid,str.get('id'));
                            Ext.Array.remove(me.contentsinfo,str.get('name'));
                            var index = alarmsourcestore.find('pattern_id',meindex);
                            alarmsourcestore.remove(alarmsourcestore.getAt(index));
                        }
                    }
                });
            }
        },
        onSelectionChange:function( me, selected, eOpts){
            if(selected){
                var userRuleRemove = this.lookupReference('userRuleRemove');
                userRuleRemove.setDisabled(false);
            }else{
                userRuleRemove.setDisabled(true);
            }
        }
    },
    store:{},
    multiSelect : true,
    columns: [{   
    	//text : '名称',
        dataIndex : 'id',
        width : 120,
        align: 'center',
        menuDisabled : false,
        hidden:true
    },{
        text : _('Name'),
        dataIndex : 'name',
        width : 250,
        align: 'center',
        menuDisabled : false
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'left',
        items: [{
            iconCls:'x-fa  fa-plus-square',//'add',
            tooltip : _('Add'),
            reference:'userRuleAdd',
            handler: 'onUserRuleAdd'
        },{
            iconCls:'x-fa fa-remove',//'remove ',
            reference:'userRuleRemove',
            tooltip : _('Delete'),
            disabled:true,
            handler: 'onRemove'
        }]
    }],
    listeners:{
        selectionchange:'onSelectionChange'
    }
});