Ext.define('widget.helloGrid5aView', {
    extend: 'Ext.container.Container',

    requires: [
        'widget.helloGrid5aGrid',
        'widget.helloGrid5aForm'
    ],
    
    // 指定布局
    layout: 'card',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    items: [
        {
            xtype: 'helloGrid5aGrid',
        },
        {
            xtype: 'helloGrid5aForm',
        }
    ]

});
