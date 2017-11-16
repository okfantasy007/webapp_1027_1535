Ext.define('Admin.view.alarms.alarmfilter.alarmTimeNeFilterView', {
    extend: 'Ext.container.Container',
    xtype: 'alarmTimeNeFilterView',
    requires: ['Admin.view.base.PagedGrid',
    //'Admin.view.alarms.alarmTypeMenu'
    ],
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            nelist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTimeNes',
                    actionMethods: {
                        read: 'POST',
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            }
           
        }
    },

    controller: {

      
        onQuery: function() {
            var grid = this.getView().down('PagedGrid');
            var view = this.getView();
			var name = this.getView().down('form').down('textfield').getValue();
            grid.getStore().proxy.url = 'alarm/alarmResource/getTimeNes';
            grid.getStore().proxy.extraParams = {name:name};
            grid.getStore().reload();
        },
        
        onReset: function() {
			var form = this.getView().down('form');
            form.getForm().reset();
        },

    },

    items: [
		{
		 xtype: 'form',
		 items:[
		 {
			xtype: 'fieldset',
			title: _('Query Condition'),
			layout: 'hbox',
			fieldDefaults : {
				labelAlign : 'right',
				labelWidth : 150
				},
			items: [
			{
			 xtype: 'textfield',
             fieldLabel: _('NeName'),
             name: 'name'
			},
			{
                text: _('Query'),
				xtype:'button',
				iconCls: 'x-fa fa-search',
                handler: 'onQuery'
            },
			{
                text: _('Reset'),
				xtype:'button',
                iconCls:'x-fa fa-undo',
				handler: 'onReset'
            }
			]
		 }
		 ]
	},
    {
        title: _('Ne'),
        header: false,
        iconCls: 'x-fa fa-circle-o',
        xtype: 'PagedGrid',
		autoScroll:true,
        // border: false,
		height:600,
        reference: 'alarmGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{nelist_remote}',
        },

        selType: 'checkboxmodel',

        // grid显示字段
        columns: [{
            xtype: 'rownumberer',
            width: 60,
            sortable: false,
            align: 'center'
        },
        {
            text: _('neId'),
            dataIndex: 'neId',
			
        },
        {
            text: _('NE Name'),
            dataIndex: 'neName',
			flex:1
        },
        {
            text: _('neType'),
            dataIndex: 'neType',
			width:150
          
        },
        {
            text: _('IP Adress'),
            dataIndex: 'ipaddress',
			width:200
           
        }],
		 pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 15,
        // 分页策略
        pagingbarConfig: {
            fields: [{
                name: 'val',
                type: 'int'
            }],
            data: [{
                val: 15
            },
            {
                val: 30
            },
            {
                val: 60
            },
            {
                val: 100
            },
            {
                val: 200
            },
            {
                val: 500
            },
            {
                val: 1000
            },
            {
                val: 2000
            },
            ]
        }
   

    }
	
	]

});