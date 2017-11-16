Ext.define('Admin.view.topology.bandTopo.bandTopoView', {
    extend: 'Ext.container.Container',
    xtype: 'bandTopoView',
    viewModel: 'bandTopoView',
    controller: 'bandTopoView',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    layout: 'border',
    items: [
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
                    // background_img: 'images/topo/beida.png',
                    listeners: {
                        resize: 'onTopoShowRoot',
                        nodemousedown: 'onNodemousedown',
                        linkmousedown: 'onLinkmousedown',
                        loadcompleted: 'onLoadcompleted',
                        topocontextmenu: 'onTopocontextmenu',
                        nodecontextmenu: 'onNodecontextmenu',
                        linkcontextmenu: 'onLinkcontextmenu',
                        brushselected: 'onBrushselected',
                        linknodeselected: 'onLinknodeselected',
                        nodedblclick: 'onNodedblclick'
                    }
                },
                {
                    xtype: 'propertygrid',
                    nameColumnWidth: 120,
                    region: 'east',
                    width: 280,
                    title: _('PropertyShows'),
                    split: true,
                    layout: 'fit',
                    reference: 'topoProperties',
                    hidden: true,
                    hideHeaders: true
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    border: true,
                    items: [
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
                            disabled: true, //sec_disable('unlock_view'),
                            handler: 'onTopoUnlockView'
                        },
                        {
                            tooltip: _('Search Topology'),
                            iconCls: 'x-fa fa-binoculars',
                            handler: 'onTopoSearch'
                        },
                        '-',
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
                        '-',
                        {
                            tooltip:_('Change Layout'),
                            iconCls: 'x-fa fa-th',
                            menu: [
                                {
                                    text: _('Array-based Layout'),
                                    tooltip: _('Array-based Layout'),
                                    iconCls: 'x-fa fa-th',
                                    layout_type: 'osage',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Hierarchies Layout'),
                                    tooltip: _('Hierarchies Layout'),
                                    iconCls: 'x-fa fa-sitemap',
                                    layout_type: 'dot',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Circular Layout'),
                                    tooltip: _('Circular Layout'),
                                    iconCls: 'x-fa fa-circle-o',
                                    layout_type: 'circo',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Radial Layout'),
                                    tooltip: _('Radial Layout'),
                                    iconCls: 'x-fa fa-bullseye',
                                    layout_type: 'twopi',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Force-directed Layout'),
                                    tooltip: _('Force-directed Layout'),
                                    iconCls: 'x-fa fa-crosshairs',
                                    layout_type: 'fdp',
                                    handler: 'onTopoNewLayout'
                                },
                                {
                                    text: _('Full linked Layout'),
                                    tooltip: _('Effective when every nodes have links'),
                                    iconCls: 'x-fa fa-random',
                                    layout_type: 'neato',
                                    handler: 'onTopoNewLayout'
                                }
                            ]
                        },
                        {
                            tooltip:_('Topology Options'),
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
                                            labelWidth: 100,
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
                                            labelWidth: 100,
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
                                        columns: 1,
                                        vertical: true,
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
                                        value: 6,
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
                            iconCls:'x-fa fa-picture-o',
                            handler: 'onTopoToggleBackgroundToolbar'
                        },

                        {
                            tooltip: _('Save Layout'),
                            iconCls:'x-fa fa-save',
                            handler: 'onTopoSaveLayout'
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
                                change: 'onToggleProperties'
                            }
                        },
                        '-',
                        {
                            text:_('Refresh'),
                            tooltip:_('Refresh'),
                            iconCls:'x-fa fa-refresh',
                            //handler: 'onTopoRefresh',
                            menu: [{
                                text: _('SelfRefresh'),
                                tooltip:_('SelfRefresh'),
                                handler: 'onTopoRefresh'
                            },
                            {
                                tooltip: _('AutoRefresh'),
                                text: _('AutoRefresh'),
                                menu: [
                                    {
                                        xtype: 'radiogroup',
                                        columns: 1,	vertical: true,
                                        items: [
                                            { boxLabel: _('5 min'),  name: 'refreshTime', inputValue: 5 * 60 * 1000,margin:'0 10 0 0' },
                                            { boxLabel: _('10 min'), name: 'refreshTime', inputValue: 10 * 60 * 1000, margin:'0 10 0 0' },
                                            { boxLabel: _('15 min'),  name: 'refreshTime', inputValue: 15 * 60 * 1000, margin:'0 10 0 0', checked: true }
                                        ],
                                        listeners: {
                                            change: 'onTopoAutoRefreshTime'
                                        }
                                    }
                                ]
                            }]
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
                                    iconCls: 'x-fa fa-adjust',
                                    reference: 'topoBackgroundColorBtn',
                                    pressed: true
                                },
                                {
                                    tooltip: _('Use Background Image'),
                                    iconCls: 'x-fa fa-picture-o',
                                    reference: 'topoBackgroundImageBtn'
                                },
                                {
                                    tooltip: _('Use Background Map'),
                                    iconCls: 'x-fa fa-globe',
                                    reference: 'toggleGeographyBackgroundBtn'
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
                            handler: 'onTopoBackgroundImage'
                        },

                        {
                            tooltip: _('Set Background Color'),
                            iconCls: 'x-fa fa-gear',
                            bind: {
                                hidden: '{!topoBackgroundColorBtn.pressed}'
                            },
                            handler: 'onTopoBackgroundColor'
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
                                change: 'onToggleGeographyOperation'
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
                                change: 'onToggleSyncWithGeoMap'
                            }
                        },

                        '->',
                        {
                            tooltip: _('Locate Your Position'),
                            iconCls: 'x-fa fa-gear',
                            // handler: 'onLocationSelf',
                            hidden: true,
                            handler: 'onClickConvert'
                        },

                        {
                            xtype:'slider',
                            reference: 'topoBackgroundOpacity',
                            bind : {
                                fieldLabel: _('Background Opacity') + ' ({background_opacity}%)'
                            },
                            labelAlign: 'right',
                            labelWidth: 180,
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
                },
                //{
                //    xtype: 'toolbar',
                //    border: true,
                //    hidden: false,
                //    reference: 'topoSearchResultToolbar',
                //    items: [
                //        {
                //            xtype: 'tagfield',
                //            fieldLabel: _('搜索条件'),
                //            store: {
                //                type: 'states'
                //            },
                //            border: false,
                //            reference: 'locations',
                //            displayField: 'state',
                //            valueField: 'abbr',
                //            createNewOnEnter: true,
                //            createNewOnBlur: true,
                //            filterPickList: true,
                //            queryMode: 'local',
                //            publishes: 'value'
                //        }
                //    ]
                //}
            ]
        }
    ]
});