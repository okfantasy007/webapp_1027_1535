Ext.define('Admin.view.alarms.alarmfilter.alarmFilterTreeView', {
    extend: 'Ext.container.Container',
    xtype:'alarmFilterTreeView',

  controller: {
	  onLevelFilter:function(){
      
	     var test = this.getView().up().lookupReference('alarmFilterPanel');
		test.layout.setActiveItem(0);
		var grid =test.down('alarmLevelFilterView').down('grid');
		grid.getStore().reload();
	  },
	   onTypeFilter:function(){
      
	   var test = this.getView().up().lookupReference('alarmFilterPanel');
		
		test.layout.setActiveItem(1);
	  },
	   onDeviceFilter:function(){
      
	   var test = this.getView().up().lookupReference('alarmFilterPanel');
		
		test.layout.setActiveItem(2);
	  },
	   onChassisFilter:function(){
      
	   var test = this.getView().up().lookupReference('alarmFilterPanel');
		
		
		test.layout.setActiveItem(3);
	  },
	   onCardFilter:function(){
       
	   var test =  this.getView().up().lookupReference('alarmFilterPanel');
		
		test.layout.setActiveItem(4);
		
	  },
	   onPortFilter:function(){
      
		var test = this.getView().up().lookupReference('alarmFilterPanel');
		
		
		test.layout.setActiveItem(5);
	  },
	   onTimeFilter:function(){
      
	   var test = this.getView().up().lookupReference('alarmFilterPanel');
		
		
		test.layout.setActiveItem(6);
	  }
   
    },
	
	 items: [{
            xtype: 'segmentedbutton',
		//	height:'100%',
            items: [
			{
                text: _('Level Filter'),
				pressed: true,
				handler:'onLevelFilter'
            },
			{
                text: _('Type Filter'),
				handler:'onTypeFilter'
            }, 
			{
                text: _('Device Filter'),
				handler:'onDeviceFilter'
            },
			{
                text: _('Chassis Filter'),
				handler:'onChassisFilter'
            }, 
			{
                text: _('Card Filter'),
				handler:'onCardFilter'
            },
			{
                text: _('Port Filter'),
				handler:'onPortFilter'
            }, 
			{
                text: _('Time Filter'),
				handler:'onTimeFilter'
            }
			
			
			]
        }]

});
