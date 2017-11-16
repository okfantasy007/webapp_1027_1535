Ext.define('Admin.view.resource.polling.pollingMainView', {
    extend: 'Ext.container.Container',
    xtype: 'pollingMainView',
      
    requires: [
        'Admin.view.resource.polling.pollingGrid'
        // 'Admin.view.resource.polling.pollingTreeView'
    ],

    cls: 'shadow',
  	title:'设备轮询',
    layout: {
        type: 'hbox',
        align: 'stretch'
   	},

    items:[
  //   {			
		// 	xtype:'pollingTreeView',
		// 	flex: 1
		// },
		{
			xtype:'pollingGrid',
			// flex: 3.5,
      margin: '0 1 0 5',
		}
    ]
});

