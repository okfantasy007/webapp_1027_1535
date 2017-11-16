Ext.define('Admin.view.system.systemManage.model.server.serverListGrid', {
    extend: 'Ext.data.Model',
    fields: [
		{name:'disk',mapping:'disk.avail'},
		{name:'cpu',mapping:'cpu.model'},
		{name:'total',mapping:'mem.total'},
		{name:'unit',mapping:'mem.unit'},
	],
	pageSize: 10,
    proxy: {
        type: 'ajax',
        url: '/sysmanage/sysmng/host',
        reader: {
            type: 'json',
            rootProperty: 'host',
            totalProperty: 'total_count'
        }
    }
});