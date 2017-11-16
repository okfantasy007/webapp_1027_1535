/***
*告警属性对话框
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.alarmPropertyView', {
    extend: 'Ext.tab.Panel',//'Ext.container.Container',
    xtype: 'alarmPropertyView',
    requires: [
        'Admin.view.alarms.alarmproperty.propertyAlarmExperienceView',
        'Admin.view.alarms.alarmproperty.propertyAlarmDeviceView',
        //'Admin.view.alarms.alarmproperty.propertyAlarmCustomerView',
        'Admin.view.alarms.alarmproperty.propertyAlarmCardView',
        'Admin.view.alarms.alarmproperty.propertyAlarmInfoView'
    ],
    controller: {  

        loadProperty: function(rowRecord){
        	//alert("loadProperty......");
            var alarmPropertyV = this.getView();
    		
    		var PropertyAlarmInfo = alarmPropertyV.down('propertyAlarmInfoView');
    		PropertyAlarmInfo.lookupController().loadAlarmInfo(rowRecord);
    		
    		var propertyAlarmExperience = alarmPropertyV.down('propertyAlarmExperienceView');
    		propertyAlarmExperience.lookupController().loadAlarmExperience(rowRecord);

    		var propertyAlarmDevice = alarmPropertyV.down('propertyAlarmDeviceView');
    		propertyAlarmDevice.lookupController().loadAlarmDevice(rowRecord);

    		var propertyAlarmCard = alarmPropertyV.down('propertyAlarmCardView');
    		propertyAlarmCard.lookupController().loadAlarmCard(rowRecord);

    		//propertyAlarmCustomer = alarmPropertyV.down('propertyAlarmCustomerView');
    		//propertyAlarmCustomer.lookupController().loadAlarmCustomer(rowRecord);

        }
    },
    header: false,
    //border: false,
    //autowidth:true,
    //autoheight:true,
    width: 400,
    height: 480,
    plain: true,
    tabPosition: 'left',//tab在左边
    tabRotation: 0,
    tabBar: {
        border: false
    },
    defaults: {
        bodyPadding: 5,
        //scrollable: true
    },
    items: [{
        xtype: 'propertyAlarmInfoView'
    },{
        xtype:'propertyAlarmDeviceView'
    },{
        xtype:'propertyAlarmCardView',
        title: _('Card Property')
    },/*{
        xtype:'propertyAlarmCustomerView'  //新表中没有，暂时隐藏
    },*/{
        xtype:'propertyAlarmExperienceView',
        title: _('Troubleshooting')
    }]
});