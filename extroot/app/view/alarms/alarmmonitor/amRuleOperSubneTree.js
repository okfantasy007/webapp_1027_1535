/***
*分组监控中，添加编辑规则中的子网树
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperSubneTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'amRuleOperSubneTree',
    requires: [ 
    ],
    store : {
        fields: [{name: 'text'}],
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: '/topo/topo_nodeorlink_info/get_topo_subnet',
            extraParams: {ids : '-1'},
            reader: {
                type: 'json'
            }
        }
    },
    initComponent:function(){
        this.callParent();
        //this.parent ;
        this.contentsid = new Array();
        this.contentsinfo = new Array();
    },
    controller:{
        onLoad: function(){
            var subNeTree = this.getView();
            var rootnode  = subNeTree.getRootNode();
            var treeStore = subNeTree.getStore();
            var items = treeStore.data.items;
            for(var i in items){
                var item = items[i];
                this.onTreeChildLoad(item);
            }
        },
        onTreeChildLoad:function treeChildLoad(node){
            if (!node) return;
            node.set('checked', false);
            node.eachChild(function (child) {
                treeChildLoad(child, false);
            });
        },
        /*ongetupview:function(field){
            var me = this.getView();
            me.parent = field;
        },*/
        onCheckChange:function( node, checked, e, eOpts){
            var me = this.getView();
            var metabindex = me.tabIndex;
            var alarmsourceview= me.up('amRuleOperAlarmSourceView');
            var alarmsourcetabindex = alarmsourceview.tabIndex;
            var mename = me.title;
            var amRuleOperView = me.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;

            if(checked){
                if(me.contentsid.indexOf(node.get('symbol_id'))<0){
                    me.contentsid.push(node.get('symbol_id'));
                    me.contentsinfo.push(node.get('text'));
                    var  booleanhas = false;
                    if(alarmsourcedata.length>0){
                        Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                            if(str.get('pattern_id')==metabindex && alarmsourcetabindex==str.get('condition_group')){
                                booleanhas=true;
                                str.set('condition_value' , me.contentsid.join(';'));
                                str.set('condition_text' , me.contentsinfo.join(';'));
                            }
                        });
                    }
                    if(!booleanhas){
                        rec = new Ext.data.Record({
                            condition_group: alarmsourcetabindex,
                            pattern_id: metabindex,
                            condition_name: mename,
                            condition_value: me.contentsid.join(';'),
                            condition_text: me.contentsinfo.join(';')
                        });
                        //alarmsourcedata.add(rec); 
                        alarmsourcestore.add(rec);
                    }
                }
                
            }else{
                if(me.contentsid.length>1){ 
                    Ext.Array.remove(me.contentsid,node.get('symbol_id'));
                    Ext.Array.remove(me.contentsinfo,node.get('text')); 
                    Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                        if(str.get('pattern_id')==metabindex && alarmsourcetabindex==str.get('condition_group')){
                            str.set('condition_value' , me.contentsid.join(';'));
                            str.set('condition_text' , me.contentsinfo.join(';'));
                        }
                    });
                }else{
                    Ext.Array.remove(me.contentsid,node.get('symbol_id'));
                    Ext.Array.remove(me.contentsinfo,node.get('text')); 
                     var index = alarmsourcestore.find('pattern_id',metabindex);
                     alarmsourcestore.remove(alarmsourcestore.getAt(index));
                }

            }
        }
    },
    checkPropagation: 'down',//树形选择是，down表示选择父节点，子节点也被选，还有both、none、up
    rootVisible: false,
    split: true,
    lines: true,
    border:true,
    emptyText : _('Empty'),
    viewConfig: {markDirty: false},
    listeners: {     
        load:'onLoad',
        checkchange:'onCheckChange'
    }
});