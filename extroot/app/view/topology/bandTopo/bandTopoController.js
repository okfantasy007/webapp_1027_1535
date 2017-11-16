Ext.define('Admin.view.topology.bandTopo.bandTopoController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.bandTopoView',
    requires: [
        'Ext.ux.colorpick.Selector',
        'Admin.view.topology.main.topoSearchPopWin',
        'Admin.view.base.TermPanel'
    ],

    timer: null,
    time: 6000 * 1000,
    layout: 'circo',

    // ===================================== Topo Panel ==========================================

    onTopoShowRoot: function() {
        var flag = this.getView().getViewModel().get('resize_reload_flag');
        if (flag) {
            this.onTopoAutoRefresh('/topo/band/');
            this.getView().getViewModel().set('resize_reload_flag', false);
        }
    },

    onLoadcompleted: function(s) {
        this.initBackgroundInfo();
    },

    onBrushselected: function(s, node, link, x, y){
        var me = this;
        var panel = this.lookupReference('topoPanel');
        var nodeids = [];
        var existSelectLink = false;
        var existSelectNode = false;

        node.each(function(d){
            if (d.selected) {
                existSelectNode = true;
                nodeids.push(d);
            }
        });

        link.each(function(d){
            if (d.selected) {
                existSelectLink = true;
            }
        });

        if (!existSelectNode && !existSelectLink) {
            me.onNodeProperties();
        }
    },

    onTopocontextmenu: function(me, x, y){
        var topopanel = this.lookupReference('topoPanel');
        var rightMenu=new Ext.menu.Menu({
            items:[
                {
                    text: _('Search Topology'),
                    iconCls: 'x-fa fa-binoculars',
                    handler: 'search_topo'
                },
                {
                    text:_('Change Layout'),
                    iconCls:'x-fa fa-th',
                    menu: [
                        {
                            text: _('Array-based Layout'),
                            tooltip: _('Array-based Layout'),
                            iconCls: 'x-fa fa-th',
                            layout_type: 'osage',
                            handler: 'onTopoNewLayout',
                        },
                        {
                            text: _('Hierarchies Layout'),
                            tooltip: _('Hierarchies Layout'),
                            iconCls: 'x-fa fa-sitemap',
                            layout_type: 'dot',
                            handler: 'onTopoNewLayout',
                        },
                        {
                            text: _('Circular Layout'),
                            tooltip: _('Circular Layout'),
                            iconCls: 'x-fa fa-circle-o',
                            layout_type: 'circo',
                            handler: 'onTopoNewLayout',
                        },
                        {
                            text: _('Radial Layout'),
                            tooltip: _('Radial Layout'),
                            iconCls: 'x-fa fa-bullseye',
                            layout_type: 'twopi',
                            handler: 'onTopoNewLayout',
                        },
                        {
                            text: _('Force-directed Layout'),
                            tooltip: _('Force-directed Layout'),
                            iconCls: 'x-fa fa-crosshairs',
                            layout_type: 'fdp',
                            handler: 'onTopoNewLayout',
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
                    text: _('Save Layout'),
                    iconCls: 'x-fa fa-save',
                    handler: 'onTopoSaveLayout'
                },
                {
                    text:_('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: function() {
                        topopanel.reloadTopo();
                    }
                }
            ]
        });

        me.add(rightMenu);
        // rightMenu.render(panel.div);
        rightMenu.showAt(x, y);
    },

    onNodecontextmenu: function(s, node, x, y){
        var me = this;
        var topopanel = this.lookupReference('topoPanel');

        var rightMenu=new Ext.menu.Menu({
            items:[
                {
                    text: _('View Properties'),
                    iconCls: 'x-fa fa-file-text-o',
                    handler: function(){
                        me.lookupNodeProperties(node);
                    }
                }
            ]
        });

        topopanel.add(rightMenu);
        rightMenu.showAt(x, y);
    },

    onLinkcontextmenu: function(topopanel, link, x, y){
        var me = this;
        var rightMenu=new Ext.menu.Menu({
            items:[
                {
                    text: _('View Properties'),
                    iconCls: 'x-fa fa-file-text-o',
                    handler: function(){
                        me.lookupLinkProperties(link);
                    }
                }
            ]
        });

        topopanel.add(rightMenu);
        rightMenu.showAt(x, y);
    },

    onNodedblclick: function(node){
        var isSubnet = node.type == 'cloud';
        var status = node.cloudStatus == 'close' ? 'open' : 'close';
        var topopanel = this.lookupReference('topoPanel');

        if (isSubnet) {
            var url = '/topo/band/' + '?cloudid=' + node.nodeid + '&status='+ status;

            this.onTopoAutoRefresh(url);
        } else {
            node.fixed = false;
        }
    },

    onToggleProperties: function(me, newValue, oldValue, eOpts) {
        var panel = this.lookupReference('topoProperties');
        panel.setVisible(newValue);
    },

    onNodemousedown: function(s, node){
        var me = this;
        node.each(function(d){
            if (d.selected) {
                me.onNodeProperties(d);
                return;
            }
        });
    },

    onLinkmousedown: function(s, link){
        var me = this;
        link.each(function(d){
            if (d.selected) {
                me.onLinkProperties(d);
                return;
            }
        });
    },

    // ============================== topo toolbar ===============================

    onOperateStatusRenderer: function(v, m, r){
        return v == 'Online' ? '<span style="color: green;">' + _('Online') + '</span>' : '<span style="color: red;">' + _('Offline') + '</span>';
    },

    onNodeProperties: function(node){
        var panel = this.lookupReference('topoProperties');
        var config = {
            source: {
                //name: {displayName: _('Name')},
                userlabel: {displayName: _('UserLabel')},
                ip: {displayName: _('IP')},
                status: {displayName:_('Status'), renderer: 'onOperateStatusRenderer'}
            }
        };

        if(node){
            config.data = {
                //name: node.nodename,
                userlabel: node.userlabel,
                status: node.status,
                ip: node.ip
            };
            switch(node.type){
                case 'sdn':{}break;
                case 'ext': {
                    config.source.resourceid = {displayName: _('ResourceId')};
                    config.source.nodeip = {displayName: 'IP'};
                    config.source.parent_topo_id = {displayName: _('ParentTopoId')};

                    config.data.resourceid = node.resourceid;
                    config.data.nodeip = node.nodeip;
                    config.data.parent_topo_id = node.parent_topo_id;
                }break;
                case 'cloud': {
                    delete config.source.status;
                    delete config.data.status;
                }break;
            }

            panel.setConfig('sourceConfig', config.source);
            panel.setSource(config.data);
        }else{
            config.data = {
                name: undefined,
                userlabel: undefined,
                status: undefined
            };
        }

        panel.setConfig('sourceConfig', config.source);
        panel.setSource(config.data);
    },

    lookupNodeProperties: function(node) {
        var panel = this.lookupReference('topoProperties');
        var checkbox = this.lookupReference('properties_checkbox');

        checkbox.setValue(true);
        panel.setHidden( false );
        this.onNodeProperties(node);
    },

    onLinkProperties: function(link){
        var panel = this.lookupReference('topoProperties');
        var config = {
            source: {
                left_node_userlabel: {displayName: _('SourceNode')},
                right_node_userlabel: {displayName: _('DestNode')},
                left_ltp_user_label: {displayName: _('SourcePort')},
                right_ltp_user_label: {displayName: _('DestPort')},
                status: {displayName:_('Status'), renderer: 'onOperateStatusRenderer'}
            },
            data:{
                left_node_userlabel: link.left_node_userlabel,
                right_node_userlabel: link.right_node_userlabel,
                left_ltp_user_label: link.left_ltp_user_label,
                right_ltp_user_label: link.right_ltp_user_label,
                status: link.status
            }
        };

        if(link.manager_vlan_status){
            config.source.manager_vlan_status = {displayName: _('ManagerStatus'), renderer: function(v, m, r){
                return v == 'on' ? '<span style="color: green;">up</span>' : '<span style="color: red;">down</span>';
            }};
            config.data.manager_vlan_status = link.manager_vlan_status;
        }

        panel.setConfig('sourceConfig', config.source);
        panel.setSource(config.data);
    },

    lookupLinkProperties: function(link) {
        var panel = this.lookupReference('topoProperties');
        var checkbox = this.lookupReference('properties_checkbox');

        checkbox.setValue(true);
        panel.setHidden( false );
        this.onLinkProperties(link);
    },

    onTopoLockView: function(me, e, eOpts){
        var panel = this.lookupReference('topoBorder');
        var topopanel = this.lookupReference('topoPanel');
        topopanel.view_locked = true;
        panel.down('#UnlockView').setDisabled(false);
        panel.down('#LockView').setDisabled(true);
    },

    onTopoUnlockView: function(me, e, eOpts){
        var panel = this.lookupReference('topoBorder');
        var topopanel = this.lookupReference('topoPanel');
        topopanel.view_locked = false;
        panel.down('#UnlockView').setDisabled(true);
        panel.down('#LockView').setDisabled(false);
    },

    onTopoSearch: function(me, e, eOpts){
        this.search_topo();
    },

    onZoomin: function(me, e, eOpts){
        // Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomIn();
    },

    onZoomout: function(me, e, eOpts){
        // Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomOut();
    },

    onZoomReset: function(me, e, eOpts){
        // Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomReset();
    },

    onZoomFit: function(me, e, eOpts){
        // Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomFit();
    },

    onTopoNewLayout: function(me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        this.topo_new_layout(topopanel, me.layout_type);
    },

    onToggleForceDirectedLayout: function(me, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').fixed_all(!newValue);
    },

    onChangeForceDirectedLinkLength: function(slider, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').setForcelinkDistance(newValue);
    },

    onChangeForceDirectedCharge: function(slider, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').setForceCharge(0-newValue)
    },

    onOptionMenushow: function(self, menu, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        this.lookupReference('enable_force_layout_checkox').setValue(!topopanel.is_fixed_all());
        this.lookupReference('multi_link_style_menu').setDisabled(!topopanel.exist_multi_link());
        this.lookupReference('parallel_line_space_menu').setDisabled(!topopanel.exist_multi_link());
    },

    onToggleShowNodeLabel: function(self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').showNodeLabel(newValue);
    },

    onToggleShowLinkLabel: function(self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').showLinkLabel(newValue);
    },

    onTopoSelectNodeSize: function(self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').setNodeSize(newValue.v);
    },

    onTopoAutoRefresh: function(url){
        var topopanel = this.lookupReference('topoPanel');

        clearInterval(this.timer);
        this.timer = null;
        this.url = url;

        topopanel.loadJson(url);

        this.timer = setInterval(function(){
            topopanel.loadJson(url);
        }, this.time);
    },

    onTopoAutoRefreshTime: function(self, newValue, oldValue, eOpts){
        this.time = newValue.refreshTime;
        this.onTopoAutoRefresh(this.url);
    },

    onTopoSelectParallelLinkStyle: function(self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').setMultiLinkStyle(newValue.v2);
    },

    onChangeParallelLineSpace: function(slider, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').setLinkSpace(0-newValue);
    },

    onTopoSaveLayout: function() {
        var topo = this.lookupReference('topoPanel');
        var ary = [];
        topo.node.each( function(d) {
            ary.push({nodeid:d.nodeid, x:d.x, y:d.y});
        });

        var background_params = {background_type: topo.background_type, background_opacity: topo.background_opacity};
        if (topo.background_type == 'img') {
            background_params['background_img'] = topo.background_img;
            topo.initBackgroundColorTemp();
            topo.initBackgroundMapTemp();
        } else if (topo.background_type == 'color') {
            background_params['background_color'] = topo.background_color;
            topo.initBackgroundImgTemp();
            topo.initBackgroundMapTemp();
        } else {
            var mapSetting = topo.getMapSetting();
            background_params['mapEnable'] = topo.mapEnable;
            background_params['mapCenter'] = mapSetting.mapCenter;
            background_params['mapZoom'] = mapSetting.mapZoom;
            background_params['mapType'] = mapSetting.mapType;
            topo.initBackgroundImgTemp();
            topo.initBackgroundColorTemp();
        }

        Ext.create('Ext.form.Panel', {
            items: [
                {xtype: 'hidden', name: 'nodes',  value: JSON.stringify(ary) },
                {xtype: 'hidden', name: 'background_params',  value: JSON.stringify(background_params)},
                {xtype: 'hidden', name: 'layer', value: 'band' }
            ]
        }).getForm().submit({
            url: '/topo/band/save_layout',
            waitTitle : _('Please wait...'),
            waitMsg : _('Saving layout...'),
            failure: function(form, action) {
                Ext.Msg.alert(_('FailureTip'), _('SaveLayoutFailure'));
            }
        });
    },

    initBackgroundInfo: function() {
        // 拓扑图背景信息呈现
        var topo = this.lookupReference('topoPanel');

        var colortbar = this.lookupReference('topoBackgroundColorBtn');
        var imgtbar = this.lookupReference('topoBackgroundImageBtn');
        var maptbar = this.lookupReference('toggleGeographyBackgroundBtn');

        var opacityslider = this.lookupReference('topoBackgroundOpacity');
        opacityslider.setValue(topo.background_opacity * 100);
        this.getViewModel().setData({background_opacity:topo.background_opacity*100});

        if (topo.background_type == 'img') {
            imgtbar.setPressed(true);
        } else if (topo.background_type == 'color') {
            colortbar.setPressed(true);
        } else {
            maptbar.setPressed(true);
        }

        var adjustcheck = this.lookupReference('adjestGeoMap');
        adjustcheck.setValue(false);
        var synccheck = this.lookupReference('syncWithGeoMap');
        synccheck.setValue(false);
    },

    onTopoToggleBackgroundToolbar: function() {
        var tbar = this.lookupReference('topoBackgroundToolbar');
        tbar.setHidden( !tbar.hidden );
    },

    onChangeBackgroundSelection: function(container, button, pressed) {
        var me = this;
        var panel = this.lookupReference('topoPanel');
        // console.log("User toggled the '" + button.reference + "' button: " + (pressed ? 'on' : 'off'));
        var opacity = 50;
        switch(button.reference) {
            case 'topoBackgroundImageBtn':
                if (panel.map != null) {
                    var mapSetting = panel.getMapSetting();
                    panel.mapCenter_temp = mapSetting.mapCenter;
                    panel.mapZoom_temp = mapSetting.mapZoom;
                    panel.mapType_temp = mapSetting.mapType;
                    panel.destroyGeoMap();
                }

                panel.setBackgroundImage(panel.background_img_temp);
                panel.setBackgroundColor('#F3F3F3');
                panel.background_type = 'img';
                opacity = panel.background_opacity_img * 100;
                break;
            case 'topoBackgroundColorBtn':
                if (panel.map != null) {
                    var mapSetting = panel.getMapSetting();
                    panel.mapCenter_temp = mapSetting.mapCenter;
                    panel.mapZoom_temp = mapSetting.mapZoom;
                    panel.mapType_temp = mapSetting.mapType;
                    panel.destroyGeoMap();
                }

                panel.setBackgroundImage('');
                panel.setBackgroundColor(panel.background_color_temp);
                panel.background_type = 'color';
                opacity = panel.background_opacity_color * 100;
                break;
            case 'toggleGeographyBackgroundBtn':
                panel.setBackgroundImage('');
                panel.setBackgroundColor('#F3F3F3');
                panel.createGeoMap_temp();
                panel.background_type = 'map';
                opacity = panel.background_opacity_map * 100;
        }

        var opacityslider = this.lookupReference('topoBackgroundOpacity');
        opacityslider.setValue(opacity);
        this.getViewModel().setData({background_opacity:opacity});
    },

    //获取当前地理位置
    onLocationSelf: function() {
        var topopanel = this.lookupReference('topoPanel');
        var geolocation = new BMap.Geolocation();

        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                topopanel.map.panTo(r.point);
                console.log(_('YourLocation') + '：'+r.point.lng+','+r.point.lat);
            }
            else {
                console.log('failed'+this.getStatus());
            }
        },{enableHighAccuracy: true})
    },

    //获取当前地理位置
    onClickConvert: function() {

        var me = this;
        var panel = me.lookupReference('topoPanel');
        var map = panel.map;

        var b = map.getBounds();
        console.log('getBounds',b);

        var ws = b.getSouthWest();
        console.log('getSouthWest',ws);

        var ne = b.getNorthEast();
        console.log('getSouthWest',ne);

        var polyline = new BMap.Polyline([ws, ne], {strokeColor:"red", strokeWeight:2, strokeOpacity:1});
        map.addOverlay(polyline);

        var pws = map.pointToPixel(ws);
        console.log('pointToPixel',pws);

        var pne = map.pointToPixel(ne);
        console.log('pointToPixel',pne);

    },

    //背景图片设置
    onTopoBackgroundImage: function() {
        var topopanel = this.lookupReference('topoPanel');
        Ext.create('Admin.view.topology.main.backgroundPopWin',{
            renderTo: Ext.getBody(),
            parentsubnetid: topopanel.json.parentnode[0].symbol_id,
            topopanel: topopanel
        }).show();
    },

    //背景颜色设置
    onTopoBackgroundColor: function() {
        var topopanel = this.lookupReference('topoPanel');

        Ext.widget('window', {
            title: _('Background Color'),
            border: false,
            layout: 'fit',
            width: 600,
            height: 350,
            resizable: false,
            modal: true,
            items : Ext.create('Ext.ux.colorpick.Selector', {
                value     : '#993300',  // initial selected color
                // renderTo  : Ext.getBody(),
                listeners: {
                    change: function (colorselector, color) {
                        topopanel.background_color_temp = '#' + color;
                        topopanel.setBackgroundColor('#' + color);
                    }
                }
            }),
            bbar:[
                '->',
                {
                    text: _('Close'),
                    iconCls:'x-fa fa-times',
                    handler: function() {
                        this.up('window').close();
                    }
                }
            ]
        }).show();
    },

    //修改背景透明度
    onChangeBackgroundTransparency: function(slider, newValue, thumb, eOpts) {
        var panel = this.lookupReference('topoPanel');
        if (panel.background_type == 'color') {
            panel.background_opacity_color = newValue/100;
        } else if (panel.background_type == 'img') {
            panel.background_opacity_img = newValue/100;
        } else {
            panel.background_opacity_map = newValue/100;
        }

        panel.setBackgroundOpacity(newValue/100);
        this.getViewModel().setData({background_opacity:newValue});

    },

    //地图背景
    onToggleGeographyOperation: function(me, newValue, thumb, eOpts) {
        var panel = this.lookupReference('topoPanel');
        panel.enableGeoMapOperation(newValue);
    },

    //地图背景
    onToggleSyncWithGeoMap: function(me, newValue, thumb, eOpts) {
        var panel = this.lookupReference('topoPanel');
        panel.mapSync = newValue;
    },

    onTopoRefresh: function(me, e, eOpts){
        var topopanel = this.lookupReference('topoPanel');
        topopanel.reloadTopo();
    },

    topo_new_layout: function(topo, layout_type) {
        var nodes = [];
        var links = [];
        topo.node.each( function(d) {
            nodes.push(d.symbol_id);
        });
        topo.link.each( function(d) {
            links.push({source: d.source.symbol_id, target: d.target.symbol_id});
        });

        Ext.create('Ext.form.Panel', {
            items: [
                {xtype: 'hidden', name: 'nodes',  value: JSON.stringify(nodes) },
                {xtype: 'hidden', name: 'links',  value: JSON.stringify(links) },
                {xtype: 'hidden', name: 'width',  value: topo.svg_width },
                {xtype: 'hidden', name: 'height', value: topo.svg_height },
                {xtype: 'hidden', name: 'type',   value: layout_type }
            ]
        }).getForm().submit({
            url: '/topo/band/new_layout',
            waitTitle : _('Please wait...'),
            waitMsg : _('Redo layout...'),
            success: function(form, action) {
                var r = action.result;
                topo.node.each(function(d){
                    d.fixed = 1;
                    d.px = r.nodes[ d.symbol_id ].x;
                    d.py = r.nodes[ d.symbol_id ].y;
                    d.x = r.nodes[ d.symbol_id ].x;
                    d.y = r.nodes[ d.symbol_id ].y;
                });
                topo.tick();
            },
            failure: function(form, action) {
                // Ext.Msg.alert(_('Operation Failure'), _('Operation Failure'));
                console.log('auto layout failure with ' + layout_type)
            }
        }); // form
    },

    // 拓扑搜索功能
    search_topo: function() {
        var me = this;
        var topopanel = me.lookupReference('topoPanel');
        var searchstore = Ext.create('Ext.data.Store', {
            fields : ['value', 'text'],
            data :[
                //{ text: _('NeName'), value: 'name'},
                { text: _('NeUserlabel'), value: 'user_label'}
            ]
        });
        // 拓扑搜索window
        var win = Ext.widget('window', {
            title: _('Topology Search'),
            border: false,
            width: 400,
            height: 250,
            minWidth: 400,
            minHeight: 250,
            resizable: true,
            modal: true,
            layout: 'fit',
            // The fields
            defaultType : 'textfield',
            items: [{
                xtype: 'form',
                border : false,
                autoWidth : true,
                autoHeight : true,
                layout : 'anchor',
                defaults: {
                    anchor: '100%'
                },
                labelAlign : 'right',
                defaultType : 'textfield',
                padding: 10,
                fieldDefaults : {
                    labelWidth : 120,
                    labelAlign : "left",
                    margin : 5
                },
                items : [{
                    xtype : "combo",
                    fieldLabel : _('Search category'),
                    name : 'search_category',
                    store : searchstore,
                    displayField : 'text',
                    valueField : 'value',
                    value : 'user_label',
                    queryMode: 'local',
                    readOnly: true,
                    editable : false
                }, {
                    xtype : 'textfield',
                    fieldLabel : _('Search content'),
                    name : 'search_content',
                    value : ''
                }, {
                    xtype   : 'radiogroup',
                    //id: 'condition',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel  : _('Perfect Match'),
                            name      : 'condition',
                            inputValue : 'perfect'
                        }, {
                            boxLabel  : _('Contain'),
                            name      : 'condition',
                            inputValue : 'contain',
                            checked   :  true
                        }]
                }
                ],
                buttons: [
                    { text: _('Cancel'), handler: function(){
                        this.up('window').close();
                    }},
                    { text: _('Reset'), handler: function(){
                        this.up('form').reset();
                    }},
                    { text: _('Search'), handler: function(){
                        var searchObj = this.up('form').getValues();
                        me.searchObj = searchObj;
                        var url = '/topo/band/?search_category=';

                        url += searchObj.search_category;
                        url += '&search_content=' + searchObj.search_content;
                        url += '&condition=' + searchObj.condition;

                        me.onTopoAutoRefresh(url);
                        win.close();
                    }}
                ]
            }]
        });

        win.show();
        win.down('form').getForm().setValues(me.searchObj);
    }
});
