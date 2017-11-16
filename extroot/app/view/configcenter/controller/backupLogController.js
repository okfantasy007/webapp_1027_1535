Ext.define('Admin.view.configcenter.controller.backupLogController', {
    extend: 'Admin.view.configcenter.model.grid_toolBar.CRUD',
    alias: 'controller.backupLogController',
    //grid导出
    getLogGrid: function () {
        var me = this,
            grid = this.getView().down('#logGrid');
        return grid;
    },
    onBackupLogExport: function () {
        var me = this,
            grid = me.getLogGrid(),
            exportType = grid.down('#exportType'),
            exportTypeValue = exportType.getValue(),
            records = grid.getSelectionModel().getSelection(),
            page = grid.down('pagingtoolbar').getPageData().currentPage,
            limit = grid.getStore().pageSize,
            logIds = [];
        for (var i in records) {
            records[i]
            logIds.push(records[i].get('logId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/ccd/configcenter/backup/log/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        exportType.reset();
                        window.location.href = '/ccd/configcenter/backup/log/export/download?filename=' + respText.filename;
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
                'logIds': ''
            };
            ajax(arguments);
        }
        if (exportTypeValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                logIds = [];
            for (var i in records) {
                logIds.push(records[i].get('logId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'logIds': logIds.join(',')
            }
            ajax(arguments);
            console.log(arguments);
        }
        if (exportTypeValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert('提示', '请选择至少一条数据');
                exportType.reset();
            } else {
                var arguments = {
                    'logIds': logIds.join(',')
                };
                ajax(arguments);
            }
        }

    },
    onUpdateLogExport: function () {
        var me = this,
            grid = me.getLogGrid(),
            exportType = grid.down('#exportType'),
            exportTypeValue = exportType.getValue(),
            records = grid.getSelectionModel().getSelection(),
            page = grid.down('pagingtoolbar').getPageData().currentPage,
            limit = grid.getStore().pageSize,
            logIds = [];
        for (var i in records) {
            records[i]
            logIds.push(records[i].get('logId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/confcenter/configcenter/upgrade/log/export',
                method: 'get',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),

                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText);
                    // console.log(respText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        exportType.reset();
                        window.location.href = '/confcenter/configcenter/upgrade/log/download?filename=' + respText.filename;
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
            ajax(arguments);
        }
        if (exportTypeValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                logIds = [];
            for (var i in records) {
                logIds.push(records[i].get('logId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'ids': logIds.join(',')
            }
            ajax(arguments);
            console.log(arguments);
        }
        if (exportTypeValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert('提示', '请选择至少一条数据');
                exportType.reset();
            } else {
                var arguments = {
                    'ids': logIds.join(',')
                };
                ajax(arguments);
            }
        }


    },

});