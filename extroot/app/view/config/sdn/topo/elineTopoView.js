Ext.define('Admin.view.config.sdn.topo.elineTopoView', {
	extend: 'Ext.panel.Panel',
	xtype: 'elineTopoView',
	viewModel: 'elineTopoModel',
	controller: 'elineTopoController',
	cls: 'shadow', // 指定panel边缘的阴影效果
	//layout: 'fit',// 指定布局
    requires: [
        'Ext.ux.colorpick.Selector'
    ],
    layout: 'fit',
    items: [
        {
            xtype: 'panel',
            reference: 'topoBorder',
            region: 'center',
            layout: 'border',
            height: 450,
            items: [
                {
                    xtype: 'TopoPanel',
                    //layout: 'border',
                    region: 'center',
                    reference: 'topoPanel',
                    border: false,
                    autoScroll : true,
                    // background_img: 'images/topo/beida.png',
                    listeners: {
                        // resize: 'onTopoShowRoot',
                        nodemousedown: 'onNodemousedown',
                        linkmousedown: 'onLinkmousedown',
                        loadcompleted: 'onLoadcompleted',
                        topocontextmenu: 'onTopocontextmenu',
                        nodecontextmenu: 'onNodecontextmenu',
                        linkcontextmenu: 'onLinkcontextmenu',
                        brushselected: 'onBrushselected',
                        linknodeselected: 'onLinknodeselected',
                        nodedblclick: 'onNodedblclick',
                        linkdblclick: 'onLinkdblclick'
                    }
                },
                {
                    region: 'east',
                    margin: '-3 -1 -1 0',
                    width: 280,
                    split: true,
                    hidden: true,
                    xtype: 'treepanel',
                    reference: 'propGrid',
                    title: _('Properties'),
                    rootVisible : false,
                    store :  Ext.create('Ext.data.TreeStore', {
                        fields: ['name', 'value'],
                        root: {
                            expanded: true,
                            children: []
                        }
                    }),
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
                        { dataIndex: 'value', flex:1.5, menuDisabled: true, sortable: false,
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
                    hidden: false,
                    items: [
                        {
                            xtype: 'segmentedbutton',
                            reference: 'breadcrumbeline',
                            cls: 'breadcrumb',
                            items: [{
                                text: 'Eline(1111)',
                                iconCls: 'x-fa fa-adjust',
                                pressed: true,
                                handler: 'onElineTopoClick'
                            }, {
                                text: 'PW:1112222',
                                iconCls: 'x-fa fa-adjust',
                                handler: 'onPwTopoClick'
                            }, {
                                text: 'LSP',
                                iconCls: 'x-fa fa-adjust',
                                handler: 'onLspTopoClick'
                            }],
                            listeners: {
                                toggle: 'onToggleBreadcrumbe'
                            }
                        },
                        '->',
                        {
                            tooltip: _('Go to Top Level'),
                            iconCls: 'x-fa fa-home',
                            reference: 'gotoTopoTop',
                            handler: 'onTopoGotoTopLevel'
                        },
                        {
                            tooltip: _('Go to Up Level'),
                            iconCls:'x-fa fa-arrow-up',
                            reference: 'gotoBackupTopo',
                            handler: 'onTopoGotoUpLevel'
                        },
                        {
                            tooltip: _('Zoom Out'),
                            iconCls: 'x-fa fa-search-plus',
                            handler: 'onZoomout'
                        },
                        {
                            tooltip: _('Zoom In'),
                            iconCls: 'x-fa fa-search-minus',
                            handler: 'onZoomin'
                        },
                        {
                            tooltip: _('Zoom Reset'),
                            iconCls: 'x-fa fa-undo',
                            handler: 'onZoomReset'
                        },
                        {
                            tooltip: _('Lock View'),
                            itemId : 'LockView',
                            iconCls: 'x-fa fa-lock',
                            handler: 'onTopoLockView'
                        },
                        {
                            tooltip: _('Unlock View'),
                            itemId : 'UnlockView',
                            iconCls: 'x-fa fa-unlock',
                            hidden: true,
                            handler: 'onTopoUnlockView'
                        },
                        {
                            tooltip: _('Background'),
                            iconCls:'x-fa fa-picture-o',
                            reference: 'topoBackgroundToolbar',
                            menu: [
                                {
                                    bind: {
                                        text: _('Background Opacity') + ' ({background_opacity}%)'
                                    },
                                    tooltip: _('Background Opacity'),
                                    iconCls: 'x-fa fa-adjust',
                                    menu: [
                                        {
                                            xtype:'slider',
                                            reference: 'topoBackgroundOpacity',
                                            width: 150,
                                            value: 50,
                                            //increment: 10,
                                            minValue: 0,
                                            maxValue: 100,
                                            listeners: {
                                                change: 'onChangeBackgroundTransparency'
                                            }
                                        }
                                    ]
                                },
                                '-',
                                {
                                    xtype: 'menucheckitem',
                                    text: _('Use Background Color'),
                                    tooltip: _('Use Background Color'),
                                    group: 'background',
                                    reference: 'topoBackgroundColorBtn',
                                    checked: false,
                                    hideCollapseTool: true,
                                    checkHandler: 'onCheckBackgroundSelection',
                                    menu: [
                                        {
                                            xtype: 'panel',
                                            hidden: false,
                                            items: [
                                                {
                                                    xtype: 'colorselector',
                                                    value: '#993300',  // initial selected color
                                                    listeners: {
                                                        change: 'onBackgroundColorChange'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    xtype: 'menucheckitem',
                                    text: _('Use Background Image'),
                                    tooltip: _('Use Background Image'),
                                    checked: false,
                                    group: 'background',
                                    reference: 'topoBackgroundImageBtn',
                                    checkHandler: 'onCheckBackgroundSelection'
                                },
                                {
                                    xtype: 'menucheckitem',
                                    checked: false,
                                    group: 'background',
                                    text: _('Use Background Map'),
                                    tooltip: _('Use Background Map'),
                                    checkHandler: 'onCheckBackgroundSelection',
                                    reference: 'toggleGeographyBackgroundBtn',
                                    menu: [
                                        {
                                            xtype: 'checkboxfield',
                                            boxLabel  : _('Adjust Background Map'),
                                            checked : false,
                                            reference: 'adjestGeoMap',
                                            listeners: {
                                                change: 'onToggleGeographyOperation'
                                            }
                                        },
                                        {
                                            xtype: 'checkboxfield',
                                            boxLabel  : _('Nodes Synchronize With Background'),
                                            checked : false,
                                            reference: 'syncWithGeoMap',
                                            bind: {
                                                hidden: '{!adjestGeoMap.checked}'
                                            },
                                            listeners: {
                                                change: 'onToggleSyncWithGeoMap'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tooltip:_('Change Layout'),
                            // iconCls:'topo_layout_edit_icon',
                            iconCls: 'x-fa fa-th',
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
                                    // iconCls: 'topo_layout_grid_icon',
                                    iconCls: 'x-fa fa-th',
                                    layout_type: 'osage',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Hierarchies Layout'),
                                    tooltip: _('Hierarchies Layout'),
                                    // iconCls: 'topo_layout_tree_icon',
                                    iconCls: 'x-fa fa-sitemap',
                                    layout_type: 'dot',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Circular Layout'),
                                    tooltip: _('Circular Layout'),
                                    // iconCls: 'topo_layout_lefttree_icon',
                                    iconCls: 'x-fa fa-circle-o',
                                    layout_type: 'circo',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Radial Layout'),
                                    tooltip: _('Radial Layout'),
                                    // iconCls: 'topo_layout_grid_icon',
                                    iconCls: 'x-fa fa-bullseye',
                                    layout_type: 'twopi',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Force-directed Layout'),
                                    tooltip: _('Force-directed Layout'),
                                    // iconCls: 'topo_layout_star_icon',
                                    iconCls: 'x-fa fa-crosshairs',
                                    layout_type: 'fdp',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Full linked Layout'),
                                    tooltip: _('Effective when every nodes have links'),
                                    // iconCls: 'topo_layout_bus_icon',
                                    iconCls: 'x-fa fa-random',
                                    layout_type: 'neato',
                                    handler: 'onTopoNewLayout'
                                }
                            ]
                        },
                        {
                            tooltip:_('Topology Options'),
                            // iconCls: 'adjust_slider_icon',
                            iconCls:'x-fa fa-cog',
                            listeners: {
                                menushow: 'onOptionMenushow'
                            },
                            menu: [
                                {
                                    text: _("Force-Directed Layout"),
                                    iconCls:'topo_layout_force2',
                                    menu: [
                                        {
                                            xtype: 'checkboxfield',
                                            reference: 'enable_force_layout_checkox',
                                            boxLabel  : _('Enable Force-Directed Layout'),
                                            checked : false,
                                            listeners: {
                                                change: 'onToggleForceDirectedLayout'
                                            }
                                        },
                                        {
                                            xtype:'slider',
                                            fieldLabel: _('Link Length'),
                                            labelWidth: 80,
                                            width: 200,
                                            value: 100,
                                            //increment: 10,
                                            minValue: 10,
                                            maxValue: 300,
                                            listeners: {
                                                change: 'onChangeForceDirectedLinkLength'
                                            }
                                        },
                                        {
                                            xtype:'slider',
                                            fieldLabel: _('Node Charge'),
                                            labelWidth: 80,
                                            width: 200,
                                            value: 150,
                                            //increment: 10,
                                            minValue: 50,
                                            maxValue: 1000,
                                            listeners: {
                                                change: 'onChangeForceDirectedCharge'
                                            }
                                        }]
                                },
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
                                                    listeners: {
                                                        change: 'onToggleShowNodeLabel'
                                                    }
                                                },
                                                {
                                                    boxLabel: _('Show Link Label'),
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
                                        columns: 1,	vertical: true,
                                        items: [
                                            { boxLabel: _('Small'),  name: 'v', inputValue: '24', margin:'0 10 0 0' },
                                            { boxLabel: _('Middle'), name: 'v', inputValue: '32', margin:'0 10 0 0' },
                                            { boxLabel: _('Large'),  name: 'v', inputValue: '40', margin:'0 10 0 0', checked: true }
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
                                        columns: 1,	vertical: true,
                                        items: [
                                            { width: 160, xtype:'radio', boxLabel: _('Parallel Line'), name: 'v2', inputValue: '0', margin:'0 10 0 0', checked: true },
                                            { xtype:'radio', boxLabel: _('Parallel Line (Closed)'), name: 'v2', inputValue: '1', margin:'0 10 0 0' },
                                            { xtype:'radio', boxLabel: _('Bessel Curve'), name: 'v2', inputValue: '2', margin:'0 10 0 0' }
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
                            xtype: 'button',
                            reference: 'tipButton',
                            iconCls: 'x-fa fa-question',
                            listeners: {
                                afterrender: 'onBtnAfterrender',
                                destroy: 'onBtnDestroy'
                            }
                        },
                        '->',
                        {
                            xtype: 'checkboxfield',
                            reference: 'properties_checkbox',
                            boxLabel  : _('Properties'),
                            checked   : false,
                            padding : '0 6 0 0',
                            listeners: {
                                change: 'onToggleProperties'
                            }
                        },
                        {
                            tooltip: _('Search Topology'),
                            iconCls: 'x-fa fa-search',
                            // disabled: sec_disable('search_topology'),
                            handler: 'onTopoSearch'
                        },
                        {
                            tooltip: _('Save Layout'),
                            iconCls:'x-fa fa-save',
                            handler: 'onTopoSaveLayout'
                        },
                        {
                            tooltip:_('Refresh'),
                            iconCls:'x-fa fa-refresh',
                            //handler: 'onTopoRefresh'
                            menu: [{
                                tooltip:_('SelfRefresh'),
                                text: _('SelfRefresh'),
                                handler: 'onTopoRefresh'
                            },{
                                tooltip: _('AutoRefresh'),
                                text: _('AutoRefresh'),
                                menu: [
                                    {
                                        xtype: 'radiogroup',
                                        columns: 1,
                                        vertical: true,
                                        items: [
                                            { boxLabel: _('5 min'),  name: 'refreshTime', inputValue: 5 * 60 * 1000,margin:'0 10 0 0' },
                                            { boxLabel: _('10 min'), name: 'refreshTime', inputValue: 10 * 60 * 1000, margin:'0 10 0 0' },
                                            { boxLabel: _('15 min'),  name: 'refreshTime', inputValue: 15 * 60 * 1000, margin:'0 10 0 0', checked: true }
                                        ],
                                        listeners: {
                                            change: 'onAutoRefreshTopo'
                                        }
                                    }
                                ]
                            }]
                        }
                    ]
                }
            ]
        }
    ],
    initComponent: function(){
        var me = this;
        me.callParent();
    },
    initTopo:function(eline) {
        var url = eline.id ? '/config/sdn/elinetopo/eline/' + eline.id + '?tm=' + new Date().getTime() : '';
        var topopanel = this.lookupReference('topoPanel');
        var breadcrumb = this.lookupReference('breadcrumbeline');
        var elineBreadBtn = breadcrumb.items.items[0];
        var pwBreadBtn = breadcrumb.items.items[1];
        var gotoTopBtn = this.lookupReference('gotoTopoTop');
        var gotobackBtn = this.lookupReference('gotoBackupTopo');
        var viewModel = this.getViewModel();

        gotoTopBtn.setDisabled(true);
        gotobackBtn.setDisabled(true);
        topopanel.loadJson(url);
        viewModel.set('current_eline_id',  eline.id);
        viewModel.set('current_topo_layer',  'eline');
        elineBreadBtn.setPressed(true);
        elineBreadBtn.setText('eline:' + eline.name);
        elineBreadBtn.addCls('breadcrumb-btn-background');
        pwBreadBtn.setText('pw');

        var timer = setInterval(function(){
            topopanel.loadJson(url);
        }, viewModel.get('time'));

        viewModel.set('timer',  timer);
    }
});