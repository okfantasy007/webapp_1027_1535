Ext.define('Admin.view.configcenter.store.optType', {
    extend: 'Ext.data.Store',
    alias: 'store.optType',
    fields: ['id', 'name'],
    data: [{
            "id": 0,
            "name": "全部"
        },
        {
            "id": 1,
            "name": "升级"
        },
        {
            "id": 2,
            "name": "备份"
        },
        {
            "id": 3,
            "name": "激活"
        },
        {
            "id": 4,
            "name": "获取版本"
        },
        {
            "id": 5,
            "name": "获取软件信息"
        },
    ]
});