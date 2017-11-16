Ext.define('Admin.base.termController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.termController',


    init: function (view) {
        //this.loginStrList = ["Input hostip","Input port", "Input UserName", "Input Password"];
        this.loginStrList = ["Input port", "Input UserName", "Input Password"];
        this.wsList = new Array(); //打开的WebSocket数
        this.successLoginInfo = new Array();
        this.terminals = new Array();//打开的终端数
        this.jpPanels = new Array();//打开的jsPanel数量
        this.jsScrollHeight=[]//打开的jsPanel滚动条的位置;
        this.termNum = 0;//终端容器数量
        this.frontTermId = "";//当前置顶的终端
        this.lastR="";
        this.jsPanelHeight=420;
        this.termRows=100;
        this.termCols=104;
        this.winIndex=20000;
        //this.lastReciveInfo="";
        this.winMaxNum=0;
        this.winMinList=[];
        this.enterTabValue="";
    },

    destroy:function(){
        console.log('destroy');
    },

    onSShSubmit: function (form, event) {

        Ext.getCmp('myWin').hide();

        var me = this;
        var _selfFrom = me.lookupReference('referenceSShForm');

        if (!_selfFrom.isValid()) {
            //Ext.MessageBox.alert("提示", "输入参数有误，请重新输入！");
            return;
        }

        var connInfo = me.getConnInfo(_selfFrom);
        if (connInfo == null) {
            return;
        }

        me.initLogInfo();

        if ($('#jsPanel-' + connInfo.nodeId).length) {
            //已经存在则不需要创建
            var win =me.jpPanels[connInfo.nodeId];
            if(me.jpPanels[connInfo.nodeId].winCollapse=="close"){
                me.winMaxNum++;
                me.winMinList.splice(me.winMinList.indexOf(this.id),1);
                win.winCollapse='open';
                win.setWidth(1000);
                win.toggleCollapse();
                win.getEl().setXY ([me.getMaxX(win.getWidth()),me.getMaxY(600)]);
            }
            win.setZIndex(this.winIndex+1);
            me.terminals[connInfo.nodeId].cursorOn();
            me.terminals[connInfo.nodeId].focus();
            me.frontTermId = connInfo.nodeId;
            return;
        }
        else {
            me.wsOpen(connInfo);
        }

        var websocket = me.findWebSocket(connInfo.nodeId);//获取当前的websocket

        //输出信息
        for (var i in connInfo) {
            if (connInfo.hasOwnProperty(i) && (i == "ip" || i == "port" || i == "name" || i == "pwd")) {
                //console.log('send:' + connInfo[i]);
                me.sendMessage(websocket.ws, connInfo[i]);
            }
        }

        setTimeout(function(){
            if(websocket.isConnected==false) {
                websocket.ws.close();
                me.showToast(connInfo.nodeLable + _('Connection timeout, please reconnect or check network status'));
            }
        },20000);
        me.frontTermId = connInfo.nodeId;
    },

    getWsIp: function(){
            console.log("-----------------getWsIp--------------");
            var data = "";
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/eline/get_ws_ip',
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = Ext.util.JSON.decode(response.responseText);
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
    },

    //每次点击确定时清除登录信息
    initLogInfo: function () {
        TermGlobals.activeTerm=null;
        this.successLoginInfo=[];
        this.frontTermId = "";
        this.lastR="";
        this.enterTabValue="";
    },

    //获取节点的连接信息
    getConnInfo: function (form) {
        if (!form) {
            return null;
        }
        var formValues = form.getForm().getValues();
        if (formValues) {
            var nodeId = formValues["nodeId"];
            if (nodeId && isNaN(nodeId) && nodeId.indexOf(':') > -1) {
                nodeId = nodeId.replace(/:/g, '');
            }
            // var arrtemp = "http://172.16.75.111:8181/index.html#/topology".split(':');
            //var wsUri = "ws:172.16.75.118:9001" + "/" + formValues["protocal"].toLowerCase();
            //var wsUri = "ws:172.16.75.111:9001" + "/" + formValues["protocal"].toLowerCase();
            // var wsUri = "ws:/sdnWs/" + formValues["protocal"].toLowerCase();
            var ip_port = "127.0.0.1:9001";

            var wsUri = "ws:"+APP.terminal_websocket_host + ":"+APP.terminal_websocket_port+"/" + formValues["protocal"].toLowerCase();
            var connInfo = {
                "nodeLable": formValues["ip"],//formValues["nodeLable"],
                "nodeId": nodeId,
                "wsUri": wsUri,
                "ip": formValues["ip"],
                "port": formValues["port"],
                "protocal": formValues["protocal"],
                "name": formValues["userName"],
                "pwd": formValues["password"]
            }
            return connInfo;
        }
        else
            return null;
    },

    //创建WebSocket
    wsOpen: function (connInfo) {
        var me = this;
        var wsUri = "ws:127.0.0.1:9001/" + connInfo.protocal.toLowerCase();
        var ws_ip = me.getWsIp();
        if (!ws_ip) {
            var host = window.location.host.split(':')[0];
            var ip = host == 'localhost' ? '127.0.0.1' : host;
            wsUri = "ws:" + ip + ":9001/" + connInfo.protocal.toLowerCase();
            // wsUri = "ws:172.16.75.220:9001/" + connInfo.protocal.toLowerCase();//测试用
        } else {
            wsUri = "ws:" + ws_ip.ip + ":9001/" + connInfo.protocal.toLowerCase();
        }

        console.log("开始创建WebSocket---wsUri:" + wsUri);


        if (me.isExistWS(connInfo.nodeId)){
            me.closeWebSocket(connInfo.nodeId);
        }

        var websocket = new WebSocket(wsUri);//新建一个websocket连接
        var wsObj = {"nodeId": connInfo.nodeId, "ws": websocket,"isConnected":false};
        var userName =connInfo['name']+"#";
        me.wsList.push(wsObj);

        websocket.onopen = function (evt) {
            console.log("connecting...");
        };

        websocket.onclose = function (evt) {
            console.log("websocket closed");
            console.log("websocket " + connInfo.nodeLable + " closed");
            me.closeWebSocket(connInfo.nodeId);
        };

        websocket.onmessage = function (evt) {
            console.log("receive:" + evt.data);
            if(evt.data=='ERROR!'){
                websocket.close();
                me.showToast(_("Connection error, please reconnect"));
                return;
            }
            var nameStr = connInfo.name.substring(0, 1).toUpperCase() + connInfo.name.substring(1);
            var loginEndStrList = [connInfo.name + "@", nameStr + "@", connInfo.name + "#", nameStr + "#", "Password"];
            if (me.isExistStr(evt.data, me.loginStrList) === false) {
                //me.deleteSpecialChar(evt.data);
                me.successLoginInfo.push(me.deleteSpecialChar(evt.data));
                if (me.isExistStr(evt.data, loginEndStrList) === true) {
                    me.saveNodeConnInfo(connInfo);//存节点登录信息
                    wsObj.isConnected = true;
                    //me.lastReciveInfo =userName.replace(/^\S/,function(s){return s.toUpperCase();});
                    me.openTermlib(connInfo); //登录成功 打开终端窗口
                }
            }

        };

        websocket.onerror = function (evt) {
            console.log("websocket error");
            me.closeWebSocket(connInfo.nodeId);
            me.showToast(_("Connection error, please reconnect"));
        };
    },

    //打开Termlib终端
    openTermlib: function (connInfo) {
        var me= this;
        var m = connInfo.nodeId; //当前结点

        //获取包含jpPanel的容器
        //var divContainer = $("div[id^='rightContainer']:eq(2)").length == 0 ? $("div[id^='rightContainer']:eq(0)") : $("div[id^='rightContainer']:eq(2)");

        if (!me.terminals[m] || (me.terminals[m] && me.terminals[m].closed)) {
            //生成DOM结点
            var termDom = $('<div id="terminal0" class="x-selectable" style="position:absolute; color:white;visibility: hidden; display:none;z-index:1">\
                            <table cellpadding="0" cellspacing="0">\
                            <tr><td ><div name="termDiv" id="termDiv0" style="position:relative;"></div></td></tr>\
                            </table> </div>');

            var copy = termDom.clone(true); //生成Termlib容器
            $(copy).attr('id', 'terminal' + m);
            $(copy).css({'margin': 0, 'padding': 0, 'float': 'left', 'border-color': '#eeeeee'});

            var termDiv = $(copy).find("div[name='termDiv']");
            $(termDiv).attr('id', 'termDiv' + m);

            var offsetX, offsetY; //避免多个窗口重
            offsetX = 30 + me.termNum * 20;
            offsetY = 30 + me.termNum * 20;
            me.termNum++;

            me.jpPanels[m] = Ext.create('Ext.window.Window',{
                title:'<div align="left" title="'+connInfo.nodeLable+'"> '+connInfo.protocal+'  '+ connInfo.nodeLable + '</div>',
                id: 'jsPanel-' + m,
                width:1000,
                height:600,
                y:60,
                resizable:false,
                autoScroll: true,
                minimizable:true,
                constrain: true,//禁止窗口移出浏览器屏幕
                winCollapse:'open',
                html:copy[0].outerHTML,
                renderTo:Ext.getBody(),
                bodyStyle: {background: '#181818'},
                listeners: {
                    minimize: function (){
                        //关键部分：最大化后需要将窗口重新定位，否则窗口会从最顶端开始最大化
                        //w.setPosition(document.body.scrollLeft, document.body.scrollTop);
                        var nodeId= me.getNodeIdFromJsPanel(this.id);
                        if(this.winCollapse=='open'){
                            me.winMaxNum--;
                            me.winMinList.push(this.id);
                            if(nodeId) {
                                me.terminals[m].cursorOff();
                                me.terminals[m].unfocus();
                            }
                            this.winCollapse='close';
                            this.setWidth(200);
                            this.collapse();
                            this.getEl().setXY ([me.getMinX(),me.getMinY(me.winMinList.length)]);
                        } else {
                            me.winMaxNum++;
                            me.winMinList.splice(me.winMinList.indexOf(this.id),1);
                            if(nodeId) {
                                me.terminals[nodeId].cursorOn();
                                me.terminals[nodeId].focus();
                            }
                            this.winCollapse='open';
                            this.setWidth(1000);
                            this.toggleCollapse();
                            this.getEl().setXY ([me.getMaxX(this.getWidth()),me.getMaxY(600)]);
                        }
                    },
                    close:function(){
                        var nodeId =me.getNodeIdFromJsPanel(this.id);
                        if(nodeId) {
                            console.log("close terminal:" + nodeId);
                            if ((me.terminals[nodeId]) && (me.terminals[nodeId].closed === false)) {
                                me.jsScrollHeight[nodeId]=0;
                                me.terminals[nodeId].cursorOff();
                                me.terminals[nodeId].unfocus();
                                me.terminals[nodeId].closed = true;
                                me.terminals[nodeId].clear();
                                //关闭websocket连接
                                me.closeWebSocket(nodeId);
                            }
                        }
                        me.closeWindow(this.id);
                    }
                }
            });

            me.winMaxNum++;//最大化窗口个数
            me.jsScrollHeight[m]=0;
            me.terminals[m] = new Terminal({
                x: 0,
                y: 0,
                cols:me.termCols,
                rows:me.termRows,
                id: m,
                termDiv: 'termDiv' + m,
                frameWidth: 0,
                bgColor: '#181818',
                ps: '',
                crsrBlinkMode: true,
                blink_delay: 1000,
                greeting: me.successLoginInfo, //登录成功显示信息
                handler: function(keyCode){
                    var obj = this;
                    var line = obj.lineBuffer;
                    obj.cursorOff();
                    obj.newLine(); //每次获取到输入 则转到下一行
                    if (line !== '' && line.replace(/ /g,'') !='') {
                        if (line === 'exit terminal') {
                            obj.clear();
                            obj.close();
                            return;
                        }
                        else if (me.wsList) {
                            var len = line.length;
                            if (line[len - 1] === '\n') {
                                line = line.substring(0, len - 1);
                            }

                            var curWs,wslen=me.wsList.length;
                            for (var i = 0; i < wslen; i++) {
                                if (me.wsList[i].nodeId === obj.id) {
                                    curWs = me.wsList[i].ws;
                                    break;
                                }
                            }
                            if(curWs){
                                if(keyCode && keyCode=='tab') {
                                    me.wsProcess(curWs, obj, line+"?",true);
                                }
                                else
                                    me.wsProcess(curWs, obj, line);
                            }
                        }
                    }  else {
                        var curWs,wslen=me.wsList.length;
                        for (var i = 0; i < wslen; i++) {
                            if (me.wsList[i].nodeId === obj.id) {
                                curWs = me.wsList[i].ws;
                                break;
                            }
                        }
                        if(keyCode && keyCode=='tab'){
                            if (curWs)
                                me.wsProcess(curWs, obj, "?",true);

                        } else {
                            if (curWs){
                                if(obj.isMore && keyCode=="space" ){
                                    me.wsProcess(curWs, obj, '^^\r');
                                }
                                else {
                                    if (line.split(' ').length == 1) {
                                        me.wsProcess(curWs, obj, "^^\n");
                                    }
                                    else {
                                        me.wsProcess(curWs, obj, '^^\r');
                                    }
                                }
                            }
                        }
                        /* //obj.prompt();
                        obj.cursorOff();
                        me.lastR = obj.r;
                        obj.cursorSet(me.lastR, 0);
                        obj.write(me.lastReciveInfo);
                        obj.cursorOn();
                        obj.cursorSet(obj.r, obj.c + 1);
                        obj.lock = false;
                        if(me.jsScrollHeight[obj.id] >-1) {
                            me.scrollToPosition(obj.id, me.termRows, me.jsPanelHeight, obj.r, me.lastR);
                        }
                        me.lastR = obj.r;*/
                    }
                },
                exitHandler: function(){
                    console.log("close:" + this.id);
                    if ((me.terminals[this.id]) && (me.terminals[this.id].closed === false)) {
                        me.jsScrollHeight[this.id]=0;
                        me.terminals[this.id].cursorOff();
                        me.terminals[this.id].unfocus();
                        me.terminals[this.id].closed = true;
                        if (me.jpPanels[this.id]) {
                            me.jpPanels[this.id].close();
                        }
                    }
                }
            });

            if (me.terminals[m]) {
                me.terminalShow(m);
                me.terminals[m].open();
            }
            me.jpPanels[m].show();

        }
        else if (me.terminals[m] && !me.terminals[m].closed) {
            me.terminalShow(m);
            if (me.jpPanels[m]) {
                me.jpPanels[m].show();
            }
        }

        $('#jsPanel-' + m).bind("paste", function (e) {
            e = e.originalEvent;
            var cbd = e.clipboardData;
            var ua = window.navigator.userAgent;

            // 如果是 Safari 直接 return
            if (!(e.clipboardData && e.clipboardData.items)) {
                return;
            }

            // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
            if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" &&
                cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files" &&
                ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
                return;
            }

            for (var i = 0; i < cbd.items.length; i++) {
                var item = cbd.items[i];
                if (item.kind === "string" && item.type === "text/plain") {
                    item.getAsString(function(line){
                        me.pasteProcess(me.terminals[me.frontTermId], line);
                    });
                }
            }
        });

        $('#jsPanel-' + m).mouseleave(function (e) {
            var nodeId =me.getNodeIdFromJsPanel(this.id);

            if(nodeId && me.terminals && me.terminals[nodeId]) {
                me.terminals[nodeId].cursorOff();
                me.terminals[nodeId].unfocus();
            }
        });

        $('#jsPanel-' + m).mouseenter(function (e) {
            var nodeId =me.getNodeIdFromJsPanel(this.id);

            if(nodeId && me.terminals && me.terminals[nodeId]) {
                me.frontTermId = nodeId;
                me.jpPanels[nodeId].setZIndex(this.winIndex+1);
                me.terminalShow(nodeId);
                me.terminals[nodeId].cursorOn();
                me.terminals[nodeId].focus();
            }
        });

    },

    //设置活动的Termlib终端
    terminalShow: function (nodeId) {
        TermGlobals.setElementXY('terminal' + nodeId, 0, 0);
        var obj = $('#' + 'terminal' + nodeId);
        if (obj) {
            obj.css('display', 'block');
            obj.focus();
        }
    },

    //终端每次粘贴的处理方法
    pasteProcess: function (obj, line) {
        obj.write(line);
        obj.cursorOn(); //光标位置
        obj.cursorSet(obj.r, obj.c);
        obj.lock = false;
        this.lastR = obj.r;
    },

    //终端每次回车的处理方法
    wsProcess:function(ws, obj, line,isTab) {

        var me =this;

        if(me.enterTabValue !=""){
            if(line.length <=me.enterTabValue.length)
                line = '';
            else{
                if(line.indexOf(me.enterTabValue)==0){
                    line = line.substr(me.enterTabValue.length)
                }
            }
            me.enterTabValue="";
            ws.send(line);
        }
        else {
            ws.send(line);
        }
        console.log('terminal send:' + line);
        me.lastR = obj.r;
        ws.onmessage = function(evt) {
            console.log("receive:" + evt.data);

            var receiveData = evt.data,
                termId = obj.id;

            obj.isMore = false; //判断是否含有More命令
            if (receiveData && receiveData.replace(/ /g,"") !="" && termId === me.frontTermId) {
                obj.cursorSet(me.lastR, 0);
                 if(isTab && receiveData.indexOf('#')>-1) {
                    //处理帮助显示的命令
                    var arrTemp=receiveData.split('#');
                    receiveData = arrTemp[0] + "#";
                    if(arrTemp[1])
                        me.enterTabValue=arrTemp[1];
                }
                if(receiveData.indexOf('--More--') >-1)
                    obj.isMore=true;

                var text = receiveData.replace(/&nbsp;/g, ' ');

                if (text.lastIndexOf("&nbsp;") !== -1 && text.substring(text.lastIndexOf("&nbsp;")) === '&nbsp;') {
                    text = text.substring(0, text.lastIndexOf("&nbsp;"));
                }

                var textArr = text.split('\n');

                var allBr = true; //默认全为<br>
                for (var i = 0; i < textArr.length; i++) {
                    if (textArr[i].length !== 0) {
                        allBr = false;
                        break;
                    }
                }

                if (allBr === true) {
                    textArr.pop();
                }

                for (var j = 0; j < textArr.length; j++) {
                    if (textArr[j].length === 0) {
                        textArr[j] = "\n";
                    } else { //过滤特殊字符
                        if (textArr[j].indexOf("\r") !== -1) { //从后台传过来的字符串末尾会多一个\r字符串
                            textArr[j] = textArr[j].substring(0, textArr[j].length - 1);
                        }
                        textArr[j] = textArr[j].replace(/0m/g, 'm').replace(/01;31m/g, 'm');
                        textArr[j] = textArr[j].replace(/01;32m/g, 'm').replace(/01;33m/g, 'm').replace(/01;34m/g, 'm');
                        textArr[j] = textArr[j].replace(/01;35m/g, 'm').replace(/01;36m/g, 'm').replace(/01;37m/g, 'm');
                        textArr[j] = textArr[j].replace(/\[\m/g, '').replace(/\[\K/g, '').replace(/[\[\]]/g, '');

                        var strArr = [];
                        var special;
                        for (var k = 0; k < 17; k++) {
                            if(k==10)
                                continue;
                            special = String.fromCharCode(k);
                            strArr = textArr[j].split(special);
                            textArr[j] = strArr.join("");
                        }

                        special = String.fromCharCode(27);
                        strArr = textArr[j].split(special);
                        textArr[j] = strArr.join("");

                    }
                }
                var textTemp=[];
                for(var i in textArr ){
                    if(textArr.hasOwnProperty(i) && textArr[i] !="" )
                        textTemp.push(textArr[i]);
                }
                obj.write(textTemp);
                obj.cursorOn();
                obj.cursorSet(obj.r, obj.c + 1);
                obj.lock = false;
                if(me.jsScrollHeight[obj.id] >-1) {
                    me.scrollToPosition(obj.id, me.termRows, me.jsPanelHeight, obj.r, me.lastR);
                }
                me.lastR = obj.r;
            }
        };
    },

    //发送消息
    sendMessage: function (websocket, msg) {
        this.waitForSocketConnection(websocket, function () {
            websocket.send(msg);
        });
    },

    //等待WebSocket建立连接
    waitForSocketConnection:function(socket, callback) {
        var me = this;
        setTimeout(
            function() {
                if (socket.readyState === 1) {

                    if (callback !== undefined) {
                        callback();
                    }
                    return;
                } else {
                    me.waitForSocketConnection(socket, callback);
                }
            }, 100);
    },

    //关闭WebScoket
    closeWebSocket:function(nodeId){
        var me = this;
        //关闭websocket连接
        if (me.wsList && me.wsList.length !== 0) {
            var len = me.wsList.length;
            var index = -1;
            var wsClose;

            for (var k = 0; k < len; k++) {
                if (me.wsList[k].nodeId === nodeId) {
                    wsClose = me.wsList[k];
                    index = k;
                    break;
                }
            }
            if (wsClose && wsClose.ws)
                wsClose.ws.close();
            if (index > -1)
                me.wsList.splice(index, 1);
        }
        if (me.terminals[nodeId] && me.terminals[nodeId].closed === false)
            me.terminals[nodeId].close();
        if(me.jsScrollHeight[nodeId])
            me.jsScrollHeight[nodeId]=0;
    },

    //查找指定的WebSocket
    findWebSocket:function (nodeId) {
        var len = this.wsList.length;
        for(var i=0;i<len;i++){
            if(this.wsList[i].nodeId==nodeId)
                return this.wsList[i];
        }
        return null;
    },

    //数组中是否存在指定WebSocket
    isExistWS:function(nodeId){
        for (var i in this.wsList) {
            if (this.wsList[i].nodeId === nodeId) {

                return true;
            }
        }

        return false;
    },

    //在指定的数组中查找指定的字符串
    isExistStr:function (str, strList) {
        var len = strList.length;
        for (var i = 0; i < len; i++) {
            if (str.indexOf(strList[i]) > -1)
                return true;
        }
        return false;
    },

    //删除指定的字符
    deleteSpecialChar:function(text) {
        if (text.lastIndexOf("\r") !== -1 && text.lastIndexOf("\r") +1==text.length) { //从后台传过来的字符串末尾会多一个\r字符串
            text = text.substring(0, text.length - 1);
        }
        text = text.replace(/0m/g, 'm').replace(/01;31m/g, 'm');
        text = text.replace(/01;32m/g, 'm').replace(/01;33m/g, 'm').replace(/01;34m/g, 'm');
        text = text.replace(/01;35m/g, 'm').replace(/01;36m/g, 'm').replace(/01;37m/g, 'm');
        text = text.replace(/\[\m/g, '').replace(/\[\K/g, '').replace(/[\[\]]/g, '');

        var strArr = [];
        var special;
        for (var k = 0; k < 17; k++) {
            if(k==10)
                continue;
            special = String.fromCharCode(k);
            strArr = text.split(special);
            text = strArr.join("");
        }

        special = String.fromCharCode(27);
        strArr = text.split(special);
        text = strArr.join("");
        if(text.lastIndexOf('#'))
            return text;
    },

    //从jsPanel中解析出NodeId
    getNodeIdFromJsPanel:function(jspId){
        var nodeId;
        var arrTemp = jspId.split('-');
        if(arrTemp.length>1)
            nodeId = arrTemp[1];

        return nodeId;
    },

    //是否滚动到底部
    scrollToPosition:function(nodeId,rows,height,r,lasrR){

        var flag = false;
        var jsDiv = $('#jsPanel-' + nodeId+"-body");//jsPanel-o161-body
        if(this.jsScrollHeight[nodeId] &&  this.jsScrollHeight[nodeId] == $(jsDiv).scrollTop()) {
            this.jsScrollHeight[nodeId]=-1;
            /*var scrollTop = $(jsDiv).scrollTop();
            var scrollHeight = rows*15;
            var windowHeight = height;
            if(scrollTop + windowHeight >= scrollHeight){
                flag= true;
            }
            if(!flag) {
                $(jsDiv).scrollTop((r - lasrR) * 15 + $(jsDiv).scrollTop()+20);
            }*/
        }
        else{
            this.jsScrollHeight[nodeId] == $(jsDiv).scrollTop();
            $(jsDiv).scrollTop((r - lasrR) * 15 + $(jsDiv).scrollTop()+60);
        }
    },

    //关闭窗口
    closeWindow:function(windowId){
        var me = this,
            nodeId =me.getNodeIdFromJsPanel(windowId);

        delete me.jpPanels[nodeId];
        delete me.terminals[nodeId];

        if(me.winMinList.length >0)
            me.winMinList.splice(me.winMinList.indexOf(windowId),1);
        if(me.winMaxNum>0)
            me.winMaxNum--;
        if(me.winMinList.length >0){
            var len = me.winMinList.length;
            for(var i=0;i<len;i++){
                var nodeId=me.getNodeIdFromJsPanel(me.winMinList[i]);
                if(nodeId){
                    var win=me.jpPanels[nodeId];
                    if(win){
                        win.getEl().setXY ([me.getMinX(),me.getMinY(i+1)]);
                    }
                }
            }
        }
    },

    getMinY:function(icount){
        var eBody=Ext.getBody(),
            me = this;
        return eBody.getHeight()-(icount-1) * (30+6) -50;
    },

    getMinX:function(){
        var eBody=Ext.getBody();
        return eBody.getWidth() - 202;
    },

    getMaxY:function(winHeight){
        var eBody=Ext.getBody(),
            me = this;
        return (Math.floor(eBody.getHeight()/2)-Math.floor(winHeight/2)) +(me.winMaxNum-1) * 50;
    },

    getMaxX:function(winWidth){
        var eBody=Ext.getBody(),
            me = this;
        return Math.floor(eBody.getWidth()/2)-Math.floor(winWidth/2) + (me.winMaxNum-1) * 50;
    },

    //消息提示
    showToast: function(msg) {
        Ext.toast({
            html: msg,
            align: 'tr',
            minWidth:300,
            slideInDuration: 500,
        });
    },

    //save login info 
    saveNodeConnInfo:function(connInfo){
        var connData = {};

        connData["neid"] = connInfo.nodeId;
        connData["ip"] = connInfo.ip;
        connData["port"] = connInfo.port;
        connData["username"] = connInfo.name;
        connData["passwd"] = connInfo.pwd;

        var connDataList = [];
        connDataList.push(connData);

        var inputData = {};
        inputData["operation"] = "merge";
        inputData["ssh-list"] = connDataList;

        var input ={"input":inputData,"protocal":connInfo.protocal.toLowerCase()};

        Ext.Ajax.request({
            url:"/config/sdn/resource/saveNodeConnInfo",
            method : 'post',
            jsonData:input,
            success:function(response,opts){
               console.log("save connection sucess");
            },
            failure:function(response,opts){
               console.log("save connection failure");
            }
        });
    },

});

//定义controller
Ext.define('Admin.view.base.TermPanel', {
    extend: 'Ext.container.Container',
    xtype: 'TermPanel',
    requires: [
        'Admin.base.termController'
    ],

    initComponent: function(){
        var me=this;
        me.setHtml(
            '<div class="contextMenu" id="termRightMenu" style="display: none"><ul> <li id="termPaste">粘贴</li> </ul></div>'
        );

        document.addEventListener("copy", function(e) {
            window.pasteStr = window.getSelection().toString();
        }, false);

        me.callParent();

    },

    showTermWin:function(data){
        //data={"protocol":"ssh","ip":"172.16.75.111","nodeId":"openflow:6","nodeLable":"op6"};
        if(!data){
            return;
        }

        var gedNodeConnInfo=function(nodeId,protocal){
            var result,
                connData = {};
            connData["neid"] = nodeId;

            var connDataList = [];
            connDataList.push(connData);

            var inputData = {};
            inputData["operation"] = "get";
            inputData["ssh-list"] = connDataList;

            var input={"input":inputData,"protocal":protocal.toLowerCase()};

            Ext.Ajax.request({
                url:"/config/sdn/resource/getNodeConnInfo",
                method : 'post',
                async:false,
                jsonData:input,
                success:function(response,opts){
                    console.log("get connection sucess");
                    var obj = Ext.decode(response.responseText);
                    if(obj.data){
                        result= obj.data;
                    }
                },
                failure:function(response,opts){
                   console.log("get connection failure");
                }
            });
            return result;
        };

        var result=gedNodeConnInfo(data.nodeId,data.protocol.toLowerCase());
        var record={},name='',pwd='';

        if(result){
            name = result.name;
            pwd = result.pwd;

        }

        if(data.protocol.toLowerCase()=="ssh"){
            record={"nodeId":data.nodeId,"nodeLable":data.nodeLable,"protocal":"SSH","ip":data.ip,"port":22,"userName":name,password:pwd};
        }
        else{
            record={"nodeId":data.nodeId,"nodeLable":data.nodeLable,"protocal":"Telnet","ip":data.ip,"port":23,"userName":name,password:pwd};
        }
        //var record={"nodeId":"openflow:6","nodeLable":"op6","protocal":"ssh","ip":"172.16.75.111","port":22,"userName":"lyb",password:"lyb171049"};

        var win = Ext.getCmp('myWin');
        if(!win){
            //var divContainer = $("div[id^='rightContainer']:eq(2)").length == 0 ? $("div[id^='rightContainer']:eq(0)") : $("div[id^='rightContainer']:eq(2)");
            win = Ext.create("Ext.window.Window", {
                renderTo:Ext.getBody(),
                id: "myWin",
                title: _('Terminal Configuration Management'),
                width: 500,
                height: 320,
                layout: 'fit',
                closeAction : 'hide',
                controller: 'termController',
                resizable:false,
                items: [
                    {
                        xtype: "form",
                        frame: true,
                        defaultType: 'textfield',
                        itemId: 'sshForm',
                        reference: 'referenceSShForm',
                        defaults: {
                            padding: 10,
                        },
                        fieldDefaults: {
                            labelStyle: 'text-align:right;width:75; padding-right:30px',
                        },
                        items: [
                            {
                                xtype: "container",
                                layout: {
                                    type: 'vbox',
                                    align: 'center',
                                },
                                margin: '0 0 0 -56',
                                items: [
                                    {
                                        xtype:'hidden',
                                        fieldLabel: 'nodeId',
                                        name: 'nodeId',
                                    },
                                    {
                                        xtype:'hidden',
                                        fieldLabel: 'nodeLable',
                                        name: 'nodeLable',
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: _('Protocol'),
                                        name: 'protocal',
                                        readOnly:true
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'IP',
                                        name: 'ip',
                                        allowBlank: false,
                                        regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                                        //readOnly:true
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: _('Port'),
                                        name: 'port',
                                        readOnly:true
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: _('User Name'),
                                        name: 'userName',
                                        allowBlank: false,
                                        fieldStyle: 'background-color:#FFDAB9;border-width: 2px;border-style: inset;border-color: initial;'
                                    },
                                    {
                                        xtype:'textfield',
                                        fieldLabel: _('Password'),
                                        name: 'password',
                                        inputType: 'password',
                                        allowBlank: false,
                                        fieldStyle: 'background-color:#FFDAB9;border-width: 2px;border-style: inset;border-color: initial;'
                                    }
                                ]
                            }
                        ],
                        buttons: [
                            {
                                xtype: "button",
                                text: _('Ok'),
                                handler: 'onSShSubmit'
                            }, {
                                xtype: "button",
                                text: _('Cancle'),
                                handler: function () {
                                    this.up("window").hide();
                                }
                            }
                        ]
                    }
                ],
            });

        }

        //Ext.get('myWin_header-title-textEl').dom.innerHTML=_('Terminal Configuration Management') +' | '+data.nodeLable;
        win.setTitle (_('Terminal Configuration Management') +' | '+data.nodeLable);
        win.getComponent('sshForm').getForm().reset();
        win.getComponent('sshForm').getForm().setValues(record); //getComponent对应itemId | 重置表单的值 form.getForm().reset();
        win.show();
    }
})