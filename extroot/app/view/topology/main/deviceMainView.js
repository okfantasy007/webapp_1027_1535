Ext.define('Admin.view.topology.main.deviceMainView', {
    extend: 'Ext.container.Container',
    xtype: 'deviceMainView',

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    // margin: 10,

    // 指定布局
    layout: 'border',
    items: [
    {   
        region: 'west',
        width: 280, 
        xtype: 'subnetTreeView'
    },
    {
    	xtype: 'panel',
    	region: 'center',
    	margin: '0 0 0 5',
    	layout: 'fit',
    	items : {
        	xtype: 'deviceGridView'
    	}        
    }]
});
