Ext.define('Admin.view.base.PagedGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'PagedGrid',

    newPagingbar: function () {
        return {
            xtype: 'pagingtoolbar',
            dock: this.pagingbarDock,
            // dock: 'bottom',
            border: true,
            inputItemWidth: 80,
            displayInfo: true,
            displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
            emptyMsg: _("Empty"),
            items: [
                '-',
                {
                    fieldLabel: _('Page Size'),
                    xtype: 'combobox',
                    width: 170,
                    padding: '0 0 0 5',
                    displayField: 'val',
                    valueField: 'val',
                    multiSelect: false,
                    editable: false,
                    labelWidth: APP.lang == 'zh_CN' ? 60 : 65,
                    store: Ext.create('Ext.data.Store', this.pagingbarConfig),
                    value: this.pagingbarDefaultValue,
                    listeners: {
                        change: function (me, newValue, oldValue, ops) {
                            var grid = this.up('grid');
                            Ext.apply(grid.store, { pageSize: newValue });
                            this.up('pagingtoolbar').moveFirst();
                        }
                    }
                }
            ]
        }
    },

    initComponent: function () {

        if (this.pagingbarDock == 'top') {
            if (!this.tbar) {
                this.tbar = this.newPagingbar()
            }
        } else {
            if (!this.bbar) {
                this.bbar = this.newPagingbar()
            }
        }

        this.callParent();
    }

});
