Ext.define('widget.kickoffuser', {
    extend: 'Ext.container.Container',
    
    layout: 'center',

    controller: {
        onClick: function(me) {

            Ext.MessageBox.confirm(_('Confirmation'), 'are you sure?',
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'session_id', value:  'session12345678'},
                                {xtype: 'hidden', name: 'user', value:  'user1'},
                                {xtype: 'hidden', name: 'immediately', value:  me.immediately},
                            ]
                        }).getForm().submit({
                            url: '/demo/user/kickoff',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                // Ext.Msg.alert(_('Success'), action.result.msg);
                                console.log(_('Success'), action.result.msg);
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), action.result.msg);
                            }
                        }); // form
                    } // if 
                }
            );


        },
    },

    items: [
        {
            xtype: 'button',
            text: '立即踢出用户',
            immediately: true,
            listeners: {
                click: 'onClick'
            }
        },
        {
            html: '</br>'
        },
        {
            xtype: 'button',
            text: '一分钟后踢出用户',
            immediately: false,
            listeners: {
                click: 'onClick'
            }
        }
    ]
});
