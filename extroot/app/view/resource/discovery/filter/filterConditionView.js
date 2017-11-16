Ext.define('Admin.view.resource.discovery.filter.filterConditionView', {
	extend: 'Ext.container.Container',
	xtype: 'filterConditionView',

	requires: [
		'Admin.view.resource.discovery.filter.filterConditionGridView',
		'Admin.view.resource.discovery.filter.deviceFilterFormView'
	],

	
	layout: 'card',	
	cls: 'shadow',

	items: [
	{
		xtype: 'filterConditionGridView',
		title: _('discovery filter'),
		iconCls: 'x-fa fa-circle-o'
	},
	{
		xtype: 'deviceFilterFormView',
		title: _('Add'),
		iconCls: 'x-fa fa-circle-o'	
	}]

});