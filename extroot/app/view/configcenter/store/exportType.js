Ext.define('Admin.view.configcenter.store.exportType', {
    extend: 'Ext.data.Store',
    alias: 'store.exportType',
    fields: ['exportTypeId', 'exportTypeName'],
    data:
    [
        // { "exportTypeId": -1, "exportTypeName": "导出列表" },
        { "exportTypeId": 0, "exportTypeName": _("All") },
        { "exportTypeId": 1, "exportTypeName": _("current page") },
        { "exportTypeId": 2, "exportTypeName": _("selected") }]
});	