Ext.define('widget.hellowin', {
    extend: 'Ext.container.Container',
    
    layout: 'center',

    controller: {
        onClick: function() {
            // alert('Hello world!');

            Ext.toast({
                html: '添加监控任务失败',
                title: 'fail',
                width: 200,
                align: 't'
            });

            Ext.create('Ext.window.Window', {
                title: 'Hello',
                height: 200,
                width: 400,
                layout: 'fit',
                liveDrag: true,
                items: {  // Let's put an empty grid in just to illustrate fit layout
                    xtype: 'grid',
                    border: false,
                    columns: [{header: 'World'}],                 // One header just for show. There's no data,
                    store: Ext.create('Ext.data.ArrayStore', {}) // A dummy empty data store
                }
            }).show();

        },
    },

    items: [
        {
            xtype: 'button',
            text: 'Open a pop up window',
            listeners: {
                click: 'onClick'
            }
        }
    ]
});
