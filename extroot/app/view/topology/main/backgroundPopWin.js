
Ext.define('Admin.view.topology.main.backgroundPopWin', {
    extend: 'Ext.window.Window',
    xtype: 'backgroundPopWin',

    requires: [
        'Admin.view.topology.main.backgroundView',
        'Ext.form.field.File'
    ],
    parentsubnetid: -1, 
    topopanel: null,
    height: 550,
    width: 750,
    title: _('Background Images'),
    // scrollable: true,
    // bodyPadding: 10,
    // closable: false
    constrain: true,
    modal: true,
    layout: 'fit',

    controller: {
        onViewRefresh: function() {
            var view = this.getView().down('backgroundView');
            view.getStore().reload();
        },

        onDbClickPic: function ( me , record , item , index , e , eOpts ) {
            var popwin = this.getView();
            popwin.topopanel.background_img_temp = record.get('src');
            popwin.topopanel.setBackgroundImage(record.get('src'));
            
            // var view = this.getView().down('backgroundView');
            // Ext.create('Ext.form.Panel', {
            //     items: [ 
            //         {xtype: 'hidden', name: 'caption', value: record.get('caption') },
            //         {xtype: 'hidden', name: 'subnetid', value: popwin.parentsubnetid },
            //         {xtype: 'hidden', name: 'src', value: record.get('src') }
            //     ]
            // }).getForm().submit({
            //     url: '/topo/background/select',
            //     waitTitle : _('Please wait...'), 
            //     waitMsg : _('Please wait...'), 
            //     success: function(form, action) {
            //         if (action.result.with_err) {
            //             Ext.Msg.alert(_('With Errors'), action.result.msg);
            //         } else {
            //             // Ext.Msg.alert(_('Success'), action.result.msg);
            //             popwin.topopanel.setBackgroundImage(record.get('src'));

            //         }
            //         view.getStore().reload();
            //     },
            //     failure: function(form, action) {
            //         Ext.Msg.alert(_('Tips'), action.result.msg);
            //     }
            // }); // form

        },

        onSelectPicture: function() {
            var view = this.getView().down('backgroundView');
            var record = view.getSelectionModel().getSelection()[0];
            this.onDbClickPic(this, record);
        },

        onPictureClean: function() {
            console.log('onPictureClean');
            var popwin = this.getView();
            popwin.topopanel.background_img_temp = '';
            popwin.topopanel.setBackgroundImage('');
            // var view = this.getView().down('backgroundView');
            // Ext.create('Ext.form.Panel', {
            //     items: [ 
            //         {xtype: 'hidden', name: 'subnetid', value: popwin.parentsubnetid },
            //     ]
            // }).getForm().submit({
            //     url: '/topo/background/clean',
            //     waitTitle : _('Please wait...'), 
            //     waitMsg : _('Please wait...'), 
            //     success: function(form, action) {
            //         if (action.result.with_err) {
            //             Ext.Msg.alert(_('With Errors'), action.result.msg);
            //         } else {
            //             // Ext.Msg.alert(_('Success'), action.result.msg);
            //             popwin.topopanel.setBackgroundImage('');
            //         }
            //         view.getStore().reload();
            //     },
            //     failure: function(form, action) {
            //         Ext.Msg.alert(_('Tips'), action.result.msg);
            //     }
            // }); // form

        },

        onUploadFileButton: function(field, value) {
            // Ext.toast('<b>Selected:</b> ' + value);
            var me = this;
            var form = field.up('form');
            form.getForm().submit({
                url: '/topo/background/upload',
                waitTitle : _('Please wait...'), 
                waitMsg : _('Please wait...'), 
                success: function(form, action) {
                    me.onViewRefresh();
                },
                failure: function(form, action) {
                    Ext.Msg.alert(_('Message'), action.result.msg);
                }
            });
        },

        onPictureDelete: function() {
            var view = this.getView().down('backgroundView');
            var record = view.getSelectionModel().getSelection()[0];
            // console.log(record);
            var caption = record.get('caption')
            var msg = 'Confirm delete picture: '+ caption;

            Ext.MessageBox.confirm(_('Confirmation'), msg,
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'src', value: record.get('src') }
                            ]
                        }).getForm().submit({
                            url: '/topo/background/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('With Errors'), action.result.msg);
                                } else {
                                    Ext.Msg.alert(_('Success'), action.result.msg);
                                }
                                view.getStore().reload();
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), action.result.msg);
                            }
                        }); // form
                    } // if 
                }
            );

        },

        onCloseWindow: function() {
            this.getView().destroy();
        }
    },

    items: [
        {
            xtype: 'form',
            layout: 'fit',
            scrollable: true,
            bodyPadding: 10,
            border: false,
            items: [
                {
                    xtype: 'backgroundView',
                    reference: 'thumbview',
                    listeners: {
                        itemdblclick: 'onDbClickPic'
                    }
                }
            ],
            tbar:[
                {
                    text: _('Select Background'),
                    iconCls:'x-fa fa-check',
                    handler: 'onSelectPicture',
                    bind: {
                        disabled: '{!thumbview.selection}'
                    }                    
                },
                {
                    text: _('Clean Background'),
                    iconCls:'x-fa fa-ban',
                    handler: 'onPictureClean'
                },
                '-',
                {
                    text: _('Delete'),
                    iconCls:'x-fa fa-trash',
                    bind: {
                        disabled: '{!thumbview.selection}'
                    },                    
                    handler: 'onPictureDelete'
                },
                {
                    xtype: 'fileuploadfield',
                    name: 'imagepath',
                    buttonText: _('Upload'),
                    buttonConfig: {
                        iconCls: 'x-fa fa-cloud-upload'
                    },
                    buttonOnly: true,
                    hideLabel: true,
                    listeners: {
                        change: 'onUploadFileButton'
                    }
                },
                '->',
                {
                    text: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onViewRefresh'
                }
            ],
            bbar:[
                '->',
                {
                    text: _('Close'),
                    iconCls:'x-fa fa-times',
                    handler: 'onCloseWindow'
                }
            ]
        }
    ]

});