Ext.define('Admin.view.inventory.devicePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'devicePanel',

    //div
    //mapid
    //svg
    //url
    //data
    //brush

    padding: '20 0 0 20',
    isData: false,
    initComponent: function () {
        var me = this;

        //获取d3容器
        me.mapid = me.getId() + 'd3devicePanel';
        me.setHtml('<div style="width:100%;height:100%;position:absolute;top:0;left:0" id="' + me.mapid + '"></div>');
        me.callParent();
    },

    loadDevice: function (url) {
        var me = this;

        me.url = url;
        me.reloadDevice();
    },

    reloadDevice: function () {
        var me = this;
        var div, svg, brush;

        // 获取device base div
        div = me.div = document.getElementById(me.mapid);

        // 删除存在的svg
        d3.select(div).selectAll("svg").remove();

        // 在topo div中加入svg元素
        svg = me.svg = d3.select(div).append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        // right mouse click callback
        svg.on("contextmenu", function (data, index) {
            var position = d3.mouse(this);

            me.fireEvent('topocontextmenu', me, position[0], position[1]);
            d3.event.preventDefault();
        });

        // 增加选择器图层
        brush = me.brush = svg.append("g")
            .style("stroke", "#fff")
            .style("fill-opacity", "0.1")
            .style("shape-rendering", "crispEdges");


        // 加载json数据，显示tdevice
        d3.json(me.url, function(err, json){
            if(err){
                me.up('panel').hide();
                return false;
            }

            me.loadJson(json);
        });
    },

    format: function (data) {
        if (data && data['SlotConfigEntry']) {
            var slotData = data['SlotConfigEntry'];
            var oneSlot = {
                SlotName: data['DeviceModel'],
                SlotIndex: 1,
                SlotStatus: 'inservice'
            };
            var twoSlot = {
                SlotName: '',
                SlotIndex: 2
            };

            var newData = [oneSlot, twoSlot].concat(slotData);

            var cardLen = slotData.length + 2;
            var col = 2;
            var row = Math.ceil(cardLen / col);
            var padding = 10;
            var powerCount = 2;
            var margin = 20;
            var svgBorderWidth = 2;

            var slot = {dx: 200, dy: 40};
            var fanDy = slot.dy * row + (row - 1) * padding;
            var fan = {dx: 50, dy: fanDy};
            var powerDy = (fanDy - padding ) / powerCount;
            var power = {dx: 50, dy: powerDy};

            var svg = {
                width: 2 * margin + 2 * power.dx + 3 * padding + 2 * slot.dx + 2 * svgBorderWidth,
                height: 2 * margin + fan.dy + 2 * svgBorderWidth
            };

            //////// power ////////////////////////////////////////////////////
            var power_1 = {
                x: margin,
                y: margin,
                dx: power.dx,
                dy: power.dy,
                name: 'PWR1',
                borderColor: '#888',
                fillColor: "#0D0D0D",
                type: 'power'
            };
            var power_2 = {
                x: margin,
                y: margin + power.dy + padding,
                dx: power.dx,
                dy: power.dy,
                name: 'PWR2',
                borderColor: '#888',
                fillColor: "#0D0D0D",
                type: 'power'
            };

            var cr1 = 10;
            var cr2 = 5;

            var fan_xy = {
                x: margin + power.dx + padding,
                y: margin,
                dx: fan.dx,
                dy: fan.dy,
                name: 'FANS',
                borderColor: '#888',
                fillColor: "#CBCBCB",
                type: 'fan'
            };

            fan_xy.circles = [
                {
                    cx: fan_xy.x + fan_xy.dx/2,
                    cy: Math.floor(fan_xy.y + fan_xy.dy/3 * 2),
                    r: cr1
                },{
                    cx: fan_xy.x + fan_xy.dx/2,
                    cy: Math.floor(fan_xy.y + fan_xy.dy/3 * 2),
                    r: cr2
                }
            ];

            ///////////////////// slot //////////////////////////////////////////
            var line_padding = 2;

            /////////////////// rect start x y///////////////////////////////////////////////
            var r = 10;
            var start_x = margin + power.dx + 2 * padding + fan.dx;
            var start_y = margin;

            var line_left_x = start_x + line_padding;
            var line_left_y = start_y + slot.dy / 2;

            var line_right_x = line_left_x + 2 * r;
            var line_right_y = line_left_y;

            var line_top_x = start_x + line_padding + r;
            var line_top_y = start_y + slot.dy / 2 - r;

            var line_bottom_x = line_top_x;
            var line_bottom_y = start_y + slot.dy / 2 + r;

            var circle_left_x = start_x + line_padding + r;
            var circle_left_y = start_y + slot.dy / 2;

            var circle_right_x = circle_left_x + (slot - line_padding * 2 - 2 * r );
            var circle_right_y = circle_left_y;

            for (var i = 0; i < newData.length; i++) {

                newData[i].dx = slot.dx;
                newData[i].dy = slot.dy;
                newData[i].borderColor = (newData[i].SlotStatus == 'inservice') ? 'green' : '#888';
                newData[i].fillColor = '#CBCBCB';
                newData[i].dx = slot.dx;
                newData[i].name = newData[i].SlotName;
                newData[i].type = 'slot';

                //rect
                var offset_y = slot.dy + padding;
                var offset_x = slot.dx + padding;

                if (newData[i].SlotIndex % 2 === 0) {
                    newData[i].x = start_x + offset_x;
                    newData[i].y = start_y + offset_y * ((newData[i].SlotIndex - 2) / 2);
                } else {
                    newData[i].x = start_x;
                    newData[i].y = start_y + offset_y * ((newData[i].SlotIndex - 1) / 2);
                }

                //circle

                newData[i].circles = [];

                var leftCircle = {
                    cx: newData[i].x + line_padding + r,
                    cy: newData[i].y + slot.dy / 2,
                    r: r
                };
                var offset_cx = slot.dx - (line_padding + r) * 2;
                var rightCircle = {
                    cx: leftCircle.cx + offset_cx,
                    cy: leftCircle.cy,
                    r: r
                };

                newData[i].circles.push(leftCircle);
                newData[i].circles.push(rightCircle);

                newData[i].lines = [];

                newData[i].lines.push({
                    x1: leftCircle.cx - r,
                    y1: leftCircle.cy,
                    x2: leftCircle.cx + r,
                    y2: leftCircle.cy
                });

                newData[i].lines.push({
                    x1: leftCircle.cx,
                    y1: leftCircle.cy - r,
                    x2: leftCircle.cx,
                    y2: leftCircle.cy + r
                });

                newData[i].lines.push({
                    x1: leftCircle.cx - r + offset_cx,
                    y1: leftCircle.cy,
                    x2: leftCircle.cx + r + offset_cx,
                    y2: leftCircle.cy
                });

                newData[i].lines.push({
                    x1: leftCircle.cx + offset_cx,
                    y1: leftCircle.cy - r,
                    x2: leftCircle.cx + offset_cx,
                    y2: leftCircle.cy + r
                });
            }

            var array = [power_1, power_2, fan_xy].concat(newData);


            return {
                data: array,
                rect: {
                    dx: svg.width,
                    dy: svg.height,
                    x: 0,
                    y: 0,
                    borderColor: '#888',
                    fillColor: "#E9E7E7"
                }
            };
        }else{
            return {};
        }
    },

    dragmove: function(){
        var g = d3.select(this);

        g.selectAll('rect')
            .each(function(d){

            });

        g.selectAll('circle')
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);

        g.selectAll('line')
            .attr("x1", d3.event.x)
            .attr("y1", d3.event.y);

        g.selectAll('text')
            .attr("x", d3.event.x)
            .attr("y", d3.event.y);
    },

    zoomOut : function() {
        var me = this;

        me.circles
            .attr("cx", function(d) {
                return d.clx * 1.25;
            })
            .attr("cy", function(d) {
                return d.cly * 1.25;
            });

        me.svg_width = me.svg_width * 1.25;
        me.svg_height = me.svg_height * 1.25;


        me.svg.attr("width", me.svg_width)
            .attr("height",  me.svg_height);
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
        }
    },

    zoomReset : function() {
        var me = this;
        me.initPanelSize(me.getSize().width, me.getSize().height);
        me.node.each(function(d){
            d.x = d.px = d.x1;
            d.y = d.py = d.y1;
        });
        me.tick();
    },

    loadJson: function (json) {
        var div, svg, data, rectdata;
        var me = this;

        if(!json || !json.data){
            return;
        }

        //格式化设备面板数据结构
        me.json = me.format(json.data.output);

        if(!me.json){
            me.up('panel').hide();
            return;
        }

        data = me.json.data;
        rectdata = me.json.rect;

        me.isData = true;
        if(!data || !rectdata){
            me.isData = false;
            me.up('panel').hide();
            return;
        }

        me.up('panel').show();

        // 获取device panel base div
        div = me.div = document.getElementById(me.mapid);

        // 删除存在的svg
        d3.select(div).selectAll("svg").remove();

        //添加缩放事件
        var zoom = d3.behavior.zoom()
            .scaleExtent([-10, 10])
            .on("zoom", function(){
                d3.select(this).attr("transform",
                    "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

            });


        // 在topo div中加入svg元素
        svg = me.svg = d3.select(div).append("svg")
            .attr("width", '100%')
            .attr("height", '100%');
        //.call(zoom);


        //添加拖动事件
        var drag = me.slotDrag = d3.behavior.drag()
            .origin(function() {
                var t = d3.select(this);
                return {
                    x: t.attr("x"),
                    y: t.attr("y"),
                    cx: t.attr("cx"),
                    cy: t.attr("cy")
                };
            })
            .on("drag", me.dragmove);

        //添加设备面板框架矩形
        var mainrect = svg.append('rect')
            .attr('x', rectdata.x)
            .attr('y', rectdata.y)
            .attr('width', rectdata.dx)
            .attr('height', rectdata.dy)
            .attr('stroke', rectdata.borderColor)
            .attr("stroke-width", "5px")
            .attr("fill", rectdata.fillColor)
            .style("opacity", 1);

        //添加分组数据
        var g = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");
        //.call(drag);

        var rects = me.rects =  g.append("rect")
            .attr('x', function(d){ return d.x})
            .attr('y', function(d){ return d.y})
            .attr('width', function(d){ return d.dx})
            .attr('height', function(d){ return d.dy})
            .attr('stroke', function(d){ return d.borderColor})
            .attr('stroke-width', '4px')
            .attr('fill', function(d){ return d.fillColor});

        var circles = me.circles = g.selectAll("circle")
            .data(function(d){
                if(d.circles){
                    return d.circles
                }else{
                    return [];
                }
            })
            .enter()
            .append('circle')
            .attr('cx', function(d){ return d.cx})
            .attr('cy', function(d){ return d.cy})
            .attr('r', function(d){ return d.r})
            .attr('stroke', 'gray')
            .attr('stroke-width', '2px')
            .attr('fill', 'none');

        var lines = me.lines = g.selectAll('line')
            .data(function(d){
                if(d.lines){
                    return d.lines;
                }else{
                    return [];
                }
            })
            .enter()
            .append('line')
            .attr('x1', function(d){ return d.x1})
            .attr('y1', function(d){ return d.y1})
            .attr('x2', function(d){ return d.x2})
            .attr('y2', function(d){ return d.y2})
            .attr('stroke', 'gray')
            .attr('stroke-width', '2px');

        var texts = me.texts = g.append("text")
            .attr("x", function (d) {return d.x + d.dx / 2;})
            .attr("y", function (d, i) {return (i === 2) ? d.y + d.dy / 3 : d.y + d.dy / 2;})
            .attr("dy", ".35em")
            .attr("fill", function (d, i) {
                if (i === 0 || i === 1 || i === 2) {
                    return "white";
                } else {
                    return "black";
                }
            })
            .attr("text-anchor", "middle")
            .text(function (d) {return d.name;})
            .style("opacity", function (d) {
                d.w = this.getComputedTextLength();
                return 1;
            });

        var tooltip = d3.select(div)
            .append("div")
            .attr("class","tooltip")
            .style("opacity",0.0);


        g.on("mouseover", function (d) {
            /*
             鼠标移入时，
             （1）通过 selection.html() 来更改提示框的文字
             （2）通过更改样式 left 和 top 来设定提示框的位置
             （3）设定提示框的透明度为1.0（完全不透明）
             */
            var tip = "";
            var offsetTop = 0;

            switch (d.type){
                case 'power': {
                    tip += "<strong>" + _('PowerName') + "</strong>" + d.name;
                }  break;
                case 'fan': {
                    tip += "<strong>" + _('FanName') + "</strong>" + d.name;
                } break;
                case 'slot': {
                    if(d.name){
                        tip += "<strong>" + _('SlotName') + "</strong>" + d.name + "<br/>";
                    }

                    tip += "<strong>" + _('SlotNumber') + "</strong>" + d.SlotIndex + "<br/>";
                    tip += d.name ? "<strong>" + _('SlotName') + "</strong>" + d.name + "<br/>" : "";

                    if(d.SlotStatus){
                        var status = d.SlotStatus == 'inservice' ? _('Regin') : _('NoRegin');

                        tip += d.SlotStatus ? "<strong>" + _('SlotStatus') + "</strong>" + status+ "<br/>" : "";
                    }

                    tip += d.SlotFirmwareRevision ? "<strong>" + _('SlotFirmwareRevision') + "</strong>" + d.SlotFirmwareRevision + "<br/>" : "";
                    tip += d.SlotType ? "<strong>" + _('SlotType') + "</strong>" + d.SlotType+ "<br/>" : "";
                    tip += d.SlotSerialNum ? "<strong>" + _('SlotSerialNum') + "</strong>" + d.SlotSerialNum + "<br/>" : "";
                    tip += d.SlotHardwareRevision ? "<strong>" + _('SlotHardwareRevision') + "</strong>" + d.SlotHardwareRevision+ "<br/>" : "";
                    tip += d.SlotCapablity ? "<strong>" + _('SlotCapablity') + "</strong>" + d.SlotCapablity : "";

                    if(d.SlotIndex == 5 || d.SlotIndex == 6){
                        offsetTop = 100;
                    }else if(d.SlotIndex == 7 || d.SlotIndex == 8){
                        offsetTop = 150;
                    }
                } break;
            }

            var top = offsetTop;

            tooltip.html(tip)
                .style("left", (d3.event.offsetX) + "px")
                .style("top", (d3.event.offsetY - top) + "px")
                .style("opacity", 1.0);
             })
            .on("mousemove", function (d) {
                /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */
                tooltip.style("left", (d3.event.offsetX + 20) + "px")
                    .style("top", (d3.event.offsetY - top) + "px");
            })
            .on("mouseout", function (d) {
                /* 鼠标移出时，将透明度设定为0.0（完全透明）*/
                tooltip.style("opacity", 0.0);
            });

        me.fireEvent('loadcompleted', me);
    },

    setParentPanel: function (tabpanel) {
        var me = this;
        me.parenPanel = tabpanel;
    }
});
