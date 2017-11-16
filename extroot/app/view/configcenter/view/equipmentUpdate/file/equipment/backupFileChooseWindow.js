Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.equipment.backupFileChooseWindow', {
    extend: 'Ext.container.Container',
    xtype: 'backupFileChooseWindow',
    items: [{
        xtype: 'form',
        itemId: 'backupRemarkForm',
        levelId: 1,
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
                hidden: true,
                fieldLabel: '网元类型ID',
                readOnly: true,
                name: 'netypeid',

            }, {
                xtype: 'textfield',
                hidden: true,
                fieldLabel: '备份路径',
                readOnly: true,
                name: 'backupPath',

            }, {
                xtype: 'textfield',
                hidden: true,
                fieldLabel: '文件类型ID',
                readOnly: true,
                name: 'fileTypeId',

            }, {
                xtype: 'textfield',

                fieldLabel: _('fileversion'),
                readOnly: true,
                name: 'fileVersion',

            }, {
                xtype: 'textfield',

                fieldLabel: _('filename'),
                readOnly: true,
                name: 'backupFilename',

            }, {
                xtype: 'textareafield',
                fieldLabel: _('remark'),
                name: 'remark',

            }, {
                xtype: 'textfield',
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