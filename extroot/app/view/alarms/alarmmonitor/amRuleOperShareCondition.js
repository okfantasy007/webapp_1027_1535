/***
*添加编辑规则时的，共享条件：用户条件
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperShareCondition', {
    extend: 'Ext.form.Panel',
    xtype: 'amRuleOperShareCondition',
    //width: 650,
    bodyPadding: 10,
    defaultType: 'radio',
    tabIndex:4,
    border:true,
    autoScroll : true,
    initComponent:function(){
        this.callParent();
        this.contentsid = new Array();
        this.contentsinfo = new Array();
    },
    controller:{
        getShareCondition:function(){
       	    var form = this.getView();
       	    var values = form.getForm().getValues();
       	    var shareusers = "";
            if(values.get("sharemode")==1){
                var userInfoGrid = this.lookupReference('userInfoGrid');
                var checkedDatas = userInfoGrid.getChecked();
                
            }
        },
        onAfterRender:function(me){
            this.onGetUserRuleForRadio(0,'允许所有用户使用');
        },
        onSharemodeZera:function(me,check){
            //var meview = this.getView();
            var userInfoGrid = this.lookupReference('userInfoGrid');
            var userGroupGrid = this.lookupReference('userGroupGrid');

            if(check){
                userInfoGrid.getSelectionModel().clearSelections();
                userInfoGrid.getView().refresh();
                userInfoGrid.setDisabled(true);

                userGroupGrid.getSelectionModel().clearSelections();
                userGroupGrid.getView().refresh();
                userGroupGrid.setDisabled(true);

                this.onGetUserRuleForRadio(me.inputValue,me.boxLabel);
            }
        },
        onSharemodeOne:function(me,check){
            var userInfoGrid = me.nextSibling();
            if(check){
                userInfoGrid.setDisabled(false);
                
                this.onGetUserRuleForRadio(me.inputValue,me.boxLabel);
            }else{
                userInfoGrid.getSelectionModel().clearSelections();
                userInfoGrid.getView().refresh();
                userInfoGrid.setDisabled(true);
            }
        },
        onSharemodeTwo:function(me,check){
            var userGroupGrid = me.nextSibling();
            if(check){
                userGroupGrid.setDisabled(false);
                
                this.onGetUserRuleForRadio(me.inputValue,me.boxLabel);
            }else{
                userGroupGrid.getSelectionModel().clearSelections();
                userGroupGrid.getView().refresh();
                userGroupGrid.setDisabled(true);
            }
        },
        onGetUserRuleForRadio:function(inputvalue,boxlabel){
            var meview = this.getView();

            var parenttabindex = meview.tabIndex;//condition_group
            var meindex = inputvalue;//pattern_id
            var mename = boxlabel;//condition_name
        
            var amRuleOperView = meview.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;
            var booleanhas=false;
            Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                if(parenttabindex==str.get('condition_group')){
                    booleanhas=true;
                    str.set('pattern_id',meindex);
                    str.set('condition_name',mename);
                    str.set('condition_value' , '');
                    str.set('condition_text' , '');
                }
            });
            if(!booleanhas){
                rec = new Ext.data.Record({
                    condition_group: parenttabindex,
                    pattern_id: meindex,
                    condition_name: mename,
                    condition_value: '',
                    condition_text: ''
                });
                alarmsourcestore.add(rec);
            }
        },
        onSelectionChangeUser:function( me, selected, eOpts){
            var meview = this.getView();
            Ext.Array.erase(meview.contentsid,0,meview.contentsid.length);
            Ext.Array.erase(meview.contentsinfo,0,meview.contentsinfo.length);

            var parenttabindex = meview.tabIndex;//condition_group
            var meindex = meview.lookupReference('sharemodeOne').inputValue;//pattern_id
            var mename = meview.lookupReference('sharemodeOne').boxLabel;//condition_name

            var amRuleOperView = meview.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;

            if (me.getSelection().length>0) {
                
                var records = me.getSelection();
                Ext.Array.forEach(records,function(str,index,array){
                    meview.contentsid.push(str.get('id'));
                    meview.contentsinfo.push(str.get('text'));
                });

                Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                    if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                        str.set('pattern_id',meindex);
                        str.set('condition_name',mename);
                        str.set('condition_value' , meview.contentsid.join(';'));
                        str.set('condition_text' , meview.contentsinfo.join(';'));
                    }
                });
            }else{
                Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                    if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                        str.set('pattern_id',meindex);
                        str.set('condition_name',mename);
                        str.set('condition_value' , '');
                        str.set('condition_text' , '');
                    }
                });
            }
        },
        onSelectionChangeUserGroup:function( me, selected, eOpts){
            var meview = this.getView();
            Ext.Array.erase(meview.contentsid,0,meview.contentsid.length);
            Ext.Array.erase(meview.contentsinfo,0,meview.contentsinfo.length);

            var parenttabindex = meview.tabIndex;//condition_group
            var meindex = meview.lookupReference('sharemodeTwo').inputValue;//pattern_id
            var mename = meview.lookupReference('sharemodeTwo').boxLabel;//condition_name

            var amRuleOperView = meview.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;

           if (me.getSelection().length>0) {

                var records = me.getSelection();
                Ext.Array.forEach(records,function(str,index,array){
                    meview.contentsid.push(str.get('id'));
                    meview.contentsinfo.push(str.get('text'));
                });
                
                Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                    if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                        str.set('pattern_id',meindex);
                        str.set('condition_name',mename);
                        str.set('condition_value' , meview.contentsid.join(';'));
                        str.set('condition_text' , meview.contentsinfo.join(';'));
                    }
                });
            }else{
                Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                    if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                        str.set('pattern_id',meindex);
                        str.set('condition_name',mename);
                        str.set('condition_value' , '');
                        str.set('condition_text' , '');
                    }
                });
            }
        }
    },
    items: [{
        checked: true,
        //fieldLabel: 'Favorite Color',
        boxLabel: '允许所有用户使用',
        name: 'sharemode',
        inputValue: '0',//'允许所有用户使用'
        handler:'onSharemodeZera'
    }, {
        boxLabel: '只允许指定用户使用(Admin组用户不受限制)',
        name: 'sharemode',
        reference:'sharemodeOne',
        inputValue: '1',//'只允许指定用户使用(Admin组用户不受限制)',
        handler:'onSharemodeOne'
    }, {
        xtype:'gridpanel',
        reference:'userInfoGrid',
        width:250,
        border:true,
        disabled:true,
        store : {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'alarm/Monitor/getSecUser',
                reader: {
                    type: 'json'
                }
            }
        },
        selType: 'checkboxmodel',
        autoScroll : true,
        lines:false,
        //columnLines : false,
        emptyText : _('Empty'),
        columns : [{
            dataIndex : 'id',//userid
            width : 120,
            align: 'center',
            menuDisabled : false,
            hidden:true
        },{
            dataIndex : 'text',//user_name
            width : 170,
            align: 'center',
            menuDisabled : true
        }],
        listeners:{
            selectionchange:'onSelectionChangeUser'
        }
    },{
        boxLabel: '只允许指定用户组成员使用(Admin组用户不受限制)',
        name: 'sharemode',
        reference:'sharemodeTwo',
        inputValue: '2',//'只允许指定用户组成员使用(Admin组用户不受限制)',
        handler:'onSharemodeTwo'
    },{
        xtype:'gridpanel',
        reference:'userGroupGrid',
        width:250,
        border:true,
        disabled:true,
        store : {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'alarm/Monitor/getSecUserGroupGrid',
                reader: {
                    type: 'json'
                }
            }
        },
        selType: 'checkboxmodel',
        autoScroll : true,
        lines:false,
        emptyText : _('Empty'),
        columns : [{
            dataIndex : 'id',//userid
            width : 120,
            align: 'center',
            menuDisabled : false,
            hidden:true
        },{
            dataIndex : 'text',
            width : 170,
            align: 'center',
            menuDisabled : true
        }],
        listeners:{
            selectionchange:'onSelectionChangeUserGroup'
        }
    }],
    listeners:{
        //change:'onRadioChange',
        afterrender:'onAfterRender'
    }
});