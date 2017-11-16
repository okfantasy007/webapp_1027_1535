Ext.define('Admin.view.base.TopoPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'TopoPanel',

    // public vars of topo
    node: null,
    node_drag: null,
    link: null,
    link_label: null,
    link_select: null,
    link_drag: null,
    marker: null,
    force: null,
    svg: null,
    svg_width: 0,
    svg_height: 0,
    div: null,
    CtrlPress: false,
    json: null,
    // html: '<div style="width:100%; height:100%; background-repeat:no-repeat;border:3px solid #0000ff;"></div>',
    link_colors: ["#4cc417","red","blue","#ffd700","black","white", "gray", "orange"],
    url: "",
    add_device:false,
    add_symbol: false,
    add_subnet: false,
    add_link: false,
    view_locked: false,
    link_source_node: null,
    link_target_node: null,
    drag_line: null,

    // config
    node_size: 40,
    symbol_size: 13,
    link_space: 6,
    multi_link_style: 0,  //0:平行线, 1:闭合平行线, 3:贝塞尔曲线
    node_fix: true,
    linkDistance: 150,
    charge: -150,
    show_node_label: true,
    show_link_label: false,
    show_node_symbol: true,

    selectedNodes: [],
    // 拓扑图背景
    // background_type 有三种类型'img'、'color'、'map'
    background_type: 'img',
    background_color: "#F3F3F3",
    background_img: "",
    background_opacity: 0.5,

    background_color_temp: "#F3F3F3",
    background_img_temp: "",
    background_opacity_color: 0.5,
    background_opacity_img: 0.5,
    background_opacity_map: 0.5,

    initComponent: function(){
        var me = this;

        // 背景图片、背景色、地理地图
        me.background_id = me.getId()+'_background';
        // d3容器，绘制拓扑节点及连接
        me.mapid = me.getId()+'_d3container';

        me.setHtml(
            '<div style="width:100%;height:100%;border:0px solid gray" id="'+ me.background_id   + '"></div>' +
            '<div style="width:100%;height:100%;position:absolute;top:0;left:0" id="'+ me.mapid  + '"></div>'
        );

        me.on("resize", function(s, width, height, oldWidth, oldHeight, eOpts) {  
            if (me.div) {
                // console.log("resize",  width, height);
                me.topoResize(width, height);
            }
        });

        // me.on("afterlayout", function(me, layout, eOpts) {  
        // });

        // 使用闭包初始化d3中使用的callback函数
        var callback_funcs = me.init_d3_cb();
        me.tick = callback_funcs.tick;
        me.d3_loadjson = callback_funcs.loadjson;
        me.data2view = callback_funcs.data2view;
        me.dragstart = callback_funcs.dragstart;
        me.dragmove = callback_funcs.dragmove;
        me.dragend = callback_funcs.dragend;

        me.callParent();
    },

    // ========================v baidu ditu support v========================

    mapEnable: false,
    map: null,
    mapCenter: new BMap.Point(116.286856,40.051917),
    mapSync: false,
    mapZoom: 8,
    //[BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP, BMAP_PERSPECTIVE_MAP]
    mapType: BMAP_NORMAL_MAP,

    mapCenter_temp: new BMap.Point(116.286856,40.051917),
    mapZoom_temp: 8,
    mapType_temp: BMAP_NORMAL_MAP,

    createGeoMap: function() {
        var me = this;
        me.mapEnable = true;
        me.map = new BMap.Map(me.background_id);            // 创建Map实例
        // me.map.centerAndZoom(new BMap.Point(116.404, 39.915), 7); 
        me.map.centerAndZoom(me.mapCenter, me.mapZoom);     // 初始化地图,用城市名设置地图中心点
        me.map.enableScrollWheelZoom(true);                 //开启鼠标滚轮缩放
        me.map.addControl(new BMap.NavigationControl());
        
        if (APP.enable_online_map) {
            me.map.setMapType(me.mapType);
            me.map.addControl(new BMap.GeolocationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT
            }));   
            me.map.addControl(new BMap.MapTypeControl());   
            me.map.addControl(new BMap.ScaleControl({
                anchor: BMAP_ANCHOR_TOP_LEFT
            }));     
        }
    },

    createGeoMap_temp: function() {
        var me = this;
        me.mapEnable = true;
        me.map = new BMap.Map(me.background_id);            // 创建Map实例
        me.map.centerAndZoom(me.mapCenter_temp, me.mapZoom_temp);     // 初始化地图,用城市名设置地图中心点
        me.map.enableScrollWheelZoom(true);                 //开启鼠标滚轮缩放
        me.map.addControl(new BMap.NavigationControl());

        if (APP.enable_online_map) {
            me.map.setMapType(me.mapType_temp);
            me.map.addControl(new BMap.GeolocationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT
            }));  
            me.map.addControl(new BMap.MapTypeControl());   
            me.map.addControl(new BMap.ScaleControl({
                anchor: BMAP_ANCHOR_TOP_LEFT
            }));     
        }
    },

    destroyGeoMap: function() {
        var me = this;
        me.mapEnable = false;
        var parent = document.getElementById(me.background_id);
        while (parent.firstChild) {
            parent.firstChild.remove();
        }        
    },

    getMapSetting: function() {
        var me = this;
        return {
            mapCenter: me.map.getCenter(),
            mapType: me.map.getMapType(),
            mapZoom: me.map.getZoom(),
        }
    },

    enableGeoMapOperation: function(status) {
        var me = this;
        var orgx, orgy;

        var d3div = document.getElementById(me.mapid);
        var d3g = me.svg.selectAll("g");
        if (status) {

            // d3视图忽略鼠标事件
            d3div.style.pointerEvents = 'none';
            d3g.style('pointer-events', 'none');


            // ==================== 处理拖拽地图 =====================

            me.map.addEventListener("dragstart", function(e){
                // console.log('dragstart',e);
                orgx = e.offsetX;
                orgy = e.offsetY;
            });            

            me.map.addEventListener("dragging", function(e){
                // console.log(e);
                var offx = e.offsetX - orgx;
                var offy = e.offsetY - orgy;
                if (me.mapSync) {
                    me.moveAll(offx, offy);
                    orgx = e.offsetX;
                    orgy = e.offsetY;
                }
            });            

            me.map.addEventListener("zoomstart", function(e){
                console.log('zoomstart',e);
                if (me.mapSync) {
                    me.pixel2pointAll();
                }
            });           

            me.map.addEventListener("zoomend", function(e,t){
                console.log('zoomend',e);
                // console.log('zoomend',e.target);
                // console.log('zoomend',e.target.Lc);
                // console.log('zoomend',e.target.Oa);
                if (me.mapSync) {
                    me.point2pixelAll();
                }
            });           

        } else {

            // d3视图恢复鼠标事件
            d3div.style.pointerEvents = 'auto';
            // 刷新d3视图
            me.reloadTopo();
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
    
    initBackgroundColorTemp: function() {
        this.background_color_temp = '#F3F3F3';
        this.background_opacity_color = 0.5;
    },

    initBackgroundImgTemp: function() {
        this.background_img_temp = '';
        this.background_opacity_img = 0.5;
    },

    initBackgroundMapTemp: function() {
        this.background_opacity_map = 0.5;
        this.destroyGeoMap();
    },

    // 移动所有d3节点
    moveAll : function(offsetX, offsetY) {
        var me = this;
        me.node.each(function(d){
            d.x = d.px = d.x + offsetX;
            d.y = d.py = d.y + offsetY;
        });
        me.tick();
    },

    pixel2pointAll : function() {
        var me = this;
        me.node.each(function(d){
            var point = me.map.pixelToPoint( new BMap.Pixel(d.x, d.y) );
            d.lng = point.lng;
            d.lat = point.lat;
            // console.log(d.lng, d.lat);
        });
    },

    point2pixelAll : function() {
        var me = this;
        me.node.each(function(d){
            var pixel = me.map.pointToPixel( new BMap.Point(d.lng, d.lat) );
            d.x = d.px = pixel.x;
            d.y = d.py = pixel.y;
        });
        me.tick();
    },

    // ========================^ baidu ditu support ^========================

    setBackgroundSize: function(w,h) {
        var me = this;
        var div = document.getElementById(me.background_id);
        // console.log("size:",w,h);
        div.style.width = w + 'px';
        div.style.height = h + 'px';
    },

    setBackgroundColor: function(rgb) {
        var me = this;
        me.background_color = rgb;
        var div =  document.getElementById(me.background_id);

        if(div){
            div.style.backgroundColor = rgb;
        }
    },

    setBackgroundImage: function(img) {
        var me = this;
        me.background_img = img;
        var div = document.getElementById(me.background_id);
        div.style.backgroundImage = "url("+img+")";
        div.style.backgroundRepeat = "no-repeat";
    },

    setBackgroundOpacity: function(opacity) {
        var me = this;
        me.background_opacity = opacity;
        document.getElementById(me.background_id)
            .style.opacity = opacity;
    },

    // ========================^ background support ^========================

    topoResize: function(w,h) {
        var me=this;
        // console.log(w, h);
        if (me.svg_width < w) {
            me.svg_width  = w;
            me.svg.attr("width", me.svg_width);
        }
        if (me.svg_height < h) {
            me.svg_height = h;
            me.svg.attr("height", me.svg_height);
        }

        me.setBackgroundSize(me.svg_width, me.svg_height);
        if (me.background_type == 'map') {
            me.createGeoMap_temp();
        }
    },

    initPanelSize: function(w,h) {
        var me = this;
        me.svg_width  = w;
        me.svg_height = h;
        if ( me.json.maxx + me.node_size > w) {
            me.svg_width = me.json.maxx + me.node_size;
        }
        if ( me.json.maxy + me.node_size > h) {
            me.svg_height = me.json.maxy + me.node_size;
        }
        me.svg.attr("width", me.svg_width);
        me.svg.attr("height", me.svg_height);
    },

    remark_links: function(links) {
        var link_map={};
        links.forEach(function(d, i) {
            d.total = 1;
            d.order = 0;
            if (d.source.index < d.target.index)
                d.neg = false;
            else
                d.neg = true;
            var k = Math.min(d.source.index, d.target.index) + "-"
                  + Math.max(d.source.index, d.target.index);
            if (!link_map.hasOwnProperty(k))
                link_map[k] = [d];
            else 
                link_map[k].push(d);
        });
        for (var k in link_map) {
            var size = link_map[k].length;
            if (size>1) {
                link_map[k].forEach(function(d, i) {
                    d.total = size
                    d.order = i;
                })
            }
        }
        // console.info(link_map);
    },

    exist_multi_link: function() {
        var me = this;
        var cnt = 0;
        me.link.each(function(d) {
            if (d.total>1) {
                cnt += 1;
            }
        });
        return cnt>0;
    },

    fixed_all: function(state) {
        var me = this;
        me.node.each(function(d) {
            d.fixed = state;
        });
        me.tick();
        me.force.resume();
    },

    is_fixed_all: function() {
        var me = this;
        var cnt = 0;
        me.node.each(function(d) {
            if (!d.fixed) {
                cnt += 1;
            }
        });
        return cnt==0;
    },

    new_short_line : function(start, end, length){
        var x = end.x - start.x,
            y = end.y - start.y,
            L = Math.sqrt(x*x+y*y);

        var s={},e={};
        s.x = start.x + length*x/L,
        s.y = start.y + length*y/L;

        var lend = L-length;
        e.x = start.x + lend*x/L,
        e.y = start.y + lend*y/L;

        return {source:s, target:e, l:L}
    },

    get_path_coor : function(n,d,step) {
        var x1 = n.source.x;
        var y1 = n.source.y;
        var x2 = n.target.x;
        var y2 = n.target.y;
        if (d.neg) {
            x2 = n.source.x;
            y2 = n.source.y;
            x1 = n.target.x;
            y1 = n.target.y;
        }
        var L = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));

        var step_width = step;
        var half_width = (d.total-1) * step_width / 2;
        var offsetPixels = step_width * d.order - half_width;

        var s={}, e={};
        s.x = x1 + offsetPixels * (y2-y1) / L;
        s.y = y1 + offsetPixels * (x1-x2) / L;
        e.x = x2 + offsetPixels * (y2-y1) / L;
        e.y = y2 + offsetPixels * (x1-x2) / L;

        if (d.neg) 
            return {source:e, target:s, l:L};
        else 
            return {source:s, target:e, l:L};
    },

    setForcelinkDistance: function(distance) {
        var me = this;
        me.linkDistance = distance;
        me.force.linkDistance(me.linkDistance);
        me.force.start();
    },

    setForceCharge: function(charge) {
        var me = this;
        me.charge = charge;
        me.force.charge(me.charge);
        me.force.start();
    },

    setLinkSpace: function(space) {
        var me = this;
        me.link_space = space;
        me.tick();
    },

    setMultiLinkStyle: function(style) {
        var me = this;
        me.multi_link_style = style;
        me.tick();
    },

    setNodeSize: function(size) {
        var me = this;
        me.node_size = parseInt(size);
        var img_size = size - 8;

        me.node.selectAll(".node_image")
            .attr("x", 0-img_size/2)
            .attr("y", 0-img_size/2)
            .attr("width", img_size)
            .attr("height", img_size);

        me.node.selectAll(".node_svgicon")
            .attr("x", 0-img_size/2)
            .attr("y", 0-img_size/2)
            .attr("font-size", img_size+'px');

        me.node.selectAll("text")               
            .attr("dx", 0)
            .attr("dy", size/2+10);

        me.tick();
    },

    showLinkLabel: function(bool) {
        var me = this;
        me.show_link_label = bool;
        me.link.each(function(d){
            d.show_link_label = bool;
        })
        me.tick();
    },

    showNodeLabel: function(bool) {
        var me = this;
        me.show_node_label = bool;
        me.node.each(function(d){
            d.show_node_label = bool;
        })
        me.tick();
    },

    showNodeSymbol: function(bool) {
        var me = this;
        me.show_node_symbol = bool;
        me.node.each(function(d){
            d.show_node_symbol = bool;
        });
        me.tick();
    },


    loadJson: function(url) {
        console.log("url--------->"+url);
        var me = this;
        me.url = url;
        me.reloadTopo();
    },

    selectNodes: function(nodeids) {
        var me = this;
        me.node.each( function(d) {
            d.selected = false;
            for (var i in nodeids)  {
                if (nodeids[i] == d.symbol_id) {
                    d.selected = true;
                    break;
                }
            }
        });
        me.tick();
    },
    
    zoomOut : function() { 
        var me = this;
        // if (me.svg_width < 4096 && me.svg_height < 4096) {
            me.node.attr("cx", function(d) { return d.x = d.px = d.x * 1.25;})
                .attr("cy", function(d) { return d.y = d.py = d.y * 1.25;});
            
            me.svg_width = me.svg_width * 1.25;
            me.svg_height = me.svg_height * 1.25;
            

            me.svg.attr("width", me.svg_width)
                .attr("height",  me.svg_height);
            
            me.topoResize(me.svg_width, me.svg_height);

            me.tick();
        // }
    },

    zoomIn : function() { 
        var me = this;
        if (me.svg_width > me.getSize().width && me.svg_height > me.getSize().height) {
            me.node.attr("cx", function(d) { return d.x = d.px = d.x * 0.8;})
                .attr("cy", function(d) { return d.y = d.py = d.y * 0.8;});

            me.svg_width = me.svg_width * 0.8;
            me.svg_height = me.svg_height * 0.8;
            
            me.svg.attr("width", me.svg_width)
                .attr("height", me.svg_height);

            me.topoResize(me.svg_width, me.svg_height);
            
            me.tick();
        }
    },

    zoomReset : function() {
        var me = this;
        me.initPanelSize(me.getSize().width, me.getSize().height);
        me.node.each(function(d){
            d.x = d.px = d.x1;
            d.y = d.py = d.y1;
        });

        me.topoResize(me.getSize().width, me.getSize().height);
       
        me.tick();
    },

    deselect_all : function () {
        var me = this;
        me.node.each(function(d){
            d.selected = false;
        })
        me.link.each(function(d){
            d.selected = false;
        })
    },

    addNode : function (node) {
        var me = this;
        me.json.nodes.push(node);
        me.data2view();
    },

    deleteNode : function (nodes) {
        var me = this;
        var deleteOneNode = function(node) {
            if (node.weight>0) {
                var links=[];
                for (var i in me.json.links) {
                    if (me.json.links[i].source.symbol_id == node.symbol_id || me.json.links[i].target.symbol_id == node.symbol_id)
                        links.push(me.json.links[i])
                }
                me.deleteLink(links);
            }
            for (var i in me.json.nodes) {
                if (me.json.nodes[i].symbol_id == node.symbol_id) {
                    me.json.nodes.splice(i, 1);
                    break;
                }
            }
        }

        for(var i in nodes) {
            deleteOneNode(nodes[i])
        }

        me.data2view();
    },

    modifyNode : function (nodevalue) {
        var me = this;
        for (var i in me.json.nodes) {
            if (me.json.nodes[i].symbol_id == nodevalue.symbol_id) {

                me.json.nodes[i].name = nodevalue.nodename;
                me.json.nodes[i].symbol_name1 = nodevalue.nodename;
                // me.json.nodes[i].remark = nodevalue.remark;

                me.node.filter(function(d){ return d.symbol_id == nodevalue.symbol_id })
                    .selectAll('text')
                    .text(function(d) { 
                        return d.name 
                    });
                break;
            }
        }
    },

    addLink : function (newlink) {
        var me = this;
        me.json.links.push(newlink);
        me.data2view();
    },

    deleteLink : function (links) {
        var me = this;
        var deleteOneLink = function(link) {
            for (var i in me.json.links) {
                if (me.json.links[i].link_symbol_id == link.link_symbol_id) {
                    me.json.links.splice(i, 1);
                    break;
                }
            }
        }

        for(var i in links) {
            deleteOneLink(links[i])
        }

        me.data2view();
    },

    modifyLink: function(linkvalue) {
        var me = this;
        for (var i in me.json.links) {
            if (me.json.links[i].link_symbol_id == linkvalue.link_symbol_id) {
                me.json.links[i].link_name1 = linkvalue.linkname;
                // me.json.links[i].remark = linkvalue.remark;
                me.json.links[i].direction = parseInt(linkvalue.direction);
                me.json.links[i].width = parseInt(linkvalue.width);
                me.json.links[i].style = linkvalue.style;
                me.json.links[i].shape = linkvalue.shape;

                me.link.filter(function(d){ return d.link_symbol_id == linkvalue.link_symbol_id })
                    .selectAll("path")
                    .attr("class", function(d) {
                        var w = d.width;
                        if (w>5)
                            w=5
                        if (w<1)
                            w=1
                        return "link-path-"+w
                    })
                    .attr("marker-end", function(d) { 
                        if ( d.direction==1 )
                            return "url(#"+me.marker+d.color+")"; 
                        else
                            return "url(#)"; 
                    })
                    .style("stroke-dasharray", function(d) {
                        if (d.style==0) 
                            return ""
                        else
                        if (d.style==1) 
                            return "5,2"
                        else
                        if (d.style==2) 
                            return "3,1.5"
                        else
                        if (d.style==3) 
                            return "3,3"
                        else
                        if (d.style==4) 
                            return "5,5"
                        else
                        if (d.style==5) 
                            return "8,3"
                    });

                me.link_label.filter(function(d){ return d.link_symbol_id == linkvalue.link_symbol_id })
                    .selectAll('textPath')
                    .text(function(d) { 
                        return d.link_name1
                    });
                break;
            }
        }
    },

    getSelectedNodes: function(){
        var me = this;
        var selectedNodes = [];
        me.node.each(function(d){
            if (d.selected){
                selectedNodes.push(d);
            }   
        });
        return selectedNodes;
    },

    getSelectedLinks: function(){
        var me = this;
        var selectedLinks = [];
        me.link.each(function(d){
            if (d.selected){
                selectedLinks.push(d);
            }
        });
        return selectedLinks;
    },

    updateNodeSymbols : function (symbol_id) {
        var me = this;
        var update_node = me.node.filter(function(d){ return d.symbol_id == symbol_id });

        update_node.selectAll('.node_symbol').remove();
        update_node.filter(function(d) { 
            if (!d.hasOwnProperty('symbols') || d.symbols.length<=0)
                return;

            var symbol_width =  d.symbols.length * me.symbol_size;
            for (var i in d.symbols) {
                var symbol = d.symbols[i];
                update_node
                    .append('svg:foreignObject')
                    .attr("class", "node_symbol")
                    .style("pointer-events", "none")
                    .attr("x", 0-symbol_width/2 + i * me.symbol_size)
                    // .attr("y", 0-img_size/2 - 20)
                    .attr('font-size', (me.symbol_size - 1) + 'px')
                    .attr("color", symbol.color)
                    .html(function(d) { return '<i class="icomoon ' + symbol.svgicon + '"></i>' });
            }
        });        
    },

    lockNode : function (symbol_id) {
        var me = this;
        me.node.filter(function(d){
            if (d.symbol_id == symbol_id) {
                console.log('lockNode');
                d.is_locked = true;
                if (d.symbols.filter(function(item){ return item.svgicon == 'icon-lock' }).length > 0) {
                    return;
                }
                d.symbols.push({
                    img: "stylesheets/icons/nnm/attachment/lock.gif",
                    svgicon: 'icon-lock',
                    color: '#ff851b'
                });
                me.updateNodeSymbols(symbol_id);
                return true;
            }
        })
    },

    unlockNode : function (symbol_id) {
        var me = this;
        me.node.filter(function(d){
            if (d.symbol_id == symbol_id) {
                console.log('unlockNode');
                d.is_locked = false;
                d.symbols =  d.symbols.filter(function(item){
                    return item.svgicon != 'icon-lock'
                });
                me.updateNodeSymbols(symbol_id);
                return true;
            }
        })
    },

    setNodeColor : function (symbol_id, color) {
        var me = this;
        me.node.filter(function(d){ return d.symbol_id == symbol_id })
            .selectAll('.node_svgicon')
            .attr("color", color);
    },

    // ------------------------ 生成拓扑图 ------------------------
    reloadTopo: function() {
        var me = this;
        var div, svg, brush;

        // 获取topo base div
        div = me.div = document.getElementById(me.mapid);

        // 删除存在的svg
        d3.select(div).selectAll("svg").remove();

        // 在topo div中加入svg元素
        svg = me.svg = d3.select(div).append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        // right mouse click callback
        svg.on("contextmenu", function(data, index){
            var position = d3.mouse(this);
            // console.info("topocontextmenu",this,position);
            me.fireEvent('topocontextmenu', me, position[0], position[1]);
            d3.event.preventDefault();
        });

        // 增加选择器图层
        brush = me.brush = svg.append("g")
            .style("stroke", "#fff")
            .style("fill-opacity", "0.1")
            .style("shape-rendering", "crispEdges");

        // 初始化力导向对象
        me.force = d3.layout.force()
                .linkDistance(me.linkDistance)
                .charge(me.charge)
                .size([div.clientWidth, div.clientHeight])
                .on("tick", me.tick);

        // 初始化链路方向箭头
        me.marker = me.getId()+"marker";
        svg.append("svg:defs").selectAll("marker")
            .data(me.link_colors)
          .enter().append("svg:marker")
            .attr("id", function(d,i){ return me.marker+i; })
            .attr("fill", function(d,i){ return d; })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("markerWidth", 7)
            .attr("markerHeight", 7)
            .attr("orient", "auto")
          .append("svg:path")
            .attr("d", "M0,-3L10,0L0,3");

        // ------------------------ Ctrl键 ------------------------
        d3.select("body")
            .on("keydown",function() {
                if (d3.event.keyCode==17) {
                    me.CtrlPress = true;
                }
            });

        d3.select("body")
            .on("keyup",function() {
                // console.info("keyup", d3.event.keyCode);
                if (d3.event.keyCode==17) {
                    me.CtrlPress = false;
                };
                if (d3.event.keyCode==46) {

                    return;
                    var selectedNodes=[];
                    for (var i in me.json.nodes) {
                        if (me.json.nodes[i].selected)
                            selectedNodes.push(me.json.nodes[i]);
                    }
                    console.info(selectedNodes);
                    me.deleteNode(selectedNodes);


                    var selectedLinks=[];
                    for (var i in me.json.links) {
                        if (me.json.links[i].selected)
                            selectedLinks.push(me.json.links[i]);
                    }
                    console.info(selectedLinks);
                    me.deleteLink(selectedLinks);
                }
            });


        // 加载json数据，显示topo
        console.log('---->load topo data:',me.url);
        d3.json(me.url, me.d3_loadjson); 

    },  // end reloadTopo


    init_d3_cb: function() {
        var me = this;
        return {

            // ------------------------ 力导向刷新函数 ------------------------
            tick: function(self) {

                // console.log('tick');
                if (!me.json) {
                    return;
                }

                var node = me.node;
                var link = me.link.selectAll("path");
                var link_select = me.link_select;
                var link_label = me.link_label;

                // ------------------- 移动有边界限制 -------------------
                // node
                //     .attr("cx",function(d){ return d.x = Math.max(me.node_size/2, Math.min(me.svg_width - me.node_size, d.x));})
                //     .attr("cy",function(d){ return d.y = Math.max(me.node_size/2, Math.min(me.svg_height - me.node_size, d.y));})
                //     .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                // ------------------- 移动无边界限制 -------------------
                node
                    .attr("cx",function(d){ return d.x})
                    .attr("cy",function(d){ return d.y})
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


                node.selectAll('.node_symbol')
                    .attr("y", 0-me.node_size/2 - me.symbol_size - 2 )
                    .style("visibility", function(d) {
                        if (d.show_node_symbol)
                            return "visible"
                        else
                            return "hidden"
                    });

                node.selectAll('text')
                    .style("visibility", function(d) {
                        if (d.show_node_label)
                            return "visible"
                        else
                            return "hidden"
                    });

                node.selectAll(".node-select").remove();
                node.filter(function(d){ return d.selected; })          
                    .insert("rect", ":first-child")      // attach a rectangle
                    .attr("class", "node-select")          
                    .attr("fill", "Gray")
                    .attr("fill-opacity", "0.5")
                    .attr("x", 0-me.node_size/2)         // position the left of the rectangle
                    .attr("y", 0-me.node_size/2)         // position the top of the rectangle
                    .attr("height", me.node_size)        // set the height
                    .attr("width", me.node_size); 

                link
                    .attr("d", function(d) {
                        var n = me.new_short_line(d.source, d.target, me.node_size*0.45);
                        if (me.multi_link_style==0) {
                            var p = me.get_path_coor(n, d, me.link_space);
                            d.path = "M" + p.source.x + "," + p.source.y
                                   + "L" + p.target.x + "," + p.target.y;
                        }
                        else if (me.multi_link_style==1) {
                            var n2 = me.new_short_line(n.source, n.target, n.l*0.07);
                            var p = me.get_path_coor(n2, d, me.link_space);
                            d.path = "M" + n.source.x + "," + n.source.y
                                   + "L" + p.source.x + "," + p.source.y
                                   + "L" + p.target.x + "," + p.target.y
                                   + "L" + n.target.x + "," + n.target.y;
                        }
                        else if (me.multi_link_style==2) {
                            var p = me.get_path_coor(n, d, me.link_space * 2.2);
                            d.path = "M" + n.source.x + "," + n.source.y
                                   + "Q" + (p.source.x + p.target.x)/2  + " " + (p.source.y + p.target.y)/2
                                   + "," + n.target.x + " " + n.target.y;
                        }
                        return d.path;
                    });

                link_select.selectAll(".link-select").remove();
                link_select.filter( function(d){ return d.selected; } )
                    .append("path")
                    .attr("class", "link-select")
                    .style("fill", "none")
                    .style("stroke", "#ccc")
                    .style("stroke-width", function(d){ return d.width + 6; })
                    .attr("d", function(d) { return d.path; });

                // link_label.filter(function(d){ return d.neg})
                //    .attr("dy", "11");

                link_label.selectAll("textPath")
                    .style("visibility", function(d) {
                        if (d.show_link_label && d.link_name1)
                            return "visible"
                        else
                            return "hidden"
                    });

            }, // end tick


            // ------------------------ 根据数据生成视图 ----------------------
            data2view: function() {

                me.force.nodes(me.json.nodes)
                        .links(me.json.links)
                        .start();

                // 将标识相同路径链接
                me.remark_links( me.json.links );

                // ------------------------------ node ---------------------------------

                var img_size = me.node_size - 8;
                me.node = me.node.data(me.json.nodes,function(d){return d.symbol_id});
                me.node.exit().remove();
                console.log("me.node",me.node);
                var node_g = me.node.enter().append("g")
                    .attr("class", "node")
                    .style("cursor", "pointer")
                    .call(me.node_drag)
                    .on("dblclick", function(d){ me.fireEvent('nodedblclick', d) })

                    .on("contextmenu", function(data, index){
                        var position = d3.mouse(this);
                        // console.info("nodecontextmenu",data.x+position[0], data.y+position[1]);
                        me.fireEvent('nodecontextmenu', me, data, data.x+position[0], data.y+position[1]);
                        d3.event.stopPropagation();
                        d3.event.preventDefault();
                    })

                    .on("mouseover", function(d){

                        if (me.add_link) {
                            d.selected = true;
                            me.tick();
                            if (me.link_source_node && me.link_source_node!=d) {
                                me.link_target_node = d;
                            }
                        }

                        d3.selectAll("title").remove();
                        d3.select(this).append("title").text(function(d){
                            return d.name;
                        });
                    })
                    .on("mouseout", function(d){
                        if (me.add_link && me.link_source_node!=d) {
                            d.selected = false;
                            me.link_target_node = null;
                            me.tick();
                        }
                    })
                    .on("mouseup", function(d) {
                        console.log("mouseup----->")
                        if (me.add_link && me.link_source_node!=d) {
                            me.fireEvent('linknodeselected', me.link_source_node, d) ;
                            me.link_target_node = null;
                        }
                    })
                    .on("mousedown", function(d) {

                        // console.info("add_link", me.add_link, d);
                        if (me.add_link) {
                            me.deselect_all();
                            me.link_source_node = d;
                            me.link_target_node = null;
                            me.drag_line = me.svg
                                // .append("line")
                                .insert("line", ":first-child") 
                                .attr("class", ".drag_line")
                                .style("stroke", "#666")
                                .style("stroke-width", 1.5)
                                .style("stroke-dasharray","6,3")
                                .attr("x1", d.x)
                                .attr("y1", d.y)
                                .attr("x2", d.x)
                                .attr("y2", d.y);
                            // return;
                        }

                        // 计算被选择节点数
                        var selected_count=0;
                        me.node.each(function(d){
                            if (d.selected)
                                selected_count += 1
                        });
                        link.each(function(d){
                            if (d.selected)
                                selected_count += 1
                        });

                        if (!me.CtrlPress && selected_count>=2 && d.selected)
                            return
                        if (!me.CtrlPress) {
                            me.deselect_all();
                        }

                        if (d.selected) {
                            d.selected = false;
                        } else {
                            d.selected = true;
                        }
                        
                        me.tick();
                        me.fireEvent('nodemousedown', this, me.node ) ;
                    });

                // console.info("node_g", JSON.stringify(node_g,null,4) );

                node_g.filter(function(d) { 
                    if (!d.hasOwnProperty('symbols') || d.symbols.length<=0)
                        return;

                    var symbol_width =  d.symbols.length * me.symbol_size;
                    for (var i in d.symbols) {
                        var symbol = d.symbols[i];
                        // node_g.filter(function(d2){ return d2.symbol_id==d.symbol_id})
                        //     .append("image")
                        //     .attr("class", "node_symbol")
                        //     .attr("xlink:href", d.symbols[i].img)
                        //     .style("pointer-events", "none")
                        //     .attr("x", 0-img_size/2 + i*10)
                        //     .attr("y", 0-img_size/2 - 15)
                        //     .attr("width", 9)
                        //     .attr("height", 9);

                        node_g.filter(function(d2){ return d2.symbol_id==d.symbol_id})
                            .append('svg:foreignObject')
                            .attr("class", "node_symbol")
                            .style("pointer-events", "none")
                            .attr("x", 0-symbol_width/2 + i * me.symbol_size)
                            // .attr("y", 0-img_size/2 - 20)
                            .attr('font-size', (me.symbol_size - 1) + 'px')
                            .attr("color", symbol.color)
                            .html(function(d) { return '<i class="icomoon ' + symbol.svgicon + '"></i>' });
                    }
                });

                node_g
                    .filter(function(d) { return !d.hasOwnProperty('svg_icon') || d.svg_icon==null})
                    .append("image")
                    .attr("class", "node_image")
                    .attr("xlink:href", function(d) { return d.img })
                    .attr("x", 0-img_size/2)
                    .attr("y", 0-img_size/2)
                    .attr("width", img_size)
                    .attr("height", img_size);

                node_g
                    .filter(function(d) { return d.hasOwnProperty('svg_icon') && d.svg_icon!=null})
                    .append('svg:foreignObject')
                    .attr("class", "node_svgicon")
                    .attr("x", 0-img_size/2)         // position the left of the rectangle
                    .attr("y", 0-img_size/2)         // position the top of the rectangle
                    .attr("color", function(d) { return d.svg_icon_color })
                    .attr('font-size', img_size+'px')
                    .html(function(d){ return '<i class="icomoon '+ d.svg_icon + '"></i>'} );
                   
                node_g.append("text")
                    .attr("dx", 0)
                    .attr("dy", me.node_size/2+10)
                    .style("text-anchor", "middle")
                    .style("pointer-events", "none")
                    .text(function(d) { return d.name });

                node_g.each(function(d){
                        d.x1 = d.x;
                        d.y1 = d.y;
                        d.fixed = me.node_fix;
                        d.show_node_label = me.show_node_label;
                        d.show_node_symbol = me.show_node_symbol;
                    });

                // ------------------------------ link ---------------------------------

                me.link = me.link.data(me.json.links, function(d){return d.linkid})
                me.link.exit().remove();
                var link = me.link.enter().append("svg:g")
                    .append("svg:path")
                    .attr("class", function(d) {
                        var w = d.width;
                        if (w>5)
                            w=5
                        if (w<1)
                            w=1
                        return "link-path-"+w
                    })
                    .style("fill", "none")
                    .style("stroke", function(d) {
                        if (0<=d.color && d.color<me.link_colors.length)
                            return me.link_colors[d.color]
                        else
                            return me.link_colors[0]
                    })
                    .style("stroke-dasharray", function(d) {
                        if (d.style==0) 
                            return ""
                        else
                        if (d.style==1) 
                            return "5,2"
                        else
                        if (d.style==2) 
                            return "3,1.5"
                        else
                        if (d.style==3) 
                            return "3,3"
                        else
                        if (d.style==4) 
                            return "5,5"
                        else
                        if (d.style==5) 
                            return "8,3"
                    })
                    .attr("id", function(d) { return me.getId()+d.link_symbol_id; })

                    .on("dblclick", function(d){ me.fireEvent('linkdblclick', d) })

                    .on("contextmenu", function(data, index){
                        var position = d3.mouse(this);
                        // console.info("linkcontextmenu",data,index,position[0], position[1]);
                        me.fireEvent('linkcontextmenu', me, data, position[0], position[1]);
                        d3.event.stopPropagation();
                        d3.event.preventDefault();
                    })

                    .on("mousedown", function(d) {
                        var selected_count=0;
                        var selected_link_count=0;
                        me.node.each(function(d){
                            if (d.selected)
                                selected_count += 1
                        });
                        link.each(function(d){
                            if (d.selected)
                                selected_link_count += 1
                        });

                        if (!me.CtrlPress && selected_count>=1 && selected_link_count >= 1 && d.selected)
                            return
                        if(selected_link_count >= 2 && d.selected)
                            return
                        
                        if (!me.CtrlPress) {
                            me.deselect_all();
                        }

                        if (d.selected) {
                            d.selected = false;
                        } else {
                            d.selected = true;
                        }

                        me.tick();
                        me.fireEvent('linkmousedown', this, link ) ;
                    })
                    .call(me.link_drag);


                link.filter(function(d) { return d.direction==1})
                    .attr("marker-end", function(d) { return "url(#"+me.marker+d.color+")"; });


                // me.link_select = me.link_select.data(me.json.links)
                me.link_select = me.link_select.data(me.json.links, function(d){return d.linkid})
                me.link_select.exit().remove();
                me.link_select.enter().append("svg:g");


                // 增加链接标签
                // me.link_label = me.link_label.data(me.json.links);
                me.link_label = me.link_label.data(me.json.links, function(d){return d.linkid})
                me.link_label.exit().remove();

                var link_label = me.link_label.enter().append("svg:text")
                    .attr("dy", "-3")
                    .attr("class", "path-label")
                    .style("pointer-events", "none");

                link_label.each(function(d) { 
                    d.show_link_label = me.show_link_label; 
                });

                link_label.filter(function(d){ return d.link_name1!=null })
                    .append("svg:textPath")
                      .attr("startOffset", "50%")
                      .attr("text-anchor", "middle")
                      .attr("xlink:href", function(d) { 
                             return "#" + me.getId()+d.link_symbol_id; 
                      })
                      .style("fill", function(d){
                            if (0<=d.color && d.color<me.link_colors.length)
                                return me.link_colors[d.color]
                            else
                                return me.link_colors[0]
                      })
                      .style("font-family", "Arial")
                      .style("font-size", "12px")
                      .text(function(d) { return d.link_name1 });

            },

            // ------------------------ d3 load json数据回调函数 ----------------------
            loadjson: function(error, json) {
                if (!json){
                    return;
                }

                var svg = me.svg;
                var div = me.div;
                var brush = me.brush;

                // ------------------------ 调整窗口大小 ------------------------
                var parentnode = null;
                if (json.parentnode.length > 0) {
                    parentnode = json.parentnode[0];
                }
                
                if (parentnode != null && parentnode.background_params != null) {
                    var params = JSON.parse(parentnode.background_params); 
                    me.background_opacity   = params.background_opacity;
                    me.background_type = params.background_type;
                    if (params.background_type == 'img') {
                        me.background_img       = params.background_img;
                        me.background_img_temp  = params.background_img;
                        me.background_opacity_img   = params.background_opacity;
                        me.initBackgroundColorTemp();
                        me.initBackgroundMapTemp();
                    } else if (params.background_type == 'color') {
                        me.background_color     = params.background_color;
                        me.background_color_temp     = params.background_color;
                        me.background_opacity_color   = params.background_opacity;
                        me.initBackgroundImgTemp();
                        me.initBackgroundMapTemp();
                    } else {
                        me.mapEnable            = params.mapEnable;
                        me.mapCenter            = new BMap.Point(params.mapCenter.lng, params.mapCenter.lat);
                        me.mapZoom              = params.mapZoom;
                        me.mapType              = me.getMapType(params.mapType.cf);

                        me.mapCenter_temp            = new BMap.Point(params.mapCenter.lng, params.mapCenter.lat);
                        me.mapZoom_temp              = params.mapZoom;
                        me.mapType_temp              = me.getMapType(params.mapType.cf);
                        me.background_opacity_map    = params.background_opacity;
                        me.initBackgroundColorTemp();
                        me.initBackgroundImgTemp();
                    }                
                } else {
                    me.background_opacity = 0.5;
                    me.background_type = 'color';
                    me.background_img = '';
                    me.background_color = "#F3F3F3";

                    // me.background_opacity_color = 0.5;
                    // me.background_opacity_img = 0.5;
                    // me.background_opacity_map = 0.5;
                    // me.background_img_temp = '';
                    // me.background_color_temp = "#F3F3F3";

                    // me.mapEnable = false;
                    // me.map = null;
                    me.initBackgroundColorTemp();
                    me.initBackgroundImgTemp();
                    me.initBackgroundMapTemp();
                }

                me.json = json;

                // for (var i in me.json.nodes) {
                //  // console.info(i, i%2);
                //  if (i%2==0){
                //      me.json.nodes[i].symbols = [];
                //      me.json.nodes[i].symbols.push({
                //          img: "static/public/css/icons/resource/newtopo/symbols/decoration/offline.png",
                //          width: 11,
                //          height: 13
                //      });
                //      me.json.nodes[i].symbols.push({
                //          img: "static/public/css/icons/resource/newtopo/symbols/decoration/fault.png",
                //          width: 11,
                //          height: 13
                //      });
                //      me.json.nodes[i].symbols.push({
                //          img: "static/public/css/icons/resource/newtopo/symbols/decoration/preconfig.png",
                //          width: 11,
                //          height: 11
                //      });
                //  }
                // }

                // ------------------------ 使用力导向布局 ------------------------
                me.force.nodes(json.nodes)
                    .links(json.links)
                    .start();
                
                // ------------------------ link init ------------------------

                me.link_drag = d3.behavior.drag()
                    .on("dragstart", me.dragstart)
                    .on("drag", me.dragmove)
                    .on("dragend", me.dragend);

                // 增加链接选择图层
                me.link_select = svg.append("svg:g").selectAll("path");

                // 增加链接图层
                me.link = svg.append("svg:g").selectAll("path");

                // 增加链接标签
                me.link_label = svg.append("svg:g").selectAll(".path-label");

                // ------------------------ Node init ------------------------

                var node_drag = me.node_drag = d3.behavior.drag()
                    .on("dragstart", me.dragstart)
                    .on("drag", me.dragmove)
                    .on("dragend", me.dragend);

                me.node = svg.selectAll(".node")


                // -------------- json.nodes json.links to view --------------

                me.data2view()

                me.initPanelSize(div.clientWidth,div.clientHeight);

                // 初始化背景图
                me.setBackgroundSize(me.svg.attr('width'), me.svg.attr('height'));
                me.setBackgroundOpacity(me.background_opacity);

                if (me.background_type == 'img') {
                    me.destroyGeoMap();
                    me.setBackgroundColor('#F3F3F3');
                    me.setBackgroundImage(me.background_img);
                } else if (me.background_type == 'color') {
                    me.destroyGeoMap();
                    me.setBackgroundImage('');
                    me.setBackgroundColor(me.background_color);
                } else {
                    if (me.mapEnable) {
                        me.setBackgroundColor('#F3F3F3');
                        me.setBackgroundImage('');
                        me.createGeoMap();                    
                    }
                }

                // 选中节点
                if (me.selectedNodes.length>0) {
                    me.node.each( function(d) {
                        d.selected = false;
                        for (var i in me.selectedNodes)  {
                            if (me.selectedNodes[i] == d.symbol_id) {
                                d.selected = true;
                                break;
                            }
                        }
                    });
                }

                // ------------------------ 选择框 ------------------------

                brush.call(d3.svg.brush()
                    .x(d3.scale.identity().domain([0, me.svg_width]))
                    .y(d3.scale.identity().domain([0, me.svg_height]))
                    .on("brushstart", function(d) {
                        // console.log("brushstart...");
                    })
                    .on("brush", function() {
                        var extent = d3.event.target.extent();
                        me.node.each( function(d) {
                            if (extent[0][0] <= d.x && d.x < extent[1][0]
                                && extent[0][1] <= d.y && d.y < extent[1][1])
                            {
                                d.selected = true;
                            }
                            else {
                                if (d.selected && me.CtrlPress) {
                                    d.selected = true;
                                } else {
                                    d.selected = false;
                                }
                            }
                        });

                        me.link.each( function(d) {
                            if ( extent[0][0] <= d.source.x && extent[0][0] <= d.target.x
                                && extent[1][0] >= d.source.x && extent[1][0] >= d.target.x
                                && extent[0][1] <= d.source.y && extent[0][1] <= d.target.y
                                && extent[1][1] >= d.source.y && extent[1][1] >= d.target.y )
                            {
                                d.selected = true;
                            }
                            else {
                                if (d.selected && me.CtrlPress) {
                                    d.selected = true;
                                }else {
                                    d.selected = false;
                                }
                            }
                        });

                        me.tick();
                    })
                    .on("brushend", function() {
                        var extent = d3.event.target.extent();
                        // console.log(extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
                        me.fireEvent('brushselected', this, me.node, me.link, extent[1][0], extent[1][1]);
                        d3.event.target.clear();
                        d3.select(this).call(d3.event.target);
                    })
                );

                me.fireEvent('loadcompleted', me);

            },

            // ------------------------ drag event ------------------------

            dragstart: function (d, i) {
                if (!("path" in d)) {
                    d.fixed = true;
                }
                var selected_count=0;
                me.node.each(function(d){
                    if (d.selected)
                        selected_count += 1
                });

                if (selected_count < 2)
                    return;

                me.force.stop() // stops the force auto positioning before you start dragging
            },

            dragmove: function (d, i) {
                if (me.add_link) {
                    // console.info("dragmove", d3.event, me.link_target_node );

                    if (me.link_target_node == null) {
                        me.drag_line
                            .attr("x2", d3.event.x)
                            .attr("y2", d3.event.y)
                            .style("stroke", "#666");
                    } else {
                        me.drag_line
                            .attr("x2", me.link_target_node.x)
                            .attr("y2", me.link_target_node.y)
                            .style("stroke", "red");
                    }
                    return;
                }
                if (me.view_locked) {
                    return;
                }
                var overborder = false;
                me.node.each(function(e) {
                    if (e.selected) {
                        if (e.x + d3.event.dx <= me.node_size/2
                            || e.x + d3.event.dx > me.svg_width - me.node_size
                            || e.y + d3.event.dy <= me.node_size/2
                            || e.y + d3.event.dy > me.svg_height - me.node_size ) {
                            overborder = true;
                        }
                    }

                });

                me.node.each(function(e) {
                    if (e.is_locked==1) {
                        return
                    };
                    if (e.selected && !overborder) {
                        e.px += d3.event.dx;
                        e.py += d3.event.dy;
                        e.x += d3.event.dx;
                        e.y += d3.event.dy;
                    }
                });

                me.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
            },

            dragend: function (d, i) {

                if (me.drag_line != null) {
                    me.drag_line.remove();
                    me.drag_line = null;
                }

                me.node.each(function(e){
                    if (e.selected) {
                        e.fixed = true;
                    } 
                });
                me.tick();
                me.force.resume();
            }            

        }

    }

});
