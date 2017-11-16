Ext.define('Admin.view.configcenter.store.onlineState', {
    extend: 'Ext.data.Store',
    alias: 'store.onlineState',
    fields: ['id', 'name'],
    data:
    [{ "id": -1, "name": "请选择" },
    { "id": 1, "name": "在线" },
    { "id": 0, "name": "离线" }
    ]
});