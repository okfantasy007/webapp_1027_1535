Ext.define('Admin.view.configcenter.controller.dataBackupFileTab1Controller', {
    extend: 'Admin.view.configcenter.model.grid_toolBar.CRUD',
    alias: 'controller.dataBackupFileTab1Controller',
    getSoftGrid: function () {
        var me = this,
            grid = me.getView().down('#softGrid');
        return grid;
    },
    //grid删除
    onSoftDelete: function () {
        var me = this,
            grid = me.getSoftGrid(),
            records = grid.getSelectionModel().getSelection(),
            softIds = [];
        for (var i in records) {
            records[i]
            softIds.push(records[i].get('softId'));
        }
        console.log(softIds);
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/soft/ne/recordDeletion',
            method: 'get',
            params: {
                "softIds": softIds.join(',')
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
    //grid导出
    onSoftExport: function () {
        var me = this,
            grid = me.getSoftGrid(),
            exportType = grid.down('#exportType'),
            exportTypeValue = exportType.getValue(),
            records = grid.getSelectionModel().getSelection(),
            page = grid.down('pagingtoolbar').getPageData().currentPage,
            limit = grid.getStore().pageSize,

            softIds = [];
        for (var i in records) {
            softIds.push(records[i].get('softId'));
        }
        var ajax = function (arguments) {
            Ext.Ajax.request({
                url: '/ccd/configcenter/backup/soft/ne/export',
                method: 'GET',
                params: arguments,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (resp, opts) {
                    var respText = Ext.util.JSON.decode(resp.responseText);
                    console.log(respText);
                    var causeid = respText.causeid;
                    if (causeid == 14000) {
                        Ext.Msg.alert(_('Tips'), _('Export Success'));
                        window.location.href = '/ccd/configcenter/backup/soft/ne/export/download?filename=' + respText.filename;
                        exportType.reset();
                    } else {
                        me.failureMessage(causeid);
                        exportType.reset();
                    }
                },
                failure: function (resp, opts) {
                    Ext.Msg.alert(_('Tips'), _('Request Error'));
                    exportType.reset();
                }
            });
        }
        if (exportTypeValue === 0) {
            var arguments = {
                'softIds': ''
            }
            console.log(0);
            ajax(arguments);
        }
        if (exportTypeValue === 1) {
            var records = grid.store.getRange(0, grid.store.getCount()),
                softIds = [];
            for (var i in records) {
                softIds.push(records[i].get('softId'));
            }
            console.log(records);
            // var arguments = {
            //     'limit': limit,
            //     'page': page
            // }
            var arguments = {
                'softIds': softIds.join(',')
            }
            ajax(arguments);
            console.log(arguments);
        }
        if (exportTypeValue === 2) {
            if (records.length === 0) {
                Ext.Msg.alert('提示', '请选择至少一条数据');
                exportType.reset();
            } else {
                console.log(2);
                var arguments = {
                    'softIds': softIds.join(',')
                }
                ajax(arguments);
            }
        }
    },
    //grid下载
    onDownload: function (btn) {
        // console.log(btn.getWidgetRecord());
        var me = this,
            grid = btn.findParentByType('PagedGrid'),
            record = btn.getWidgetRecord(),
            softId = record.get('softId');
        console.log(softId);
        Ext.Ajax.request({
            url: '/ccd/configcenter/backup/soft/ne/download',
            method: 'get',
            params: {
                "softId": softId
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                if (causeid == 14000) {
                    Ext.Msg.alert(_('Tips'), _('Download Success'));
                    window.location.href = '/ccd/configcenter/backup/soft/ne/backup/download?filename=' + respText.filename;
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
});