/***
*分组监控中，添加编辑规则中条件中包含指定文字的界面
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperAddWords', {
    extend: 'Ext.form.Panel',//'Ext.container.Container',
    xtype:'amRuleOperAddWords',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    width : 250,
    initComponent:function(){
        this.callParent();
        this.contentsid = new Array();
        this.contentsinfo = new Array();
    },
    controller:{
    	validatefield: function(me, isValid, eOpts){
            var addWordsBtn = this.lookupReference('addWords');
            if(!me.validate()){
                addWordsBtn.setDisabled(true);
            }else{
                addWordsBtn.setDisabled(false);
            }
        },
        
        onSelectionChange:function(me,selection){
            var editWords = this.lookupReference('editWords');
            var removeWords = this.lookupReference('removeWords'); 
            if(selection.length>0){
                editWords.setDisabled(false);
                removeWords.setDisabled(false);
            }else{
            	editWords.setDisabled(true);
                removeWords.setDisabled(true);
            }
        },
        
        onAddWords:function(){
            var me = this.getView();
        	var mainWord = this.lookupReference('mainWord');
        	if(mainWord.value==""){
        		Ext.Msg.alert(_('With Errors'), _('Keyword can not be empty!') );
        	}else if(mainWord.value.indexOf(';')>=0){
                Ext.Msg.alert(_('With Errors'), _('Keyword')+_('Contain')+';' );
            }else{
        		var mainWordsGrid = this.lookupReference('mainWordsGrid');
        	    var p = new Ext.data.Record({	                
                    text:mainWord.value
                }); 
        	    var store = mainWordsGrid.getStore();
        	    store.data.add(p);
        	    mainWordsGrid.getView().refresh();

                me.contentsid.push(mainWord.value);
                me.contentsinfo.push(mainWord.value);
                mainWord.setValue('');
               //添加到规则条件中
                var meindex = me.tabIndex;
                var mename = me.title;
                var parenttabindex = me.up().tabIndex;
                var amRuleOperView = me.up('amRuleOperView');
                var rulegrid = amRuleOperView.down('gridpanel');
                var alarmsourcestore = rulegrid.getStore();
                var alarmsourcedata = alarmsourcestore.data;

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
        },
        onEditWords:function(){
            var me = this.getView();

            var mainWordsGrid = this.lookupReference('mainWordsGrid');
            var selections = mainWordsGrid.getSelection();
            if(selections.length=1){
            	//var text = selections[0].get('text');
                Ext.MessageBox.prompt(_('Confirmation'), _('Please input Keyword'), callback);
                function callback(id,text) {
                    if (id == 'ok') {
                        var store = mainWordsGrid.getStore();
                        var oldtext = selections[0].get('text');
                        selections[0].set('text',text);
        	            store.data.replace(selections[0]);
                        if(me.contentsid!=null && me.contentsid.length>0){
                            var index = me.contentsid.indexOf(oldtext)
                            me.contentsid[index] = text;
                            me.contentsinfo[index] = text
                        }else{
                            me.contentsid.push(text);
                            me.contentsinfo.push(text);
                        }
                        
                        //修改规则条件表中的信息
                        var meindex = me.tabIndex;
                        var mename = me.title;
                        var parenttabindex = me.up().tabIndex;
                        var amRuleOperView = me.up('amRuleOperView');
                        var rulegrid = amRuleOperView.down('gridpanel');
                        var alarmsourcestore = rulegrid.getStore();
                        var alarmsourcedata = alarmsourcestore.data;
                        Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                            if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                                str.set('condition_value' , me.contentsid.join(';'));
                                str.set('condition_text' , me.contentsinfo.join(';'));
                            }
                        });
                    }
                }
            }else{
            	Ext.Msg.alert(_('With Errors'), _('Please select one item for operate') );
            }
        },
        onRemoveWords:function(){
            var me = this.getView();

            var meindex = me.tabIndex;
            var mename = me.title;
            var parenttabindex = me.up().tabIndex;
            var amRuleOperView = me.up('amRuleOperView');
            var rulegrid = amRuleOperView.down('gridpanel');
            var alarmsourcestore = rulegrid.getStore();
            var alarmsourcedata = alarmsourcestore.data;

        	var mainWordsGrid = this.lookupReference('mainWordsGrid');
            var selections = mainWordsGrid.getSelection();
            var store = mainWordsGrid.getStore();
            if(selections.length>0){
                for(var i in selections){ 
                	var selection = selections[i];
                    store.data.remove(selection);
                }
                Ext.Array.erase(me.contentsid,0,me.contentsid.length);
                Ext.Array.erase(me.contentsinfo,0,me.contentsinfo.length);
                //得到store中现有的数据
                if(store.data.length>0){
                    Ext.Array.forEach(store.data.items,function(str,index,array){
                        me.contentsid.push(str.get('text'));
                        me.contentsinfo.push(str.get('text'));
                    });

                    Ext.Array.forEach(alarmsourcedata.items,function(str,index,array){ //遍历衍生告警数组
                        if(str.get('pattern_id')==meindex && parenttabindex==str.get('condition_group')){
                            str.set('condition_value' , me.contentsid.join(';'));
                            str.set('condition_text' , me.contentsinfo.join(';'));
                        }
                    });
                }else{
                    var index = alarmsourcestore.find('pattern_id',meindex);
                    alarmsourcestore.remove(alarmsourcestore.getAt(index));
                }
                
            }else{
            	Ext.Msg.alert(_('With Errors'), _('Please select one item at least for operate!') );
            }
        }
    },
    items : [{
        xtype : 'textfield',
        reference:'mainWord',
        fieldLabel : _('Please input Keyword'),
        name : 'mainWord',
        width : 200,
        labelWidth : 110,
        labelAlign : "top",
        margin : 1,
        listeners: {
            validitychange: 'validatefield',
        }
    },{
        header: false,
        xtype: 'gridpanel',
        width: 250,
        height: 200,
        border: true,
        autoScroll : true,
        lines: false,
        multiSelect : true,
        reference:'mainWordsGrid',
        emptyText : _('Empty'),
        store:{},
        columns:[{
            //text:'',
            dataIndex : 'text',
            align: 'left',
            menuDisabled : true
        }],
        listeners:{
            selectionchange:'onSelectionChange'
        }
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'left',
        items: [{
            iconCls:'x-fa  fa-plus-square',//'add',
            tooltip : _('Add'),
            reference:'addWords',
            disabled:true,
            handler: 'onAddWords'
        },{
            iconCls:'x-fa fa-edit',//'edit_task',
            tooltip : _('Edit'),//'编辑',
            reference:'editWords',
            disabled:true,
            handler: 'onEditWords'
        },{
            iconCls:'x-fa fa-remove',//'remove ',
            reference:'removeWords',
            tooltip : _('Delete'),
            disabled:true,
            handler: 'onRemoveWords'
        }]
    }]
});