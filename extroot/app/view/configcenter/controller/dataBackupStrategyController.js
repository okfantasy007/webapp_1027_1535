Ext.define('Admin.view.configcenter.controller.dataBackupStrategyController', {
    extend: 'Admin.view.configcenter.model.grid_toolBar.CRUD',
    alias: 'controller.dataBackupStrategyController',
    requires: [

    ],
    getPolicyGrid: function () {
        var me = this,
            grid = me.getView().down('#policyGrid');
        return grid;
    },
    getCreatePolicyForm: function () {
        var me = this,
            form = me.getView().down('#createPolicy');
        return form;
    },
    getEditPolicyForm: function () {
        var me = this,
            form = me.getView().down('#editPolicyForm');
        return form;
    },
    //监听列表点击
    onItemClick: function (me, record) {
        var grid = this.getPolicyGrid(),
            selCnt = me.getSelectionModel().getSelection().length,
            editBtn = grid.down('#theEditBtn'),
            downloadBtn = grid.down('#theDownloadBtn')
        if (selCnt == 1) {
            editBtn.setDisabled(false);
        } else {
            editBtn.setDisabled(true);
        }
    },
    //添加策略
    onCreatePolicy: function () {
        var me = this,
            form = me.getCreatePolicyForm();
        me.setResetRecord(form);
        me.getView().setActiveItem(2);
    },
    //添加策略提交
    //因业务需求使用Ajax提交表单,将参数整合为json串
    createPolicySub: function () {
        var me = this,
            form = me.getCreatePolicyForm(),
            grid = me.getPolicyGrid(),
            value = form.getValues(),
            policyName = value.policyName,
            fileTypeName = value.fileTypeName,
            policyPeriod = value.policyPeriod,
            policyDate = value.policyDate,
            policyTime = value.policyTime,
            policyStatus = value.policyStatus,
            isDefault = value.isDefault,
            ftpIp = value.ftpIp,
            ftpPort = value.ftpPort,
            ftpUsername = value.ftpUsername,
            ftpPassword = value.ftpPassword,
            fileTransferProtocol = value.fileTransferProtocol,
            obj = {
                "policyName": policyName,
                "fileTypeName": fileTypeName,
                "policyPeriod": policyPeriod,
                "policyDate": policyDate,
                "policyTime": policyTime,
                "policyStatus": policyStatus,
                "isDefault": isDefault,
                "fileServer": {
                    "fileServer.ftpIp": ftpIp,
                    "fileServer.ftpPort": ftpPort,
                    "fileServer.ftpUsername": ftpUsername,
                    "fileServer.ftpPassword": ftpPassword,
                    "fileServer.fileTransferProtocol": fileTransferProtocol,
                }
            };
        if (!isDefault) {
            isDefault = 2;
        }
        if (!policyStatus) {
            policyStatus = 2;
        }
        if (!form.getForm().isValid()) {
            Ext.Msg.alert(_('Tips'), _('请正确填写表单!'));
            return;
        }
        if (fileTypeName == 'All Files') {

            Ext.Msg.alert(_('Tips'), _('请选择文件类型'));
            return;
        }
        console.log(policyPeriod);
        if (policyPeriod == -1) {

            Ext.Msg.alert(_('Tips'), _('请选择调度周期'));
            return;
        }
        console.log(fileTypeName);
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/policy/newRecord',
            params: {
                "policyName": policyName,
                "fileTypeName": fileTypeName,
                "policyPeriod": policyPeriod,
                "policyDate": policyDate,
                "policyTime": policyTime,
                "policyStatus": policyStatus,
                "isDefault": isDefault,
                "fileServer": Ext.encode({
                    "ftpIp": ftpIp,
                    "ftpPort": ftpPort,
                    "ftpUsername": ftpUsername,
                    "ftpPassword": ftpPassword,
                    "fileTransferProtocol": fileTransferProtocol,
                })
            },
            disableCaching: false,
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Create Policy Success'));
                    grid.store.reload();
                    form.reset();
                    me.getView().setActiveItem(0);
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });

    },
    //编辑策略
    onEdit: function () {
        var me = this,
            form = me.getEditPolicyForm(),
            grid = me.getPolicyGrid(),
            record = grid.getSelectionModel().getSelection()[0];
        form.getForm().loadRecord(record);
        me.setResetRecord(form);
        me.getView().setActiveItem(1);
        var policyTime = form.getForm().findField('policyTime');
        var value = record.get('policyTime');
        var newValue = '2017-01-04 ' + value;
        console.log(newValue);
        var dt = new Date(newValue);
        // console.log(dt.toTimeString());
        // console.log(dt);
        policyTime.setValue(dt);

        // console.log(form.getForm().getValues());
        // console.log(record.get('policyTime'));
    },
    //编辑策略提交  
    onEditPolicySub: function () {
        me = this,
            grid = me.getPolicyGrid(),
            form = me.getEditPolicyForm(),
            record = grid.getSelectionModel().getSelection()[0],
            value = form.getValues(),
            policyId = record.data.policyId,
            policyName = value.policyName,
            fileTypeName = value.fileTypeName,
            policyPeriod = value.policyPeriod,
            policyDate = value.policyDate,
            policyTime = value.policyTime,
            policyStatus = value.policyStatus,
            isDefault = value.isDefault,
            ftpIp = value.ftpIp,
            ftpPort = value.ftpPort,
            ftpUsername = value.ftpUsername,
            ftpPassword = value.ftpPassword,
            fileTransferProtocol = value.fileTransferProtocol,
            obj = {
                "policyName": policyName,
                "fileTypeName": fileTypeName,
                "policyPeriod": policyPeriod,
                "policyDate": policyDate,
                "policyTime": policyTime,
                "policyStatus": policyStatus,
                "isDefault": isDefault,
                "policyId": policyId,
                "fileServer": {
                    "fileServer.ftpIp": ftpIp,
                    "fileServer.ftpPort": ftpPort,
                    "fileServer.ftpUsername": ftpUsername,
                    "fileServer.ftpPassword": ftpPassword,
                    "fileServer.fileTransferProtocol": fileTransferProtocol,
                }
            };
        if (!isDefault) {
            isDefault = 2;
        }
        if (!policyStatus) {
            policyStatus = 2;
        }
        if (fileTypeName == 'All Files') {
            Ext.Msg.alert(_('Tips'), _('请选择文件类型'));
        }
        console.log(isDefault);
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/policy/recordEditing',
            params: {
                "policyName": policyName,
                "fileTypeName": fileTypeName,
                "policyPeriod": policyPeriod,
                "policyDate": policyDate,
                "policyTime": policyTime,
                "policyStatus": policyStatus,
                "isDefault": isDefault,
                "policyId": policyId,
                "fileServer": Ext.encode({
                    "ftpIp": ftpIp,
                    "ftpPort": ftpPort,
                    "ftpUsername": ftpUsername,
                    "ftpPassword": ftpPassword,
                    "fileTransferProtocol": fileTransferProtocol,
                })
            },
            disableCaching: false,
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Operation Success!'));
                    grid.store.reload();
                    me.getView().setActiveItem(0);
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });

    },
    //删除策略
    onDelete: function () {
        var me = this,
            grid = me.getPolicyGrid(),
            records = grid.getSelectionModel().getSelection(),
            ids = [];
        for (var i in records) {
            ids.push(records[i].get('policyId'));
        }
        console.log(ids);
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/policy/recordDeletion',
            method: 'GET', //这里也可以是get方法，后台接收根据程序语言的不同而不同
            params: {
                "policyIds": ids.join(',')
            }, //传递的参数，这里的参数一般是根据元素id来获取值，因为你没有创建单表
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Delete Success'));
                    grid.store.reload();
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });
    },
    //导出策略列表
    onPolicyExport: function (btn) {
        var me = this,
            grid = me.getPolicyGrid(),
            btnValue = btn.getValue(),
            records = grid.getSelectionModel().getSelection(),
            currentPage = grid.getStore().currentPage,
            pageSize = grid.getStore().pageSize,
            policyIds = [];
        for (var i in records) {
            policyIds.push(records[i].get('policyId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/ccd/configcenter/backup/policy/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText),
                        causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/ccd/configcenter/backup/policy/export/download?filename=' + respText.filename;
                        btn.reset();
                    } else {
                        me.failureMessage(causeid);
                        btn.reset();
                    }
                },
                failure: function (resp, opts) {
                    Ext.Msg.alert(_('Tips'), _('Request Error'));
                }
            });
        }
        if (btnValue === 0) {
            var arguments = {
                'policyIds': ''
            };
            ajax(arguments);
        }
        if (btnValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                policyIds = [];
            for (var i in records) {
                policyIds.push(records[i].get('policyId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'policyIds': policyIds.join(','),

            }

            ajax(arguments);
        }
        if (btnValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert('提示', '请选择至少一条数据');
                btn.reset();
            } else {
                var arguments = {
                    'policyIds': policyIds.join(',')
                };
                ajax(arguments);
            }
        }
    },
    //周期日期二级联动
    showDate: function (combo, record, index) {
        form = combo.findParentByType('form');
        var cycle = combo;
        var date = form.getForm().findField('policyDate')
        date.store.proxy.extraParams = {
            'id': cycle.getValue()
        };
        date.store.load();
        date.store.on("load", function () {

            var id = date.store.getAt(0).data.id;
            var name = date.store.getAt(0).data.name;
            // if (cycle.getValue() == 1 || cycle.getValue() == 2) {

            // } else {
            //     // date.hide();
            // }
            // date.show();
            // console.log(id);
            // console.log(name);
            date.setRawValue(name);
            date.setValue(id);
        });
    },
    firstSelect: function (combo) {
        combo.store.load({
            callback: function () {
                var firstValue = combo.store.getAt(0).data.id;
                combo.setValue(firstValue);
            }
        });
        // combo.store.on('beforeload', function (store, options) {
        //     alert(111);
        //     var new_params = { 's': 1 };
        //     Ext.apply(store.proxy.extraParams, new_params);
        // });
    },
});