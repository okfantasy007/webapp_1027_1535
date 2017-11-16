Ext.define('Admin.view.reports.reportTaskListView', {
    extend: 'Ext.container.Container',
    xtype: 'reportTaskListView',

    requires: [
        'Admin.view.base.PagedGrid'
        // 'Admin.view.base.clock.picker',
        // 'Admin.view.base.clock.clock'
    ],

    controller: {
        onQuery: function() {
            var task_list_grid = this.lookupReference('task_list_grid');
            var task_name = task_list_grid.down('toolbar').down('textfield').getValue();
            var paging = task_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = task_list_grid.getStore();
            store.proxy.extraParams = {
                "task_name": task_name
            };
            store.reload({
                page: 1,
                start: 0
            });
        },
        onKeyWordChange: function(me, newValue, oldValue, ops) {
            var task_list_grid = this.lookupReference('task_list_grid');
            var paging = task_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = task_list_grid.getStore();
            store.proxy.extraParams = {
                "task_name": newValue
            };
            store.reload({
                page: 1,
                start: 0
            });
        },
        onAdd: function() {
            var add_task_panel = this.lookupReference('add_task_panel');
            window.task_action = "add";
            add_task_panel.getForm().reset(); //进入新增任务界面之前需要清空form表单
            add_task_panel.setTitle(_('Create Task'));
            add_task_panel.form.findField('operate_type').setValue('add');
            this.getView().setActiveItem(add_task_panel); //this.getView()必须对应layout为card布局 且必须在controller里定义方法
        },
        emailTopicOrContentReversePro: function(index, name, record) {
            if (index) {
                if (typeof index == 'string') {
                    if (index.indexOf(",") !== -1) {
                        if (index.indexOf("[") !== -1) {
                            index = Ext.util.JSON.decode(index);
                        } else {
                            index = index.split(",");
                        }
                    } else {
                        index = [index];
                    }
                    var arr = [];
                    if (Array.isArray(index)) {
                        index.forEach(function(ele) {
                            if (ele == '0' || ele == _('Task Name')) {
                                arr.push('0');
                            }
                            if (ele == '1' || ele == _('Report Name')) {
                                arr.push('1');
                            }
                            if (ele == '2' || ele == _('Start Time')) {
                                arr.push('2');
                            }
                            if (ele == '3' || ele == _('End Time')) {
                                arr.push('3');
                            }
                            if (ele == '4' || ele == _('Task Execution Result')) {
                                arr.push('4');
                            }
                            if (ele == '5' || ele == _('Time Consuming')) {
                                arr.push('5');
                            }
                        });
                    } else {
                        if (index == '0' || index == _('Task Name')) {
                            arr.push('0');
                        }
                        if (index == '1' || index == _('Report Name')) {
                            arr.push('1');
                        }
                        if (index == '2' || index == _('Start Time')) {
                            arr.push('2');
                        }
                        if (index == '3' || index == _('End Time')) {
                            arr.push('3');
                        }
                        if (index == '4' || index == _('Task Execution Result')) {
                            arr.push('4');
                        }
                        if (index == '5' || index == _('Time Consuming')) {
                            arr.push('5');
                        }
                    }
                }
                record.data[name] = arr;
            }
        },
        recordPro: function(record){
            record.data['task_status'] = record.data['task_status'] == _('started') ? '1' : '0';
            var report_type = record.data['report_type'];
            if (report_type == 'pdf') {
                record.data['report_type'] = '0';
            } else if (report_type == 'csv') {
                record.data['report_type'] = '1';
            } else if (report_type == 'html') {
                record.data['report_type'] = '2';
            }
            var task_cycle = record.data['task_cycle'];
            var time_detail = record.data['time_detail'];
            if (task_cycle == _('day')) {
                record.data['task_cycle'] = '0';
            } else if (task_cycle == _('week')) {
                record.data['task_cycle'] = '1';
                if (time_detail == _('monday')) {
                    record.data['time_detail'] = '1';
                } else if (time_detail == _('tuesday')) {
                    record.data['time_detail'] = '2';
                } else if (time_detail == _('wednesday')) {
                    record.data['time_detail'] = '3';
                } else if (time_detail == _('thursday')) {
                    record.data['time_detail'] = '4';
                } else if (time_detail == _('friday')) {
                    record.data['time_detail'] = '5';
                } else if (time_detail == _('saturday')) {
                    record.data['time_detail'] = '6';
                } else if (time_detail == _('sunday')) {
                    record.data['time_detail'] = '7';
                }
            } else if (task_cycle == _('month')) {
                record.data['task_cycle'] = '2';
                record.data['time_detail'] = parseInt(record.data['time_detail']).toString();
            } else if (task_cycle == _('regular')) {
                record.data['task_cycle'] = '3';
                record.data['time_detail'] = '';
            }
            var email_topic = record.data['email_topic'] ? record.data['email_topic'].toString() : "";
            var email_content = record.data['email_content'] ? record.data['email_content'].toString() : "";

            this.emailTopicOrContentReversePro(email_topic, 'email_topic', record);
            this.emailTopicOrContentReversePro(email_content, 'email_content', record);
        },
        onModify: function() {
            var add_task_panel = this.lookupReference('add_task_panel');
            var task_list_grid = this.lookupReference('task_list_grid');

            add_task_panel.getForm().reset({
                name: 'user_name',
                name: 'password'
            });
            var records = task_list_grid.getSelectionModel().getSelection();

            //如果该任务被查看过 要把之前修改过的record恢复为原始值
            if (window.task_data && window.task_data.action == 'see' && window.task_data.id == records[0].id && window.task_data.data) {
                records[0].data = window.task_data.data;
                this.recordPro(records[0]);
            }
            if (typeof records[0].get('email_topic') == "string") {
                var email_topic = Ext.util.JSON.decode(records[0].get('email_topic'));
                records[0].data['email_topic'] = email_topic;
            }
            if (typeof records[0].get('email_content') == "string") {
                var email_content = Ext.util.JSON.decode(records[0].get('email_content'));
                records[0].data['email_content'] = email_content;
            }
            window.task_action = 'modify'; //要在loadRecord之前赋值
            window.time_detail = records[0].get('time_detail');


            add_task_panel.setTitle(_('Modify Task'));
            add_task_panel.getForm().loadRecord(records[0]); //loadRecord可能会触发task_cycle的change事件

            add_task_panel.form.findField('operate_type').setValue('modify');
            this.getView().setActiveItem(add_task_panel); //this.getView()必须对应layout为card布局 且必须在controller里定义方法
        },
        onStart: function() {
            var task_list_grid = this.lookupReference('task_list_grid');
            var result_list_grid_by_task = this.lookupReference('result_list_grid_by_task');

            var updateTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('updateTaskBtn');
            var startTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('startTaskBtn');
            var stopTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('stopTaskBtn');
            var deleteTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('deleteTaskBtn');
            var seeTaskDetailBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('seeTaskDetailBtn');

            var sm = task_list_grid.getSelectionModel();
            var records = sm.getSelection();
            var indexs = [];

            var taskids = "";
            for (var i = 0; i < records.length - 1; i++) {
                // taskids.push(records[i].get('task_id'));
                taskids += records[i].get('task_id');
                taskids += ",";
                indexs.push(task_list_grid.store.indexOf(records[i]));
            }
            taskids += records[records.length - 1].get('task_id');
            indexs.push(task_list_grid.store.indexOf(records[records.length - 1]));

            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to start the selected task?'),
                function(btn) {
                    if (btn == 'yes') {
                        var status = Reports.operateTask(taskids, "start");
                        if (status == "success") {
                            task_list_grid.getStore().reload({
                                callback: function(r, scope, success) {
                                    if (success) {
                                        for (var i = 0; i < indexs.length; i++) {
                                            sm.select(indexs[i], true);
                                        }
                                        deleteTaskBtn.setDisabled(false); //已经启动的任务不允许被删除
                                        startTaskBtn.setDisabled(true);
                                        stopTaskBtn.setDisabled(false);
                                        var sels = sm.getSelection();
                                        if (sels.length == 1) {
                                            updateTaskBtn.setDisabled(false);
                                            seeTaskDetailBtn.setDisabled(false);
                                            // var result_store = generateResultStore(sels[0].get("task_id"));
                                            var result_store = result_list_grid_by_task.getStore();
                                            console.log('-----------');
                                            result_store.proxy.url = '/reports/rest/report_task_result/getTaskResultInfo?task_id=' + sels[0].get("task_id");

                                            result_store.reload();
                                            console.log('+++++++++++');
                                            // result_list_grid_by_task.setStore(result_store);
                                        } else if (sels.length > 1) {
                                            updateTaskBtn.setDisabled(true);
                                            seeTaskDetailBtn.setDisabled(true);
                                            task_list_grid.setHeight(null);
                                        }
                                    }
                                }
                            });
                            Ext.Msg.alert(_('Tip'), _('Start successfully'));
                        } else {
                            Ext.Msg.alert(_('Tip'), _('Start unsuccessfully'));

                        }
                    }
                } // func
            );
        },
        onStop: function() {
            var task_list_grid = this.lookupReference('task_list_grid');
            var result_list_grid_by_task = this.lookupReference('result_list_grid_by_task');

            var updateTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('updateTaskBtn');
            var startTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('startTaskBtn');
            var stopTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('stopTaskBtn');
            var deleteTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('deleteTaskBtn');
            var seeTaskDetailBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('seeTaskDetailBtn');

            var sm = task_list_grid.getSelectionModel();
            var records = sm.getSelection();
            var indexs = [];

            var taskids = "";
            for (var i = 0; i < records.length - 1; i++) {
                // taskids.push(records[i].get('task_id'));
                taskids += records[i].get('task_id');
                taskids += ",";
                indexs.push(task_list_grid.store.indexOf(records[i]));
            }
            taskids += records[records.length - 1].get('task_id');
            indexs.push(task_list_grid.store.indexOf(records[records.length - 1]));

            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to stop the selected task?'),
                function(btn) {
                    if (btn == 'yes') {
                        var status = Reports.operateTask(taskids, "stop");
                        if (status == "success") {
                            task_list_grid.getStore().reload({
                                callback: function(r, scope, success) {
                                    if (success) {
                                        for (var i = 0; i < indexs.length; i++) {
                                            sm.select(indexs[i], true);
                                        }
                                        deleteTaskBtn.setDisabled(false);
                                        startTaskBtn.setDisabled(false);
                                        stopTaskBtn.setDisabled(true);
                                        var sels = sm.getSelection();
                                        if (sels.length == 1) {
                                            updateTaskBtn.setDisabled(false);
                                            seeTaskDetailBtn.setDisabled(false);
                                            // var result_store = generateResultStore(sels[0].get("task_id"));
                                            // result_list_grid_by_task.setStore(result_store);
                                            var result_store = result_list_grid_by_task.getStore();
                                            result_store.proxy.url = '/reports/rest/report_task_result/getTaskResultInfo?task_id=' + sels[0].get("task_id");
                                            // result_store.proxy.url = '/report/gettaskresultlist/page/' + sels[0].get("task_id"); //本地调试用
                                            result_store.reload();
                                        } else if (sels.length > 1) {
                                            updateTaskBtn.setDisabled(true);
                                            seeTaskDetailBtn.setDisabled(true);
                                            task_list_grid.setHeight(null);
                                        }
                                    }
                                }
                            });
                            Ext.Msg.alert(_('Tip'), _('Stop successfully'));
                        } else {
                            Ext.Msg.alert(_('Tip'), _('Stop unsuccessfully'));
                        }
                    }
                } // func
            );
        },
        onDelete: function() {
            var task_list_grid = this.lookupReference('task_list_grid');

            var records = task_list_grid.getSelectionModel().getSelection();
            var taskids = "";
            for (var i = 0; i < records.length - 1; i++) {
                // taskids.push(records[i].get('task_id'));
                taskids += records[i].get('task_id');
                taskids += ",";
            }
            taskids += records[records.length - 1].get('task_id');
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to delete the selected task?'),
                function(btn) {
                    if (btn == 'yes') {
                        var status = Reports.operateTask(taskids, "delete");
                        if (status == "success") {
                            task_list_grid.getStore().reload({
                                callback: function(r, scope, success) {
                                    if (success) {
                                        task_list_grid.getSelectionModel().clearSelections(); //清空选择
                                        task_list_grid.getView().refresh();
                                    }
                                }
                            });
                            Ext.Msg.alert(_('Tip'), _('Delete successfully'));
                        } else {
                            Ext.Msg.alert(_('Tip'), _('Delete unsuccessfully'));
                        }
                    }
                } // func
            );
        },
        onTaskGridRefresh: function() {
            var task_list_grid = this.lookupReference('task_list_grid');

            var task_name = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].down('textfield').getValue();
            var paging = task_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var page_size = task_list_grid.getDockedItems('toolbar[dock="top"]')[1].getComponent('task_grid_pasesize').getValue();
            var store = task_list_grid.getStore();
            var extra_params = store.proxy.extraParams;
            if ("task_name" in extra_params) {
                delete extra_params["task_name"];
            }
            // store.proxy.extraParams = {
            //     "task_name": task_name
            // };
            store.reload({
                page: 1,
                start: 0,
                limit: page_size
            });
        },
        onResultGridByTaskRefresh: function() {
            var result_list_grid_by_task = this.lookupReference('result_list_grid_by_task');

            var paging = result_list_grid_by_task.down('pagingtoolbar');
            paging.moveFirst();
            var page_size = result_list_grid_by_task.getDockedItems('toolbar[dock="top"]')[1].getComponent('result_list_grid_by_task_pagesize').getValue();
            var store = result_list_grid_by_task.getStore();
            store.reload({
                page: 1,
                start: 0,
                limit: page_size
            });
        },
        preViewCommon: function(title, report_name) {
            var pdf_preview_window = Ext.widget('window', {
                title: title,
                modal: true,
                constrain: true,//禁止窗口移出浏览器屏幕
                items: [{
                    xtype: 'panel',
                    width: 850,
                    height: 500,
                    // html:"<img src='/images/banner_logo.png' height='24'>",//显示本地路径图片
                    // html:"<img src='http://c.hiphotos.baidu.com/zhidao/pic/item/86d6277f9e2f070832abe952e124b899a901f232.jpg'>"//根据url显示网络图片
                    // html: "<img src='/reports/高级信息系统项目管理师的5天修炼.pdf' width='450' height='400'>"
                }]
            }).show();
            var pdf_preview_id = pdf_preview_window.down('panel').id;

            var success = new PDFObject({
                url: "report/" + report_name,
                pdfOpenParams: {
                    scrollbars: '0',
                    toolbar: '0',
                    statusbar: '0'
                }
            }).embed(pdf_preview_id);
        },
        onPreview: function() {
            var me = this;
            var result_list_grid_by_task = this.lookupReference('result_list_grid_by_task');

            var records = result_list_grid_by_task.getSelectionModel().getSelection();
            var report_name = records[0].get('report_name');
            if (report_name.indexOf('.html') !== -1) {
                report_name = report_name.substring(0, report_name.indexOf('.html')) + ".pdf";
            }
            if (report_name.indexOf('.csv') !== -1) {
                report_name = report_name.substring(0, report_name.indexOf('.csv')) + ".pdf";
            }
            var title = _('Preview Report') + ' ( ' + _('name') + "：" + report_name + " )";
            Ext.Ajax.request({
                url: "report/" + report_name,
                success: function(response, opts) {
                    me.preViewCommon(title, report_name);
                     Ext.Ajax.request({
                        url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=1"
                    });
                    return;
                },
                failure: function(response, opts) {
                    Ext.Ajax.request({
                        url: "reports/rest/report_task_result/previewReport?report_name=" + report_name + "&task_id=" + records[0].get('task_id'),
                        success: function(response, opts) {
                            var res = Ext.decode(response.responseText);
                            if (res && res.status == "success") {
                                me.preViewCommon(title, report_name);
                                 Ext.Ajax.request({
                                     url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=1"
                                });
                            }else{
                                Ext.Ajax.request({
                                     url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=0"
                                });
                            }
                            return;
                        },
                        failure: function(response, opts) {
                            Ext.Ajax.request({
                                     url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=0"
                                });
                            console.log('server-side failure with status code ' + response.status);
                            return;
                        }
                    });
                    console.log('server-side failure with status code ' + response.status);
                    return;
                }
            });
        },
        onDownLoad: function() {
            var result_list_grid_by_task = this.lookupReference('result_list_grid_by_task');
            var records = result_list_grid_by_task.getSelectionModel().getSelection();
            if (records && records.length == 0) {
                console.log("请选择某行数据");
                Ext.Msg.alert(_('Tip'), '请选择某行数据');
                return;
            }
            location.href = 'reports/rest/report_task_result/reportDownload?fileName=' + records[0].get("report_name") + '&taskId=' + records[0].get("task_id");
        },
        goToParamsPage: function() {
            var set_params_panel = this.lookupReference('param_setting_panel');
          //  set_params_panel.getForm().reset(); //进入新增任务界面之前需要清空form表单
            this.getView().setActiveItem(set_params_panel); //this.getView()必须对应layout为card布局
        },
        backToTaskListPage: function() {
            Ext.getCmp('params_setting_button').setVisible(false);
            var task_list_panel = this.lookupReference('task_list_panel');

            this.getView().setActiveItem(task_list_panel); //this.getView()必须对应layout为card布局

        },
        backToAddTaskPage: function() {
            var add_task_panel = this.lookupReference('add_task_panel');
            this.getView().setActiveItem(add_task_panel); //this.getView()必须对应layout为card布局
        },
        addOrModifyTaskReset: function() {
            var add_task_panel = this.lookupReference('add_task_panel');
            var task_list_grid = this.lookupReference('task_list_grid');
            var op_type = this.lookupReference('operate_type');

            var values = add_task_panel.getForm().getValues();
            console.info("values:", values);
            var records = task_list_grid.getSelectionModel().getSelection();
            var operate_type = values['operate_type'];
            if (operate_type == "add") {
                add_task_panel.getForm().reset();
                op_type.setValue('add');
            } else if (operate_type == "modify") { //如果是修改任务，则还原最初值
                add_task_panel.getForm().loadRecord(records[0]);
                op_type.setValue('modify');
            }
        },
        addOrModifyTaskSubmit: function() {
            var add_task_panel = this.lookupReference('add_task_panel');
            var task_list_panel = this.lookupReference('task_list_panel');
            var task_list_grid = this.lookupReference('task_list_grid');
            var result_list_grid_by_task = this.lookupReference('result_list_grid_by_task');
            var me = this;
            var values = add_task_panel.getForm().getValues();
            console.info("values:", values);

            var updateTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('updateTaskBtn');
            var startTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('startTaskBtn');
            var stopTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('stopTaskBtn');
            var deleteTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('deleteTaskBtn');
            var seeTaskDetailBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('seeTaskDetailBtn');

            var url = '/report/';
            var operate_type = values['operate_type'];
            url = url + operate_type + 'task'; //新增对应operate_type为add 修改对应operate_type为modify
            var sm = task_list_grid.getSelectionModel();
            if (task_list_grid.selection !== null) {
                var records = sm.getSelection();
                var task_id = records[0].get('task_id');
                values['task_id'] = task_id;
                var index = task_list_grid.store.indexOf(records[0]);
            }

            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to submit?'),
                function(btn) {
                    if (btn == 'yes') {
                        var current_time = new Date();

                        if (operate_type == "add") {
                            values["create_time"] = Reports.formatDateTime(new Date());
                            values["creater"] = APP.user;
                            var url = "reports/rest/report_task/" + operate_type + "Task";
                            // var url = "report/" + operate_type + "task/db";

                        } else if (operate_type == "modify") {
                            // values["creater"] = sm.getSelection()[0].get('creater');
                            values['modifier'] = APP.user;
                            values["modify_time"] = Reports.formatDateTime(new Date());
                            var url = "reports/rest/report_task/" + operate_type + "TaskInfo";
                            // if (values["task_cycle"] == "3") {
                            //     values["time_detail"] = formatDateYMD(new Date());
                            // }
                        }

                        if (values["task_cycle"] == "3") {
                            values["time_detail"] = Reports.formatDateYMD(new Date());
                            var execute_time = new Date(values["time_detail"] + " " + values["execute_time"]);

                            if (execute_time.getTime() - current_time.getTime() < 10 * 60 * 1000) {
                                Ext.Msg.alert(_('Tip'), _('Please input at least ten minutes after current time as execution time'));
                                return;
                            }

                        }

                        delete values["operate_type"]; //提交请求之前删除values的operate_type属性
                        console.info("values:", values);


                        var form = add_task_panel.getForm();

                        if (form.isValid()) {

                            form.submit({
                                url: url,
                                params: values,
                                waitTitle: _('Please wait...'),
                                waitMsg: _('Please wait...'),
                                success: function(form, action) {
                                    if (action.result.success == true) {
                                        Ext.Msg.alert(_('Tip'), _('Submit successfully'));
                                        me.getView().setActiveItem(task_list_panel);
                                        task_list_grid.getStore().reload({
                                            callback: function(r, scope, success) {
                                                if (success) {
                                                    if (operate_type == "modify") {
                                                        sm.select(index, true);
                                                        var record = sm.getSelection()[0];
                                                        var status = record.get('task_status');
                                                        console.log(record.get('task_status'));
                                                        updateTaskBtn.setDisabled(false);
                                                        seeTaskDetailBtn.setDisabled(false);
                                                        if (status == '0') {
                                                            startTaskBtn.setDisabled(false);
                                                            stopTaskBtn.setDisabled(true);
                                                            // deleteTaskBtn.setDisabled(false);
                                                        } else if (status == '1') {
                                                            startTaskBtn.setDisabled(true);
                                                            stopTaskBtn.setDisabled(false);
                                                            // deleteTaskBtn.setDisabled(true); //启动的任务不允许删除
                                                        }
                                                        deleteTaskBtn.setDisabled(false);
                                                        // var result_store = generateResultStore(record.get("task_id"));
                                                        // result_list_grid_by_task.setStore(result_store);
                                                        var result_store = result_list_grid_by_task.getStore();
                                                        result_store.proxy.url = '/reports/rest/report_task_result/getTaskResultInfo?task_id=' + record.get("task_id");
                                                        // result_store.proxy.url = '/report/gettaskresultlist/page/' + record.get("task_id"); //本地调试用
                                                        result_store.reload();
                                                    } else if (operate_type == "add") {
                                                        var store = task_list_grid.getStore();
                                                        var totalCount = store.getTotalCount();
                                                        var pageCount = Math.ceil(totalCount / store.pageSize);
                                                        store.loadPage(pageCount, {
                                                            callback: function() {
                                                                console.log("load last page");
                                                                var last_index = totalCount - store.pageSize * (pageCount - 1) - 1;
                                                                sm.select(last_index, true);
                                                                var record = sm.getSelection()[0];
                                                                var status = record.get('task_status');
                                                                console.log(record.get('task_status'));
                                                                updateTaskBtn.setDisabled(false);
                                                                seeTaskDetailBtn.setDisabled(false);
                                                                if (status == '0') {
                                                                    startTaskBtn.setDisabled(false);
                                                                    stopTaskBtn.setDisabled(true);
                                                                    // deleteTaskBtn.setDisabled(false);
                                                                } else if (status == '1') {
                                                                    startTaskBtn.setDisabled(true);
                                                                    stopTaskBtn.setDisabled(false);
                                                                    // deleteTaskBtn.setDisabled(true); //启动的任务不允许删除
                                                                }
                                                                deleteTaskBtn.setDisabled(false);
                                                                // var result_store = generateResultStore(record.get("task_id"));
                                                                // result_list_grid_by_task.setStore(result_store);
                                                                var result_store = result_list_grid_by_task.getStore();
                                                                result_store.proxy.url = '/reports/rest/report_task_result/getTaskResultInfo?task_id=' + record.get("task_id");
                                                                // result_store.proxy.url = '/report/gettaskresultlist/page/' + record.get("task_id"); //本地调试用
                                                                result_store.reload();
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    }
                                },
                                failure: function(form, action) {
                                    Ext.Msg.alert(_('Tip'), _('Submit unsuccessfully'));
                                }
                            }); // form
                        }
                    } else if (btn == 'no') {
                        me.getView().setActiveItem(add_task_panel);
                    }
                } // func
            );
        },
        resetParams: function() {
            var set_params_panel = this.lookupReference('set_params_panel');
            set_params_panel.getForm().reset();
        },
        submitParams: function() {
            var add_task_panel = this.lookupReference('add_task_panel');

            var me = this;
            var count = 1000;
            var original_arr = new Array; //原数组 
            //给原数组original_arr赋值 
            for (var i = 0; i < count; i++) {
                original_arr[i] = i + 1;
            }
            var d1 = new Date().getTime();
            console.log(d1);
            original_arr.sort(function() {
                return 0.5 - Math.random();
            });
            var params_identify_id = original_arr[0]; //生成随机数
            console.log("params_identify_id: " + params_identify_id);
            var d2 = new Date().getTime();
            console.log(d2);
            Ext.MessageBox.confirm(_('Operation Confirm'), _('Are you sure to submit the interface parameters?'),
                function(btn) {
                    if (btn == 'yes') {
                        add_task_panel.form.findField('params_identify_id').setValue(params_identify_id);
                        me.getView().setActiveItem(add_task_panel);
                    }
                } // func
            );
        },
        emailTopicOrContentPro: function(index, name, record) {
            if (index) {
                if (typeof index == 'string') {
                    if (index.indexOf(",") !== -1) {
                        if (index.indexOf("[") !== -1) {
                            index = Ext.util.JSON.decode(index);
                        } else {
                            index = index.split(",");
                        }
                    } else {
                        index = [index];
                    }
                    var arr = [];
                    if (Array.isArray(index)) {
                        index.forEach(function(ele) {
                            if (ele == '0' || ele == _('Task Name')) {
                                arr.push(_('Task Name'));
                            }
                            if (ele == '1' || ele == _('Report Name')) {
                                arr.push(_('Report Name'));
                            }
                            if (ele == '2' || ele == _('Start Time')) {
                                arr.push(_('Start Time'));
                            }
                            if (ele == '3' || ele == _('End Time')) {
                                arr.push(_('End Time'));
                            }
                            if (ele == '4' || ele == _('Task Execution Result')) {
                                arr.push(_('Task Execution Result'));
                            }
                            if (ele == '5' || ele == _('Time Consuming')) {
                                arr.push(_('Time Consuming'));
                            }
                        });
                    } else {
                        if (index == '0' || index == _('Task Name')) {
                            arr.push(_('Task Name'));
                        }
                        if (index == '1' || index == _('Report Name')) {
                            arr.push(_('Report Name'));
                        }
                        if (index == '2' || index == _('Start Time')) {
                            arr.push(_('Start Time'));
                        }
                        if (index == '3' || index == _('End Time')) {
                            arr.push(_('End Time'));
                        }
                        if (index == '4' || index == _('Task Execution Result')) {
                            arr.push(_('Task Execution Result'));
                        }
                        if (index == '5' || index == _('Time Consuming')) {
                            arr.push(_('Time Consuming'));
                        }
                    }
                }
                record.data[name] = arr;
            }
        },
        onSeeDetail: function() {
            var see_task_panel = this.lookupReference('see_task_panel');
            var task_list_grid = this.lookupReference('task_list_grid');
            see_task_panel.getForm().reset();
            var records = task_list_grid.getSelectionModel().getSelection();

            var record = records[0];
            var data = record.data;

            window.task_action = 'see';
            record.data['task_status'] = record.data['task_status'] == '1' ? _('started') : _('stopped');
            var report_type = record.data['report_type'];
            if (report_type == '0') {
                record.data['report_type'] = 'pdf';
            } else if (report_type == '1') {
                record.data['report_type'] = 'csv';
            } else if (report_type == '2') {
                record.data['report_type'] = 'html';
            }
            var task_cycle = record.data['task_cycle'];
            var time_detail = record.data['time_detail'];
            if (task_cycle == '0') {
                record.data['task_cycle'] = _('day');
            } else if (task_cycle == '1') {
                record.data['task_cycle'] = _('week');
                // record.data['time_detail'] = '周' + time_detail;
                if (time_detail == '1') {
                    record.data['time_detail'] = _('monday');
                } else if (time_detail == '2') {
                    record.data['time_detail'] = _('tuesday');
                } else if (time_detail == '3') {
                    record.data['time_detail'] = _('wednesday');
                } else if (time_detail == '4') {
                    record.data['time_detail'] = _('thursday');
                } else if (time_detail == '5') {
                    record.data['time_detail'] = _('friday');
                } else if (time_detail == '6') {
                    record.data['time_detail'] = _('saturday');
                } else if (time_detail == '7') {
                    record.data['time_detail'] = _('sunday');
                }
            } else if (task_cycle == '2') {
                record.data['task_cycle'] = _('month');
                record.data['time_detail'] = time_detail + _('th');
                if (APP.lang == 'en_US') {
                    if (time_detail == '2') {
                        record.data['time_detail'] = time_detail + 'nd';
                    }
                    if (time_detail == '3') {
                        record.data['time_detail'] = time_detail + 'rd';
                    }
                }
            } else if (task_cycle == '3') {
                record.data['task_cycle'] = _('regular');
                record.data['time_detail'] = '';
            }
            var password = record.data['password'];
            if (password && password.length > 0) {
                var passw = "";
                for (var i = 0; i < password.length; i++) {
                    passw += '*';
                }
                record.data['password'] = passw;
            }

            var email_topic = record.data['email_topic'] ? record.data['email_topic'].toString() : "";
            var email_content = record.data['email_content'] ? record.data['email_content'].toString() : "";

            this.emailTopicOrContentPro(email_topic, 'email_topic', record);
            this.emailTopicOrContentPro(email_content, 'email_content', record);
            var task_data = $.extend(true, {}, data); //深度复制
            window.task_data = {
                id: record.id,
                data: task_data, //原始数据
                action: 'see'
            };

            see_task_panel.getForm().loadRecord(record);
             Ext.getCmp('detail_params_button').setVisible(record.data['template_name']=='PerformanceTask' ? true : false);
            this.getView().setActiveItem(see_task_panel);
        }
    },
    viewModel: {
        stores: {
            task_list_grid_store: {
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    // url: '/report/gettasklist/db/page',
                    url: '/reports/rest/report_task/getTaskInfo',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'count'
                    }
                },
                autoLoad: true,
                listeners: {
                    load: function(store, records, successful) {
                        console.log('Store count A', 'count: ' + store.getCount());
                    }
                }
            },
            result_list_grid_by_task_store: {
                asynchronousLoad: false,
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/reports/rest/report_task_result/getTaskResultInfo?task_id=-1',
                    // url: '/report/gettaskresultlist/page/-1', //本地调试用
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'count'
                    }
                },
                autoLoad: true,
                listeners: {
                    load: function(store, records, successful) {
                        // console.log('Store count A', 'count: ' + store.getCount());
                        if (successful) {
                            console.log('Store count A', 'count: ' + store.getCount());
                            // if (store.getCount() == 0) {
                            //     result_list_grid_by_task.setHidden(true);
                            //     task_list_grid.setHeight(null);
                            // } else {
                            //     var sm = task_list_grid.getSelectionModel();
                            //     var task_name = sm.getSelection()[0].get("task_name");
                            //     var title = "结果列表 [ " + task_name + " ]";
                            //     result_list_grid_by_task.setHidden(false);
                            //     result_list_grid_by_task.setTitle(title);
                            //     task_list_grid.setHeight(330);
                            // }
                        }
                    }
                }
            },
            task_cycle_store: {
                fields: ['task_cycle', 'task_cycle_name'],
                data: [{
                    'task_cycle': '0',
                    'task_cycle_name': _('day')
                }, {
                    'task_cycle': '1',
                    'task_cycle_name': _('week')
                }, {
                    'task_cycle': '2',
                    'task_cycle_name': _('month')
                }, {
                    'task_cycle': '3',
                    'task_cycle_name': _('regular')
                }]
            },
            task_status_store: {
                fields: ['task_status', 'task_status_name'],
                data: [{
                    'task_status': '1',
                    'task_status_name': _('started')
                }, {
                    'task_status': '0',
                    'task_status_name': _('stopped')
                }]
            },
            report_type_store: {
                fields: ['report_type', 'report_type_name'],
                data: [{
                    'report_type': '0',
                    'report_type_name': 'pdf'
                }, {
                    'report_type': '1',
                    'report_type_name': 'csv'
                }, {
                    'report_type': '2',
                    'report_type_name': 'html'
                }]
            },
            basic_field_store: {
                fields: ['field_id', 'field_name'],
                data: [{
                    'field_id': '0',
                    'field_name': _('Task Name')
                }, {
                    'field_id': '1',
                    'field_name': _('Report Name')
                }, {
                    'field_id': '2',
                    'field_name': _('Start Time')
                }, {
                    'field_id': '3',
                    'field_name': _('End Time')
                }, {
                    'field_id': '4',
                    'field_name': _('Task Execution Result')
                }, {
                    'field_id': '5',
                    'field_name': _('Time Consuming')
                }]
            },
            time_detail_week_store: {
                fields: ['time_detail', 'time_detail_name'],
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json'
                    }
                },
                data: [{
                    'time_detail': '1',
                    'time_detail_name': _('monday')
                }, {
                    'time_detail': '2',
                    'time_detail_name': _('tuesday')
                }, {
                    'time_detail': '3',
                    'time_detail_name': _('wednesday')
                }, {
                    'time_detail': '4',
                    'time_detail_name': _('thursday')
                }, {
                    'time_detail': '5',
                    'time_detail_name': _('friday')
                }, {
                    'time_detail': '6',
                    'time_detail_name': _('saturday')
                }, {
                    'time_detail': '7',
                    'time_detail_name': _('sunday')
                }]
            },
            time_detail_store: {
                proxy: {
                    type: 'ajax',
                    url: '/report/gettimedetaillist/week/' + APP.lang,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true,
                asynchronousLoad: false,
                listeners: {
                    load: function(store, records, successful) {
                        console.log('Store count A', 'count: ' + store.getCount());
                    }
                }
            },
            all_template_list_store: {
                proxy: {
                    type: 'ajax',
                    // url: '/report/gettemplatelist/db/all', //本地调试用
                    url: '/reports/rest/report_template/getAllTemplateInfo',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true,
                listeners: {
                    load: function(store, records, successful) {
                        console.log('Store count A', 'count: ' + store.getCount());
                    }
                }
            }
        }
    },

    // 指定布局
    layout: 'card',
    // views: ['clock'],
    // cls: 'shadow',

    items: [{
        // title: _('Task List'),
        xtype: 'container',
        // xtype: 'panel',
        // frame: true,
        reference: 'task_list_panel',
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start'
        },
        items: [{
            xtype: 'grid',
            cls: 'shadow',
            bind: {
                store: '{task_list_grid_store}',
            },
            // store: store,
            title: _('Task List'),
            iconCls: 'x-fa fa-tasks',
            reference: 'task_list_grid',
            flex: 1,
            // forceFit: true, //列表宽度自适应
            columnLines: true,
            // split: true,
            height: null,
            autoScroll: true,
            // frame: true,
            selModel: {
                selType: 'checkboxmodel'
            },
            margin: '0 0 10 0',
            //border: false,
            columns: [
                //{ xtype: 'rownumberer', sortable: false, align: 'center' },
                //menuDisabled: true 右边不可选择列显示
                {
                    text: _('Task Name'),
                    dataIndex: 'task_name',
                    sortable: true,
                    flex: 1.5,
                    align: 'center'
                }, {
                    text: _('Template Name'),
                    dataIndex: 'template_name',
                    menuDisabled: true,
                    sortable: true,
                    flex: 1.3,
                    align: 'center'
                }, {
                    text: _('Task Status'),
                    dataIndex: 'task_status',
                    sortable: true,
                    flex: 0.75,
                    align: 'center',
                    renderer: function(value, metaData) {
                        value = value.toString(); //如果value为int型，则转化为string型
                        if (value == '0') {
                            metaData.style = 'color:#d9534f;';
                            return _('stopped');
                        } else if (value == '1') {
                            metaData.style = 'color:#5cb85c;';
                            return _('started');
                        } else {
                            metaData.style = 'color:#f0ad4e;';
                            return _('unknown');
                        }
                    }
                }, {
                    text: _('Task Cycle'),
                    dataIndex: 'task_cycle',
                    sortable: true,
                    flex: 0.75,
                    align: 'center',
                    renderer: function(value, metaData) {
                        value = value.toString(); //如果value为int型，则转化为string型
                        if (value == '0') {
                            return _('day');
                        } else if (value == '1') {
                            return _('week');
                        } else if (value == '2') {
                            return _('month');
                        } else if (value == '3') {
                            return _('regular');
                        }
                    }
                }, {
                    text: _('Specified Day'),
                    dataIndex: 'time_detail',
                    menuDisabled: true,
                    sortable: true,
                    flex: 0.8,
                    align: 'center',
                    renderer: function(value, metaData) {
                        var newValue;
                        if (metaData.value == _('week')) {
                            switch (value) {
                                case "1":
                                    newValue = _('monday');
                                    break;
                                case "2":
                                    newValue = _('tuesday');
                                    break;
                                case "3":
                                    newValue = _('wednesday');
                                    break;
                                case "4":
                                    newValue = _('thursday');
                                    break;
                                case "5":
                                    newValue = _('friday');
                                    break;
                                case "6":
                                    newValue = _('saturday');
                                    break;
                                case "7":
                                    newValue = _('sunday');
                                    break;
                                default:
                                    newValue = _('monday');
                                    break;
                            }
                        } else if (metaData.value == _('month')) {
                            newValue = value + _('th');
                            if (APP.lang == 'en_US') {
                                if (value == '2') {
                                    newValue = value + 'nd';
                                }
                                if (value == '3') {
                                    newValue = value + 'rd';
                                }
                            }
                        } else if (metaData.value == _('day')) {
                            newValue = "";
                        } else if (metaData.value == _('regular')) {
                            newValue = value;
                        }
                        return newValue;
                    }
                }, {
                    text: _('Task Execution Time'),
                    dataIndex: 'execute_time',
                    menuDisabled: true,
                    sortable: true,
                    flex: 1.3,
                    align: 'center'
                }, {
                    text: _('Creator'),
                    dataIndex: 'creater',
                    menuDisabled: true,
                    sortable: true,
                    flex: 1,
                    align: 'center'
                }, {
                    text: _('Created Time'),
                    dataIndex: 'create_time',
                    sortable: true,
                    flex: 1.3,
                    align: 'center'
                }, {
                    text: _('Modified Time'),
                    dataIndex: 'modify_time',
                    menuDisabled: true,
                    sortable: true,
                    flex: 1.3,
                    align: 'center'
                }

            ],

            viewConfig: {
                //Return CSS class to apply to rows depending upon data values
                emptyText: _('No data to display'),
                deferEmptyText: false,
                trackOver: false,
                stripeRows: false,
                getRowClass: function(record) {

                }
            },
            dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    fieldDefaults: {
                        labelWidth: 40,
                        maxWidth: 145,
                        labelAlign: "right",
                        buttonAlign: "right"
                    }, // The fields
                    items: [{
                            text: _('Create'),
                            iconCls: 'x-fa fa-plus',
                            handler: 'onAdd'
                        }, {
                            text: _('Detail'),
                            itemId: 'seeTaskDetailBtn',
                            iconCls: 'x-fa fa-square-o',
                            handler: 'onSeeDetail',
                            disabled: true
                        }, {
                            text: _('Modify'),
                            itemId: 'updateTaskBtn',
                            iconCls: 'x-fa fa-edit',
                            handler: 'onModify',
                            disabled: true
                        }, {
                            text: _('Delete'),
                            iconCls: 'x-fa fa-trash-o',
                            itemId: 'deleteTaskBtn',
                            disabled: true,
                            // bind: {
                            //     disabled: '{!taskListGrid.selection}'
                            // },
                            handler: 'onDelete'
                        }, {
                            text: _('Start'),
                            iconCls: 'x-fa fa-play-circle-o',
                            itemId: 'startTaskBtn',
                            disabled: true,
                            // bind: {
                            //     disabled: '{!taskListGrid.selection}'
                            // },
                            handler: 'onStart'
                        }, {
                            text: _('Stop'),
                            iconCls: 'x-fa fa-stop',
                            itemId: 'stopTaskBtn',
                            disabled: true,
                            // bind: {
                            //     disabled: '{!taskListGrid.selection}'
                            // },
                            handler: 'onStop'
                        }, '->', {
                            xtype: 'textfield',
                            fieldLabel: _('Task Name'),
                            labelWidth: APP.lang == 'zh_CN' ? 60 : 73,
                            name: 'task_name',
                            listeners: {
                                change: 'onKeyWordChange'
                            }
                        },
                        /*{
                                               tooltip: '查询',
                                               iconCls: 'x-fa fa-search',
                                               handler: 'onQuery'
                                           },*/
                        {
                            text: _('Refresh'),
                            iconCls: 'x-fa fa-refresh',
                            handler: 'onTaskGridRefresh'
                        }
                    ]
                }, {
                    xtype: 'pagingtoolbar',
                    dock: 'top',
                    inputItemWidth: 80,
                    displayInfo: true,
                    displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
                    emptyMsg: _("Empty"),
                    items: [
                        '-', {
                            fieldLabel: _('Page Size'),
                            xtype: 'combobox',
                            itemId: 'task_grid_pasesize',
                            width: 170,
                            padding: '0 0 0 5',
                            displayField: 'val',
                            valueField: 'val',
                            multiSelect: false,
                            editable: false,
                            labelWidth: APP.lang == 'zh_CN' ? 60 : 65,
                            store: Ext.create('Ext.data.Store', {
                                fields: [{
                                    name: 'val',
                                    type: 'int'
                                }],
                                data: [{
                                    val: 1
                                }, {
                                    val: 2
                                }, {
                                    val: 15
                                }, {
                                    val: 100
                                }, {
                                    val: 200
                                }, {
                                    val: 500
                                }, {
                                    val: 1000
                                }, ]
                            }),
                            value: 15,
                            listeners: {
                                change: function(me, newValue, oldValue, ops) {
                                    var grid = this.up('grid');
                                    Ext.apply(grid.store, {
                                        pageSize: newValue
                                    });
                                    this.up('pagingtoolbar').moveFirst();
                                }
                            }
                        }
                    ]
                }

            ], //dockedItems
            listeners: {
                rowclick: function(grid, record, tr, rowIndex, e, eOpts) {
                    var task_list_grid = this;
                    var result_list_grid_by_task = this.ownerCt.items.items[1];

                    var store = result_list_grid_by_task.store;
                    if (store) {
                        store.removeAll();
                    }

                    var updateTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('updateTaskBtn');
                    var startTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('startTaskBtn');
                    var stopTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('stopTaskBtn');
                    var deleteTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('deleteTaskBtn');
                    var seeTaskDetailBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('seeTaskDetailBtn');

                    result_list_grid_by_task.setHidden(true);

                    var sm = task_list_grid.getSelectionModel();
                    var rows = sm.getSelection();

                    var sameStatus = Reports.isSameStatus(rows); //判断是否为相同状态

                    if (rows.length == 0) { //没有选中任何项目的情况
                        updateTaskBtn.setDisabled(true);
                        startTaskBtn.setDisabled(true);
                        stopTaskBtn.setDisabled(true);
                        deleteTaskBtn.setDisabled(true);
                        seeTaskDetailBtn.setDisabled(true);
                        result_list_grid_by_task.setHidden(true);
                    } else if (rows.length > 1) { //多选的情况
                        updateTaskBtn.setDisabled(true);
                        seeTaskDetailBtn.setDisabled(true);
                        result_list_grid_by_task.setHidden(true);
                        task_list_grid.setHeight(null);
                        if (sameStatus == true) {
                            var status = rows[0].get('task_status').toString();
                            if (status == '0') { //获取任务状态为停止
                                // deleteTaskBtn.setDisabled(false);
                                startTaskBtn.setDisabled(false);
                                stopTaskBtn.setDisabled(true);
                            } else if (status == '1') { //获取任务状态为启动
                                // deleteTaskBtn.setDisabled(true); //已经启动的任务不允许删除
                                startTaskBtn.setDisabled(true);
                                stopTaskBtn.setDisabled(false);
                            }
                            deleteTaskBtn.setDisabled(false);
                        } else {
                            startTaskBtn.setDisabled(true);
                            stopTaskBtn.setDisabled(true);
                        }
                    } else if (rows.length == 1) { //单选
                        var status = rows[0].get('task_status').toString();
                        if (status == "0") { //获取任务状态为停止
                            // deleteTaskBtn.setDisabled(false);
                            startTaskBtn.setDisabled(false);
                            stopTaskBtn.setDisabled(true);
                        } else if (status == "1") { //获取任务状态为启动
                            // deleteTaskBtn.setDisabled(true); //已经启动的任务不允许删除
                            startTaskBtn.setDisabled(true);
                            stopTaskBtn.setDisabled(false);
                        }
                        deleteTaskBtn.setDisabled(false);
                        updateTaskBtn.setDisabled(false);
                        seeTaskDetailBtn.setDisabled(false);

                        // var result_store = generateResultStore(rows[0].get("task_id"));
                        // result_list_grid_by_task.setStore(result_store);

                        var result_store = result_list_grid_by_task.getStore();
                        result_store.proxy.url = '/reports/rest/report_task_result/getTaskResultInfo?task_id=' + rows[0].get("task_id");
                        // result_store.proxy.url = '/report/gettaskresultlist/page/' + rows[0].get("task_id"); //本地调试用
                        result_store.reload();

                        window.display_task_cycle = rows[0].get("task_cycle");
                        var task_name = rows[0].get("task_name");
                        var title = _('Result List') + " ( " + task_name + " )";
                        result_list_grid_by_task.setHidden(false);
                        result_list_grid_by_task.setTitle(title);
                        // task_list_grid.setHeight(330);
                    }

                },
                selectionchange: function(model, records) {
                    var task_list_grid = this;
                    var result_list_grid_by_task = this.ownerCt.items.items[1];

                    var updateTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('updateTaskBtn');
                    var startTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('startTaskBtn');
                    var stopTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('stopTaskBtn');
                    var deleteTaskBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('deleteTaskBtn');
                    var seeTaskDetailBtn = task_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('seeTaskDetailBtn');

                    var sm = task_list_grid.getSelectionModel();
                    var rows = sm.getSelection();

                    var hd_checker = task_list_grid.getEl().select('div.x-column-header-checkbox');
                    var hd = hd_checker.first();
                    if (hd != null) {
                        if (hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) { //x-grid-hd-checker-on
                            console.log("全选");
                            if (rows.length == 1) {
                                updateTaskBtn.setDisabled(false);
                                seeTaskDetailBtn.setDisabled(false);
                                //当任务列表只有一个任务时全选就是选中一个任务
                                var result_store = result_list_grid_by_task.getStore();

                                result_store.proxy.url = '/reports/rest/report_task_result/getTaskResultInfo?task_id=' + rows[0].get("task_id");
                                result_store.reload();

                                window.display_task_cycle = rows[0].get("task_cycle");
                                var task_name = rows[0].get("task_name");
                                var title = _('Result List') + " ( " + task_name + " )";
                                result_list_grid_by_task.setHidden(false);
                                result_list_grid_by_task.setTitle(title);
                                task_list_grid.setHeight(330);
                                //
                            } else if (rows.length > 1) {
                                updateTaskBtn.setDisabled(true);
                                seeTaskDetailBtn.setDisabled(true);
                                result_list_grid_by_task.setHidden(true);
                                task_list_grid.setHeight(null);
                            }

                            var sameStatus = Reports.isSameStatus(rows);
                            if (sameStatus == true) {
                                var status = rows[0].get('task_status').toString();
                                if (status == '0') {
                                    // startTaskBtn.setDisabled(false);
                                    stopTaskBtn.setDisabled(true);
                                    deleteTaskBtn.setDisabled(false);
                                } else if (status == '1') {
                                    startTaskBtn.setDisabled(true);
                                    stopTaskBtn.setDisabled(false);
                                    // deleteTaskBtn.setDisabled(true); //已经启动的任务不允许删除
                                }
                                startTaskBtn.setDisabled(false);
                            } else {
                                startTaskBtn.setDisabled(true);
                                stopTaskBtn.setDisabled(true);
                            }

                        } else if (!hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) {
                            console.log("全不选");
                            updateTaskBtn.setDisabled(true);
                            seeTaskDetailBtn.setDisabled(true);
                            startTaskBtn.setDisabled(true);
                            stopTaskBtn.setDisabled(true);
                            deleteTaskBtn.setDisabled(true);
                            result_list_grid_by_task.setHidden(true);
                            task_list_grid.setHeight(null);
                        }
                    }
                }
            }
            // end 分页
        }, {
            // store: store,
            xtype: 'grid',
            cls: 'shadow',
            title: _('Task List'),
            hidden: true,
            reference: 'result_list_grid_by_task',
            flex: 1,
            bind: {
                store: '{result_list_grid_by_task_store}',
            },
            // forceFit: true, //列表宽度自适应
            columnLines: true,
            // split: true,
            // frame: true,
            selModel: {
                selType: 'checkboxmodel'
            },
            // margin: '0 0 10 0',
            //border: false,
            columns: [
                //{ xtype: 'rownumberer', sortable: false, align: 'center' },
                //menuDisabled: true 右边不可选择列显示
                {
                    text: _('Task Name'),
                    dataIndex: 'task_name',
                    sortable: true,
                    flex: 2,
                    align: 'center'
                }, {
                    text: _('Report Name'),
                    dataIndex: 'report_name',
                    menuDisabled: true,
                    sortable: true,
                    flex: 2,
                    align: 'center'
                }, {
                    text: _('Start Time'),
                    dataIndex: 'start_time',
                    sortable: true,
                    flex: 1.75,
                    align: 'center'
                }, {
                    text: _('End Time'),
                    dataIndex: 'end_time',
                    menuDisabled: true,
                    sortable: true,
                    flex: 1.75,
                    align: 'center'
                }, {
                    text: _('Task Execution Result'),
                    dataIndex: 'execute_result',
                    sortable: true,
                    flex: 1.5,
                    align: 'center',
                    renderer: function(value, metaData) {
                        value = value.toString(); //如果value为int型，则转化为string型
                        if (value == '0') {
                            metaData.style = 'color:#d9534f;';
                            return _('failure');
                        } else if (value == '1') {
                            metaData.style = 'color:#5cb85c;';
                            return _('success');
                        } else {
                            metaData.style = 'color:#f0ad4e;';
                            return _('unknown');
                        }
                    }
                }, {
                    text: _('Time Consuming'),
                    dataIndex: 'time_consuming',
                    menuDisabled: true,
                    sortable: true,
                    flex: 1,
                    align: 'center'
                }

            ],

            viewConfig: {
                //Return CSS class to apply to rows depending upon data values
                emptyText: _('No data to display'),
                deferEmptyText: false,
                trackOver: false,
                stripeRows: false,
                getRowClass: function(record) {

                }
            },
            dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    fieldDefaults: {
                        labelWidth: 40,
                        maxWidth: 145,
                        labelAlign: "right",
                        buttonAlign: "right"
                    }, // The fields
                    items: [{
                        text: _('Download'),
                        itemId: 'taskResultDownloadBtn',
                        iconCls: 'x-fa fa-download',
                        disabled: true,
                        handler: 'onDownLoad'
                    }, {
                        text: _('Preview'),
                        itemId: 'taskResultPreviewBtn',
                        iconCls: 'x-fa fa-eye',
                        disabled: true,
                        handler: 'onPreview'
                    }, '->', {
                        text: _('Refresh'),
                        iconCls: 'x-fa fa-refresh',
                        handler: 'onResultGridByTaskRefresh'
                    }]
                }, {
                    xtype: 'pagingtoolbar',
                    dock: 'top',
                    inputItemWidth: 80,
                    displayInfo: true,
                    displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
                    emptyMsg: _("Empty"),
                    items: [
                        '-', {
                            fieldLabel: _('Page Size'),
                            xtype: 'combobox',
                            itemId: 'result_list_grid_by_task_pagesize',
                            width: 170,
                            padding: '0 0 0 5',
                            displayField: 'val',
                            valueField: 'val',
                            multiSelect: false,
                            editable: false,
                            labelWidth: APP.lang == 'zh_CN' ? 60 : 65,
                            store: Ext.create('Ext.data.Store', {
                                fields: [{
                                    name: 'val',
                                    type: 'int'
                                }],
                                data: [{
                                    val: 1
                                }, {
                                    val: 2
                                }, {
                                    val: 15
                                }, {
                                    val: 100
                                }, {
                                    val: 200
                                }, {
                                    val: 500
                                }, {
                                    val: 1000
                                }, ]
                            }),
                            value: 15,
                            listeners: {
                                change: function(me, newValue, oldValue, ops) {
                                    var grid = this.up('grid');
                                    Ext.apply(grid.store, {
                                        pageSize: newValue
                                    });
                                    this.up('pagingtoolbar').moveFirst();
                                }
                            }
                        }
                    ]
                }

            ], //dockedItems
            listeners: {
                rowclick: function(grid, record, tr, rowIndex, e, eOpts) {
                    var result_list_grid_by_task = this;

                    var taskResultDownloadBtn = result_list_grid_by_task.getDockedItems('toolbar[dock="top"]')[0].getComponent('taskResultDownloadBtn');
                    var taskResultPreviewBtn = result_list_grid_by_task.getDockedItems('toolbar[dock="top"]')[0].getComponent('taskResultPreviewBtn');

                    var sm = result_list_grid_by_task.getSelectionModel();
                    var rows = sm.getSelection();

                    if (rows.length > 1 || rows.length == 0) { //多选或无选择的情况
                        taskResultDownloadBtn.setDisabled(true);
                        taskResultPreviewBtn.setDisabled(true);
                    } else if (rows.length == 1) {
                        if (rows[0].get('execute_result') == '1') {
                            taskResultDownloadBtn.setDisabled(false);
                            taskResultPreviewBtn.setDisabled(false);
                        } else {
                            taskResultDownloadBtn.setDisabled(true);
                            taskResultPreviewBtn.setDisabled(true);
                        }
                    }

                },
                selectionchange: function(model, records) {
                    var result_list_grid_by_task = this;

                    var taskResultDownloadBtn = result_list_grid_by_task.getDockedItems('toolbar[dock="top"]')[0].getComponent('taskResultDownloadBtn');
                    var taskResultPreviewBtn = result_list_grid_by_task.getDockedItems('toolbar[dock="top"]')[0].getComponent('taskResultPreviewBtn');
                    var hd_checker = result_list_grid_by_task.getEl().select('div.x-column-header-checkbox');
                    var hd = hd_checker.first();
                    if (hd != null) {
                        if (hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) { //x-grid-hd-checker-on
                            console.log("全选");
                            taskResultDownloadBtn.setDisabled(true);
                            taskResultPreviewBtn.setDisabled(true);
                        } else if (!hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) {
                            console.log("全不选");
                            taskResultDownloadBtn.setDisabled(true);
                            taskResultPreviewBtn.setDisabled(true);
                        }
                    }
                }
            }
            // end 分页
        }]
    }, {
        xtype: 'form',
        cls: 'shadow',
        border: false,
        margin: '5 0 0 0',
        title: _('Create Task'),
        reference: 'add_task_panel',
        // collapsible: true,
        // frame: true,
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start'
        },
        items: [{
            xtype: 'fieldset',
            title: _('Basic Info'),
            margin: '10 10 0 10', //上右下左
            layout: "hbox",
            fieldDefaults: {
                labelWidth: 115, //最小宽度  55
                labelAlign: "right"
            }, // The fields
            items: [{
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                defaultType: 'textfield',
                items: [{
                        fieldLabel: _('Task Name'),
                        name: 'task_name',
                        maxLength: 15,
                        width: 314,
                        allowBlank: false,
                        afterLabelTextTpl: [
                            '<span style="color:red;font-weight:bold" data-qtip="必填项">*</span>'
                        ]
                    }, {
                        xtype: "combobox",
                        name: "task_cycle",
                        fieldLabel: _('Task Cycle'),
                        displayField: 'task_cycle_name',
                        valueField: 'task_cycle',
                        multiSelect: false,
                        editable: false,
                        // margin: '10 0 0 0', //上右下左
                        width: 314,
                        bind: {
                            store: '{task_cycle_store}'
                        },
                        value: '1',
                        listeners: {
                            'change': function(combobox, newValue, oldValue, eOpts) {
                                console.log("oldValue: " + oldValue);
                                console.log("newValue: " + newValue);
                                /*                                var week_data = [{
                                                                    'time_detail': '1',
                                                                    'time_detail_name': _('monday')
                                                                }, {
                                                                    'time_detail': '2',
                                                                    'time_detail_name': _('tuesday')
                                                                }, {
                                                                    'time_detail': '3',
                                                                    'time_detail_name': _('wednesday')
                                                                }, {
                                                                    'time_detail': '4',
                                                                    'time_detail_name': _('thursday')
                                                                }, {
                                                                    'time_detail': '5',
                                                                    'time_detail_name': _('friday')
                                                                }, {
                                                                    'time_detail': '6',
                                                                    'time_detail_name': _('saturday')
                                                                }, {
                                                                    'time_detail': '7',
                                                                    'time_detail_name': _('sunday')
                                                                }];

                                                                var month_data = [{
                                                                    'time_detail': '1',
                                                                    'time_detail_name': '1' + _('th')
                                                                }, {
                                                                    'time_detail': '2',
                                                                    'time_detail_name': '2' + _('th')
                                                                }, {
                                                                    'time_detail': '3',
                                                                    'time_detail_name': '3' + _('th')
                                                                }, {
                                                                    'time_detail': '4',
                                                                    'time_detail_name': '4' + _('th')
                                                                }, {
                                                                    'time_detail': '5',
                                                                    'time_detail_name': '5' + _('th')
                                                                }, {
                                                                    'time_detail': '6',
                                                                    'time_detail_name': '6' + _('th')
                                                                }, {
                                                                    'time_detail': '7',
                                                                    'time_detail_name': '7' + _('th')
                                                                }, {
                                                                    'time_detail': '8',
                                                                    'time_detail_name': '8' + _('th')
                                                                }, {
                                                                    'time_detail': '9',
                                                                    'time_detail_name': '9' + _('th')
                                                                }, {
                                                                    'time_detail': '10',
                                                                    'time_detail_name': '10' + _('th')
                                                                }, {
                                                                    'time_detail': '11',
                                                                    'time_detail_name': '11' + _('th')
                                                                }, {
                                                                    'time_detail': '12',
                                                                    'time_detail_name': '12' + _('th')
                                                                }, {
                                                                    'time_detail': '13',
                                                                    'time_detail_name': '13' + _('th')
                                                                }, {
                                                                    'time_detail': '14',
                                                                    'time_detail_name': '14' + _('th')
                                                                }, {
                                                                    'time_detail': '15',
                                                                    'time_detail_name': '15' + _('th')
                                                                }, {
                                                                    'time_detail': '16',
                                                                    'time_detail_name': '16' + _('th')
                                                                }, {
                                                                    'time_detail': '17',
                                                                    'time_detail_name': '17' + _('th')
                                                                }, {
                                                                    'time_detail': '18',
                                                                    'time_detail_name': '18' + _('th')
                                                                }, {
                                                                    'time_detail': '19',
                                                                    'time_detail_name': '19' + _('th')
                                                                }, {
                                                                    'time_detail': '20',
                                                                    'time_detail_name': '20' + _('th')
                                                                }, {
                                                                    'time_detail': '21',
                                                                    'time_detail_name': '21' + _('th')
                                                                }, {
                                                                    'time_detail': '22',
                                                                    'time_detail_name': '22' + _('th')
                                                                }, {
                                                                    'time_detail': '23',
                                                                    'time_detail_name': '23' + _('th')
                                                                }, {
                                                                    'time_detail': '24',
                                                                    'time_detail_name': '24' + _('th')
                                                                }, {
                                                                    'time_detail': '25',
                                                                    'time_detail_name': '25' + _('th')
                                                                }, {
                                                                    'time_detail': '26',
                                                                    'time_detail_name': '26' + _('th')
                                                                }, {
                                                                    'time_detail': '27',
                                                                    'time_detail_name': '27' + _('th')
                                                                }, {
                                                                    'time_detail': "28",
                                                                    'time_detail_name': '28' + _('th')
                                                                }, {
                                                                    'time_detail': '29',
                                                                    'time_detail_name': '29' + _('th')
                                                                }, {
                                                                    'time_detail': '30',
                                                                    'time_detail_name': '30' + _('th')
                                                                }];*/
                                var add_task_base_fieldset = this.up('fieldset');
                                var time_detail_combox = add_task_base_fieldset.items.items[1].items.items[1]; //
                                if (newValue == '0' || newValue == '3') {
                                    time_detail_combox.setDisabled(true);
                                } else if (newValue == '1') {
                                    time_detail_combox.setDisabled(false);
                                    var store = time_detail_combox.getStore();
                                    if (store) {
                                        store.removeAll();
                                    }
                                    store.proxy.url = '/report/gettimedetaillist/week/' + APP.lang;
                                    store.reload({
                                        callback: function(r, scope, success) {
                                            if (success) {
                                                // if (!window.task_action || window.task_action == 'see' || window.task_action == 'add') {
                                                //     time_detail_combox.setValue("1");
                                                // } else if (window.task_action == 'modify' && window.time_detail) {
                                                //     time_detail_combox.setValue(window.time_detail);
                                                // }
                                                if (window.task_action == 'modify' && window.time_detail) {
                                                    time_detail_combox.setValue(window.time_detail); //time_detail要特殊处理
                                                } else {
                                                    time_detail_combox.setValue("1");
                                                }
                                            }
                                        }
                                    });
                                    // store.loadData(window.week_data);
                                    // time_detail_combox.setStore(time_detail_week_store);
                                } else if (newValue == '2') {
                                    time_detail_combox.setDisabled(false);
                                    var store = time_detail_combox.getStore();
                                    if (store) {
                                        store.removeAll();
                                    }
                                    store.proxy.url = '/report/gettimedetaillist/month/' + APP.lang;
                                    store.reload({
                                        callback: function(r, scope, success) {
                                            if (success) {
                                                // if (!window.task_action || window.task_action == 'see' || window.task_action == 'add') {
                                                //     time_detail_combox.setValue("1");
                                                // } else if (window.task_action == 'modify' && window.time_detail) {
                                                //     time_detail_combox.setValue(window.time_detail);
                                                // }
                                                if (window.task_action == 'modify' && window.time_detail) {
                                                    time_detail_combox.setValue(window.time_detail);
                                                } else {
                                                    time_detail_combox.setValue("1");
                                                }
                                            }
                                        }
                                    });
                                    // time_detail_combox.setStore(time_detail_month_store);
                                    // time_detail_combox.setValue("1");
                                }
                            }
                        }
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        margin: '0 0 10 0',
                        items: [{
                            xtype: 'sysclockfield',
                            fieldLabel: _('Execution Time'),
                            name: 'execute_time',
                            width: 314,
                            value: Reports.formatClockTime(new Date()),
                            allowBlank: false,
                            afterLabelTextTpl: [
                                '<span style="color:red;font-weight:bold" data-qtip="必填项">*</span>'
                            ]
                        }]
                    }
                    ,{
                    xtype: 'button',
                    //itemId:'params_setting_button',
                    id:'params_setting_button',
                    margin: '0 0 0 24', //上右下左
                    text: '接口参数',
                    hidden:true,
                    iconCls: 'x-fa fa-gear',
                    handler: 'goToParamsPage'
                }
                ]
            }, {
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                margin: '0 0 0 25',
                items: [{
                    xtype: "combobox",
                    name: "template_id",
                    fieldLabel: _('Template Name'),
                    displayField: 'template_name',
                    valueField: 'template_id',
                    multiSelect: false,
                    editable: false,
                    width: 314,
                    // allowBlank: false,
                    emptyText: _('Please select a template'),
                    afterLabelTextTpl: [
                        '<span style="color:red;font-weight:bold" data-qtip="必填项">*</span>'
                    ],
                    bind: {
                        store: '{all_template_list_store}'
                    },
                    listeners:{
                       'change':function(group, newValue, oldValue, eOpts) {
                        var store_data=group.getStore();

                         for(var i=0;i<store_data.getCount();i++){
                        if (store_data.getAt(i).get("template_id")==newValue) {
                            if (store_data.getAt(i).get("is_params_exists")==1) {
                               group.up("form").down("#params_setting_button").setHidden(false);
                            }else{
                                group.up("form").down("#params_setting_button").setHidden(true);
                            }
                        }
                            
                        }
                
                      }
                    }
                },{
                    xtype: "combobox",
                    name: "time_detail",
                    fieldLabel: _('Specified Day'),
                    displayField: 'time_detail_name',
                    valueField: 'time_detail',
                    multiSelect: false,
                    editable: false,
                    width: 314,
                    bind: {
                        store: '{time_detail_store}'
                    },
                    value: '1'
                }]
            },{
               itemId:"language_type",
               xtype:"textfield",
               name:"language_type",
               hidden:true
            },{
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                // margin: '0 0 10 0',
                items: [{
                    xtype: "combobox",
                    name: "report_type",
                    fieldLabel: _('Report Type'),
                    displayField: 'report_type_name',
                    valueField: 'report_type',
                    //multiSelect: true,
                    editable: false,
                    width: 314,
                    bind: {
                        store: '{report_type_store}'
                    },
                    value: '0'
                }, {
                    xtype: 'radiogroup',
                    fieldLabel: _('Task Status'),
                    // margin: '10 0 10 0', //上右下左
                    columns: 2,
                    items: [{
                        boxLabel: _('started'),
                        margin: '0 0 0 5', //上右下左
                        name: 'task_status',
                        inputValue: '1',
                        checked: true
                    }, {
                        boxLabel: _('stopped'),
                        margin: '0 0 0 5', //上右下左
                        name: 'task_status',
                        inputValue: '0'
                            // checked: true
                    }]
                }]
            }]
        }, {
            xtype: 'fieldset',
            title: _('Media Info'),
            margin: '10 10 0 10', //上右下左
            layout: "hbox",
            fieldDefaults: {
                labelWidth: 120, //最小宽度  55
                labelAlign: "right"
            }, // The fields
            items: [{
                xtype: "container",
                layout: "vbox",
                defaultType: 'textfield',
                items: [{
                    xtype: 'radiogroup',
                    reference: 'mail_rg',
                    fieldLabel: _('Mail Configuration'),
                    margin: '10 0 10 0', //上右下左
                    columns: 2,
                    items: [{
                        boxLabel: _('Yes'),
                        margin: '0 0 0 5', //上右下左
                        name: 'is_mail_config',
                        inputValue: '1'
                            // checked: true
                    }, {
                        boxLabel: _('No'),
                        margin: '0 0 0 5', //上右下左
                        name: 'is_mail_config',
                        inputValue: '0',
                        checked: true
                    }],
                    listeners: {
                        'change': function(group, newValue, oldValue, eOpts) {
                            console.log("oldValue: " + oldValue["is_mail_config"]);
                            console.log("newValue: " + newValue["is_mail_config"]);
                            var mts = this.ownerCt.items.items;
                            if (newValue["is_mail_config"] == '0') {
                                for (var i = 1; i < mts.length; i++) {
                                    mts[i].setDisabled(true);
                                    mts[i].allowBlank = true;
                                }
                            } else if (newValue["is_mail_config"] == '1') {
                                for (var i = 1; i < mts.length; i++) {
                                    mts[i].setDisabled(false);
                                    //mts[i].allowBlank = false;
                                }
                                 mts[1].allowBlank = false;

                            }
                            var rg = this.items.items;
                            rg.forEach(function(radio) {
                                if (radio.inputValue == newValue["is_mail_config"]) {
                                    console.log("当前选中", radio.boxLabel);
                                }
                            });
                        }
                    }
                }, {
                    fieldLabel: _('To'),
                    name: 'email_address',
                    vtype: 'email', // applies email validation rules to this field
                    vtypeText: _('It is not a valid mail address'), //错误提示信息
                    width: 314,
                    disabled: true
                }, /*{
                    fieldLabel: _('Subject'),
                    name: 'email_topic',
                    width: 314,
                    emptyText: _('Task Name') + ':xxx;' + _('Start Time') + ':xxx',
                    disabled: true
                },*/ {
                    xtype: "combobox",
                    name: "email_topic",
                    fieldLabel: _('Subject'),
                    displayField: 'field_name',
                    emptyText: ('任务名称,开始时间'),
                    id:'email_topic',
                    valueField: 'field_id',
                    multiSelect: true,
                    editable: false,
                    width: 314,
                    bind: {
                        store: '{basic_field_store}'
                    },
                    disabled: true
                    // value: '0'
                }, {
                    xtype: "combobox",
                    name: "email_content",
                    fieldLabel: _('Content'),
                    displayField: 'field_name',
                    valueField: 'field_id',
                    emptyText: ('任务执行结果,耗时'),
                    id:'email_content',
                    multiSelect: true,
                    editable: false,
                    width: 314,
                    bind: {
                        store: '{basic_field_store}'
                    },


                    disabled: true
                    // value: '0'
                }, {
                    fieldLabel: _('Remark'),
                    name: 'remark',
                    width: 314,
                    disabled: true
                }]
            }, {
                xtype: "container",
                layout: "vbox",
                defaultType: 'textfield',
                margin: '0 0 0 25',
                items: [{
                    xtype: 'radiogroup',
                    fieldLabel: _('FTP Configuration'),
                    margin: '10 0 10 0', //上右下左
                    columns: 2,
                    items: [{
                        boxLabel: _('Yes'),
                        margin: '0 0 0 5', //上右下左
                        name: 'is_ftp_config',
                        inputValue: '1'
                            // checked: true
                    }, {
                        boxLabel: _('No'),
                        margin: '0 0 0 5', //上右下左
                        name: 'is_ftp_config',
                        inputValue: '0',
                        checked: true
                    }],
                    listeners: {
                        'change': function(group, newValue, oldValue, eOpts) {
                            console.log("oldValue: " + oldValue["is_ftp_config"]);
                            console.log("newValue: " + newValue["is_ftp_config"]);
                            var fts = this.ownerCt.items.items;
                            var fts_sibling = this.ownerCt.nextSibling().items.items;
                            if (newValue["is_ftp_config"] == '0') {
                                for (var i = 1; i < fts.length; i++) {
                                    fts[i].setDisabled(true);
                                    fts[i].allowBlank = true;
                                }
                                for (var j = 1; j < fts_sibling.length; j++) {
                                    fts_sibling[j].setDisabled(true);
                                    fts_sibling[j].allowBlank = true;
                                }
                            } else if (newValue["is_ftp_config"] == '1') {
                                for (var i = 1; i < fts.length; i++) {
                                    fts[i].setDisabled(false);
                                    fts[i].allowBlank = false;
                                }
                                for (var j = 1; j < fts_sibling.length; j++) {
                                    fts_sibling[j].setDisabled(false);
                                    fts_sibling[j].allowBlank = false;
                                }
                            }
                            var rg = this.items.items;
                            rg.forEach(function(radio) {
                                if (radio.inputValue == newValue["is_ftp_config"]) {
                                    console.log("当前选中", radio.boxLabel);
                                }
                            });
                        }
                    }
                }, {
                    fieldLabel: _('IP Address'),
                    name: 'ip',
                    vtype: 'IPAddress', // applies email validation rules to this field
                    vtypeText: _('It is not a valid ip address'), //错误提示信息
                    width: 314,
                    disabled: true
                }, {
                    fieldLabel: _('Port'),
                    name: 'port',
                    regex: /^[1-9]\d*$/,
                    regexText: _('Please Input positive integer'),
                    width: 314,
                    disabled: true
                }, {
                    fieldLabel: _('Path'),
                    name: 'ftp_path',
                    width: 314,
                    disabled: true
                }]
            }, {
                xtype: "container",
                layout: "vbox",
                // margin: '52 0 0 0',
                defaultType: 'textfield',
                items: [{
                    xtype: 'radiogroup',
                    fieldLabel: 'hhh', //隐藏占位
                    margin: '10 0 10 0', //上右下左
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
                    fieldLabel: _('User Name'),
                    name: 'username',
                    width: 314,
                    disabled: true
                }, {
                    fieldLabel: _('Password'),
                    inputType: 'password',
                    name: 'password',
                    width: 314,
                    disabled: true
                }]
            }]
        }, {
            xtype: 'textfield',
            name: 'operate_type',
            reference:'operate_type',
            hidden: true
        }, {
            xtype: 'textfield',
            name: 'params_identify_id',
            hidden: true
        }],
        // dockedItems: [{
        //     xtype: 'toolbar',
        //     dock: 'top',
        //     margin: '0 0 -5 0',
        //     items: ['->', {
        //         text: '返回任务列表',
        //         iconCls: 'x-fa fa-reply',
        //         handler: 'backToTaskListPage'
        //     }]
        // }],
        buttons: [{
            xtype: "button",
            iconCls: 'x-fa fa-undo',
            text: _('Reset'),
            handler: 'addOrModifyTaskReset'
        }, {
            xtype: "button",
            iconCls: 'x-fa fa-close',
            text: _('Cancel'),
            handler: 'backToTaskListPage'
        }, {
            xtype: "button",
            iconCls: 'x-fa fa-save',
            text: _('Submit'),
            margin: '0 10 0 0',
            handler: 'addOrModifyTaskSubmit',
            formBind: true
        }]
    }, {
        xtype: 'form',
        border: false,
        title: _('Task Detail'),
        reference: 'see_task_panel',
        // collapsible: true,
        // frame: true,
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start'
        },
        items: [{
            xtype: 'fieldset',
            title: _('Basic Info'),
            margin: '5 10 0 10', //上右下左
            layout: "hbox",
            fieldDefaults: {
                labelWidth: APP.lang == 'zh_CN' ? 80 : 115, //最小宽度  55
                labelAlign: "right",
                // margin: '0 0 -3 0'
            }, // The fields
            items: [{
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                defaultType: 'textfield',
                defaults: {
                    inputWrapCls: '',
                    triggerWrapCls: '',
                    fieldStyle: 'background:none',
                    readOnly: true
                },
                items: [{
                        fieldLabel: _('Task Name'),
                        name: 'task_name'
                    }, {
                        name: "task_cycle",
                        fieldLabel: _('Task Cycle'),
                        itemId: "task_cycle"
                    }, {
                        name: "task_status",
                        fieldLabel: _('Task Status')
                    },
                    {
                                       xtype: 'button',
                                       id:'detail_params_button',
                                       margin: '0 0 0 24', //上右下左
                                       text: '接口参数',
                                       iconCls: 'x-fa fa-gear',
                                       handler: 'goToParamsPage',
                                       hidden: true
                                   }
                ]
            }, {
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                defaultType: 'textfield',
                defaults: {
                    inputWrapCls: '',
                    triggerWrapCls: '',
                    fieldStyle: 'background:none',
                    readOnly: true
                },
                items: [{
                    name: "template_name",
                    fieldLabel: _('Template Name')
                }, {
                    name: "time_detail",
                    fieldLabel: _('Specified Day')
                }]
            }, {
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                defaultType: 'textfield',
                defaults: {
                    inputWrapCls: '',
                    triggerWrapCls: '',
                    fieldStyle: 'background:none',
                    readOnly: true
                },
                items: [{
                    name: "report_type",
                    fieldLabel: _('Report Type')
                }, {
                    name: 'execute_time',
                    fieldLabel: _('Execution Time')
                }]
            }]
        }, {
            xtype: 'fieldset',
            title: _('Media Info'),
            margin: '5 10 0 10', //上右下左
            layout: "hbox",
            fieldDefaults: {
                labelWidth: APP.lang == 'zh_CN' ? 80 : 115, //最小宽度  55
                labelAlign: "right",
                // margin: '0 0 -3 0'
            }, // The fields
            items: [{
                xtype: "container",
                layout: "vbox",
                flex: 3.33,
                defaultType: 'textfield',
                defaults: {
                    inputWrapCls: '',
                    triggerWrapCls: '',
                    fieldStyle: 'background:none',
                    readOnly: true
                },
                items: [{
                    fieldLabel: _('Mail Configuration'),
                    labelSeparator: ''
                        // name: 'is_mail_config',
                        // renderer: function(value, metaData) {
                        //     if (value == '0') {
                        //         return "否";
                        //     } else if (value == '1') {
                        //         return "是";
                        //     }
                        // }
                }, {
                    fieldLabel: _('To'),
                    name: 'email_address'
                }, {
                    fieldLabel: _('Subject'),
                    name: 'email_topic'
                }, {
                    fieldLabel: _('Content'),
                    name: 'email_content'
                }]
            }, {
                xtype: "container",
                layout: "vbox",
                defaultType: 'textfield',
                defaults: {
                    inputWrapCls: '',
                    triggerWrapCls: '',
                    fieldStyle: 'background:none',
                    readOnly: true
                },
                flex: 3.33,
                items: [{
                    fieldLabel: _('FTP Configuration'),
                    labelSeparator: ''
                }, {
                    fieldLabel: _('IP Address'),
                    name: 'ip'
                }, {
                    fieldLabel: _('Port'),
                    name: 'port'
                }, {
                    fieldLabel: _('Path'),
                    name: 'ftp_path'
                        // margin: '0 0 5 0'
                }]
            }, {
                xtype: "container",
                layout: "vbox",
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
                    fieldLabel: _('User Name'),
                    name: 'username'
                }, {
                    fieldLabel: _('Password'),
                    name: 'password',
                }]
            }]
        }, {
            xtype: 'textfield',
            name: 'operate_type',
            hidden: true
        }, {
            xtype: 'textfield',
            name: 'params_identify_id',
            hidden: true
        }],
        buttons: [{
                text: _('Back'),
                iconCls: 'x-fa fa-reply',
                margin: '0 10 0 0',
                handler: 'backToTaskListPage'
            }]
            // dockedItems: [{
            //     xtype: 'toolbar',
            //     dock: 'top',
            //     margin: '0 0 -5 0',
            //     items: ['->', {
            //         text: '返回任务列表',
            //         iconCls: 'x-fa fa-reply',
            //         handler: 'backToTaskListPage'
            //     }]
            // }]
    }, {
        xtype: 'form',
        border: false,
        margin: '5 0 0 0',
        title: '接口参数设置',
        reference: 'set_params_panel',
        // collapsible: true,
        // frame: true,
        layout: "hbox",
        fieldDefaults: {
            labelWidth: 80, //最小宽度  55
            labelAlign: "right"
        }, // The fields
        items: [{
            xtype: "container",
            layout: "vbox",
            defaultType: 'textfield',
            items: [{
                fieldLabel: '参数1',
                name: 'params1',
                width: 314
            }, {
                fieldLabel: '参数3',
                name: 'params3',
                width: 314
            }]
        }, {
            xtype: "container",
            layout: "vbox",
            defaultType: 'textfield',
            items: [{
                fieldLabel: '参数2',
                name: 'params2',
                width: 314
            }, {
                fieldLabel: '参数4',
                name: 'params4',
                width: 314
            }]
        }],
        // dockedItems: [{
        //     xtype: 'toolbar',
        //     dock: 'top',
        //     items: ['->', {
        //         text: '返回任务创建页面',
        //         iconCls: 'x-fa fa-reply',
        //         handler: 'backToAddTaskPage'
        //     }, {
        //         text: '返回任务列表',
        //         iconCls: 'x-fa fa-reply',
        //         handler: 'backToTaskListPage'
        //     }]
        // }],

        buttons: [{
            xtype: "button",
            text: _('Reset'),
            handler: 'resetParams'
        }, {
            text: _('Cancel'),
            iconCls: 'x-fa fa-close',
            handler: 'backToAddTaskPage'
        }, {
            xtype: "button",
            text: _('Submit'),
            margin: '0 10 0 0',
            handler: 'submitParams'
        }]
    },{
        xtype: 'reportMainView',
        border: false,
        margin: '5 0 0 0',
        //title: '接口参数设置',
        reference: 'param_setting_panel',
        // // collapsible: true,
        // // frame: true,
        // layout: "hbox",
        // fieldDefaults: {
        //     labelWidth: 80, //最小宽度  55
        //     labelAlign: "right"
        // }
    }]
});