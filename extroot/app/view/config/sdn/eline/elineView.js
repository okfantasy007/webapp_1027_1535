Ext.define('Admin.view.config.sdn.eline.elineView', {
    extend: 'Ext.panel.Panel',
    xtype: 'elineView',
    requires: [
        'Ext.selection.CellModel',
        'Admin.view.base.PagedGrid',
        'Admin.view.config.sdn.topo.elineTopoView',
        'Admin.view.config.sdn.topo.elineTopoModel',
        'Admin.view.config.sdn.topo.elineTopoController'
    ],
    cls: 'shadow',
    layout: 'card',
    viewModel: {
        stores: {
            eline_list_grid_store: {
                autoLoad: true,
                pageSize: 5,
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/eline/list',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'totalCount'
                    }
                }
            },
            port_list_store_by_node: {
                async: false,
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/resource/get_port_list/sdn/-1/db',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                sorters: 'user-label'
            },
            add_node_grid_store: {
                fields: ['node-direction', 'node-id', 'port-id', 'dot1q-vlan-bitmap', 'cir', 'cbs', 'pir', 'pbs', 'node-type'],
                data: []
            },
            add_xc_grid_store: {
                fields: ['direction', 'role', 'ext-node-id', 'ext-link-id', 'in-label', 'out-label', 'vlan', 'pw-label'],
                data: []
            },
            cc_exp_store: {
                fields: ['cc-exp'],
                data: [{
                    'cc-exp': 'AF1'
                }, {
                    'cc-exp': 'AF2'
                }, {
                    'cc-exp': 'AF3'
                }, {
                    'cc-exp': 'AF4'
                }, {
                    'cc-exp': 'BE'
                }, {
                    'cc-exp': 'EF'
                }, {
                    'cc-exp': 'CS6'
                }, {
                    'cc-exp': 'CS7'
                }]
            },
            lm_dm_mode_store: {
                fields: ['lm-dm-mode-id', 'lm-dm-mode-name'],
                data: [{
                    'lm-dm-mode-id': '1',
                    'lm-dm-mode-name': _('Disable')
                }, {
                    'lm-dm-mode-id': '2',
                    'lm-dm-mode-name': _('Pre-activate')
                }, {
                    'lm-dm-mode-id': '3',
                    'lm-dm-mode-name': _('In use')
                }]
            },
            cc_interval_store: {
                fields: ['cc-interval'],
                data: [{
                    'cc-interval': '3.3'
                }, {
                    'cc-interval': '10'
                }, {
                    'cc-interval': '100'
                }, {
                    'cc-interval': '1000'
                }]
            },
            pwList: {
                autoLoad: true,
                field: [{
                    name: 'id',
                    type: 'string'
                }, {
                    name: 'index',
                    type: 'string'
                }, {
                    name: 'egress-ne-id',
                    type: 'string'
                }, {
                    name: 'ingress-ne-id',
                    type: 'string'
                }, {
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'operate-status',
                    type: 'string'
                }, {
                    name: 'admin-status',
                    type: 'string'
                }, {
                    name: 'role',
                    type: 'string'
                }, {
                    name: 'route',
                    type: 'array'
                }, {
                    name: 'tunnel-ids',
                    type: 'array'
                }, {
                    name: 'oam',
                    type: 'object'
                }],
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json'
                    }
                },
                data: []
            },
            protect_type_store: {
                fields: ['protect-type-id', 'protect-type-name'],
                data: [{
                    'protect-type-id': '1',
                    'protect-type-name': _('Unprotected')
                }, {
                    'protect-type-id': '2',
                    'protect-type-name': _('LSP 1:1 APS protection')
                }, {
                    'protect-type-id': '3',
                    'protect-type-name': _('LSP 1:1 PSC protection')
                }, {
                    'protect-type-id': '4',
                    'protect-type-name': _('PW 1:1 APS protection')
                }, {
                    'protect-type-id': '5',
                    'protect-type-name': _('PW 1:1 PSC protection')
                }, {
                    'protect-type-id': '6',
                    'protect-type-name': _('PW redundancy')
                }]
            },
            access_action_store: {
                field: ['access-action'],
                data: [{
                    'access-action': 'Keep'
                }, {
                    'access-action': 'Pop'
                }, {
                    'access-action': 'Push'
                }]
            },
            select_all_node_list_store: {
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/resource/get_all_node_list/select/db',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true,
                // sorters: 'user-label'
            },
            pure_all_node_list_store: {
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/resource/get_all_node_list/pure/db',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true
                    // sorters: 'user-label'
            },
            ext_node_list_store: {
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/resource/get_extnode_list/db',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true,
                sorters: 'user-label'
            },
            ext_link_list_store: {
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/resource/get_extlink_list/-1/db',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true,
                sorters: 'user-label'
            }
        }
    },
    controller: {
        elineBaseFormNext: function() {
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            create_eline_tabpanel.setActiveTab(1);
        },
        elineBasePreViewCommon: function() {
            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();
            var eline_base_pre_form = this.lookupReference('eline_base_pre_form');
            eline_base_pre_form.getForm().findField('name').setValue(eline_base_values['name']);
            eline_base_pre_form.getForm().findField('user-label').setValue(eline_base_values['user-label']);
            var protect_type = eline_base_values['protect-type'];
            var pre_protect_type = "";
            switch (protect_type) {
                case '1':
                    pre_protect_type = _('Unprotected');
                    break;
                case '2':
                    pre_protect_type = _('LSP 1:1 APS protection');
                    break;
                case '3':
                    pre_protect_type = _('LSP 1:1 PSC protection');
                    break;
                case '4':
                    pre_protect_type = _('PW 1:1 APS protection');
                    break;
                case '5':
                    pre_protect_type = _('PW 1:1 PSC protection');
                    break;
                case '6':
                    pre_protect_type = _('PW redundancy');
                    break;
            }
            eline_base_pre_form.getForm().findField('protect-type').setValue(pre_protect_type);

        },
        elineOamPreViewCommon: function() {
            var eline_oam_form = this.lookupReference('eline_oam_form');
            var eline_oam_values = eline_oam_form.getForm().getValues();
            var oam_type = eline_oam_values['oam-type'];

            var eline_oam_pre_form = this.lookupReference('eline_oam_pre_form');
            var container1 = eline_oam_pre_form.items.items[0];
            var items1 = container1.items.items;
            var container2 = eline_oam_pre_form.items.items[1];
            var items2 = container2.items.items;
            var container3 = eline_oam_pre_form.items.items[2];
            var items3 = container3.items.items;
            switch (oam_type) {
                case '0': //未配置oam
                    container2.setHidden(true);
                    container3.setHidden(true);
                    eline_oam_pre_form.getForm().findField('oam-type').setValue(_('Not configurated'));
                    for (var i = 1; i < items1.length; i++) {
                        items1[i].setHidden(true);
                    }
                    break;
                case '1': //配置oam cc
                    container2.setHidden(false);
                    container3.setHidden(false);
                    eline_oam_pre_form.getForm().findField('oam-type').setValue('CC');
                    for (var i = 1; i < items1.length - 1; i++) {
                        items1[i].setHidden(false);
                        items2[i].setHidden(false);
                        // eline_oam_pre_form.getForm().findField('cc-exp').setValue(eline_oam_values['cc-exp']);
                        if (eline_oam_values['cc-interval']) {
                            eline_oam_pre_form.getForm().findField('cc-interval').setValue(eline_oam_values['cc-interval'] + ' ms');
                        }
                        /*                        var lm_mode = "";
                                                if (eline_oam_values['lm-mode'] == '1') {
                                                    lm_mode = _('Disable');
                                                } else if (eline_oam_values['lm-mode'] == '2') {
                                                    lm_mode = _('Pre-activate');
                                                } else if (eline_oam_values['lm-mode'] == '3') {
                                                    lm_mode = _('In use');
                                                }
                                                var dm_mode = "";
                                                if (eline_oam_values['dm-mode'] == '1') {
                                                    dm_mode = _('Disable');
                                                } else if (eline_oam_values['dm-mode'] == '2') {
                                                    dm_mode = _('Pre-activate');
                                                } else if (eline_oam_values['dm-mode'] == '3') {
                                                    dm_mode = _('In use');
                                                }
                                                eline_oam_pre_form.getForm().findField('lm-mode').setValue(lm_mode);
                                                eline_oam_pre_form.getForm().findField('dm-mode').setValue(dm_mode);*/
                    }
                    items1[items1.length - 1].setHidden(true);
                    items2[items2.length - 1].setHidden(true);
                    break;
                case '2': //未配置oam bfd
                    container2.setHidden(false);
                    container3.setHidden(false);
                    eline_oam_pre_form.getForm().findField('oam-type').setValue('BFD');
                    eline_oam_pre_form.getForm().findField('localdetectmultiplier').setValue(eline_oam_values['localdetectmultiplier']);
                    if (eline_oam_values['localtxinterval']) {
                        eline_oam_pre_form.getForm().findField('localtxinterval').setValue(eline_oam_values['localtxinterval'] + ' ms');
                    }
                    for (var i = 1; i < items1.length - 1; i++) {
                        items1[i].setHidden(true);
                        items2[i].setHidden(true);
                    }
                    items1[items1.length - 1].setHidden(false);
                    items2[items2.length - 1].setHidden(false);
                    break;
            }

        },
        elineBasePreview: function() {
            this.elineBasePreViewCommon();
            var eline_pre_panel = this.lookupReference('eline_pre_panel');
            var oam_pre_fieldset = this.lookupReference('oam_pre_fieldset');
            var route_pre_fieldset = this.lookupReference('route_pre_fieldset');
            oam_pre_fieldset.setHidden(true);
            route_pre_fieldset.setHidden(true);
            this.getView().setActiveItem(eline_pre_panel);
        },
        elineOamPreview: function() {
            this.elineBasePreViewCommon();
            this.elineOamPreViewCommon();

            var eline_pre_panel = this.lookupReference('eline_pre_panel');
            var oam_pre_fieldset = this.lookupReference('oam_pre_fieldset');
            var route_pre_fieldset = this.lookupReference('route_pre_fieldset');
            oam_pre_fieldset.setHidden(false);
            route_pre_fieldset.setHidden(true);
            this.getView().setActiveItem(eline_pre_panel);
        },
        elineRoutePreview: function() {
            this.elineBasePreViewCommon();
            this.elineOamPreViewCommon();

            var eline_pre_panel = this.lookupReference('eline_pre_panel');
            var oam_pre_fieldset = this.lookupReference('oam_pre_fieldset');
            var route_pre_fieldset = this.lookupReference('route_pre_fieldset');
            oam_pre_fieldset.setHidden(false);
            route_pre_fieldset.setHidden(false);
            this.getView().setActiveItem(eline_pre_panel);
        },
        getElineQos: function(eline) {
            var qos = {};
            if (eline['ingress-end-points'] && eline['ingress-end-points'].length == 1) {
                qos['qos-a2z-cir'] = eline['ingress-end-points'][0]['cir'];
                qos['qos-a2z-cbs'] = eline['ingress-end-points'][0]['cbs'];
                qos['qos-a2z-pir'] = eline['ingress-end-points'][0]['pir'];
                qos['qos-a2z-pbs'] = eline['ingress-end-points'][0]['pbs'];
                eline['ingress-end-points'][0].id = '1';
                delete eline['ingress-end-points'][0]['cir'];
                delete eline['ingress-end-points'][0]['cbs'];
                delete eline['ingress-end-points'][0]['pir'];
                delete eline['ingress-end-points'][0]['pbs'];
            }
            if (eline['egress-end-points'] && eline['egress-end-points'].length < 3) {
                // qos['qos-z2a-cir'] = eline['egress-end-points'][0]['cir'];
                // qos['qos-z2a-cbs'] = eline['egress-end-points'][0]['cbs'];
                // qos['qos-z2a-pir'] = eline['egress-end-points'][0]['pir'];
                // qos['qos-z2a-pbs'] = eline['egress-end-points'][0]['pbs'];
                eline['egress-end-points'].forEach(function(egress, index, arr) {
                    egress.id = String(index + 1);
                    // delete egress['cir'];
                    // delete egress['cbs'];
                    // delete egress['pir'];
                    // delete egress['pbs'];
                });
            }
            return qos;
        },
        getBaseEline: function() {
            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();
            var eline_name = eline_base_values['name'];
            var eline_userlabel = eline_base_values['user-label'];
            var eline_container = eline_base_form.items.items[0];
            var eline_name_tx = eline_container.items.items[0].items.items[0];
            var eline_userlabel_tx = eline_container.items.items[1].items.items[0];
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            if (!eline_name && !eline_userlabel) {
                create_eline_tabpanel.setActiveTab(0);
                eline_name_tx.markInvalid(_('Please enter the E-Line name'));
                eline_userlabel_tx.markInvalid(_('Please enter the E-Line user label'));
                Ext.Msg.alert(_('Tip'), _('Please enter the E-Line name and user label'));
                return;
            } else if (!eline_name && eline_userlabel) {
                create_eline_tabpanel.setActiveTab(0);
                eline_name_tx.markInvalid(_('Please enter the E-Line name'));
                Ext.Msg.alert(_('Tip'), _('Please enter the E-Line name'));
                return;
            } else if (eline_name && !eline_userlabel) {
                create_eline_tabpanel.setActiveTab(0);
                eline_userlabel_tx.markInvalid(_('Please enter the E-Line user label'));
                Ext.Msg.alert(_('Tip'), _('Please enter the E-Line user label'));
                return;
            }

            var add_node_grid = this.lookupReference('add_node_grid');
            var node_list = add_node_grid.getStore().getData().items;
            var node_list_data = [];
            node_list.forEach(function(ele) {
                var node = $.extend(true, {}, ele.data); //深度复制
                delete node.id;
                if (node['node-type']) {
                    if (node['node-type'] == 'sdn' && node['node-id'] && node['port-id'] && node['port-id'].indexOf(node['node-id']) !== -1) {
                        node['port-id'] = node['port-id'].substring(node['node-id'].length + 1);
                    }
                    delete node['node-type'];
                }
                node_list_data.push(node);
            });
            // console.log("node_list_data", node_list_data);
            //组织数据
            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();

            var eline = {};
            eline.id = SdnSvc.createUUID();
            eline['name'] = eline_base_values['name'];
            eline['user-label'] = eline_base_values['user-label'];
            eline['admin-status'] = "admin-up";
            eline['operate-status'] = "operate-up";
            eline['parent-ncd-id'] = "parent-ncd-id";
            eline['snc-type'] = "simple";
            var protect_type = eline_base_values['protect-type'];

            //带保护的pw
            switch (protect_type) {
                case "6": //pw冗余
                    eline.protection = {};
                    eline['protection']['layer-rate'] = "pw";
                    eline['protection']['linear-protection-protocol'] = "NONE";
                    eline['protection']['wtr'] = "0";
                    eline['protection']['name'] = eline['name'] + "-pro1";
                    break;
                case "2": //lsp 1:1 APS协议 保护
                    eline.protection = {};
                    eline['protection']['layer-rate'] = "lsp";
                    eline['protection']['snc-id'] = "1";
                    eline['protection']['linear-protection-type'] = 'path-protection-1-to-1';
                    eline['protection']['linear-protection-protocol'] = "APS";
                    break;
                case "3": //lsp 1:1 PSC协议 保护
                    eline.protection = {};
                    eline['protection']['layer-rate'] = "lsp";
                    eline['protection']['snc-id'] = "1";
                    eline['protection']['linear-protection-type'] = 'path-protection-1-to-1';
                    eline['protection']['linear-protection-protocol'] = "PSC";
                    eline['protection']['reroute-revertive-mode'] = "rvt";
                    break;
                case "4": //pw 1:1 APS协议 保护
                    eline.protection = {};
                    eline['protection']['layer-rate'] = "pw";
                    eline['protection']['snc-id'] = "1";
                    eline['protection']['linear-protection-type'] = 'path-protection-1-to-1';
                    eline['protection']['linear-protection-protocol'] = "APS";
                    break;
                case "5": //pw 1:1 PSC协议 保护
                    eline.protection = {};
                    eline['protection']['layer-rate'] = "pw";
                    eline['protection']['snc-id'] = "1";
                    eline['protection']['linear-protection-type'] = 'path-protection-1-to-1';
                    eline['protection']['linear-protection-protocol'] = "PSC";
                    eline['protection']['reroute-revertive-mode'] = "rvt";
                    break;
                default:
                    break;
                    /* case "pw permanent-1-to-1 APS protection":永久保护
                     eline['protection']['snc-id'] = "1";
                     eline['protection']['linear-protection-type'] = 'permanent-1-to-1-protection';
                     break; */
            }

            //组装源宿节点
            eline['ingress-end-points'] = [];
            eline['egress-end-points'] = [];
            for (var i = 0; i < node_list_data.length; i++) {
                var node = node_list_data[i];
                var node_data = {};
                node_data.id = String(i + 1);
                node_data['ne-id'] = node['node-id'];
                node_data['ltp-id'] = node['port-id'];
                node_data['role'] = node['node-role'] == '1' ? "master" : "Slave"; //北向接口只接受node的角色为master或Slave（不是slave）
                node_data['access-action'] = node['access-action'];
                if (node['action-vlan-id']) {
                    node_data['action-vlan-id'] = node['action-vlan-id'];
                }
                if (node['dot1q-vlan-bitmap']) {
                    node_data['dot1q-vlan-bitmap'] = node['dot1q-vlan-bitmap'];
                }
                node_data['cir'] = node['cir'];
                node_data['cbs'] = node['cbs'];
                node_data['pir'] = node['pir'];
                node_data['pbs'] = node['pbs'];
                if (node['node-direction'] == '1') {
                    eline['ingress-end-points'].push(node_data);
                } else if (node['node-direction'] == '2') {
                    eline['egress-end-points'].push(node_data);
                }
            }
            return eline;
        },
        elineBaseSubmit: function() {
            var eline = this.getBaseEline();
            if (!eline) {
                return;
            }
            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();
            var protect_type = eline_base_values['protect-type'];

            //确定pw的个数
            var pw_length = 0;
            if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) { //一源两宿
                pw_length = 2;
            } else if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 1) { //一源一宿
                if (protect_type == "2" || protect_type == "3" || protect_type == "4" || protect_type == "5" || protect_type == "6") { //一源一宿pw冗余也是两段pw
                    pw_length = 2;
                } else {
                    pw_length = 1;
                }
            } else if (eline['ingress-end-points'].length > 1 && eline['egress-end-points'].length > 2) {
                console.log("Ingress/Egress numbers out of beyond!");
            }

            //组装qos信息
            var qos = this.getElineQos(eline);

            eline.pw = [];

            //构造pw
            for (var j = 0; j < pw_length; j++) {

                var pw_data = {
                    'encaplate-type': "cep-mpls",
                    'ctrl-word-support': "nonsupport",
                    'sn-support': "nonsupport",
                    'vccv-type': "nonsupport",
                    'conn-ack-type': "none",
                    'admin-status': "admin-up",
                    'operate-status': "operate-up"
                };
                pw_data.id = SdnSvc.createUUID();
                pw_data['name'] = eline['name'] + "-pw-" + (j + 1);
                pw_data['index'] = String(j + 1);

                // if (qos['qos-a2z-cir'] && qos['qos-a2z-pir'] && qos['qos-z2a-cir'] && qos['qos-z2a-pir']) {
                //     pw_data.qos = qos; //qos放在pw中
                // }
                var qos_copy = $.extend(true, {}, qos);

                pw_data['ingress-ne-id'] = eline['ingress-end-points'][0]['ne-id'];
                pw_data['egress-ne-id'] = eline['egress-end-points'][0]['ne-id'];
                if (j == 0) {
                    pw_data['role'] = 'master';
                    // if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) {
                    var master_engress_node = eline['egress-end-points'].filter(function(ele) {
                        return ele['role'] == 'master';
                    })[0];
                    pw_data['egress-ne-id'] = master_engress_node['ne-id'];
                    qos_copy['qos-z2a-cir'] = master_engress_node['cir'];
                    qos_copy['qos-z2a-cbs'] = master_engress_node['cbs'];
                    qos_copy['qos-z2a-pir'] = master_engress_node['pir'];
                    qos_copy['qos-z2a-pbs'] = master_engress_node['pbs'];
                    if (qos_copy['qos-a2z-cir'] !== "" && qos_copy['qos-a2z-pir'] !== "" && qos_copy['qos-z2a-cir'] !== "" && qos_copy['qos-z2a-pir'] !== "") {
                        pw_data.qos = qos_copy; //qos放在pw中
                    }
                    delete master_engress_node['cir'];
                    delete master_engress_node['cbs'];
                    delete master_engress_node['pir'];
                    delete master_engress_node['pbs'];
                    // }
                } else if (j == 1) {
                    pw_data['role'] = 'slave';
                    if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) {
                        var slave_egress_node = eline['egress-end-points'].filter(function(ele) {
                            return ele['role'] == 'Slave';
                        })[0];
                        pw_data['egress-ne-id'] = slave_egress_node['ne-id'];
                        qos_copy['qos-z2a-cir'] = slave_egress_node['cir'];
                        qos_copy['qos-z2a-cbs'] = slave_egress_node['cbs'];
                        qos_copy['qos-z2a-pir'] = slave_egress_node['pir'];
                        qos_copy['qos-z2a-pbs'] = slave_egress_node['pbs'];
                        if (qos_copy['qos-a2z-cir'] !== "" && qos_copy['qos-a2z-pir'] !== "" && qos_copy['qos-z2a-cir'] !== "" && qos_copy['qos-z2a-pir'] !== "") {
                            pw_data.qos = qos_copy; //qos放在pw中
                        }
                        delete slave_egress_node['cir'];
                        delete slave_egress_node['cbs'];
                        delete slave_egress_node['pir'];
                        delete slave_egress_node['pbs'];
                    }
                }
                eline.pw.push(pw_data);
            }

            if (protect_type == "2" || protect_type == "3" && eline.pw && eline.pw.length == 2) {
                var pw1 = eline.pw[0];
                var pw2 = eline.pw[1];
                delete eline.pw;
                eline.lsp = [pw1, pw2];
            }

            // console.log("eline", eline);

            var eline_list_grid = this.lookupReference('eline_list_grid');
            var me = this;
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to create the current E-Line?'),
                function(btn) {
                    if (btn == 'yes') {
                        //
                        var create_eline_hidden_form = me.lookupReference('create_eline_hidden_form');
                        create_eline_hidden_form.getForm().submit({
                            url: '/config/sdn/eline/create',
                            params: {
                                input: eline
                            },
                            jsonSubmit: true,
                            waitTitle: _('Tip'),
                            waitMsg: _('Creating E-Line. Please wait......'),
                            success: function(form, action) {
                                eline_list_grid.getStore().reload({
                                    callback: function(r, scope, success) { //此处有callback函数，在创建成功之后需要把这个callback函数置为空
                                        if (success) {
                                            Ext.Msg.alert(_('Tip'), _('Create E-Line successfully'));
                                            me.getView().setActiveItem(me.lookupReference('eline_list_panel'));
                                            window.node_direction = 'form_to_grid';
                                        }
                                    }
                                });
                            },
                            failure: function(form, action) {
                                var res = Ext.decode(action.response.responseText);
                                var error = res.error;
                                console.log("error", error);
                                if (error == 'unkonwn') {
                                    Ext.Msg.alert(_('Error'), _('Fail to create E-line with unknown reason'));
                                } else if (error == 'sdn controller unfound') {
                                    Ext.Msg.alert(_('Error'), _('Fail to create E-line because sdn controller unfound'));
                                } else {
                                    if (error.length == 0) {
                                        Ext.Msg.alert(_('Error'), _('Fail to create E-line with unknown reason'));
                                    } else {
                                        var error_msg = "";
                                        if (error.length == 1) {
                                            error_msg = error_msg + error[0]['errorMessage'];
                                            Ext.Msg.alert(_('Error'), _('Fail to create E-Line because ') + "[ " + _('error code') + ": " + error[0]['errorCode'] + " ] " + error[0]['errorMessage']);
                                        } else {
                                            //多条错误信息
                                            for (var e = 0; e < error.length - 1; e++) {
                                                error_msg = error_msg + (e + 1) + " ) [ " + _('error code') + ": " + error[e]['errorCode'] + " ] " + error[e]['errorMessage'] + "<br/>";
                                            }
                                            error_msg = error_msg + error.length + " ) [ " + _('error code') + ": " + error[error.length - 1]['errorCode'] + " ] " + error[error.length - 1]['errorMessage'];
                                            me.openFailureWindow(error_msg);
                                            // Ext.Msg.alert(_('Tip'), '创建业务失败 [ 总错误码：'+res['error-code']+' ]，可能的原因如下：'+ '<br/>' + error_msg);
                                        }
                                    }
                                }
                            }
                        }); // form
                        //
                    }
                } // func
            );
        },
        elineOamFormPrev: function() {
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            create_eline_tabpanel.setActiveTab(0);
        },
        elineOamFormNext: function() {
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            create_eline_tabpanel.setActiveTab(2);
        },
        getElineOam: function() {
            //获取oam信息
            var oam = {};
            var eline_oam_form = this.lookupReference('eline_oam_form');
            var eline_oam_values = eline_oam_form.getForm().getValues();
            var oam_type = eline_oam_values['oam-type'];

            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();
            var protect_type = eline_base_values['protect-type'];

            if (oam_type !== '0') { //如果配置了oam
                var tmp_num = Math.round(Math.random() * 10000) + 1;
                switch (oam_type) {
                    case '1': //cc
                        var lm_mode = "";
                        var dm_mode = "";
                        if (eline_oam_values['lm-mode'] == '1') {
                            lm_mode = 'disable';
                        } else if (eline_oam_values['lm-mode'] == '2') {
                            lm_mode = 'preactive';
                        } else if (eline_oam_values['lm-mode'] == '3') {
                            lm_mode = 'on-demand';
                        }
                        if (eline_oam_values['dm-mode'] == '1') {
                            dm_mode = 'disable';
                        } else if (eline_oam_values['dm-mode'] == '2') {
                            dm_mode = 'preactive';
                        } else if (eline_oam_values['dm-mode'] == '3') {
                            dm_mode = 'on-demand';
                        }
                        oam = {
                            'layer-rate': protect_type == "2" || protect_type == "3" ? 'lsp' : 'pw',
                            // 'cc-exp': eline_oam_values['cc-exp'],
                            // 'meg-id': tmp_num,
                            'meps': [{
                                'id': 1,
                                'name': 1
                            }, {
                                'id': 2,
                                'name': 2
                            }],
                            'cc-interval': eline_oam_values['cc-interval']
                                // 'lm-mode': lm_mode,
                                // 'dm-mode': dm_mode
                        };
                        break;
                    case '2': //bfd
                        oam = {
                            'localdetectmultiplier': eline_oam_values['localdetectmultiplier'] ? eline_oam_values['localdetectmultiplier'] : '3',
                            'ttl': 255,
                            'localtxinterval': eline_oam_values['localtxinterval']
                        };
                        break;
                }
            }
            return oam;
        },
        elineOamSubmit: function() {
            var eline = this.getBaseEline();
            if (!eline) {
                return;
            }
            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();
            var protect_type = eline_base_values['protect-type'];

            var eline_oam_form = this.lookupReference('eline_oam_form');
            var eline_oam_values = eline_oam_form.getForm().getValues();
            var oam_type = eline_oam_values['oam-type'];

            //确定pw的个数
            var pw_length = 0;
            if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) { //一源两宿
                pw_length = 2;
            } else if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 1) { //一源一宿
                if (protect_type == "2" || protect_type == "3" || protect_type == "4" || protect_type == "5" || protect_type == "6") { //一源一宿pw冗余也是两段pw
                    pw_length = 2;
                } else {
                    pw_length = 1;
                }
            } else if (eline['ingress-end-points'].length > 1 && eline['egress-end-points'].length > 2) {
                console.log("Ingress/Egress numbers out of beyond!");
            }

            //组装qos信息
            var qos = this.getElineQos(eline);

            //获取oam信息
            var oam = this.getElineOam();
            eline.pw = [];

            //构造pw
            for (var j = 0; j < pw_length; j++) {

                var pw_data = {
                    'encaplate-type': "cep-mpls",
                    'ctrl-word-support': "nonsupport",
                    'sn-support': "nonsupport",
                    'vccv-type': "nonsupport",
                    'conn-ack-type': "none",
                    'admin-status': "admin-up",
                    'operate-status': "operate-up"
                };
                pw_data.id = SdnSvc.createUUID();
                pw_data['name'] = eline['name'] + "-pw-" + (j + 1);
                pw_data['index'] = String(j + 1);

                // if (qos['qos-a2z-cir'] && qos['qos-a2z-pir'] && qos['qos-z2a-cir'] && qos['qos-z2a-pir']) {
                //     pw_data.qos = qos; //qos放在pw中
                // }
                var qos_copy = $.extend(true, {}, qos);
                if (oam_type !== '0') {
                    if (oam_type == '1') {
                        // oam['belonged-id'] = j + 1;
                        oam['belonged-id'] = pw_data.id;
                        oam['name'] = String(j + 1);
                    }
                    pw_data.oam = oam; //oam放在pw中
                }

                pw_data['ingress-ne-id'] = eline['ingress-end-points'][0]['ne-id'];
                pw_data['egress-ne-id'] = eline['egress-end-points'][0]['ne-id'];
                if (j == 0) {
                    pw_data['role'] = 'master';
                    // if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) {
                    var master_engress_node = eline['egress-end-points'].filter(function(ele) {
                        return ele['role'] == 'master';
                    })[0];
                    pw_data['egress-ne-id'] = master_engress_node['ne-id'];
                    qos_copy['qos-z2a-cir'] = master_engress_node['cir'];
                    qos_copy['qos-z2a-cbs'] = master_engress_node['cbs'];
                    qos_copy['qos-z2a-pir'] = master_engress_node['pir'];
                    qos_copy['qos-z2a-pbs'] = master_engress_node['pbs'];
                    if (qos_copy['qos-a2z-cir'] !== "" && qos_copy['qos-a2z-pir'] !== "" && qos_copy['qos-z2a-cir'] !== "" && qos_copy['qos-z2a-pir'] !== "") {
                        pw_data.qos = qos_copy; //qos放在pw中
                    }
                    delete master_engress_node['cir'];
                    delete master_engress_node['cbs'];
                    delete master_engress_node['pir'];
                    delete master_engress_node['pbs'];
                    // }
                } else if (j == 1) {
                    pw_data['role'] = 'slave';
                    if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) {
                        var slave_egress_node = eline['egress-end-points'].filter(function(ele) {
                            return ele['role'] == 'Slave';
                        })[0];
                        pw_data['egress-ne-id'] = slave_egress_node['ne-id'];
                        qos_copy['qos-z2a-cir'] = slave_egress_node['cir'];
                        qos_copy['qos-z2a-cbs'] = slave_egress_node['cbs'];
                        qos_copy['qos-z2a-pir'] = slave_egress_node['pir'];
                        qos_copy['qos-z2a-pbs'] = slave_egress_node['pbs'];
                        if (qos_copy['qos-a2z-cir'] !== "" && qos_copy['qos-a2z-pir'] !== "" && qos_copy['qos-z2a-cir'] !== "" && qos_copy['qos-z2a-pir'] !== "") {
                            pw_data.qos = qos_copy; //qos放在pw中
                        }
                        delete slave_egress_node['cir'];
                        delete slave_egress_node['cbs'];
                        delete slave_egress_node['pir'];
                        delete slave_egress_node['pbs'];
                    }
                }
                eline.pw.push(pw_data);
            }
            if (protect_type == "2" || protect_type == "3" && eline.pw && eline.pw.length == 2) {
                var pw1 = eline.pw[0];
                var pw2 = eline.pw[1];
                delete eline.pw;
                eline.lsp = [pw1, pw2];
            }
            // console.log("eline", eline);
            var eline_list_grid = this.lookupReference('eline_list_grid');
            var me = this;
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to create the current E-Line?'),
                function(btn) {
                    if (btn == 'yes') {
                        //
                        var create_eline_hidden_form = me.lookupReference('create_eline_hidden_form');
                        create_eline_hidden_form.getForm().submit({
                            url: '/config/sdn/eline/create',
                            params: {
                                input: eline
                            },
                            jsonSubmit: true,
                            timeout: 600, //设置最大等待时间600秒
                            waitTitle: _('Tip'),
                            waitMsg: _('Creating E-Line. Please wait......'),
                            success: function(form, action) {
                                eline_list_grid.getStore().reload({
                                    callback: function(r, scope, success) {
                                        if (success) {
                                            Ext.Msg.alert(_('Tip'), _('Create E-Line successfully'));
                                            me.getView().setActiveItem(me.lookupReference('eline_list_panel'));
                                            window.node_direction = 'form_to_grid';
                                        }
                                    }
                                });
                            },
                            failure: function(form, action) {
                                var res = Ext.decode(action.response.responseText);
                                var error = res.error;
                                console.log("error", error);
                                if (error == 'unkonwn') {
                                    Ext.Msg.alert(_('Error'), _('Fail to create E-line with unknown reason'));
                                } else if (error == 'sdn controller unfound') {
                                    Ext.Msg.alert(_('Error'), _('Fail to create E-line because sdn controller unfound'));
                                } else {
                                    if (error.length == 0) {
                                        Ext.Msg.alert(_('Error'), _('Fail to create E-line with unknown reason'));
                                    } else {
                                        var error_msg = "";
                                        if (error.length == 1) {
                                            error_msg = error_msg + error[0]['errorMessage'];
                                            Ext.Msg.alert(_('Error'), _('Fail to create E-Line because ') + "[ " + _('error code') + ": " + error[0]['errorCode'] + " ] " + error[0]['errorMessage']);
                                        } else {
                                            //多条错误信息
                                            for (var e = 0; e < error.length - 1; e++) {
                                                error_msg = error_msg + (e + 1) + " ) [ " + _('error code') + ": " + error[e]['errorCode'] + " ] " + error[e]['errorMessage'] + "<br/>";
                                            }
                                            error_msg = error_msg + error.length + " ) [ " + _('error code') + ": " + error[error.length - 1]['errorCode'] + " ] " + error[error.length - 1]['errorMessage'];
                                            me.openFailureWindow(error_msg);
                                            // Ext.Msg.alert(_('Tip'), '创建业务失败 [ 总错误码：'+res['error-code']+' ]，可能的原因如下：'+ '<br/>' + error_msg);
                                        }
                                    }
                                }
                            }
                        }); // form
                        //
                    }
                } // func
            );
        },
        elineRouteFormPrev: function() {
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            create_eline_tabpanel.setActiveTab(1);
        },
        elineRouteSubmit: function() {
            var eline = this.getBaseEline();
            if (!eline) {
                return;
            }
            var eline_base_form = this.lookupReference('eline_base_form');
            var eline_base_values = eline_base_form.getForm().getValues();
            var protect_type = eline_base_values['protect-type'];

            var eline_oam_form = this.lookupReference('eline_oam_form');
            var eline_oam_values = eline_oam_form.getForm().getValues();
            var oam_type = eline_oam_values['oam-type'];

            //
            var add_xc_grid = this.lookupReference('add_xc_grid');
            var xc_list = add_xc_grid.getStore().getData().items;
            var xc_list_data = [];
            xc_list.forEach(function(ele) {
                delete ele.data.id;
                xc_list_data.push(ele.data);
            });
            // console.log("xc_list_data", xc_list_data);

            var master_xc_list = [];
            var slave_xc_list = [];
            var src_master_xc_list = [];
            var des_master_xc_list = [];
            var src_slave_xc_list = [];
            var des_slave_xc_list = [];
            //筛选出工作xc和保护xc
            if (xc_list_data && xc_list_data.length > 0) {
                master_xc_list = xc_list_data.filter(function(ele) {
                    return ele['role'] == '1';
                });
                src_master_xc_list = master_xc_list.filter(function(ele) {
                    return ele['direction'] == '1';
                });
                des_master_xc_list = master_xc_list.filter(function(ele) {
                    return ele['direction'] == '2';
                });
                slave_xc_list = xc_list_data.filter(function(ele) {
                    return ele['role'] == '2';
                });
                //过滤出源端slave xc
                src_slave_xc_list = slave_xc_list.filter(function(ele) {
                    return ele['direction'] == '1';
                });
                //过滤出宿端slave xc
                des_slave_xc_list = slave_xc_list.filter(function(ele) {
                    return ele['direction'] == '2';
                });
            }

            //确定pw的个数
            var pw_length = 0;
            if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) { //一源两宿
                pw_length = 2;
            } else if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 1) { //一源一宿
                if (protect_type == "2" || protect_type == "3" || protect_type == "4" || protect_type == "5" || protect_type == "6") { //一源一宿pw冗余也是两段pw
                    pw_length = 2;
                } else {
                    pw_length = 1;
                }
            } else if (eline['ingress-end-points'].length > 1 && eline['egress-end-points'].length > 2) {
                console.log("Ingress/Egress numbers out of beyond!");
            }

            //组装qos信息
            var qos = this.getElineQos(eline);

            //获取oam信息
            var oam = this.getElineOam();

            eline.pw = [];

            //构造pw
            for (var j = 0; j < pw_length; j++) {

                var pw_data = {
                    'encaplate-type': "cep-mpls",
                    'ctrl-word-support': "nonsupport",
                    'sn-support': "nonsupport",
                    'vccv-type': "nonsupport",
                    'conn-ack-type': "none",
                    'admin-status': "admin-up",
                    'operate-status': "operate-up"
                };
                pw_data.id = SdnSvc.createUUID();
                pw_data['name'] = eline['name'] + "-pw-" + (j + 1);
                pw_data['index'] = String(j + 1);

                // if (qos['qos-a2z-cir'] && qos['qos-a2z-pir'] && qos['qos-z2a-cir'] && qos['qos-z2a-pir']) {
                //     pw_data.qos = qos; //qos放在pw中
                // }
                var qos_copy = $.extend(true, {}, qos);

                if (oam_type !== '0') {
                    if (oam_type == '1') {
                        // oam['belonged-id'] = j + 1;
                        oam['belonged-id'] = pw_data.id;
                        oam['name'] = String(j + 1);
                    }
                    pw_data.oam = oam; //oam放在pw中
                }

                pw_data['ingress-ne-id'] = eline['ingress-end-points'][0]['ne-id'];
                pw_data['egress-ne-id'] = eline['egress-end-points'][0]['ne-id'];
                if (j == 0) {
                    pw_data['role'] = 'master';
                    // if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) {
                    var master_engress_node = eline['egress-end-points'].filter(function(ele) {
                        return ele['role'] == 'master';
                    })[0];
                    pw_data['egress-ne-id'] = master_engress_node['ne-id'];
                    qos_copy['qos-z2a-cir'] = master_engress_node['cir'];
                    qos_copy['qos-z2a-cbs'] = master_engress_node['cbs'];
                    qos_copy['qos-z2a-pir'] = master_engress_node['pir'];
                    qos_copy['qos-z2a-pbs'] = master_engress_node['pbs'];
                    if (qos_copy['qos-a2z-cir'] !== "" && qos_copy['qos-a2z-pir'] !== "" && qos_copy['qos-z2a-cir'] !== "" && qos_copy['qos-z2a-pir'] !== "") {
                        pw_data.qos = qos_copy; //qos放在pw中
                    }
                    delete master_engress_node['cir'];
                    delete master_engress_node['cbs'];
                    delete master_engress_node['pir'];
                    delete master_engress_node['pbs'];
                    // }

                    //pw中配置xc
                    if (xc_list_data && xc_list_data.length > 0) { //如果xc列表中有数据 则配置xc
                        pw_data['route'] = [];
                        //现在最多有一段master xc 和 一段slave xc 过滤出master xc
                        for (var k = 0; k < master_xc_list.length; k++) {
                            var route = {};
                            route.id = String(k + 1);
                            route['snc-id'] = '11';
                            var pw_label = "";
                            if (src_master_xc_list && src_master_xc_list.length > 0) { //存在源端工作xc
                                pw_label = src_master_xc_list[0]['pw-label'];
                            } else if (des_master_xc_list && des_master_xc_list.length > 0) { //不存在源端工作xc 存在宿端工作xc
                                pw_label = des_master_xc_list[0]['pw-label'];
                            }
                            // var pw_label = src_master_xc_list[0]['pw-label'] || des_master_xc_list[0]['pw-label'];
                            var xc = {};
                            var extXc = {};
                            xc['ne-id'] = pw_data['ingress-ne-id']; //源方向xc
                            xc['backward-in-label'] = pw_label;
                            xc['forward-out-label'] = pw_label;
                            extXc['ne-id'] = pw_data['egress-ne-id']; //宿方向xc
                            extXc['backward-out-label'] = pw_label;
                            extXc['forward-in-label'] = pw_label;
                            route.xc = [xc, extXc];

                        }

                        pw_data['route'].push(route);

                    }

                } else if (j == 1) {
                    pw_data['role'] = 'slave';
                    if (eline['ingress-end-points'].length == 1 && eline['egress-end-points'].length == 2) {
                        var slave_egress_node = eline['egress-end-points'].filter(function(ele) {
                            return ele['role'] == 'Slave';
                        })[0];
                        pw_data['egress-ne-id'] = slave_egress_node['ne-id'];
                        qos_copy['qos-z2a-cir'] = slave_egress_node['cir'];
                        qos_copy['qos-z2a-cbs'] = slave_egress_node['cbs'];
                        qos_copy['qos-z2a-pir'] = slave_egress_node['pir'];
                        qos_copy['qos-z2a-pbs'] = slave_egress_node['pbs'];
                        if (qos_copy['qos-a2z-cir'] !== "" && qos_copy['qos-a2z-pir'] !== "" && qos_copy['qos-z2a-cir'] !== "" && qos_copy['qos-z2a-pir'] !== "") {
                            pw_data.qos = qos_copy; //qos放在pw中
                        }
                        delete slave_egress_node['cir'];
                        delete slave_egress_node['cbs'];
                        delete slave_egress_node['pir'];
                        delete slave_egress_node['pbs'];
                    }

                    //pw中配置xc
                    if (xc_list_data && xc_list_data.length > 0) { //如果xc列表中有数据 则配置xc
                        pw_data['route'] = [];
                        //现在最多有一段master xc 和 一段slave xc 过滤出slave xc
                        for (var k = 0; k < slave_xc_list.length; k++) {
                            var route = {};
                            route.id = String(k + 1);
                            route['snc-id'] = '11';
                            var pw_label = "";
                            if (src_slave_xc_list && src_slave_xc_list.length > 0) { //存在源端保护xc
                                pw_label = src_slave_xc_list[0]['pw-label'];
                            } else if (des_slave_xc_list && des_slave_xc_list.length > 0) { //不存在源端保护xc 存在宿端保护xc
                                pw_label = des_slave_xc_list[0]['pw-label'];
                            }
                            // var pw_label = src_slave_xc_list[0]['pw-label'] || des_slave_xc_list[0]['pw-label'];
                            var xc = {};
                            var extXc = {};
                            xc['ne-id'] = pw_data['ingress-ne-id']; //源方向xc
                            xc['backward-in-label'] = pw_label;
                            xc['forward-out-label'] = pw_label;
                            extXc['ne-id'] = pw_data['egress-ne-id']; //宿方向xc
                            extXc['backward-out-label'] = pw_label;
                            extXc['forward-in-label'] = pw_label;
                            route.xc = [xc, extXc];
                        }

                        pw_data['route'].push(route);

                    }

                }
                eline.pw.push(pw_data);
            }
            if (protect_type == "2" || protect_type == "3" && eline.pw && eline.pw.length == 2) {
                var pw1 = eline.pw[0];
                var pw2 = eline.pw[1];
                delete eline.pw;
                eline.lsp = [pw1, pw2];
            }
            //配置路径策略
            var work_explicit_include_ne_list = [];
            var protect_explicit_include_ne_list = [];

            if (master_xc_list && master_xc_list.length > 0) {
                var work_ne = {};
                if (src_master_xc_list && src_master_xc_list.length > 0) { //存在源端工作xc
                    work_ne['ne-id'] = src_master_xc_list[0]['extnode-id'];
                    work_ne['ingress-vlan'] = src_master_xc_list[0]['vlan'];
                    work_ne['forward-in-label'] = src_master_xc_list[0]['in-label'];
                    work_ne['backward-out-label'] = src_master_xc_list[0]['out-label'];
                }
                if (des_master_xc_list && des_master_xc_list.length > 0) { //存在宿端工作xc
                    work_ne['ne-id'] = des_master_xc_list[0]['extnode-id'];
                    work_ne['egress-vlan'] = des_master_xc_list[0]['vlan'];
                    work_ne['forward-out-label'] = des_master_xc_list[0]['out-label'];
                    work_ne['backward-in-label'] = des_master_xc_list[0]['in-label'];
                }
                work_explicit_include_ne_list.push(work_ne);
            }

            if (slave_xc_list && slave_xc_list.length > 0) {
                var slave_ne = {};
                if (src_slave_xc_list && src_slave_xc_list.length > 0) { //存在源端保护xc
                    slave_ne['ne-id'] = src_slave_xc_list[0]['extnode-id'];
                    slave_ne['ingress-vlan'] = src_slave_xc_list[0]['vlan'];
                    slave_ne['forward-in-label'] = src_slave_xc_list[0]['in-label'];
                    slave_ne['backward-out-label'] = src_slave_xc_list[0]['out-label'];
                }
                if (des_slave_xc_list && des_slave_xc_list.length > 0) { //存在宿端保护xc
                    slave_ne['ne-id'] = des_slave_xc_list[0]['extnode-id'];
                    slave_ne['egress-vlan'] = des_slave_xc_list[0]['vlan'];
                    slave_ne['forward-out-label'] = des_slave_xc_list[0]['out-label'];
                    slave_ne['backward-in-label'] = des_slave_xc_list[0]['in-label'];
                }
                protect_explicit_include_ne_list.push(slave_ne);
            }

            eline['calculate-constraint'] = {
                'work-calculate-constraint': {
                    'explicit-include-ne': {
                        'explicit-include-ne-list': work_explicit_include_ne_list
                    }
                },
                'protect-calculate-constraint': {
                    'explicit-include-ne': {
                        'explicit-include-ne-list': protect_explicit_include_ne_list
                    }
                }
            };
            // console.log("eline", eline);
            var eline_list_grid = this.lookupReference('eline_list_grid');
            var me = this;
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to create the current E-Line?'),
                function(btn) {
                    if (btn == 'yes') {
                        //
                        var create_eline_hidden_form = me.lookupReference('create_eline_hidden_form');
                        create_eline_hidden_form.getForm().submit({
                            url: '/config/sdn/eline/create',
                            params: {
                                input: eline
                            },
                            jsonSubmit: true,
                            timeout: 600, //设置最大等待时间600秒
                            waitTitle: _('Tip'),
                            waitMsg: _('Creating E-Line. Please wait......'),
                            success: function(form, action) {
                                eline_list_grid.getStore().reload({
                                    callback: function(r, scope, success) {
                                        if (success) {
                                            Ext.Msg.alert(_('Tip'), _('Create E-Line successfully'));
                                            me.getView().setActiveItem(me.lookupReference('eline_list_panel'));
                                            window.node_direction = 'form_to_grid';
                                        }
                                    }
                                });
                            },
                            failure: function(form, action) {
                                var res = Ext.decode(action.response.responseText);
                                var error = res.error;
                                console.log("error", error);
                                if (error == 'unkonwn') {
                                    Ext.Msg.alert(_('Error'), _('Fail to create E-line with unknown reason'));
                                } else if (error == 'sdn controller unfound') {
                                    Ext.Msg.alert(_('Error'), _('Fail to create E-line because sdn controller unfound'));
                                } else {
                                    if (error.length == 0) {
                                        Ext.Msg.alert(_('Error'), _('Fail to create E-line with unknown reason'));
                                    } else {
                                        var error_msg = "";
                                        if (error.length == 1) {
                                            error_msg = error_msg + error[0]['errorMessage'];
                                            Ext.Msg.alert(_('Error'), _('Fail to create E-Line because ') + "[ " + _('error code') + ": " + error[0]['errorCode'] + " ] " + error[0]['errorMessage']);
                                        } else {
                                            //多条错误信息
                                            for (var e = 0; e < error.length - 1; e++) {
                                                error_msg = error_msg + (e + 1) + " ) [ " + _('error code') + ": " + error[e]['errorCode'] + " ] " + error[e]['errorMessage'] + "<br/>";
                                            }
                                            error_msg = error_msg + error.length + " ) [ " + _('error code') + ": " + error[error.length - 1]['errorCode'] + " ] " + error[error.length - 1]['errorMessage'];
                                            me.openFailureWindow(error_msg);
                                            // Ext.Msg.alert(_('Tip'), '创建业务失败 [ 总错误码：'+res['error-code']+' ]，可能的原因如下：'+ '<br/>' + error_msg);
                                        }
                                    }
                                }
                            }
                        }); // form
                    }
                } // func
            );
        },
        onAdd: function() {
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            this.getView().setActiveItem(create_eline_tabpanel);
        },
        openFailureWindow: function(error_msg) {
            var win = Ext.widget('window', {
                title: _('Error'),
                modal: false,
                resizable: false,
                constrain: true,//禁止窗口移出浏览器屏幕
                items: [{
                    xtype: 'panel',
                    width: 450,
                    dockedItems: [{
                        xtype: 'toolbar',
                        items: [{
                            xtype: 'label',
                            text: _('Fail to create E-line'),
                        }]
                    }, {
                        xtype: 'toolbar',
                        dock: "top",
                        items: [
                            '->', {
                                xtype: 'checkboxfield',
                                boxLabel: _('View Detailed Reason'),
                                checked: false,
                                listeners: {
                                    change: function(me, newValue, oldValue, eOpts) {
                                        var tx = win.down("panel").down("displayfield");
                                        tx.setHidden(!newValue);
                                        if (newValue == true) {
                                            tx.setHtml(error_msg);
                                        }
                                    }
                                }
                            }
                        ]
                    }],
                    items: [{
                        xtype: 'displayfield',
                        hidden: true,
                        padding: 10
                    }]
                }]
            }).show();
        },
        backToElineListPage: function() {
            var eline_list_panel = this.lookupReference('eline_list_panel');
            this.getView().setActiveItem(eline_list_panel);
        },
        backToCreateElinePage: function() {
            var create_eline_tabpanel = this.lookupReference('create_eline_tabpanel');
            this.getView().setActiveItem(create_eline_tabpanel);
        },
        onAccessActionChange: function(me, newValue, oldValue, eOpts) {
            var add_node_form = this.lookupReference('add_node_form');
            var ac_container = add_node_form.items.items[0];
            var ac_combox = ac_container.items.items[4];
            var ac_vlan_container = add_node_form.items.items[1];
            var ac_tx = ac_vlan_container.items.items[4];
            ac_tx.setValue("");
            if (newValue == "Keep") {
                ac_tx.setDisabled(true);
                ac_tx.allowBlank = true;
            } else {
                ac_tx.setDisabled(false);
                ac_tx.allowBlank = false;
                ac_tx.regex = /^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$|^0$/;
                ac_tx.regexText = _('The E-Line extraction VLAN ID must be an integer ranging from 0 to 4094');
            }
        },
        onCirChange: function(me, newValue, oldValue, eOpts) {
            var add_node_form = this.lookupReference('add_node_form');
            var cir_container = add_node_form.items.items[0];
            var cir_tx = cir_container.items.items[2];
            var cbs_container = add_node_form.items.items[1];
            var cbs_tx = cbs_container.items.items[2];
            var cir = parseInt(cir_tx.getValue());
            cbs_tx.setValue(parseInt(cir / 8));
        },
        onPirChange: function(me, newValue, oldValue, eOpts) {
            var add_node_form = this.lookupReference('add_node_form');
            var pir_container = add_node_form.items.items[0];
            var pir_tx = pir_container.items.items[3];
            var pbs_container = add_node_form.items.items[1];
            var pbs_tx = pbs_container.items.items[3];
            var pir = parseInt(pir_tx.getValue());
            pbs_tx.setValue(parseInt(pir / 8));
        },
        onNodeChange: function(me, newValue, oldValue, eOpts) {
            var add_node_form = this.lookupReference('add_node_form');
            var port_container = add_node_form.items.items[1];
            var port_combox = port_container.items.items[1];
            if (!window.node_direction || window.node_direction == 'form_to_grid') {
                var port_store = port_combox.getStore();
                if (port_store) {
                    port_store.removeAll();
                }
                if (me.selection && me.selection.data && me.selection.data["type"] && newValue !== null) { //重置的时候会导致newValue为null
                    var type = me.selection.data["type"]; //获取节点类型
                    window.node_type = type;
                    port_store.proxy.url = "/config/sdn/resource/get_port_list/" + type + "/" + newValue + "/db";
                    port_store.reload({
                        callback: function(r, scope, success) {
                            if (success) {
                                port_combox.setRawValue(""); //清空显示值
                                port_combox.setValue(""); //清空显示值
                                port_combox.markInvalid(_('The port ID cannot be empty'));
                            }
                        }
                    });
                }
            }
        },
        onExtNodeChange: function(me, newValue, oldValue, eOpts) {
            var add_xc_form = this.lookupReference('add_xc_form');
            var extlink_container = add_xc_form.items.items[3];
            var extlink_combox = extlink_container.items.items[0];

            if (!window.xc_direction || window.xc_direction == 'form_to_grid') {
                var extlink_store = extlink_combox.getStore();
                if (extlink_store) {
                    extlink_store.removeAll();
                }
                if (newValue !== null) { //重置的时候会导致newValue为null
                    extlink_store.proxy.url = "/config/sdn/resource/get_extlink_list/" + newValue + '/db';
                    extlink_store.reload({
                        callback: function(r, scope, success) {
                            if (success) {
                                extlink_combox.setRawValue(""); //清空显示值
                                extlink_combox.setValue(""); //清空显示值
                                extlink_combox.markInvalid(_('The external link cannot be empty'));
                            }
                        }
                    });
                }
            }
        },
        onVlanChange: function(me, newValue, oldValue, eOpts) {
            var add_node_form = this.lookupReference('add_node_form');
            var container = add_node_form.items.items[2];
            var cmp = container.items.items[1];
            var vlan = cmp.getValue();
            if (isNaN(Number(newValue))) { //输入不是单纯的数字
                cmp.regex = /^[1-9]\d*$|^(\d+[,-])+\d+$/;
                cmp.regexText = _('Please enter a string with commas or hyphens');
            } else { //输入是单纯的数字
                cmp.regex = /^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$|^0$/;
                cmp.regexText = _('The E-line VLAN ID must be an integer ranging from 0 to 4094');
            }
        },
        onOamTypeChange: function(group, newValue, oldValue, eOpts) {
            console.log("oldValue: " + oldValue["oam-type"]);
            console.log("newValue: " + newValue["oam-type"]);
            var eline_oam_form = this.lookupReference('eline_oam_form');
            var containers = eline_oam_form.items.items;
            containers.forEach(function(ele, index, arr) {
                var items = ele.items.items;
                var length = items.length;
                if (newValue["oam-type"] == '0') {
                    for (var i = 1; i < length; i++) {
                        items[i].setHidden(true);
                    }
                    arr[0].items.items[0].setHidden(false);
                } else if (newValue["oam-type"] == '1') { //cc
                    for (var i = 1; i < length - 1; i++) {
                        items[i].setHidden(false);
                    }
                    items[length - 1].setHidden(true);
                    arr[1].items.items[0].setHidden(false);
                } else if (newValue["oam-type"] == '2') { //bfd
                    for (var i = 1; i < length - 1; i++) {
                        items[i].setHidden(true);
                    }
                    items[length - 1].setHidden(false);
                    arr[1].items.items[0].setHidden(false);
                }
            });
        },
        addNodeFormReset: function() {
            var add_node_form = this.lookupReference('add_node_form');
            add_node_form.reset();
        },
        addToNodeListGrid: function() {
            var add_node_form = this.lookupReference('add_node_form');
            var values = add_node_form.getForm().getValues();
            if (!window.node_type) {
                window.node_type = 'sdn';
            }
            values['node-type'] = window.node_type;
            var container = add_node_form.items.items[0];
            var node_cbx = container.items.items[1];
            var cir_tx = container.items.items[2];
            var pir_tx = container.items.items[3];
            if (parseInt(pir_tx.getValue()) < parseInt(cir_tx.getValue())) {
                cir_tx.markInvalid(_('CIR cannot be greater than PIR'));
                return;
            }
            var cmp = add_node_form.items.items[2].items.items[1];
            var vlan = cmp.getValue();
            var vlan_arr = vlan.split(",");
            var vlan_list = [];
            vlan_arr.forEach(function(ele) {
                if (ele.indexOf("-") !== -1) {
                    var se = ele.split("-");
                    se[0] = Number(se[0]);
                    se[1] = Number(se[1]);
                    if (se[0] > 4094 || se[1] > 4094) {
                        cmp.markInvalid(_('The entered E-Line VLAN ID is greater than 4094'));
                        return;
                    }
                    if (se[0] > se[1]) {
                        var t = se[0];
                        se[0] = se[1];
                        se[1] = t;
                    }
                    for (var i = se[0]; i < se[1] + 1; i++) {
                        vlan_list.push(String(i));
                    }
                } else {
                    if (Number(ele) > 4094) {
                        cmp.markInvalid(_('The entered E-Line VLAN ID is greater than 4094'));
                        return;
                    }
                    vlan_list.push(ele);
                }
            });
            var vlan_str_org = vlan_list.join(",");
            var vlan_list_tmp = [];
            //删除重复元素
            vlan_list.forEach(function(ele) {
                if (vlan_list_tmp.indexOf(ele) == -1) {
                    vlan_list_tmp.push(ele);
                }
            });
            var vlan_str = vlan_list_tmp.sort().join(","); //排序
            console.log("vlan_str", vlan_str);
            console.log("vlan before: ", values['dot1q-vlan-bitmap']);
            console.log("values before: ", values);
            values['dot1q-vlan-bitmap'] = vlan_str;
            console.log("vlan after: ", values['dot1q-vlan-bitmap']);
            console.log("values after: ", values);
            var add_node_grid_store = this.lookupReference('add_node_grid').getStore();
            var node_list = add_node_grid_store.getData().items;
            var ingress_master_count = 0;
            var ingress_slave_count = 0;
            var egress_master_count = 0;
            var egress_slave_count = 0;
            node_list.forEach(function(node) {
                //统计源宿节点的个数
                if (node.data['node-direction'] == '1') {
                    if (node.data['node-role'] == '1') {
                        ingress_master_count++;
                    } else if (node.data['node-role'] == '2') {
                        ingress_slave_count++;
                    }
                } else if (node.data['node-direction'] == '2') {
                    if (node.data['node-role'] == '1') {
                        egress_master_count++;
                    } else if (node.data['node-role'] == '2') {
                        egress_slave_count++;
                    }
                }
            });

            if (values['node-role'] == '2' && values['node-direction'] == '1') {
                Ext.Msg.alert(_('Tip'), _('Only one source NE can work as the master NE and it cannot work as the slave NE concurrently'));
                return;
            }

            if ((ingress_master_count == 1 || ingress_master_count > 1) && values['node-role'] == '1' && values['node-direction'] == '1') {
                Ext.Msg.alert(_('Tip'), _('Only one source NE can work as the master NE'));
                return;
            }

            if (egress_slave_count == 1 || egress_slave_count > 1) {
                if ((egress_master_count == 1 || egress_master_count > 1) && values['node-role'] == '1' && values['node-direction'] == '2') {
                    Ext.Msg.alert(_('Tip'), _('Only one destination NE can work as the master NE'));
                    return;
                }
                if (values['node-role'] == '2' && values['node-direction'] == '2') {
                    Ext.Msg.alert(_('Tip'), _('At most one destination NE can work as the slave NE'));
                    return;
                }
            } else { //如果节点列表中没有保护宿节点
                if ((egress_master_count == 1 || egress_master_count > 1) && values['node-role'] == '1' && values['node-direction'] == '2') {
                    Ext.Msg.alert(_('Tip'), _('Only one destination NE can work as the master NE'));
                    return;
                }
            }
            var count = add_node_grid_store.getCount();
            add_node_grid_store.insert(count, values);
            node_cbx.setRawValue(""); //插入下方节点列表之后要清空节点选中值
            node_cbx.setValue("");
            var port_container = add_node_form.items.items[1];
            var port_cbx = port_container.items.items[1];
            port_cbx.setRawValue(""); //插入下方节点列表之后要清空端口选中值
            port_cbx.setValue("");

        },
        addXcFormReset: function() {
            var add_xc_form = this.lookupReference('add_xc_form');
            add_xc_form.reset();
        },
        addToXcListGrid: function() {
            var add_xc_form = this.lookupReference('add_xc_form');
            var values = add_xc_form.getForm().getValues();

            var add_xc_grid_store = this.lookupReference('add_xc_grid').getStore();
            var xc_list = add_xc_grid_store.getData().items;
            var src_master_xc_count = 0;
            var src_slave_xc_count = 0;
            var des_master_xc_count = 0;
            var des_slave_xc_count = 0;
            xc_list.forEach(function(xc) {
                if (xc.data['role'] == '1') {
                    if (xc.data['direction'] == '1') {
                        src_master_xc_count++;
                    } else if (xc.data['direction'] == '2') {
                        des_master_xc_count++;
                    }
                } else if (xc.data['role'] == '2') {
                    if (xc.data['direction'] == '1') {
                        src_slave_xc_count++;
                    } else if (xc.data['direction'] == '2') {
                        des_slave_xc_count++;
                    }
                }
            });

            if ((src_master_xc_count == 1 || src_master_xc_count > 1) && values['role'] == '1' && values['direction'] == '1') {
                Ext.Msg.alert(_('Tip'), _('At most one master XC can exist at the source end'));
                return;
            }
            if ((src_slave_xc_count == 1 || src_slave_xc_count > 1) && values['role'] == '2' && values['direction'] == '1') {
                Ext.Msg.alert(_('Tip'), _('At most one slave XC can exist at the source end'));
                return;
            }
            if ((des_master_xc_count == 1 || des_master_xc_count > 1) && values['role'] == '1' && values['direction'] == '2') {
                Ext.Msg.alert(_('Tip'), _('At most one master XC can exist at the destination end'));
                return;
            }
            if ((des_slave_xc_count == 1 || des_slave_xc_count > 1) && values['role'] == '2' && values['direction'] == '2') {
                Ext.Msg.alert(_('Tip'), _('At most one slave XC can exist at the destination end'));
                return;
            }

            var count = add_xc_grid_store.getCount();
            add_xc_grid_store.insert(count, values);

        },
        addXcGridSelectionChange: function(model, records) {
            var add_xc_grid = this.lookupReference('add_xc_grid');
            var select_count = add_xc_grid.getSelectionModel().getSelection().length;
            var tbar = add_xc_grid.getDockedItems('toolbar[dock="top"]')[0];
            var modifyXcBtn = tbar.getComponent('modifyXcBtn');
            if (select_count == 0 || select_count > 1) {
                modifyXcBtn.setDisabled(true);
            } else if (select_count == 1) {
                modifyXcBtn.setDisabled(false);
            }
        },
        kbpsRender: function(me) {
            var font = document.createElement("font");
            font.setAttribute("color", "gray");
            var kbps = document.createTextNode('kbps');
            font.appendChild(kbps);
            font.style.marginLeft = "5px";
            me.el.dom.appendChild(font);
        },
        BytesRender: function(me) {
            var font = document.createElement("font");
            font.setAttribute("color", "gray");
            var kbps = document.createTextNode('Bytes');
            font.appendChild(kbps);
            font.style.marginLeft = "5px";
            me.el.dom.appendChild(font);
        },
        msRender: function(me) {
            var font = document.createElement("font");
            font.setAttribute("color", "gray");
            var ms = document.createTextNode('ms');
            font.appendChild(ms);
            font.style.marginLeft = "5px";
            me.el.dom.appendChild(font);
        },
        addNodeGridSelectionChange: function(model, records) {
            var add_node_grid = this.lookupReference('add_node_grid');
            var select_count = add_node_grid.getSelectionModel().getSelection().length;
            var tbar = add_node_grid.getDockedItems('toolbar[dock="top"]')[0];
            var modifyNodeBtn = tbar.getComponent('modifyNodeBtn');
            if (select_count == 0 || select_count > 1) {
                modifyNodeBtn.setDisabled(true);
            } else if (select_count == 1) {
                modifyNodeBtn.setDisabled(false);
            }
        },
        onModifyNode: function() {
            window.node_direction = 'grid_to_form'; //从节点列表将数据回滚给上方form表单 再回滚之前赋值
            var add_node_grid = this.lookupReference("add_node_grid");
            var store = add_node_grid.getStore();
            var records = add_node_grid.getSelectionModel().getSelection();
            var node_type = records[0].get('node-type');
            window.node_type = node_type;
            var node_id = records[0].get('node-id');
            var port_id = records[0].get('port-id');

            var add_node_form = this.lookupReference("add_node_form");
            add_node_form.getForm().loadRecord(records[0]);

            var port_container = add_node_form.items.items[1];
            var port_combox = port_container.items.items[1];
            var port_store = port_combox.getStore();
            if (port_store) {
                port_store.removeAll();
            }

            port_store.proxy.url = "/config/sdn/resource/get_port_list/" + node_type + "/" + node_id + "/db";
            port_store.reload({
                callback: function(r, scope, success) {
                    if (success) {
                        port_combox.setValue(port_id);
                        window.node_direction = 'form_to_grid';
                    }
                }
            });
            window.node_direction = 'form_to_grid';
            store.remove(records[0]);
        },
        onRemoveNode: function() {
            var add_node_grid = this.lookupReference("add_node_grid");
            var store = add_node_grid.getStore();
            var records = add_node_grid.getSelectionModel().getSelection();
            records.forEach(function(record) {
                store.remove(record);
            });
        },
        onRefreshNodeListGrid: function() {
            var add_node_grid = this.lookupReference('add_node_grid');
            var store = add_node_grid.getStore();
            store.proxy.extraParams = {};
            store.reload({
                page: 1,
                start: 0
            });
        },
        onModifyXc: function() {
            window.xc_direction = 'grid_to_form'; //从节点列表将数据回滚给上方form表单 再回滚之前赋值
            var add_xc_grid = this.lookupReference("add_xc_grid");
            var store = add_xc_grid.getStore();
            var records = add_xc_grid.getSelectionModel().getSelection();
            var add_xc_form = this.lookupReference("add_xc_form");
            add_xc_form.getForm().loadRecord(records[0]);

            //
            var extlink_container = add_xc_form.items.items[3];
            var extlink_combox = extlink_container.items.items[0];

            var extlink_store = extlink_combox.getStore();
            if (extlink_store) {
                extlink_store.removeAll();
            }
            var extnode_id = records[0].get('extnode-id');
            var extlink_id = records[0].get('extlink-id');
            extlink_store.proxy.url = "/config/sdn/resource/get_extlink_list/" + extnode_id + '/db';
            extlink_store.reload({
                callback: function(r, scope, success) {
                    if (success) {
                        extlink_combox.setValue(extlink_id); //清空显示值
                        window.xc_direction = 'form_to_grid';
                    }
                }
            });
            window.xc_direction = 'form_to_grid';
            //
            store.remove(records[0]);
        },
        onRemoveXc: function() {
            var add_xc_grid = this.lookupReference("add_xc_grid");
            var store = add_xc_grid.getStore();
            var records = add_xc_grid.getSelectionModel().getSelection();
            records.forEach(function(record) {
                store.remove(record);
            });
        },
        onRefreshXcListGrid: function() {
            var add_xc_grid = this.lookupReference('add_xc_grid');
            var store = add_xc_grid.getStore();
            store.proxy.extraParams = {};
            store.reload({
                page: 1,
                start: 0
            });
        },
        elineListGridSelectionChange: function(model, records) {
            var eline_list_grid = this.lookupReference('eline_list_grid');
            var select_count = eline_list_grid.getSelectionModel().getSelection().length;
            var tbar = eline_list_grid.getDockedItems('toolbar[dock="top"]')[0];
            var removeElineBtn = tbar.getComponent('removeElineBtn');
            if (select_count == 0 || select_count > 1) {
                removeElineBtn.setDisabled(true);
            } else if (select_count == 1) {
                removeElineBtn.setDisabled(false);
            }
        },
        //点击查询按钮事件
        onElineQuery: function() {
            var store = this.lookupReference('eline_list_grid').getStore();
            var form = this.lookupReference('eline_query_form');
            var container = form.items.items[0];
            var ingress_container = container.items.items[0];
            var egress_container = container.items.items[1];
            var ingress_node_rv = ingress_container.items.items[1].getRawValue();
            var egress_node_rv = egress_container.items.items[1].getRawValue();
            var query_value = form.getForm().getValues();

            //删除查询条件中空值属性
            for (var name in query_value) {
                if (!query_value[name]) {
                    delete query_value[name];
                }
            }

            if (ingress_node_rv == 'all' || ingress_node_rv == '') {
                delete query_value['ingress-node'];
            }
            if (egress_node_rv == 'all' || egress_node_rv == '') {
                delete query_value['egress-node'];
            }

            store.proxy.extraParams = query_value;
            store.reload({
                page: 1,
                start: 0,
                callback: function() {} //此处要把callback函数置为空，如果不置为空，会重新走之前的callback函数
            });
        },

        //点击刷新按钮事件
        onElineRefresh: function() {
            var eline_list_grid = this.lookupReference('eline_list_grid');
            var store = eline_list_grid.getStore();
            store.proxy.extraParams = {};
            store.reload({
                page: 1,
                start: 0,
                callback: function() {} //此处要把callback函数置为空，如果不置为空，会重新走之前的callback函数
            });
        },

        onElineSelect: function(grid, record, eOpts) {
            var topoPanel = this.lookupReference('eline_topo_panel');

            topoPanel.setHidden(false);
            topoPanel.initTopo(record.data);
        },

        //删除eline事件
        onRemove: function() {
            var grid = this.lookupReference('eline_list_grid');
            var me = this;
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to delete the selected E-Line?'),
                function(btn) {
                    if (btn == 'yes') {
                        //
                        var create_eline_hidden_form = me.lookupReference('create_eline_hidden_form');
                        create_eline_hidden_form.getForm().submit({
                            url: '/config/sdn/eline/remove',
                            params: {
                                elineId: grid.getSelectionModel().getSelection()[0].get('id')
                            },
                            waitTitle: _('Tip'),
                            waitMsg: _('Deleting E-Line. Please wait......'),
                            success: function(response, opts) {
                                Ext.Msg.alert(_('Tip'), _('Delete E-Line successfully'));
                                grid.getStore().reload({
                                    page: 1,
                                    start: 0,
                                    callback: function() {} //此处要把callback函数置为空，如果不置为空，会重新走之前的callback函数
                                });
                            },
                            failure: function(response, opts) {
                                Ext.MessageBox.alert(_('Tip'), _('Fail to delete E-Line'));
                            }
                        }); // form

                        //

                    }
                } // func
            );

        },

        onCloseTopoPanel: function(){
            this.lookupReference('eline_topo_panel').hide();
        }

    },
    session: true,
    border: false,
    frame: false,
    items: [{
        xtype: 'panel',
        reference: 'eline_list_panel',
        layout: 'border',
        height: 750,
        items: [{
            xtype: 'PagedGrid',
            title: _('E-Line list'),
            iconCls: 'x-fa fa-circle-o',
            border: false,
            region: 'center',
            height: 300,
            autoScroll: true,
            emptyText: _('No data to display'),
            flex: 1,
            bodyStyle: {
                borderColor: '#d0d0d0'
            },
            selType: 'checkboxmodel',
            reference: 'eline_list_grid',
            bind: '{eline_list_grid_store}',
            columns: [{
                dataIndex: 'name',
                width: 100,
                // flex: 1,
                text: _('Name')
            }, {
                dataIndex: 'user-label',
                width: 100,
                // flex: 1,
                text: _('User label')
            }, {
                dataIndex: 'ingress-node',
                width: 200,
                // flex: 1,
                text: _('Src NE'),
                renderer: function(value, metaData) {
                    var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
                    var ingress_nodes = value.split('<br/>');
                    var newValue = "";
                    for (var i = 0; i < ingress_nodes.length; i++) {
                        if (sdn_node_id_list.indexOf(ingress_nodes[i]) !== -1) { //sdn设备
                            newValue += SdnSvc.getNodeUserLabelById(ingress_nodes[i], 'sdn') + "<br/>";
                        } else { //外部节点 传统设备
                            newValue += SdnSvc.getNodeUserLabelById(ingress_nodes[i], 'ext') + "<br/>";
                        }
                    }
                    return newValue;
                }
            }, {
                dataIndex: 'ingress-node-ltp',
                // flex: 1,
                width: 200,
                text: _('Src port'),
                renderer: function(value, metaData) {
                    var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
                    var data = metaData.record.data;
                    var ingress_nodes = data["ingress-node"].split('<br/>');
                    var ingress_ltps = data["ingress-node-ltp"].split('<br/>');
                    var newValue = "";
                    for (var i = 0; i < ingress_nodes.length; i++) {
                        if (sdn_node_id_list.indexOf(ingress_nodes[i]) !== -1) { //sdn设备
                            newValue += SdnSvc.getPortUserLabelById(ingress_nodes[i], ingress_ltps[i], 'sdn') + "<br/>";
                        } else {
                            newValue += SdnSvc.getPortUserLabelById(ingress_nodes[i], ingress_ltps[i], 'ext') + "<br/>";
                        }
                    }
                    return newValue;
                }
            }, {
                dataIndex: 'ingress-node-vlan',
                width: 100,
                // flex: 1,
                text: _('Src VLAN')
            }, {
                dataIndex: 'egress-node',
                width: 200,
                // flex: 1,
                text: _('Dest NE'),
                renderer: function(value, metaData) {
                    var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
                    var egress_nodes = value.split('<br/>');
                    var newValue = "";
                    for (var i = 0; i < egress_nodes.length; i++) {
                        if (sdn_node_id_list.indexOf(egress_nodes[i]) !== -1) { //sdn设备
                            newValue += SdnSvc.getNodeUserLabelById(egress_nodes[i], 'sdn') + '<br/>';
                        } else {
                            newValue += SdnSvc.getNodeUserLabelById(egress_nodes[i], 'ext') + '<br/>';
                        }
                    }
                    return newValue;
                }
            }, {
                dataIndex: 'egress-node-ltp',
                width: 200,
                // flex: 1,
                text: _('Dest port'),
                renderer: function(value, metaData) {
                    var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
                    var data = metaData.record.data;
                    var egress_nodes = data["egress-node"].split('<br/>');
                    var egress_ltps = data["egress-node-ltp"].split('<br/>');
                    var newValue = "";
                    for (var i = 0; i < egress_nodes.length; i++) {
                        if (sdn_node_id_list.indexOf(egress_nodes[i]) !== -1) { //sdn设备
                            newValue += SdnSvc.getPortUserLabelById(egress_nodes[i], egress_ltps[i], 'sdn') + "<br/>";
                        } else {
                            newValue += SdnSvc.getPortUserLabelById(egress_nodes[i], egress_ltps[i], 'ext') + "<br/>";
                        }
                    }
                    return newValue;
                }
            }, {
                dataIndex: 'egress-node-vlan',
                width: 200,
                // flex: 1,
                text: _('Dest VLAN')
            }],
            pagingbarDock: 'top',
            pagingbarDefaultValue: 5,
            pagingbarConfig: {
                fields: [{
                    name: 'val',
                    type: 'int'
                }],
                data: [{
                    val: 3
                }, {
                    val: 5
                }, {
                    val: 15
                }]
            },
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    text: _('Create'),
                    iconCls: 'x-fa fa-plus',
                    handler: 'onAdd'
                }, {
                    text: _('Delete'),
                    iconCls: 'x-fa fa-trash-o',
                    itemId: 'removeElineBtn',
                    handler: 'onRemove',
                    disabled: true
                }, {
                    text: _('Refresh'),
                    iconCls: 'x-fa fa-refresh',
                    handler: 'onElineRefresh'
                }, '->', {
                    xtype: 'checkboxfield',
                    boxLabel: _('Show Conditions'),
                    checked: false,
                    padding: '0 6 0 0',
                    listeners: {
                        change: function(me, newValue, oldValue, eOpts) {
                            var query_condition_form = this.up("panel").down("form");
                            query_condition_form.setVisible(newValue);
                        }
                    }
                }]
            }, {
                xtype: 'form',
                border: false,
                reference: 'eline_query_form',
                hidden: true,
                fieldDefaults: {
                    labelWidth: 75, //最小宽度  55
                    labelAlign: "right",
                }, // The fields
                items: [{
                    xtype: "container",
                    layout: 'hbox',
                    items: [{
                        xtype: "container",
                        layout: "vbox",
                        flex: 3.25,
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: _('Name'),
                            name: 'name',
                            width: 300
                        }, {
                            xtype: "combobox",
                            name: "ingress-node",
                            fieldLabel: _('Src NE'),
                            displayField: 'user-label',
                            valueField: 'id',
                            multiSelect: false,
                            editable: false,
                            width: 300,
                            bind: {
                                store: '{select_all_node_list_store}'
                            },
                            value: ""
                        }]
                    }, {
                        xtype: "container",
                        layout: "vbox",
                        flex: 3.25,
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: _('User label'),
                            name: 'user-label',
                            width: 300
                        }, {
                            xtype: "combobox",
                            name: "egress-node",
                            fieldLabel: _('Dest NE'),
                            displayField: 'user-label',
                            valueField: 'id',
                            multiSelect: false,
                            editable: false,
                            width: 300,
                            bind: {
                                store: '{select_all_node_list_store}'
                            },
                            value: ""
                        }]
                    }, {
                        xtype: "container",
                        layout: "vbox",
                        flex: 3.1,
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: _('Src/Dest VLAN'),
                            name: 'eline-vlan',
                            labelWidth: APP.lang == 'zh_CN' ? 75 : 95,
                            width: 300
                        }]
                    }, {
                        xtype: "toolbar",
                        layout: "vbox",
                        flex: 0.4,
                        margin: '-5 25 0 0',
                        items: [{
                            tooltip: _('Query'),
                            border: false,
                            focusCls: '',
                            iconCls: 'x-fa fa-search',
                            handler: 'onElineQuery'
                        }]
                    }]
                }]
            }],
            listeners: {
                select: 'onElineSelect',
                selectionchange: 'elineListGridSelectionChange'
            }
        }, {
            xtype: 'elineTopoView',
            margin: '10 0 0 0',
            title: _('ElineTopo'),
            layout: 'fit',
            reference: 'eline_topo_panel',
            region: 'south',
            hidden: true,
            split: true,
            tools: [{
                type: 'close',
                callback: function(){
                    this.up('elineTopoView').hide();
                }
            }]
        }]
    }, {
        xtype: 'form',
        reference: 'create_eline_hidden_form',
        hidden: true
    }, {
        xtype: "tabpanel",
        title: _('Create E-Line'),
        reference: "create_eline_tabpanel",
        tabPosition: 'left',
        tabRotation: 0,
        items: [{
                title: _(' NE'),
                layout: 'fit',
                items: [{
                    xtype: "panel",
                    reference: "eline_base_panel",
                    items: [{
                        xtype: 'form',
                        reference: "eline_base_form",
                        margin: APP.lang == 'zh_CN' ? '0 0 0 0' : '0 0 0 15',
                        border: false,
                        fieldDefaults: {
                            labelWidth: 75, //最小宽度  55
                            labelAlign: "right"
                        }, // The fields
                        items: [{
                            xtype: "container",
                            layout: 'hbox',
                            items: [{
                                xtype: "container",
                                layout: "vbox",
                                flex: 3.33,
                                items: [{
                                    xtype: 'textfield',
                                    fieldLabel: _('E-Line name'),
                                    name: 'name',
                                    labelWidth: APP.lang == 'zh_CN' ? 75 : 85,
                                    margin: '15 0 0 0',
                                    // width: 298,
                                    width: '92%',
                                    allowBlank: false
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 3.33,
                                items: [{
                                    xtype: 'textfield',
                                    fieldLabel: _('User label'),
                                    name: 'user-label',
                                    margin: '15 0 0 0',
                                    // width: 298,
                                    width: '92%',
                                    allowBlank: false
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 3.33,
                                items: [{
                                    xtype: "combobox",
                                    name: "protect-type",
                                    fieldLabel: _('Protection type'),
                                    labelWidth: APP.lang == 'zh_CN' ? 75 : 100,
                                    margin: '15 0 0 0',
                                    width: '94%',
                                    displayField: 'protect-type-name',
                                    valueField: 'protect-type-id',
                                    multiSelect: false,
                                    editable: false,
                                    bind: {
                                        store: '{protect_type_store}'
                                    },
                                    value: "1"
                                }]
                            }]
                        }]
                    }, {
                        xtype: 'fieldset',
                        title: _('NE configuration'),
                        margin: '5 5 0 5', //上右下左
                        layout: {
                            type: 'vbox',
                            align: 'stretch',
                            pack: 'start'
                        },
                        fieldDefaults: {
                            labelWidth: 90,
                            labelAlign: "right"
                        }, // The fields
                        items: [{
                            xtype: 'form',
                            reference: 'add_node_form',
                            border: false,
                            style: {
                                'margin-right': APP.lang == 'zh_CN' ? '0px' : '20px'
                            },
                            layout: 'hbox',
                            items: [{
                                xtype: "container",
                                layout: "vbox",
                                flex: 3.333,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: 'radiogroup',
                                    fieldLabel: _('Direction'),
                                    columns: 2,
                                    items: [{
                                        boxLabel: _('Src'),
                                        margin: '0 0 0 5', //上右下左
                                        name: 'node-direction',
                                        inputValue: '1',
                                        checked: true
                                    }, {
                                        boxLabel: _('Dest'),
                                        margin: '0 0 0 5', //上右下左
                                        name: 'node-direction',
                                        inputValue: '2'
                                    }]
                                }, {
                                    xtype: "combobox",
                                    name: "node-id",
                                    fieldLabel: _(' NE'),
                                    displayField: 'user-label',
                                    valueField: 'id',
                                    multiSelect: false,
                                    editable: false,
                                    emptyText: _('Please select a NE'),
                                    allowBlank: false,
                                    // width: 307,
                                    width: '98%',
                                    bind: {
                                        store: '{pure_all_node_list_store}'
                                    },
                                    listeners: {
                                        change: 'onNodeChange'
                                    }
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: 'CIR',
                                    name: 'cir',
                                    // columnWidth: 305,
                                    columnWidth: '98%',
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer'),
                                    listeners: {
                                        render: "kbpsRender",
                                        change: "onCirChange"
                                    }
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: 'PIR',
                                    name: 'pir',
                                    // columnWidth: 305,
                                    columnWidth: '98%',
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer'),
                                    listeners: {
                                        render: "kbpsRender",
                                        change: "onPirChange"
                                    }
                                }, {
                                    xtype: "combobox",
                                    name: "access-action",
                                    fieldLabel: _('Action'),
                                    // width: 307,
                                    width: '98%',
                                    displayField: 'access-action',
                                    valueField: 'access-action',
                                    multiSelect: false,
                                    editable: false,
                                    bind: {
                                        store: '{access_action_store}'
                                    },
                                    value: 'Keep',
                                    listeners: {
                                        change: 'onAccessActionChange'
                                    }
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 3.34,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: 'radiogroup',
                                    fieldLabel: _('Role'),
                                    columns: 2,
                                    items: [{
                                        boxLabel: _('Master'),
                                        margin: '0 0 0 5', //上右下左
                                        name: 'node-role',
                                        inputValue: '1',
                                        checked: true
                                    }, {
                                        boxLabel: _('Slave'),
                                        margin: '0 0 0 5', //上右下左
                                        name: 'node-role',
                                        inputValue: '2'
                                    }]
                                }, {
                                    xtype: "combobox",
                                    name: "port-id",
                                    fieldLabel: _('Port'),
                                    // width: 307,
                                    width: '100%',
                                    displayField: 'user-label',
                                    valueField: 'port-id',
                                    multiSelect: false,
                                    editable: false,
                                    emptyText: _('Please select a port'),
                                    allowBlank: false,
                                    bind: {
                                        store: '{port_list_store_by_node}'
                                    }
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: 'CBS',
                                    name: 'cbs',
                                    // columnWidth: 305,
                                    columnWidth: '100%',
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer'),
                                    listeners: {
                                        render: "BytesRender"
                                    }
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: 'PBS',
                                    name: 'pbs',
                                    // columnWidth: 305,
                                    columnWidth: '100%',
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer'),
                                    listeners: {
                                        render: "BytesRender"
                                    }
                                }, {
                                    fieldLabel: _('Action VLAN'),
                                    name: 'action-vlan-id',
                                    // width: 307,
                                    width: '100%',
                                    emptyText: _('Please enter an integer ranging from 0 to 4094'),
                                    disabled: true,
                                    regex: /^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$|^0$/,
                                    regexText: _('The E-Line extraction VLAN ID must be an integer ranging from 0 to 4094')
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 3.33,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: 'radiogroup',
                                    fieldLabel: 'hhh', //隐藏占位
                                    columns: 2,
                                    items: [{
                                        boxLabel: _('Yes'),
                                        margin: '0 0 0 5' //上右下左
                                    }, {
                                        boxLabel: _('No'),
                                        margin: '0 0 0 5' //上右下左
                                    }],
                                    style: {
                                        'visibility': 'hidden'
                                    }
                                }, {
                                    fieldLabel: _('VLAN'),
                                    name: 'dot1q-vlan-bitmap',
                                    width: '100%',
                                    // width: APP.lang == 'zh_CN' ? 302 : 289,
                                    //匹配字符串只能是以数字开头 以数字结尾 中间可以是英文逗号或短横线 且不能有连续英文逗号或短横线
                                    //但是不能校验开头数字是0或结尾数字是0的情况（带英文逗号或短横线）
                                    /*
                                     1-999
                                     ^(?!0)[0-9]{1,3}$

                                     1000-3999
                                     ^[1-3][0-9]{3}$

                                     4000-4094
                                     ^40([0-8]\d|9[0-4])$

                                     1-4094
                                     ^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$

                                     0-4094
                                     ^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$|^0$

                                     */
                                    // regex: /^[1-9]\d*$|^(\d+[,-])+\d+$/,
                                    emptyText: _('Please enter an integer ranging from 0 to 4094'),
                                    regex: /^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$|^0$/,
                                    regexText: _('The E-line VLAN ID must be an integer ranging from 0 to 4094'),
                                    listeners: {
                                        change: "onVlanChange"
                                    }
                                }, {
                                    xtype: 'toolbar',
                                    width: '100%',
                                    ui: 'footer',
                                    style: {
                                        'background-color': 'transparent'
                                    },
                                    items: ['->', {
                                        xtype: 'button',
                                        height: 32,
                                        margin: '0 5 0 0',
                                        // margin: '0 0 0 82',
                                        iconCls: 'x-fa fa-undo',
                                        text: _('Reset'),
                                        handler: 'addNodeFormReset'
                                    }, {
                                        xtype: 'button',
                                        height: 32,
                                        margin: '0 0 0 0',
                                        // margin: '0 0 0 7',
                                        iconCls: 'x-fa fa-plus',
                                        text: _('Add to NE list'),
                                        handler: 'addToNodeListGrid',
                                        formBind: true
                                    }]
                                }]
                            }]
                        }, {
                            xtype: 'grid',
                            reference: 'add_node_grid',
                            columnLines: true,
                            border: true,
                            autoScroll: true,
                            bind: {
                                store: '{add_node_grid_store}'
                            },
                            selModel: {
                                selType: 'checkboxmodel'
                            },
                            columns: [{
                                text: _('Direction'),
                                dataIndex: 'node-direction',
                                sortable: true,
                                // flex: 0.7,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    if (value == '1') {
                                        return _('Src');
                                    } else if (value == '2') {
                                        return _('Dest');
                                    }
                                }
                            }, {
                                text: _('Role'),
                                dataIndex: 'node-role',
                                sortable: true,
                                // flex: 0.6,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    if (value == '1') {
                                        return _('Master');
                                    } else if (value == '2') {
                                        return _('Slave');
                                    }
                                }
                            }, {
                                text: _(' NE'),
                                dataIndex: 'node-id',
                                menuDisabled: true,
                                sortable: true,
                                width: 220,
                                // flex: 1.5,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    var data = metaData.record.data;
                                    var node_type = data['node-type'];
                                    return SdnSvc.getNodeUserLabelById(value, node_type);
                                }
                            }, {
                                text: _('Port'),
                                dataIndex: 'port-id',
                                menuDisabled: true,
                                sortable: true,
                                width: 200,
                                // flex: 1.7,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    var data = metaData.record.data;
                                    var node_type = data['node-type'];
                                    if (node_type == 'sdn') {
                                        var index = value.lastIndexOf(":");
                                        var node_id = value.substring(0, index);
                                        var port_num = value.substring(index + 1);
                                    } else {
                                        var node_id = data['node-id'];
                                        var port_num = value;
                                    }
                                    return SdnSvc.getPortUserLabelById(node_id, port_num, node_type);
                                }
                            }, {
                                text: _('VLAN'),
                                dataIndex: 'dot1q-vlan-bitmap',
                                menuDisabled: true,
                                sortable: true,
                                // flex: 1,
                                align: 'center'
                            }, {
                                text: 'CIR',
                                dataIndex: 'cir',
                                menuDisabled: true,
                                sortable: true,
                                // flex: 0.8,
                                align: 'center'
                            }, {
                                text: 'CBS',
                                dataIndex: 'cbs',
                                menuDisabled: true,
                                sortable: true,
                                // flex: 0.75,
                                align: 'center'
                            }, {
                                text: 'PIR',
                                dataIndex: 'pir',
                                menuDisabled: true,
                                sortable: false,
                                // flex: 0.8,
                                align: 'center'

                            }, {
                                text: 'PBS',
                                dataIndex: 'pbs',
                                menuDisabled: true,
                                sortable: false,
                                // flex: 0.75,
                                align: 'center'

                            }, {
                                text: _('Action'),
                                dataIndex: 'access-action',
                                menuDisabled: true,
                                sortable: false,
                                // flex: 1.1,
                                align: 'center'

                            }, {
                                text: _('Action VLAN'),
                                dataIndex: 'action-vlan-id',
                                menuDisabled: true,
                                sortable: false,
                                width: 180,
                                // flex: 1.2,
                                align: 'center'
                            }],
                            tbar: [{
                                xtype: 'label',
                                text: _('NE list')
                            }, '->', {
                                text: _('Modify'),
                                iconCls: 'x-fa fa-edit',
                                itemId: 'modifyNodeBtn',
                                disabled: true,
                                handler: 'onModifyNode'
                            }, {
                                text: _('Delete'),
                                iconCls: 'x-fa fa-trash-o',
                                itemId: 'removeNodeBtn',
                                bind: {
                                    disabled: '{!add_node_grid.selection}'
                                },
                                handler: 'onRemoveNode'
                            }],
                            listeners: {
                                selectionchange: 'addNodeGridSelectionChange'
                            },
                            viewConfig: {
                                //Return CSS class to apply to rows depending upon data values
                                trackOver: false,
                                stripeRows: false,
                                emptyText: _('No data to display'),
                                deferEmptyText: false,
                                getRowClass: function(record) {

                                }
                            }
                        }]

                    }],
                    buttons: [{
                        text: _('Back'),
                        iconCls: 'x-fa fa-reply',
                        handler: 'backToElineListPage'
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-arrow-down',
                        text: _('Next'),
                        handler: 'elineBaseFormNext',
                        // formBind: true
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-eye',
                        text: _('Preview'),
                        handler: 'elineBasePreview',
                        // formBind: true
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-save',
                        text: _('Apply'),
                        handler: 'elineBaseSubmit',
                        // formBind: true
                    }]
                }]
            }, {
                title: "OAM",
                layout: 'fit',
                items: [{
                    xtype: "form",
                    margin: '10 0 0 -5',
                    reference: "eline_oam_form",
                    layout: 'hbox',
                    fieldDefaults: {
                        labelWidth: 90,
                        labelAlign: "right"
                    }, // The fields
                    items: [{
                        xtype: 'container',
                        layout: 'vbox',
                        defaults: {
                            hidden: true
                        },
                        items: [{
                                xtype: 'radiogroup',
                                fieldLabel: _('OAM type'),
                                columns: 3,
                                width: 300,
                                hidden: false,
                                items: [{
                                    boxLabel: _('N/A'),
                                    name: 'oam-type',
                                    inputValue: '0',
                                    checked: true
                                }, {
                                    boxLabel: 'CC',
                                    name: 'oam-type',
                                    inputValue: '1',
                                }, {
                                    boxLabel: 'BFD',
                                    margin: '0 0 0 -12', //上右下左
                                    name: 'oam-type',
                                    inputValue: '2'
                                }],
                                listeners: {
                                    change: 'onOamTypeChange'
                                }
                            },
                            /*                        {
                                                        xtype: "combobox",
                                                        name: "cc-exp",
                                                        fieldLabel: 'Exp',
                                                        displayField: 'cc-exp',
                                                        valueField: 'cc-exp',
                                                        multiSelect: false,
                                                        editable: false,
                                                        emptyText: _('Please select'),
                                                        allowBlank: false,
                                                        hidden: true,
                                                        afterLabelTextTpl: [
                                                            '<span style="color:red;font-weight:bold" data-qtip="必填项">*</span>'
                                                        ],
                                                        bind: {
                                                            store: '{cc_exp_store}'
                                                        },
                                                        value: 'AF1'
                                                    }, {
                                                        xtype: "combobox",
                                                        name: "lm-mode",
                                                        fieldLabel: _('LM mode'),
                                                        displayField: 'lm-dm-mode-name',
                                                        valueField: 'lm-dm-mode-id',
                                                        multiSelect: false,
                                                        editable: false,
                                                        emptyText: _('Please select'),
                                                        hidden: true,
                                                        bind: {
                                                            store: '{lm_dm_mode_store}'
                                                        }
                                                    }, */
                            {
                                xtype: "combobox",
                                name: "cc-interval",
                                fieldLabel: _('Interval'),
                                displayField: 'cc-interval',
                                valueField: 'cc-interval',
                                multiSelect: false,
                                editable: false,
                                emptyText: _('Please select'),
                                bind: {
                                    store: '{cc_interval_store}'
                                },
                                value: '3.3',
                                listeners: {
                                    render: 'msRender'
                                }
                            }, {
                                xtype: "textfield",
                                name: "localdetectmultiplier",
                                fieldLabel: _('Multiple'),
                                emptyText: _('default 3'),
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer'),
                            }
                        ]
                    }, {
                        xtype: 'container',
                        layout: 'vbox',
                        defaults: {
                            hidden: true
                        },
                        items: [{
                                xtype: 'radiogroup',
                                fieldLabel: 'hhh', //隐藏占位
                                columns: 2,
                                items: [{
                                    boxLabel: _('Yes'),
                                    margin: '0 0 0 5' //上右下左
                                }, {
                                    boxLabel: _('No'),
                                    margin: '0 0 0 5' //上右下左
                                }],
                                style: {
                                    'visibility': 'hidden'
                                }
                            }, {
                                xtype: "combobox",
                                fieldLabel: 'hhh', //隐藏占位
                                style: {
                                    'visibility': 'hidden'
                                }
                            },
                            /*                        {
                                                        xtype: "combobox",
                                                        name: "dm-mode",
                                                        fieldLabel: _('DM mode'),
                                                        displayField: 'lm-dm-mode-name',
                                                        valueField: 'lm-dm-mode-id',
                                                        multiSelect: false,
                                                        editable: false,
                                                        emptyText: _('Please select'),
                                                        hidden: true,
                                                        bind: {
                                                            store: '{lm_dm_mode_store}'
                                                        }
                                                    }, */
                            {
                                xtype: "textfield",
                                name: "localtxinterval",
                                fieldLabel: _('Interval'),
                                emptyText: '3000~1000000',
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer'),
                                listeners: {
                                    render: 'msRender'
                                }
                            }
                        ]
                    }],
                    buttons: [{
                        text: _('Back'),
                        iconCls: 'x-fa fa-reply',
                        handler: 'backToElineListPage'
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-arrow-up',
                        text: _('Previous'),
                        handler: 'elineOamFormPrev'
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-arrow-down',
                        text: _('Next'),
                        handler: 'elineOamFormNext'
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-eye',
                        text: _('Preview'),
                        handler: 'elineOamPreview',
                        // formBind: true
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-save',
                        text: _('Apply'),
                        handler: 'elineOamSubmit',
                        formBind: true
                    }]

                }]
            }, {
                title: _('Route strategy'),
                layout: 'fit',
                items: [{
                    xtype: "panel",
                    reference: "eline_route_panel",
                    items: [{
                        xtype: 'fieldset',
                        title: _('XC configuration'),
                        margin: '0 5 0 5', //上右下左
                        layout: {
                            type: 'vbox',
                            align: 'stretch',
                            pack: 'start'
                        },
                        fieldDefaults: {
                            labelWidth: 80,
                            labelAlign: "right",
                            buttonAlign: 'right'
                        }, // The fields
                        items: [{
                            xtype: 'form',
                            reference: 'add_xc_form',
                            layout: 'hbox',
                            border: false,
                            style: {
                                'margin-right': APP.lang == 'zh_CN' ? '0px' : '15px'
                            },
                            items: [{
                                xtype: "container",
                                layout: "vbox",
                                flex: 2.2,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: 'radiogroup',
                                    fieldLabel: _('Direction'),
                                    labelWidth: APP.lang == 'zh_CN' ? 40 : 80,
                                    columns: 2,
                                    items: [{
                                        boxLabel: _('Src'),
                                        margin: APP.lang == 'zh_CN' ? '0 0 0 5' : '0 0 0 0',
                                        name: 'direction',
                                        inputValue: '1',
                                        checked: true
                                    }, {
                                        boxLabel: _('Dest'),
                                        margin: APP.lang == 'zh_CN' ? '0 0 0 5' : '0 0 0 5',
                                        name: 'direction',
                                        inputValue: '2'
                                    }]
                                }, {
                                    fieldLabel: 'VLAN',
                                    name: 'vlan',
                                    width: '100%',
                                    labelWidth: APP.lang == 'zh_CN' ? 40 : 80,
                                    // width: APP.lang == 'zh_CN' ? 215 : 200,
                                    emptyText: "0~4094",
                                    regex: /^(?!0)[0-9]{1,3}$|^[1-3][0-9]{3}$|^40([0-8]\d|9[0-4])$|^0$/,
                                    regexText: 'VLAN必须是0~4094之间的正整数'
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 2.4,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: 'radiogroup',
                                    fieldLabel: _('Role'),
                                    columns: 2,
                                    items: [{
                                        boxLabel: _('Master'),
                                        margin: APP.lang == 'zh_CN' ? '0 0 0 5' : '0 0 0 0',
                                        name: 'role',
                                        inputValue: '1',
                                        checked: true
                                    }, {
                                        boxLabel: _('Slave'),
                                        margin: APP.lang == 'zh_CN' ? '0 0 0 5' : '0 0 0 5',
                                        name: 'role',
                                        inputValue: '2'
                                    }]
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: _('PW label'),
                                    name: 'pw-label',
                                    width: '100%',
                                    // width: 215,
                                    // width: APP.lang == 'zh_CN' ? 215 : 206,
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer')
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 2.7,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: "combobox",
                                    name: "extnode-id",
                                    fieldLabel: _(' NE'),
                                    displayField: 'user-label',
                                    valueField: 'id',
                                    multiSelect: false,
                                    editable: false,
                                    emptyText: _('Please select a NE'),
                                    allowBlank: false,
                                    width: '100%',
                                    // width: 245,
                                    // width: APP.lang == 'zh_CN' ? 245 : 230,
                                    bind: {
                                        store: '{ext_node_list_store}'
                                    },
                                    listeners: {
                                        change: 'onExtNodeChange'
                                    }
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: _('In label'),
                                    name: 'in-label',
                                    width: '100%',
                                    // width: 245,
                                    // width: APP.lang == 'zh_CN' ? 245 : 230,
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer')
                                }]
                            }, {
                                xtype: "container",
                                layout: "vbox",
                                flex: 2.7,
                                defaultType: 'textfield',
                                items: [{
                                    xtype: "combobox",
                                    name: "extlink-id",
                                    fieldLabel: _('Ext link'),
                                    displayField: 'user-label',
                                    valueField: 'id',
                                    multiSelect: false,
                                    editable: false,
                                    emptyText: _('Please select an external link'),
                                    allowBlank: false,
                                    width: '100%',
                                    // width: 245,
                                    // width: APP.lang == 'zh_CN' ? 245 : 230,
                                    bind: {
                                        store: '{ext_link_list_store}'
                                    }
                                }, {
                                    xtype: 'numberfield',
                                    fieldLabel: _('Out label'),
                                    name: 'out-label',
                                    width: '100%',
                                    // width: 245,
                                    // width: APP.lang == 'zh_CN' ? 245 : 230,
                                    minValue: 0,
                                    regex: /^[1-9]\d*$/,
                                    regexText: _('Please enter a positive integer')
                                }, {
                                    xtype: 'toolbar',
                                    width: '100%',
                                    ui: 'footer',
                                    style: {
                                        'background-color': 'transparent'
                                    },
                                    items: ['->', {
                                        xtype: 'button',
                                        iconCls: 'x-fa fa-undo',
                                        text: _('Reset'),
                                        height: 32,
                                        margin: '0 5 0 0',
                                        // margin: APP.lang == 'zh_CN' ? '0 0 10 33' : '0 0 10 45',
                                        handler: 'addXcFormReset'
                                    }, {
                                        xtype: 'button',
                                        iconCls: 'x-fa fa-plus',
                                        text: _('Add to XC list'),
                                        height: 32,
                                        margin: '0 0 0 0',
                                        // margin: '0 0 10 6',
                                        handler: 'addToXcListGrid',
                                        formBind: true
                                    }]
                                }]
                            }],
                        }, {
                            xtype: 'grid',
                            reference: 'add_xc_grid',
                            columnLines: true,
                            border: true,
                            autoScroll: true,
                            style: {
                                'margin-top': '10px'
                            },
                            bind: {
                                store: '{add_xc_grid_store}'
                            },
                            selModel: {
                                selType: 'checkboxmodel'
                            },
                            columns: [{
                                text: _('Direction'),
                                dataIndex: 'direction',
                                sortable: true,
                                width: 130,
                                // flex: 1,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    if (value == '1') {
                                        return _('Src');
                                    } else if (value == '2') {
                                        return _('Dest');
                                    }
                                }
                            }, {
                                text: _('Role'),
                                dataIndex: 'role',
                                menuDisabled: true,
                                sortable: true,
                                width: 130,
                                // flex: 1,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    if (value == '1') {
                                        return _('Master');
                                    } else if (value == '2') {
                                        return _('Slave');
                                    }
                                }
                            }, {
                                text: _(' NE'),
                                dataIndex: 'extnode-id',
                                menuDisabled: true,
                                sortable: true,
                                width: 200,
                                // flex: 2,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    return SdnSvc.getNodeUserLabelById(value, 'ext');
                                }
                            }, {
                                text: _('Ext link'),
                                dataIndex: 'extlink-id',
                                menuDisabled: true,
                                sortable: true,
                                width: 260,
                                // flex: 2,
                                align: 'center',
                                renderer: function(value, metaData) {
                                    return SdnSvc.getExtLinkUserLabelById(value);
                                }
                            }, {
                                text: 'VLAN',
                                dataIndex: 'vlan',
                                menuDisabled: true,
                                sortable: false,
                                width: 130,
                                // flex: 1,
                                align: 'center'
                            }, {
                                text: _('PW label'),
                                dataIndex: 'pw-label',
                                menuDisabled: true,
                                sortable: false,
                                width: 130,
                                // flex: 1,
                                align: 'center'

                            }, {
                                text: _('In label'),
                                dataIndex: 'in-label',
                                menuDisabled: true,
                                sortable: true,
                                width: 130,
                                // flex: 1,
                                align: 'center'
                            }, {
                                text: _('Out label'),
                                dataIndex: 'out-label',
                                menuDisabled: true,
                                sortable: true,
                                width: 130,
                                // flex: 1,
                                align: 'center'
                            }],
                            tbar: [{
                                xtype: 'label',
                                text: _('XC list')
                            }, '->', {
                                text: _('Modify'),
                                iconCls: 'x-fa fa-edit',
                                itemId: 'modifyXcBtn',
                                disabled: true,
                                handler: 'onModifyXc'
                            }, {
                                text: _('Delete'),
                                iconCls: 'x-fa fa-trash-o',
                                itemId: 'removeXcBtn',
                                bind: {
                                    disabled: '{!add_xc_grid.selection}'
                                },
                                handler: 'onRemoveXc'
                            }],
                            listeners: {
                                selectionchange: 'addXcGridSelectionChange'
                            },
                            viewConfig: {
                                //Return CSS class to apply to rows depending upon data values
                                trackOver: false,
                                stripeRows: false,
                                emptyText: _('No data to display'),
                                deferEmptyText: false,
                                getRowClass: function(record) {

                                }
                            }
                        }]

                    }],
                    buttons: [{
                        text: _('Back'),
                        iconCls: 'x-fa fa-reply',
                        handler: 'backToElineListPage'
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-arrow-up',
                        text: _('Previous'),
                        handler: 'elineRouteFormPrev',
                        formBind: true
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-eye',
                        text: _('Preview'),
                        handler: 'elineRoutePreview',
                        // formBind: true
                    }, {
                        xtype: "button",
                        iconCls: 'x-fa fa-save',
                        text: _('Apply'),
                        handler: 'elineRouteSubmit',
                        formBind: true
                    }]

                }]
            }

        ]
    }, {
        xtype: "panel",
        reference: 'eline_pre_panel',
        title: _('Preview'),
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start'
        },
        defaults: {
            margin: '0 10 0 10'
        },
        buttons: [{
            text: _('Cancel'),
            iconCls: 'x-fa fa-close',
            margin: '0 10 0 0',
            handler: 'backToCreateElinePage'
        }],
        items: [{
            xtype: 'fieldset',
            title: _(' NE'),
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'form',
                reference: "eline_base_pre_form",
                border: false,
                fieldDefaults: {
                    labelWidth: 75, //最小宽度  55
                    labelAlign: "right"
                }, // The fields
                items: [{
                    xtype: "container",
                    layout: 'hbox',
                    items: [{
                        xtype: "container",
                        layout: "vbox",
                        flex: 3.33,
                        defaults: {
                            style: {
                                'margin-left': APP.lang == 'zh_CN' ? '-15px' : '0px'
                            }
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: _('E-Line name'),
                            name: 'name',
                            labelWidth: APP.lang == 'zh_CN' ? 75 : 85,
                            inputWrapCls: '',
                            triggerWrapCls: '',
                            fieldStyle: 'background:none',
                            readOnly: true
                        }]
                    }, {
                        xtype: "container",
                        layout: "vbox",
                        flex: 3.33,
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: _('User label'),
                            name: 'user-label',
                            inputWrapCls: '',
                            triggerWrapCls: '',
                            fieldStyle: 'background:none',
                            readOnly: true
                        }]
                    }, {
                        xtype: "container",
                        layout: "vbox",
                        flex: 3.33,
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: _('Protection type'),
                            name: 'protect-type',
                            labelWidth: APP.lang == 'zh_CN' ? 75 : 100,
                            inputWrapCls: '',
                            triggerWrapCls: '',
                            fieldStyle: 'background:none',
                            readOnly: true
                        }]
                    }]
                }]
            }, {
                xtype: 'grid',
                reference: 'eline_base_pre_node_grid',
                columnLines: true,
                border: true,
                autoScroll: true,
                bind: {
                    store: '{add_node_grid_store}'
                },
                columns: [{
                    text: _('Direction'),
                    dataIndex: 'node-direction',
                    sortable: true,
                    // flex: 0.7,
                    align: 'center',
                    renderer: function(value, metaData) {
                        if (value == '1') {
                            return _('Src');
                        } else if (value == '2') {
                            return _('Dest');
                        }
                    }
                }, {
                    text: _('Role'),
                    dataIndex: 'node-role',
                    sortable: true,
                    // flex: 0.6,
                    align: 'center',
                    renderer: function(value, metaData) {
                        if (value == '1') {
                            return _('Master');
                        } else if (value == '2') {
                            return _('Slave');
                        }
                    }
                }, {
                    text: _(' NE'),
                    dataIndex: 'node-id',
                    menuDisabled: true,
                    sortable: true,
                    width: 220,
                    // flex: 1.1,
                    align: 'center',
                    renderer: function(value, metaData) {
                        var data = metaData.record.data;
                        var node_type = data['node-type'];
                        return SdnSvc.getNodeUserLabelById(value, node_type);
                    }
                }, {
                    text: _('Port'),
                    dataIndex: 'port-id',
                    menuDisabled: true,
                    sortable: true,
                    width: 200,
                    // flex: 1.3,
                    align: 'center',
                    renderer: function(value, metaData) {
                        var data = metaData.record.data;
                        var node_type = data['node-type'];
                        if (node_type == 'sdn') {
                            var index = value.lastIndexOf(":");
                            var node_id = value.substring(0, index);
                            var port_num = value.substring(index + 1);
                        } else {
                            var node_id = data['node-id'];
                            var port_num = value;
                        }
                        return SdnSvc.getPortUserLabelById(node_id, port_num, node_type);
                    }
                }, {
                    text: _('VLAN'),
                    dataIndex: 'dot1q-vlan-bitmap',
                    menuDisabled: true,
                    sortable: true,
                    // flex: 1,
                    align: 'center'
                }, {
                    text: 'CIR',
                    dataIndex: 'cir',
                    menuDisabled: true,
                    sortable: true,
                    // flex: 0.8,
                    align: 'center'
                }, {
                    text: 'CBS',
                    dataIndex: 'cbs',
                    menuDisabled: true,
                    sortable: true,
                    // flex: 0.8,
                    align: 'center'
                }, {
                    text: 'PIR',
                    dataIndex: 'pir',
                    menuDisabled: true,
                    sortable: false,
                    // flex: 0.8,
                    align: 'center'
                }, {
                    text: 'PBS',
                    dataIndex: 'pbs',
                    menuDisabled: true,
                    sortable: false,
                    // flex: 0.8,
                    align: 'center'
                }, {
                    text: _('Action'),
                    dataIndex: 'access-action',
                    menuDisabled: true,
                    sortable: false,
                    // flex: 1,
                    align: 'center'
                }, {
                    text: _('Action VLAN'),
                    dataIndex: 'action-vlan-id',
                    menuDisabled: true,
                    sortable: false,
                    width: 180,
                    // flex: 1.1,
                    align: 'center'
                }],
                tbar: [{
                        xtype: 'label',
                        text: _('NE list')
                    }
                    /*, {
                     text: _('Refresh'),
                     iconCls: 'x-fa fa-refresh',
                     handler: 'onRefreshNodeListGrid'
                     }*/
                ],
                viewConfig: {
                    //Return CSS class to apply to rows depending upon data values
                    trackOver: false,
                    stripeRows: false,
                    emptyText: _('No data to display'),
                    deferEmptyText: false,
                    getRowClass: function(record) {

                    }
                }
            }]
        }, {
            xtype: 'fieldset',
            title: 'OAM',
            reference: 'oam_pre_fieldset',
            items: [{
                xtype: 'form',
                reference: 'eline_oam_pre_form',
                border: false,
                layout: 'hbox',
                fieldDefaults: {
                    labelWidth: 90,
                    labelAlign: "right"
                }, // The fields
                items: [{
                    xtype: 'container',
                    layout: 'vbox',
                    flex: 3.33,
                    defaultType: 'textfield',
                    defaults: {
                        inputWrapCls: '',
                        triggerWrapCls: '',
                        fieldStyle: 'background:none',
                        readOnly: true
                    },
                    items: [{
                            fieldLabel: _('OAM type'),
                            name: 'oam-type',
                        }, {
                            fieldLabel: _('Interval'),
                            name: "cc-interval",
                        },
                        /*                    {
                                                fieldLabel: 'Exp',
                                                name: "cc-exp",
                                            }, {
                                                fieldLabel: _('LM mode'),
                                                name: "lm-mode",
                                            }, */
                        {
                            fieldLabel: _('Multiple'),
                            name: "localdetectmultiplier"
                        }
                    ]
                }, {
                    xtype: 'container',
                    layout: 'vbox',
                    flex: 3.33,
                    defaultType: 'textfield',
                    defaults: {
                        inputWrapCls: '',
                        triggerWrapCls: '',
                        fieldStyle: 'background:none',
                        readOnly: true
                    },
                    items: [{
                            fieldLabel: 'hhh', //隐藏占位
                            labelSeparator: '',
                            style: {
                                'visibility': 'hidden'
                            }
                        }, {
                            fieldLabel: 'hhh', //隐藏占位
                            labelSeparator: '',
                            style: {
                                'visibility': 'hidden'
                            }
                        },
                        /*                    {
                                                fieldLabel: _('Interval'),
                                                name: "cc-interval",
                                            }, {
                                                fieldLabel: _('DM mode'),
                                                name: "dm-mode",
                                            }, */
                        {
                            fieldLabel: _('Interval'),
                            name: "localtxinterval"
                        }
                    ]
                }, {
                    xtype: 'container',
                    flex: 3.33,
                    style: {
                        'visibility': 'hidden'
                    }
                }]
            }]

        }, {
            xtype: 'fieldset',
            title: _('Route strategy'),
            reference: 'route_pre_fieldset',
            items: [{
                xtype: 'grid',
                reference: 'eline_route_pre_xc_grid',
                columnLines: true,
                border: true,
                autoScroll: true,
                bind: {
                    store: '{add_xc_grid_store}'
                },
                columns: [{
                    text: _('Direction'),
                    dataIndex: 'direction',
                    sortable: true,
                    // flex: 1,
                    width: 130,
                    align: 'center',
                    renderer: function(value, metaData) {
                        if (value == '1') {
                            return _('Src');
                        } else if (value == '2') {
                            return _('Dest');
                        }
                    }
                }, {
                    text: _('Role'),
                    dataIndex: 'role',
                    menuDisabled: true,
                    sortable: true,
                    width: 130,
                    // flex: 1,
                    align: 'center',
                    renderer: function(value, metaData) {
                        if (value == '1') {
                            return _('Master');
                        } else if (value == '2') {
                            return _('Slave');
                        }
                    }
                }, {
                    text: _(' NE'),
                    dataIndex: 'extnode-id',
                    menuDisabled: true,
                    sortable: true,
                    width: 200,
                    // flex: 2,
                    align: 'center',
                    renderer: function(value, metaData) {
                        return SdnSvc.getNodeUserLabelById(value, 'ext');
                    }
                }, {
                    text: _('Ext link'),
                    dataIndex: 'extlink-id',
                    menuDisabled: true,
                    sortable: true,
                    width: 260,
                    // flex: 2,
                    align: 'center',
                    renderer: function(value, metaData) {
                        return SdnSvc.getExtLinkUserLabelById(value);
                    }
                }, {
                    text: 'VLAN',
                    dataIndex: 'vlan',
                    menuDisabled: true,
                    sortable: false,
                    width: 130,
                    // flex: 1,
                    align: 'center'
                }, {
                    text: _('PW label'),
                    dataIndex: 'pw-label',
                    menuDisabled: true,
                    sortable: false,
                    width: 130,
                    // flex: 1,
                    align: 'center'

                }, {
                    text: _('In label'),
                    dataIndex: 'in-label',
                    menuDisabled: true,
                    sortable: true,
                    width: 130,
                    // flex: 1,
                    align: 'center'
                }, {
                    text: _('Out label'),
                    dataIndex: 'out-label',
                    menuDisabled: true,
                    sortable: true,
                    width: 130,
                    // flex: 1,
                    align: 'center'
                }],
                tbar: [{
                    xtype: 'label',
                    text: _('XC list')
                }],
                viewConfig: {
                    //Return CSS class to apply to rows depending upon data values
                    trackOver: false,
                    stripeRows: false,
                    emptyText: _('No data to display'),
                    deferEmptyText: false,
                    getRowClass: function(record) {

                    }
                }
            }]
        }]
    }]
});