
// i18n func
var _ = function(s) {
    if (APP.dict[s] != undefined) {
        return APP.dict[s];
    }
    return s;
};
// console.log(_('My title'));
// console.log(_('Login Successfully!'));
// console.log(_('Alarms'));

(function() {
    document.write('<link rel="stylesheet" type="text/css" href="stylesheets/project_spec.css" />');
    document.write('<script type="text/javascript" src="javascripts/mqttws31.js"></script>');
    document.write('<script type="text/javascript" src="javascripts/d3/d3.js"></script>');
    document.write('<script type="text/javascript" src="javascripts/pdf/pdfobject.js"></script>');
    document.write('<script type="text/javascript" src="javascripts/termlib.js"></script>');
    document.write('<script type="text/javascript" src="javascripts/pdf/pdfobject.js"></script>');
    document.write('<script type="text/javascript" src="javascripts/jquery-3.2.1.min.js"></script>');
    if (APP.enable_online_map) {
        // <!-- 百度地图API在线版本 -->
        // document.write('<script type="text/javascript" src="http://api.map.baidu.com/api?v=1.3"></script>');
        document.write('<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=zdTAmn5j0HW08G3QI04FwodnY7o1OM3G"></script>');
    } else {
        //<!-- 百度地图API离线版本 -->
        document.write('<script type="text/javascript" src="baidumapv2/baidumap_offline_v2_load.js"></script>');
        document.write('<link rel="stylesheet" type="text/css" href="baidumapv2/css/baidu_map_v2.css"/>');
    }
})();


var Public = function() {

    var get_current_time = function() {
        var d = new Date();
        return parseInt(d.getTime() / 1000);
    }
    var glb_last_active_time = get_current_time();

    return {
        get_current_time: get_current_time,

        colors:  {
            'primary':  '#337ab7',
            'success':  '#5cb85c',
            'info':     '#5bc0de',
            'warning':  '#f0ad4e',
            'danger':   '#d9534f',
        },

        // 切换主题
        switch_ext_theme: function(theme) {
            Ext.create('Ext.form.Panel', {
                items: [{
                    xtype: 'hidden',
                    name: 'theme',
                    value: theme
                }]
            }).getForm().submit({
                url: 'theme',
                waitTitle: _('Please wait...'),
                waitMsg: _('Changing theme ...'),
                success: function(form, action) {
                    // window.location.href = window.location.href;
                    window.location.reload();
                },
                failure: function(form, action) {
                    Ext.Msg.alert('Operation Failure', action.result.msg);
                }
            }); // form
        },

        // 切换语言
        switch_language: function(lang) {
            Ext.create('Ext.form.Panel', {
                items: [{
                    xtype: 'hidden',
                    name: 'lang',
                    value: lang
                }]
            }).getForm().submit({
                url: 'lang',
                waitTitle: _('Please wait...'),
                waitMsg: _('Changing language ...'),
                success: function(form, action) {
                    // window.location.href = window.location.href;
                    window.location.reload();
                },
                failure: function(form, action) {
                    Ext.Msg.alert('Operation Failure', action.result.msg);
                }
            }); // form
        },

        page_touch: function() {
            glb_last_active_time = get_current_time();
        },

        get_escape_time: function() {
            return get_current_time() - glb_last_active_time;
        },

        _ip2int: function(ip) {
            var num = 0;
            ip = ip.split(".");
            num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
            num = num >>> 0;
            return num;
        },

        _int2iP: function(num) {
            var str;
            var tt = new Array();
            tt[0] = (num >>> 24) >>> 0;
            tt[1] = ((num << 8) >>> 24) >>> 0;
            tt[2] = (num << 16) >>> 24;
            tt[3] = (num << 24) >>> 24;
            str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
            return str;
        },


        stringToHex: function(str) {
            var arr = [];
            for (var i = 0; i < str.length; i++) {
                arr[i] = str.charCodeAt(i).toString(16);
            }
            return arr.join(",");
        },

        hexToString: function(str) {
            var val = "";
            var arr = str.split(",");
            for (var i = 0; i < arr.length; i++) {
                val += String.fromCharCode(parseInt(arr[i], 16));
            }
            return val;
        }

    }

}();

