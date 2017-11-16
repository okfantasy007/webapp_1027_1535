Ext.define('Admin.view.configcenter.model.grid_toolBar.CRUD', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.CRUD',

    //显示查询form
    showSearchForm: function (form, btn) {
        form.setHidden(!form.hidden);
        btn.setIconCls((!form.hidden) ? 'x-fa fa-toggle-on' : 'x-fa fa-toggle-off');

    },
    showForm: function (btn) {
        var me = this,
            form = btn.up('grid').down('form');
        me.setResetRecord(form);
        this.showSearchForm(form, btn);
    },
    gridRefresh: function (btn) {
        var grid = btn.findParentByType('PagedGrid');
        grid.store.reload();
    },
    //复用表单提交函数
    onFormSubmit: function (btn) {
        var form = btn.findParentByType('form'),
            grid = form.findParentByType('PagedGrid');
        // var afterInput = Ext.String.format(this.afterPageText, 1);
        // grid.down('pagingtoolbar').down('#inputItem').setValue(1);
        // grid.down('pagingtoolbar').down('#afterTextItem').setHtml(afterInput);
        grid.getStore().currentPage = 1;
        grid.getStore().pageSize = 15;
        if (form.getForm().isValid()) {
            grid.store.proxy.extraParams = form.getForm().getValues();
            console.log(grid.store.proxy.extraParams);
            grid.store.load();
            // grid.up().show();
            // form.setCollapsed(true);
        } else {
            Ext.MessageBox.alert(
                '填写错误',
                '请正确填写表单.'
            );

        }
    },
    //表单取消
    onFormCancle: function (btn) {
        var form = btn.findParentByType('form');
        form.reset();
        var levelId = form.levelId;
        this.getView().setActiveItem(levelId);
    },
    //grid编辑
    onEdit: function (args1, args2) {

        var grid = this.getView().down(args1),
            form = this.getView().down(args2),
            container = grid.findParentByType('container'),
            record = grid.getSelectionModel().getSelection()[0];
        container.setActiveItem(form);

        this.loadFormRecord(form, record);
    },
    //grid更新
    onGridUpdate: function (args1, args2, obj) {
        var localWindow = this.getView().down('#localWindow');
        content.setActiveItem(localWindow);
        var grid = this.getView().down(args1),
            form = this.getView().down(args2),
            record = grid.getSelectionModel().getSelection()[0];
        form.getForm().loadRecord(record);

    },
    loadFormRecord: function (form, record) {
        this.saveOriginalValues(form);
        form.getForm().loadRecord(record);
        this.setResetRecord(form);
        var container = form.findParentByType('container');
        container.setActiveItem(form);
    },
    // 保存form初始变量
    saveOriginalValues: function (form) {
        if (!form.orgValues) {
            form.orgValues = Ext.clone(form.getForm().getValues());
        }
    },
    // 使用当前form中的变量值作为reset后初始值
    setResetRecord: function (form) {
        if (!form.orgValues) {
            form.orgValues = Ext.clone(form.getForm().getValues());
            var fields = form.query();
            for (var i in fields) {
                fields[i].originalValue = fields[i].value;

            }
        }

    },
    saveOriginalValue: function (field) {
        field.originalValue = field.value;
    },
    showNeType: function (combo, record, index) {
        form = combo.findParentByType('form');
        var neType = form.getForm().findField('neTypeId');
        var neSeries = combo;
        // if (!neType) {
        //     var neType = form.getForm().findField('neTypeName');
        // }
        neType.store.proxy.extraParams = {
            "categoryid": neSeries.getValue()
        };
        // neType.store.reload();
        // neType.store.on("load", function () {
        //     var netypename = [];
        //     var netypeid = [];
        //     var count = neType.store.getCount();
        //     for (var i = 0; i < count; i++) {
        //         netypename.push(neType.store.getAt(i).data.netypename);
        //         netypeid.push(neType.store.getAt(i).data.netypeid);
        //     }
        //     var neTypeValue = netypename[0];
        //     var netypeidValue = netypeid[0];

        //     neType.setRawValue(neTypeValue);
        //     neType.setValue(netypeidValue);


        //     console.log('@#@#@#:::' + neTypeValue);
        // });
        neType.store.load({
            callback: function () {
                var netypename = [];
                var netypeid = [];
                var count = neType.store.getCount();
                for (var i = 0; i < count; i++) {
                    netypename.push(neType.store.getAt(i).data.netypename);
                    netypeid.push(neType.store.getAt(i).data.netypeid);
                }
                var neTypeValue = netypename[0];
                var netypeidValue = netypeid[0];

                neType.setRawValue(neTypeValue);
                neType.setValue(netypeidValue);

            }
        });

    },
    selectSeriesFirst: function (combo, event, eOpts) {
        form = combo.findParentByType('form');
        var neType = combo;
        var neSeries = form.getForm().findField('categoryid');
        if (!neSeries.getValue()) {
            Ext.Msg.alert('提示', '请控制你自己,先选择网元系列')
            neType.blur();
            neSeries.focus();
        }
    },
    firstSelect: function (combo) {
        combo.store.load({
            callback: function () {
                var firstValue = combo.store.getAt(0).data.categoryid;
                combo.setValue(firstValue);
            }
        });
        // combo.store.on('beforeload', function (store, options) {
        //     alert(111);
        //     var new_params = { 's': 1 };
        //     Ext.apply(store.proxy.extraParams, new_params);
        // });
    },
    firstSoftSelect: function (combo) {
        combo.store.proxy.url = '/confcenter/configcenter/res/fileType/list';
        var name = combo.getName();
        combo.store.load({
            callback: function () {
                var newData = {
                    'fileTypeName': 'All Files',
                    'fileTypeId': -1
                };
                combo.store.insert(0, newData);
                if (name == 'fileTypeId') {
                    combo.setRawValue('All Files');
                    combo.setValue(-1);
                } else {
                    combo.setValue('All Files');
                }
                // var value = combo.store.getAt(0).data.fileTypeName
                // combo.setRawValue('All Files');
                //combo.setValue(-1);
            }
        });
    },
    showCardType: function (combo, record, index) {
        form = combo.findParentByType('form');
        var cardType = form.getForm().findField('cardTypeId');
        var neType = combo;
        cardType.store.proxy.extraParams = {
            "neTypeId": neType.getValue()
        };
        cardType.store.load({
            callback: function () {
                var cardTypeName = [];
                var cardTypeId = [];
                var count = cardType.store.getCount();
                for (var i = 0; i < count; i++) {
                    cardTypeName.push(cardType.store.getAt(i).data.cardTypeName);
                    cardTypeId.push(cardType.store.getAt(i).data.cardTypeId);
                }
                var nameValue = cardTypeName[0];
                var idValue = cardTypeId[0];
                cardType.setRawValue(nameValue);
                cardType.setValue(idValue);
                if (!idValue) {
                    var newData = {
                        'cardTypeName': '暂无数据',
                        'cardTypeId': -2
                    };
                    cardType.store.insert(0, newData);
                    cardType.setRawValue('暂无数据');
                    cardType.setValue(-2);
                    console.log(cardType.getValue());
                }

            }
        });
        // cardType.store.load();
        // console.log(cardType.store);
    },
    showFileType: function (combo, record, index) {
        var form = combo.findParentByType('form');
        var fileType = form.getForm().findField('fileTypeId');

        if (combo.getName() == 'cardTypeId') {

            fileType.store.proxy.url = '/confcenter/configcenter/res/fileType/card/upgrade/list';
            fileType.store.proxy.extraParams = {
                "cardTypeId": combo.getValue()
            };
        } else {
            fileType.store.proxy.url = '/confcenter/configcenter/res/fileType/ne/upgrade/list';
            fileType.store.proxy.extraParams = {
                "neTypeId": combo.getValue()
            };
        }
        //    console.log(fileType.dom.value);

        fileType.store.load({
            callback: function () {
                var fileTypeName = [];
                var fileTypeId = [];
                var count = fileType.store.getCount();
                for (var i = 0; i < count; i++) {
                    fileTypeName.push(fileType.store.getAt(i).data.fileTypeName);
                    fileTypeId.push(fileType.store.getAt(i).data.fileTypeId);
                }

                var nameValue = fileTypeName[0];
                var idValue = fileTypeId[0];
                fileType.setRawValue(nameValue);
                fileType.setValue(idValue);
                if (!idValue) {
                    var newData = {
                        'fileTypeName': '',
                        'fileTypeId': -1
                    };
                    fileType.store.add(newData);
                    fileType.setRawValue('');
                    fileType.setValue('-1');
                }

            }
        });
    },
    backupShowFileType: function (combo, record, index) {
        var form = combo.findParentByType('form');
        var fileType = form.getForm().findField('fileTypeName');
        if (combo.getName() == 'cardTypeId') {

            fileType.store.proxy.url = '/confcenter/configcenter/res/fileType/card/backup/list';
            fileType.store.proxy.extraParams = {
                "cardTypeId": combo.getValue()
            };
        } else {
            fileType.store.proxy.url = '/confcenter/configcenter/res/fileType/ne/backup/list';
            fileType.store.proxy.extraParams = {
                "neTypeId": combo.getValue()
            };
        }
        //    console.log(fileType.dom.value);

        fileType.store.load({
            callback: function () {
                var fileTypeName = [];
                var fileTypeId = [];
                var count = fileType.store.getCount();
                for (var i = 0; i < count; i++) {
                    fileTypeName.push(fileType.store.getAt(i).data.fileTypeName);
                    fileTypeId.push(fileType.store.getAt(i).data.fileTypeName);
                }

                var nameValue = fileTypeName[0];
                var idValue = fileTypeId[0];
                fileType.setRawValue(nameValue);
                fileType.setValue(idValue);
                if (!idValue) {
                    var newData = {
                        'fileTypeName': '暂无数据',
                        'fileTypeId': -1
                    };
                    fileType.store.add(newData);
                    fileType.setRawValue('');
                    // fileType.setValue(-1);
                }

            }
        });
    },
    //选择协议
    // choosePact: function (radio) {
    //     var item = radio;
    //     var fileTransferProtocol = item.getValue().fileTransferProtocol;
    //     var me = this;
    //     var ftpValue = this.getViewModel().get('ftpValue');
    //     var form = radio.findParentByType('form');
    //     var ip = form.getForm().findField('ftpIp');
    //     var ftpUsername = form.getForm().findField('ftpUsername');
    //     var ftpPassword = form.getForm().findField('ftpPassword');
    //     var container = ftpUsername.findParentByType('fieldcontainer');
    //     var ftpPort = form.getForm().findField('ftpPort');
    //     var ftpType = form.ftpType;
    //     console.log(ftpValue);
    //     if (fileTransferProtocol == 1 && ftpType == 'upgrade') {
    //         container.show();
    //         ip.setValue(Ext.util.Format.trim(ftpValue.FTP_UPGRADE.ftpIp));
    //         ftpPort.setValue(ftpValue.FTP_UPGRADE.ftpPort);
    //         ftpUsername.setValue(ftpValue.FTP_UPGRADE.ftpUsername);
    //         ftpPassword.setValue(ftpValue.FTP_UPGRADE.ftpPassword);
    //     } else if (fileTransferProtocol == 1 && ftpType == 'backup') {
    //         container.show();
    //         ip.setValue(Ext.util.Format.trim(ftpValue.FTP_BACKUP.ftpIp));
    //         ftpPort.setValue(ftpValue.FTP_BACKUP.ftpPort);
    //         ftpUsername.setValue(ftpValue.FTP_BACKUP.ftpUsername);
    //         ftpPassword.setValue(ftpValue.FTP_BACKUP.ftpPassword);
    //     } else if (fileTransferProtocol == 2) {
    //         container.hide();
    //         ip.setValue(Ext.util.Format.trim(ftpValue.TFTP.ftpIp));
    //         ftpPort.setValue(ftpValue.TFTP.ftpPort);
    //     } else if (fileTransferProtocol == 3) {
    //         container.hide();
    //         ip.setValue(Ext.util.Format.trim(ftpValue.HTTP.ftpIp));
    //         ftpPort.setValue(ftpValue.HTTP.ftpPort);
    //     }


    // },
    choosePact: function (radio) {
        var item = radio;
        var fileTransferProtocol = item.getValue().fileTransferProtocol;
        var me = this;
        var form = radio.findParentByType('form');
        var ip = form.getForm().findField('ftpIp');
        var ftpUsername = form.getForm().findField('ftpUsername');
        var ftpPassword = form.getForm().findField('ftpPassword');
        var container2 = form.down('#container2');
        var container = ftpUsername.findParentByType('fieldcontainer');
        var ftpPort = form.getForm().findField('ftpPort');
        var fields = container2.query();
        //var ftpType = form.ftpType;
        //console.log(ftpValue);
        for (var i in fields) {
            var field = fields[i];
            console.log(field.getXType());
            if (field.getXType() == 'fieldcontainer' ||
                field.getXType() == "radiogroup" ||
                field.getXType() == "panel" ||
                field.getXType() == "boundlist" ||
                field.getXType() == "radiofield") {
                continue;
            } else {
                field.setValue('');
            }
        }
        console.log(fileTransferProtocol);

        ip.store.proxy.extraParams = {
            'procotol': fileTransferProtocol
        };
        ip.store.reload({
            callback: function () {
                var ipValue = ip.store.getAt(0).data.ip;
                ip.setValue(ipValue);
                console.log(ipValue);
                if (!ipValue) {
                    var newData = {
                        'ip': '暂无数据',
                    };
                    ip.store.add(newData);
                    ip.setValue('暂无数据');
                }

            }
        });
        if (fileTransferProtocol == 1) {
            container.show();
        } else
        if (fileTransferProtocol == 2 || fileTransferProtocol == 3) {
            container.hide();
        }
    },
    selectFtpIp: function (combo, record, index) {
        var me = this;
        var form = combo.findParentByType('form');
        var ftpPort = form.getForm().findField('ftpPort');
        var ftpUsername = form.getForm().findField('ftpUsername');
        var fileTransferProtocol = form.getForm().findField('fileTransferProtocol');
        var ftpIp = combo.getValue();
        var protocolValue = fileTransferProtocol.getValue().fileTransferProtocol;
        if (protocolValue == 1) {
            ftpUsername.store.proxy.extraParams = {
                'ftpIp': ftpIp
            };
            ftpUsername.store.reload();
        } else if (protocolValue == 2 || protocolValue == 3) {
            Ext.Ajax.request({
                url: '/confcenter/configcenter/res/fileServer',
                method: 'get',
                params: {
                    'protocol': protocolValue,
                    'ip': ftpIp,
                },
                success: function (response, opts) {
                    var recs = Ext.decode(response.responseText);
                    ftpPort.setValue(recs.fileServer.ftpPort);
                    console.log(recs);

                }
            });
        }

    },
    selectFtpUser: function (combo, record, index) {
        var me = this;
        var form = combo.findParentByType('form');
        var ip = form.getForm().findField('ftpIp');
        var fileTransferProtocol = form.getForm().findField('fileTransferProtocol');
        var ftpPassword = form.getForm().findField('ftpPassword');
        var ftpPort = form.getForm().findField('ftpPort');
        Ext.Ajax.request({
            url: '/confcenter/configcenter/res/fileServer',
            method: 'get',
            params: {
                'protocol': fileTransferProtocol.getValue().fileTransferProtocol,
                'ip': ip.getValue(),
                'username': combo.getValue()
            },
            success: function (response, opts) {
                var recs = Ext.decode(response.responseText);
                ftpPort.setValue(recs.fileServer.ftpPort);
                ftpPassword.setValue(recs.fileServer.ftpPassword);
                console.log(recs);

            }
        });

    },
    //是否使用默认配置
    defaultConf: function (radio) {
        var form = radio.findParentByType('form');
        var me = this;
        var fileTransferProtocol = form.getForm().findField('fileTransferProtocol').getValue().fileTransferProtocol;
        var ip = form.getForm().findField('ftpIp');
        var ftpPort = form.getForm().findField('ftpPort');
        var ftpUsername = form.getForm().findField('ftpUsername');
        var ftpPassword = form.getForm().findField('ftpPassword');
        var radioValue = radio.getValue().fileTransferProtocol;
        var ftpType = form.ftpType;
        // var FTP = form.down('#FTP');
        // console.log(FTP);
        //FTP.setChecked(true);
        ip.store.proxy.extraParams = {
            'procotol': fileTransferProtocol
        };
        ip.store.reload();
        Ext.Ajax.request({
            url: '/confcenter/configcenter/res/fileServer/defaultConfig',
            method: 'get',
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (resp, opts) {
                var respText = Ext.util.JSON.decode(resp.responseText);
                var causeid = respText.causeid;
                var fileServers = respText.fileServers;
                me.getViewModel().set('ftpValue', fileServers);
                ftpValue = fileServers;
                if (causeid == 14000 && ftpType == 'upgrade') {
                    ip.setValue(Ext.util.Format.trim(ftpValue.FTP_UPGRADE.ftpIp));
                    ftpPort.setValue(ftpValue.FTP_UPGRADE.ftpPort);
                    ftpUsername.setValue(ftpValue.FTP_UPGRADE.ftpUsername);
                    ftpPassword.setValue(ftpValue.FTP_UPGRADE.ftpPassword);
                }
                if (causeid == 14000 && ftpType == 'backup') {
                    ip.setValue(Ext.util.Format.trim(ftpValue.FTP_BACKUP.ftpIp));
                    ftpPort.setValue(ftpValue.FTP_BACKUP.ftpPort);
                    ftpUsername.setValue(ftpValue.FTP_BACKUP.ftpUsername);
                    ftpPassword.setValue(ftpValue.FTP_BACKUP.ftpPassword);
                } else {
                    me.failureMessage(causeid);
                }
            },
            failure: function (resp, opts) {
                // Ext.Msg.alert(_('Tips'), _('Request Error'));
            }
        });


    },
    defaultConfChange: function (radio) {
        var form = radio.findParentByType('form');
        var ip = form.getForm().findField('ftpIp');
        var me = this;
        var fileTransferProtocol = form.getForm().findField('fileTransferProtocol').getValue().fileTransferProtocol;
        var ftpPort = form.getForm().findField('ftpPort');
        var ftpUsername = form.getForm().findField('ftpUsername');
        var ftpPassword = form.getForm().findField('ftpPassword');
        var radioValue = radio.getValue().defaultConfig;
        var ftpType = form.ftpType;
        console.log(ip);
        if (radioValue == 1) {
            if (fileTransferProtocol == 1 && ftpType == 'upgrade') {

                ip.setValue(Ext.util.Format.trim(ftpValue.FTP_UPGRADE.ftpIp));
                ftpPort.setValue(ftpValue.FTP_UPGRADE.ftpPort);
                ftpUsername.setValue(ftpValue.FTP_UPGRADE.ftpUsername);
                ftpPassword.setValue(ftpValue.FTP_UPGRADE.ftpPassword);
            } else if (fileTransferProtocol == 1 && ftpType == 'backup') {
                ip.setValue(Ext.util.Format.trim(ftpValue.FTP_BACKUP.ftpIp));
                ftpPort.setValue(ftpValue.FTP_BACKUP.ftpPort);
                ftpUsername.setValue(ftpValue.FTP_BACKUP.ftpUsername);
                ftpPassword.setValue(ftpValue.FTP_BACKUP.ftpPassword);
            } else if (fileTransferProtocol == 2) {
                ip.setValue(Ext.util.Format.trim(ftpValue.TFTP.ftpIp));
                ftpPort.setValue(ftpValue.TFTP.ftpPort);
                ftpUsername.setValue(ftpValue.TFTP.ftpUsername);
                ftpPassword.setValue(ftpValue.TFTP.ftpPassword);
            } else if (fileTransferProtocol == 3) {
                ip.setValue(Ext.util.Format.trim(ftpValue.HTTP.ftpIp));
                ftpPort.setValue(ftpValue.HTTP.ftpPort);
                ftpUsername.setValue(ftpValue.HTTP.ftpUsername);
                ftpPassword.setValue(ftpValue.HTTP.ftpPassword);
            }
        } else {
            ip.setValue('');
            ftpPort.setValue('');
            ftpUsername.setValue('');
            ftpPassword.setValue('');
        }


    },
    failureMessage: function (causeid) {
        if (causeid == 14001) {
            Ext.MessageBox.alert(_('Tips'), _('Interface Call Failed'));
        } else if (causeid == 14002) {
            Ext.MessageBox.alert(_('Tips'), _('Request Parameter Error'));
        } else if (causeid == 14003) {
            Ext.MessageBox.alert(_('Tips'), _('Server Internal Error'));
        } else if (causeid == 14004) {
            Ext.MessageBox.alert(_('Tips'), _('The import file is null'));
        } else if (causeid == 14005) {
            Ext.MessageBox.alert(_('Tips'), _('The file does not contain the file header'));
        } else if (causeid == 14006) {
            Ext.MessageBox.alert(_('Tips'), _('File check failed'));
        } else if (causeid == 14007) {
            Ext.MessageBox.alert(_('Tips'), _('File type check failed'));
        } else if (causeid == 14008) {
            Ext.MessageBox.alert(_('Tips'), _('Request param neTypeId illegal'));
        } else if (causeid == 14009) {
            Ext.MessageBox.alert(_('Tips'), _('Failed to upload file'));
        } else if (causeid == 14010) {
            Ext.MessageBox.alert(_('Tips'), _('Failed to download file from file server'));
        } else if (causeid == 14011) {
            Ext.MessageBox.alert(_('Tips'), _('Deleted files are referenced by tasks that are not executed'));
        } else if (causeid == 14012) {
            Ext.MessageBox.alert(_('Tips'), _('Export csv file failure!'));
        } else if (causeid == 14013) {
            Ext.MessageBox.alert(_('Tips'), _('The port number must be an integer between 0-65535'));
        } else if (causeid == 14014) {
            Ext.MessageBox.alert(_('Tips'), _('The ip address format is illegal'));
        } else if (causeid == 14015) {
            Ext.MessageBox.alert(_('Tips'), _('The file version is conflicting'));
        } else if (causeid == 14016) {
            Ext.MessageBox.alert(_('Tips'), _('The type of device in the selected device is inconsistent with the type of device corresponding to the file list'));
        } else if (causeid == 14017) {
            Ext.MessageBox.alert(_('Tips'), _('The deleted task is running'));
        } else if (causeid == 14018) {
            Ext.MessageBox.alert(_('Tips'), _('Removed device has running task'));
        } else if (causeid == 14019) {
            Ext.MessageBox.alert(_('Tips'), _('The file ID list is empty'));
        } else if (causeid == 14020) {
            Ext.MessageBox.alert(_('Tips'), _('The task is existing'));
        } else if (causeid == 14021) {
            Ext.MessageBox.alert(_('Tips'), _('Download backupfile failure!'));
        } else if (causeid == 14022) {
            Ext.MessageBox.alert(_('Tips'), _('Please select ne type!'));
        } else if (causeid == 14023) {
            Ext.MessageBox.alert(_('Tips'), _('Please select card type!'));
        } else if (causeid == 14024) {
            Ext.MessageBox.alert(_('Tips'), _('There is no file type available!'));
        } else if (causeid == 14025) {
            Ext.MessageBox.alert(_('Tips'), _("Please select ftp server's username!"));
        } else if (causeid == 14026) {
            Ext.MessageBox.alert(_('Tips'), _("Policy duplication!"));
        } else if (causeid == 14027) {
            Ext.MessageBox.alert(_('Tips'), _("Please select ne!"));
        } else if (causeid == 14028) {
            Ext.MessageBox.alert(_('Tips'), _("Please select card!"));
        } else if (causeid == 14029) {
            Ext.MessageBox.alert(_('Tips'), _("Please input file server's ip!"));
        } else if (causeid == 14030) {
            Ext.MessageBox.alert(_('Tips'), _("Please input ftp server's port!"));
        } else if (causeid == 14031) {
            Ext.MessageBox.alert(_('Tips'), _("The type of file corresponding to the same device type is not unique!"));
        } else if (causeid == 14101) {
            Ext.MessageBox.alert(_('Tips'), _('No result'));
        } else if (causeid == 14102) {
            Ext.MessageBox.alert(_('Tips'), _('Upgrade step error'));
        } else if (causeid == 14103) {
            Ext.MessageBox.alert(_('Tips'), _('Unknown resource type'));
        } else if (causeid == 14104) {
            Ext.MessageBox.alert(_('Tips'), _('Policy duplication'));
        }
    },
    ResetForm: function (btn) {
        var form = btn.findParentByType('form'),
            grid = form.up('PagedGrid');
        form.reset();
        if (!form.getForm().getValues().neTypeId) {
            form.reset();
        }
        console.log(form.getForm().getValues());
        if (grid) {
            grid.store.proxy.extraParams = form.getForm().getValues();
            grid.store.load();
        }


    },
    onBack: function (btn) {
        var me = this,
            grid = btn.up('PagedGrid'),
            form = grid.down('form'),
            levelId = grid.levelId;
        // grid.store.reload();
        form.reset();
        if (!form.getForm().getValues().neTypeId) {
            form.reset();
        }
        grid.store.proxy.extraParams = form.getForm().getValues();

        grid.store.reload();

        me.getView().setActiveItem(levelId);
    },
    showToolTip: function fGridTooltips(value, metaData, record, rowIdx, colIdx, store) {
        //==>用tooltip浮窗,显示编码后单元格内的值
        metaData.tdAttr = 'data-qtip="' + Ext.String.htmlEncode(value) + '"';
        return value;
    },
    onItemClick: function (me, selected, eOpts) {
        var grid = this.getTaskGrid(),
            // elCnt = grid.getSelectionModel().getSelection().length,
            //elCnt = selected,
            editBtn = grid.down('#theRelateBtn');
        // console.log(selCnt);
        console.log(selected.length);
        if (selected.length == 1) {
            // editBtn.addCls('x-btn-disabled');
            editBtn.setDisabled(false);
            console.log(1);
        } else {
            // editBtn.removeCls('x-btn-disabled');
            editBtn.setDisabled(true);
            console.log(2);
        }
    },
});