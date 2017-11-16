Ext.define('Admin.view.topology.main.mainView', {
    extend: 'Ext.container.Container',
    xtype: 'topoMainView',

    // ============================ Model ==============================
    viewModel: 'topoMainView',

    // ============================ Controller =========================
    controller: 'topoMainView',

    // ============================ View ===============================

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    // margin: 10,
    requires: [
    	'Admin.view.alarms.alarmcurrent.realTimeAlarmView'
    ],
    listeners: {
        render: 'onMainViewRender'
    },
    // 指定布局
    layout: 'border',
    items: [
    	{
    		xtype: 'panel',
    		region: 'center',
    		layout: 'border',
    		items: [
				{
		            region: 'west',
		            width: APP.leftMenuWidth, 
			        xtype: 'treepanel',
			        multiSelect: true,
			        reference: 'topoTree',
			        rootVisible: false,
		            split: true,
		            lines: false,
		            scrollable: true,
		        	emptyText : _('Empty'),
		        	viewConfig: {markDirty: false},
			        store : {
			        	fields : [{
			                name : 'symbol_id'
			            }, {
			                name : 'text',
			                type : 'string'
			            }],
			            autoLoad: true,
			            proxy: {
			                type: 'ajax',
			                url: '/topo/topo_tree/tree',
			                extraParams: {symbol_id: 0},
			                reader: {
			                    type: 'json'
			                }
			            }
			        },
			        dockedItems: [
			        {
			            xtype: 'toolbar',
			            items: [
						{
			                tooltip:_('Fast Search'),
			                iconCls:'x-fa fa-binoculars',
			                handler : 'onTopoToggleSearchToolbar',
			            },
			            {
			                tooltip: _('Ascending Sort'),
			                iconCls:'x-fa fa-sort-alpha-asc',
			                handler: 'onTopoTreeSortAsc'
			            },
			            {
			                tooltip: _('Descending Sort'),
			                iconCls:'x-fa fa-sort-alpha-desc',
			                handler: 'onTopoTreeSortDesc'
			            },
			            '->',
			            {
			                tooltip: _('Refresh'),
		                    iconCls:'x-fa fa-refresh',
			                handler: 'onTopoTreeRefresh'
			            }]
			        },
					{
			            xtype: 'toolbar',
						hidden: true,
				        reference: 'topoSearchToolbar',
			            items: [
			            {
			                itemId: 'func_ids',
			                xtype: 'textfield',
			                name: 'func_ids',
			                flex: 1
			            },
						{
			                tooltip:_('Start Searching'),
			                // iconCls:'topo_search_button',
			                iconCls: 'x-fa fa-binoculars',
			                handler: 'onTopoTreeStartSearch',
			            }]
			        }],

				    listeners: {
				    	load: 'onTopoTreeLoaded',
				        selectionchange: 'onTopoTreeSelectionChange',
				        beforeitemexpand: 'onBeforeItemExpand',
				        beforeitemcollapse: 'onBeforeItemCollapse',
				        itemcontextmenu: 'onTopoTreeItemContextMenu'
				    },
			    },

		        {
		            xtype: 'panel',
			        reference: 'topoBorder',
		            region: 'center',
		            layout: 'border',
		            items: [ 
			            {
					    	xtype: 'TopoPanel',
					    	layout: 'border',
					        region: 'center',
					        reference: 'topoPanel',
					        border: false,
							autoScroll : true,
						    listeners: {
						        loadcompleted: 'onLoadcompleted',
						        nodemousedown: 'onNodemousedown',
						        linkmousedown: 'onLinkmousedown',
						        topocontextmenu: 'onTopocontextmenu',
						        nodecontextmenu: 'onNodecontextmenu',
						        linkcontextmenu: 'onLinkcontextmenu',
						        brushselected: 'onBrushselected',
						        linknodeselected: 'onLinknodeselected',
						        nodedblclick: 'onNodedblclick',
						    },
			            },
			            {
			                region: 'east',
			            	margin: '-3 -1 -1 0',
			                width: 280,
			                split: true,
			                hidden: true,
		                	xtype: 'treepanel',
					        reference: 'topoProperties',
					        title: _('Properties'),
							rootVisible : false,
							store : {
								fields: [
									{name: 'name', type: 'string'},
									{name: 'value', type: 'string'}
								],
								proxy: {
									type: 'ajax',
									url: '/topo/topo_nodeorlink_info/get_nodeorlink_properties',
									extraParams: {symbol_id: 0},
									reader: {
										type: 'json',
										rootProperty : 'children'
									}
								},
								autoLoad: true
							},
							lines : false,
							columnLines : true,
							rowLines : true,
							containerScroll : true,
							emptyText : _('Empty'),
							columns: [
								{  xtype : 'treecolumn', dataIndex: 'name', width:170, menuDisabled: true, sortable: false, 
									renderer: function getColor(v,m,r){
										if(!r.data.leaf) {
											m.tdCls = 'light_gray';
										} 
										return v;
								}},
								{ dataIndex: 'value', flex:1, menuDisabled: true, sortable: false,
									renderer: function getColor(v,m,r){
										if(!r.data.leaf) {
											m.tdCls = 'light_gray';
										} 
										return v;
									} }
							]
						}
			        ],

			        dockedItems: [
			        {
			            xtype: 'toolbar',
			            border: true,
				        items: [
							{
								itemId: 'topo_view_top',
								tooltip: _('Go to Top Level'),
								iconCls: 'x-fa fa-home',
								disabled: true,
								hidden: SEC.hidden('040101'),
								handler: 'onTopoGotoTopLevel',
							},
							{
								itemId: 'topo_view_up',
								tooltip: _('Go to Up Level'),
			                    iconCls:'x-fa fa-arrow-up',
								disabled: true,
								hidden: SEC.hidden('040102'),
								handler: 'onTopoGotoUpLevel',
							},
							'-',
							{
				                tooltip: _('Add'),
			                    iconCls:'x-fa fa-plus',
								menu: [
									{
										text: _('Add Device'),
										tooltip: _('Add Device'),
					                    iconCls: 'icon-router',
										// disabled: true,
										hidden: SEC.hidden('040103'),
										handler: 'onTopoAddDevice',
									},
									{
										text: _('Add Symbol'),
										tooltip: _('Add Symbol'),
					                    iconCls: 'icon-factory',
										// disabled: sec_disable('add_symbol'),
										hidden: SEC.hidden('040104'),
										handler: 'onTopoAddSymbol',
									},
									{
										text: _('Add Subnet'),
										tooltip: _('Add Subnet'),
					                    iconCls: 'icon-cloud-symbol-inside-a-circle',
										// disabled: sec_disable('add_subnet'),
										hidden: SEC.hidden('040105'),
										handler: 'onTopoAddSubnet',
									},
									{
										text: _('Add Link'),
										tooltip: _('Add Link'),
					                    iconCls: 'icon-circular-double-sided-repair-tool',
										// disabled: sec_disable('add_link'),
										hidden: SEC.hidden('040106'),
										handler: 'onTopoAddLink',
									}
								]
				            },
							{
								tooltip: _('Edit Properties'),
								itemId: 'topo_node_edit_properties',
			                    iconCls: 'x-fa fa-edit',
								// disabled: sec_disable('edit_properties'),
								disabled: true,
								hidden: SEC.hidden('040107'),
								handler: 'onTopoEdit',
							},
							{
								tooltip: _('Move'),
								itemId: 'topo_node_moveto',
								iconCls: 'icon-maximize',
								// disabled: sec_disable('moveto_subnet'),
								disabled: true,
								hidden: SEC.hidden('040108'),
								handler: 'onNodeMoveto',
							},
							{
								tooltip: _('Delete'),
								itemId: 'topo_node_delete',
								iconCls: 'x-fa fa-trash',
								// disabled: sec_disable('delete_node_and_link'),
								disabled: true,
								hidden: SEC.hidden('040109'),
								handler: 'onTopoDelete',
							},
							{
								tooltip: _('Lock View'),
								itemId : 'LockView',
								iconCls: 'x-fa fa-lock',
								// disabled: sec_disable('lock_view'),
								hidden: SEC.hidden('040110'),
								handler: 'onTopoLockView',
							},
							{
								tooltip: _('Unlock View'),
								itemId : 'UnlockView',
								iconCls: 'x-fa fa-unlock',
								disabled: true, 
								hidden: SEC.hidden('040111'),
								handler: 'onTopoUnlockView',
							},
							{
								tooltip: _('Search Topology'),
								iconCls: 'x-fa fa-binoculars',
								// disabled: sec_disable('search_topology'),
								hidden: SEC.hidden('040112'),
								handler: 'onTopoSearch',
							},
							'-',
							{
								tooltip: _('Zoom Out'),
								// iconCls: 'topo_zoomout_icon',
								iconCls: 'x-fa fa-search-plus',
								disabled: SEC.disable('040113'),
								handler: 'onZoomout',
							},
							{
								tooltip: _('Zoom In'),
								// iconCls: 'topo_zoomin_icon',
								iconCls: 'x-fa fa-search-minus',
								hidden: SEC.hidden('040114'),
								handler: 'onZoomin',
							},
							{
								tooltip: _('Zoom Reset'),
								// iconCls: 'topo_zoomreset_icon',
								iconCls: 'x-fa fa-undo',
								hidden: SEC.hidden('040115'),
								handler: 'onZoomReset',
							},
							// {
							// 	tooltip: _('Zoom Fit'),
							// 	iconCls: 'topo_zoomfit_icon',
								// iconCls: 'x-fa fa-arrows',
							// 	handler: 'onZoomFit',
							// },
							'-',
							{
				                tooltip:_('Change Layout'),
								iconCls: 'x-fa fa-th',
								hidden: SEC.hidden('040116'),
								menu: [
									// dot − filter for drawing directed graphs
									// neato − filter for drawing undirected graphs
									// twopi − filter for radial layouts of graphs
									// circo − filter for circular layout of graphs
									// fdp − filter for drawing undirected graphs
									// osage − filter for array-based layouts
									
									{
										text: _('Array-based Layout'),
										tooltip: _('Array-based Layout'),
										iconCls: 'x-fa fa-th',
										layout_type: 'osage',
										reference: 'osage',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Hierarchies Layout'),
										tooltip: _('Hierarchies Layout'),
										iconCls: 'x-fa fa-sitemap',
										layout_type: 'dot',
										reference: 'dot',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Circular Layout'),
										tooltip: _('Circular Layout'),
										iconCls: 'icon-circle-layout',
										layout_type: 'circo',
										reference: 'circo',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Radial Layout'),
										tooltip: _('Radial Layout'),
										iconCls: 'x-fa fa-bullseye',
										layout_type: 'twopi',
										reference: 'twopi',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Force-directed Layout'),
										tooltip: _('Force-directed Layout'),
										iconCls: 'icon-scheme',
										layout_type: 'fdp',
										reference: 'fdp',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Full linked Layout'),
										tooltip: _('Effective when every nodes have links'),
										iconCls: 'icon-connected',
										layout_type: 'neato',
										reference: 'neato',
										handler: 'onTopoNewLayout',
									},
									'-',
									{
										text: _("Force-Directed Layout"),
						                iconCls:'topo_layout_force2',
										menu: [
										{
											xtype: 'checkboxfield',
											reference: 'enable_force_layout_checkox',
						                    boxLabel  : _('Enable Force-Directed Layout'),
						                    checked : !(Ext.util.Cookies.get("ForceDirectedLayout") == undefined ? 'checked' : Ext.util.Cookies.get("ForceDirectedLayout")),
						    			    listeners: {
						    			    	change: 'onToggleForceDirectedLayout',
						    				}
						                },
										{
											xtype:'slider',
											reference: 'force_directed_link_slider',
											fieldLabel: _('Link Length'),
											labelWidth: 80,
										    width: 200,
										    value: (Ext.util.Cookies.get("ForceDirectedLinkLength") == undefined ? 100 : Ext.util.Cookies.get("ForceDirectedLinkLength")),
										    //increment: 10,
										    minValue: 10,
										    maxValue: 300,
						    			    listeners: {
						    			    	change: 'onChangeForceDirectedLinkLength',
						    				}
										},
										{
											xtype:'slider',
											reference: 'force_directed_charge_slider',
											fieldLabel: _('Node Charge'),
											labelWidth: 80,
										    width: 200,
										    value: (Ext.util.Cookies.get("ForceDirectedCharge") == undefined ? 150 : Ext.util.Cookies.get("ForceDirectedCharge")),
										    //increment: 10,
										    minValue: 50,
										    maxValue: 1000,
						    			    listeners: {
						    			    	change: 'onChangeForceDirectedCharge',
						    				}
										}]
						            }
								]
							},
							{
				                tooltip:_('Topology Options'),
			                    iconCls:'x-fa fa-cog',
			                    hidden: SEC.hidden('040117'),
			    			    listeners: {
			    			    	menushow: 'onOptionMenushow',
			    				},
								menu: [
									
									{
										text: _("Label"),
										iconCls: 'check_box_list_icon',
										menu: [
										{
									        xtype: 'checkboxgroup',
									        columns: 1,	
									        vertical: true,
									        items: [
									        { 
								            	boxLabel: _('Show Node Label'), checked: true,
								            	reference: 'show_node',
							    			    listeners: {
							    			    	change: 'onToggleShowNodeLabel'
							    				}
								        	},
								            { 
								            	boxLabel: _('Show Link Label'),
								            	reference: 'show_link',
							    			    listeners: {
							    			    	change:  'onToggleShowLinkLabel'
							    				}
								        	}]
									    }]
						            },
									{
										text: _("Node Size"),
										iconCls: 'node_size_select_icon',
										menu: [{
									        xtype: 'radiogroup',
									        reference: 'node_size_select',
									        columns: 1,	vertical: true,
									        items: [
									            { boxLabel: _('Small'),  name: 'v', reference:'node_size_small', inputValue: '24', margin:'0 10 0 0' },
									            { boxLabel: _('Middle'), name: 'v', reference:'node_size_Middle', inputValue: '32', margin:'0 10 0 0' },
									            { boxLabel: _('Large'),  name: 'v', reference:'node_size_Large', inputValue: '40', margin:'0 10 0 0', checked: true },
									            { boxLabel: _('超大'),  name: 'v', reference:'node_size_moreLsarge', inputValue: '48', margin:'0 10 0 0'},
									            { boxLabel: _('特大'),  name: 'v', reference:'node_size_veryLarge', inputValue: '56', margin:'0 10 0 0'}
									        ],
						    			    listeners: {
						    			    	change: 'onTopoSelectNodeSize'
						    				}
									    }]
						            },
									{
										text: _("Multi Link Style"),
										reference: 'multi_link_style_menu',
										iconCls: 'multilink_style_icon',
										menu: [{
									        xtype: 'radiogroup',
									        reference: 'multilink_style_select',
									        columns: 1,	vertical: true,
									        items: [
									            { width: 160,
									              xtype:'radio', reference:'multilink_style_Line', boxLabel: _('Parallel Line'), name: 'v2', inputValue: '0', margin:'0 10 0 0', checked: true },
									            { xtype:'radio', reference:'multilink_style_Line_closed', boxLabel: _('Parallel Line (Closed)'), name: 'v2', inputValue: '1', margin:'0 10 0 0' },
									            { xtype:'radio', reference:'multilink_style_curve', boxLabel: _('Bessel Curve'), name: 'v2', inputValue: '2', margin:'0 10 0 0' }
									        ]
									        ,
						    			    listeners: {
						    			    	change: 'onTopoSelectParallelLinkStyle'
						    				}
									    }]
						            },
									{
										text: _("Parallel Line Space"),
										reference: 'parallel_line_space_menu',
										iconCls: 'line_spacing_icon',
										menu: [{
											xtype:'slider',
											reference: 'line_spacing_slider',
											// fieldLabel: _('Line Space'),
											// labelWidth: 80,
										    // width: 250,
										    value: 6,
										    //increment: 10,
										    minValue: 3,
										    maxValue: 32,
						    			    listeners: {
						    			    	change: 'onChangeParallelLineSpace'
						    				}
										}]
						            }
								]
							},

							{
								tooltip: _('Background'),
			                    iconCls:'icon-street-map',
			                    hidden: SEC.hidden('040118'),
								handler: 'onTopoToggleBackgroundToolbar',
							},

							{
								tooltip: _('Save Layout'),
			                    iconCls:'x-fa fa-save',
			                    hidden: SEC.hidden('040119'),
								handler: 'onTopoSaveLayout',
							},

							'->',
							{
								xtype: 'checkboxfield',
								reference: 'properties_checkbox',
				                boxLabel  : _('Properties'),
				                checked   : false,
				                //checked   : true,
				                padding : '0 6 0 0',
				                listeners: {
									change: 'onToggleProperties',
								}
							},		            
							{
								xtype: 'checkboxfield',
								boxLabel  : _('Alarms'),
								checked   : false,
								padding : '0 6 0 0',
								listeners: {
									change: 'onToggleAlarm',
								}
							},		            
							'-',
							{
				                text:_('Refresh'),
				                tooltip:_('Refresh'),
				                hidden: SEC.hidden('040126'),
			                    iconCls:'x-fa fa-refresh',
								handler: 'onTopoRefresh',
				            }
				        ]
				    },
			        {
			            xtype: 'toolbar',
			            border: true,
						hidden: true,
				        reference: 'topoBackgroundToolbar',
				        items: [
					        {
					            xtype: 'segmentedbutton',
					            items: [
									{
										tooltip: _('Use Background Color'),
										iconCls: 'icon-painter-palette',
								        reference: 'topoBackgroundColorBtn',
						                pressed: true,
									},
									{
										tooltip: _('Use Background Image'),
										iconCls: 'x-fa fa-picture-o',
								        reference: 'topoBackgroundImageBtn',
									},
									{
										tooltip: _('Use Background Map'),
										iconCls: 'icon-street-map',
								        reference: 'toggleGeographyBackgroundBtn',
									}
					            ],
			    			    listeners: {
			    			    	toggle: 'onChangeBackgroundSelection'
			    				}
					        },

							{
								tooltip: _('Set Background Image'),
								iconCls: 'x-fa fa-gear',
			                    bind: {
			                    	hidden: '{!topoBackgroundImageBtn.pressed}'
			                    },
								handler: 'onTopoBackgroundImage',
							},

							{
								tooltip: _('Set Background Color'),
								iconCls: 'x-fa fa-gear',
			                    bind: {
			                    	hidden: '{!topoBackgroundColorBtn.pressed}'
			                    },
								handler: 'onTopoBackgroundColor',
							},

							{
								xtype: 'checkboxfield',
			                    boxLabel  : _('Adjust Background Map'),
			                    checked : false,
						        reference: 'adjestGeoMap',
			                    bind: {
			                    	hidden: '{!toggleGeographyBackgroundBtn.pressed}'
			                    },
			    			    listeners: {
			    			    	change: 'onToggleGeographyOperation',
			    				}
			                },

							{
								xtype: 'checkboxfield',
			                    boxLabel  : _('Nodes Synchronize With Background'),
			                    checked : false,
						        reference: 'syncWithGeoMap',
			                    bind: {
			                    	hidden: '{!adjestGeoMap.checked || !toggleGeographyBackgroundBtn.pressed}'
			                    },
			    			    listeners: {
			    			    	change: 'onToggleSyncWithGeoMap',
			    				}
			                },

							'->',
							{
								tooltip: _('Locate Your Position'),
								iconCls: 'x-fa fa-gear',
								// handler: 'onLocationSelf',
								hidden: true,
								handler: 'onClickConvert',
							},

							{
								xtype:'slider',
								reference: 'topoBackgroundOpacity',
								bind : {
									fieldLabel: _('Background Opacity') + ' ({background_opacity}%)',
								},
								labelAlign: 'right',
								labelWidth: 150,
							    width: 300,
							    value: 50,
							    //increment: 10,
							    minValue: 0,
							    maxValue: 100,
			    			    listeners: {
			    			    	change: 'onChangeBackgroundTransparency'
			    				}
							}

				        ]
			    	}]

			    }
    		]
    	},
    	{
    		xtype: 'realTimeAlarmView',
    		reference: 'topoAlarm',
            region: 'south',
            layout: 'fit',
            border : false,
            margin: '0 -1 -1 -1',
            height: 180,                
            split: true,
            hidden: true

    	},

        {
            xtype: 'TermPanel',
            hidden: true,
            reference: 'termPanel',
        }
	],

});
