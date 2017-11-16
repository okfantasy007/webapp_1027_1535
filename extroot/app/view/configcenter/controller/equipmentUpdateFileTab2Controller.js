Ext.define('Admin.view.configcenter.controller.equipmentUpdateFileTab2Controller', {
    extend: 'Admin.view.configcenter.controller.equipmentUpdateFileController',
    alias: 'controller.equipmentUpdateFileTab2Controller',
    requires: [
        'Admin.view.configcenter.model.grid_toolBar.CRUD',
        'Admin.view.configcenter.view.equipmentUpdate.file.veneer.veneerInputNElocalFile',
        'Admin.view.configcenter.view.equipmentUpdate.file.veneer.veneerMainFormWindow',
        'Admin.view.configcenter.view.equipmentUpdate.file.veneer.backupFileChooseWindow',
    ],
    onVeneerInputLocalFile: function () {
        var veneerLocalWindow = this.getView().down('#veneerLocalWindow');
        this.getView().setActiveItem(veneerLocalWindow);
        this.setResetRecord(this.getView().down('#veneerInputNElocalFileForm'));

    },
    //本地form提交
    onVeneerLocalFormSubmit: function () {
        var veneerInputNElocalFileForm = this.getView().down('#veneerInputNElocalFileForm');
        var me = this;
        if (veneerInputNElocalFileForm.getForm().isValid()) {
            veneerInputNElocalFileForm.getForm().submit({
                url: '/confcenterU/configcenter/upgrade/card/file/importlocal',
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
                url: '/confcenter/configcenter/upgrade/card/file/updatedesc',
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
            url: '/confcenter/configcenter/upgrade/card/file/delete',
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
    //备份文件添加描述
    onBackupFileRemark: function () {
        var me = this,
            form = this.getBackupRemarkForm(),
            levelId = form.levelId,
            grid = grid = me.getBackupGrid(),
            fileGrid = me.getFileGrid();
        if (form.getForm().isValid()) {
            form.getForm().submit({
                url: '/confcenter/configcenter/upgrade/card/file/importbackup',
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
    //下载
    onFileDownload: function (btn) {
        var me = this,
            grid = btn.findParentByType('PagedGrid'),
            record = btn.getWidgetRecord(),
            softId = record.get('softId');
        Ext.Ajax.request({
            method: 'GET',
            url: '/confcenter/configcenter/upgrade/card/file/download',
            params: {
                'softId': softId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Download Success'));
                    window.location.href = '/confcenter/configcenter/upgrade/ne/file/download/upgradefile?filename=' + respText.filename;
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
    //导出单板升级文件信息列表
    onFileExport: function (form, record) {
        var me = this,
            grid = me.getFileGrid(),
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
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/confcenter/configcenter/upgrade/card/file/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText);
                    console.log(respText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        exportType.reset();
                        window.location.href = '/confcenter/configcenter/upgrade/card/file/export/download?filename=' + respText.filename;
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