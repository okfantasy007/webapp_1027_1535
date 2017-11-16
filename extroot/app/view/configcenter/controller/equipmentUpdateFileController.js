Ext.define('Admin.view.configcenter.controller.equipmentUpdateFileController', {
    extend: 'Admin.view.configcenter.model.grid_toolBar.CRUD',
    alias: 'controller.equipmentUpdateFileController',
    requires: [
        'Admin.view.configcenter.model.grid_toolBar.CRUD',
        'Admin.view.configcenter.view.equipmentUpdate.file.veneer.veneerInputNElocalFile',
        'Admin.view.configcenter.view.equipmentUpdate.file.veneer.veneerMainFormWindow',
        'Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentUpdateFileMainFormWindow',
        'Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentInputNElocalFile',
        'Admin.view.configcenter.view.equipmentUpdate.file.equipment.backupFileChooseWindow',
        'Admin.view.configcenter.view.equipmentUpdate.file.veneer.backupFileChooseWindow',
    ],
    // routes: {
    //     ':v1': 'onRouteChange',
    //     ':v1/:v2': 'onRouteChange',
    //     ':v1/:v2/:v3': 'onRouteChange',
    //     ':v1/:v2/:v3/:v4': 'onRouteChange',
    //     ':v1/:v2/:v3/:v4/:v5': 'onRouteChange',
    //     ':v1/:v2/:v3/:v4/:v5/:v6': 'onRouteChange',
    //     ':v1/:v2/:v3/:v4/:v5/:v6/:v7': 'onRouteChange',
    //     ':v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8': 'onRouteChange'
    // },
    // onRouteChange: function (v1, v2, v3) {
    //     //var pathname = window.location.pathname;
    //     console.log(v1);
    //     console.log(v2);
    //     // this.allStop = true;

    // },
    getBackupGrid: function () {
        var me = this,
            grid = me.getView().down('#backupGrid');
        return grid;
    },
    getBackupRemarkForm: function () {
        var me = this,
            form = me.getView().down('#backupRemarkForm');
        return form;
    },
    getFileGrid: function () {
        var me = this,
            grid = me.getView().down('#fileGrid');
        return grid;
    },
    getEditForm: function () {
        var me = this,
            form = me.getView().down('#editForm');
        return form;
    },
    // getSet
    //返回上个界面

    //导入备份文件
    importBackupFile: function () {
        var me = this,
            grid = me.getBackupGrid(),
            form = grid.down('form');
        // levelId = grid.levelId;
        this.setResetRecord(form);
        me.getView().setActiveItem(1);
    },
    //导入备份文件 grid --选择
    onChoose: function () {
        var me = this,
            grid = me.getBackupGrid(),
            form = me.getBackupRemarkForm(),
            record = grid.getSelectionModel().getSelection()[0];
        form.getForm().loadRecord(record);
        me.getView().setActiveItem(4);
    },
    onBackupFileGridClick: function (me, record) {
        var grid = this.getBackupGrid(),
            selCnt = me.getSelectionModel().getSelection().length,
            chooseBtn = grid.down('#theChooseBtn');
        if (selCnt == 1) {
            chooseBtn.setDisabled(false);
        } else {
            chooseBtn.setDisabled(true);
        }
    },
    //选择备份文件添加描述提交
    onBackupFileRemark: function () {
        var me = this,
            form = this.getBackupRemarkForm(),
            levelId = form.levelId,
            grid = me.getBackupGrid(),
            fileGrid = me.getFileGrid();
        if (form.getForm().isValid()) {
            form.getForm().submit({
                url: 'confcenter/configcenter/upgrade/ne/file/importbackup',
                //url: '/configcenter/equipmentUpdate/equipmentFile/download',
                waitTitle: '连接中',
                waitMsg: '传送数据...',
                success: function (form, action) {
                    var respText = Ext.util.JSON.decode(action.response.responseText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Success'));
                        grid.store.reload();
                        me.getView().setActiveItem(levelId);
                        fileGrid.store.reload();
                    } else {
                        me.failureMessage(causeid);
                    }
                },
                failure: function (resp, opts) {
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
    //导入本地文件
    inputLocalFile: function () {
        this.getView().setActiveItem(2);
        this.setResetRecord(this.getView().down('#inputNElocalFileForm'));
    },
    //导入本地文件表单--提交
    onLocalFormSubmit: function () {
        var inputNElocalFileForm = this.getView().down('#inputNElocalFileForm');
        var me = this;
        if (inputNElocalFileForm.getForm().isValid()) {
            inputNElocalFileForm.getForm().submit({
                url: '/confcenterU/configcenter/upgrade/ne/file/importlocal',
                waitTitle: '连接中',
                waitMsg: '传送数据...',
                success: function (form, action) {
                    var respText = Ext.util.JSON.decode(action.response.responseText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Inport Success'));
                        grid.store.reload();
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
    //主grid更新
    onEdit: function (btn) {
        var me = this,
            grid = me.getFileGrid(),
            form = me.getEditForm(),
            record = grid.getSelectionModel().getSelection();
        if (record.length == 1) {
            form.getForm().loadRecord(record[0]);
            this.getView().setActiveItem(3);
        } else {
            return;
        }

    },
    onItemClick: function (me, record) {
        var grid = this.getFileGrid(),
            selCnt = grid.getSelectionModel().getSelection().length,
            editBtn = grid.down('#theEditBtn');
        // downloadBtn = grid.down('#theDownloadBtn');
        if (selCnt == 1) {
            editBtn.setDisabled(false);
            //downloadBtn.setDisabled(false);

        } else {
            editBtn.setDisabled(true);
            //downloadBtn.setDisabled(true);
        }
    },
    renderer: function (btn) {
        btns = this.getViewModel().get('btns');
        btns.push(btn);
    },
    //更新提交
    onEditSub: function () {
        var me = this,
            form = me.getEditForm(),
            remark = form.down('#discription').getValue(),
            grid = me.getFileGrid(),
            softId = grid.getSelectionModel().getSelection()[0].get('softId');
        if (form.getForm().isValid()) {
            Ext.Ajax.request({
                method: 'GET',
                url: '/confcenter/configcenter/upgrade/ne/file/updatedesc',
                params: {
                    'softId': softId,
                    'remark': remark
                },
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Update Completed'));
                        grid.store.reload();
                    } else {
                        me.failureMessage(causeid);
                    }
                    form.reset();
                    me.getView().setActiveItem(0);
                },
                failure: function (resp, opts) {
                    Ext.Msg.alert(_('Tips'), _('Request Error'));
                }
            });
        } else {
            Ext.MessageBox.alert(_('Tips!'), _('Please Check The Input Content'));
        }
    },
    //主grid删除
    onDeleteFile: function () {
        var me = this,
            grid = me.getFileGrid(),
            records = grid.getSelectionModel().getSelection(),
            ids = [];
        for (var i in records) {
            ids.push(records[i].get('softId'));
        }
        Ext.Ajax.request({
            method: 'GET',
            url: '/confcenter/configcenter/upgrade/ne/file/delete',
            params: {
                'ids': ids.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                console.log(respText);
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
    //主grid下载
    onFileDownload: function (btn) {
        // console.log(btn.getWidgetRecord());
        var me = this,
            grid = btn.findParentByType('PagedGrid'),
            record = btn.getWidgetRecord(),
            softId = record.get('softId');
        Ext.Ajax.request({
            method: 'GET',
            url: '/confcenter/configcenter/upgrade/ne/file/download',
            params: {
                'softId': softId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                console.log(respText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    window.location.href = '/confcenter/configcenter/upgrade/ne/file/download/upgradefile?filename=' + respText.filename;
                    grid.store.reload();
                    Ext.Msg.alert(_('Tips'), _('Download Success'));
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });
    },

    //主grid导出
    onFileExport: function (form, record) {
        var me = this,
            grid = me.getFileGrid(),
            form = grid.down('form'),
            value = form.getForm().getValues(),
            exportType = grid.down('#exportType'),
            exportTypeValue = exportType.getValue(),
            records = grid.getSelectionModel().getSelection(),
            page = grid.down('pagingtoolbar').getPageData().currentPage,
            limit = grid.getStore().pageSize,
            ids = [];
        for (var i in records) {
            records[i]
            ids.push(records[i].get('softId'));
        }
        console.log(Ext.encode(value));
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/confcenter/configcenter/upgrade/ne/file/export',
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
                        exportType.reset();
                        window.location.href = '/confcenter/configcenter/upgrade/ne/file/export/download?filename=' + respText.filename;
                    } else {
                        me.failureMessage(causeid);
                        exportType.reset();
                    }
                },
                failure: function (resp, opts) {
                    Ext.Msg.alert(_('Tips'), _('Request Error'));
                }
            });
        }
        if (exportTypeValue === 0) {
            var arguments = {
                'ids': ''
            };
            console.log(0);
            ajax(arguments);
        }
        if (exportTypeValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                ids = [];
            for (var i in records) {
                ids.push(records[i].get('softId'));
            }
            var arguments = {
                'ids': ids.join(',')
            }
            ajax(arguments);
        }
        if (exportTypeValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert('提示', '请选择至少一条数据');
                exportType.reset();
            } else {
                console.log('ids:' + ids);
                var arguments = {
                    'ids': ids.join(',')
                };
                ajax(arguments);
            }
        }
    },
});