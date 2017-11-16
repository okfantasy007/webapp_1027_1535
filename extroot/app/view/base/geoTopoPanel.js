Ext.define('Admin.view.base.geoTopoPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'geoTopoPanel',


    map: null,
    mapCenter: new BMap.Point(116.286856,40.051917),
    mapZoom: 17,
    //[BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP, BMAP_PERSPECTIVE_MAP]
    mapType: BMAP_NORMAL_MAP,
    data_url: '',

    initComponent: function(){
        var me = this;

        // geoMap容器，绘制拓扑节点及连接
        me.mapid = me.getId()+'_map_container';
        me.setHtml(
            '<div style="width:100%;height:100%;border:1px solid gray" id="'+ me.mapid + '"></div>'
        );

        me.on("afterlayout", function(me, layout, eOpts) {  
            me.createGeoMap();
        });

        me.callParent();
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

    },

    destroyGeoMap: function() {
        var me = this;
        var parent = document.getElementById(me.mapid);
        while (parent.firstChild) {
            parent.firstChild.remove();
        }        
    },

    reloadGeoMap: function() {
        var me = this;
        me.destroyGeoMap();
        me.createGeoMap();
    },

    addMarker:function(point,iconImg){
        var marker= new BMap.Marker(point, {icon: iconImg});
        return marker;
    },

    addLink:function(points,property){
       var link=new BMap.Polyline(points,property);
       return link;
    },

    loadMap: function(jsonurl) {
        var p = this;
        Ext.Ajax.request( {
            url : jsonurl,
            method : 'get',
            // params : {
            //    mapid : "mydemo"
            // },
            success : function(response, options) {
                
                this.mapJson = Ext.util.JSON.decode(response.responseText);
                // console.log(this.mapJson);
                var nodes = this.mapJson.nodes;
                var links = this.mapJson.links;


                for (var i in nodes) {
                    var n = nodes[i];
                    // console.log(i, n);

                    var icon = new BMap.Icon(n.icon, new BMap.Size(n.width, n.height), {
                        anchor: new BMap.Size(n.width/2, n.height/2) //这句表示图片相对于所加的点的位置
                    });
                    var mkr = p.addMarker(new BMap.Point(n.lng, n.lat),icon);

                    p.map.addOverlay(mkr);
                    mkr.enableDragging();
                    // console.log(i,mkr);
                    // console.log(i,mkr.domElement());

                    // var div=document.getElementsByClassName('BMap_Marker');
                    // console.log(i,div);

                    mkr.setTitle(n.name);

                    var label = new BMap.Label(n.name,{offset:new BMap.Size(36,8)});
                    mkr.setLabel(label);

                    mkr.nodeIdx = i;
                    mkr.addEventListener("dragging",function(evt){
                        // console.log(evt);
                        // console.log(evt.currentTarget.nodeIdx);
                        // console.log(evt.point.lat, evt.point.lng);

                        // 更新坐标
                        var n = nodes[evt.currentTarget.nodeIdx];
                        n.lat = evt.point.lat;
                        n.lng = evt.point.lng;
                        // console.log(n);

                        // 找到关联的link
                        for (var i in links) {
                            var l = links[i];

                            if (l.sourceIdx == evt.currentTarget.nodeIdx) {
                                var point = l.line.getPath()[0];
                                point.lng = l.source.lng;
                                point.lat = l.source.lat;
                                l.line.setPositionAt(0, point);
                                // console.log("link", l.sourceIdx,"---", l.targetIdx);
                            } 
                            if (l.targetIdx == evt.currentTarget.nodeIdx ) {
                                var point = l.line.getPath()[1];
                                point.lng = l.target.lng;
                                point.lat = l.target.lat;
                                l.line.setPositionAt(1, point);
                                // console.log("link", l.sourceIdx,"---", l.targetIdx);
                            }

                        }
                    });
                }


                for (var i in links) {
                    var l = links[i];
                    // console.log(i, l);
                    l.source = nodes[l.sourceIdx];
                    l.target = nodes[l.targetIdx];

                    var sourcePonint = new BMap.Point( l.source.lng, l.source.lat ); 
                    var targetPoint = new BMap.Point( l.target.lng, l.target.lat ); 
                    l.line = p.addLink([sourcePonint,targetPoint], {
                        strokeColor: l.strokeColor,
                        strokeWeight: l.strokeWeight,
                        strokeOpacity: l.strokeOpacity}
                    );  //定义折线
                    p.map.addOverlay(l.line);     //添加折线到地图上
                    // polyline.enableEditing();
                }

            },

            failure : function() {
                console.log("load map error!");
            }
        });
    },

    getMapSetting: function() {
        var me = this;
        return {
            mapCenter: me.map.getCenter(),
            mapType: me.map.getMapType(),
            mapZoom: me.map.getZoom(),
        }
    },

    getMapType : function(cf) {
        var ary = [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP, BMAP_PERSPECTIVE_MAP];
        var maptype = BMAP_NORMAL_MAP;
        switch(cf) {
        case '地图':
            maptype = BMAP_NORMAL_MAP;
            break;
        case '卫星':
            maptype = BMAP_SATELLITE_MAP;
            break;
        case '三维':
            maptype = BMAP_PERSPECTIVE_MAP;
            break;
        case '混合':
            maptype = BMAP_HYBRID_MAP;
        }
        return maptype; 
    },
   

});
