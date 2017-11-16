// custom Vtype for vtype:'IPAddress'
Ext.apply(Ext.form.field.VTypes, {
    IPAddress:  function(v) {
        var exp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;   
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
        //return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
    },
    IPAddressText: 'Invalid IP Address',
    IPAddressMask: /[\d\.]/i
});

Ext.apply(Ext.form.field.VTypes, {
    ipSubnet: function(v) {
        var exp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;   
        ary = v.split("/");
        switch( ary.length ) {
            case 1:
                if (ary[0].match(exp))
                    return true;
                else 
                    return false;
                break;
            case 2:
                if (ary[0].match(exp) && ary[1].match(exp))
                    return true;
                else 
                    return false;
                break;
            default:
                return false
        }
    },
    ipSubnetText: 'Invalid IP Address or Subnet',
    ipSubnetMask: /[\d\.\/]/i
});

function _ip2int(ip) 
{
    var num = 0;
    ip = ip.split(".");
    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
    num = num >>> 0;
    return num;
}
 
function _int2iP(num) 
{
    var str;
    var tt = new Array();
    tt[0] = (num >>> 24) >>> 0;
    tt[1] = ((num << 8) >>> 24) >>> 0;
    tt[2] = (num << 16) >>> 24;
    tt[3] = (num << 24) >>> 24;
    str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
    return str;
}

// custom Vtype for vtype:'hostname'
Ext.apply(Ext.form.field.VTypes, {
    hostname:  function(v) {
        return /^[\w]+([\.][\w]+){0,64}$/.test(v);
    },
    hostnameText: 'Invalid host name',
    hostnameMask: /[\w\.]/i
});

Ext.apply(Ext.form.field.VTypes, {
    FilenName:  function(v) {
        return /^[\w]+([\.][\w]+){0,64}$/.test(v);
    },
    FilenNameText: 'Invalid file name',
    FilenNameMask: /[\w\.]/i
});

// custom Vtype for vtype:'NameCn' 中文名称
Ext.apply(Ext.form.field.VTypes, {
    NameCn:  function(v) {
        var exp=/^([\u4e00-\u9fa5]|[\w])+$/;   
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
    },
    NameCnText: _('You may only use letters, numbers, underscore and Chinese charactes'),
    NameCnMask: /[\u4e00-\u9fa5\w]/i
});

// custome Vtype for vtype: 'snmp engine id'
Ext.apply(Ext.form.field.VTypes, {
    EngineID:  function(v) {
        var exp=/^([0-9|a-f][0-9|a-f]){5,32}$/i;
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
    },
    EngineIDText: 'Invalid Engine ID',
    EngineIDMask: /[\w]/i
});

// 团体名验证: len:1-32
Ext.apply(Ext.form.field.VTypes, {
    CommunityName:  function(v) {
        var exp=/^.{1,32}$/;
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
    },
    CommunityNameText: 'Invalid Community name',
    CommunityNameMask: /./i
});

// MAC验证
Ext.apply(Ext.form.field.VTypes, {
    MacAddress:  function(v) {
        //var exp=/^([a-fA-F0-9]){12}|[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}$/;
        var exp=/^([a-fA-F0-9]){12}|[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}|[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}$/;
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
    },
    MacAddressText: 'Invalid MAC address',
    MacAddressMask: /[a-f0-9-:]/i
});

// 数字验证
Ext.apply(Ext.form.field.VTypes, {
    PureNumber:  function(v) {
        var exp=/^\d*$/;
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
    },
    PureNumberText: 'Invalid numbers',
    PureNumberMask: /\d/i
});

// WPA pre share key
Ext.apply(Ext.form.field.VTypes, {
    WpaPreShareKey:  function(v) {
        var exp = /^[\x21-\x7f]{8,64}$/;
        if (v.match(exp) == null) {
            return false;
        }
        else {
            return true;
        }
    },
    WpaPreShareKeyText: 'Invalid Key (8~64 ascii characters)',
    WpaPreShareKeyMask: /[\x21-\x7f]/i
});

// strUpdata时间间隔的验证
Ext.apply(Ext.form.field.VTypes, {
    daterange: function(val, field) {
        var date = field.parseDate(val);

        if (!date) {
            return false;
        }
        /*if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            var start = field.up('').up('').down('#' + field.startDateField);
            start.setMaxValue(date);
            start.validate();
            this.dateRangeMax = date;
             //return true;
        }
        else */if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
            var end = field.up('').up('').down('#' + field.endDateField);
            end.setMinValue(date);
            end.validate();
            this.dateRangeMin = date;
             //return true;
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */
        return true;
    },
    daterangeText: 'Start date must be less than end date'
});

// // custom Vtype for vtype:'IPAddress'
// Ext.define('Override.form.field.VTypes', {
//     override: 'Ext.form.field.VTypes',

//     IPAddress:  function(value) {
//         return this.IPAddressRe.test(value);
//     },
//     IPAddressRe: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
//     IPAddressText: 'Must be a numeric IP address',
//     IPAddressMask: /[\d\.]/i
// });

// // custom Vtype for vtype:'time'
// Ext.define('Override.form.field.VTypes', {
//     override: 'Ext.form.field.VTypes',

//     // vtype validation function
//     time: function(value) {
//         return this.timeRe.test(value);
//     },
//     // RegExp for the value to be tested against within the validation function
//     timeRe: /^([1-9]|1[0-9]):([0-5][0-9])(\s[a|p]m)$/i,
//     // vtype Text property: The error text to display when the validation function returns false
//     timeText: 'Not a valid time.  Must be in the format "12:34 PM".',
//     // vtype Mask property: The keystroke filter mask
//     timeMask: /[\d\s:amp]/i
// });
