Ext.define('Admin.view.alarms.alarmAllNeSync.confirmAllNeSync', {
	extend: 'Ext.container.Container',
	xtype:'confirmAllNeSync',
	// padding: '200 300 200 300',
	layout:'center',
	controller: {
		onYes: function(){
            // Ext.MessageBox.alert( _('Tip'), _('Synchronous Global Alarm failed'));//全网告警同步失败
            Ext.Msg.show({
                title:_('Tip'),
                message: _('Synchronous Global Alarm failed'),
                buttons: Ext.Msg.YES,
                icon: Ext.Msg.WARNING,
            });
        },
        onNo: function(){
            window.history.back();
        }
        
	},

	items: [
	    { 
	    	xtype: 'panel',
	    	title: _('Synchronous Global Alarm'),//全网告警同步
	    	frame: true,
	    	height: 200,
	    	width: 300,
	    	// layout:'center',
	    	layout: {
        		type: 'hbox',
        		align: 'middle'
    		},
	    	items: [//
	    		{
	    			xtype: 'label',
	    			flex: 0.2
	    		},
	    		{
	    			xtype: 'label',
	    			cls:Ext.baseCSSPrefix + 'message-box-question',
	    			flex: 0.3
	    		},
	    		{
	    			xtype: 'label',
	    			text: _('Alarm Synchronous Global Net?'),//是否进行全网告警同步？
	    			flex:1
	    		},
	    		{
	    			xtype: 'label',
	    			flex: 0.2
	    		},
	    	],
	    	dockedItems: [{
	    		xtype: 'toolbar',
            	dock: 'bottom',
            	ui: 'footer',
            	items: [
            		'->',
                	{
                		text: _('Yes'),
                		handler: 'onYes',
                	},
                	{
                		text: _('No'),
                		handler: 'onNo',
                		// href:'javascript:history.go(-1)'
                	}
                ]  
	    	}]
	    }
	]
});