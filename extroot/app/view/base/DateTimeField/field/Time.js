Ext.define('Admin.view.base.DateTimeField.field.Time', {
	extend: 'Ext.form.field.Date',
	xtype: 'timeSelectfield',
	requires: ['Admin.view.base.DateTimeField.picker.DateTime'],

	initComponent: function () {
		this.format = this.format;
		this.callParent();
	},
	format: 'H:i:s',
	createPicker: function () {
		var me = this,
			format = Ext.String.format;
		return Ext.create('Admin.view.base.DateTimeField.picker.DateTime', {
			ownerCt: me.ownerCt,
			//                  renderTo: document.body,
			floating: true,
			//                  hidden: true,
			focusOnShow: true,
			minDate: me.minValue,
			maxDate: me.maxValue,
			disabledDatesRE: me.disabledDatesRE,
			disabledDatesText: me.disabledDatesText,
			disabledDays: me.disabledDays,
			disabledDaysText: me.disabledDaysText,
			format: me.format,
			showToday: me.showToday,
			startDay: me.startDay,
			minText: format(me.minText, me.formatDate(me.minValue)),
			maxText: format(me.maxText, me.formatDate(me.maxValue)),
			listeners: {
				scope: me,
				select: me.onSelect
			},
			keyNavConfig: {
				esc: function () {
					me.collapse();
				}
			}
		});
	},

	onExpand: function () {
		var value = this.rawDate;
		this.picker.setValue(Ext.isDate(value) ? value : new Date(), true);
	}
})
