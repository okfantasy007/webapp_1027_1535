Ext.define('Admin.view.performance.estimate.view.estimateMainView', {
	extend: 'Ext.container.Container',
	xtype: 'estimateMainView',
	requires: [
		'Admin.view.performance.estimate.view.collectAssessment',
	],
	layout: 'card',
	// 指定panel边缘的阴影效果
	cls: 'shadow',
	items: [
		{
			title: _('estimateServer'),
			xtyp: 'panel',
			itemId: 'estimateMainView',
			items: [
				{
					xtype: 'collectAssessment',
				},
			],
		},
	],
}) 