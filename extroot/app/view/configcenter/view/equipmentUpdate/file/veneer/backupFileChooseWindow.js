Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.veneer.backupFileChooseWindow', {
    extend: 'Ext.container.Container',
    xtype: 'backupFileChoose',
    items: [{
        xtype: 'form',
        levelId: 1,
        itemId: 'backupRemarkForm',
        items: [{
            xtype: 'fieldset',
            title: _("Set FileVersion Remark"),
            defaults: {
                anchor: '100%',
                padding: '20 10 10 10'
            },
            margin: 20,
            items: [{
                xtype: 'textfield',
                fieldLabel: _('neType'),
                readOnly: true,
                name: 'netypename',

            }, {
                xtype: 'textfield',
                fieldLabel: '网元类型ID',
                hidden: true,
                name: 'netypeid',

            }, {
                xtype: 'textfield',
                fieldLabel: '单板类型ID',
                hidden: true,
                name: 'cardTypeId',

            }, {
                xtype: 'textfield',
                fieldLabel: _('cardType'),
                readOnly: true,
                name: 'cardTypeDisplayName',

            }, {
                xtype: 'textfield',
                fieldLabel: '文件类型ID',
                hidden: true,
                name: 'fileTypeId',

            }, {
                xtype: 'textfield',
                hidden: true,
                fieldLabel: '备份路径',
                readOnly: true,
                name: 'backupPath',

            }, {
                xtype: 'textfield',
                padding: '10px',
                fieldLabel: _('fileversion'),
                readOnly: true,
                name: 'fileVersion',

            }, {
                xtype: 'textfield',
                padding: '10px',
                fieldLabel: _('filename'),
                readOnly: true,
                name: 'backupFilename',

            }, {
                xtype: 'textareafield',
                padding: '10px',
                fieldLabel: _('remark'),
                name: 'remark',

            }, {
                xtype: 'textfield',
                padding: '10px',
                fieldLabel: 'ftpId',
                hidden: true,
                name: 'ftpId',

            }]
        }],
        buttons: [{
            text: _('Import'),
            handler: 'onBackupFileRemark'
        }, {
            text: _('Cancle'),
            handler: 'onFormCancle'
        }]
    }]
});