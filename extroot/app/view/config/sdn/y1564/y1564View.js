Ext.define('Admin.view.config.sdn.y1564.y1564View', {
    extend: 'Ext.panel.Panel',
    xtype: 'y1564View',
    requires: [
        'Ext.selection.CellModel',
        'Admin.view.base.PagedGrid',
        'Admin.view.config.sdn.pm.cf1564View',
        'Admin.view.config.sdn.pm.pm1564View'
    ],
    cls: 'shadow',
    layout: 'card',
    viewModel: {
        data: {
            eline_id: "",
            eline_userlabel: "",
            y1564_result_show: {}
        },
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
            y1564_task_list_grid_store: {
                autoLoad: true,
                pageSize: 5,
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/y1564/get_y1564_task_list',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'totalCount'
                    }
                }
            },
            cfg_test_mode_store: {
                fields: ['mode'],
                data: [{
                    'mode': 'cir'
                }, {
                    'mode': 'eir'
                }, {
                    'mode': 'overload'
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
            }
        }
    },
    controller: {
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
        //删除eline事件
        onRemove: function() {
            var eline_list_grid = this.lookupReference('eline_list_grid');
            var y1564_task_list_grid = this.lookupReference('y1564_task_list_grid');
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to delete the selected E-Line?'),
                function(btn) {
                    if (btn == 'yes') {
                        //
                        var submit_form = new Ext.form.Panel({});
                        var status = false;
                        submit_form.getForm().submit({
                            url: '/config/sdn/eline/remove',
                            params: {
                                elineId: eline_list_grid.getSelectionModel().getSelection()[0].get('id')
                            },
                            waitTitle: _('Tip'),
                            waitMsg: _('Deleting E-Line. Please wait......'),
                            success: function(response, opts) {

                                var remove_eline_status = true;
                                eline_list_grid.getStore().reload({
                                    page: 1,
                                    start: 0
                                });
                                //删除业务成功之后　要删除对应1564任务
                                var y1564_task_list = y1564_task_list_grid.getStore().getData().items;
                                if (y1564_task_list && y1564_task_list.length > 0) {
                                    Ext.Msg.alert(_('Tip'), _('Delete E-Line successfully. Starting to delete the corresponding Y.1564 task......'));
                                    var sp_y1564_task_list = y1564_task_list.filter(function(task) {
                                        return task.data['service-id'] == eline_list_grid.getSelectionModel().getSelection()[0].get('id');
                                    });
                                    if (sp_y1564_task_list && sp_y1564_task_list.length > 0) {
                                        sp_y1564_task_list.forEach(function(task) {
                                            submit_form.getForm().submit({
                                                url: '/config/sdn/y1564/remove',
                                                params: {
                                                    input: Ext.encode({
                                                        'service-id': eline_list_grid.getSelectionModel().getSelection()[0].get('id'),
                                                        'group': String(task.data['group'])
                                                    })
                                                },
                                                waitTitle: _('Tip'),
                                                waitMsg: _('Deleting the Y.1564 task') + ' ( group : ' + String(task.data['group']) + ' )，' + _('Please wait......'),
                                                success: function(response, opts) {
                                                    Ext.Msg.alert(_('Tip'), _('Delete the Y.1564 task successfully') + ' ( group : ' + String(task.data['group']) + ' )');
                                                    y1564_task_list_grid.getStore().reload({
                                                        page: 1,
                                                        start: 0
                                                    });
                                                },
                                                failure: function(response, opts) {
                                                    Ext.MessageBox.alert(_('Error'), _('Delete the Y.1564 task') + ' ( group : ' + String(task.data['group']) + ' ) ' + _('unsuccessfully'));
                                                    return;
                                                }
                                            }); // form
                                        });
                                    }
                                } else {
                                    Ext.Msg.alert(_('Tip'), _('Delete E-Line successfully'));
                                }

                            },
                            failure: function(response, opts) {
                                Ext.MessageBox.alert(_('Error'), _('Fail to delete E-Line'));
                                return;
                            }
                        }); // form
                        //
                    }
                } // func
            );
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
        gotoY1564TaskManagePage: function() {
            var y1564_task_list_grid = this.lookupReference('y1564_task_list_grid');
            y1564_task_list_grid.getStore().reload({
                page: 1,
                start: 0
            });
            this.getView().setActiveItem(y1564_task_list_grid);
        },
        gotoY1564CfgPage: function(grid, rowIndex, colIndex) {
            var eline_list_grid = this.lookupReference('eline_list_grid');
            var eline_id = eline_list_grid.getStore().getAt(rowIndex).data['id'];
            this.getViewModel().set('eline_id', eline_id);
            var eline_userlabel = eline_list_grid.getStore().getAt(rowIndex).data['user-label'];
            this.getViewModel().set('eline_userlabel', eline_userlabel);

            var y1564_config_tabpanel = this.lookupReference('y1564_config_tabpanel');
            var y1564_cfg_form = this.lookupReference('y1564_cfg_form');
            //判断业务是否有qos
            var qos = this.getSpecificElineQos(eline_id);
            if (qos.exist == false) {
                y1564_cfg_form.items.items[0].setHidden(true);
                var pm_bandwidth_container = y1564_cfg_form.items.items[1].items.items[1];
                var pm_bandwidth_tx = pm_bandwidth_container.items.items[0];
                pm_bandwidth_tx.setValue("");
            } else {
                y1564_cfg_form.items.items[0].setHidden(false);
                y1564_cfg_form.items.items[1].setHidden(false);
                var pm_bandwidth_container = y1564_cfg_form.items.items[1].items.items[1];
                var pm_bandwidth_tx = pm_bandwidth_container.items.items[0];
                pm_bandwidth_tx.setValue(qos.data['qos-a2z-cir'] / 100000);
            }
            // var y1564_result_show = this.getViewModel().get('y1564_result_show');
            y1564_config_tabpanel.tabBar.items.items[0].show();
            y1564_config_tabpanel.setActiveTab(0);
            var y1564_result_show = window.y1564_result_show;
            if (y1564_result_show && y1564_result_show[eline_id]) {
                if (y1564_result_show[eline_id].cfg) {
                    y1564_config_tabpanel.tabBar.items.items[1].show();
                } else {
                    y1564_config_tabpanel.tabBar.items.items[1].hide();
                }
                if (y1564_result_show[eline_id].pm) {
                    y1564_config_tabpanel.tabBar.items.items[2].show();
                } else {
                    y1564_config_tabpanel.tabBar.items.items[2].hide();
                }
            } else {
                y1564_config_tabpanel.tabBar.items.items[1].hide();
                y1564_config_tabpanel.tabBar.items.items[2].hide();
            }

            // y1564_config_tabpanel.setTitle('Y1564配置 (业务用户标识:' + eline_userlabel + ')');
            // y1564_config_tabpanel.setTitle('Y1564配置（业务用户标识：' + eline_userlabel + '）');
            var tb = y1564_cfg_form.getDockedItems('toolbar[dock="top"]')[0];
            tb.items.items[0].setText(_('Current E-Line user label: ') + eline_userlabel);
            this.getView().setActiveItem(y1564_config_tabpanel);
        },
        gotoY1564ResultPage: function(grid, rowIndex, colIndex) {
            var eline_list_grid = this.lookupReference('eline_list_grid');

            var eline_id = eline_list_grid.getStore().getAt(rowIndex).data['id'];
            this.getViewModel().set('eline_id', eline_id);
            var eline_userlabel = eline_list_grid.getStore().getAt(rowIndex).data['user-label'];
            this.getViewModel().set('eline_userlabel', eline_userlabel);

            var y1564_config_tabpanel = this.lookupReference('y1564_config_tabpanel');
            y1564_config_tabpanel.tabBar.items.items[0].hide();
            y1564_config_tabpanel.tabBar.items.items[1].show();
            y1564_config_tabpanel.setActiveTab(1);
            y1564_config_tabpanel.tabBar.items.items[2].show();
            var panel_cf_1564 = this.lookupReference('panel_cf_1564');
            var cf_tb = panel_cf_1564.getDockedItems('toolbar[dock="top"]')[0];
            var panel_pm_1564 = this.lookupReference('panel_pm_1564');
            var pm_tb = panel_pm_1564.getDockedItems('toolbar[dock="top"]')[0];
            cf_tb.items.items[0].setText(_('Current E-Line user label: ') + eline_userlabel);
            pm_tb.items.items[0].setText(_('Current E-Line user label: ') + eline_userlabel);

            // y1564_config_tabpanel.setTitle('Y1564结果（业务用户标识：' + eline_userlabel + "）");
            this.onCfChartQuery1564(eline_id);
            this.getView().setActiveItem(y1564_config_tabpanel);
        },
        backToElineListPage: function() {
            var eline_list_grid = this.lookupReference('eline_list_grid');
            this.getView().setActiveItem(eline_list_grid);
        },
        getSpecificEline: function(eline_id) {
            console.log("----------------getSpecificEline---------------");
            var data = "";
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/eline/specificeline/' + eline_id,
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = Ext.util.JSON.decode(response.responseText).data; //string转化为json对象
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
        },
        getSpecificElineQos: function(eline_id) {
            console.log("----------------isElineQosExist---------------");
            var qos = {
                exist: false,
                data: {}
            };
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/eline/specificeline/' + eline_id,
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = Ext.util.JSON.decode(response.responseText).data; //string转化为json对象
                    var qos_info = data.pw[0].qos;
                    if (qos_info && qos_info['qos-a2z-cir'] && qos_info['qos-a2z-pir'] && qos_info['qos-z2a-cir'] && qos_info['qos-z2a-pir']) {
                        qos.exist = true;
                        qos.data['qos-a2z-cir'] = qos_info['qos-a2z-cir'];
                        qos.data['qos-a2z-pir'] = qos_info['qos-a2z-pir'];
                        qos.data['qos-a2z-cbs'] = qos_info['qos-a2z-cbs'];
                        qos.data['qos-a2z-pbs'] = qos_info['qos-a2z-pbs'];
                        qos.data['qos-z2a-cir'] = qos_info['qos-z2a-cir'];
                        qos.data['qos-z2a-pir'] = qos_info['qos-a2z-pir'];
                        qos.data['qos-z2a-cbs'] = qos_info['qos-z2a-cbs'];
                        qos.data['qos-z2a-pbs'] = qos_info['qos-a2z-pbs'];
                    }
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return qos;
        },
        onPktSizePatternChange: function(type, value) {
            var y1564_cfg_form = this.lookupReference('y1564_cfg_form');
            var index = type == 'cfg' ? 0 : 1;
            var fs = y1564_cfg_form.items.items[index];
            fs.items.items[1].items.items[1].setFieldLabel(value == 'fixed' ? _('Packet length') : _('Max packet length'));
        },
        onCfgPktSizePatternChange: function(group, newValue, oldValue, eOpts) {
            console.log("oldValue: " + oldValue["cfg-pktsizepattern"]);
            console.log("newValue: " + newValue["cfg-pktsizepattern"]);
            this.onPktSizePatternChange('cfg', newValue["cfg-pktsizepattern"]);
        },
        onPmPktSizePatternChange: function(group, newValue, oldValue, eOpts) {
            console.log("oldValue: " + oldValue["pm-pktsizepattern"]);
            console.log("newValue: " + newValue["pm-pktsizepattern"]);
            this.onPktSizePatternChange('pm', newValue["pm-pktsizepattern"]);
        },
        setStartBtnCls: function(v, meta, rec) {
            if (meta.value == _('Ongoing')) {
                return 'x-item-disabled x-fa fa-play-circle-o';
            } else {
                return 'x-fa fa-play-circle-o';
            }
        },
        setStopBtnCls: function(v, meta, rec) {
            if (meta.value == _('Done') || meta.value == _('Planned')) {
                return 'x-item-disabled x-fa fa-stop';
            } else {
                return 'x-fa fa-stop';
            }
        },
        getY1564TaskStatus: function(eline_id, group) {
            console.log("----------------getSpecificEline---------------");
            var data = "";
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/y1564/get_y1564_task_status/' + eline_id + '/' + group,
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = Ext.util.JSON.decode(response.responseText).status; //string转化为json对象
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
        },
        statusRenderer: function(value, metaData) {
            var data = metaData.record.data;
            var status = this.getY1564TaskStatus(data['service-id'], data['group']);
            // "initial":"未开始",
            // "start":"进行中",
            // "on-schedule":"进行中",
            // "finish":"已完成",
            if (status == 'initial') {
                return _('Planned');
            } else if (status == 'start' || status == 'on-schedule') {
                return _('Ongoing');
            } else if (status == 'finish') {
                return _('Done');
            } else {
                return _('unknown');
            }

        },
        y1564Reset: function() {
            this.lookupReference('y1564_cfg_form').reset();
        },
        y1564Submit: function() {
            var me = this;
            var y1564_cfg_form = this.lookupReference('y1564_cfg_form');
            var fss = y1564_cfg_form.items.items;
            var values = y1564_cfg_form.getForm().getValues();
            console.log(values);
            var cfg_submit = false;
            var pm_submit = false;
            if (values['cfg-start'] !== undefined) { //可以同时进行配置测试和性能测试
                if (fss[0].isVisible() == true && fss[0].down('checkboxfield').checked == true) {
                    cfg_submit = true;
                }
                if (fss[1].isVisible() == true && fss[1].down('checkboxfield').checked == true) {
                    pm_submit = true;
                }
            } else { //只能进行性能测试
                if (fss[0].isVisible() == true && fss[0].down('checkboxfield').checked == true) {
                    pm_submit = true;
                }
            }
            if (this.getViewModel().get('eline_id')) {
                var input = {};
                input['service-id'] = this.getViewModel().get('eline_id');
                var eline = this.getSpecificEline(this.getViewModel().get('eline_id'));
                var y1564_config_tabpanel = this.lookupReference('y1564_config_tabpanel');
                var initial_ne_id = eline.pw[0]['ingress-ne-id'];
                var loopback_ne_id = eline.pw[0]['egress-ne-id'];
                if (cfg_submit == true) { //配置测试
                    var confirm_title = _('Are you sure to submit [throughput detection] item?');
                    input['type'] = 'throughput';
                    input['period'] = values['period'] == '' ? '30' : values['period'];
                    input['throughput-container'] = {};
                    var cfg = {
                        'initial-ne-id': initial_ne_id,
                        'loopback-ne-id': loopback_ne_id,
                        'type': 'throughput',
                        'frametype': 'l2',
                        'bandenable': 'false',
                        'task-role': 'master',
                        'mode': values['mode'],
                        'step': values['step'],
                        'pktsizepattern': values['cfg-pktsizepattern']
                    };
                    if (values['cfg-destmac'] !== "") {
                        cfg['destmac'] = values['cfg-destmac'];
                    }
                    if (values['cfg-pktsizepattern'] == 'fixed') {
                        cfg['pktsize'] = values['cfg-pktsize'];
                    } else {
                        cfg['maxsize'] = values['cfg-pktsize'];
                    }
                    input['throughput-container'] = {
                        'throughput-task': [cfg]
                    };
                }
                if (pm_submit == true) { //性能测试
                    var confirm_title = _('Are you sure to submit [performance detection] item?');
                    input['type'] = 'performance';
                    input['life'] = values['life'] == '' ? '0' : values['life'];
                    input['performance-container'] = [];
                    var pm = {
                        'initial-ne-id': initial_ne_id,
                        'loopback-ne-id': loopback_ne_id,
                        'type': 'performance',
                        'frametype': 'l2',
                        'bandenable': 'false',
                        'pktsizepattern': values['pm-pktsizepattern']
                    };
                    if (values['pm-destmac'] !== "") {
                        pm['destmac'] = values['pm-destmac'];
                    }
                    if (values['pm-pktsizepattern'] == 'fixed') {
                        pm['pktsize'] = values['pm-pktsize'];
                    } else {
                        pm['maxsize'] = values['pm-pktsize'];
                    }
                    input['performance-container'] = {
                        'performance-task': [pm]
                    };
                }
                input['auto-start'] = String(values['cfg-start'] || values['pm-start']);
                if (cfg_submit == true && pm_submit == true) {
                    input['type'] = 'both';
                    var confirm_title = _('Are you sure to submit [throughput & performance detection] item?');
                }
                if (cfg_submit == false && pm_submit == false) {
                    Ext.Msg.alert(_('Tip'), _('No test item is selected. Please select again.'));
                    return;
                }
                input['loopback-container'] = {
                    "loopback-task": [{
                        "loopback-ne-id": loopback_ne_id,
                        "flag": "rcsam",
                        "type": "internal",
                        "flow": "l2",
                        "enable": "true"
                    }]
                };
                //
                Ext.MessageBox.confirm(_('Operation Confirm'), confirm_title,
                    function(btn) {
                        if (btn == 'yes') {
                            //
                            var submit_form = new Ext.form.Panel({});
                            submit_form.getForm().submit({
                                url: '/config/sdn/y1564/enable',
                                params: {
                                    input: Ext.encode(input)
                                },
                                waitTitle: _('Tip'),
                                waitMsg: _('Submitting. Please wait......'),
                                success: function(form, action) {
                                    Ext.Msg.alert(_('Tip'), _('Submit successfully'));
                                    //成功下发1564之后，要马上跳转至对应tab页
                                    var eline_id = input['service-id'];
                                    if (!window.y1564_result_show) {
                                        window.y1564_result_show = {};
                                    }
                                    var cfg_show = false;
                                    var pm_show = false;
                                    var panel_cf_1564 = me.lookupReference('panel_cf_1564');
                                    var cf_tb = panel_cf_1564.getDockedItems('toolbar[dock="top"]')[0];
                                    var panel_pm_1564 = me.lookupReference('panel_pm_1564');
                                    var pm_tb = panel_pm_1564.getDockedItems('toolbar[dock="top"]')[0];
                                    if (cfg_submit == true) { //只进行配置测试 或 同时进行配置测试和性能测试
                                        y1564_config_tabpanel.tabBar.items.items[1].show();
                                        pm_tb.items.items[0].setText(_('Current E-Line user label: ') + me.getViewModel().get('eline_userlabel'));
                                        cfg_show = true;
                                        if (pm_submit == true) {
                                            y1564_config_tabpanel.tabBar.items.items[2].show();
                                            pm_tb.items.items[0].setText(_('Current E-Line user label: ') + me.getViewModel().get('eline_userlabel'));
                                            pm_show = true;
                                        } else {
                                            y1564_config_tabpanel.tabBar.items.items[2].hide();
                                            pm_show = false;
                                        }

                                        window.y1564_result_show[eline_id] = {
                                            cfg: cfg_show,
                                            pm: pm_show
                                        };
                                        // me.getViewModel().set('y1564_result_show', obj);
                                        me.onCfChartQuery1564(eline_id);
                                        y1564_config_tabpanel.setActiveTab(1);
                                    }
                                    if (cfg_submit == false && cfg_submit == true) { //只进行性能测试
                                        y1564_config_tabpanel.tabBar.items.items[1].hide();
                                        cfg_show = false;
                                        y1564_config_tabpanel.tabBar.items.items[2].show();
                                        pm_tb.items.items[0].setText(_('Current E-Line user label: ') + me.getViewModel().get('eline_userlabel'));
                                        pm_show = true;
                                        window.y1564_result_show[eline_id] = {
                                            cfg: cfg_show,
                                            pm: pm_show
                                        };
                                        // me.getViewModel().set('y1564_result_show', obj);
                                        y1564_config_tabpanel.setActiveTab(2);
                                    }
                                },
                                failure: function(form, action) {
                                    var res = Ext.decode(action.response.responseText);
                                    Ext.Msg.alert(_('Error'), _('Submit unsuccessfully'));
                                }
                            }); // form
                            //
                        }
                    } // func
                );
                //
            }
        },
        // onRefreshCfgResult: function() {
        //     var eline_id = this.getViewModel().get('eline_id');
        //     // this.onCfChartQuery1564(eline_id);
        // },
        startY1564Task: function(grid, rowIndex, colIndex) {
            var record = grid.getStore().getAt(rowIndex);
            var input = {
                'service-id': record.data['service-id'],
                'group': String(record.data['group'])
            };
            //
            var submit_form = new Ext.form.Panel({});
            submit_form.getForm().submit({
                url: '/config/sdn/y1564/start',
                params: {
                    input: Ext.encode(input)
                },
                waitTitle: _('Tip'),
                waitMsg: _('Starting the task. Please wait......'),
                success: function(form, action) {
                    grid.getStore().reload({
                        start: 0,
                        page: 1
                    });
                    Ext.Msg.alert(_('Tip'), _('Start the task successfully'));
                },
                failure: function(form, action) {
                    var res = Ext.decode(action.response.responseText);
                    Ext.Msg.alert(_('Error'), _('Fail to start the task'));
                }
            }); // form
            //

        },
        stopY1564Task: function(grid, rowIndex, colIndex) {
            var record = grid.getStore().getAt(rowIndex);
            var input = {
                'service-id': record.data['service-id'],
                'group': String(record.data['group'])
            };
            //
            var submit_form = new Ext.form.Panel({});
            submit_form.getForm().submit({
                url: '/config/sdn/y1564/stop',
                params: {
                    input: Ext.encode(input)
                },
                waitTitle: _('Tip'),
                waitMsg: _('Stopping the task. Please wait......'),
                success: function(form, action) {
                    grid.getStore().reload({
                        start: 0,
                        page: 1
                    });
                    Ext.Msg.alert(_('Tip'), _('Stop the task successfully'));
                },
                failure: function(form, action) {
                    var res = Ext.decode(action.response.responseText);
                    Ext.Msg.alert(_('Error'), _('Fail to stop the task'));
                }
            }); // form
            //
        },
        removeY1564Task: function(grid, rowIndex, colIndex) {
            var record = grid.getStore().getAt(rowIndex);
            var input = {
                'service-id': record.data['service-id'],
                'group': String(record.data['group'])
            };

            //
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to delete the current task?'),
                function(btn) {
                    if (btn == 'yes') {
                        //
                        var submit_form = new Ext.form.Panel({});
                        submit_form.getForm().submit({
                            url: '/config/sdn/y1564/remove',
                            params: {
                                input: Ext.encode(input)
                            },
                            waitTitle: _('Tip'),
                            waitMsg: _('Deleting the task. Please wait......'),
                            success: function(form, action) {
                                grid.getStore().removeAt(rowIndex); //移除该行
                                Ext.Msg.alert(_('Tip'), _('Delete the task successfully'));
                            },
                            failure: function(form, action) {
                                var res = Ext.decode(action.response.responseText);
                                Ext.Msg.alert(_('Error'), _('Fail to delete the task'));
                            }
                        }); // form
                        //
                    }
                } // func
            );
            //
        },
        serviceIdRenderer: function(value, metaData) {
            var eline_userlabel = this.getSpecificEline(value)['user-label'];
            return eline_userlabel;
        },
        unitRender: function(me, unit, color) {
            var font = document.createElement("font");
            font.setAttribute("style", "color:" + color);
            var kbps = document.createTextNode(unit);
            font.appendChild(kbps);
            font.style.marginLeft = "5px";
            me.el.dom.appendChild(font);
        },
        kbpsRender: function(me) {
            this.unitRender(me, 'kbps', 'gray');
        },
        mbpsRender: function(me) {
            this.unitRender(me, 'Mbps', 'gray');
        },
        transparantRender: function(me) {
            this.unitRender(me, '1ps', 'transparent');
        },
        secondRender: function(me) {
            this.unitRender(me, _('s'), 'gray');
        },
        hourRender: function(me) {
            this.unitRender(me, _('h'), 'gray');
        },

        //Y1564配置--查询事件
        onCfChartQuery1564: function(eline_id) {

            if (this.getSpecificElineQos(eline_id) && this.getSpecificElineQos(eline_id).exist == true) {
                var qos = this.getSpecificElineQos(eline_id).data;

                var panel = this.lookupReference('panel_cf_1564'),
                    cfView = panel.down("#cf1564View1");

                /*if(cfView)
                    panel.remove(cfView);

                cfView = Ext.create('Admin.view.config.sdn.pm.cf1564View',{
                    itemId:'cf1564View1',
                    cfViewId:'cf1564View1',
                });

                panel.add(cfView);*/
                //设置定时器,等于6布时,销毁定时器
                var task = Ext.TaskManager.start({
                    run: function() {
                        var step = cfView.getCf1564Chart(eline_id, parseInt(qos['qos-a2z-cir']), parseInt(qos['qos-a2z-pir']) - parseInt(qos['qos-a2z-cir']));
                        if (step == 6)
                            Ext.TaskManager.destroy(task);
                    },
                    interval: 5000
                });
                // cfView.getCf1564Chart(eline_id, parseInt(qos['qos-a2z-cir']), parseInt(qos['qos-a2z-pir']) - parseInt(qos['qos-a2z-cir']));

            }


        },

        //Y1564配置--查询事件
        onPmChartSearch1564: function(obj, event) {
            var me = this;

            var eline_id = this.getViewModel().get('eline_id');

            var panel = this.lookupReference('panel_pm_1564'),
                startTime = panel.down("#pmStartTime1564").rawValue,
                endTime = panel.down("#pmEndTime1564").rawValue;

            var pmView = panel.down("#pm1564View1");

            /* if(pmView)
                 panel.remove(pmView);

             pmView = Ext.create('Admin.view.config.sdn.pm.pm1564View',{
                 itemId:'pm1564View1',
                 cfViewId:'pm1564View1',
             });

             panel.add(pmView);*/
            pmView.getPm1564Chart(eline_id, startTime, endTime);
        }

        /* onTabChange:function(tabPanel, newCard, oldCard, eOpts){
            var me=this;
            if(newCard.title==_('Performance test result')){
                me.onPmChartSearch1564(null,null);
            }
            else if(newCard.title==_('Throughput test result')) {
                me.onCfChartQuery1564();
            }
        },*/
    },
    session: true,
    border: false,
    frame: false,
    items: [{
            xtype: 'PagedGrid',
            title: _('E-Line list'),
            iconCls: 'x-fa fa-circle-o',
            border: false,
            autoScroll: true,
            emptyText: _('No data to display'),
            bodyStyle: {
                borderColor: '#d0d0d0'
            },
            selType: 'checkboxmodel',
            reference: 'eline_list_grid',
            bind: '{eline_list_grid_store}',
            columns: [{
                dataIndex: 'name',
                flex: 1,
                text: _('Name')
            }, {
                dataIndex: 'user-label',
                flex: 1,
                text: _('User label')
            }, {
                dataIndex: 'ingress-node',
                flex: 1,
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
                flex: 1,
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
                flex: 1,
                text: _('Src VLAN')
            }, {
                dataIndex: 'egress-node',
                flex: 1,
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
                flex: 1,
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
                flex: 1,
                text: _('Dest VLAN')
            }, {
                xtype: 'actioncolumn',
                text: _('Operation'),
                menuDisabled: true,
                items: [{
                    iconCls: 'x-fa fa-gear',
                    tooltip: _('Start Y.1564 configuration'),
                    handler: 'gotoY1564CfgPage'
                }, {
                    iconCls: '',
                    disabled: true
                }, {
                    iconCls: 'x-fa fa-line-chart',
                    tooltip: _('View Y.1564 result'),
                    handler: 'gotoY1564ResultPage'
                }]
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
                    text: _('Task management'),
                    iconCls: 'x-fa fa-tasks',
                    itemId: 'y1564TaskManageBtn',
                    handler: 'gotoY1564TaskManagePage'
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
                    labelAlign: "right"
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
                selectionchange: 'elineListGridSelectionChange'
            }
        }, {
            xtype: 'tabpanel',
            reference: 'y1564_config_tabpanel',
            layout: 'fit',
            items: [{
                title: _('Configuration'),
                border: false,
                autoScroll: true,
                items: [{
                    xtype: 'form',
                    reference: 'y1564_cfg_form',
                    fieldDefaults: {
                        labelWidth: 100,
                        labelAlign: 'right',
                    },
                    defaults: {
                        style: {
                            'margin-left': '8px',
                            'margin-right': '8px'
                        }
                    },
                    dockedItems: [{
                        xtype: 'toolbar',
                        padding: '10px 0 0 0',
                        items: [{
                            xtype: 'label',
                            text: _('Current E-Line user label: '),
                            style: {
                                'margin-left': '10px'
                            }
                        }, '->', {
                            iconCls: 'x-fa fa-reply',
                            text: _('Back'),
                            tooltip: _('Back to E-Line list'),
                            handler: 'backToElineListPage'
                        }],
                    }],
                    items: [{
                        xtype: 'fieldset',
                        checkboxToggle: true,
                        title: _('Throughput test'),
                        layout: 'hbox',
                        items: [{
                            xtype: 'container',
                            layout: 'vbox',
                            flex: 3.33,
                            items: [{
                                xtype: 'textfield',
                                name: 'period',
                                fieldLabel: _('Test step'),
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer'),
                                value: 30,
                                listeners: {
                                    render: 'secondRender'
                                }
                            }, {
                                xtype: 'radiogroup',
                                fieldLabel: _('Packet mode'),
                                columns: 2,
                                vertical: false,
                                items: [{
                                    boxLabel: _('Fixed'),
                                    margin: '1 0 0 0',
                                    width: 80,
                                    name: 'cfg-pktsizepattern',
                                    inputValue: 'fixed',
                                    checked: true
                                }, {
                                    boxLabel: _('Variable'),
                                    margin: '1 0 0 1',
                                    width: 80,
                                    name: 'cfg-pktsizepattern',
                                    inputValue: 'random'
                                }],
                                listeners: {
                                    change: 'onCfgPktSizePatternChange',
                                }
                            }, {
                                xtype: 'textfield',
                                fieldLabel: _('Loopback MAC'),
                                name: 'cfg-destmac',
                                regex: /^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/,
                                regexText: _('Please enter a valid MAC address')
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            flex: 3.33,
                            items: [{
                                xtype: 'combobox',
                                name: 'mode',
                                fieldLabel: _('Mode'),
                                displayField: 'mode',
                                valueField: 'mode',
                                bind: {
                                    store: '{cfg_test_mode_store}'
                                },
                                value: 'overload'
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: _('Packet length'),
                                name: 'cfg-pktsize',
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer'),
                                minValue: 64,
                                maxValue: 9600,
                                value: 9600,
                                allowBlank: false,
                                listeners: {
                                    render: 'kbpsRender'
                                }
                            }, ]
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            flex: 3.33,
                            items: [{
                                xtype: 'numberfield',
                                fieldLabel: _('CIR steps'),
                                name: 'step',
                                minValue: 2,
                                maxValue: 4,
                                value: 4,
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer'),
                            }, {
                                xtype: 'radiogroup',
                                fieldLabel: _('Start now'),
                                columns: 2,
                                vertical: false,
                                items: [{
                                    boxLabel: _('Yes'),
                                    margin: '1 8 0 0',
                                    name: 'cfg-start',
                                    inputValue: true,
                                    checked: true
                                }, {
                                    boxLabel: _('No'),
                                    margin: '1 8 0 0',
                                    name: 'cfg-start',
                                    inputValue: false
                                }]
                            }]
                        }]
                    }, {
                        xtype: 'fieldset',
                        checkboxToggle: true,
                        title: _('Performance test'),
                        collapsed: false,
                        layout: 'hbox',
                        items: [{
                            xtype: 'container',
                            layout: 'vbox',
                            flex: 3.33,
                            items: [{
                                xtype: 'numberfield',
                                fieldLabel: _('Duration'),
                                name: 'life',
                                emptyText: _('By default, the test duration is not limited.'),
                                listeners: {
                                    render: 'hourRender'
                                }
                            }, {
                                xtype: 'radiogroup',
                                fieldLabel: _('Packet mode'),
                                columns: 2,
                                vertical: false,
                                items: [{
                                    boxLabel: _('Fixed'),
                                    margin: '1 0 0 0',
                                    width: 80,
                                    name: 'pm-pktsizepattern',
                                    inputValue: 'fixed',
                                    checked: true
                                }, {
                                    boxLabel: _('Variable'),
                                    margin: '1 0 0 1',
                                    width: 80,
                                    name: 'pm-pktsizepattern',
                                    inputValue: 'random'
                                }],
                                listeners: {
                                    change: 'onPmPktSizePatternChange',
                                }
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            flex: 3.33,
                            items: [{
                                xtype: 'numberfield',
                                fieldLabel: _('Bandwidth'),
                                name: 'bandwidth',
                                listeners: {
                                    render: 'mbpsRender'
                                }
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: _('Packet length'),
                                name: 'pm-pktsize',
                                minValue: 64,
                                maxValue: 9600,
                                value: 9600,
                                regex: /^[1-9]\d*$/,
                                regexText: _('Please enter a positive integer'),
                                allowBlank: false,
                                listeners: {
                                    render: 'kbpsRender'
                                }
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            flex: 3.33,
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('Loopback MAC'),
                                name: 'pm-destmac',
                                regex: /^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/,
                                regexText: _('Please enter a valid MAC address')
                            }, {
                                xtype: 'radiogroup',
                                fieldLabel: _('Start now'),
                                columns: 2,
                                vertical: false,
                                items: [{
                                    boxLabel: _('Yes'),
                                    margin: '1 8 0 5',
                                    name: 'pm-start',
                                    inputValue: true,
                                    checked: true
                                }, {
                                    boxLabel: _('No'),
                                    margin: '1 8 0 5',
                                    name: 'pm-start',
                                    inputValue: false
                                }]
                            }]
                        }]
                    }],
                    buttons: [{
                        text: _('Reset'),
                        handler: 'y1564Reset'
                    }, {
                        text: _('Submit'),
                        // formBind: true,
                        handler: 'y1564Submit'
                    }]
                }]
            }, {
                title: _('Throughput test result'),
                xtype: 'panel',
                reference: 'panel_cf_1564',
                items: [{
                    xtype: 'cf1564View',
                    itemId: 'cf1564View1',
                    cfViewId: 'cf1564View1'
                }],
                dockedItems: [{
                    xtype: 'toolbar',
                    padding: '10px 0 0 0',
                    items: [{
                        xtype: 'label',
                        text: _('Current E-Line user label: '),
                        style: {
                            'margin-left': '10px'
                        }
                    }, '->', {
                        iconCls: 'x-fa fa-reply',
                        text: _('Back'),
                        tooltip: _('Back to E-Line list'),
                        handler: 'backToElineListPage'
                    }]
                }]

                // buttons: [{
                //     text: _('Back'),
                //     handler: 'backToElineListPage'
                // }]
            }, {
                title: _('Performance test result'),
                xtype: 'panel',
                reference: 'panel_pm_1564',
                items: [{
                    xtype: 'pm1564View',
                    itemId: 'pm1564View1',
                    cfViewId: 'pm1564View1'
                }],
                dockedItems: [{
                    xtype: 'toolbar',
                    padding: '10px 0 0 0',
                    items: [{
                        xtype: 'label',
                        text: _('Current E-Line user label: '),
                        style: {
                            'margin-left': '10px'
                        }
                    }, '->', {
                        xtype: 'datetimefield',
                        itemId: "pmStartTime1564",
                        toolTip: _('Start Time'),
                        // labelWidth: 60,
                        labelWidth: APP.lang == 'zh_CN' ? 60 : 70,
                        labelAlign: 'right',
                        fieldStyle: "padding:5px 5px 4px",
                        fieldLabel: _('Start Time'),
                        name: 'startTime',
                        value: Ext.util.Format.date(Ext.Date.add(Ext.Date.add(new Date(), Ext.Date.MONTH, -1), Ext.Date.HOUR, -1), "Y-m-d H:i:s")
                    }, {
                        xtype: 'datetimefield',
                        itemId: "pmEndTime1564",
                        toolTip: _('End Time'),
                        labelWidth: 60,
                        labelAlign: 'right',
                        fieldStyle: "padding:5px 5px 4px",
                        fieldLabel: _('End Time'),
                        name: 'endTime',
                        value: Ext.util.Format.date(Ext.Date.add(new Date(), Ext.Date.MONTH, -1), "Y-m-d H:i:s")
                    }, {
                        xtype: 'button',
                        text: _('Query'),
                        style: 'margin:0 0 0 6px;',
                        iconCls: 'search_reset_bnt',
                        handler: "onPmChartSearch1564"
                    }, {
                        iconCls: 'x-fa fa-reply',
                        text: _('Back'),
                        tooltip: _('Back to E-Line list'),
                        handler: 'backToElineListPage'
                    }]
                }],
                // buttons: [{
                //     text: _('Back'),
                //     handler: 'backToElineListPage'
                // }]
            }]
        }, {
            xtype: 'PagedGrid',
            title: _('Y.1564 task management'),
            border: false,
            autoScroll: true,
            emptyText: _('No data to display'),
            bodyStyle: {
                borderColor: '#d0d0d0'
            },
            selType: 'checkboxmodel',
            reference: 'y1564_task_list_grid',
            bind: '{y1564_task_list_grid_store}',
            columns: [{
                dataIndex: 'service-id',
                flex: 1,
                text: _('E-Line user label'),
                renderer: 'serviceIdRenderer'
            }, {
                dataIndex: 'initial-ne-id',
                flex: 1,
                text: _('Initial NE'),
                renderer: function(value, metaData) {
                    var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
                    var newValue = "";
                    if (sdn_node_id_list.indexOf(value) !== -1) { //sdn设备
                        newValue += SdnSvc.getNodeUserLabelById(value, 'sdn');
                    } else { //外部节点 传统设备
                        newValue += SdnSvc.getNodeUserLabelById(value, 'ext');
                    }
                    return newValue;
                }
            }, {
                dataIndex: 'loopback-ne-id',
                flex: 1,
                text: _('Loopback NE'),
                renderer: function(value, metaData) {
                    var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
                    var newValue = "";
                    if (sdn_node_id_list.indexOf(value) !== -1) { //sdn设备
                        newValue += SdnSvc.getNodeUserLabelById(value, 'sdn');
                    } else { //外部节点 传统设备
                        newValue += SdnSvc.getNodeUserLabelById(value, 'ext');
                    }
                    return newValue;
                }
            }, {
                dataIndex: 'type',
                flex: 1,
                text: _('Test type'),
                renderer: function(value, metaData) {
                    if (value == 'throughput') {
                        return _('throughput');
                    } else {
                        return _('performance');
                    }
                }
            }, {
                dataIndex: 'group',
                flex: 1,
                text: 'Group'
            }, {
                dataIndex: 'status',
                flex: 1,
                text: _('Task Status'),
                renderer: 'statusRenderer'
            }, {
                xtype: 'actioncolumn',
                text: _('Operation'),
                menuDisabled: true,
                items: [{
                    iconCls: 'x-fa fa-play-circle-o',
                    text: _('Start'),
                    tooltip: _('Start'),
                    handler: 'startY1564Task',
                    getClass: 'setStartBtnCls'

                }, {
                    iconCls: '',
                    disabled: true
                }, {
                    iconCls: 'x-fa fa-stop',
                    text: _('Stop'),
                    tooltip: _('Stop'),
                    handler: 'stopY1564Task',
                    getClass: 'setStopBtnCls'
                }, {
                    iconCls: '',
                    disabled: true
                }, {
                    iconCls: 'x-fa fa-trash-o',
                    text: _('Delete'),
                    tooltip: _('Delete'),
                    handler: 'removeY1564Task'
                }]
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
            buttons: [{
                text: _('Back'),
                iconCls: 'x-fa fa-reply',
                tooltip: _('Back to E-Line list'),
                handler: 'backToElineListPage'

            }],
            viewConfig: {
                //Return CSS class to apply to rows depending upon data values
                trackOver: false,
                stripeRows: false,
                emptyText: _('No data to display'),
                deferEmptyText: false,
                getRowClass: function(record) {

                }
            },
            listeners: {
                // itemclick: 'onElineItemClick'
            }
        }

    ]
});