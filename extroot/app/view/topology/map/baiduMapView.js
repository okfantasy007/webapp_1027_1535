Ext.define('Admin.view.topology.map.baiduMapView', {
    extend: 'Admin.view.base.geoTopoPanel',
    xtype: 'baiduMapView',

    data_url:'javascripts/data/topodemo.json',

    controller: {

        onResetLocation: function() {
            var p = this.getView();
            p.map.centerAndZoom(p.mapCenter,p.mapZoom); 
        },

        onRefresh: function() {
            var panel = this.getView();
            panel.reloadGeoMap();
        },

        onSliderChange: function( me , newValue , thumb , eOpts ) {
            var panel = this.getView();
            var map = panel.map;
            var container_div = map.getContainer();
            container_div.style.opacity = newValue / 100;  
        },

    },


    dockedItems: [{
        xtype: 'toolbar',
        items: [
        {
            text:'移动到初始位置',
            handler: 'onResetLocation'
        },
        {
            xtype: 'slider',
            width: 150,
            value: 70,
            increment: 1,
            minValue: 0,
            maxValue: 100,
            listeners: {
                change: 'onSliderChange'
            }
        },
        '->',
        {
            text:_('Refresh'),
            tooltip:_('Refresh'),
            iconCls:'x-fa fa-refresh',
            handler: 'onRefresh'
        }]
    }],

});