var SEC = function() {

    var sec_approved = function(func_name) {
        var approved = false;
        if (APP.user_auth.is_superuser) {
            approved = true;
        } else {
            var func_ids = APP.user_auth.user_menu_oper_map;
            if(func_ids[func_name]){
                 approved = true;
            }
           
        }
        return approved;
    };

    return {
        menu_filter: function(item) {
            var viewType = item.get('fun_id') || item.get('viewType');
            var is_leaf = item.get('leaf');
            var defaultValide = item.get('defaultValide');
            if(defaultValide){
                return true;
            }

            // if (viewType == undefined || !is_leaf) {
            //     return true;
            // } 
            var b = sec_approved(viewType);
            // console.log(viewType, b, is_leaf);
            return b;
        },

        enable: function(func_name) {
            return sec_approved(func_name);
        },

        disable: function(func_name) {
            return !sec_approved(func_name);
        },

        show: function(func_name) {
            return sec_approved(func_name);
        },

        hidden: function(func_name) {
            return !sec_approved(func_name);
        }

    }
}();

var Reports = function() {
    var formatTime = function(input) {
        var output = input;
        if (input >= 0 && input <= 9) {
            output = '0' + input;
        }
        return output;
    };
    return {
        formatDateTime: function(myDate) {
            var dateTime = myDate.getFullYear() + "-" + formatTime(myDate.getMonth() + 1) + "-" + formatTime(myDate.getDate()) + " " + formatTime(myDate.getHours()) + ":" + formatTime(myDate.getMinutes()) + ":" + formatTime(myDate.getSeconds());
            return dateTime;
        },
        formatDateYMD: function(myDate) {
            var dateTime = myDate.getFullYear() + "-" + formatTime(myDate.getMonth() + 1) + "-" + formatTime(myDate.getDate());
            return dateTime;
        },
        formatClockTime: function(myDate) {
            var dateTime = formatTime(myDate.getHours()) + ":" + formatTime(myDate.getMinutes()) + ":" + formatTime(myDate.getSeconds());
            return dateTime;
        },
        isSameStatus: function(rows) {
            var sameStatus = true;
            for (var i = 0; i < rows.length - 1; i++) {
                var flag = true;
                var status1 = rows[i].get('task_status');
                for (var j = i + 1; j < rows.length; j++) {
                    var status2 = rows[j].get('task_status');
                    if (status1 !== status2) {
                        flag = false; //跳出内层循环的标志
                        break;
                    }
                }
                if (flag == false) { //如果跳出内层循环，也要随即跳出外层循环
                    sameStatus = false;
                    break;
                }
            }
            return sameStatus;
        },
        operateTask: function(taskids, type) {
            console.log("----------------operateTask---------------");
            var url = "/reports/rest/report_task/";
            url = url + type + "Task?task_id=" + taskids;
            var status = "failure";
            // var params = {
            //     taskids: taskids
            // };

            Ext.Ajax.request({
                async: false,
                url: url, //此处是从数据库获取模板列表
                // params: params,
                success: function(response, opts) {
                    console.log("ajax", response);
                    var res = Ext.util.JSON.decode(response.responseText); //string转化为json对象
                    status = res.status;
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return status;

        }
    }

}();

//sdn业务公共函数
var SdnSvc = function() {
    return {
        //UUID生成
        createUUID: function() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        },
        getSdnNodeIdList: function() {
            console.log("----------------getSdnNodeIdList---------------");
            var data = [];
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/resource/get_sdn_node_list/pure/db',
                success: function(response, opts) {
                    // console.log("ajax", response);
                    var res = Ext.util.JSON.decode(response.responseText).data; //string转化为json对象
                    res.forEach(function(ele) {
                        data.push(ele.id);
                    });
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
        },
        getNodeUserLabelById: function(nodeId, nodeType) {
            console.log("----------------getNodeUserLabelById---------------");
            var data = "";
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/resource/get_node_userlabel/' + nodeId + '/' + nodeType + '/db',
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = response.responseText;
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
        },
        getPortUserLabelById: function(nodeId, portNum, nodeType) {
            console.log("-----------------getPortUserLabelById--------------");
            var data = "";
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/resource/get_port_userlabel/' + nodeId + '/' + portNum + '/' + nodeType + '/db',
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = response.responseText;
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
        },
        getExtLinkUserLabelById: function(extLinkId) {
            console.log("-----------------getExtLinkUserLabelById--------------");
            var data = "";
            Ext.Ajax.request({
                async: false, //同步请求
                url: '/config/sdn/resource/get_extlink_userlabel/' + extLinkId + '/db',
                success: function(response, opts) {
                    // console.log("ajax", response);
                    data = response.responseText;
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
            return data;
        }
    }

}();