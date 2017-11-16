Ext.define('Admin.view.system.systemManage.view.licenseForm.licenseForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'licenseForm',
    requires: [
        'Admin.view.system.systemManage.controller.licenseForm.licenseForm'
    ],
    controller: 'licenseForm',
    itemId: 'licenseForm',
    margin: 10,
    items: [
        {
            xtype: 'fieldset',
			title:_('License信息'),
			margin: '0 0 5 25',
			defaultType: 'textfield',
			width:1250,
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
            items: [
                {
                    xtype: 'container',
                    margin: '0 0 5 0',
                    layout: 'hbox',
                    items: [
                       {
	        		      fieldLabel: _('用户名称'),
	        		      xtype: 'textfield',
	        			  allowBlank: false,
	        			  name: 'userName',
	        			  itemId: 'userName',
	        			  labelWidth:110,
	        			  blankText: '请输入用户名',
	        			  maxLength: 20,
	   				      maxLengthText: '用户名不能超过20个字符'
	   				      
	        	       },
	        	       {
	   	                  xtype: 'numberfield',
	   	                  margin: '0 0 5 20',
	   	                  name: 'days',
	   	                  itemId: 'days',
	   	                  fieldLabel: '并发连接终端数量',
	   	                  labelWidth:110,
	   	                  maxValue: 500,
	   	                  minValue: 1,
	   	                  allowDecimals: false,//小数点
	   	                  allowNegative: false,//负数
	   	                  allowBlank: false
   	                   },
   	                   { 
  	                      xtype: 'label',       
  	                      padding: '10px',
  	                      text: '（范围：1 - 500）'
  	                   }    
                    ]
 	              },
 	              {
                    xtype: 'container',
                    margin: '0 0 5 0',
                    layout: 'hbox',
                    items: [
                       {
   	                      xtype: 'combobox',
   	                      fieldLabel: 'License类型',
   	                      labelWidth:110,
   	                      name: 'license_type',
   	                      itemId: 'license_type',
   	                      store: {
   	                     	 fields: ['license_type','licenseData'],
   	                         data: [['试用版', 0],['授权版', 1]]
   	                      },
   	                      valueField: 'licenseData',
   	                      displayField: 'license_type',
   	                      queryMode: 'local',
   	                      value: 0,
   	                   },
   	                   {
						  xtype: 'datetimefield',
						  fieldLabel:_('试用版截止日期'),
						  margin: '0 0 5 20',
						  labelWidth:110,
						  name: 'operateEndTime',
						  itemId:'operateEndTime'
					   },
 	                ]
 	 	         },
	              {
                     xtype: 'container',
                     margin: '0 0 5 0',
                     layout: 'hbox',
                     items: [
	                   {
	                      xtype: 'combobox',
	                      fieldLabel: '服务类型',
	                      labelWidth:110,
	                      name: 'service_grade',
	                      itemId: 'service_grade',
	                      store: {
	                     	 fields: ['serviceType','serviceData'],
	                         data: [['VIP用户', 0],['普通用户', 1]]
	                      },
	                      valueField: 'serviceData',
	                      displayField: 'serviceType',
	                      queryMode: 'local',
	                      value: 0,
		               },
		               {
	      		          fieldLabel: _('企业信息'),
	      		          xtype: 'textfield',
	      		          margin: '0 0 5 20',
	      			      allowBlank: false,
	      			      labelWidth:110,
	      			      name: 'backupPath',
	      			      itemId: 'backupPath',
	      			      blankText: '请输入企业信息'
	      	           }
  	                ]
  	 	         } 
            ]
        },
        {
            xtype: 'fieldset',
            title:_('License配置'),
            itemId: 'licenseConfig',
			margin: '0 0 5 25',
			defaultType: 'textfield',
			layout: 'hbox',
            items: [
              {
				xtype: 'fileuploadfield',
				name: 'upload_file',
				itemId: 'upload',
				fieldLabel: '上传文件',
				msgTarget: 'side',
				buttonText: '选择文件...',
				editable: false,
   	            allowBlank: false,
			  },
			  {
			    xtype: 'button', 
			    text:'确定', 
			    width:90,
			    margin: '0 0 5 230',
			    handler: 'onSubmit'
    		  }
            ]
        }
    ]
});
