Ext.define('Admin.view.configcenter.controller.dataBackupMessionTab1Controller', {
    extend: 'Admin.view.configcenter.controller.equipmentUpdateMessionTab1Controller',
    alias: 'controller.dataBackupMessionTab1Controller',
    requires: [
        'Admin.view.configcenter.view.dataBackup.mession.equipment.dataBackupChooseNEwindow',
        'Admin.view.configcenter.view.dataBackup.mession.equipment.dataBackupChooseStrategyWindow',
        'Admin.view.configcenter.view.dataBackup.mession.equipment.createNEbackupTaskWindow',

    ],
    getPolicyGrid: function () {
        var me = this,
            grid = me.getView().down('#policyGrid');
        return grid;
    },
    getSelectedPolicy: function () {
        var me = this,
            selectedPolicy = me.getViewModel().get('selectedPolicy');
        return selectedPolicy;

    },
    resetModelPolicy: function () {
        this.getViewModel().set('selectedPolicy', []);
    },
    //删除任务
    //@override
    onTaskDelete: function () {
        var me = this,
            grid = me.getTaskGrid(),
            records = grid.getSelectionModel().getSelection(),
            taskIds = [],
            policyIds = [];
        for (var i in records) {
            taskIds.push(records[i].get('taskId'));
            policyIds.push(records[i].get('policyId'));
        }
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/task/neTaskDeletion',
            method: 'GET',
            params: {
                "taskIds": taskIds.join(','),
                "policyIds": policyIds.join(',')
            },
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
    //导出任务列表
    //@override
    onTaskExport: function (btn) {
        var me = this,
            grid = me.getTaskGrid(),
            btnValue = btn.getValue(),
            records = grid.getSelectionModel().getSelection(),
            currentPage = grid.getStore().currentPage,
            pageSize = grid.getStore().pageSize,
            taskIds = [];
        for (var i in records) {
            taskIds.push(records[i].get('taskId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/ccd/configcenter/backup/task/ne/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText),
                        causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/ccd/configcenter/backup/task/export/download?filename=' + respText.filename;
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
                'taskIds': ''
            };
            ajax(arguments);
        }
        if (btnValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                taskIds = [];
            for (var i in records) {
                taskIds.push(records[i].get('taskId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'taskIds': taskIds.join(',')
            }
            ajax(arguments);
            console.log(arguments);
        }
        if (btnValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert(_('Tips'), _('Please select at least one data'));
                btn.reset();
            } else {
                var arguments = {
                    'taskIds': taskIds.join(',')
                };
                ajax(arguments);
            }
        }
    },
    onRelatedNeExport: function (btn) {
        var me = this,
            grid = me.getReletedNeGrid(),
            taskGrid = me.getTaskGrid(),
            record = taskGrid.getSelectionModel().getSelection(),
            btnValue = btn.getValue(),
            records = grid.getSelectionModel().getSelection(),
            currentPage = grid.getStore().currentPage,
            pageSize = grid.getStore().pageSize,
            neIds = [],
            taskId = record[0].get('taskId');
        for (var i in records) {
            neIds.push(records[i].get('neId'));
        }
        console.log(neIds);
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/ccd/configcenter/backup/task2ne/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText),
                        causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/ccd/configcenter/backup/task2ne/export/download?filename=' + respText.filename;
                        btn.reset();
                    } else {
                        me.failureMessage(causeid);
                        btn.reset();
                    }
                },
                failure: function (resp, opts) {
                    Ext.Msg.alert(_('Tips'), _('Request Error'));
                    btn.reset();
                }
            });
        }
        if (btnValue === 0) {
            var arguments = {
                'taskId': taskId,
                'neIds': ''
            };
            ajax(arguments);
        }
        if (btnValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                neIds = [];
            for (var i in records) {
                neIds.push(records[i].get('neId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'neIds': neIds.join(','),
                'taskId': taskId,
            }

            ajax(arguments);
        }
        if (btnValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert(_('Tips'), _('Please select at least one data'));
                btn.reset();
            } else {
                var arguments = {
                    'taskId': taskId,
                    'neIds': neIds.join(',')
                };
                ajax(arguments);
            }
        }
    },
    onTaskStart: function (btn) {
        console.log(btn.id);
        console.log(btn.iconCls);
    },
    //从策略库选择
    chooseFromPolicy: function () {
        var me = this,
            grid = me.getPolicyGrid(),
            form = grid.down('form');
        me.setResetRecord(form);
        me.getView().setActiveItem(2);
    },
    //选择策略库
    //@override
    onChooseSelectChg: function (btn) {
        var me = this,
            form = me.getCreateTaskForm(),
            grid = me.getPolicyGrid(),
            container0 = form.down('#container0'),
            container1 = form.down('#container1'),
            fields = container1.query(),
            policyStorage = form.down('#policyStorage'),
            btnValue = btn.getValue();
        this.setResetRecord(grid.down('form'));
        // console.log(fields.getXType());
        if (btnValue) {
            container0.show();
            container1.hide();
            // container2.hide();
            for (var i in fields) {
                var field = fields[i];
                console.log(field.getXType());
                if (field.getXType() == 'fieldcontainer' || field.getXType() == "radiogroup" || field.getXType() == "panel" || field.getXType() == "boundlist") {
                    continue;
                } else {
                    field.reset();
                }
            }
            // container1.query()[0].reset();
        } else {
            policyStorage.reset();
            container0.query()[2].reset()
            container0.hide();
            container1.show();
            this.getViewModel().set('selected', []);
            grid.store.reload();
        }
    },
    //显示已选文件
    onShowChoosedPolicy: function (opt) {
        var me = this,
            selectedPolicy = me.getSelectedPolicy(),
            grid = me.getPolicyGrid(),
            store = grid.getStore(),
            pagingtoolbar = grid.down('pagingtoolbar');
        if (opt.getValue()) {
            store.removeAll();
            store.add(selectedPolicy);
            grid.getSelectionModel().select(selectedPolicy, true);
            pagingtoolbar.hide();
        } else {
            store.reload();
        }

    },
    //选中一行文件触发该事件
    policySelect: function (grid, record, index, eopts) {
        var me = this,
            selectedPolicy = me.getSelectedPolicy(),
            recordIds = [];
        for (var i in selectedPolicy) {
            recordIds.push(selectedPolicy[i].data.policyId);
        }
        if (!Ext.Array.contains(recordIds, record.data.policyId)) {
            selectedPolicy.push(record);
        }
        var grid = me.getPolicyGrid();
        var chooseBtn = grid.down('#theImport');
        var selCnt = selectedPolicy.length;
        console.log(selCnt);
        if (selCnt == 1) {
            chooseBtn.setDisabled(false);
        } else {
            chooseBtn.setDisabled(true);
        }
        //console.log(me.getSelectedPolicy());
    },
    //取消选中一行文件触发该事件
    policyDeselect: function (grid, record, index, eopts) {
        var me = this,
            selectedPolicy = me.getSelectedPolicy();
        for (var i in selectedPolicy) {
            if (selectedPolicy[i].data.policyId == record.data.policyId) {
                Ext.Array.remove(selectedPolicy, selectedPolicy[i]);
            }
        }
        console.log(me.getSelectedPolicy());
    },
    //列表渲染时添加store的load事件监听
    renderGrid: function (grid, eOpts) {
        var me = this,
            checkbox = me.getView().down('#showSelectedPolicy'),
            bar = grid.down('pagingtoolbar');
        grid.store.addListener('load', function (store, records, successful, operation, eOpts) {
            console.log('###########111');
            var data = [],
                recordIds = [],
                selectedPolicy = me.getSelectedPolicy();
            if (selectedPolicy.length) {
                for (var i in selectedPolicy) {
                    recordIds.push(selectedPolicy[i].data.policyId);
                }
                store.each(function (record) {
                    if (Ext.Array.contains(recordIds, record.data.policyId))
                        data.push(record);
                });
                //将指定数据data标记为已选中,当store刷新时,依然可以让这些数据显示为已选中
                console.log(recordIds);
                grid.getSelectionModel().select(data, true);
            }
            if (checkbox.getValue()) {
                store.removeAll();
                store.add(selectedPolicy);
                grid.getSelectionModel().select(selectedPolicy, true);
            } else {
                bar.show();
            }
        });
    },
    onPolicyGridClick: function (me, record) {
        var grid = this.getPolicyGrid(),
            selCnt = this.getSelectedPolicy().length,
            chooseBtn = grid.down('#theImport');
        console.log(selCnt);
        if (selCnt == 1) {
            chooseBtn.setDisabled(false);
        } else {
            chooseBtn.setDisabled(true);
        }
    },
    //导入已选策略
    onImportSelectedPolicy: function (btn) {
        var me = this,
            form = me.getCreateTaskForm(),
            selectedPolicy = me.getSelectedPolicy(),
            policyId = [],
            policyName = [],
            storageId = form.down('#policyStorage'),
            storageName = form.getForm().findField('selectedPolicy');
        for (var i in selectedPolicy) {
            policyId.push(selectedPolicy[i].data.policyId);
            policyName.push('策略名称:' + selectedPolicy[i].data.policyName);
        }
        if (policyId.length) {
            storageId.setValue(policyId);
            storageName.setValue(policyName.join('\n'));
            me.onBack(btn);
        }

    },
    //新建网元备份任务窗口form提交
    onCreateTaskSubmit: function (btn) {
        var me = this,
            form = btn.findParentByType('form'),
            grid = me.getTaskGrid(),
            neGrid = me.getNeGrid(),
            policyGrid = me.getPolicyGrid(),
            value = form.getValues(),
            taskName = value.taskName,
            fileTypeName = value.fileTypeName,
            policyId = value.policyIds,
            neIds = value.neIds,
            isUsePolicy = value.isUsePolicy,
            fileTransferProtocol = value.fileTransferProtocol,
            ftpIp = value.ftpIp,
            ftpPort = value.ftpPort,
            ftpUsername = value.ftpUsername,
            ftpPassword = value.ftpPassword,
            resTypeId = value.resTypeId;
        console.log(isUsePolicy);
        if (!form.getForm().isValid()) {
            Ext.Msg.alert(_('Tips'), _('请正确填写表单!'));
            return;
        }
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/task/newNeTask',
            params: {
                "resTypeId": resTypeId,
                "taskName": taskName,
                "fileTypeName": fileTypeName,
                "policyId": policyId,
                "neIds": neIds,
                "fileTransferProtocol": fileTransferProtocol,
                "isUsePolicy": isUsePolicy,
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
                console.log(respText);
                if (causeid == 14000) {
                    form.reset();
                    grid.store.load({
                        callback: function () {
                            me.getView().setActiveItem(0);
                            console.log("####@@@");
                            me.taskPolling();
                        }
                    });
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });

    },
    //删除任务关联网元
    //@override
    onRemoveRelatedNe: function () {
        var me = this,
            neGrid = me.getReletedNeGrid(),
            neRecords = neGrid.getSelectionModel().getSelection(),
            taskGrid = me.getTaskGrid(),
            records = taskGrid.getSelectionModel().getSelection(),
            taskId = records[0].get('taskId'),
            policyId = records[0].get('policyId'),
            neIds = [];
        for (var i in neRecords) {
            neIds.push(neRecords[i].get('neId'));
        }
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/task2ne/taskDeletion',
            method: 'get',
            params: {
                "policyId": policyId,
                'taskId': taskId,
                "neIdstr": neIds.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Remove Success'));
                    neGrid.store.reload();
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });
    },
    //单击messionGrid显示NEgrid
    onMessionRowclick: function (grid, selection, eOpts) {
        var tab1MainMessionGrid = this.getView().down('#tab1MainMessionGrid'),
            tab1MainNEgrid = this.getView().down('#tab1MainNEgrid'),
            choose = tab1MainMessionGrid.getSelectionModel().getSelection();

        //动态显示grid的标题名称
        if (choose.length > 1) {
            Ext.MessageBox.alert(
                '提示',
                '请勿选择多行数据进行更新'
            );
            return;
        }
        var taskId = choose[0].get('taskId'),
            messionName = choose[0].get('taskName');
        tab1MainNEgrid.store.proxy.extraParams = {
            'taskId': taskId
        };
        tab1MainNEgrid.setTitle('任务--' + messionName + '--所关联的网元查询结果');
        tab1MainNEgrid.store.reload();
        this.getView().down('#mainView').setActiveItem(1)



    },
    //关闭任务关联网元的列表
    closeNeGrid: function () {
        this.getView().setActiveItem(0);
    },
    getTaskTimer: function (me) {

        var task = {
            run: function () {
                console.log('备份网元任务正在运行');
                if (!me.getView()) {
                    Ext.TaskManager.stop(task);
                    return;
                }
                var grid = me.getTaskGrid(),
                    store = grid.store,
                    records = store.getRange(0, store.getCount()),
                    taskIds = [];
                console.log(store);
                console.log(store.getCount());
                if (!store.getCount()) {
                    Ext.TaskManager.stop(task);
                    return;
                }
                for (var i in records) {
                    taskIds.push(records[i].get('taskId'))
                }

                console.log(taskIds.join(','));
                Ext.Ajax.request({
                    url: '/ccd/configcenter/backup/task/nePoll?taskIds=' + taskIds,
                    //url: '/ccd/configcenter/backup/task/nePoll?limit=' + 100 + '&page=' + 1,
                    success: function (response, opts) {
                        var recs = Ext.decode(response.responseText);
                        console.log(recs);
                        var progress = me.getViewModel().get('progress');
                        //var startBtn = me.getViewModel().get('startBtn');
                        //改变进度条的ui
                        for (var i in records) {
                            var record = records[i];
                            var dataIndex = store.indexOf(record);
                            //  console.log(dataIndex);
                            //  console.log(recs.BackupTasks[dataIndex]);
                            //获取后台返回的进度和执行状态
                            var taskProcess = recs.BackupTasks[dataIndex].taskProcess;
                            var execStatus = recs.BackupTasks[dataIndex].execStatus;
                            var endTime = recs.BackupTasks[dataIndex].endTime;
                            var startTime = recs.BackupTasks[dataIndex].startTime;
                            var widget = progress[i];
                            // var widgetStartBtn = startBtn[i];
                            //更新等待运行和正在运行状态下的记录
                            if (record.get('execStatus') == 1 || record.get('execStatus') == 2) {
                                record.set('taskProcess', taskProcess);
                                record.set('execStatus', execStatus);
                            } else if (record.get('execStatus') == 3 || record.get('endTime') == false) {
                                record.set('endTime', endTime);
                                record.set('startTime', startTime);
                                record.set('execStatus', execStatus);
                            } else if (record.get('execStatus') == 4) {
                                record.set('execStatus', execStatus);
                            }
                            //获取每个btn和进度条对应的记录
                            var rec = widget.getWidgetRecord();
                            //判断进度条对应的记录,以更改两者样式
                            if (rec.get('execStatus') == 3 || rec.get('execStatus') == 4 || rec.get('execStatus') == 5) {
                                widget.setUi('progress1');
                                // widgetStartBtn.setIconCls('x-fa fa-play');
                                // widgetStartBtn.setText('开始');
                                // widgetStartBtn.setDisabled(false);
                            } else if (rec.get('execStatus') == 2) {
                                // widgetStartBtn.setIconCls('x-fa fa-refresh fa-spin');
                                // widgetStartBtn.setText('进行中');
                                // widgetStartBtn.setDisabled(true);
                            }
                            if (record.dirty) {
                                record.dirty = false;
                                record.commit();
                            }
                        }
                    }
                });

            },
            interval: 1000 // 1 second
        };
        return task;
    },
    taskPolling: function () {
        var me = this,
            taskGrid = me.getTaskGrid(),
            task = me.getTaskTimer(me);
        taskGrid.activeId = true;
        var obj = me.getView().up('backupMession');
        var pollingTask = obj.lookupController().getViewModel().get('task');
        if (pollingTask == 'task') {
            var pollingTask = Ext.TaskManager.start(task);
            obj.lookupController().getViewModel().set('task', pollingTask);
        } else {
            Ext.TaskManager.start(pollingTask);
        }


    },
    //网元轮询
    nePolling: function () {
        //  console.log('$@@$$@$@$@$@$');
        var me = this,
            grid = me.getReletedNeGrid(),
            taskGrid = me.getTaskGrid(),
            taskId,
            task = {
                run: function () {
                    if (!me.getView()) {
                        Ext.TaskManager.stop(task);
                        return;
                    }
                    taskId = taskGrid.getSelectionModel().getSelection()[0].get('taskId');
                    var store = grid.store;
                    var records = store.getRange(0, store.getCount());
                    var neIds = [];
                    console.log('备份..网元..正在进行');
                    for (var i in records) {
                        neIds.push(records[i].get('neId'))
                    }
                    if (!neIds.length) {
                        console.log('备份..网元..即将停止');
                        Ext.TaskManager.stop(task);
                        return;
                    }
                    Ext.Ajax.request({
                        url: '/ccd/configcenter/backup/task2ne/poll?taskId=' + taskId + '&neIds=' + neIds,
                        success: function (response, opts) {
                            // index = index + 0.01;
                            var recs = Ext.decode(response.responseText);
                            console.log(recs);
                            for (var i in records) {
                                var record = records[i];
                                var dataIndex = store.indexOf(record);
                                var operType = recs.BackupOperationNeVo[dataIndex].operType;
                                var operStatus = recs.BackupOperationNeVo[dataIndex].operStatus;
                                var softVersion = recs.BackupOperationNeVo[dataIndex].softVersion;
                                var operDesc = recs.BackupOperationNeVo[dataIndex].operDesc;
                                var operTime = recs.BackupOperationNeVo[dataIndex].operTime;
                                record.set('operType', operType);
                                record.set('operStatus', operStatus);
                                record.set('softVersion', softVersion);
                                record.set('operDesc', operDesc);
                                record.set('operTime', operTime);
                                if (record.dirty) {
                                    record.dirty = false;
                                    record.commit();
                                }
                            }
                        }
                    });
                },
                interval: 1000 // 1 second
            }
        //Ext.TaskManager.start(task);
        var obj = me.getView().up('backupMession');
        var pollingTask = obj.lookupController().getViewModel().get('task');
        // var pollingTask = me.getViewModel().get('task');
        console.log(pollingTask);
        if (pollingTask == 'task') {
            var pollingTask = Ext.TaskManager.start(task);
            console.log(pollingTask);
            obj.lookupController().getViewModel().set('task', pollingTask);
            console.log(obj.lookupController().getViewModel().get('task'));
        }
    },
    startBtn: function (col, widget, rec) {
        var execStatus = rec.data.execStatus;
        // if (execStatus == 5 || execStatus == 3 || execStatus == 4) {
        //     widget.setIconCls('x-fa fa-check');
        //     widget.setText('完成');
        //     // console.log(widget);
        //     widget.setDisabled(true);
        // } else if (execStatus == 1) {
        //     widget.setIconCls('x-fa fa-play');
        //     widget.setText('开始');
        //     widget.setDisabled(false);
        // } else if (execStatus == 2) {
        //     widget.setIconCls('x-fa fa-refresh fa-spin');
        //     widget.setText('进行中');
        //     widget.setDisabled(true);
        // }
        if (execStatus == 2) {
            widget.setIconCls('x-fa fa-refresh fa-spin');
            widget.setText('进行中');
            widget.setDisabled(true);
        } else {
            widget.setIconCls('x-fa fa-play');
            widget.setText('开始');
            widget.setDisabled(false);
        }
        var startBtn = this.getViewModel().get('startBtn');
        console.log(this.getViewModel())

        if (!Ext.Array.contains(startBtn, widget)) {
            startBtn.push(widget);
            // console.log(widget);
            // console.log('startBtn::::' + startBtn);
        }


    },
});