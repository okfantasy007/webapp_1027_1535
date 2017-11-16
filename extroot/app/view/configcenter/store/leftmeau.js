Ext.define('Admin.view.configcenter.store.leftmeau', {
	extend: 'Ext.data.TreeStore',
	alias: 'store.leftmeau',
	root: {
		text: 'Ext JS',
		id: 'root',
		expanded: true,
		children: [
			{
				text: '设备升级',
				id: 'eq_up',
				children: [
					{ leaf: true, text: '升级文件管理', id: 'up_file' },
					{ leaf: true, text: '升级策略管理', id: 'up_strategy' },
					{ leaf: true, text: '升级任务管理', id: 'up_mession' }
				]
			},
			{
				text: '数据备份',
				expanded: true,
				children: [
					{ leaf: true, text: '备份文件管理' },
					{ leaf: true, text: '备份策略管理' },
					{ leaf: true, text: '备份任务管理' }
				]
			},
			{
				text: '日志管理',
				children: [
					{ leaf: true, text: '升级日志' },
					{ leaf: true, text: '备份日志' }
				]
			}
		]
	}
});    