Ext.define('Admin.view.configcenter.view.dataBackup.strategy.newPolicy', {
    extend: 'Ext.container.Container',
    xtype: 'newPolicy',
    items: [{
        xtype: 'form',
        levelId: 0,
        ftpType: 'backup',
        itemId: 'createPolicy',
        items: [{
            xtype: 'fieldset',
            title: _("Add Backup Policy"),
            fieldDefaults: {
                labelAlign: 'right',
                labelWidth: 110,
            },
            padding: 20,
            margin: 30,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margin: '0 15 20 15',
                items: [{
                    xtype: 'textfield',
                    fieldLabel: _('policyName'),
                    name: 'policyName',
                    flex: 1,
                    allowBlank: false
                }, {
                    xtype: 'combo',
                    editable: false,
                    fieldLabel: _('fileType'),
                    name: 'fileTypeName',
                    queryMode: 'local',
                    flex: 1,
                    store: {
                        type: 'fileType'
                    },
                    emptyText: _('please choose'),
                    displayField: 'fileTypeName',
                    valueField: 'fileTypeName',
                    value: 'All Files',
                    listeners: {
                        beforerender: 'firstSoftSelect'
                    }

                }]
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margin: '0 15 15 15',
                items: [{
                    xtype: 'combo',
                    flex: 1,
                    fieldLabel: _('policyPeriod'),
                    name: 'policyPeriod',
                    queryMode: 'local',
                    store: {
                        type: 'cycle'
                    },
                    emptyText: _('please choose'),
                    displayField: 'name',
                    valueField: 'id',
                    // value: -1,
                    listeners: {
                        change: 'showDate',
                        afterrender: 'firstSelect'
                    }
                }, {
                    xtype: 'combo',
                    flex: 1,
                    name: 'policyDate',
                    fieldLabel: _('policyDate'),
                    queryMode: 'local',
                    store: {
                        type: 'date'
                    },
                    emptyText: _('please choose'),
                    displayField: 'name',
                    valueField: 'id',
                    // hidden: true
                }]
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margin: '0 15 15 15',
                items: [{
                    xtype: 'sysclockfield',
                    flex: 1,
                    name: 'policyTime',
                    fieldLabel: _('policyTime'),

                }, {
                    xtype: 'panel',
                    flex: 1
                }]
            }, {
                xtype: 'fieldcontainer',

                defaultType: 'checkbox',
                layout: 'hbox',
                margin: '0 15 15 15',
                items: [{
                    fieldLabel: _('policyStatus'),
                    boxLabel: _('enabled'),
                    name: 'policyStatus',
                    inputValue: 1,
                    flex: 1,
                }, {
                    fieldLabel: _('whether default'),
                    boxLabel: _('yes'),
                    name: 'isDefault',
                    inputValue: 1,
                    flex: 1,
                }, {
                    xtype: 'panel',
                    flex: 1
                }, {
                    xtype: 'panel',
                    flex: 1
                }]
            }, , {
                xtype: 'fieldcontainer',
                margin: 0,
                //hidden: true,
                itemId: 'container2',
                layout: 'fit',
                items: [{
                    xtype: 'radiogroup',
                    labelWidth: 110,
                    margin: '0 15 15 15',
                    fieldLabel: _('choose file transferProtocol'),
                    defaultType: 'radiofield',
                    layout: 'hbox',
                    name: 'fileTransferProtocol',
                    items: [{
                        boxLabel: 'FTP',
                        inputValue: 1,
                        flex: 1.5,
                        itemId: 'FTP',
                        checked: true,
                    }, {
                        boxLabel: 'TFTP',
                        inputValue: 2,
                        flex: 1.5,
                    }, {
                        boxLabel: 'HTTP',
                        inputValue: 3,
                        flex: 5,
                    }],
                    // listeners: {
                    // 	change: 'choosePact',
                    // 	afterrender: 'defaultConf'
                    // }
                    listeners: {
                        change: 'choosePact',
                        afterrender: 'defaultConf'
                    }
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    margin: '0 15 15 15',
                    items: [{
                        xtype: 'combo',
                        flex: 1,
                        fieldLabel: _('file serverIPadr'),
                        queryMode: 'local',
                        //name: 'fileTypeId',
                        flex: 1,
                        store: {
                            type: 'ftpIp'
                        },
                        emptyText: _('please choose'),
                        displayField: 'ip',
                        valueField: 'ip',
                        regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/,
                        allowBlank: false,
                        regexText: _('Please enter the right IPv4 or IPv6 address'),
                        name: 'ftpIp',
                        itemId: 'fileServerIPadr',
                        listeners: {
                            change: 'selectFtpIp'
                        }
                    }, {
                        xtype: 'textfield',
                        allowBlank: false,
                        flex: 1,
                        fieldLabel: _('file serverPort'),
                        name: 'ftpPort',
                        regex: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                        regexText: _('Please enter integer between 0 and 65535'),
                        itemId: 'fileServerPort',
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    margin: '0 15 15 15',
                    items: [{
                        xtype: 'combo',
                        flex: 1,
                        fieldLabel: _('username'),
                        queryMode: 'local',
                        //name: 'fileTypeId',
                        flex: 1,
                        store: {
                            type: 'ftpUsers'
                        },
                        emptyText: _('please choose'),
                        displayField: 'username',
                        valueField: 'username',
                        name: 'ftpUsername',
                        itemId: 'username',
                        listeners: {
                            change: 'selectFtpUser'
                        }
                    }, {
                        xtype: 'textfield',
                        flex: 1,
                        fieldLabel: _('password'),
                        name: 'ftpPassword',
                        itemId: 'password',
                    }]
                }]
            }]
        }],
        buttons: [{
            text: _('Reset'),
            handler: 'ResetForm'
        }, {
            text: _('Submit'),
            handler: 'createPolicySub',
            itemId: 'createButton'
        }, {
            text: _('Cancle'),
            handler: 'onFormCancle'
        }]
    }]
});