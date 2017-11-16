Ext.define('Admin.view.configcenter.controller.dataBackupMessionTab2Controller', {
    extend: 'Admin.view.configcenter.controller.dataBackupMessionTab1Controller',
    alias: 'controller.dataBackupMessionTab2Controller',
    requires: [
        'Admin.view.configcenter.view.dataBackup.mession.veneer.createVeneerBackupTaskWindow',
        'Admin.view.configcenter.view.dataBackup.mession.veneer.dataBackupChooseVeneerWindow',
    ],
    neSelect: function (grid, record, index, eopts) {
        var me = this,
            selectedNe = me.getSelectedNe(),
            recordIds = [],
            grid = me.getNeGrid(),
            resourcestate = record.get('isexisting');
        if (resourcestate == '离位') {
            Ext.Msg.alert(_('Tips'), _('Can not select offline device'));
            console.log(grid);
            grid.getSelectionModel().deselect(record, true);
            return;
        }
        for (var i in selectedNe) {
            recordIds.push(selectedNe[i].data.cardId);
        }
        if (!Ext.Array.contains(recordIds, record.data.cardId)) {
            selectedNe.push(record);
        }
    },
    neDeselect: function (grid, record, index, eopts) {
        var me = this,
            selectedNe = me.getSelectedNe();
        for (var i in selectedNe) {
            if (selectedNe[i].data.cardId == record.data.cardId) {
                Ext.Array.remove(selectedNe, selectedNe[i]);
            }
        }
    },
    renderNeGrid: function (grid, eOpts) {
        var me = this,

            checkbox = me.getView().down('#showSelectedNe'),
            bar = grid.down('pagingtoolbar');
        grid.store.addListener('load', function (store, records, successful, operation, eOpts) {
            var selectedNe = me.getSelectedNe(),
                data = [],
                recordIds = [];
            if (selectedNe.length) {
                for (var i in selectedNe) {
                    recordIds.push(selectedNe[i].data.cardId);
                }
                store.each(function (record) {
                    if (Ext.Array.contains(recordIds, record.data.cardId))
                        data.push(record);
                });
                grid.getSelectionModel().select(data, true);
            }
            if (checkbox.getValue()) {
                store.removeAll();
                store.add(selectedNe);
                grid.getSelectionModel().select(selectedNe, true);
            } else {
                bar.show();
            }

        });
    },
    onImportSelectedNe: function (btn) {
        var me = this,
            selectedNe = me.getSelectedNe(),
            form = me.getCreateTaskForm(),
            cardStorage = form.down('#cardsStorage'),
            neStorage = form.down('#nesStorage'),
            storageName = form.getForm().findField('selectedNe'),
            neIds = [],
            neNames = [],
            cardIds = [];
        console.log(selectedNe);
        for (var i in selectedNe) {
            cardIds.push(selectedNe[i].data.cardId);
            neIds.push(selectedNe[i].data.neId);
            neNames.push("板卡名称:" + selectedNe[i].data.cardName);
        }
        if (neIds.length) {
            cardStorage.setValue(cardIds);
            neStorage.setValue(neIds);
            storageName.setValue(neNames.join('\n'));
            console.log(neIds);
            console.log(cardIds);
            me.onBack(btn);
        } else {
            Ext.MessageBox.alert(
                '提示',
                '您添加的内容为空,无法导入,请选择网元后点击添加按钮!'
            );
        }
    },
    // //新建单板备份任务
    // onCreateVeneerTask: function () {
    //     this.getView().setActiveItem(1);
    //     var form = this.getView().down('#createVeneerBackupTaskForm');
    //     var container = this.getView().down('#showContainer'),
    //         username = form.getForm().findField('ftpUsername'),
    //         password = form.getForm().findField('ftpPassword');
    //     this.setResetRecord(form);
    //     username.show();
    //     password.show();
    // },
    //新建单板备份任务窗口form提交
    onCreateTaskSubmit: function (btn) {
        var me = this,
            form = btn.findParentByType('form'),
            grid = me.getTaskGrid(),
            neGrid = me.getNeGrid(),
            policyGrid = me.getPolicyGrid(),
            value = form.getValues(),
            taskName = value.taskName,
            fileTypeName = value.fileTypeName,
            policyId = value.policyId,
            cardIds = value.cardIds.replace(/=/g, '*'),
            neIds = value.neIds,
            isUsePolicy = value.isUsePolicy,
            fileTransferProtocol = value.fileTransferProtocol,
            ftpIp = value.ftpIp,
            ftpPort = value.ftpPort,
            ftpUsername = value.ftpUsername,
            ftpPassword = value.ftpPassword,
            resTypeId = value.resTypeId;
        if (fileTypeName == 'All Files') {

            Ext.Msg.alert(_('Tips'), _('请选择文件类型'));
            return;
        }
        // s = '/ne=1/card=1.1,/ne=2/card=1.2' ,
        //      console.log(s.replace(/=/g, '*'));
        Ext.Ajax.request({
            // url: '/cb/configcenter/Backup/Policy/newRecord',
            url: '/ccd/configcenter/backup/task/newCardTask',
            // params: {
            //     json: Ext.encode(obj)
            // },
            params: {
                "resTypeId": resTypeId,
                "taskName": taskName,
                "fileTypeName": fileTypeName,
                "policyId": policyId,
                "cardIds": cardIds,
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

    //任务grid删除
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
            url: '/ccd/configcenter/backup/task/cardTaskDeletion',
            method: 'get', //这里也可以是get方法，后台接收根据程序语言的不同而不同
            params: {
                "taskIds": taskIds.join(','),
                "policyIds": policyIds.join(',')
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
                url: '/ccd/configcenter/backup/task/card/export',
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
                Ext.Msg.alert('提示', '请选择至少一条数据');
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
            cardIds = [],
            taskId = record[0].get('taskId');
        for (var i in records) {
            cardIds.push(records[i].get('cardId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/ccd/configcenter/backup/task2card/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText),
                        causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/ccd/configcenter/backup/task2card/export/download?filename=' + respText.filename;
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
                'taskId': taskId,
                'cardIds': ''
            };
            ajax(arguments);
        }
        if (btnValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                cardIds = [];
            for (var i in records) {
                cardIds.push(records[i].get('cardId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'cardIds': cardIds.join(','),
                'taskId': taskId,
            }

            ajax(arguments);
        }
        if (btnValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert('提示', '请选择至少一条数据');
                btn.reset();
            } else {
                var arguments = {
                    'taskId': taskId,
                    'cardIds': cardIds.join(',')
                };
                ajax(arguments);
            }
        }
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
            cardIds = [];
        for (var i in neRecords) {
            cardIds.push(neRecords[i].get('cardId'));
        }
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/task2card/taskDeletion',
            method: 'get',
            params: {
                "policyId": policyId,
                'taskId': taskId,
                "cardIdstr": cardIds.join(',')
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
    getTaskTimer: function (me) {

        var task = {
            run: function () {
                console.log('备份单板任务正在运行');
                if (!me.getView()) {
                    Ext.TaskManager.stop(task);
                    return;
                }
                grid = me.getTaskGrid(),
                    store = grid.store,
                    records = store.getRange(0, store.getCount()),
                    taskIds = [];

                for (var i in records) {
                    taskIds.push(records[i].get('taskId'))
                }
                if (!store.getCount()) {
                    Ext.TaskManager.stop(task);
                    return;
                }
                console.log(taskIds.join(','));
                Ext.Ajax.request({
                    //url: '/confcenter/configcenter/backup/task/cardTaskInfos?limit=' + 100 + '&page=' + 1,
                    url: '/ccd/configcenter/backup/task/cardPoll?taskIds=' + taskIds,
                    success: function (response, opts) {
                        var recs = Ext.decode(response.responseText);
                        var progress = me.getViewModel().get('progress');
                        //var startBtn = me.getViewModel().get('startBtn');
                        //改变进度条的ui
                        for (var i in records) {
                            var record = records[i];
                            var dataIndex = store.indexOf(record);
                            //获取后台返回的进度和执行状态
                            var taskProcess = recs.BackupTasks[dataIndex].taskProcess;
                            var execStatus = recs.BackupTasks[dataIndex].execStatus;
                            var widget = progress[i];
                            // var widgetStartBtn = startBtn[i];
                            //更新等待运行和正在运行状态下的记录
                            if (record.get('execStatus') == 1 || record.get('execStatus') == 2) {
                                record.set('taskProcess', taskProcess);
                                record.set('execStatus', execStatus);
                            }
                            //获取每个btn和进度条对应的记录
                            var rec = widget.getWidgetRecord();
                            //判断进度条对应的记录,以更改两者样式
                            if (rec.get('execStatus') == 3 || rec.get('execStatus') == 4 || rec.get('execStatus') == 5) {
                                widget.setUi('progress1');
                                // widgetStartBtn.setIconCls('x-fa fa-check');
                                // widgetStartBtn.setText('完成');
                                // widgetStartBtn.setDisabled(true);
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
    // taskPolling: function () {
    //     var me = this,
    //         taskGrid = me.getTaskGrid(),
    //         task = me.getTaskTimer(me);
    //     //console.log(task)
    //     taskGrid.activeId = true;
    //     var obj = me.getView().up('backupMession');
    //     var pollingTask = obj.lookupController().getViewModel().get('task');
    //     if (pollingTask == 'task') {
    //         var pollingTask = Ext.TaskManager.start(task);
    //         //console.log(pollingTask);
    //         obj.lookupController().getViewModel().set('task', pollingTask);
    //         // console.log(obj.lookupController().getViewModel().get('task'));
    //     }
    // },
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
                    var cardIds = [];
                    console.log('备份..单板..正在进行');
                    for (var i in records) {
                        cardIds.push(records[i].get('cardId'))
                    }
                    if (!cardIds.length) {
                        console.log('备份..单板..即将停止');
                        Ext.TaskManager.stop(task);
                        return;
                    }
                    Ext.Ajax.request({
                        url: '/ccd/configcenter/backup/task2card/poll?taskId=' + taskId + '&cardIds=' + cardIds,
                        success: function (response, opts) {
                            // index = index + 0.01;

                            var recs = Ext.decode(response.responseText);
                            console.log(recs.BackupOperationCardVo[0]);
                            for (var i in records) {
                                var record = records[i];
                                var dataIndex = store.indexOf(record);
                                var operType = recs.BackupOperationCardVo[dataIndex].operType;
                                var operStatus = recs.BackupOperationCardVo[dataIndex].operStatus;
                                var softVersion = recs.BackupOperationCardVo[dataIndex].softVersion;
                                var operDesc = recs.BackupOperationCardVo[dataIndex].operDesc;
                                var operTime = recs.BackupOperationCardVo[dataIndex].operTime;
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
                            // if (btn.flag == 1) {
                            //     Ext.TaskManager.stop(task);
                            //     btn.flag = 0;
                            // }
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
});