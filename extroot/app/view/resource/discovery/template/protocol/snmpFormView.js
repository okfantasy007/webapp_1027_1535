Ext.define('Admin.view.resource.discovery.template.protocol.snmpFormView', {
    extend: 'Admin.view.resource.discovery.template.protocol.baseForm',
    xtype: 'snmpFormView',

    controller: {
        onSubmit: function() {
            var form = this.getView(),
                container = form.up().up(),
                grid = container.down('discoveryTemplateGridView');

            var flag = form.down('fieldset').getComponent('name').isValid();
            var version = form.down('fieldset').down('radiogroup').getValue().version;
            if(flag && version == 3) {
                var v3part = form.down('fieldset').getComponent('p_v3');
                if(!v3part.getComponent('v3_secname').isValid()) {
                    flag = false;
                } else {
                    var secLevel = v3part.down('radiogroup').getValue().v3securityLevel;
                    var v3cont = v3part.getComponent('p_v3_cont');
                    var isAuthValid = v3cont.getComponent('p_v3_auth').getComponent('p_v3_auth_key').isValid();
                    var isPrivValid = v3cont.getComponent('p_v3_priv').getComponent('p_v3_priv_key').isValid();
                    if(secLevel == 'authNoPriv') {
                        if(!isAuthValid) {
                            flag = false;
                        }
                    } else if(secLevel == 'authPriv') {
                        if(!isAuthValid || !isPrivValid) {
                            flag = false;
                        }
                    }
                }
            }

            if (flag) {
                form.getForm().submit({
                    url: '/resource/discovery_template/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    submitEmptyText : false,
                    clientValidation: false,
                    success: function(form, action) {
                        container.setActiveItem(0);
                        grid.lookupController().onRefresh();
                        Ext.Msg.alert(_('Success'), action.result.msg);
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert(_('Failed'), action.result.msg);
                    }
                });                
            } else {
                Ext.Msg.alert(_('input error'), _('Please Check The Input Content'));
            }
        }
    },

    items: [
    {
        xtype: 'fieldset',

        margin: 10,
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
        {
            xtype: 'hidden',
            name: 'id'
        },
        {
            xtype: 'hidden',
            name: 'type',
            value: 'SNMP'
        },
        {
            fieldLabel: _('Name'),
            emptyText: _('Name'),
            allowBlank: false,
            vtype: 'NameCn',
            maxLength: 64,
            itemId: 'name',
            name: 'name'
        }, 
        {
            xtype: 'numberfield',
            fieldLabel: _('Port'),
            value: 161,
            minValue: 1,
            maxValue: 65535,                
            allowBlank: false,
            name: 'port',
        },
        {
            xtype: 'numberfield',
            fieldLabel: _('Timeout'),
            value: 5,
            minValue: 1,
            maxValue: 3600,                
            allowBlank: false,
            name: 'timeout',
        },
        {
            xtype: 'numberfield',
            fieldLabel: _('Retries'),
            value: 1,
            minValue: 1,
            maxValue: 1000,                
            allowBlank: false,
            name: 'retries',
        },

        {
            xtype: 'radiogroup',
            fieldLabel: _('SNMP Version'),
            items: [
                {name: 'version',boxLabel: 'v1', inputValue: '1', reference: 'snmpv1'},
                {name: 'version',boxLabel: 'v2c', inputValue: '2', checked: true, reference: 'snmpv2c'},
                {name: 'version',boxLabel: 'v3', inputValue: '3', reference: 'snmpv3'},
            ]
        },
        {
            xtype: 'fieldcontainer',
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            bind: {
                hidden: '{snmpv3.checked}',
            },
            items: [
            {
                xtype: 'textfield',
                fieldLabel: _('Read Community'),
                emptyText: _('Read Community'),
                value: 'public',
                maxLength: 64,
                name: 'community_read',
                allowBlank: false
            }, 
            {
                xtype: 'textfield',
                fieldLabel: _('Write Community'),
                emptyText: _('Write Community'),
                value: 'private',
                maxLength: 64,
                name: 'community_write',
                allowBlank: false
            }
            ]
        },
        {
            xtype: 'fieldcontainer',
            itemId: 'p_v3',
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            bind: {
                hidden: '{!snmpv3.checked}'
            },
            items: [
            {
                xtype: 'textfield',
                fieldLabel: _('Context name'),
                emptyText: _('Context name'),
                maxLength: 128,
                value: '',
                name: 'v3contextName'
            }, 
            {
                xtype: 'textfield',
                itemId: 'v3_secname',
                fieldLabel: _('Security name'),
                emptyText: _('Security name'),
                maxLength: 64,
                name: 'v3securityName',
                allowBlank: false
            }, 

            {
                xtype: 'radiogroup',
                fieldLabel: _('Security level'),
                items: [
                    {name: 'v3securityLevel', boxLabel: _('noAuth,noPriv'), inputValue: 'noAuthNoPriv', reference: 'noAuthNoPriv', checked: true},
                    {name: 'v3securityLevel', boxLabel: _('Auth,noPriv'), inputValue: 'authNoPriv', reference: 'authNoPriv'},
                    {name: 'v3securityLevel', boxLabel: _('Auth,Priv'), inputValue: 'authPriv', reference: 'authPriv'},
                ]
            },

            {
                xtype: 'container',
                itemId: 'p_v3_cont',
                layout: 'hbox',
                margin: '0 0 10',
                items: [{
                    xtype: 'fieldset',
                    itemId: 'p_v3_auth',
                    flex: 1,
                    title: _('Authentication'),
                    defaultType: 'radio',
                    bind: {
                        hidden: '{noAuthNoPriv.checked}',
                    },

                    layout: 'anchor',
                    defaults: {
                        anchor: '100%',
                        hideEmptyLabel: false
                    },
                    items: [
                    {
                        checked: true,
                        fieldLabel: _('Authentication protocol'),
                        boxLabel: 'MD5',
                        name: 'v3authProtocol',
                        inputValue: 'MD5'
                    },
                    {
                        boxLabel: 'SHA',
                        name: 'v3authProtocol',
                        inputValue: 'SHA'
                    },
                    {
                        xtype: 'textfield',
                        itemId: 'p_v3_auth_key',
                        name: 'v3authKey',
                        fieldLabel: _('Password'),
                        emptyText: _('Password'),
                        allowBlank: false,
                        maxLength: 64
                    }]
                }, 
                {
                    xtype: 'component',
                    width: 10
                }, 
                {
                    xtype: 'fieldset',
                    itemId: 'p_v3_priv',
                    flex: 1,
                    title: _('Privacy'),
                    defaultType: 'radio', 
                    bind: {
                        hidden: '{!authPriv.checked}',
                    },

                    layout: 'anchor',
                    defaults: {
                        anchor: '100%',
                        hideEmptyLabel: false
                    },
                    items: [
                    {
                        checked: true,
                        fieldLabel: _('Privacy protocol'),
                        boxLabel: 'DES',
                        name: 'v3privProtocol',
                        inputValue: 'DES'
                    },
                    {
                        boxLabel: 'AES',
                        name: 'v3privProtocol',
                        inputValue: 'AES'
                    },
                    {
                        xtype: 'textfield',
                        itemId: 'p_v3_priv_key',
                        name: 'v3privKey',
                        fieldLabel: _('Password'),
                        emptyText: _('Password'),
                        allowBlank: false,
                        maxLength: 64
                    }
                    ]
                }]
            }

            ]
        }
        ]
    }]

});
