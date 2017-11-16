Ext.define('Admin.view.configcenter.controller.equipmentUpdateMessionTab2Controller', {
    //extend: 'Admin.view.configcenter.model.grid_toolBar.CRUD',
    extend: 'Admin.view.configcenter.controller.equipmentUpdateMessionTab1Controller',
    alias: 'controller.equipmentUpdateMessionTab2Controller',
    requires: [
        'Admin.view.configcenter.view.equipmentUpdate.mession.veneer.createNEupgradeTaskWindow',
        'Admin.view.configcenter.view.equipmentUpdate.mession.veneer.equipmentUpdateChooseNEwindow',
        'Admin.view.configcenter.view.equipmentUpdate.mession.veneer.equipmentUpdateChooseYesPopWindow',
        'Admin.view.configcenter.view.equipmentUpdate.mession.veneer.cardSoftwareList',
        'Admin.view.configcenter.view.equipmentUpdate.mession.veneer.relatedCard',
    ],
    //任务grid删除
    onTaskDelete: function () {
        var me = this,
            grid = me.getTaskGrid(),
            records = grid.getSelectionModel().getSelection(),
            taskIds = [];
        for (var i in records) {
            records[i]
            taskIds.push(records[i].get('taskId'));
        }
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/card/task/delete',
            method: 'GET',
            params: {
                "ids": taskIds.join(',')
            },
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
    //任务grid导出
    onTaskExport: function (btn) {
        var me = this,
            grid = me.getTaskGrid(),
            btnValue = btn.getValue(),
            records = grid.getSelectionModel().getSelection(),
            currentPage = grid.getStore().currentPage,
            pageSize = grid.getStore().pageSize,
            ids = [];
        for (var i in records) {
            ids.push(records[i].get('taskId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/confcenter/configcenter/upgrade/card/task/export',
                method: 'get', //这里也可以是get方法，后台接收根据程序语言的不同而不同
                params: arguments, //传递的参数，这里的参数一般是根据元素id来获取值，因为你没有创建单表
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText);
                    console.log(respText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/confcenter/configcenter/upgrade/card/task/download?filename=' + respText.filename;
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
                'ids': ''
            };
            console.log(0);
            ajax(arguments);
        }
        if (btnValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                ids = [];
            for (var i in records) {
                ids.push(records[i].get('taskId'));
            }
            var arguments = {
                'ids': ids.join(',')
            }
            ajax(arguments);
        }
        if (btnValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert(_('Tips'), _('Please select at least one data'));
                btn.reset();
            } else {
                console.log('ids:' + ids);
                var arguments = {
                    'ids': ids.join(',')
                };
                ajax(arguments);
            }
        }

    },
    //任务grid开始
    onTaskStart: function (btn) {
        var record = btn.getWidgetRecord();
        var taskId = record.get('taskId'),
            grid = btn.findParentByType('PagedGrid');
        var store = grid.store;
        var me = this;

        var task_status = this.getViewModel().get('task_status');
        if (task_status == 1) {
            btn.setIconCls('x-fa fa-refresh fa-spin');
            btn.setText('运行中');
            btn.setDisabled(true);
        }
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/card/task/start',
            method: 'GET',
            params: {
                "taskId": taskId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    // Ext.Msg.alert(_('Tips'), _('Start Success'));
                    //grid.store.reload();
                } else {
                    me.failureMessage(causeid);
                }
                // form.reset();
                //me.getView().setActiveItem(0);
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });

    },
    //关联网元导出
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
                url: '/confcenter/configcenter/upgrade/task2ne/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText),
                        causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/confcenter/configcenter/upgrade/task2ne/export/download?filename=' + respText.filename;
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
                Ext.Msg.alert(_('Tips'), _('Please select at least one data'));
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
            selectedNe = me.getSelectedNe(),
            data = [],
            recordIds = [],
            checkbox = me.getView().down('#showSelectedNe'),
            bar = grid.down('pagingtoolbar');
        grid.store.addListener('load', function (store, records, successful, operation, eOpts) {
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
        var me = this;
        var selected = this.getViewModel().get('selectedNe');
        var storageId = this.getView().down('#NEstorage');
        var form = storageId.findParentByType('form');
        var storageName = form.getForm().findField('selectedNe');
        var neIds = [];
        var neNames = [];
        for (var i in selected) {
            neIds.push(selected[i].data.cardId);
            neNames.push("单板名称:" + selected[i].data.cardName);
        }
        if (neIds.length) {
            storageId.setValue(neIds);
            storageName.setValue(neNames.join('\n'));
            // Ext.MessageBox.alert(
            //     '提示',
            //     '添加成功!'
            // );
            me.onBack(btn);
        } else {
            Ext.MessageBox.alert(
                '提示',
                '您添加的内容为空,无法导入,请选择网元后点击添加按钮!'
            );
        }
    },
    //新建网元备份文件窗口form提交
    onCreateTaskSubmit: function () {
        var me = this,
            form = me.getCreateTaskForm(),
            grid = me.getTaskGrid();
        if (form.getForm().isValid()) {
            form.getForm().submit({
                url: '/confcenterU/configcenter/upgrade/card/task/create',
                waitTitle: '连接中',
                waitMsg: '传送数据...',
                success: function (form, action) {
                    var respText = Ext.util.JSON.decode(action.response.responseText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('New Task Create Success'));
                        form.reset();
                        grid.store.load({
                            callback: function () {
                                me.getView().setActiveItem(0);
                                me.taskPolling();
                            }
                        });
                    } else {
                        me.failureMessage(causeid);
                    }
                },
                failure: function (form, action) {
                    var respText = Ext.util.JSON.decode(action.response.responseText);
                    Ext.Msg.alert('Status', respText.ErrorMsg);
                    //form.getForm().reset()
                }
            });
        } else {
            Ext.MessageBox.alert(
                '填写错误',
                '请正确填写表单.'
            );
        }

    },
    //任务轮询
    //@override
    getTaskTimer: function (me) {

        var task = {
            run: function () {
                console.log('单板任务正在运行');
                // var lv1_activeId = me.getView().up('equipmentUpdateMession').activeId;
                // var lv2_activeId = me.getView().activeId;
                // var lv3_activeId = obj.activeId;
                // if (lv1_activeId == false || lv2_activeId == false || lv3_activeId == false) {
                //     Ext.TaskManager.stop(task);
                //     console.log('网元任务结束')
                // }
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
                // console.log(taskIds);
                // console.log(taskIds.length);
                Ext.Ajax.request({
                    url: '/confcenter/configcenter/upgrade/card/task/poll?taskIds=' + taskIds,
                    success: function (response, opts) {
                        var recs = Ext.decode(response.responseText);
                        var progress = me.getViewModel().get('progress');
                        var startBtn = me.getViewModel().get('startBtn');
                        //改变进度条的ui
                        for (var i in records) {
                            var record = records[i];
                            var dataIndex = store.indexOf(record);
                            //获取后台返回的进度和执行状态
                            console.log(dataIndex);
                            var taskProcess = recs.cardUpgradeTasks[dataIndex].taskProcess;
                            var execStatus = recs.cardUpgradeTasks[dataIndex].execStatus;
                            var endTime = recs.cardUpgradeTasks[dataIndex].endTime;
                            var widget = progress[i];
                            var widgetStartBtn = startBtn[i];
                            //更新等待运行和正在运行状态下的记录
                            if (record.get('execStatus') == 1 || record.get('execStatus') == 2) {
                                record.set('taskProcess', taskProcess);
                                record.set('execStatus', execStatus);
                            } else if (record.get('execStatus') == 3 || record.get('endTime') == false) {
                                record.set('endTime', endTime);
                                record.set('execStatus', execStatus);
                            } else if (record.get('execStatus') == 4) {
                                record.set('execStatus', execStatus);
                            }
                            //获取每个btn和进度条对应的记录
                            var rec = widget.getWidgetRecord();
                            //判断进度条对应的记录,以更改两者样式
                            if (rec.get('execStatus') == 3 || rec.get('execStatus') == 4 || rec.get('execStatus') == 5) {
                                widget.setUi('progress1');
                                widgetStartBtn.setIconCls('x-fa fa-check');
                                widgetStartBtn.setText('完成');
                                widgetStartBtn.setDisabled(true);
                            } else if (rec.get('execStatus') == 2) {
                                widgetStartBtn.setIconCls('x-fa fa-refresh fa-spin');
                                widgetStartBtn.setText('进行中');
                                widgetStartBtn.setDisabled(true);
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
        var obj = me.getView().up('equipmentUpdateMession');
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
                    var cardIds = [];
                    console.log('单板正在进行');
                    for (var i in records) {
                        cardIds.push(records[i].get('cardId'))
                    }
                    console.log(cardIds.length);
                    if (!cardIds.length) {
                        console.log('停止单板');
                        Ext.TaskManager.stop(task);
                        return;
                    }
                    Ext.Ajax.request({
                        url: '/confcenter/configcenter/upgrade/card/oper/poll?taskId=' + taskId + '&cardIds=' + cardIds,
                        success: function (response, opts) {
                            // index = index + 0.01;

                            var recs = Ext.decode(response.responseText);
                            console.log(store.indexOf(records[0]));
                            //var btn = grid.down('#closeNe');
                            console.log('hehda');
                            for (var i in records) {
                                var record = records[i];
                                var dataIndex = store.indexOf(record);
                                var operType = recs.cardOperations[dataIndex].operType;
                                var operStatus = recs.cardOperations[dataIndex].operStatus;
                                var softVersion = recs.cardOperations[dataIndex].softVersion;
                                var operDesc = recs.cardOperations[dataIndex].operDesc;
                                var operTime = recs.cardOperations[dataIndex].operTime;
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
        var obj = me.getView().up('equipmentUpdateMession');
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
    //移除
    onRemoveRelatedNe: function () {
        var me = this,
            taskGrid = me.getTaskGrid(),
            grid = me.getReletedNeGrid(),
            records = grid.getSelectionModel().getSelection(),
            neIds = [],
            taskId = grid.getSelectionModel().getSelection()[0].get('taskId');
        for (var i in records) {
            cardIds.push(records[i].get('cardId'));
        }
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/card/task/removeCard',
            method: 'GET',
            params: {
                "cardIds": cardIds.join(','),
                'taskId': taskId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Remove Success'));
                    grid.store.reload();
                } else {
                    me.failureMessage(causeid);
                }
                // form.reset();
                me.getView().setActiveItem(0);
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });
    },
    //激活
    onNeActive: function (btn) {

        var me = this,
            neGrid = me.getReletedNeGrid(),
            taskGrid = me.getTaskGrid(),
            taskRecord = taskGrid.getSelectionModel().getSelection(),
            // neRecord = neGrid.getSelectionModel().getSelection(),
            neRecord = btn.findParentByType('button').getWidgetRecord(),
            taskId = taskRecord[0].get('taskId'),
            cardId = neRecord.data.cardId;
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/card/oper/activate',
            method: 'get',
            params: {
                "cardId": cardId,
                'taskId': taskId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    //Ext.Msg.alert(_('Tips'), _('Activate Success'));
                    //grid.store.reload();
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });
    },
    //获取版本
    ongetVersion: function (btn) {
        var me = this,
            neGrid = me.getNeGrid(),
            record = btn.findParentByType('button').getWidgetRecord(),
            cardId = record.get('cardId');
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/card/oper/getVersion',
            method: 'get',
            params: {
                "cardId": cardId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    // Ext.Msg.alert(_('Tips'), _('Success'));
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
    //软件浏览
    onSoftScan: function (btn) {
        var me = this,
            neGrid = me.getNeGrid(),
            // softGrid = this.getView().down('#softGrid'),
            record = btn.findParentByType('button').getWidgetRecord(),
            cardId = record.get('cardId');
        win = new Admin.view.configcenter.view.equipmentUpdate.mession.veneer.cardSoftwareList();
        win.show();
        this.getView().add(win);
        var softGrid = this.getView().down('#softScan');
        console.log(softGrid);

        softGrid.store.proxy.extraParams = {
            'cardId': cardId
        };
        softGrid.store.load();
    },

});