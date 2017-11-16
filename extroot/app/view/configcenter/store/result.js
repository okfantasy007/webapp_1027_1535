Ext.define('Admin.view.configcenter.store.result', {
    extend: 'Ext.data.Store',
    alias: 'store.result',
    fields: ['id', 'name'],
    data: [{
            "id": -1,
            "name": "请选择"
        },
        {
            "id": 1,
            "name": "成功"
        },
        {
            "id": 2,
            "name": "失败"
        }
    ]
});