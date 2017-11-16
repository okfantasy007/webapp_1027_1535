/**
* 拓扑搜索功能
* author:liulj
* 2017/07/28
*/
Ext.define('Admin.view.topology.main.topoSearchPopWin', {
    extend: 'Ext.window.Window',
    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'topoSearchPopWin',
    topopanel: null,
    devicetree: null,
    height: 500,
    width: 750,
    title:  _('Topology Search'),
    // scrollable: true,
    // bodyPadding: 10,
    // closable: false
    constrain: true,
    modal: true,
    layout : {
		type : 'vbox',
		align : 'stretch',
		pack : 'start'
	},
    viewModel: {
    	data: {
            // 查找内容是否发生改变，若发生改变，点击‘查找下一个’,grid数据重新加载；反之，选中下一条记录
			searchContentChange: false,
			// grid中当前选中行的索引
			searchIndex: 0,
			// 是否触发‘查找下一条’
			triggerSearchNext: false
        },
        stores: {
            // 远程store
            devicelist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    extraParams: {search_content: ''},
                    url: '/topo/topo_map/search_condition_topo_info',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total'
                    }
                },
				sorters : [{
					property : 'symbol_id',
					direction : 'ASC'
				}],
				listeners: {
		            load: 'onLoad'
		        }
            },
            searchstore: {
				fields : ['value', 'text'],
				data : [['0', _('NE Name')],
						['1', _('Device Name')],
						['2', _('IP Address')],
						['3', _('Mac Address')]
						// ['4', _('Serial No.')]
						// ['5', _('Customer Name')]
						]
			}
        }
    },

    controller: {
		onLoad : function(_s, _op, _e) {
			var grid = this.lookupReference('toponodegrid');
			var model = grid.getSelectionModel();
			if (grid.getStore().count() > 0) {
				// 默认grid第一条记录处于选择状态
				model.select(0, true);// select first row
			} else {
				// 搜索结果没有记录时弹提示信息
				if (this.getViewModel().get('triggerSearchNext')) {
					this.getViewModel().set('triggerSearchNext', false);
					Ext.Msg.alert(_('Tips'), _('No matching results, please modify the search condition and search again!'));
				}
			}			        
		},
    	onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            // 双击搜索结果记录，拓扑树节点选择、拓扑图绘制
            var popwin = this.getView();
			var node = popwin.devicetree.store.getNodeById( record.id );
			if (node == null) {
				var map_hierarchy=record.data.map_hierarchy.split(',');
				var index=map_hierarchy.length-3;
				for(var i=1;i<=index;i++){
					var parent_id=map_hierarchy[i];
	    			var parent_node = popwin.devicetree.store.getNodeById( parent_id );
	    			if(parent_node!=null){
	    				popwin.devicetree.expandNode(parent_node);
	    			}else{
	    				var id= map_hierarchy[i-1];
	    				var node=popwin.devicetree.store.getNodeById( id );
	    				Ext.Ajax.request({
	    					async: false, 
			        		url: '/topo/topo_tree/tree?symbol_id=' + id,
							success: function(response){
								var r=Ext.decode(response.responseText).children;
								for(var i=0;i<r.length;i++){
									node.appendChild(r[i]);
								}
								if(!node.lastChild.isLeaf()){
			                        node.lastChild.triggerUIUpdate();
			                    }
			                    parent_node = popwin.devicetree.store.getNodeById( parent_id );
				    			if(parent_node!=null){
				    				popwin.devicetree.expandNode(parent_node);
				    			}
							}
			        	});
	    			}
				}
				popwin.topopanel.selectedNodes = [record.id];
				// 绘制拓扑图
				popwin.topopanel.loadJson('/topo/topo_map/map?symbol_id='+ record.id + '&tm=' + new Date().getTime() );
			} else {
				popwin.devicetree.selectPath(node.getPath());
				// popwin.devicetree.getSelectionModel().select( node );
			}
        },

        onViewRefresh: function() {
            var grid = this.lookupReference('toponodegrid');
            grid.getStore().reload();
        },
        onCloseWindow: function() {
            this.getView().destroy();
        },

        onChangeCombox: function(me, newValue, oldValue, ops) {
        	var form = this.lookupReference('toponodeform');
			form.getForm().setValues({search_content: ''});
		},
		onSubmit: function() {
			var popwin = this.getView();
			var viewModel = this.getViewModel();
			viewModel.set('triggerSearchNext', true);
			var grid_obj = this.lookupReference('toponodegrid');
			var form = this.lookupReference('toponodeform');
			// 查找内容发生改变，点击‘查找下一个’按钮，grid重新load数据；
			// 反之，指向grid的下一条记录
			// 拓扑树节点重新定位，拓扑图重新绘制
			if (viewModel.get('searchContentChange') || grid_obj.getStore().count() == 0) {
				viewModel.set('searchContentChange', false);
				viewModel.set('searchIndex', 0);
				
				grid_obj.store.proxy.extraParams = form.getForm().getValues();
				grid_obj.store.reload();
			} else {
				viewModel.set('searchIndex', viewModel.get('searchIndex')+1);
				var model = grid_obj.getSelectionModel();
				if (grid_obj.getStore().count() > 0) {
					// 选择的记录到最后一条记录时弹提示信息
					if (grid_obj.getStore().count() == this.searchIndex) {
						Ext.Msg.alert(_('Tips'), _('Search is finished!'));
						viewModel.set('searchIndex', 0);
					}
					model.select(viewModel.get('searchIndex'), true); // select row
				}
			}
			
			var selModel = grid_obj.getSelectionModel();
			if(selModel.hasSelection()){ // 如果存在选中行
				var record = selModel.getSelection()[0];
				var id = parseInt(record.data.symbol_id);
				var node = popwin.devicetree.store.getNodeById(id);
				if (node == null) {
					popwin.topopanel.selectedNodes = [id];
					// 绘制拓扑图
					popwin.topopanel.loadJson('/topo/topo_map/map?symbol_id='+ id + '&tm=' + new Date().getTime() );
				} else {
					popwin.devicetree.selectPath(node.getPath());
					// popwin.devicetree.getSelectionModel().select( node );
				}
			}
		},

		onChangeTextfield: function(me, newValue, oldValue, ops){
			var form = this.lookupReference('toponodeform');
			this.getViewModel().set('searchContentChange', true);

			if (newValue == '') {
				form.down('#search_next').setDisabled(true);
			} else {
				form.down('#search_next').setDisabled(false);
			}
		},

		onChangeRadiogroup: function(me, newValue, oldValue, ops){
			var viewModel = this.getViewModel();
			viewModel.set('searchContentChange', true);
		}
    },

    items: [
    	 {
            xtype: 'form',
            reference: 'toponodeform',
            border : false,
			autoWidth : true,
			autoHeight : true,
			frame : true,
			// autoScroll : true,
			// bodyPadding : '5 3 5 3',
			layout : {
				type : 'table',
				columns : 2
			},
			labelAlign : 'left',
			defaultType : 'textfield',
			fieldDefaults : {
				width : 300,
				labelWidth : 60,
				labelAlign : "left",
				margin : 2
			},

            items: [
                {
					xtype : "combo",
					fieldLabel : _('Search category'),
					name : 'search_category',
					bind: {
			            store: '{searchstore}'
			        },
					displayField : 'text',
					valueField : 'value',
					value : '0',
					mode : 'local',
					editable : false,
					listeners: {
						change: 'onChangeCombox'
					}
				},{
					xtype: 'button',
					itemId: 'search_next',
					iconCls:'search_next_btn',
					width : 120,
					text:_('Find next'),// '查找子网',
					margin: 2,
					disabled: true,
					handler: 'onSubmit'
				}, 
				{
					xtype : 'textfield',
					fieldLabel : _('Search content'),
					name : 'search_content',
					value : '',
					listeners: {
						change: 'onChangeTextfield'
					}
				}, {
					xtype: 'button',
					text: _('Cancel'),
					width : 120,
					margin: 2,
					handler: 'onCloseWindow'
				}, {
					xtype   : 'radiogroup',
		            defaults: {
		                flex: 1
		            },
		            layout: 'hbox',
		            items: [
		                {
		                    boxLabel  : _('Perfect Match'),
		                    name      : 'condition',
		                    inputValue : '1' 
		                }, {
		                    boxLabel  : _('Contain'),
		                    name      : 'condition',
		                    inputValue : '2',
		                    checked   :  true
		                }],
		             listeners: {
						change: 'onChangeRadiogroup'
					}
				}
            ]
        },
    	{
	        xtype: 'PagedGrid',
	        reference: 'toponodegrid',
	        // 绑定到viewModel的属性
	        bind: {
	            store: '{devicelist_remote}',
	        },
	        columnLines : true,
			rowLines : true,
			flex : 1,
			layout : 'fit',
			border : false,
			// split : true,
			emptyText : _('Empty'),
	        // grid显示字段
	        columns: [
	            // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
	            { xtype : 'rownumberer', width : 60, align : 'center' }, 
	            { text : _('Symbol ID'), dataIndex : 'symbol_id', menuDisabled : true, width : 80 }, 
	            { text : _('Node Name'), dataIndex : 'symbol_name1', menuDisabled : true, width : 110 }, 
	            { text : _('Device Name'), dataIndex : 'symbol_name2', menuDisabled : true, width : 110 }, 
	            { text : _('IP Address'), dataIndex : 'symbol_name3', menuDisabled : true, width : 110 }, 
	            { text : _('Net Name'), dataIndex : 'map_parent_name', menuDisabled : true, width : 110 }, 
	            { text : _('Mac Address'), dataIndex : 'macaddress', menuDisabled : true, flex : 1 }
	        ],

	        // 分页工具条位置
	        pagingbarDock: 'top',
	        // 默认每页记录数
	        pagingbarDefaultValue: 15,
	        // 分页策略
	        pagingbarConfig: {
	            fields: [{name: 'val', type: 'int'}],
	            data: [
	                {val: 15},
	                {val: 30},
	                {val: 60},
	                {val: 100},
	                {val: 200},
	                {val: 500},
	                {val: 1000},
	                {val: 2000}
	            ]
	        },

	        // 自定义工具条
	        dockedItems: [{
	            xtype: 'toolbar',
	            dock: 'top',
	            items: [
	                '->',
	                {
	                    text: _('Refresh'),
	                    iconCls:'x-fa fa-refresh',
	                    handler: 'onViewRefresh'
	                }
	            ]
	        }],

	        listeners: {
	            itemdblclick: 'onItemDoubleClick'
	        },
            bbar:[
                '->',
                {
                    text: _('Close'),
                    iconCls:'x-fa fa-times',
                    handler: 'onCloseWindow'
                }
            ]
	    }
    ]
});