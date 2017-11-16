Ext.define('Admin.view.config.sdn.topo.elineTopoModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.elineTopoModel',

    data: {
        background_opacity: 50,
        resize_reload_flag: true,
        current_eline_id: null,
        current_pw_id: null,
        current_topo_layer: 'eline',
        current_pw_name: null,
        lm_stop_disabled: true,
        dm_stop_disabled: true,
        timer: null,
        time: 15 * 60 * 1000,
        url: null
    },
    stores: {
        stores: {
            // 链路方向
            dirstore: {
                fields: ['value', 'text'],
                data: [
                    ['1', _('Unidirection')],
                    ['2', _('Bidirection')]
                ]
            },
            // 链路宽度
            widthstore: {
                fields: ['value', 'text'],
                data: [
                    ['1', 1],
                    ['2', 2],
                    ['3', 3],
                    ['4', 4],
                    ['5', 5]
                ]
            },
            // 链路式样
            stylestore: {
                fields: ['value', 'text'],
                data: [
                    ['0', _('Straight Line')],
                    ['1', _('Short Break Line')],
                    ['2', _('Chain Line')],
                    ['3', _('Dotted Line')],
                    ['4', _('Wavy Line')],
                    ['5', _('Long Break Line')]
                ]
            },
            // 链路形状
            shapestore: {
                fields: ['value', 'text'],
                data: [
                    ['0', _('Parallel')]
                ]
            },

            //节点或是链路的基本属性
            properties: {
                fields: [{
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'value',
                    type: 'string'
                }],
                proxy: {
                    type: 'ajax',
                    url: '/topo/topo_nodeorlink_info/get_nodeorlink_properties',
                    extraParams: {
                        SYMBOL_ID: 0
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'children'
                    }
                },
                autoLoad: true
            }
        },
        data: {
            current_subnet: 0
        }
    }

});