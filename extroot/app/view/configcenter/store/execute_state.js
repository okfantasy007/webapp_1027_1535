Ext.define('Admin.view.configcenter.store.execute_state', {
	extend: 'Ext.data.Store',
	alias: 'store.execute_state',
	fields: ['id', 'state'],
	data: [{
			"id": 0,
			"state": "所有状态"
		},
		{
			"id": 1,
			"state": "等待运行"
		},
		{
			"id": 2,
			"state": "正在运行"
		},
		{
			"id": 3,
			"state": "待激活"
		},
		{
			"id": 4,
			"state": "正在激活"
		},
		{
			"id": 5,
			"state": "已完成"
		},

	]
});