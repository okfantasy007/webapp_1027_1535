Ext.define('Admin.view.configcenter.controller.equipmentUpdateMessionTab1Controller', {
    extend: 'Admin.view.configcenter.model.grid_toolBar.CRUD',
    alias: 'controller.equipmentUpdateMessionTab1Controller',
    requires: [
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipment.createNEupgradeTaskWindow',
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentUpdateChooseYesPopWindow',
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentUpdateChooseNEwindow',
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentSoftwareList',
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipment.relatedNe',
    ],
    //获取任务列表对象
    getTaskGrid: function () {
        var me = this,
            grid = me.getView().down('#taskGrid');
        return grid;
    },
    //获取任务关联网元列表对象
    getReletedNeGrid: function () {
        grid = this.getView().down('#relatedNe');
        return grid;
    },
    //获取新建任务表单对象
    getCreateTaskForm: function () {
        var me = this,
            form = me.getView().down('#createTaskForm');
        return form;
    },
    //获取选择文件列表对象
    getSoftGrid: function () {
        var me = this,
            grid = me.getView().down('#softGrid');
        return grid;
    },
    //从viewModel中获取当前选中的文件records
    getSelectedSoft: function () {
        var me = this,
            selectedSoft = me.getViewModel().get('selectedSoft');
        return selectedSoft;
    },
    //从viewModel中获取当前选中的网元的records
    getSelectedNe: function () {
        var me = this,
            selectedSoft = me.getViewModel().get('selectedNe');
        return selectedSoft;
    },
    //获取选择网元列表对象
    getNeGrid: function () {
        var me = this,
            grid = me.getView().down('#neGrid');
        return grid;
    },
    //重置viewModel中已选文件records
    resetModelSoft: function () {
        this.getViewModel().set('selectedSoft', []);
    },
    //重置viewModel中已选网元records
    resetModelNe: function () {
        this.getViewModel().set('selectedNe', []);
    },
    //删除任务
    onTaskDelete: function () {
        var me = this,
            grid = me.getTaskGrid(),
            records = grid.getSelectionModel().getSelection(),
            taskIds = [];
        for (var i in records) {
            taskIds.push(records[i].get('taskId'));
        }
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/ne/task/delete',
            method: 'GET',
            params: {
                "ids": taskIds.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Delete Success'));
                    //删除完成后刷新表
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
    //分三种情况
    //1.全部导出
    //2.导出当前页
    //3.导出所选项
    onTaskExport: function (btn) {
        var me = this,
            grid = me.getTaskGrid(),
            //获取当前下拉选选项的值
            btnValue = btn.getValue(),
            records = grid.getSelectionModel().getSelection(),
            //当前页码
            currentPage = grid.getStore().currentPage,
            //当前页大小
            pageSize = grid.getStore().pageSize,
            //选中的任务表的taskId数组
            ids = [];
        for (var i in records) {
            ids.push(records[i].get('taskId'));
        }
        //创建ajax对象
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/confcenter/configcenter/upgrade/ne/task/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText),
                        causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        //二次请求,触发下载
                        //@params:filename
                        window.location.href = '/confcenter/configcenter/upgrade/ne/task/download?filename=' + respText.filename;
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
        //选择全部
        if (btnValue === 0) {
            var arguments = {
                'ids': ''
            };
            ajax(arguments);
        }
        //选择当前页
        if (btnValue === 1) {
            //获取store的全部数据records
            //即从第一条到当前页的最后一条的数据
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
        //导出所选择项
        if (btnValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert(_('Tips'), _('Please select at least one data'));
                btn.reset();
            } else {
                var arguments = {
                    'ids': ids.join(',')
                };
                ajax(arguments);
            }
        }
    },
    //导出关联网元列表
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
    //任务grid开始
    onTaskStart: function (btn) {
        var me = this;
        //***获取button所绑定的该行record
        var record = btn.getWidgetRecord();
        var taskId = record.get('taskId'),
            grid = btn.findParentByType('PagedGrid');
        var store = grid.store;
        var task_status = this.getViewModel().get('task_status');
        // if (task_status == 1) {
        //     btn.setIconCls('x-fa fa-refresh fa-spin');
        //     btn.setText('运行中');
        //     btn.setDisabled(true);
        // }
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/ne/task/start',
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
    stopTaskPolling: function () {
        console.log('###$#%#%#%#%#%#%');
        var me = this,
            task = me.pollingTask;
        Ext.TaskManager.stop(task);
        me.pollingTask = '';

    },
    getTaskTimer: function (me) {

        var task = {
            run: function () {
                console.log('网元任务正在运行');
                var view = me.getView();
                if (view == null) {
                    Ext.TaskManager.stop(task);
                    return;
                }
                var grid = me.getTaskGrid(),
                    store = grid.store,
                    records = store.getRange(0, store.getCount()),
                    taskIds = [];
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
                    url: '/confcenter/configcenter/upgrade/ne/task/poll?taskIds=' + taskIds,
                    success: function (response, opts) {
                        var recs = Ext.decode(response.responseText);
                        var progress = me.getViewModel().get('progress');
                        var startBtn = me.getViewModel().get('startBtn');
                        //改变进度条的ui
                        for (var i in records) {
                            var record = records[i];
                            var dataIndex = store.indexOf(record);
                            //获取后台返回的进度和执行状态
                            var taskProcess = recs.neUpgradeTasks[dataIndex].taskProcess;
                            var execStatus = recs.neUpgradeTasks[dataIndex].execStatus;
                            var endTime = recs.neUpgradeTasks[dataIndex].endTime;
                            var widget = progress[i];
                            var widgetStartBtn = startBtn[i];

                            //更新等待运行和正在运行状态下的记录
                            //当运行状态为"等待运行","运行中"只更新进度和执行状态
                            //当运行状态为"待激活"或者当前表中某行数据的结束时间为空时更新结束时间和执行状态
                            //当运行状态为"正在激活",说明任务的升级工作已经完成,
                            //表中该行数据没有需要更改的,等待改变执行状态
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
                            //判断从后台收到的数据
                            //如果为"待激活,激活中,已完成"则将进度条和开始按钮的样式进行更改
                            if (rec.get('execStatus') == 3 || rec.get('execStatus') == 4 || rec.get('execStatus') == 5) {
                                //改变进度条UI
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
            //console.log(pollingTask);
            obj.lookupController().getViewModel().set('task', pollingTask);
            // console.log(obj.lookupController().getViewModel().get('task'));
        } else {
            console.log("##$$$$%%");
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
                    console.log('网元正在进行');
                    for (var i in records) {
                        neIds.push(records[i].get('neId'));
                    }
                    if (!neIds.length) {
                        console.log('单板即将停止');
                        Ext.TaskManager.stop(task);
                        return;
                    }
                    Ext.Ajax.request({
                        url: '/confcenter/configcenter/upgrade/ne/oper/poll?taskId=' + taskId + '&neIds=' + neIds,
                        success: function (response, opts) {
                            // index = index + 0.01;

                            var recs = Ext.decode(response.responseText);
                            var menus = me.getViewModel().get('menus');
                            console.log(recs.neOperations[0]);
                            for (var i in records) {
                                var record = records[i];
                                var dataIndex = store.indexOf(record);
                                var operType = recs.neOperations[dataIndex].operType;
                                var operStatus = recs.neOperations[dataIndex].operStatus;
                                var softVersion = recs.neOperations[dataIndex].softVersion;
                                var operDesc = recs.neOperations[dataIndex].operDesc;
                                var operTime = recs.neOperations[dataIndex].operTime;
                                var activateBtn = menus[i].getMenu().items.items[0];
                                var activate = recs.neOperations[dataIndex].activate;
                                var rec = menus[i].getWidgetRecord();
                                record.set('operType', operType);
                                record.set('operStatus', operStatus);
                                record.set('softVersion', softVersion);
                                record.set('operDesc', operDesc);
                                record.set('operTime', operTime);
                                record.set('activate', activate);
                                console.log(rec.get('activate'));
                                if (rec.get('activate')) {
                                    activateBtn.setDisabled(true);
                                } else {
                                    activateBtn.setDisabled(false);
                                }
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
    //显示任务关联网元
    onShowRelatedNe: function (btn) {
        var me = this,
            taskGrid = me.getTaskGrid(),
            neGrid = me.getReletedNeGrid(),
            record = taskGrid.getSelectionModel().getSelection(),
            taskId = record[0].get('taskId'),
            taskName = record[0].get('taskName');
        if (record.length > 1) {
            Ext.MessageBox.alert(
                '提示',
                '请勿选择多行数据'
            );
            return;
        }
        neGrid.store.proxy.extraParams = {
            'taskId': taskId
        };
        //动态显示grid的标题名称
        neGrid.setTitle('任务--' + taskName + '--所关联的网元');
        neGrid.store.load({
            callback: function () {
                me.getView().setActiveItem(4);

            }
        });

        // me.nePolling();
        // me.setActivateItem(false);
    },
    // setActivateItem: function (taskPolling) {

    //     var view = this.getView().up('equipmentUpdateMession');
    //     view.activeId = taskPolling;
    // },
    //关闭任务关联网元的列表
    onCloseRelatedNe: function (btn) {
        var me = this;

        // var obj = me.getView().up('equipmentUpdateMession');
        // var pollingTask = obj.lookupController().getViewModel().get('task');
        // // var pollingTask = me.getViewModel().get('task');
        // console.log(pollingTask);
        // if (pollingTask != 'task') {
        //     var pollingTask = Ext.TaskManager.stop(pollingTask);
        //     // console.log(pollingTask);
        //     obj.lookupController().getViewModel().set('task', 'task');
        //     console.log(obj.lookupController().getViewModel().get('task'));
        // }
        this.getView().setActiveItem(0);

    },
    //新建网元升级任务
    //每次新建任务的时候都会清空form和网元.策略.文件列表的已选择项
    onCreateTask: function () {
        var me = this,
            neGrid = me.getNeGrid(),
            softGrid = me.getSoftGrid(),
            form = me.getCreateTaskForm();
        if (me.getSelectedSoft()) {
            me.getViewModel().set('selectedSoft', []);
            softGrid.store.reload();
        } else {
            var policyGrid = me.getPolicyGrid();
            me.getViewModel().set('selectedPolicy', []);
            policyGrid.store.reload();
        }
        me.getViewModel().set('selectedNe', []);
        neGrid.store.proxy.extraParams = neGrid.down('form').getForm().getValues();
        neGrid.store.reload();
        me.getView().setActiveItem(1);
        me.setResetRecord(form);
    },
    //从文件库选择
    chooseFromSoft: function () {
        var me = this,
            grid = me.getSoftGrid(),
            form = grid.down('form');
        me.setResetRecord(form);
        me.getView().setActiveItem(2);
    },
    //是否从文件库选择
    onChooseSelectChg: function (btn) {
        var me = this,
            form = me.getCreateTaskForm(),
            grid = me.getSoftGrid(),
            container0 = form.down('#container0'),
            container1 = form.down('#container1'),
            fields = container1.query(),
            container2 = form.down('#container2'),
            softStorage = form.down('#versionStorage'),
            // selectedSoft = me.getSelectedSoft(),
            btnValue = btn.getValue();
        this.setResetRecord(grid.down('form'));
        if (btnValue) {
            container0.show();
            container1.hide();
            container2.hide();
            for (var i in fields) {
                var field = fields[i];
                if (field.getXType() == 'fieldcontainer' || field.getXType() == "radiogroup" || field.getXType() == "panel" || field.getXType() == "boundlist") {
                    continue;
                } else {
                    field.reset();
                }
            }
        } else {
            softStorage.reset();
            container0.query()[2].reset()
            container0.hide();
            container1.show();
            container2.show();
            me.resetModelSoft();
            grid.store.reload();
        }
    },
    //显示已选文件
    onShowChoosedSoft: function (opt) {
        var me = this,
            selectedSoft = me.getSelectedSoft(),
            grid = me.getSoftGrid(),
            store = grid.getStore(),
            pagingtoolbar = grid.down('pagingtoolbar');
        if (opt.getValue()) {
            store.removeAll();
            store.add(selectedSoft);
            grid.getSelectionModel().select(selectedSoft, true);
            pagingtoolbar.hide();
            // var afterInput = Ext.String.format(me.afterPageText, 1);
            // store.totalCount = selected.length;
            // store.currentPage = 1;
            // grid.down('pagingtoolbar').down('#inputItem').setValue(1);
            // grid.down('pagingtoolbar').down('#afterTextItem').setHtml(afterInput);
            // grid.down('pagingtoolbar').updateInfo();
        } else {
            store.reload();
        }

    },
    //导入已选文件
    onImportSelectedSoft: function (btn) {
        var me = this,
            form = me.getCreateTaskForm(),
            softForm = me.getSoftGrid().down('form'),
            fileType = form.getForm().findField('fileTypeId'),
            fileTypeValue = softForm.getForm().getValues().fileTypeId,
            selectedSoft = me.getSelectedSoft(),
            softIds = [],
            softNames = [],
            storageId = form.down('#versionStorage'),
            storageName = form.getForm().findField('selectedSoft');
        for (var i in selectedSoft) {
            softIds.push(selectedSoft[i].data.softId);
            softNames.push('文件名称:' + selectedSoft[i].data.filename);
        }
        if (softIds.length) {
            storageId.setValue(softIds);
            storageName.setValue(softNames.join('\n'));
            fileType.setValue(fileTypeValue);
            me.onBack(btn);
        } else {
            Ext.MessageBox.alert(
                '提示',
                '您添加的内容为空,无法导入,<br>请选择升级文件!'
            );
        }

    },
    //选中一行文件触发该事件
    softSelect: function (grid, record, index, eopts) {
        var me = this,
            selectedSoft = me.getSelectedSoft(),
            recordIds = [];
        for (var i in selectedSoft) {
            recordIds.push(selectedSoft[i].data.softId);
        }
        if (!Ext.Array.contains(recordIds, record.data.softId)) {
            selectedSoft.push(record);
        }
    },
    //取消选中一行文件触发该事件
    softDeselect: function (grid, record, index, eopts) {
        var me = this,
            selectedSoft = me.getSelectedSoft();
        for (var i in selectedSoft) {
            if (selectedSoft[i].data.softId == record.data.softId) {
                Ext.Array.remove(selectedSoft, selectedSoft[i]);
            }
        }
    },
    //列表渲染时添加store的load事件监听
    renderGrid: function (grid, eOpts) {
        var me = this,
            checkbox = me.getView().down('#showSelectedSoft'),
            bar = grid.down('pagingtoolbar');

        grid.store.addListener('load', function (store, records, successful, operation, eOpts) {
            var selectedSoft = me.getSelectedSoft(),
                data = [],
                recordIds = [];
            if (selectedSoft.length) {
                for (var i in selectedSoft) {
                    recordIds.push(selectedSoft[i].data.softId);
                }
                store.each(function (record) {
                    if (Ext.Array.contains(recordIds, record.data.softId))
                        data.push(record);
                });
                //将指定数据data标记为已选中,当store刷新时,依然可以让这些数据显示为已选中
                grid.getSelectionModel().select(data, true);
            }
            if (checkbox.getValue()) {
                store.removeAll();
                store.add(selectedSoft);
                grid.getSelectionModel().select(selectedSoft, true);
            } else {
                bar.show();
            }
        });
    },

    //选择网元按钮
    onChooseNe: function () {
        var me = this,
            grid = me.getNeGrid(),
            form = grid.down('form');
        this.setResetRecord(form);
        this.getView().setActiveItem(3);
    },
    // //返回新建升级策略form
    // neToAddPolicyForm: function () {
    //     var me = this,
    //         grid = me.getNeGrid(),
    //         form = grid.down('form');
    //     form.reset();
    //     //this.onChooseYesPopwindowFormSubmit();
    //     grid.store.reload();
    //     // gridb.store.removeAll();
    //     me.getView().setActiveItem(1);

    // },

    neSelect: function (lis, record, index, eopts) {
        var me = this,
            selectedNe = me.getSelectedNe(),
            recordIds = [],
            grid = me.getNeGrid(),
            resourcestate = record.get('resourcestate');
        if (resourcestate == '离线') {
            Ext.Msg.alert(_('Tips'), _('Can not select offline device'));
            console.log(grid);
            grid.getSelectionModel().deselect(record, true);
            return;
        }
        // if (resourcestate == '离位') {
        //     Ext.Msg.alert(_('Tips'), _('Can not select offline device'));
        //     console.log(grid);
        //     grid.getSelectionModel().deselect(record, true);
        //     return;
        // }
        for (var i in selectedNe) {
            recordIds.push(selectedNe[i].data.neId);
        }
        if (!Ext.Array.contains(recordIds, record.data.neId)) {
            selectedNe.push(record);
        }
    },
    neDeselect: function (grid, record, index, eopts) {
        var me = this,
            selectedNe = me.getSelectedNe();
        for (var i in selectedNe) {
            if (selectedNe[i].data.neId == record.data.neId) {
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
                    recordIds.push(selectedNe[i].data.neId);
                }
                store.each(function (record) {
                    if (Ext.Array.contains(recordIds, record.data.neId))
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
    //显示已选择的网元列表
    showChoosedNe: function (opt) {
        var me = this,
            selectedNe = me.getSelectedNe(),
            grid = opt.findParentByType('PagedGrid'),
            store = grid.getStore(),
            pagingtoolbar = grid.down('pagingtoolbar');
        if (opt.getValue()) {
            store.removeAll();
            store.add(selectedNe);
            grid.getSelectionModel().select(selectedNe, true);
            // var afterInput = Ext.String.format(me.afterPageText, 1);
            // store.totalCount = selectedNe.length;
            // store.currentPage = 1;
            // grid.down('pagingtoolbar').down('#inputItem').setValue(1);
            // grid.down('pagingtoolbar').down('#afterTextItem').setHtml(afterInput);
            // grid.down('pagingtoolbar').updateInfo();
            pagingtoolbar.hide();
        } else {
            store.reload();
        }
    },
    //存储所选网元
    onImportSelectedNe: function (btn) {
        var me = this,
            selectedNe = me.getSelectedNe(),
            form = me.getCreateTaskForm(),
            storageId = form.down('#NEstorage'),
            storageName = form.getForm().findField('selectedNe'),
            neIds = [],
            neNames = [];
        for (var i in selectedNe) {
            neIds.push(selectedNe[i].data.neId);
            neNames.push("网元名称:" + selectedNe[i].data.hostname);
        }
        storageId.setValue(neIds);
        storageName.setValue(neNames.join('\n'));
        me.onBack(btn);
    },
    //新建网元备份文件窗口form提交
    onCreateTaskSubmit: function () {
        var me = this,
            form = me.getCreateTaskForm(),
            grid = me.getTaskGrid();
        if (form.getForm().isValid()) {
            form.getForm().submit({
                url: '/confcenterU/configcenter/upgrade/ne/task/create',
                waitTitle: '连接中',
                waitMsg: '传送数据...',
                success: function (form, action) {
                    var respText = Ext.util.JSON.decode(action.response.responseText);
                    var causeid = respText.causeid;
                    console.log("tt", causeid);
                    console.log("t0t", respText);
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
                failure: function (form, action) {
                    Ext.Msg.alert(_('Tips'), _('Request Error'));
                }
            });

        } else {
            Ext.MessageBox.alert(
                '填写错误',
                '请正确填写表单.'
            );
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
            neIds.push(records[i].get('neId'));
        }
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/ne/task/removeNe',
            method: 'GET',
            params: {
                "neIds": neIds.join(','),
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
            neId = neRecord.data.neId;
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/ne/oper/activate',
            method: 'get',
            params: {
                "neId": neId,
                'taskId': taskId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    //Ext.Msg.alert(_('Tips'), _('Activate Success'));
                    // grid.store.reload();
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
            neId = record.get('neId');
        Ext.Ajax.request({
            url: '/confcenter/configcenter/upgrade/ne/oper/getVersion',
            method: 'get',
            params: {
                "neId": neId
            },
            // waitTitle: _('Please wait...'),
            // waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    //Ext.Msg.alert(_('Tips'), _('Success'));
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
    //软件浏览
    onSoftScan: function (btn) {
        var me = this,
            neGrid = me.getNeGrid(),
            // softGrid = this.getView().down('#softGrid'),
            record = btn.findParentByType('button').getWidgetRecord(),
            neId = record.get('neId');
        win = new Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentSoftwareList();
        win.show();
        this.getView().add(win);
        var softGrid = this.getView().down('#softScan');

        softGrid.store.proxy.extraParams = {
            'neId': neId
        };
        softGrid.store.reload();
    },
    //修改进度条状态
    attachRecord: function (col, widget, rec) {
        var value = rec.data.taskProcess;
        console.log(value);
        if (value == 1 || value == 100) {
            widget.setUi('progress1');
        } else {
            widget.setUi('progress');
        }
        var progress = this.getViewModel().get('progress');
        progress.push(widget);
    },
    startBtn: function (col, widget, rec) {
        var execStatus = rec.data.execStatus;
        if (execStatus == 5 || execStatus == 3 || execStatus == 4) {
            widget.setIconCls('x-fa fa-check');
            widget.setText('完成');
            // console.log(widget);
            widget.setDisabled(true);
        } else if (execStatus == 1) {
            widget.setIconCls('x-fa fa-play');
            widget.setText('开始');
            widget.setDisabled(false);
        } else if (execStatus == 2) {
            widget.setIconCls('x-fa fa-refresh fa-spin');
            widget.setText('进行中');
            widget.setDisabled(true);
        }
        var startBtn = this.getViewModel().get('startBtn');
        // console.log(this.getViewModel())

        if (!Ext.Array.contains(startBtn, widget)) {
            startBtn.push(widget);
            // console.log(widget);
            // console.log('startBtn::::' + startBtn);
        }


    },
    //修改网元操作激活按钮的状态
    weitherActive: function (col, widget, rec) {
        var me = this,
            menu = widget.getMenu().items.items,
            activateBtn = menu[0],
            taskGrid = me.getTaskGrid(),
            operType = rec.get('operType'),
            operStatus = rec.get('operStatus'),
            activate = rec.get('activate'),
            taskRecord = taskGrid.getSelectionModel().getSelection()[0],
            execStatus = taskRecord.get('execStatus');
        // if (operStatus == '运行中') {
        //     for (var i in menu) {
        //         menu[i].setDisabled(true);
        //     }
        // }
        var menus = this.getViewModel().get('menus');
        console.log(menus);

        if (!Ext.Array.contains(menus, widget)) {
            menus.push(widget);
            // console.log(widget);
            // console.log('startBtn::::' + startBtn);
        }
        if (execStatus == 3 && activate == false) {
            activateBtn.setDisabled(false);
        } else {
            activateBtn.setDisabled(true);
        }
    },
    onStartBtn: function (col, widget, rec) {
        var execStatus = rec.data.execStatus;
        if (execStatus == 5 || execStatus == 3 || execStatus == 4) {
            widget.setIconCls('x-fa fa-check');
            widget.setText('完成');
            // console.log(widget);
            widget.setDisabled(true);
        } else if (execStatus == 1) {
            widget.setIconCls('x-fa fa-play');
            widget.setText('开始');
            widget.setDisabled(false);
        } else if (execStatus == 2) {
            widget.setIconCls('x-fa fa-refresh fa-spin');
            widget.setText('进行中');
            widget.setDisabled(true);
        }

    }
});