Ext.define('Admin.view.resource.syncmanage.syncTask.syncTaskMainView', {
    extend: 'Ext.container.Container',
    xtype: 'syncTaskMainView',
     
    requires: [
        'Admin.view.resource.syncmanage.syncTask.syncTaskTree',
        'Admin.view.resource.syncmanage.syncTask.syncTaskGrid',
        'Admin.view.resource.syncmanage.syncTask.baseTask',
        'Admin.view.resource.syncmanage.syncTask.diffTreatmentView',
        'Admin.view.resource.syncmanage.syncTask.taskGroup'
        
      
    ],

    title:_('Ne Synchro'),       
    iconCls: 'x-fa fa-circle-o',
    cls: 'shadow',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    
    items:[
        {           
            xtype:'syncTaskTree',
            margin: '0 5 0 0',
            width:230
        },
        {
            xtype: 'container',
            margin: '0 0 0 5',
            flex:1,
            itemId: 'cardSide',
            layout: 'card',
            items:[
            {
              xtype:'syncTaskGrid',
            },
            {
            xtype:'baseTask'
            },       
            ]
        }   

    ]
   
});