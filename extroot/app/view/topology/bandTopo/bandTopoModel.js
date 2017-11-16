Ext.define('Admin.view.topology.bandTopo.bandTopoModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.bandTopoView',

    data: {
        background_opacity: 50,
        resize_reload_flag: true
    },
    stores: {
        stores: {
            // 链路方向
            dirstore: {
                fields : ['value', 'text'],
                data : [['1', _('Unidirection')],
                    ['2', _('Bidirection')]]
            },
            // 链路宽度
            widthstore: {
                fields : ['value', 'text'],
                data : [['1', 1],
                    ['2', 2],
                    ['3', 3],
                    ['4', 4],
                    ['5', 5]]
            },
            // 链路式样
            stylestore: {
                fields : ['value', 'text'],
                data : [['0', _('Straight Line')],
                    ['1', _('Short Break Line')],
                    ['2', _('Chain Line')],
                    ['3', _('Dotted Line')],
                    ['4', _('Wavy Line')],
                    ['5', _('Long Break Line')]]
            },
            // 链路形状
            shapestore: {
                fields : ['value', 'text'],
                data : [['0', _('Parallel')]]
            },
            searchStore: {
                fields: ['value', 'text'],
                data: [

                ]
            }
        },
        data: {
            current_subnet: 0
        }
    }

});