Ext.define('Admin.view.alarms.alarmServerConfig.alarmServerConfigForm', {
	
	  xtype: 'alarmServerConfigForm',
    extend: 'Admin.view.base.CardForm',

    controller: {
    },

    margin: 10,
    items: [
    {
        xtype: 'fieldset',
        title: '',
        margin: 10,
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
	        {
	            xtype: 'hidden',
	            name: 'name'
	        },
	        {
	        	  xtype: 'displayfield',
	            fieldLabel: '服务名称',
	            name: 'server_name'
	        },
	        {
	            xtype: 'displayfield',
	            fieldLabel: '服务类型',
	            name: 'server_type'
	        },
          {
              fieldLabel: '端口',
              allowBlank: false,
              name: 'port'
           }

        ]
    }],

});
