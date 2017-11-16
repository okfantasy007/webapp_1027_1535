
Ext.define('Admin.view.topology.main.backgroundView', {
    extend: 'Ext.view.View',
    xtype: 'backgroundView',

    store: {
        fields: [
            { name:'src', type:'string' },
            { name:'caption', type:'string' }
        ],

        // local 
        // data: [
        //     { src:'images/wallpaper/01.jpg', caption:'Drawing & Charts' },
        //     { src:'images/wallpaper/02.jpg', caption:'Advanced Data' },
        //     { src:'images/wallpaper/03.jpg', caption:'Overhauled Theme' },
        //     { src:'images/wallpaper/04.jpg', caption:'Performance Tuned' }
        // ]

        // remote
        autoLoad: true,             
        proxy: {
            type: 'ajax',
            url: '/topo/background',
            reader: {
                type: 'json',
                rootProperty: ''
            }
        }
    },

    tpl: [
        '<tpl for=".">',
            '<div class="dataview-multisort-item">',
                '<img width="128" height="128" src="{src}" />',
                '<h3>{caption}</h3>',
            '</div>',
        '</tpl>'        
    ],

    itemSelector: 'div.dataview-multisort-item',
    emptyText: _('No images available'),
});

