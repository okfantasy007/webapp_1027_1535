Ext.define('Admin.view.config.sdn.topo.elineTopoController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.elineTopoController',
    requires: [
        'Ext.ux.colorpick.Selector'
    ],

    getSpecificEline: function (eline_id) {
        var data = "";
        Ext.Ajax.request({
            async: false, //同步请求
            url: '/config/sdn/eline/specificeline/' + eline_id,
            success: function (response, opts) {
                data = Ext.util.JSON.decode(response.responseText).data; //string转化为json对象
            },
            failure: function (response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
        return data;
    },

    getSpecificPw: function (eline_id, pw_id) {
        console.log("----------------getSpecificPw---------------");
        var pw = "";
        var eline = this.getSpecificEline(eline_id);
        if (eline) {
            pw = eline.pw.filter(function (ele) {
                return ele.id == pw_id;
            })[0];
        }
        return pw;
    },

    getMegIdByTunnel: function (tunnelId) {
        console.log("----------------getMegIdByTunnel---------------");
        var data = "";
        Ext.Ajax.request({
            async: false, //同步请求
            url: '/config/sdn/eline/get_tunnel_meg_id/' + tunnelId,
            success: function (response, opts) {
                // console.log("ajax", response);
                data = response.responseText;
            },
            failure: function (response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
        return data;
    },

    // ===================================== Topo Panel ==========================================

    //视图变化的事件
    onTopoShowRoot: function (elineid, elinename) {
        //alert(this.getViewModel().get('current_eline_id'));
        var url = elineid ? '/config/sdn/elinetopo/eline/' + elineid + '?tm=' + new Date().getTime() : '';
        var topopanel = this.lookupReference('topoPanel');
        var breadcrumb = this.lookupReference('breadcrumbeline');
        var elineBreadBtn = breadcrumb.items.items[0];
        var pwBreadBtn = breadcrumb.items.items[1];
        var gotoTopBtn = this.lookupReference('gotoTopoTop');
        var gotobackBtn = this.lookupReference('gotoBackupTopo');
        var viewModel = this.getViewModel();

        gotoTopBtn.setDisabled(true);
        gotobackBtn.setDisabled(true);
        viewModel.set('current_eline_id', elineid);
        viewModel.set('current_topo_layer', 'eline');
        elineBreadBtn.setPressed(true);
        elineBreadBtn.setText('eline:' + elinename);
        pwBreadBtn.setText('pw');

        this.autoRefreshTopo(url);
    },

    //自动刷新
    autoRefreshTopo: function(url){
        var topopanel = this.lookupReference('topoPanel');
        var viewModel = this.getViewModel();
        var timer = viewModel.get('timer');
        var time = viewModel.get('time');

        clearInterval(timer);
        viewModel.set('timer', null);
        viewModel.set('url', url);

        topopanel.loadJson(url);

        timer = setInterval(function(){
            topopanel.loadJson(url);
        }, time);

        viewModel.set('timer', timer);
    },

    //选择自动刷新事件
    onAutoRefreshTopo: function(self, newValue, oldValue, eOpts){
        this.getViewModel().set('time', newValue.refreshTime);
        this.autoRefreshTopo(this.getViewModel().get('url'));
    },

    //返回拓扑顶层
    onTopoGotoTopLevel: function () {
        this.gotoElineTopo();
    },

    //返回上一层拓扑视图
    onTopoGotoUpLevel: function () {
        var me = this;
        var layer = me.getViewModel().get('current_topo_layer');
        var elineid = me.getViewModel().get('current_eline_id');

        switch (layer) {
            case 'pw':
                me.gotoElineTopo();
                break;
            case 'lsp':
                me.gotoPwTopo(elineid);
                break;
        }
    },

    //加载完成的事件
    onLoadcompleted: function (s) {
        this.initBackgroundInfo();
    },

    // 选择层视图显示 ？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
    onBrushselected: function (s, node, link, x, y) {
        var me = this;
        var nodeids = [];
        var existSelectLink = false;
        var existSelectNode = false;

        node.each(function (d) {
            if (d.selected) {
                existSelectNode = true;
                nodeids.push(d);
            }
        });

        link.each(function (d) {
            if (d.selected) {
                existSelectLink = true;
            }
        });

        if (!existSelectNode && !existSelectLink) {
            me.onChangeNodeProperties();
        }
    },

    //链路或是节点被选中
    onLinknodeselected: function (anode, znode) {
        var panel = this.lookupReference('topoPanel');
        console.log("onLinknodeselected");
    },

    // 拓扑空白处右键菜单
    onTopocontextmenu: function (me, x, y) {
        var topopanel = this.lookupReference('topoPanel');
        var rightMenu = new Ext.menu.Menu({
            items: [
            {
                text: _('Search Topology'),
                iconCls: 'x-fa fa-binoculars',
                handler: 'search_topo'
            }, {
                text: _('Change Layout'),
                iconCls:'x-fa fa-th',
                menu: [
                {
                    text: _('Array-based Layout'),
                    tooltip: _('Array-based Layout'),
                    iconCls: 'x-fa fa-th',
                    layout_type: 'sage',
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
                }]
            }, {
                text: _('Save Layout'),
                iconCls: 'x-fa fa-save',
                handler: 'onTopoSaveLayout'
            },
                "-", {
                    text: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: function () {
                        topopanel.reloadTopo();
                    }
                }
            ]
        });

        me.add(rightMenu);
        // rightMenu.render(panel.div);
        rightMenu.showAt(x, y);

    },

    //基本属性展示当单元格可编辑之前事件
    onBeforeEdit: function (editor, context, eOpts) {
        var name = context.record.get('name');

        if (name == 'userlabel') {
            return true;
        }

        return false;
    },

    //设置展示的node的属性数据
    onChangeNodeProperties: function (node) {
        var panel = this.lookupReference('propGrid');

        if (!node) {
            panel.setRootNode({
                expanded: true,
                iconCls: 'sdn-no-icon',
                children: []
            });

            return ;
        }

        for (var name in node) {
            node[name] = node[name] ? node[name] : '';
        }

        var status = node.status == 'up'
            ? '<span style="color: green;">' + _('Online') + '</span>'
            : '<span style="color: red;">' + _('Offline') + '</span>';

        var rootNode = {
            expanded: true,
            iconCls: 'sdn-no-icon',
            children: [
                {
                    name: _('UserLabel'),
                    value: node.userlabel,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                }, {
                    name: _('IP'),
                    value: node.ip,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                },{
                    name: _('Status'),
                    value: status,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                }
            ]
        };

        if (node.type == 'ext') {
            rootNode.children.push({
                name: _('ResourceId'),
                value: node.resourceid,
                leaf: true,
                iconCls: 'sdn-no-icon'
            });
            rootNode.children.push({
                name: _('IP'),
                value: node.nodeip,
                leaf: true,
                iconCls: 'sdn-no-icon'
            });
            rootNode.children.push({
                name: _('ParentTopoId'),
                value: node.parent_topo_id,
                leaf: true,
                iconCls: 'sdn-no-icon'
            });
        } else if (node.type == 'cloud') {
            rootNode.children.pop();
        }

        panel.setRootNode(rootNode);

    },

    //展示node基本属性的store的数据组织
    onNodeProperties: function (node) {
        var me = this;
        var panel = me.lookupReference('propGrid');
        var checkbox = me.lookupReference('properties_checkbox');

        checkbox.setValue(true);
        panel.setHidden(false);
        me.onChangeNodeProperties(node);
    },

    //右键点击节点事件
    onNodecontextmenu: function (s, node, x, y) {
        var me = this;
        var topopanel = me.lookupReference('topoPanel');
        var rightMenu = new Ext.menu.Menu({
            items: [{
                text: _('View Properties'),
                iconCls: 'x-fa fa-file-text-o',
                handler: function () {
                    me.onNodeProperties(node)
                }
            }]
        });

        topopanel.add(rightMenu);
        rightMenu.showAt(x, y);

    },

    //基本属性链路信息展示的中文字段名称
    onDisplayNameByType: function (type, link) {
        var me = this;

        for (var name in link) {
            link[name] = link[name] ? link[name] : '';
        }

        var status = link.status == 'up' ? '<span style="color: green;">' + _('Online') + '</span>' : '<span style="color: red;">' + _('Offline') + '</span>';
        var role = '';
        var relation;

        if(link.role && link.role.toLowerCase() == 'master'){
            role = _('Master');
        }else if(link.role && link.role.toLowerCase() == 'slave'){
            role = _('Slave');
        }

        if (link.relation) {
            relation = link.relation.split('-')[0] + _('Source') + link.relation.split('-')[1] + _('Destination');
        } else {
            relation = '';
        }

        var rootNode = {
            expanded: true,
            iconCls: 'sdn-no-icon',
            children: [
                {
                    name: _('LinkStatus'),
                    value: status,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                }, {
                    name: _('Role'),
                    value: role,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                }
            ]
        };

        var sourceNode = {
            name: _('SourceNode'),
            expanded: true,
            iconCls: 'sdn-no-icon',
            children: [
                {
                    name: _('UserLabel'),
                    value: link.left_node_userlabel,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                },
                {
                    name: _('SourcePort'),
                    value: link.left_ltp_name,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                }
            ]
        };

        var destNode = {
            name: _('DestNode'),
            expanded: true,
            iconCls: 'sdn-no-icon',
            children: [
                {
                    name: _('UserLabel'),
                    value: link.left_node_userlabel,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                },
                {
                    name: _('DestPort'),
                    value: link.left_ltp_name,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                }
            ]
        };

        switch (type) {
            case 'eline':
            {
                var eline = me.getSpecificEline(link.eline_id);
                var elineLink = [
                    {
                        name: _('ElineUserlabel'),
                        value: link.eline_userlabel,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('Type'),
                        value: relation,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    }
                ];

                sourceNode.children.push({
                    name: _('SourceVlan'),
                    value: link.left_vlan,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                });

                destNode.children.push({
                    name: _('DestVlan'),
                    value: link.right_vlan,
                    leaf: true,
                    iconCls: 'sdn-no-icon'
                });

                if (eline.protection) {
                    var protectionType;
                    var revertiveMode;

                    switch (eline.protection['linear-protection-type']) {
                        case 'unprotected':
                            protectionType = _('Unprotected');
                            break;
                        case 'path-protection-1-to-1':
                            protectionType = _('pathProtection1To1');
                            break;
                        case 'path-protection-1-plus-1':
                            protectionType = _('pathProtection1Plus1');
                            break;
                    }

                    switch (eline['protection']['revertive-mode']) {
                        case 'no-revertive':
                            revertiveMode = _('NoRevertive');
                            break;
                        case 'revertive':
                            revertiveMode = _('Revertive');
                            break;
                    }


                    var protection = {
                        expanded: true,
                        iconCls: 'sdn-no-icon',
                        name: _('Protection'),
                        children: [
                            {
                                name: _('LinearProtectionType'),
                                value: protectionType,
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('LinearProtectionProtocol'),
                                value: eline.protection['linear-protection-protocol'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('RevertiveMode'),
                                value: revertiveMode,
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('WTR'),
                                value: eline.protection['wtr'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            }
                        ]
                    };

                    if (!eline['salve']) {
                        protection.children.push({
                            name: _('PsCommandType'),
                            value: 1,
                            leaf: true,
                            iconCls: 'sdn-no-icon'
                        });
                    }

                    rootNode.children.push(protection);
                }

                rootNode.children = elineLink.concat(rootNode.children);
            }
                break;
            case 'pw':
            {
                var workStatus = '';
                if(link.work_status && link.role){
                    workStatus = (link.work_status.toLowerCase() == link.role.toLowerCase()) ? _('WorkActive') : _('WorkStanddby');
                }

                var oamStatus = '';
                if(link.oam_status){
                    oamStatus = (link.oam_status.toLowerCase() == 'up') ? _('UP') : _('DOWN');
                }

                var pwLink = [
                    {
                        name: _('ElineUserlabel'),
                        value: link.eline_name,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('PwName'),
                        value: link.pw_name,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('WorkStatus'),
                        value: workStatus,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('OamStatus'),
                        value: oamStatus,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    }
                ];

                var pw = me.getSpecificPw(link.eline_id, link.pw_id);

                if (pw) {

                    if (pw.qos) {
                        var sourceQos = [
                            {
                                name: _('CIR(kbps)'),
                                value: pw.qos['qos-a2z-cir'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('PIR(kbps)'),
                                value: pw.qos['qos-a2z-pir'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('CBS(Bytes)'),
                                value: pw.qos['qos-a2z-cbs'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('PBS(Bytes)'),
                                value: pw.qos['qos-a2z-pbs'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            }
                        ];
                        var destQos = [
                            {
                                name: _('CIR(kbps)'),
                                value: pw.qos['qos-z2a-cir'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('PIR(kbps)'),
                                value: pw.qos['qos-z2a-pir'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('CBS(Bytes)'),
                                value: pw.qos['qos-z2a-cbs'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            },
                            {
                                name: _('PBS(Bytes)'),
                                value: pw.qos['qos-z2a-pbs'],
                                leaf: true,
                                iconCls: 'sdn-no-icon'
                            }
                        ];

                        sourceNode.children = sourceNode.children.concat(sourceQos);
                        destNode.children = destNode.children.concat(destQos);
                    }

                    if (pw.oam) {
                        var oam;

                        if (pw.oam['cc-exp']) {
                            var lmModel = '';
                            var dmModel = '';

                            switch (pw.oam['lm-mode']){
                                case 'disable': lmModel = _('Disable');break;
                                case 'pre-active': lmModel = _('Pre-activate');break;
                                case 'on-demand': lmModel = _('In use');break;
                            }

                            switch (pw.oam['dm-mode']){
                                case 'disable': dmModel = _('Disable');break;
                                case 'pre-active': dmModel = _('Pre-activate');break;
                                case 'on-demand': dmModel = _('In use');break;
                            }

                            oam = {
                                expanded: true,
                                name: _('OAM'),
                                iconCls: 'sdn-no-icon',
                                children: [
                                    {
                                        name: _('Type'),
                                        value: 'CC',
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    },
                                    {
                                        name: _('Exp'),
                                        value: pw.oam['cc-exp'],
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    },
                                    {
                                        name: _('Interval') + '(ms)',
                                        value: pw.oam['cc-interval'],
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    },
                                    {
                                        name: _('LM mode'),
                                        value: lmModel,
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    },
                                    {
                                        name: _('DM mode'),
                                        value: dmModel,
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    }
                                ]
                            };

                        } else if (pw.oam['localdetectmultiplier']) {
                            oam = {
                                expanded: true,
                                name: _('OAM'),
                                iconCls: 'sdn-no-icon',
                                children: [
                                    {
                                        name: _('Type'),
                                        value: 'BFD',
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    },
                                    {
                                        name: _('Multiple'),
                                        value: pw.oam['localdetectmultiplier'],
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    },
                                    {
                                        name: _('Interval') + '(ms)',
                                        value: pw.oam['localtxinterval'],
                                        leaf: true,
                                        iconCls: 'sdn-no-icon'
                                    }
                                ]
                            };
                        }

                        rootNode.children.push(oam);
                    }
                }

                rootNode.children = pwLink.concat(rootNode.children);
            }
                break;
            case 'lsp':
            {
                var workStatus = '';
                if(link.work_status){
                    workStatus = (link.work_status.toLowerCase() == link.role.toLowerCase()) ? _('WorkActive') : _('WorkStanddby');
                }

                var oamStatus = '';
                if(link.oam_status){
                    oamStatus = (link.oam_status.toLowerCase() == 'up') ? _('UP') : _('DOWN');
                }
                var lspLink = [
                    {
                        name: _('TunnelId'),
                        value: link.tunnel_id,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('LspUserlabel'),
                        value: link.lsp_userlabel,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('BackLabel'),
                        value: link.backward_label,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('ForwardLabel'),
                        value: link.forward_label,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('Vlan'),
                        value: link.forward_vlan,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('WorkStatus'),
                        value: workStatus,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    },
                    {
                        name: _('OamStatus'),
                        value: oamStatus,
                        leaf: true,
                        iconCls: 'sdn-no-icon'
                    }
                ];

                rootNode.children = lspLink.concat(rootNode.children);
            }
                break;
        }

        rootNode.children.push(sourceNode);
        rootNode.children.push(destNode);

        return rootNode;
    },

    onChangeLinksProperties: function (link) {
        var me = this;
        var panel = me.lookupReference('propGrid');
        var type = me.getViewModel().get('current_topo_layer');

        if (!link) {
            panel.setRootNode({
                expanded: true,
                iconCls: 'sdn-no-icon',
                children: []
            });

            return ;
        }

        var rootData = me.onDisplayNameByType(type, link);
        panel.setRootNode(rootData);
    },

    //链路基本属性展示
    onLinkProperties: function (link) {
        var me = this;
        var panel = me.lookupReference('propGrid');
        var checkbox = me.lookupReference('properties_checkbox');

        checkbox.setValue(true);
        panel.setHidden(false);

        me.onChangeLinksProperties(link);
    },

    //强制保护
    onForcedProtect: function (elineid, cmd) {
        Ext.create('Ext.form.Panel', {
            items: [
                {xtype: 'hidden', name: 'elineid', value: elineid},
                {xtype: 'hidden', name: 'cmd', value: cmd}
            ]
        }).getForm().submit({
            url: '/eline/forceprotect',
            method: 'post',
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            failure: function (form, action) {
                Ext.Msg.alert(_('Operation Failure'), _('ForceProtectFailerMsg'));
            }
        });
    },

    //=============================================LB=======================================
    onStartLbHandler: function (btn, pw, eline_id) {
        console.log("----------------onStartLbHandler---------------");
        //
        var me1 = btn;
        var start_lb_form = btn.up('form');
        var values = start_lb_form.getForm().getValues();
        if (values['ne-id'] == 'ingress') {
            values['ne-id'] = pw['ingress-ne-id'];
        } else if (values['ne-id'] == 'egress') {
            values['ne-id'] = pw['egress-ne-id'];
        }
        values['discovery'] = 'true';
        values['enable'] = 'true';
        values['nbrOfPkt'] = parseInt(values['nbrOfPkt']);
        values['pktLength'] = parseInt(values['pktLength']);
        values['eline-id'] = eline_id;
        values['destination'] = pw.oam['meg-id'];
        switch (values['period']) {
            case '1 SEC':
                var period = 1000;
                break;
            case '10 SEC':
                var period = 10000;
                break;
            case '1 MIN':
                var period = 60000;
                break;
            case '10 MIN':
                var period = 600000;
                break;
            default:
                var period = 3000;
                break;
        }
        var lb_start_status = false;
        var lb_id;
        start_lb_form.getForm().submit({
            url: '/config/sdn/eline/lb/start',
            params: {
                input: values
            },
            jsonSubmit: true,
            waitTitle: _('Tip'),
            waitMsg: _('Starting LB. Please wait......'),
            success: function (form, action) {
                var res = Ext.decode(action.response.responseText);
                lb_start_status = true;
                lb_id = res['lb-id']; //成功开启lb会返回lb-id
                // Ext.Msg.alert(_('Tip'), '成功开启LB，开始发包...');
                if (lb_start_status && lb_id !== undefined) { //成功开启后 开始发包
                    var start_lb_window = me1.up('window');
                    var lb_result_fs = start_lb_window.items.items[1];
                    lb_result_fs.setHidden(false);
                    var stop_lb_btn = me1.nextSibling();
                    var del_lb_btn = stop_lb_btn.nextSibling();
                    me1.setDisabled(true); //成功开启lb后 开始按钮变为不可点击状态
                    stop_lb_btn.setDisabled(false); //成功开启lb后 结束按钮变为可点击状态
                    del_lb_btn.setDisabled(false); //成功开启lb后 移除按钮变为可点击状态

                    var start_lb_containers = start_lb_form.items.items;
                    //成功开启lb后 lb_start_form中的输入框或选择框都不允许用户输入

                    for (var p = 0; p < start_lb_containers.length; p++) {
                        var container = start_lb_containers[p].items.items;
                        for (var q = 0; q < container.length; q++) {
                            container[q].setDisabled(true);
                        }
                    }

                    window.lb_params = {
                        "ne-id": values['ne-id'],
                        "eline-id": eline_id,
                        "lb-id": String(lb_id),
                        "meg-id": values['destination']
                    };
                    if (values['nbrOfPkt']) {
                        var nbrOfPkt = parseInt(values['nbrOfPkt']);
                        window.packet_end_status = false;
                        var count = 0;
                        var success_count = 0;

                        //三秒之后调接口获取结果
                        window.timer = setInterval(function () {
                            Ext.Ajax.request({
                                async: false, //同步请求
                                url: '/config/sdn/eline/get_lb_result',
                                method: 'POST',
                                params: {
                                    input: window.lb_params
                                },
                                jsonSubmit: true,
                                success: function (response, opts) {
                                    count++;
                                    success_count++;
                                    // console.log("ajax", response);
                                    data = Ext.util.JSON.decode(response.responseText).data; //string转化为json对象
                                    var start_lb_window = me1.up('window');
                                    var lb_result_form = start_lb_window.items.items[1].down('form');
                                    var lb_result_title_ch = '结果 ( 第 ' + '<span style="color: green">' + count + '</span>' + ' 个包 ) | 状态：<span style="color: green">成功</span>';
                                    var lb_result_title_en = 'Result ( ' + '<span style="color: green">' + count + '</span>' + ' th packet ) | Status：<span style="color: green">success</span>';
                                    var lb_result_title = APP.lang == 'zh_CN' ? lb_result_title_ch : lb_result_title_en;
                                    lb_result_fs.setTitle(lb_result_title);
                                    if (data['lb-resultOK'] !== undefined) {
                                        lb_result_form.form.findField('lb-resultOK').setValue(data['lb-resultOK'] == true ? _('Yes') : _('No'));
                                    }
                                    if (data['lb-nbrOfLbrInOutOfOrder'] !== undefined) {
                                        lb_result_form.form.findField('lb-nbrOfLbrInOutOfOrder').setValue(data['lb-nbrOfLbrInOutOfOrder']);
                                    }
                                    if (data['lb-nbrOfLbrIn'] !== undefined) {
                                        lb_result_form.form.findField('lb-nbrOfLbrIn').setValue(data['lb-nbrOfLbrIn']);
                                    }
                                    if (data['lb-nbrOfLbrBadMsdu'] !== undefined) {
                                        lb_result_form.form.findField('lb-nbrOfLbrBadMsdu').setValue(data['lb-nbrOfLbrBadMsdu']);
                                    }
                                    lb_result_fs.updateLayout();
                                    if (count == nbrOfPkt) {
                                        //发包结束 start_lb_form恢复正常
                                        for (var p1 = 0; p1 < start_lb_containers.length; p1++) {
                                            var container1 = start_lb_containers[p1].items.items;
                                            for (var q1 = 0; q1 < container1.length; q1++) {
                                                container1[q1].setDisabled(false);
                                            }
                                        }
                                        me1.setDisabled(false); //发包结束后 开始按钮变为可点击状态
                                        stop_lb_btn.setDisabled(true); //发包结束后 结束按钮变为不可点击状态
                                        del_lb_btn.setDisabled(true); //发包结束后 移除按钮变为不可点击状态
                                        window.packet_end_status = true; //发包结束
                                        var conclusion_form = start_lb_window.items.items[2];
                                        conclusion_form.setHidden(false);
                                        conclusion_form.form.findField('total-count').setValue(nbrOfPkt);
                                        conclusion_form.form.findField('success-count').setValue(success_count);
                                        conclusion_form.form.findField('success-count').setFieldStyle('color: green;');
                                        Ext.Msg.alert(_('Tip'), _('Complete to sending packets'));
                                        clearInterval(window.timer);
                                    }
                                },
                                failure: function (response, opts) {
                                    count++;
                                    var lb_result_title_ch = '结果 ( 第 ' + '<span style="color: green">' + count + '</span>' + ' 个包 ) | 状态：<span style="color: green">失败</span>';
                                    var lb_result_title_en = 'Result ( ' + '<span style="color: green">' + count + '</span>' + ' th packet ) | Status：<span style="color: green">failure</span>';
                                    var lb_result_title = APP.lang == 'zh_CN' ? lb_result_title_ch : lb_result_title_en;
                                    lb_result_fs.setTitle(lb_result_title);
                                    // lb_result_fs.setTitle('结果 ( 第 ' + '<span style="color: green">' + count + '</span>' + ' 个包 ) | 状态：<span style="color: red">失败</span>');
                                    if (count == nbrOfPkt) {
                                        var conclusion_form = start_lb_window.items.items[2];
                                        conclusion_form.setHidden(false);
                                        conclusion_form.form.findField('total-count').setValue(nbrOfPkt);
                                        conclusion_form.form.findField('success-count').setValue(success_count);
                                        conclusion_form.form.findField('success-count').setFieldStyle('color: green;');
                                        Ext.Msg.alert(_('Tip'), _('Complete to sending packets'));
                                        clearInterval(window.timer);
                                    }
                                    console.log('server-side failure with status code ' + response.status);
                                }
                            });
                        }, period);

                    }
                }

            },
            failure: function (form, action) {
                var res = Ext.decode(action.response.responseText);
                Ext.Msg.alert(_('Tip'), _('Fail to start LB'));
                return;
            }
        }); // form
        //
    },

    onStopLbHandler: function (btn, pw, eline_id) {
        console.log("----------------onStopLbHandler---------------");
        //
        var me1 = btn;
        var start_lb_form = btn.up('form');
        start_lb_form.getForm().submit({
            url: '/config/sdn/eline/lb/stop',
            params: {
                input: window.lb_params
            },
            jsonSubmit: true,
            waitTitle: _('Tip'),
            waitMsg: _('Stopping LB. Please wait......'),
            success: function (form, action) {
                var res = Ext.decode(action.response.responseText);

                //成功停止LB之后，关闭原有的定时器
                if (window.timer !== undefined) {
                    clearInterval(window.timer);
                }

                var start_lb_btn = me1.prevSibling();
                var del_lb_btn = me1.nextSibling();
                me1.setDisabled(false); //成功停止lb后 停止按钮变为不可点击状态
                start_lb_btn.setDisabled(true); //成功停止lb后 开始按钮变为可点击状态
                del_lb_btn.setDisabled(true); //成功停止lb后 移除按钮变为不可点击状态

                Ext.Msg.alert(_('Tip'), _('Stop LB successfully'));
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Error'), _('Fail to stop LB'));
            }
        }); // form
    },

    onDelLbHandler: function (btn, pw, eline_id) {
        console.log("----------------onDelLbHandler---------------");
        //
        var me1 = btn;
        var start_lb_form = btn.up('form');
        start_lb_form.getForm().submit({
            url: '/config/sdn/eline/lb/del',
            params: {
                input: window.lb_params
            },
            jsonSubmit: true,
            waitTitle: _('Tip'),
            waitMsg: _('Deleting LB. Please wait......'),
            success: function (form, action) {
                var res = Ext.decode(action.response.responseText);
                //成功删除LB之后，关闭原有的定时器
                if (window.timer !== undefined) {
                    clearInterval(window.timer);
                }

                var stop_lb_btn = me1.prevSibling();
                var start_lb_btn = stop_lb_btn.prevSibling();
                start_lb_btn.setDisabled(false); //成功移除lb后 开始按钮变为可点击状态
                stop_lb_btn.setDisabled(true); //成功移除lb后 结束按钮变为不可点击状态
                me1.setDisabled(true); //成功移除lb后 移除按钮变为不可点击状态

                Ext.Msg.alert(_('Tip'), _('Delete LB successfully'));
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Error'), _('Fail to delete LB'));
            }
        }); // form
    },

    onConfigLB: function (pw, eline_id) {
        console.log("config lb");
        var me = this;
        var win = Ext.widget('window', {
            title: _('Configure LB'),
            border: false,
            resizable: true,
            modal: true,
            constrain: true,//禁止窗口移出浏览器屏幕
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'fieldset',
                title: _('Configuration'),
                margin: 8,
                items: [
                    {
                        xtype: 'form',
                        layout: 'hbox',
                        autoWidth: true,
                        autoHeight: true,
                        reference: 'start_lb_form',
                        items: [{
                            xtype: 'container',
                            layout: 'vbox',
                            defaults: {
                                labelWidth: 60,
                                labelAlign: 'right'
                            },
                            items: [{
                                xtype: 'radiogroup',
                                fieldLabel: _('Direction'),
                                cls: 'x-check-group-alt',
                                vertical: true,
                                items: [{
                                    boxLabel: _('Src'),
                                    name: 'ne-id',
                                    margin: '0 0 0 5', //上右下左
                                    inputValue: 'ingress',
                                    checked: true
                                }, {
                                    boxLabel: _('Dest'),
                                    name: 'ne-id',
                                    margin: '0 0 0 5', //上右下左
                                    inputValue: 'egress'
                                }]
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: _('Packets'),
                                name: 'nbrOfPkt',
                                minValue: 0,
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer')
                            }, {
                                xtype: 'radiogroup',
                                fieldLabel: _('Test TLV'),
                                columns: 2,
                                vertical: false,
                                items: [{
                                    boxLabel: _('Yes'),
                                    name: 'testTlvPresent',
                                    margin: '0 0 0 5', //上右下左
                                    inputValue: 'true',
                                    checked: true
                                }, {
                                    boxLabel: _('No'),
                                    name: 'testTlvPresent',
                                    margin: '0 0 0 5', //上右下左
                                    inputValue: 'false'
                                }]
                            }, {
                                xtype: 'combobox',
                                fieldLabel: _('Interval'),
                                name: 'period',
                                store: {
                                    fields: ['name', 'value'],
                                    data: [{
                                        name: '1 SEC',
                                        value: '1 SEC'
                                    }, {
                                        name: '10 SEC',
                                        value: '10 SEC'
                                    }, {
                                        name: '1 MIN',
                                        value: '1 MIN'
                                    }, {
                                        name: '10 MIN',
                                        value: '10 MIN'
                                    }]
                                },
                                displayField: 'name',
                                valueField: 'value',
                                queryMode: 'local'
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            defaults: {
                                labelWidth: 100,
                                labelAlign: 'right'
                            },
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('Dest type'),
                                name: 'destinationType',
                                value: 'MEP',
                                readOnly: true
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: _('Packet length'),
                                name: 'pktLength',
                                minValue: 0,
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer')
                            }, {
                                xtype: 'combobox',
                                fieldLabel: _('Test TLV Type'),
                                name: 'testTlvType',
                                store: {
                                    fields: ['name', 'value'],
                                    data: [{
                                        name: 'Null signal - all zero without CRC-32',
                                        value: 'Null signal - all zero without CRC-32'
                                    }, {
                                        name: 'Null signal - all zero with CRC-32',
                                        value: 'Null signal - all zero with CRC-32'
                                    }, {
                                        name: 'PRBS 2power31-1 without CRC-32',
                                        value: 'PRBS 2power31-1 without CRC-32'
                                    }, {
                                        name: 'PRBS 2power31-1 with CRC-32',
                                        value: 'PRBS 2power31-1 with CRC-32'
                                    }]
                                },
                                displayField: 'name',
                                valueField: 'value',
                                queryMode: 'local'
                            }]
                        }],
                        buttons: [{
                            text: _('Start'),
                            formBind: true,
                            handler: function () {
                                me.onStartLbHandler(this, pw, eline_id);
                            },
                        }, {
                            text: _('Stop'),
                            disabled: true,
                            handler: function () {
                                me.onStopLbHandler(this, pw, eline_id);
                            },
                        }, {
                            text: _('Delete'),
                            disabled: true,
                            handler: function () {
                                me.onDelLbHandler(this, pw, eline_id);
                            },
                        }]
                    }
                ]
            }, {
                xtype: 'fieldset',
                title: _('Start to send packets'),
                margin: 8,
                hidden: true,
                items: [ //lb result form
                    {
                        xtype: 'form',
                        layout: 'hbox',
                        autoWidth: true,
                        autoHeight: true,
                        itemId: 'lb_result_form',
                        items: [{
                            xtype: 'container',
                            layout: 'vbox',
                            defaults: {
                                labelWidth: 85,
                                labelAlign: 'right'
                            },
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('Result Ok'),
                                name: 'lb-resultOK',
                                inputWrapCls: '',
                                triggerWrapCls: '',
                                fieldStyle: 'background:none',
                                readOnly: true,
                            }, {
                                xtype: 'textfield',
                                fieldLabel: _('nbrOfLbrInOutOfOrder'),
                                name: 'lb-nbrOfLbrInOutOfOrder',
                                inputWrapCls: '',
                                triggerWrapCls: '',
                                fieldStyle: 'background:none',
                                readOnly: true,
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            defaults: {
                                labelWidth: 70,
                                labelAlign: 'right'
                            },
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('nbrOfLbrIn'),
                                name: 'lb-nbrOfLbrIn',
                                inputWrapCls: '',
                                triggerWrapCls: '',
                                fieldStyle: 'background:none',
                                readOnly: true,
                            }, {
                                xtype: 'textfield',
                                fieldLabel: _('nbrOfLbrBadMsdu'),
                                name: 'lb-nbrOfLbrBadMsdu',
                                inputWrapCls: '',
                                triggerWrapCls: '',
                                fieldStyle: 'background:none',
                                readOnly: true,
                            }]
                        }]
                    },
                ]
            }, {
                xtype: 'form',
                layout: 'hbox',
                hidden: true,
                items: [{
                    xtype: 'container',
                    layout: 'vbox',
                    defaults: {
                        labelWidth: 70,
                        labelAlign: 'right',
                        style: {
                            'margin-left': '40px'
                        }
                    },
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('Total Sended'),
                        name: 'total-count',
                        inputWrapCls: '',
                        triggerWrapCls: '',
                        fieldStyle: 'background:none',
                        readOnly: true
                    }]
                }, {
                    xtype: 'container',
                    layout: 'vbox',
                    defaults: {
                        labelWidth: 70,
                        labelAlign: 'right',
                    },
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('Success Sened'),
                        name: 'success-count',
                        inputWrapCls: '',
                        triggerWrapCls: '',
                        fieldStyle: 'background:none',
                        readOnly: true
                    }]
                }]
            }]
        });
        win.show();
    },

    kbpsRender: function (me) {
        var font = document.createElement("font");
        font.setAttribute("color", "gray");
        var kbps = document.createTextNode('kbps');
        font.appendChild(kbps);
        font.style.marginLeft = "5px";
        me.el.dom.appendChild(font);
    },

    bytesRender: function (me) {
        var font = document.createElement("font");
        font.setAttribute("color", "gray");
        var kbps = document.createTextNode('kbps');
        font.appendChild(kbps);
        font.style.marginLeft = "5px";
        me.el.dom.appendChild(font);
    },

    onCirChange: function (me, newValue, oldValue, eOpts) {
        var fieldset = me.up('fieldset');
        var cbs_container = fieldset.items.items[1];
        var cbs_tx = cbs_container.items.items[0];
        var cir = parseInt(me.getValue());
        cbs_tx.setValue(parseInt(cir / 8));
    },

    onPirChange: function (me, newValue, oldValue, eOpts) {
        var fieldset = me.up('fieldset');
        var pbs_container = fieldset.items.items[1];
        var pbs_tx = pbs_container.items.items[1];
        var pir = parseInt(me.getValue());
        pbs_tx.setValue(parseInt(pir / 8));
    },

    onModifyQosReset: function (me, pw) {
        var win_update_form = me.up('form');
        var qos_values = pw['qos'];
        if (qos_values['qos-a2z-cir']) {
            win_update_form.form.findField('qos-a2z-cir').setValue(qos_values['qos-a2z-cir']);
        }
        if (qos_values['qos-a2z-pir']) {
            win_update_form.form.findField('qos-a2z-pir').setValue(qos_values['qos-a2z-pir']);
        }
        if (qos_values['qos-a2z-cbs']) {
            win_update_form.form.findField('qos-a2z-cbs').setValue(qos_values['qos-a2z-cbs']);
        }
        if (qos_values['qos-a2z-pbs']) {
            win_update_form.form.findField('qos-a2z-pbs').setValue(qos_values['qos-a2z-pbs']);
        }
        if (qos_values['qos-z2a-cir']) {
            win_update_form.form.findField('qos-z2a-cir').setValue(qos_values['qos-z2a-cir']);
        }
        if (qos_values['qos-z2a-pir']) {
            win_update_form.form.findField('qos-z2a-pir').setValue(qos_values['qos-z2a-pir']);
        }
        if (qos_values['qos-z2a-cbs']) {
            win_update_form.form.findField('qos-z2a-cbs').setValue(qos_values['qos-z2a-cbs']);
        }
        if (qos_values['qos-z2a-pbs']) {
            win_update_form.form.findField('qos-z2a-pbs').setValue(qos_values['qos-z2a-pbs']);
        }
    },

    onModifyQosSubmit: function (me, pw, eline_id) {
        var form = me.up('form');
        var fs = form.items.items;
        var values = form.getForm().getValues();
        var empty = false;
        for (var item in values) {
            if (!values[item]) {
                empty = true;
            }
        }
        if (empty == true) {
            Ext.Msg.alert(_('Tip'), _('No empty field is allowed. Please submit after check'));
            return;
        }
        var qos_a2z_cir = parseInt(values['qos-a2z-cir']);
        var qos_a2z_pir = parseInt(values['qos-a2z-pir']);
        var qos_z2a_cir = parseInt(values['qos-z2a-cir']);
        var qos_z2a_pir = parseInt(values['qos-z2a-pir']);
        if (qos_a2z_pir < qos_a2z_cir || qos_z2a_pir < qos_z2a_cir) {
            if (qos_a2z_pir < qos_a2z_cir) {
                var a2z_cir_container = fs[0].items.items[0];
                var a2z_cir_tx = a2z_cir_container.items.items[0];
                a2z_cir_tx.markInvalid(_('cir cannot be larger than pir'));
            }
            if (qos_z2a_pir < qos_z2a_cir) {
                var z2a_cir_container = fs[1].items.items[0];
                var z2a_cir_tx = z2a_cir_container.items.items[0];
                z2a_cir_tx.markInvalid(_('cir cannot be larger than pir'));
            }
            return;
        }
        //
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to modify QoS?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_values = values;
                    submit_values['eline-id'] = eline_id;
                    var submit_form = new Ext.form.Panel({});
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/qos_operation/modify',
                        params: {
                            input: submit_values
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Modifying QoS. Please wait......'),
                        success: function (form, action) {
                            me.up('window').close();
                            Ext.Msg.alert(_('Tip'), _('Modify QoS successfully'));
                        },
                        failure: function (form, action) {
                            var res = Ext.decode(action.response.responseText);
                            Ext.Msg.alert(_('Error'), _('Fail to modify QoS'));
                        }
                    }); // form
                    //
                }
            } // func
        );
        //
    },

    onModifyQos: function (me, pw, eline_id, link) {
        console.log("modify qos");
        var win = Ext.widget('window', {
            title: _('Modify QoS'),
            border: false,
            resizable: false,
            modal: true,
            constrain: true,//禁止窗口移出浏览器屏幕
            layout: 'fit',
            items: [{
                xtype: 'form',
                border: false,
                autoWidth: true,
                autoHeight: true,
                margin: 8,
                items: [{
                    xtype: 'fieldset',
                    title: _('Src NE') + ' ( ' + link['left_node_userlabel'] + ' )',
                    layout: 'hbox',
                    items: [{
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        defaults: {
                            labelWidth: 28,
                            labelAlign: "right"
                        },
                        items: [{
                            fieldLabel: 'CIR',
                            name: 'qos-a2z-cir',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onCirChange(qos, newValue, oldValue, eOpts);
                                }
                            }
                        }, {
                            fieldLabel: 'PIR',
                            name: 'qos-a2z-pir',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onPirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        defaults: {
                            labelWidth: 48,
                            labelAlign: "right"
                        },
                        items: [{
                            fieldLabel: 'CBS',
                            name: 'qos-a2z-cbs',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                }
                            }
                        }, {
                            fieldLabel: 'PBS',
                            name: 'qos-a2z-pbs',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                }
                            }
                        }]
                    }]
                }, {
                    xtype: 'fieldset',
                    title: _('Dest NE') + ' ( ' + link['right_node_userlabel'] + ' )',
                    layout: 'hbox',
                    items: [{
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        defaults: {
                            labelWidth: 28,
                            labelAlign: "right"
                        },
                        items: [{
                            fieldLabel: 'CIR',
                            name: 'qos-z2a-cir',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onCirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }, {
                            fieldLabel: 'PIR',
                            name: 'qos-z2a-pir',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onPirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        defaults: {
                            labelWidth: 48,
                            labelAlign: "right"
                        },
                        items: [{
                            fieldLabel: 'CBS',
                            name: 'qos-z2a-cbs',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                }
                            }
                        }, {
                            fieldLabel: 'PBS',
                            name: 'qos-z2a-pbs',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                }
                            }
                        }]
                    }]
                }],
                buttons: [{
                    text: _('Cancel'),
                    handler: function () {
                        this.up('window').close();
                    }
                }, {
                    text: _('Reset'),
                    handler: function () {
                        me.onModifyQosReset(this, pw);
                    },
                }, {
                    text: _('Submit'),
                    formBind: true,
                    handler: function () {
                        me.onModifyQosSubmit(this, pw, eline_id);
                    },
                }]
            }]
        });
        var win_update_form = win.down('form');
        var qos_values = pw['qos'];
        if (qos_values['qos-a2z-cir']) {
            win_update_form.form.findField('qos-a2z-cir').setValue(qos_values['qos-a2z-cir']);
        }
        if (qos_values['qos-a2z-pir']) {
            win_update_form.form.findField('qos-a2z-pir').setValue(qos_values['qos-a2z-pir']);
        }
        if (qos_values['qos-a2z-cbs']) {
            win_update_form.form.findField('qos-a2z-cbs').setValue(qos_values['qos-a2z-cbs']);
        }
        if (qos_values['qos-a2z-pbs']) {
            win_update_form.form.findField('qos-a2z-pbs').setValue(qos_values['qos-a2z-pbs']);
        }
        if (qos_values['qos-z2a-cir']) {
            win_update_form.form.findField('qos-z2a-cir').setValue(qos_values['qos-z2a-cir']);
        }
        if (qos_values['qos-z2a-pir']) {
            win_update_form.form.findField('qos-z2a-pir').setValue(qos_values['qos-z2a-pir']);
        }
        if (qos_values['qos-z2a-cbs']) {
            win_update_form.form.findField('qos-z2a-cbs').setValue(qos_values['qos-z2a-cbs']);
        }
        if (qos_values['qos-z2a-pbs']) {
            win_update_form.form.findField('qos-z2a-pbs').setValue(qos_values['qos-z2a-pbs']);
        }
        win.show();
    },

    onDeleteQos: function (pw, eline_id, link) {
        console.log("delete qos");
        //
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to delete QoS?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_form = new Ext.form.Panel({});
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/qos_operation/del',
                        params: {
                            input: {
                                'eline-id': eline_id
                            }
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Deleting QoS. Please wait......'),
                        success: function (form, action) {
                            Ext.Msg.alert(_('Tip'), _('Delete QoS successfully'));
                        },
                        failure: function (form, action) {
                            var res = Ext.decode(action.response.responseText);
                            Ext.Msg.alert(_('Error'), _('Fail to delete QoS'));
                        }
                    }); // form
                    //
                }
            } // func
        );
        //
    },

    onAddQosSubmit: function (me, eline_id) {
        var form = me.up('form');
        var fs = form.items.items;
        var values = form.getForm().getValues();
        var empty = false;
        for (var item in values) {
            if (!values[item]) {
                empty = true;
            }
        }
        if (empty == true) {
            Ext.Msg.alert(_('Tip'), _('No empty field is allowed. Please submit after check'));
            return;
        }
        var qos_a2z_cir = parseInt(values['qos-a2z-cir']);
        var qos_a2z_pir = parseInt(values['qos-a2z-pir']);
        var qos_z2a_cir = parseInt(values['qos-z2a-cir']);
        var qos_z2a_pir = parseInt(values['qos-z2a-pir']);
        if (qos_a2z_pir < qos_a2z_cir || qos_z2a_pir < qos_z2a_cir) {
            if (qos_a2z_pir < qos_a2z_cir) {
                var a2z_cir_container = fs[0].items.items[0];
                var a2z_cir_tx = a2z_cir_container.items.items[0];
                a2z_cir_tx.markInvalid(_('cir cannot be larger than pir'));
            }
            if (qos_z2a_pir < qos_z2a_cir) {
                var z2a_cir_container = fs[1].items.items[0];
                var z2a_cir_tx = z2a_cir_container.items.items[0];
                z2a_cir_tx.markInvalid(_('cir cannot be larger than pir'));
            }
            return;
        }
        //
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to add QoS?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_values = values;
                    submit_values['eline-id'] = eline_id;
                    var submit_form = new Ext.form.Panel({});
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/qos_operation/add',
                        params: {
                            input: submit_values
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Adding QoS. Please wait......'),
                        success: function (form, action) {
                            me.up('window').close();
                            Ext.Msg.alert(_('Tip'), _('Add QoS successfully'));
                        },
                        failure: function (form, action) {
                            var res = Ext.decode(action.response.responseText);
                            Ext.Msg.alert(_('Error'), _('Fail to add QoS'));
                        }
                    }); // form
                    //
                }
            } // func
        );
        //
    },

    onAddQos: function (me, pw, eline_id, link) {
        console.log("add qos");
        var win = Ext.widget('window', {
            title: _('Add QoS'),
            border: false,
            resizable: false,
            modal: true,
            constrain: true,//禁止窗口移出浏览器屏幕
            layout: 'fit',
            // The fields
            items: [{
                xtype: 'form',
                border: false,
                autoWidth: true,
                autoHeight: true,
                margin: 8,
                fieldDefaults: {
                    labelWidth: 60,
                    labelAlign: "right"
                },
                items: [{
                    xtype: 'fieldset',
                    title: _('Src NE') + ' ( ' + link['left_node_userlabel'] + ' )',
                    layout: 'hbox',
                    items: [{
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        items: [{
                            fieldLabel: 'CIR',
                            name: 'qos-a2z-cir',
                            margin: '0 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onCirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }, {
                            fieldLabel: 'PIR',
                            name: 'qos-a2z-pir',
                            margin: '5 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onPirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        items: [{
                            fieldLabel: 'CBS',
                            name: 'qos-a2z-cbs',
                            margin: '0 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                },
                            }
                        }, {
                            fieldLabel: 'PBS',
                            name: 'qos-a2z-pbs',
                            margin: '5 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                },
                            }
                        }]
                    }]
                }, {
                    xtype: 'fieldset',
                    title: _('Dest NE') + ' ( ' + link['right_node_userlabel'] + ' )',
                    layout: 'hbox',
                    items: [{
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        items: [{
                            fieldLabel: 'CIR',
                            name: 'qos-z2a-cir',
                            margin: '0 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onCirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }, {
                            fieldLabel: 'PIR',
                            name: 'qos-z2a-pir',
                            margin: '5 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.kbpsRender(qos);
                                },
                                change: function (qos, newValue, oldValue, eOpts) {
                                    me.onPirChange(qos, newValue, oldValue, eOpts);
                                },
                            }
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'vbox',
                        defaultType: 'numberfield',
                        items: [{
                            fieldLabel: 'CBS',
                            name: 'qos-z2a-cbs',
                            margin: '0 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                },
                            }
                        }, {
                            fieldLabel: 'PBS',
                            name: 'qos-z2a-pbs',
                            margin: '5 15 5 -15',
                            minValue: 0,
                            regex: /^[1-9]\d*$/,
                            regexText: _('Please enter a positive integer'),
                            listeners: {
                                render: function (qos) {
                                    me.bytesRender(qos);
                                },
                            }
                        }]
                    }]
                }],
                buttons: [{
                    text: _('Cancel'),
                    handler: function () {
                        this.up('window').close();
                    }
                }, {
                    text: _('Reset'),
                    handler: function () {
                        this.up('form').reset();
                    }
                }, {
                    text: _('Submit'),
                    formBind: true,
                    handler: function () {
                        me.onAddQosSubmit(this, eline_id);
                    }
                }]
            }]
        });
        win.show();
    },

    onStartLM: function (me, pw, eline_id) {
        console.log("start lm");
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to start LM?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_form = new Ext.form.Panel({});
                    var lm_send_result = false;
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/send_lm_dm/lm/start',
                        params: {
                            input: {
                                'service-id': eline_id
                            }
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Starting LM. Please wait......'),
                        success: function (form, action) {
                            lm_send_result = true;
                            if (lm_send_result) { //如果发送lm start成功 则添加lm性能采集任务
                                var params = {
                                    'business-id': eline_id,
                                    'collect-intervals': 5
                                };
                                params['collect-metric'] = ['packet-loss-rate'];
                                submit_form.getForm().submit({
                                    url: '/config/sdn/eline/lm_dm_pm_task/add',
                                    params: {
                                        input: params
                                    },
                                    jsonSubmit: true,
                                    success: function (form, action) {
                                        me.getViewModel().set('lm_stop_disabled', false);
                                        Ext.Msg.alert(_('Tip'), _('Start LM successfully'));
                                    },
                                    failure: function (form, action) {
                                        var res = Ext.decode(action.response.responseText);
                                        if (res['error']) {
                                            if (res['error'] == 'unknown') {
                                                Ext.Msg.alert(_('Error'), _('Fail to start LM (fail to add the LM performance collection task) with unknown reason'));
                                            } else {
                                                Ext.Msg.alert(_('Error'), _('Fail to start LM (fail to add the LM performance collection task) because:') + res['error'][0]['error-message']);
                                            }
                                        }
                                        // Ext.Msg.alert(_('Tip'), '开启lm失败');
                                    }
                                }); // form
                            }
                            // Ext.Msg.alert(_('Tip'), '成功开启lm');
                        },
                        failure: function (form, action) {
                            lm_send_result = false;
                            var res = Ext.decode(action.response.responseText);
                            if (res['error']) {
                                if (res['error'] == 'unknown') {
                                    Ext.Msg.alert(_('Error'), _('Fail to start LM with unknown reason'));
                                } else {
                                    Ext.Msg.alert(_('Error'), _('Fail to start LM because ') + res['error'][0]['error-message']);
                                }
                            }
                            return;
                        }
                    }); // form
                    //

                }
            } // func
        );
    },

    onStopLM: function (me, pw, eline_id) {
        console.log("stop lm");
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to stop LM?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_form = new Ext.form.Panel({});
                    var lm_send_result = false;
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/send_lm_dm/lm/stop',
                        params: {
                            input: {
                                'service-id': eline_id
                            }
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Stopping LM. Please wait......'),
                        success: function (form, action) {
                            lm_send_result = true;
                            if (lm_send_result) { //如果发送lm stop成功 则删除lm性能采集任务
                                var params = {
                                    'business-id': eline_id,
                                    'collect-intervals': 5
                                };
                                params['collect-metric'] = ['packet-loss-rate'];
                                submit_form.getForm().submit({
                                    url: '/config/sdn/eline/lm_dm_pm_task/remove',
                                    params: {
                                        input: params
                                    },
                                    jsonSubmit: true,
                                    success: function (form, action) {
                                        me.getViewModel().set('lm_stop_disabled', true);
                                        Ext.Msg.alert(_('Tip'), _('Stop LM successfully'));
                                    },
                                    failure: function (form, action) {
                                        var res = Ext.decode(action.response.responseText);
                                        if (res['error']) {
                                            if (res['error'] == 'unknown') {
                                                Ext.Msg.alert(_('Error'), _('Fail to stop LM (fail to delete the LM performance collection task) with unknown reason'));
                                            } else {
                                                Ext.Msg.alert(_('Error'), _('Fail to stop LM (fail to delete the LM performance collection task) because: ') + res['error'][0]['error-message']);
                                            }
                                        }
                                    }
                                }); // form
                            }
                            // Ext.Msg.alert(_('Tip'), '成功开启lm');
                        },
                        failure: function (form, action) {
                            lm_send_result = false;
                            var res = Ext.decode(action.response.responseText);
                            if (res['error']) {
                                if (res['error'] == 'unknown') {
                                    Ext.Msg.alert(_('Error'), _('Fail to stop LM with unknown reason'));
                                } else {
                                    Ext.Msg.alert(_('Error'), _('Fail to stop LM because ') + res['error'][0]['error-message']);
                                }
                            }
                            return;
                        }
                    }); // form
                    //
                }
            } // func
        );
    },

    onStartDM: function (me, pw, eline_id) {
        console.log("start dm");
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to start DM?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_form = new Ext.form.Panel({});
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/send_lm_dm/dm/start',
                        params: {
                            input: {
                                'service-id': eline_id
                            }
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Starting DM. Please wait......'),
                        success: function (form, action) {
                            var dm_send_result = true;
                            if (dm_send_result) { //如果发送dm start成功 则添加dm性能采集任务
                                var params = {
                                    'business-id': eline_id,
                                    'collect-intervals': 5
                                };
                                params['collect-metric'] = ['delay'];
                                submit_form.getForm().submit({
                                    url: '/config/sdn/eline/lm_dm_pm_task/add',
                                    params: {
                                        input: params
                                    },
                                    jsonSubmit: true,
                                    success: function (form, action) {
                                        me.getViewModel().set('dm_stop_disabled', false);
                                        Ext.Msg.alert(_('Tip'), _('Start DM successfully'));
                                    },
                                    failure: function (form, action) {
                                        var res = Ext.decode(action.response.responseText);
                                        if (res['error']) {
                                            if (res['error'] == 'unknown') {
                                                Ext.Msg.alert(_('Error'), _('Fail to start DM (fail to add the DM performance collection task) with unknown reason'));
                                            } else {
                                                Ext.Msg.alert(_('Error'), _('Fail to start DM (fail to add the DM performance collection task) because: ') + res['error'][0]['error-message']);
                                            }
                                        }
                                        // Ext.Msg.alert(_('Tip'), '开启lm失败');
                                    }
                                }); // form
                            }
                            // Ext.Msg.alert(_('Tip'), '成功开启lm');
                        },
                        failure: function (form, action) {
                            var dm_send_result = false;
                            var res = Ext.decode(action.response.responseText);
                            if (res['error']) {
                                if (res['error'] == 'unknown') {
                                    Ext.Msg.alert(_('Error'), _('Fail to start DM with unknown reason'));
                                } else {
                                    Ext.Msg.alert(_('Error'), _('Fail to start DM because ') + res['error'][0]['error-message']);
                                }
                            }
                            return;
                        }
                    }); // form
                    //

                }
            } // func
        );
    },

    onStopDM: function (me, pw, eline_id) {
        console.log("stop dm");
        Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to stop DM?'),
            function (btn) {
                if (btn == 'yes') {
                    //
                    var submit_form = new Ext.form.Panel({});
                    submit_form.getForm().submit({
                        url: '/config/sdn/eline/send_lm_dm/dm/stop',
                        params: {
                            input: {
                                'service-id': eline_id
                            }
                        },
                        jsonSubmit: true,
                        waitTitle: _('Tip'),
                        waitMsg: _('Stopping DM. Please wait......'),
                        success: function (form, action) {
                            var dm_send_result = true;
                            if (dm_send_result) { //如果发送dm stop成功 则删除dm性能采集任务
                                var params = {
                                    'business-id': eline_id,
                                    'collect-intervals': 5
                                };
                                params['collect-metric'] = ['delay'];
                                submit_form.getForm().submit({
                                    url: '/config/sdn/eline/lm_dm_pm_task/remove',
                                    params: {
                                        input: params
                                    },
                                    jsonSubmit: true,
                                    success: function (form, action) {
                                        me.getViewModel().set('dm_stop_disabled', true);
                                        Ext.Msg.alert(_('Tip'), _('Stop DM successfully'));
                                    },
                                    failure: function (form, action) {
                                        var res = Ext.decode(action.response.responseText);
                                        if (res['error']) {
                                            if (res['error'] == 'unknown') {
                                                Ext.Msg.alert(_('Error'), _('Fail to stop DM (fail to delete the DM performance collection task) with unknown reason'));
                                            } else {
                                                Ext.Msg.alert(_('Error'), _('Fail to stop DM (fail to delete the DM performance collection task) because ') + res['error'][0]['error-message']);
                                            }
                                        }
                                    }
                                }); // form
                            }
                        },
                        failure: function (form, action) {
                            var dm_send_result = false;
                            var res = Ext.decode(action.response.responseText);
                            if (res['error']) {
                                if (res['error'] == 'unknown') {
                                    Ext.Msg.alert(_('Error'), _('Fail to stop DM with unknown reason'));
                                } else {
                                    Ext.Msg.alert(_('Error'), _('Fail to stop DM because ') + res['error'][0]['error-message']);
                                }
                            }
                            return;
                        }
                    }); // form
                    //

                }
            } // func
        );
    },
    //===========================================LB================================================

    //右键链路菜单
    onLinkcontextmenu: function (topopanel, link, x, y) {
        var me = this;
        var type = me.getViewModel().get('current_topo_layer');
        var items = [{
            text: _('View Properties'),
            iconCls: 'x-fa fa-file-text-o',
            handler: function () {
                var panel = me.lookupReference('propGrid');
                var checkbox = me.lookupReference('properties_checkbox');

                checkbox.setValue(true);
                panel.setHidden(false);

                if (!link) {
                    panel.setRootNode({
                        expanded: true,
                        iconCls: 'sdn-no-icon',
                        children: []
                    });

                    return ;
                }

                var rootData = me.onDisplayNameByType(type, link);
                panel.setRootNode(rootData);
            }
        }];

        if (type == 'pw') {
            var eline_id = link['eline_id'];
            var pw_id = link['pw_id'];
            var pw = this.getSpecificPw(eline_id, pw_id);

            console.log("eline_id", eline_id);
            console.log("pw_id", pw_id);
            // console.log('pw', pw);

            if (pw && pw['oam'] && pw['oam']['cc-interval']) { //如果存在oam且oam为cc
                var lb = {
                    text: _('Configure LB'),
                    iconCls: 'x-fa fa-cog',
                    handler: function () {
                        me.onConfigLB(pw, eline_id);
                    }
                };
                items.push(lb);
                // if (pw['oam'] && pw['oam']['lm-mode'] == 'on-demand') {
                    var lm_start = {
                        text: _('Start LM'),
                        iconCls: 'x-fa fa-play',
                        handler: function () {
                            me.onStartLM(me, pw, eline_id);
                        }
                    };
                    var lm_stop = {
                        text: _('Stop LM'),
                        iconCls: 'x-fa fa-stop',
                        bind: {
                            disabled: '{lm_stop_disabled}'
                        },
                        handler: function () {
                            me.onStopLM(me, pw, eline_id);
                        }
                    };

                    items.push(lm_start);
                    items.push(lm_stop);
                // }

                // if (pw['oam'] && pw['oam']['dm-mode'] == 'on-demand') {
                    var dm_start = {
                        text: _('Start DM'),
                        iconCls: 'x-fa fa-play',
                        handler: function () {
                            me.onStartDM(me, pw, eline_id);
                        }
                    };
                    var dm_stop = {
                        text: _('Stop DM'),
                        iconCls: 'x-fa fa-stop',
                        bind: {
                            disabled: '{dm_stop_disabled}'
                        },
                        handler: function () {
                            me.onStopDM(me, pw, eline_id);
                        }
                    };

                    items.push(dm_start);
                    items.push(dm_stop);
                // }
            }

            if (pw) {
                if (pw['qos']) { //如果存在qos
                    //支持修改或删除qos
                    var qos_modify = {
                        text: _('Modify QoS'),
                        iconCls: 'x-fa fa-edit',
                        handler: function () {
                            me.onModifyQos(me, pw, eline_id, link);
                        }
                    };
                    var qos_delete = {
                        text: _('Delete QoS'),
                        iconCls: 'x-fa fa-trash',
                        handler: function () {
                            me.onDeleteQos(pw, eline_id, link);
                        }
                    };

                    items.push(qos_modify);
                    items.push(qos_delete);
                } else { //如果不存在qos
                    //支持添加qos
                    var qos_add = {
                        text: _('Add QoS'),
                        iconCls: 'x-fa fa-plus',
                        handler: function () {
                            me.onAddQos(me, pw, eline_id, link);
                        }
                    };
                    items.push(qos_add);
                }
            }
        } else if (type == 'eline') {
            items.push('-');
            items.push({
                text: _('PsCommandType'),
                iconCls: 'x-fa fa-asterisk',
                menu: [
                    {
                        xtype: 'menucheckitem',
                        checked: false,
                        group: 'PsCommandType',
                        value: 'forcedSwitchWorkToProtect',
                        text: _('ForcedSwitchWorkToProtect'),
                        tooltip: _('ForcedSwitchWorkToProtect'),
                        checkHandler: function (btn) {
                            me.onForcedProtect(link.eline_id, btn.getValue());
                        }
                    },
                    {
                        xtype: 'menucheckitem',
                        checked: false,
                        group: 'PsCommandType',
                        text: _('ClearForcedProtect'),
                        value: 'clear',
                        tooltip: _('ClearForcedProtect'),
                        checkHandler: function (btn) {
                            me.onForcedProtect(link.eline_id, btn.getValue());
                        }
                    }
                ]
            });
        }

        var rightMenu = new Ext.menu.Menu({
            items: items
        });

        topopanel.add(rightMenu);
        rightMenu.showAt(x, y);
    },

    //双击节点事件
    onNodedblclick: function (node) {
        // console.log(node);
        var isSubnet = node.type == 'cloud';
        var status = node.cloudStatus == 'close' ? 'open' : 'close';
        var viewModel = this.getViewModel();
        var layer = viewModel.get('current_topo_layer');
        var elindid = viewModel.get('current_eline_id');
        var pwid = viewModel.get('current_pw_id');


        if (isSubnet) {
            var topopanel = this.lookupReference('topoPanel');
            if (layer == 'pw') {
                url = '/config/sdn/elinetopo/pw/' + elindid + '?cloudid=' + node.nodeid + '&status=' + status + '&tm=' + new Date().getTime();
            } else if (layer == 'lsp') {
                url = '/config/sdn/elinetopo/lsp/' + elindid + '/' + pwid + '?cloudid=' + node.nodeid + '&status=' + status + '&tm=' + new Date().getTime();
            }

            this.autoRefreshTopo(url);
        } else {
            node.fixed = false;
        }
    },

    // 进入eline层拓扑
    gotoElineTopo: function () {
        var elineid = this.getViewModel().get('current_eline_id');
        var url = elineid ? '/config/sdn/elinetopo/eline/' + elineid + '?tm=' + new Date().getTime() : '';
        var topopanel = this.lookupReference('topoPanel');
        var breadcrumb = this.lookupReference('breadcrumbeline');
        var elineBreadBtn = breadcrumb.items.items[0];
        var pwBreadBtn = breadcrumb.items.items[1];
        var gotoTopBtn = this.lookupReference('gotoTopoTop');
        var gotobackBtn = this.lookupReference('gotoBackupTopo');
        var viewModel = this.getViewModel();

        gotoTopBtn.setDisabled(true);
        gotobackBtn.setDisabled(true);
        viewModel.set('current_topo_layer', 'eline');
        gotoTopBtn.setDisabled(true);
        gotobackBtn.setDisabled(true);
        elineBreadBtn.setPressed(true);
        pwBreadBtn.setText('pw');

        this.autoRefreshTopo(url);
    },

    //进入pw层拓扑
    gotoPwTopo: function (elineid) {
        var me = this;
        var breadcrumb = me.lookupReference('breadcrumbeline');
        var pwBreadBtn = breadcrumb.items.items[1];
        var url = elineid ? '/config/sdn/elinetopo/pw/' + elineid + '?tm=' + new Date().getTime() : '';
        var topopanel = this.lookupReference('topoPanel');
        var pwBreadBtn = breadcrumb.items.items[1];
        var gotoTopBtn = this.lookupReference('gotoTopoTop');
        var gotobackBtn = this.lookupReference('gotoBackupTopo');
        var viewModel = me.getViewModel();

        gotoTopBtn.setDisabled(false);
        gotobackBtn.setDisabled(false);


        viewModel.set('current_topo_layer', 'pw');
        viewModel.set('current_eline_id', elineid);
        pwBreadBtn.setPressed(true);
        pwBreadBtn.setText('pw');
        this.autoRefreshTopo(url);
    },

    //进入lsp拓扑
    gotoLspTopo: function (elineid, pwid, pwname) {
        var me = this;
        var breadcrumb = me.lookupReference('breadcrumbeline');
        var lspBreadBtn = breadcrumb.items.items[2];
        var pwBreadBtn = breadcrumb.items.items[1];
        var url = (elineid && pwid) ? '/config/sdn/elinetopo/lsp/' + elineid + '/' + pwid + '?tm=' + new Date().getTime() : '';
        var topopanel = this.lookupReference('topoPanel');
        var gotoTopBtn = this.lookupReference('gotoTopoTop');
        var gotobackBtn = this.lookupReference('gotoBackupTopo');
        var viewModel = me.getViewModel();

        gotoTopBtn.setDisabled(false);
        gotobackBtn.setDisabled(false);

        viewModel.set('current_topo_layer', 'lsp');
        viewModel.set('current_eline_id', elineid);
        viewModel.set('current_pw_id', pwid);

        lspBreadBtn.setPressed(true);
        pwBreadBtn.setText('pw:' + pwname);
        this.autoRefreshTopo(url);
    },

    //双击链路事件
    onLinkdblclick: function (link) {
        var me = this;
        var currentTopoLayer = me.getViewModel().get('current_topo_layer');

        switch (currentTopoLayer) {
            case 'eline':
            {
                me.gotoPwTopo(link['eline_id']);
            }
                ;
                break;
            case 'pw':
            {
                me.gotoLspTopo(link['eline_id'], link['pw_id'], link['pw_name']);
                me.getViewModel().set('current_pw_name', link['pw_name']);
            }
                ;
                break;
        }
    },

    //显示隐藏基本属性展示面板
    onToggleProperties: function (me, newValue, oldValue, eOpts) {
        var panel = this.lookupReference('propGrid');
        panel.setVisible(newValue);
    },

    // ============================== topo toolbar ===============================
    //锁定视图
    onTopoLockView: function (me, e, eOpts) {
        var panel = this.view;
        var topopanel = this.lookupReference('topoPanel');
        topopanel.view_locked = true;
        panel.down('#UnlockView').setHidden(false);
        panel.down('#LockView').setHidden(true);
    },

    //解锁视图
    onTopoUnlockView: function (me, e, eOpts) {
        var panel = this.view;
        var topopanel = this.lookupReference('topoPanel');
        topopanel.view_locked = false;
        panel.down('#UnlockView').setHidden(true);
        panel.down('#LockView').setHidden(false);
    },

    //拓扑搜索
    onTopoSearch: function (me, e, eOpts) {
        this.search_topo();
    },

    //拓扑视图缩小
    onZoomin: function (me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomIn();
    },

    //拓扑视图放大
    onZoomout: function (me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomOut();
    },

    //恢复拓扑视图比例
    onZoomReset: function (me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomReset();
    },

    //
    onZoomFit: function (me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        topopanel.zoomFit();
    },

    //修改拓扑布局
    onTopoNewLayout: function (me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        me.checked = true;
        this.topo_new_layout(topopanel, me.layout_type);
    },

    //导航条
    onToggleBreadcrumbe: function (group, button, isPressed, eOpts) {
        var items = group.items.items;

        for (var index in items) {
            items[index].pressed ? items[index].addCls('breadcrumb-btn-background') : items[index].removeCls('breadcrumb-btn-background');
        }
    },

    //鼠标点击节点
    onNodemousedown: function (s, node) {
        var me = this;
        node.each(function (d) {
            if (d.selected) {
                me.onChangeNodeProperties(d);
                return;
            }
        });
    },

    //鼠标点击链路
    onLinkmousedown: function (s, link) {
        var me = this;
        link.each(function (d) {
            if (d.selected) {
                me.onChangeLinksProperties(d);
                return;
            }
        });
    },

    onToggleForceDirectedLayout: function (me, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').fixed_all(!newValue);
    },

    onChangeForceDirectedLinkLength: function (slider, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').setForcelinkDistance(newValue);
    },

    onChangeForceDirectedCharge: function (slider, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').setForceCharge(0 - newValue)
    },

    onOptionMenushow: function (self, menu, eOpts) {
        var topopanel = this.lookupReference('topoPanel');
        this.lookupReference('enable_force_layout_checkox').setValue(!topopanel.is_fixed_all());
        this.lookupReference('multi_link_style_menu').setDisabled(!topopanel.exist_multi_link());
        this.lookupReference('parallel_line_space_menu').setDisabled(!topopanel.exist_multi_link());
    },

    onToggleShowNodeLabel: function (self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').showNodeLabel(newValue);
    },

    onToggleShowLinkLabel: function (self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').showLinkLabel(newValue);
    },

    onTopoSelectNodeSize: function (self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').setNodeSize(newValue.v);
    },

    onTopoSelectParallelLinkStyle: function (self, newValue, oldValue, eOpts) {
        this.lookupReference('topoPanel').setMultiLinkStyle(newValue.v2);
    },

    onChangeParallelLineSpace: function (slider, newValue, thumb, eOpts) {
        this.lookupReference('topoPanel').setLinkSpace(0 - newValue);
    },

    onTopoSaveLayout: function () {
        var me = this;
        var topo = me.lookupReference('topoPanel');
        var ary = [];

        topo.node.each(function (d) {
            ary.push({
                nodeid: d.nodeid,
                x: d.x,
                y: d.y
            });
        });

        var background_params = {
            background_type: topo.background_type,
            background_opacity: topo.background_opacity
        };

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
                {xtype: 'hidden', name: 'nodes', value: JSON.stringify(ary)},
                {xtype: 'hidden', name: 'background_params', value: JSON.stringify(background_params)},
                {xtype: 'hidden', name: 'layer', value: me.getViewModel().get('current_topo_layer')}
            ]
        }).getForm().submit({
            url: '/topo/band/save_layout',
            waitTitle: _('Please wait...'),
            waitMsg: _('Saving layout...'),
            failure: function (form, action) {
                Ext.Msg.alert(_('FailureTip'), _('SaveLayoutFailure'));
            }
        });
    },

    //初始化背景
    initBackgroundInfo: function () {
        // 拓扑图背景信息呈现
        var topo = this.lookupReference('topoPanel');

        var colortbar = this.lookupReference('topoBackgroundColorBtn');
        var imgtbar = this.lookupReference('topoBackgroundImageBtn');
        var maptbar = this.lookupReference('toggleGeographyBackgroundBtn');

        var opacityslider = this.lookupReference('topoBackgroundOpacity');
        opacityslider.setValue(topo.background_opacity * 100);
        this.getViewModel().setData({
            background_opacity: topo.background_opacity * 100
        });

        if (topo.background_type == 'img') {
            imgtbar.setChecked(true);
        } else if (topo.background_type == 'color') {
            colortbar.setChecked(true);
        } else {
            maptbar.setChecked(true);
        }
    },

    onCheckBackgroundSelection: function (menuitem, checked, eOpts) {
        var me = this;
        var panel = this.lookupReference('topoPanel');
        var opacity = 50;

        if (checked) {
            switch (menuitem.reference) {
                case 'topoBackgroundImageBtn':
                    if (panel.map != null) {
                        var mapSetting = panel.getMapSetting();
                        panel.mapCenter_temp = mapSetting.mapCenter;
                        panel.mapZoom_temp = mapSetting.mapZoom;
                        panel.mapType_temp = mapSetting.mapType;
                        panel.destroyGeoMap();
                    }

                    panel.setBackgroundImage(panel.background_img_temp);
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
            this.getViewModel().setData({
                background_opacity: opacity
            });
        }
    },

    onLocationSelf: function () {
        var topopanel = this.lookupReference('topoPanel');

        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                topopanel.map.panTo(r.point);
                console.log(_('YourLocation') + '：' + r.point.lng + ',' + r.point.lat);
            } else {
                console.log('failed' + this.getStatus());
            }
        }, {
            enableHighAccuracy: true
        })

    },

    // for test
    onClickConvert: function () {

        var me = this;
        var panel = me.lookupReference('topoPanel');
        var map = panel.map;

        var b = map.getBounds();
        console.log('getBounds', b);

        var ws = b.getSouthWest();
        console.log('getSouthWest', ws);

        var ne = b.getNorthEast();
        console.log('getSouthWest', ne);

        var polyline = new BMap.Polyline([ws, ne], {
            strokeColor: "red",
            strokeWeight: 2,
            strokeOpacity: 1
        });
        map.addOverlay(polyline);

        var pws = map.pointToPixel(ws);
        console.log('pointToPixel', pws);

        var pne = map.pointToPixel(ne);
        console.log('pointToPixel', pne);

    },

    onTopoBackgroundImage: function () {
        // alert('onTopoBackground');
        var topopanel = this.lookupReference('topoPanel');
        Ext.create('Admin.view.topology.main.backgroundPopWin', {
            renderTo: Ext.getBody(),
            parentsubnetid: topopanel.json.parentnode[0].SYMBOL_ID,
            topopanel: topopanel
        }).show();
    },

    onBackgroundColorChange: function (colorselector, color) {
        var topopanel = this.lookupReference('topoPanel');
        topopanel.background_color_temp = '#' + color;
        topopanel.setBackgroundColor('#' + color);
    },

    onChangeBackgroundTransparency: function (slider, newValue, thumb, eOpts) {
        // console.log(newValue);
        var panel = this.lookupReference('topoPanel');
        if (panel.background_type == 'color') {
            panel.background_opacity_color = newValue / 100;
        } else if (panel.background_type == 'img') {
            panel.background_opacity_img = newValue / 100;
        } else {
            panel.background_opacity_map = newValue / 100;
        }

        panel.setBackgroundOpacity(newValue / 100);

        this.getViewModel().setData({
            background_opacity: newValue
        });

        // Ext.create('Ext.form.Panel', {
        //           items: [
        //               {xtype: 'hidden', name: 'subnetid', value: panel.json.parentnode[0].SYMBOL_ID },
        //               {xtype: 'hidden', name: 'opacity', value: newValue/100 }
        //           ]
        //       }).getForm().submit({
        //           url: '/topo/background/opacity',
        //           // waitTitle : _('Please wait...'),
        //           // waitMsg : _('Please wait...'),
        //           success: function(form, action) {
        //               if (action.result.with_err) {
        //                   Ext.Msg.alert(_('With Errors'), action.result.msg);
        //               } else {
        //                   // Ext.Msg.alert(_('Success'), action.result.msg);
        //                   panel.setBackgroundOpacity(newValue/100);

        //               }
        //           },
        //           failure: function(form, action) {
        //               Ext.Msg.alert(_('Tips'), action.result.msg);
        //           }
        //       }); // form
    },

    onToggleGeographyOperation: function (me, newValue, thumb, eOpts) {
        var panel = this.lookupReference('topoPanel');
        panel.enableGeoMapOperation(newValue);
    },

    onToggleSyncWithGeoMap: function (me, newValue, thumb, eOpts) {
        var panel = this.lookupReference('topoPanel');
        panel.mapSync = newValue;
    },

    onElineTopoClick: function () {
        this.gotoElineTopo();
    },

    onPwTopoClick: function (btn) {
        this.gotoPwTopo(this.getViewModel().get('current_eline_id'));
    },

    onLspTopoClick: function () {
        var viewModel = this.getViewModel();
        this.gotoLspTopo(viewModel.get('current_eline_id'), viewModel.get('current_pw_id'), viewModel.get('current_pw_name'));
    },

    onTopoRefresh: function (me, e, eOpts) {
        var topopanel = this.lookupReference('topoPanel');

        topopanel.reloadTopo();
    },

    displayTopo: function (topo, ids) {
        // 若选择同一层次的拓扑节点，则不重新绘制拓扑图
        if (ids.length == 0) {
            return;
        }

        function iscontain(ids, id) {
            var len = ids.length;
            for (var i = 0; i < len; i++) {
                if (ids[i] == id)
                    return true;
            }
            return false;
        }

        var samelayer = false;
        if (topo.node != null) {
            topo.node.each(function (d) {
                if (iscontain(ids, d.SYMBOL_ID)) {
                    d.selected = true;
                    samelayer = true;
                } else {
                    if (!topo.CtrlPress) {
                        d.selected = false;
                    }
                }
            });
        }

        if (samelayer || topo.CtrlPress) {
            topo.tick();
            return;
        }
        topo.selectedNodes = ids;
        // 绘制拓扑图
        var url = '/topo/topo_map/map?SYMBOL_ID=' + ids[0] + '&tm=' + new Date().getTime();
        this.autoRefreshTopo(url);
    },

    topo_new_layout: function (topo, layout_type) {
        var nodes = [];
        var links = [];
        topo.node.each(function (d) {
            nodes.push(d.symbol_id);
        });
        topo.link.each(function (d) {
            links.push({
                source: d.source.symbol_id,
                target: d.target.symbol_id
            });
        });

        Ext.create('Ext.form.Panel', {
            items: [{
                xtype: 'hidden',
                name: 'nodes',
                value: JSON.stringify(nodes)
            }, {
                xtype: 'hidden',
                name: 'links',
                value: JSON.stringify(links)
            }, {
                xtype: 'hidden',
                name: 'width',
                value: topo.svg_width
            }, {
                xtype: 'hidden',
                name: 'height',
                value: topo.svg_height
            }, {
                xtype: 'hidden',
                name: 'type',
                value: layout_type
            }]
        }).getForm().submit({
            url: '/config/sdn/elinetopo/new_layout',
            waitTitle: _('Please wait...'),
            waitMsg: _('Redo layout...'),
            success: function (form, action) {
                var r = action.result;
                topo.node.each(function (d) {
                    d.fixed = 1;
                    d.px = r.nodes[d.symbol_id].x;
                    d.py = r.nodes[d.symbol_id].y;
                    d.x = r.nodes[d.symbol_id].x;
                    d.y = r.nodes[d.symbol_id].y;
                });
                topo.tick();
            },
            failure: function (form, action) {
                // Ext.Msg.alert(_('Operation Failure'), _('Operation Failure'));
                console.log('auto layout failure with ' + layout_type)
            }
        }); // form
    },

    moveNodeTopoPanelChange: function (topopanel, fromNodeAry) {
        var selectedNodes = [];
        topopanel.node.each(function (d) {
            if (d.selected) {
                selectedNodes.push(d);
            }
        });
        topopanel.deleteNode(selectedNodes);
    },

    // 拓扑搜索功能
    search_topo: function () {
        var me = this;
        var vieModel = me.getViewModel();
        var topopanel = me.lookupReference('topoPanel');
        var searchstore = Ext.create('Ext.data.Store', {
            fields: ['value', 'text'],
            data: [
                //{text: _('NeName'), value: 'name'},
                {text: _('NeUserlabel'), value: 'userlabel'}
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
            defaultType: 'textfield',
            items: [{
                xtype: 'form',
                border: false,
                autoWidth: true,
                autoHeight: true,
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                defaultType: 'textfield',
                padding: 10,
                fieldDefaults: {
                    labelWidth: 120,
                    labelAlign: "left",
                    margin: 5
                },
                items: [{
                    xtype: "combo",
                    fieldLabel: _('Search category'),
                    name: 'search_category',
                    store: searchstore,
                    displayField: 'text',
                    valueField: 'value',
                    value: 'userlabel',
                    readOnly: true,
                    queryMode: 'local',
                    editable: false
                }, {
                    xtype: 'textfield',
                    fieldLabel: _('Search content'),
                    name: 'search_content',
                    value: ''
                }, {
                    xtype: 'radiogroup',
                    //id: 'condition',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [{
                        boxLabel: _('Perfect Match'),
                        name: 'condition',
                        inputValue: 'perfect'
                    }, {
                        boxLabel: _('Contain'),
                        name: 'condition',
                        inputValue: 'contain',
                        checked: true
                    }]
                }],
                buttons: [{
                    text: _('Cancel'),
                    handler: function () {
                        this.up('window').close();
                    }
                }, {
                    text: _('Reset'),
                    handler: function () {
                        this.up('form').reset();
                    }
                }, {
                    text: _('Search'),
                    handler: function () {
                        var searchObj = this.up('form').getValues();
                        var viewModel = me.getViewModel();
                        var type = viewModel.get('current_topo_layer');
                        var url = '/config/sdn/elinetopo/';

                        switch (type) {
                            case 'eline':
                                url += ('eline/' + viewModel.get('current_eline_id') + '/');
                                break;
                            case 'pw':
                                url += ('pw/' + viewModel.get('current_eline_id') + '/');
                                break;
                            case 'lsp':
                                url += ('lsp/' + viewModel.get('current_eline_id') + '/' + viewModel.get('current_pw_id') + '/');
                                break;
                        }

                        me.searchObj = searchObj;
                        url += '?search_category=' + searchObj.search_category;
                        url += '&search_content=' + searchObj.search_content;
                        url += '&condition=' + searchObj.condition;
                        url += '&tm=' + new Date().getTime();

                        me.onAutoRefreshTopo(url);
                        win.close();
                    }
                }]
            }]
        });

        win.show();
        win.down('form').getForm().setValues(me.searchObj);
    },

    onBtnAfterrender: function (btn, eOpts) {
        var tips = [{
            target: this.lookup('tipButton'),
            anchor: 'top',
            anchorOffset: 120,
            html: _('Tips') + ':' + _('ELineTopoTips')
        }];

        this.tips = Ext.Array.map(tips, function (cfg) {
            cfg.showOnTap = true;
            return new Ext.tip.ToolTip(cfg);
        })
    },

    onBtnDestroy: function () {
        this.tips = Ext.destroy(this.tips);
    }
});