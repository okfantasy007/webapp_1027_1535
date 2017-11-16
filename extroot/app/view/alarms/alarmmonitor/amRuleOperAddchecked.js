/***
*分组监控中，添加编辑规则中条件中需要选择的项
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperAddchecked', {
    extend: 'Ext.grid.Panel',
    xtype: 'amRuleOperAddchecked',
    emptyText : _('Empty'),
    border: true,
    autoScroll : true,
    width : 250,
    height: 250,
    lines: false,
    multiSelect : true,
    selType: 'checkboxmodel',
    initComponent:function(){
        this.callParent();
        this.contentsid = new Array();
        this.contentsinfo = new Array();
    },
    controller:{
        onSelectionChange:function( me, selected, eOpts){
            var me = this.getView();

            var meindex = me.tabIndex;
            var mename = me.title;
            var parenttabindex = me.up().tabIndex;
            var amRuleOperView = me.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;

            Ext.Array.erase(me.contentsid,0,me.contentsid.length);
            Ext.Array.erase(me.contentsinfo,0,me.contentsinfo.length);

            if (me.getSelectionModel().hasSelection()) {
                var records = me.getSelectionModel().getSelection();
                Ext.Array.forEach(records,function(str,index,array){
                    me.contentsid.push(str.get('id'));
                    me.contentsinfo.push(str.get('text'));
                });
                if(meindex==9){
                    var booleanhas=false;
                    Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                        if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                            booleanhas=true;
                            str.set('condition_value' , me.contentsinfo.join(';'));
                            str.set('condition_text' , me.contentsinfo.join(';'));
                        }
                    });
                    if(!booleanhas){
                        rec = new Ext.data.Record({
                            condition_group: parenttabindex,
                            pattern_id: meindex,
                            condition_name: mename,
                            condition_value: me.contentsinfo.join(';'),
                            condition_text: me.contentsinfo.join(';')
                        });
                        alarmsourcestore.add(rec);
                    }
                }else{
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
            }else{
                var index = alarmsourcestore.find('pattern_id',meindex);
                if(index!=null){
                    alarmsourcestore.remove(alarmsourcestore.getAt(index));
                }
            }
        }
    },
    store:{},
    columns: [{
    	//text : '网元名称',
        dataIndex : 'id',
        width : 120,
        align: 'center',
        menuDisabled : false,
        hidden:true
    },{
        //text : '网元名称',
        dataIndex : 'text',
        width : 120,
        align: 'center',
        menuDisabled : false
    }],
    listeners:{
        selectionchange:'onSelectionChange'
    }
});