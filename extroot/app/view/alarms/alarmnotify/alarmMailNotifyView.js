Ext.define('Admin.view.alarms.alarmnotify.alarmMailNotifyView', {
    extend: 'Ext.panel.Panel',
	xtype:'alarmMailNotifyView',
  
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            
			keywordsStore_remote:
			{
                autoLoad: true,
                proxy: {
					fields:["value", "text"],
                    type: 'ajax',
                    url: '/alarm/getSmsTemplateKeys',
                    reader: 'json'
                }

            },
        }
    },

    controller: {  


        onApply: function() {
			var titleform =this.getView().down('tabpanel').down('form');
			var contentform =this.getView().down('tabpanel').down('form').nextSibling();
			
			var  titleVal= titleform.down('textarea').value;
		
			var contentVal = contentform.down('textarea').value;
			
			Ext.Ajax.request({
							url : 'alarm/modifyMailConfigParams',
							method:'post',
							params:{
								title:titleVal,
								content:contentVal
							},
							success : function(response) {
								
							if(response.responseText){
								var r =  Ext.decode(response.responseText);
								titleform.getForm().setValues( Ext.decode(response.responseText));
								Ext.Msg.alert(_('Success'), '设置成功');
								
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert('失败', '设置失败');
								
							}
						
							
								}
		});
		 
        },

        onRefresh: function() {
			var tabpanel = this.getView().down('tabpanel');
			var titleform =this.getView().down('tabpanel').down('form');
			var contentform =this.getView().down('tabpanel').down('form').nextSibling();
          Ext.Ajax.request({
							url : 'alarm/getMailTitleTemplateKeys',
							success : function(response) {
							//alert('tt');
							//alert(response);
							console.log("112",response.responseText);
							titleform.getForm().setValues( Ext.decode(response.responseText));
								}
		});
		
		Ext.Ajax.request({
							url : 'alarm/getMailContentTemplateKeys',
							success : function(response) {
							//alert('tt');
							//alert(response);
							console.log("112",response.responseText);
							contentform.getForm().setValues( Ext.decode(response.responseText));
								}
		});
	
		Ext.Ajax.request({
							url : 'alarm/getMailServerStatus',
							success : function(response) {
							console.log("112",response.responseText);
							
							if(response.responseText=='true'){
								tabpanel.down('label').setText('运行状态：运行中');
							}else{
							tabpanel.down('label').setText('运行状态：已停止');	
							}
							
								}
		});
        },
		onTitleInsert:function(){
			
		var form =this.getView().down('tabpanel').down('form');
	
		var textArea = form.down('textarea');

		var textAreaValue= textArea.value;
		
		var combobox = form.down('combobox');
		
		var comboboxValue= combobox.value;
		console.log('1+',textAreaValue);
		console.log('1+',comboboxValue);
		var value= textAreaValue +''+'%'+comboboxValue+'%';
		textArea.setRawValue(value); 
		textArea.value =value;	
			
		},
		onContentInsert:function(){
			
		var form =this.getView().down('tabpanel').down('form').nextSibling();
	
		var textArea = form.down('textarea');

		var textAreaValue= textArea.value;
		
		var combobox = form.down('combobox');
		
		var comboboxValue= combobox.value;
		console.log('1+',textAreaValue);
		console.log('1+',comboboxValue);
		var value= textAreaValue +''+'%'+comboboxValue+'%';
		textArea.setRawValue(value); 
		textArea.value =value;	
			
		}

     
    },

    items:[
	
		{
		xtype:'tabpanel',
		margin:10,
		reference: 'alarmMailNotifyPanel',
		header:false,
		title:'告警邮件服务',
		bbar:[ 
                       //添加按钮  
                       '->',
                      	 {  
                       	xtype:'label',
                   		text:'运行状态：已停止',
                   		forId:'runStatus',
                   		
                   	},{  
                       		text:'应用',
                       		tooltip:'应用',
							iconCls:'button_save',
                       	    handler:'onApply'
                       		
                       	},{
                       		text:'刷新',
                       		tooltip:'刷新',
							iconCls:'refresh',
                       	    handler:'onRefresh'
                       	}
                        	
          ],		
		items: [
		{
		title:'邮件标题模板',
		xtype:'form',
		reference:'mailTitleForm',
		items:[
		{
           	 xtype:'textarea',
           	 fieldLabel: '邮件标题模板',
			 name:'title',
			  width:'100%',
			 height:300,
           	
        }
		
		],
		bbar:[
			{
        	xtype:'combobox',
        	fieldLabel: '关键字',
			width:'90%',
	         name: 'keyWords',
	         bind: {
              store: '{keywordsStore_remote}',
			},   
			 value:'电路编号',
	         displayField:"text",
			 valueField : 'value',
        },
		{
			text:'插入',
			iconCls:'add',
			handler:'onTitleInsert'
		}
		]
		},
		{
		title:'邮件内容模板',
		xtype:'form',
		reference:'mailContentForm',
		items:[
		 {
           	 xtype:'textarea',
           	 fieldLabel: '邮件内容模板',
			 name:'content',
			 width:'100%',
			 height:300,
           	
        } 
		],
		bbar:[
		
		{
        	xtype:'combobox',
        	fieldLabel: '关键字',
	         name: 'keyWords',
			width:'90%',
	         bind: {
              store: '{keywordsStore_remote}',
			},   
			value:'电路编号',
	         displayField:"text",
			 valueField : 'value',
        },
		{
			text:'插入',
			iconCls:'add',
			handler:'onContentInsert'
		}
			
		
		]
		}
         
        
    ],	
		}

		
            
        
    ],

});
