Ext.define('Admin.view.configcenter.store.textType', {
	extend: 'Ext.data.Store',
	alias: 'store.textType',
	fields: ['id', 'name'],
	data: [
		{ "id": "1", "name": "系统软件" },
		{ "id": "2", "name": "配置数据" },
		{ "id": "3", "name": "Syslog文件" }
	]
});