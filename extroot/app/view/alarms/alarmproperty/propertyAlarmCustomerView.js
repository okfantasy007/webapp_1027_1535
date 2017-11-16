/***
*告警属性中的客户信息
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.propertyAlarmCustomerView', {
    extend: 'Ext.grid.property.Grid',
    xtype: 'propertyAlarmCustomerView',
    controller: {
        loadAlarmCustomer: function(rowRecord){
            var cusByurl = this.lookupReference('cusByurl');
            
            var cusStore =  Ext.Ajax.request({
                url : 'alarm/historyAlarm/getCustomerInfoByUrl',
                params : {cusName: rowRecord.CUS_NAME},
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        var propertyInfo= r.data[0];
                        cusByurl.setSource({
                            "客户名称": propertyInfo.CUS_NAME,
                            "客户级别": propertyInfo.CUS_LEVEL, 
                            "客户类别": propertyInfo.CUS_CATEGORY,
                            "客户类型": propertyInfo.CUS_TYPE,
                            "客户联系人": propertyInfo.CUS_PERSON,
                            "客户地址": propertyInfo.CUS_ADDR,
                            "对应电路": propertyInfo.CUS_PHONE,
                            "客户描述信息": propertyInfo.CUS_DESC,
                            "对应电路": propertyInfo.CUS_CIRCUITID
                        });
                    }else{
                        cusByurl.setSource({});
                    }
                }
            });
        },
        onbeforeedit: function(e){  
            e.cancel = true;  
            return false;  
        }
    },
    title: _('Customer Information'), 
    width: 300,
    //xtype: 'propertygrid',
    collapsible: true,
    reference:'cusByurl',
    emptyText : _('Empty'),
    listeners:{
        beforeedit: 'onbeforeedit'
    } 
});