Ext.define('Admin.view.inventory.inventoryNeView', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.base.PagedGrid',
        'Admin.view.inventory.basemodel.neEditForm',
        'Admin.view.inventory.basemodel.basePortGrid',
        'Admin.view.base.TermPanel'
    ],
    xtype: 'inventoryNeView',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            ne_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'rest/inventory/res_ne/select/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        // totalProperty: 'totalCount'// 不写则已，写则必须与后台保持一致
                    },
                }
            },
            //跟据网元ID获取端口信息
            port_grid_store: {
                autoLoad: false,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'rest/inventory/res_port/select/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            },
            association_type_store: {
                fields: [{
                    name: 'value',
                    type: 'string'
                }, {
                    name: 'association-type',
                    type: 'string'
                }],
                data: [{
                    "value": 'server',
                    "association-type": _("Server")
                }, {
                    "value": 'peer',
                    "association-type": _("Peer")
                }, {
                    "value": 'pool',
                    "association-type": _("Pool")
                }]
            }
        }
    },
    controller: {
        onToRouteView: function (me, e, eOpts) {
            var grid = this.lookupReference('neGrid'),
                records = grid.getSelectionModel().getSelection();
            var root_routeId = window.location.hash.split('/')[0];
            if (records.length > 0) {
                var id = records[0].get('neid');
                var to = me.routeId + '/neid/' + id;
                console.log(root_routeId, to);
                if (root_routeId && to) {
                    this.redirectTo(root_routeId + '/' + to);
                }
            }
        },
        setConfigMenuOptions:function(selections){
            //判断设比的配置功能是否存在
            var menu = this.lookupReference('NeConfigMenu');
            var restartMenu = menu.down('#NeRestart');
            var portMenu = menu.down('#NePort');
            var bannerMenu = menu.down('#NeBanner');
            var ntpMenu = menu.down('#NeNtp');

            if(selections.length == 1){
                Ext.Ajax.request({
                    url: '/inventory/menu/configmenu',
                    method: 'POST',
                    params: {
                        netypeid: selections[0].data.netypeid,
                        south_protocol: selections[0].data.south_protocol
                    },
                    jsonSubmit: true,
                    success: function (response, opts) {
                        var result = Ext.decode(response.responseText);

                        if(result && result.success){
                            restartMenu.setDisabled(!result.restart);
                            portMenu.setDisabled(!result.port);
                            bannerMenu.setDisabled(!result.banner);
                            ntpMenu.setDisabled(!result.ntp);
                        }
                    }
                });
            }else{
                restartMenu.setDisabled(true);
                portMenu.setDisabled(true);
                bannerMenu.setDisabled(true);
                ntpMenu.setDisabled(true);
            }
        },
        onselectionchange: function (sm, selections) {
            var toolMenuCard = this.lookupReference('toolMenuCard');
            var toolMenuCls = this.lookupReference('toolMenuCls');
            var number = selections.length;
            if (number == 1) {
                toolMenuCard.down("#onProperty").setDisabled(false);
                toolMenuCard.down("#editButton").setDisabled(false);
                toolMenuCard.down("#relatedResources").setDisabled(false);
                toolMenuCls.down("#onProperty").setDisabled(false);
                toolMenuCls.down("#editButton").setDisabled(false);
                toolMenuCls.down("#relatedResources").setDisabled(false);
            }
            else {
                toolMenuCard.down("#onProperty").setDisabled(true);
                toolMenuCard.down("#editButton").setDisabled(true);
                toolMenuCard.down("#relatedResources").setDisabled(true);
                toolMenuCls.down("#onProperty").setDisabled(true);
                toolMenuCls.down("#editButton").setDisabled(true);
                toolMenuCls.down("#relatedResources").setDisabled(true);
            }
            //动态设置配置菜单选项
            this.setConfigMenuOptions(selections);

            if(number == 1){
                var southNum = selections[0].get('south_protocol');
                var tabpanel = this.lookupReference('sdnTabpanel');
                var panel = tabpanel.down('devicePanel');

                if(southNum === 3 || southNum === 4){
                    panel.loadDevice('/inventory/devicepanel/' + selections[0].get('hostname'));
                    //tabpanel.setHidden(false);
                } else{
                    tabpanel.setHidden(true);
                }
            }
        },
        onItemClick: function( grid , record , item , index , e , eOpts ){
            var southNum = record.get('south_protocol');
            var tabpanel = this.lookupReference('sdnTabpanel');
            var panel = tabpanel.down('devicePanel');

            if(southNum === 3 || southNum === 4){
                panel.loadDevice('/inventory/devicepanel/' + record.get('hostname'));
                if(panel.isData){
                    tabpanel.setHidden(false);
                }else{
                    tabpanel.setHidden(true);
                }
            } else{
                tabpanel.setHidden(true);
            }
        },
        oncontextMenu: function (this_grid, record, item, index, e, eOpts) {
            var records = this_grid.getSelectionModel().getSelection()
            var length = records.length;
            console.info("length",length);
            var controller = this;
            //阻止浏览器默认右键事件
            e.preventDefault();
            e.stopEvent();
            //显示右键菜单
            var contextmenu = new Ext.menu.Menu({
                itemId: 'contextmenu',
                items: [
                    {
                        itemId: 'ToolBtn',
                        text: _('工具'),
                        tooltip: _('工具'),
                        iconCls: 'rclick_tools_menu',
                        menu: [
                            {
                                itemId: 'telnetBtn',
                                text: _('Telnet'),
                                tooltip: _('Telnet'),
                                iconCls: 'rclick_telnet_menu',
                                handler: function () {
                                    controller.openTelnet()
                                }
                            },
                            {
                                itemId: 'sshBtn',
                                text: _('SSH'),
                                tooltip: _('SSH'),
                                iconCls: 'rclick_telnet_menu',
                                handler: function () {
                                    controller.openSSH()
                                }
                            }
                        ]
                    }
                ]
            });
            if(length > 1){
                // contextmenu.down("#ToolBtn").setVisible(false).setDisabled(true);
                contextmenu.down("#ToolBtn").setDisabled(true);
            }
            else{

            }
            contextmenu.showAt(e.getXY());
        },
        onEdit: function () {
            var grid = this.lookupReference('neGrid'),
                form = this.lookupReference('ne_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            form.down("#saveButtonMenu").setVisible(true);
            if(record.get("south_protocol")== 1){
                // console.info('------',record.get("south_protocol"),form.down('#snmpTemplate'));
                form.down('#protocolController').setValue(false);
                form.down('#offLineCheck').setVisible(true).setDisabled(false);
                form.down('#poll_enabled').setValue(true);
                form.down('#upNePortController').setVisible(true).setDisabled(false);
                form.down('#protocolController').setVisible(true).setDisabled(false);
                form.down('#snmpTemplate').setVisible(false).setDisabled(true);
                if(record.get("uplink_port") != "" && record.get("uplink_port") != undefined){
                    form.down('#up_ne_name').setDisabled(false);
                    form.down('#down_link_port').setDisabled(false);
                }
                else{
                    form.down('#up_ne_name').setDisabled(true);
                    form.down('#down_link_port').setDisabled(true);
                    form.down('#up_ne_name').symbol_id = -1;
                }
            }
            else{
                form.down('#upNePortController').setVisible(false).setDisabled(true);
                form.down('#protocolController').setVisible(false).setDisabled(true);
                form.down('#poll_enabled').setValue(false);
                form.down('#offLineCheck').setVisible(false).setDisabled(true);
            }
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function (field) {
                //设置只读
                field.setReadOnly(false);
            });
            form.setTitle(_("Ne Edit Info"));
        },
        openTelnet : function(){
            var grid = this.lookupReference('neGrid'),
                record = grid.getSelectionModel().getSelection();
            if (record.length == 0 ) {
                return;
            }
            var data={"protocol":"Telnet","ip":record[0].get('ipaddress'),"nodeId":"o"+record[0].get('ipaddress').replace(/\./g,""),"nodeLable":record[0].get('userlabel')};
            var termPanel = this.lookupReference('termPanel');
            termPanel.showTermWin(data);
        },
        openSSH : function(){
            var grid = this.lookupReference('neGrid'),
                record = grid.getSelectionModel().getSelection();
            if (record.length == 0 ) {
                return;
            }
            var data={"protocol":"ssh","ip":record[0].get('ipaddress'),"nodeId":"o"+record[0].get('ipaddress').replace(/\./g,""),"nodeLable":record[0].get('userlabel')};
            var termPanel = this.lookupReference('termPanel');
            termPanel.showTermWin(data);
        },
        onProperty: function () {
            var grid = this.lookupReference('neGrid'),
                form = this.lookupReference('ne_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);
            form.down("#saveButtonMenu").setVisible(false);
            if(record.get("south_protocol")== 1){
                form.down('#protocolController').setValue(true);
                form.down('#offLineCheck').setVisible(true).setDisabled(false);
                form.down('#poll_enabled').setValue(true);
                form.down('#upNePortController').setVisible(true);
                form.down('#protocolController').setVisible(true);
                form.down('#snmpTemplate').setVisible(true);
                if(record.get("uplink_port") != "" && record.get("uplink_port") != undefined){
                    form.down('#up_ne_name').setDisabled(false);
                    form.down('#down_link_port').setDisabled(false);
                }
                else{
                    form.down('#up_ne_name').setDisabled(true);
                    form.down('#down_link_port').setDisabled(true);
                    form.down('#up_ne_name').symbol_id = -1;
                }
            }
            else{
                form.down('#protocolController').setValue(false);
                form.down('#upNePortController').setVisible(false).setDisabled(true);
                form.down('#protocolController').setVisible(false).setDisabled(true);
                form.down('#poll_enabled').setValue(false);
                form.down('#offLineCheck').setVisible(false).setDisabled(true);
            }
            form.getForm().getFields().each(function (field) {
                //设置只读
                field.setReadOnly(true);
            })
            form.setTitle(_("Ne Property Info"));
        },
        onDelete: function () {
            var grid = this.lookupReference('neGrid'),
                records = grid.getSelectionModel().getSelection(),
                form = this.lookupReference('searchCondationForm'),
                names = [], ids = [];
            var values = form.getForm().getValues();
            for (var i in records) {
                var record_json ={}
                record_json["neid"] = records[i].get('neid');
                names.push(records[i].get('userlabel'));
                ids.push(record_json);
            }
            Ext.MessageBox.confirm(_('Do you confirm deletion?'), names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        Ext.Ajax.request({
                            url: 'rest/inventory/res_ne/delete',  //请求地址
                            jsonData :{ne_ids: ids},
                            success: function(response){
                                var r = Ext.decode(response.responseText)
                                if (r.success) {
                                    Ext.Msg.alert(_('Tips'), r.msg);
                                }else{
                                    Ext.Msg.alert(_('Tips'), r.msg);
                                }
                                var store = grid.getStore();
                                store.proxy.url = "rest/inventory/res_ne/select/page"
                                store.proxy.extraParams = values;
                                store.reload();
                            }
                        });
                    } // if
                }
            );
        },
        onRefresh: function () {
            var grid = this.lookupReference('neGrid'),
                form = this.lookupReference('searchCondationForm');
            var values = form.getForm().getValues();
            // console.info("values:",values);
            var paging = grid.down('pagingtoolbar');
            paging.moveFirst();

            var store = grid.getStore();

            store.proxy.url = "rest/inventory/res_ne/select/page"
            store.proxy.extraParams = values;
            store.reload();
        },
        onItemDoubleClick: function (me, record, item, index, e, eOpts) {
            var form = this.lookupReference('ne_edit_form');
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function (field) {
                //设置只读
                field.setReadOnly(false);
            })
            form.setTitle(_("Ne Edit Info"));
        },
        createNTPServer: function() {
            var ntp_cfg_form = this.lookupReference('ntp_cfg_form');
            if(ntp_cfg_form.query('fieldset').length == 3){
                Ext.Msg.alert(_('Tip'), _('最多创建3个服务器'));
                return;
            }
            ntp_cfg_form.add(this.createNTPServerFieldSet(ntp_cfg_form));
        },
        createNTPServerFieldSet: function(ntp_form) {
            var ntp_dynamic_fieldSet_panel = new Ext.form.FieldSet({
                title: _('Server'),
                autoShow: true,
                autoHeight: true,
                autoWidth: true,
                baseCls: "x-fieldset",
                maskDisabled: false,
                collapsible: true,
                defaultType: 'textfield',
                layout: 'anchor',
                border: false,
                items: [{
                        xtype: "container",
                        layout: "hbox",
                        items: [{
                            xtype: "textfield",
                            name: "name",
                            fieldLabel: _('Name'),
                            allowBlank: false
                        }, {
                            xtype: 'combobox',
                            fieldLabel: _('Model'),
                            editable: false,
                            name: 'association-type',
                            displayField: 'association-type',
                            valueField: 'value',
                            value: 'server',
                            queryMode: 'local',
                            bind: {
                                store: '{association_type_store}'
                            }
                        }]
                    }, {
                        xtype: "container",
                        layout: "hbox",
                        items: [{
                            xtype: "textfield",
                            name: "address",
                            fieldLabel: "IP",
                            regex: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
                            regexText: _('Please input a valid IP')
                        }, {
                            xtype: "textfield",
                            name: "port",
                            fieldLabel: _("Port")
                        }]
                    }, {
                        xtype: "container",
                        layout: "hbox",
                        items: [{
                            xtype: "checkboxfield",
                            name: "iburst",
                            fieldLabel: "iburst"
                        }, {
                            xtype: "checkboxfield",
                            name: "prefer",
                            fieldLabel: _("Prefer")
                        }]
                    }, {
                        xtype: "button",
                        text: _("Remove"),
                        width: 80,
                        margin: 2,
                        iconCls: 'x-fa fa-trash',
                        handler: function() {
                            ntp_form.remove(this.up('fieldset'));
                        }
                    }
                ]
            });
            return ntp_dynamic_fieldSet_panel;
        },
        onNTPCancel: function(){
            this.getView().setActiveItem(this.lookupReference('inventoryFormGrid'));
        },
        onNTPSubmit: function() {
            var ntp_cfg_form = this.lookupReference('ntp_cfg_form');
            var form = ntp_cfg_form.getForm();
            var selectNodes = this.lookupReference('neGrid').getSelectionModel();
            if (selectNodes.getCount() > 0 && selectNodes.getCount() == 1) {
                var node = selectNodes.getSelection()[0];
                if (form.isValid()) {
                    var ntp = {
                        'neId': node.get('neid'),
                        'neTypeId': node.get('netypeid'),
                        'southProtocol': node.get('south_protocol'),
                        'enabled': (form.getValues()['enabled'] == 'on') ? true : false,
                        'server': []
                    };
                    var servers = [];
                    var aFieldset = ntp_cfg_form.query('fieldset');

                    for (var i = 0; i < aFieldset.length; i++) {
                        var fieldset = ntp_cfg_form.query('fieldset')[i];
                        var name = fieldset.down('textfield[name=name]').getValue();
                        var associationType = fieldset.down('combobox[name="association-type"]').getValue();
                        var address = fieldset.down('textfield[name=address]').getValue();
                        var port = fieldset.down('textfield[name=port]').getValue();
                        var iburst = fieldset.down('checkboxfield[name=iburst]').getValue();
                        var prefer = fieldset.down('checkboxfield[name=prefer]').getValue();

                        var server = {
                            'name': name,
                            'associationType': associationType,
                            'iburst': iburst,
                            'prefer': prefer,
                            'port': port,
                            'address': address
                        };
                        servers.push(server);
                    }
                    ntp['server'] = servers;

                    Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to submit?'),
                        function(btn) {
                            if (btn == 'yes') {
                                //
                                var submit_form = Ext.create('Ext.form.Panel', {
                                    items: []
                                });
                                submit_form.getForm().submit({
                                    url: 'osscommon/restconf/operations/raisecom-service-ntp:set-ntp',
                                    params: ntp,
                                    jsonSubmit: true,
                                    waitTitle: _('Tip'),
                                    waitMsg: _('Please wait...'),
                                    success: function(form, action) {
                                        Ext.Msg.alert(_('Tip'), _('Submit successfully'));
                                    },
                                    failure: function(form, action) {
                                        var res = Ext.decode(action.response.responseText);
                                        Ext.Msg.alert(_('Tip'), _('Submit unsuccessfully'));
                                    }
                                }); // form
                                //
                            }
                        } // func
                    );

                } else {
                    Ext.MessageBox.alert(_('Tip'), _('Input Error'));
                }
            }
        },
        onNeNTPConfig: function() {
            var ntp_cfg_form = this.lookupReference('ntp_cfg_form');
            var fss = ntp_cfg_form.query('fieldset');
            for (var c = 0; c < fss.length; c++) { //每次点击要先清除原有的fieldset
                ntp_cfg_form.remove(fss[c]);
            }
            var ne_grid = this.lookupReference('neGrid');
            if (ne_grid.getSelectionModel().getSelection().length == 1) {
                var ne = ne_grid.getSelectionModel().getSelection()[0];
                console.log(ne.get('neid'), ne.get('netypeid'), ne.get('south_protocol'));
                var node = {
                    'neId': ne.get('neid'),
                    'southProtocol': ne.get('south_protocol'),
                    'neTypeId': ne.get('netypeid')
                };
                var result = "";
                Ext.Ajax.request({
                    async: false,
                    method: 'POST',
                    jsonData: node,
                    url: 'osscommon/restconf/operations/raisecom-service-ntp:get-ntp',
                    success: function(response, opts) {
                        var res = Ext.util.JSON.decode(response.responseText); //string转化为json对象
                        if (res && res['success'] == true) {
                            result = res;
                        }
                    },
                    failure: function(response, opts) {
                        // console.log('server-side failure with status code ' + response.status);
                    }
                });
                    //faka data
                    /*                    result = {
                        "success": true,
                        "enabled": true,
                        "server": [{
                            "name": "ntp-server1",
                            "address": "172.16.75.131",
                            "port": 123,
                            "iburst": true,
                            "prefer": true,
                            "associationType": "server"
                        }, {
                            "name": "ntp-server2",
                            "address": "172.16.75.132",
                            "port": 123,
                            "iburst": true,
                            "prefer": true,
                            "associationType": "server"
                        }]
                    };*/
                    if(result){
                        ntp_cfg_form.getForm().findField('enabled').setValue(result["enabled"]);
                        var ntp_count = result['server'].length;
                        for (var i = 0; i < ntp_count; i++) {
                            var server = result['server'][i];
                            var fieldset = this.createNTPServerFieldSet(ntp_cfg_form);
                            fieldset.down('textfield[name=name]').setValue(server['name']);
                            fieldset.down('combobox[name="association-type"]').setValue(server['associationType']);
                            fieldset.down('textfield[name=address]').setValue(server['address']);
                            fieldset.down('textfield[name=port]').setValue(server['port']);
                            fieldset.down('checkboxfield[name=iburst]').setValue(server['iburst']);
                            fieldset.down('checkboxfield[name=prefer]').setValue(server['prefer']);
                            ntp_cfg_form.add(fieldset);
                        }

                    }


                    this.getView().setActiveItem(ntp_cfg_form);

            }

        },
        onEditSubmit: function () {
            var form_grid = this.lookupReference('inventoryFormGrid'),
                form = this.lookupReference('ne_edit_form'),
                view = this.getView(),
                controller = this;

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/rest/inventory/res_ne/edit',
                    waitTitle: _('Please wait...'),
                    waitMsg: _('Please wait...'),
                    submitEmptyText : false,
                    success: function (form, action) {
                        Ext.Msg.alert(_('Success'), action.result.msg);
                        view.setActiveItem(form_grid);
                        controller.onRefresh();
                    },
                    failure: function (form, action) {
                        Ext.MessageBox.alert(_('Operation Failure!'), action.result.msg);
                    }
                });
            }
            else {
                Ext.MessageBox.alert(_('Tip'), _('Please Check The Input Content'));
            }
        },
        onEditCancel: function () {
            this.lookupReference('ne_edit_form').getForm().reset();
            this.getView().setActiveItem(this.lookupReference('inventoryFormGrid'));
        },
        // load记录到form
        loadFormRecord: function (form, record) {
            form.getForm().loadRecord(record);
            this.getView().setActiveItem(form);
        },
        //端口配置界面
        onProtConfig: function () {
            this.getView().setActiveItem(this.lookupReference('ne_port_config_form'));

            var form_ne_grid = this.lookupReference('neGrid');
            var neid = form_ne_grid.getSelectionModel().getSelection()[0].get('neid');

            var form_port_grid = this.lookupReference('portGrid');

            var params = {search_id: "neid=" + neid, type: "web_router"};

            var pageBar = form_port_grid.down('pagingtoolbar');
            pageBar.moveFirst();

            var store = form_port_grid.getStore();

            store.proxy.url = 'rest/inventory/res_port/select/page';
            store.proxy.extraParams = params;
            store.reload();
        },
        //单个设备重启
        onNeRestartConfig: function(){
            var form_ne_grid = this.lookupReference('neGrid');
            var ne = form_ne_grid.getSelectionModel().getSelection()[0].data;

            Ext.Msg.confirm(_('Tip'), _('RestartConfirm1') + ne.hostname +  _('RestartConfirm2'), function(value){
                if(value == 'yes'){
                    Ext.create('Ext.form.Panel', {
                        items: []
                    }).getForm().submit({
                        url: '/osscommon/restconf/operations/raisecom-service-device:device-restart',
                        waitTitle: _('Please wait...'),
                        waitMsg: _('Please wait...'),
                        method: 'POST',
                        params: {
                            neId: ne.neid,
                            neTypeId: ne.netypeid,
                            southProtocol: ne.south_protocol
                        },
                        jsonSubmit: true,
                        success: function (form, action) {
                            var result = JSON.parse(action.response.responseText);
                            var msg = _('RestartFailed');

                            if(result){
                                if(result.success){
                                    msg = _('RestartSuccess');
                                }else{
                                    msg = result.cause;
                                }
                            }

                            Ext.Msg.alert(_('Tip'), msg);
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert(_('Tip'), _('ConnectionFaild'));
                        }
                    });
                }
            });
        },
        //banner配置
        onNeBannerConfig: function(){
            var textarea = this.lookupReference('BannerPanel').down('form').down('textarea');
            var form_ne_grid = this.lookupReference('neGrid');
            var ne = form_ne_grid.getSelectionModel().getSelection()[0].data;

            this.getView().setActiveItem(this.lookupReference('BannerPanel'));
            this.lookupReference('BannerPanel').setTitle(_('BannerInfo') + '-' + ne.hostname);
            textarea.setDisabled(true);
            textarea.setValue('');

            Ext.Ajax.request({
                url: '/osscommon/restconf/operations/raisecom-service-banner:get-banner',
                method: 'POST',
                params: {
                    neId: ne.neid,
                    neTypeId: ne.netypeid,
                    southProtocol: ne.south_protocol
                },
                jsonSubmit: true,
                success: function (response, opts) {
                    var result = Ext.decode(response.responseText);

                    if(result && result.success){
                        textarea.setValue(result.bannerContent);
                    }
                }
            });
        },
        onBannerEdit: function(){
            this.lookupReference('BannerPanel').down('form').down('textarea').setDisabled(false);
        },
        onBannerDelete: function(){
            var form_ne_grid = this.lookupReference('neGrid');
            var ne = form_ne_grid.getSelectionModel().getSelection()[0].data;
            var panel = this.lookupReference('BannerPanel').down('form');

            Ext.create('Ext.form.Panel', {
                items: []
            }).getForm().submit({
                url: '/osscommon/restconf/operations/raisecom-service-banner:delete-banner',
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                method: 'POST',
                params: {
                    neId: ne.neid,
                    neTypeId: ne.netypeid,
                    southProtocol: ne.south_protocol
                },
                jsonSubmit: true,
                success: function (form, action) {
                    var result = JSON.parse(action.response.responseText);
                    var msg = _('DeleteBannerFailed');

                    if(result){
                        if(result.success){
                            msg = _('DeleteBannerSuccess');
                            panel.getForm().reset();
                        }else{
                            msg = result.cause;
                        }
                    }

                    Ext.Msg.alert(_('Tip'), msg);
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('Tip'), _('ConnectionFaild'));
                }
            });
        },
        onBannerSave: function(){
            var textarea = this.lookupReference('BannerPanel').down('form').down('textarea');
            var form_ne_grid = this.lookupReference('neGrid');
            var ne = form_ne_grid.getSelectionModel().getSelection()[0].data;

            Ext.create('Ext.form.Panel', {
                items: [
                ]
            }).getForm().submit({
                url: '/osscommon/restconf/operations/raisecom-service-banner:set-banner',
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                method: 'POST',
                params: {
                    neId: ne.neid,
                    neTypeId: ne.netypeid,
                    southProtocol: ne.south_protocol,
                    bannerContent: textarea.getValue()
                },
                jsonSubmit: true,
                success: function (form, action) {
                    var result = JSON.parse(action.response.responseText);
                    var msg = _('SaveBannerFailed');

                    if(result){
                        if(result.success){
                            msg = _('SaveBannerSuccess');
                            textarea.setDisabled(true);
                        }else{
                            msg = result.cause;
                        }
                    }

                    Ext.Msg.alert(_('Tip'), msg);
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('Tip'), _('ConnectionFaild'));
                }
            });
        },
        //端口配置界面提交事件
        onConfigSubmit: function () {
            var neGrid = this.lookupReference('neGrid'),
                neRecord = neGrid.getSelectionModel().getSelection()[0],
                portGrid = this.lookupReference('portGrid'),
                form = this.lookupReference('ne_port_config_form');

            if(!form.isValid()){
                Ext.Msg.alert(_('Tips'), "参数配置错误!");
                return;
            }

            var ifIndexs=[],
                formValues = form.getValues(), //端口配置参数
                records = portGrid.getSelectionModel().getSelection();

            var flag = false;
            for(var name in formValues){
                if(formValues[name]){
                    flag = true;
                    break;
                }
            }

            if(!flag){
                form.down('#saveButtonMenu').setDisabled(true);
                return false;
            }

            for (var rd in records) {
                var index=records[rd].get('port_index');
                ifIndexs.push(index);
            }

            portConfig = {
                "neId": (neRecord.get('neid') == undefined) ? "" : neRecord.get('neid'),
                "neTypeId": (neRecord.get('netypeid') == undefined) ? "" : neRecord.get('netypeid'),
                "southProtocol": (neRecord.get('south_protocol') == undefined) ? "" : neRecord.get('south_protocol'),
                "ifIndexs": ifIndexs,
                "enabled":formValues["rb"],
                "speed":formValues["c_speed"],
                "duplex":formValues["duplex"],
                "jumboframe":parseInt(formValues["jumboframe"])
            };

            Ext.create('Ext.form.Panel', {
                items: [
                    // {xtype: 'hidden', name: 'nes', value: nes}
                ]
            }).getForm().submit({
                url: '/osscommon/restconf/operations/raisecom-service-interface:update-interface-info',
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                params: portConfig,
                jsonSubmit: true,
                success: function (form, action) {
                    var result = JSON.parse(action.response.responseText);
                    if(result.success){
                        Ext.Msg.alert('提示', '设置成功！');
                    } else {
                        if(action.response.status !=200)
                            Ext.Msg.alert('提示', result.error +'！');
                        else
                            Ext.Msg.alert('提示', result.cause +'！');
                    }
                },
                failure: function (form, action,response) {
                    var result = JSON.parse(action.response.responseText);
                    if(result.success){
                        Ext.Msg.alert('提示', '设置成功！');
                    } else {
                        if(action.response.status !=200)
                            Ext.Msg.alert('提示', result.error +'！');
                        else
                            Ext.Msg.alert('提示', result.cause +'！');
                    }
                }
            });
        },
        onGoBackNeList: function(){
            this.getView().setActiveItem(this.lookupReference('inventoryFormGrid'));
        }
    },
    items: [
        {
            xtype: 'panel',
            title: _('Ne Management'),
            // iconCls: 'x-fa fa-circle-o',
            iconCls: 'icon-router',
            reference: 'inventoryFormGrid',
            layout : {
                type : 'vbox',
                align : 'stretch',
                pack : 'start'
            },
            items: [
                {
                    border: true,
                    xtype: 'PagedGrid',
                    reference: 'neGrid',
                    // 绑定到viewModel的属性
                    bind: {
                        store: '{ne_grid_store}',
                    },
                    split: true,
                    selType: 'checkboxmodel',
                    // grid显示字段
                    columns: [
                        {text: _('Ne ID'), dataIndex: 'neid', width: 80},
                        {text: _('Ne Name'), dataIndex: 'userlabel', width: 120},
                        {text: _('MAC Address'), dataIndex: 'macaddress', width: 140},
                        {text: _('Ne Type'), dataIndex: 'netype_userlabel', width: 120},
                        {text: _('IP Address'), dataIndex: 'ipaddress', width: 120},
                        {text: _('UpLink Ne'), dataIndex: 'uplink_port_nename', width: 120},
                        {text: _('Down Port'), dataIndex: 'uplink_port_name', width: 135},
                        {
                            xtype: 'hidden',
                            text: _('Is Local'), dataIndex: 'islocal', width: 80,
                            menuDisabled: true,
                            renderer: function getColor(v, m, r) {
                                if (r.get('islocal') == 1) {
                                    return _("Local");
                                }
                                else if(r.get('islocal') == 0){
                                    return _("Remote");
                                }
                                return _("Unknown");
                            }
                        },
                        {
                            text: _('South Protocol'), dataIndex: 'south_protocol', width: 120,
                            menuDisabled: true,
                            renderer: function getColor(v, m, r) {
                                if (r.get('south_protocol') == 0) {
                                    return _("Unknown Protocol");
                                }
                                else if (r.get('south_protocol') == 1) {
                                    return "SNMP";
                                }
                                else if (r.get('south_protocol') == 2) {
                                    return "TR069";
                                }
                                else if (r.get('south_protocol') == 3) {
                                    return "NETCONF";
                                }
                                else if (r.get('south_protocol') == 4) {
                                    return "Openflow";
                                }
                                return _("Unknown Protocol");
                            }
                        },
                        // {text: '所有者', dataIndex: 'owner', width: 100},
                        // {text: '位置', dataIndex: 'location', width: 100},
                        {
                            text: _('Online Status'), dataIndex: 'resourcestate', width: 80,
                            menuDisabled: true,
                            renderer: function getColor(v, m, r) {
                                if (r.get('resourcestate') == 1) {
                                    m.tdCls = 'resourcestate_on';
                                    return _("Online");
                                }
                                else {
                                    m.tdCls = 'resourcestate_off';
                                }
                                return _("Offline");
                            }
                        },
                        {text: _('Longitude'), dataIndex: 'longitude', width: 100},
                        {text: _('Latitude'), dataIndex: 'latitude', width: 100},
                        {text: _('Tenant'), dataIndex: 'tenant', width: 100},
                        // {text: '生产商', dataIndex: 'vendor', width: 100},
                        {
                            xtype: 'hidden',
                            text: '协议参数',
                            dataIndex: 'proto_param',
                            width: 500
                        },
                        {xtype: 'hidden', text: '本地EMS名称', dataIndex: 'nativeemsname', width: 120},
                        {xtype: 'hidden', text: '别名列表', dataIndex: 'aliasnamelist', width: 120},
                        {xtype: 'hidden', text: '管理域', dataIndex: 'managedomain', width: 120},
                        {xtype: 'hidden', text: 'web_url', dataIndex: 'web_url', width: 120},
                        // , flex: 1
                    ],
                    viewConfig: {
                        //Return CSS class to apply to rows depending upon data values
                        emptyText: _('No data to display'),
                        deferEmptyText: false,
                        trackOver: false,
                        stripeRows: true
                    },
                    // 分页工具条位置
                    // pagingbarDock: 'bottom',
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
                            {val: 2000},
                        ]
                    },
                    dockedItems: [
                        {
                            xtype: 'form',
                            reference: 'searchCondationForm',
                            visible: false,
                            hidden: true,
                            border: true,
                            fieldDefaults: {
                                labelWidth: 75,//最小宽度  55
                                labelAlign: "right",
                            },// The fields
                            items: [
                                {
                                    xtype: "container",
                                    padding: '6 0 0 0',
                                    layout: "hbox",
                                    items: [
                                        {
                                            xtype: "container",
                                            layout: "vbox",
                                            items: [
                                                {
                                                    xtype: 'textfield',
                                                    fieldLabel: _('Ne Name'),
                                                    name: 'userlabel'
                                                },
                                                {
                                                    xtype: 'combobox',
                                                    fieldLabel: _('Tenant'),
                                                    editable:false,
                                                    name: 'tenant',
                                                    store: {
                                                        fields: [
                                                            {name: 'sec_user_id', type: 'string'},
                                                            {name: 'tenant', type: 'string'}
                                                        ],
                                                        proxy: {
                                                            type: 'ajax',
                                                            url: 'inventory/res_ne/select/tenant',
                                                            reader: {
                                                                type: 'json',
                                                                rootProperty: 'data'
                                                            }
                                                        },
                                                        autoLoad: true
                                                    },
                                                    valueField: 'sec_user_id',
                                                    displayField: 'tenant'
                                                }
                                            ]
                                        },
                                        {
                                            xtype: "container",
                                            layout: "vbox",
                                            items: [
                                                {
                                                    xtype: 'textfield',
                                                    fieldLabel: _('MAC Address'),
                                                    name: 'macaddress'
                                                },
                                                {
                                                    xtype: 'combobox',
                                                    fieldLabel: _('Online Status'),
                                                    name: 'resourcestate',
                                                    store: {
                                                        fields: [
                                                            {name: 'level', type: 'int'},
                                                            {name: 'value', type: 'string'}
                                                        ],
                                                        data: [
                                                            {"level": 0, "value": _('Offline')},
                                                            {"level": 1, "value": _('Online')}
                                                        ]
                                                    },
                                                    allowBlank: true,// 不允许为空
                                                    //typeAhead: true,
                                                    forceSelection: true,//设置必须从下拉框中选择一个值
                                                    valueField: 'level',
                                                    displayField: 'value',
                                                    emptyText: 'Select a state...',
                                                    queryMode: 'local'
                                                }
                                            ]
                                        },
                                        {
                                            xtype: "container",
                                            layout: "vbox",
                                            items: [
                                                {
                                                    xtype: 'textfield',
                                                    fieldLabel: _('Ne ID'),
                                                    name: 'neid',
                                                    allowBlank: true
                                                },
                                                {
                                                    xtype: "container",
                                                    layout: "hbox",
                                                    padding: '0 0 0 45',
                                                    items: [
                                                        {
                                                            xtype: 'button',
                                                            text: _('Reset'),//'重置查询',
                                                            iconCls: 'search_reset_bnt',
                                                            // margin: 5,
                                                            style : 'margin:0px 20px 0px 0px;',
                                                            handler: function () {
                                                                this.up('form').getForm().reset();
                                                                var paging = this.up("grid").down('pagingtoolbar');
                                                                paging.moveFirst();
                                                                var store = this.up("grid").getStore();
                                                                store.proxy.url = "rest/inventory/res_ne/select/page"
                                                                store.proxy.extraParams = {};
                                                                store.reload();
                                                            }
                                                        },
                                                        {
                                                            xtype: 'button',
                                                            iconCls: 'search_with_condition',
                                                            text: _('Search'),
                                                            width: 70,
                                                            // margin: 5,
                                                            handler: function () {
                                                                var values = this.up("form").getForm().getValues();
                                                                console.info("ne_search_values:", values);
                                                                var paging = this.up("grid").down('pagingtoolbar');
                                                                paging.moveFirst();
                                                                var store = this.up("grid").getStore();
                                                                store.proxy.url = "rest/inventory/res_ne/select/page"
                                                                store.proxy.extraParams = values;
                                                                store.reload();
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    listeners: {
                        // itemdblclick: 'onItemDoubleClick',
                        itemcontextmenu: 'oncontextMenu',
                        selectionchange: "onselectionchange",
                        //itemclick: 'onItemClick'
                    }
                },
                {
                    xtype: 'panel',
                    split: true,
                    flex: 1,
                    height:450,
                    hidden: true,
                    layout: 'fit',
                    title: _('DevicePanel'),
                    tools: [
                        {
                            type: 'close',
                            callback: function(){
                                this.up('panel').setHidden(true);
                            }
                        }
                    ],
                    reference: 'sdnTabpanel',
                    items: [
                        {
                            xtype: 'devicePanel'
                        }
                    ]
                }
            ],
            // 自定义工具条
            dockedItems: [
                {
                    reference: 'toolMenuCard',
                    itemId: 'toolMenuCard',
                    border: true,
                    xtype: 'toolbar',
                    items: [
                        {
                            text: _('Operation'),
                            menu: [
                                {
                                    itemId: "onProperty",
                                    text: _('Properties'),
                                    tooltip: _('Properties'),
                                    disabled: true,
                                    iconCls: 'topo_rclick_view_menu',
                                    handler: "onProperty"
                                },
                                {
                                    hidden:true,
                                    text: _('Search'),
                                    tooltip: _('Search'),
                                    iconCls: 'property_search_menu',
                                    handler: function () {
                                        var checkboxobj = this.up("panel").up("panel").down("#toolMenuCard").down("#searchConditions");
                                        var checkbox_value = checkboxobj.getValue();
                                        if (checkbox_value) {
                                            var searchCondationForm = this.up("panel").up("panel").down("form");
                                            searchCondationForm.setVisible(!checkbox_value);
                                            checkboxobj.setValue(!checkbox_value);
                                        }
                                        else {
                                            var searchCondationForm = this.up("panel").up("panel").down("form");
                                            searchCondationForm.setVisible(!checkbox_value);
                                            checkboxobj.setValue(!checkbox_value);
                                        }
                                    }
                                },
                                {
                                    itemId: "editButton",
                                    text: _('Modify'),
                                    tooltip: _('Modify'),
                                    disabled: true,
                                    iconCls: 'x-fa fa-edit',
                                    hidden:SEC.hidden('01010101'),
                                    handler: 'onEdit'
                                },
                                {
                                    itemId: "removeButton",
                                    text: _('Delete'),
                                    tooltip: _('Delete'),
                                    iconCls: 'x-fa fa-trash',
                                    hidden:SEC.hidden('01010102'),
                                    handler: 'onDelete',
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    }
                                },
                                {
                                    text: _('Refresh'),
                                    iconCls: 'property_refresh_menu',
                                    handler: 'onRefresh'
                                },
                                '-',
                                {
                                    text: _('Config'),
                                    reference: 'NeConfigMenu',
                                    iconCls: 'x-fa fa-cog',
                                    menu: [
                                        {
                                            text: _('Restart'),
                                            //iconCls: 'property_refresh_menu',
                                            handler: 'onNeRestartConfig',
                                            itemId: 'NeRestart',
                                            disabled: true
                                        },
                                        {
                                            text: _('Banner'),
                                            //iconCls: 'property_refresh_menu',
                                            handler: 'onNeBannerConfig',
                                            disabled: true,
                                            itemId: 'NeBanner'
                                        },
                                        {
                                            text: _('Port'),
                                            //iconCls: 'property_refresh_menu',
                                            handler: 'onProtConfig',
                                            itemId: 'NePort',
                                            disabled: true
                                        },
                                        {
                                            text: _('NTP'),
                                            //iconCls: 'property_refresh_menu',
                                            handler: 'onNeNTPConfig',
                                            itemId: 'NeNtp',
                                            // disabled: true
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            text: 'Edit',
                            disabled: true,
                            hidden: true,
                            iconCls: 'config_apply_btn',
                            menu: [
                                {
                                    text: _('告警过滤'),
                                    tooltip: _('告警过滤'),
                                    iconCls: 'property_alarm_filter_menu',
                                    disabled: true,
                                    hidden: true,
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                },
                                {
                                    text: _('网元管理'),
                                    tooltip: _('网元管理'),
                                    iconCls: 'property_deviceview_menu',
                                    disabled: true,
                                    hidden: true,
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                }
                            ]
                        },
                        {
                            text: _('Resources'),
                            //iconCls: 'config_apply_btn',
                            disabled: false,
                            menu: [
                                {
                                    itemId:"relatedResources",
                                    text: _('Related Resources'),
                                    iconCls: 'resource_type_menu',
                                    disabled: true,
                                    menu: [
                                        {
                                            text: _('Chassis List'),
                                            tooltip: _('Chassis List'),
                                            iconCls: 'property_resource_chassis_menu',
                                            hidden:SEC.hidden('01010103'),
                                            routeId: 'chassis',
                                            handler: 'onToRouteView'
                                        },
                                        {
                                            text: _('Local Card List'),
                                            tooltip: _('Local Card List'),
                                            iconCls: 'property_resource_card_menu',
                                            hidden:SEC.hidden('01010104'),
                                            //disabled : true,
                                            routeId: 'card',
                                            handler: 'onToRouteView'
                                        },
                                        {
                                            text: _('Remote Device List'),
                                            tooltip: _('Remote Device List'),
                                            iconCls: 'property_resource_userdevice_menu',
                                            hidden:SEC.hidden('01010105'),
                                            //disabled : true,
                                            routeId: 'remote_dev',
                                            handler: 'onToRouteView'
                                        },
                                        {
                                            text: _('Port List'),
                                            tooltip: _('Port List'),
                                            iconCls: 'property_resource_port_menu',
                                            hidden:SEC.hidden('01010106'),
                                            //disabled : true,
                                            routeId: 'port',
                                            handler: 'onToRouteView'
                                        }
                                    ]
                                },
                                {
                                    text: _('同步'),
                                    tooltip: _('同步'),
                                    hidden: true,
                                    iconCls: 'property_resource_sync_menu',
                                    disabled: true,
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                }
                            ]
                        },
                        {
                            text: '定位',
                            disabled: true,
                            hidden: true,
                            menu: [
                                {
                                    text: _('拓扑定位'),
                                    tooltip: _('拓扑定位'),
                                    iconCls: 'property_topo_location_menu',
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                }
                            ]
                        },
                        {
                            text: _('Tool'),
                            menu: [
                                {
                                    text: _('ICMP Ping'),
                                    tooltip: _('ICMP Ping'),
                                    hidden: true,
                                    iconCls: 'rclick_tool_menu',
                                    disabled: true,
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                },
                                {
                                    text: _('Native Ping'),
                                    tooltip: _('Native Ping'),
                                    iconCls: 'rclick_tool_menu',
                                    disabled: true,
                                    hidden: true,
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                },
                                {
                                    text: _('SNMP Ping'),
                                    tooltip: _('SNMP Ping'),
                                    iconCls: 'rclick_tool_menu',
                                    disabled: true,
                                    hidden: true,
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                },
                                {
                                    text: _('Telnet'),
                                    tooltip: _('Telnet'),
                                    iconCls: 'rclick_telnet_menu',
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: "openTelnet"
                                },
                                {
                                    text: _('SSH'),
                                    tooltip: _('SSH'),
                                    iconCls: 'rclick_telnet_menu',
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    handler: "openSSH"
                                }
                            ]
                        },
                        {
                            text: _('Export'),
                            menu: [
                                {
                                    text: _('Export All'),
                                    tooltip: _('Export All'),
                                    iconCls: 'property_export_excel_menu',
                                    hidden:SEC.hidden('01010109'),
                                    handler: function () {
                                        var search_form = this.up("panel").up("panel").down("form")
                                        var send_info = search_form.getValues();
                                        // var send_info = search_form.getValues();
                                        send_info.range = "all"
                                        location.href = "/inventory/res_ne/export/datacsv?" + Ext.Object.toQueryString(send_info)
                                    }
                                },
                                {
                                    text: _('Export Selected'),
                                    tooltip: _('Export Selected'),
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    iconCls: 'property_export_excel_menu',
                                    hidden:SEC.hidden('01010110'),
                                    handler: function () {
                                        var grid = this.up("panel").up("panel").down("grid"),
                                            records = grid.getSelectionModel().getSelection(),
                                            names = [], ids = [];

                                        for (var i in records) {
                                            names.push(records[i].get('userlabel'));
                                            ids.push(records[i].get('neid'));
                                        }
                                        var send_info = new Object();
                                        send_info.range = "part";
                                        send_info.selection_condition = ids;

                                        location.href = "/inventory/res_ne/export/datacsv?" + Ext.Object.toQueryString(send_info)

                                    }
                                }
                            ]
                        },
                        '->',
                        {
                            xtype: 'checkboxfield',
                            boxLabel: _('Quick operation'),
                            checked: false,
                            padding: '0 6 0 0',
                            listeners: {
                                change: function (me, newValue, oldValue, eOpts) {
                                    var searchCondationForm = this.up("panel").down("#toolMenuCls");
                                    searchCondationForm.setVisible(newValue);
                                }
                            }
                        },
                        {
                            itemId:"searchConditions",
                            xtype: 'checkboxfield',
                            boxLabel: _('Show Conditions'),
                            checked: false,
                            padding: '0 6 0 0',
                            listeners: {
                                change: function (me, newValue, oldValue, eOpts) {
                                    var searchCondationForm = this.up("panel").down("form");
                                    searchCondationForm.getForm().reset();
                                    searchCondationForm.setVisible(newValue);
                                }
                            }
                        }
                    ]
                },
                {
                    reference: 'toolMenuCls',
                    itemId: 'toolMenuCls',
                    border: true,
                    hidden:true,
                    xtype: 'toolbar',
                    items: [
                        {
                            itemId: 'SearchBtn',
                            tooltip: _('Search'),
                            iconCls: 'property_search_menu',
                            hidden:true,
                            handler: function () {
                                var checkboxobj = this.up("panel").down("#toolMenuCard").down("#searchConditions");
                                var checkbox_value = checkboxobj.getValue();
                                if (checkbox_value) {
                                    var searchCondationForm = this.up("panel").down("form");
                                    searchCondationForm.setVisible(!checkbox_value);
                                    checkboxobj.setValue(!checkbox_value);
                                }
                                else {
                                    var searchCondationForm = this.up("panel").down("form");
                                    searchCondationForm.setVisible(!checkbox_value);
                                    checkboxobj.setValue(!checkbox_value);
                                }
                            }
                        },
                        {
                            itemId: "editButton",
                            tooltip: _('Modify'),
                            iconCls: 'property_edit_menu',
                            disabled: true,
                            handler: "onEdit"
                        },
                        {
                            itemId: "onProperty",
                            tooltip: _('Properties'),
                            iconCls: 'topo_rclick_view_menu',
                            disabled: true,
                            handler: "onProperty"
                        },
                        {
                            itemId: "removeButton",
                            tooltip: _('Delete'),
                            disabled: false,
                            iconCls: 'topo_node_delete_icon',
                            hidden:SEC.hidden('01010102'),
                            handler: "onDelete",
                            bind: {
                                disabled: '{!neGrid.selection}'
                            }
                        },
                        {
                            iconCls: 'property_refresh_menu',
                            tooltip: _('Refresh'),
                            handler: 'onRefresh'
                        },
                        {
                            tooltip: _('Export'),
                            iconCls: 'topo_export_menu_icon',
                            menu: [
                                {
                                    text: _('Export All'),
                                    tooltip: _('Export All'),
                                    iconCls: 'property_export_excel_menu',
                                    hidden:SEC.hidden('01010109'),
                                    handler: function () {
                                        var search_form = this.up("panel").up("panel").down("form")
                                        var send_info = search_form.getValues();
                                        // var send_info = search_form.getValues();
                                        send_info.range = "all"

                                        location.href = "/inventory/res_ne/export/datacsv?" + Ext.Object.toQueryString(send_info)
                                    }
                                },
                                {
                                    text: _('Export Selected'),
                                    tooltip: _('Export Selected'),
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    },
                                    iconCls: 'property_export_excel_menu',
                                    hidden:SEC.hidden('01010110'),
                                    handler: function () {
                                        var grid = this.up("panel").up("panel").down("grid"),
                                            records = grid.getSelectionModel().getSelection(),
                                            names = [], ids = [];

                                        for (var i in records) {
                                            names.push(records[i].get('userlabel'));
                                            ids.push(records[i].get('neid'));
                                        }
                                        var send_info = new Object();
                                        send_info.range = "part";
                                        send_info.selection_condition = ids

                                        location.href = "/inventory/res_ne/export/datacsv?" + Ext.Object.toQueryString(send_info)

                                    }
                                }
                            ]
                        },
                        "-",
                        {
                            tooltip: _('拓扑定位'),
                            hidden: true,
                            disabled: true,
                            iconCls: 'property_topo_location_menu',
                            handler: function () {
                                Ext.Msg.alert('Operation', "该功能未完善！");
                            },
                            bind: {
                                disabled: '{!neGrid.selection}'
                            }
                        },
                        {
                            tooltip: _('网元管理'),
                            hidden: true,
                            disabled: true,
                            iconCls: 'property_deviceview_menu',
                            handler: function () {
                                Ext.Msg.alert('提示', "对不起，该功能正在开发！");
                            },
                            bind: {
                                disabled: '{!neGrid.selection}'
                            }
                        },
                        {
                            iconCls: 'property_alarm_menu',
                            tooltip: _('告警管理'),
                            disabled: true,
                            hidden: true,
                            menu: [
                                {
                                    text: _('查看告警'),
                                    tooltip: _('查看告警'),
                                    iconCls: 'property_alarm_view_menu',
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    },
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    }
                                },
                                {
                                    text: _('过滤告警'),
                                    disabled: true,
                                    hidden: true,
                                    tooltip: _('过滤告警'),
                                    iconCls: 'property_alarm_filter_menu',
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    },
                                    bind: {
                                        disabled: '{!neGrid.selection}'
                                    }
                                }
                            ]
                        },
                        {
                            itemId:"relatedResources",
                            iconCls: 'resource_type_menu',
                            tooltip: _('Resources'),
                            disabled: true,
                            menu: [
                                {
                                    text: _('同步'),
                                    tooltip: _('同步'),
                                    hidden: true,
                                    iconCls: 'property_resource_sync_menu',
                                    handler: function () {
                                        Ext.Msg.alert('Operation', "该功能未完善！");
                                    }
                                },
                                "-",
                                {
                                    text: _('Chassis List'),
                                    tooltip: _('Chassis List'),
                                    iconCls: 'property_resource_chassis_menu',
                                    routeId: 'chassis',
                                    handler: 'onToRouteView'
                                },
                                {
                                    text: _('Local Card List'),
                                    tooltip: _('Local Card List'),
                                    iconCls: 'property_resource_card_menu',
                                    routeId: 'card',
                                    handler: 'onToRouteView'
                                },
                                {
                                    text: _('Remote Device List'),
                                    tooltip: _('Remote Device List'),
                                    iconCls: 'property_resource_userdevice_menu',
                                    hidden:SEC.hidden('01010105'),
                                    routeId: 'remote_dev',
                                    handler: 'onToRouteView'
                                },
                                {
                                    text: _('Port List'),
                                    tooltip: _('Port List'),
                                    iconCls: 'property_resource_port_menu',
                                    hidden:SEC.hidden('01010106'),
                                    routeId: 'port',
                                    handler: 'onToRouteView'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: _('Ne Edit Info'),
            xtype: 'ne_edit_form',
            reference: 'ne_edit_form',
            buttons: [
                {
                    text: _('Cancel'),
                    iconCls: 'x-fa fa-close',
                    handler: 'onEditCancel',
                },
                {
                    itemId: 'saveButtonMenu',
                    text: _('Save'),
                    iconCls: 'x-fa fa-save',
                    handler: 'onEditSubmit',
                }
            ]
        },
        {
            title: '网元端口配置信息',
            xtype: 'form',
            iconCls: 'icon-port_eth',
            reference: 'ne_port_config_form',
            margin: 10,
            items: [
                {
                    xtype: 'basePortGrid',
                    reference: 'portGrid',
                    // 绑定到viewModel的属性
                    bind: {
                        store: '{port_grid_store}',
                    }
                },
                {
                    xtype: 'fieldset',
                    title: '配置信息',
                    margin: 10,
                    defaultType: 'textfield',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            xtype: 'combobox',
                            fieldLabel: '运行速率(Mbps):',
                            name: 'c_speed',
                            width: 320,
                            store: {
                                fields: [
                                    {name: 'level', type: 'string'},
                                    {name: 'value', type: 'string'}
                                ],
                                data: [
                                    {"level": 'auto', "value": _('自协商')},
                                    {"level": '_10', "value": _('10')},
                                    {"level": '_100', "value": _('100')},
                                    {"level": '_1000', "value": _('1000')},
                                    {"level": '_10000', "value": _('10000')},
                                    {"level": '_40000', "value": _('40000')},
                                    {"level": '_100000', "value": _('100000')}
                                ]
                            },
                            allowBlank: false,
                            forceSelection: false,
                            valueField: 'level',
                            displayField: 'value',
                            emptyText: '请选择运行速率...',
                            queryMode: 'local',
                            value:'auto',
                        },
                        {
                            xtype: 'combobox',
                            width: 320,
                            fieldLabel: '双工模式',
                            name: 'duplex',
                            store: {
                                fields: [
                                    {name: 'level', type: 'string'},
                                    {name: 'value', type: 'string'}
                                ],

                                data: [
                                    {"level": 'auto', "value": _('自协商')},
                                    {"level": 'half', "value": _('全双工')},
                                    {"level": 'full', "value": _('半双工')}

                                ]
                            },
                            allowBlank: false,// 不允许为空
                            forceSelection: false,//设置必须从下拉框中选择一个值
                            valueField: 'level',
                            displayField: 'value',
                            emptyText: '请选择双工模式...',
                            queryMode: 'local',
                            value:'auto',
                        },
                        {
                            xtype: 'numberfield',
                            width: 320,
                            allowBlank: false,// 不允许为空
                            allowDecimals: false, // 是否允许小数
                            allowNegative: false, // 是否允许负数
                            regex:/^-?\d+$/,
                            regexText: '请输入整数',
                            fieldLabel: 'Jumbo帧',
                            name: 'jumboframe',
                        },
                        {
                            xtype: 'radiogroup',
                            fieldLabel: '管理状态',
                            name: 'c_state',
                            width: 320,
                            layout: 'column',
                            bodyStyle: "padding-top: 15px; padding-left:10px;",
                            items: [
                                {
                                    boxLabel: 'UP',
                                    name: 'rb',
                                    inputValue: true,
                                    columnWidth: 0.1,
                                    //id: 'c_state_11111',
                                    checked: true
                                },
                                {
                                    boxLabel: 'DOWN',
                                    name: 'rb',
                                    inputValue: false,
                                    columnWidth: 0.1}
                            ]
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: _('Cancel'),
                    iconCls: 'x-fa fa-close',
                    handler: 'onEditCancel',
                },
                {
                    itemId: 'saveButtonMenu',
                    text: _('Save'),
                    iconCls: 'x-fa fa-save',
                    bind: {
                        disabled: '{!portGrid.selection}'
                    },
                    handler: 'onConfigSubmit',
                }
            ]
        },
        {
            xtype: 'form',
            title: _("NTP Configuration"),
            reference: 'ntp_cfg_form',
            autoScroll: true,
            margin: '10 10 10 10',
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                labelWidth: 80,
                labelAlign: "right",
                flex: 1,
                margin: 5
            },
            items: [{
                xtype: "container",
                layout: "hbox",
                border: false,
                items: [{
                    xtype: "checkboxfield",
                    name: "enabled",
                    fieldLabel: _('Enabled')
                }, {
                    xtype: "button",
                    text: _('Create'),
                    textAlign: "center",
                    margin: 2,
                    iconCls: 'x-fa fa-plus',
                    handler: "createNTPServer"
                }]
            }],
            buttons: [{
                xtype: "button",
                text: _('Cancel'),
                iconCls: 'x-fa fa-close',
                handler: "onNTPCancel"
            },{
                xtype: "button",
                text: _('Submit'),
                iconCls: 'x-fa fa-save',
                handler: "onNTPSubmit"
            }]
        },
        {
            xtype: 'TermPanel',
            hidden: true,
            reference: 'termPanel'
        },
        {
            xtype: 'panel',
            layout: 'fit',
            title: _('BannerInfo'),
            reference: 'BannerPanel',
            items: [
                {
                    xtype: 'form',
                    layout: 'fit',
                    margin: 20,
                    items: [
                        {
                            xtype: 'textarea',
                            border: true,
                            name: 'banner-info'
                        }
                    ],
                    buttons: [
                        {text: _('Cancel'), handler: 'onGoBackNeList',  iconCls: 'x-fa fa-close'},
                        {text: _('Edit'), handler: 'onBannerEdit',  iconCls: 'x-fa fa-edit'},
                        {text: _('Delete'), handler: 'onBannerDelete',  iconCls: 'x-fa fa-trash'},
                        {text: _('Save'), handler: 'onBannerSave',  iconCls: 'x-fa fa-save'}
                    ]
                }
            ]
        }
    ]
});
