Ext.define('Admin.view.main.RightContainerBorder', {
    extend: 'Ext.Container',
    xtype: 'rightContainerBorder',

    layout: 'border',
    items: [
        // 顶部阴影特效
        {
            region: 'north',
            xtype: 'container',
            cls: 'shadow',
            height: 2,
            margin: '-2 0 0 0',
        },
        // 左侧阴影特效
        {
            region: 'west',
            xtype: 'container',
            cls: 'shadow',
            width: 2,
            margin: '0 0 0 -2',
        },
        {
            region: 'center',
            xtype: 'rightContainer'
        }
    ]
})