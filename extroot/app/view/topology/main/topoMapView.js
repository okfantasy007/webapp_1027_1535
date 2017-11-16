Ext.define('Admin.view.topology.main.topoMapView', {
    extend: 'Admin.view.base.geoTopoPanel',
    xtype: 'topoMapView',

    data_url:'javascripts/data/topodemo.json',
    
    onRefresh: function() {
        this.reloadGeoMap();
    },
 
    createGeoMap: function() {
        var me = this;
        me.map = new BMap.Map(me.mapid);                        // 创建Map实例
        me.map.centerAndZoom(me.mapCenter, me.mapZoom);         // 初始化地图,用城市名设置地图中心点
        me.map.enableScrollWheelZoom(true);                     //开启鼠标滚轮缩放
        me.map.addControl(new BMap.NavigationControl());
        
        if (APP.enable_online_map) {
            me.map.setMapType(me.mapType);
            me.map.addControl(new BMap.MapTypeControl());   
            me.map.addControl(new BMap.ScaleControl());     
            me.map.addControl(new BMap.GeolocationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT
            }));   
        }

        if (me.data_url) {
            me.loadMap(me.data_url);
        }

        //添加地图右键菜单
        var markerMenu=new BMap.ContextMenu();
        var txtMenuItem =[
            {
                text:'刷新',
                callback:function(p){
                    me.onRefresh();
                }
            },
            {
                text:'添加节点',
                callback:function(p){
                    alert("在此处添加节点");
                }
            }
        ];
        var opts={width:80};
        for(var i=0; i < txtMenuItem.length; i++)
        {
            markerMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,opts));
            markerMenu.addSeparator();
        }
         me.map.addContextMenu(markerMenu); 

    },

    addMarker:function(point,iconImg){
        var marker= new BMap.Marker(point, {icon: iconImg});
        var markerMenu=new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text:'删除设备',
                callback:function(p){
                    alert("删除该节点");
                }
            },
            {
                text:'修改设备',
                callback:function(p){
                    alert("修改该节点");
                }
            }
        ];
        var opts={width:80};
        for(var i=0; i < txtMenuItem.length; i++)
        {
            markerMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,opts));
            markerMenu.addSeparator();
        }
        marker.addContextMenu(markerMenu);
        return marker;
    },

    addLink:function(points,property){
        var link=new BMap.Polyline(points,property);
        var markerMenu=new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text:'删除链路',
                callback:function(p){
                    alert("删除该节点");
                }
            },
            {
                text:'修改链路',
                callback:function(p){
                    alert("修改该节点");
                }
            }
        ];
        var opts={width:80};
        for(var i=0; i < txtMenuItem.length; i++)
        {
            markerMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,opts));
            markerMenu.addSeparator();
        }
        link.addContextMenu(markerMenu);
       return link;
    },


});
