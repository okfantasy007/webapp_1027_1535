Ext.define('Admin.view.security.secBaseController.genericController', {
    extend: 'Ext.app.ViewController',
    onSubmit: function (type) {
        var controller = this;

        if (type == 'userTab') {
            var userGeneric = this.getView().down('userGeneric');
        } else {
            var userGeneric = this.getView();
        }
        var nextLogin = userGeneric.down('#change_password_next_login');
        var nextLoginCopy = userGeneric.down('#change_password_next_login_copy');
        var noChangePwd = userGeneric.down('#cannot_change_password');
        var noChangePwdCopy = userGeneric.down('#cannot_change_password_copy');
        if (nextLogin.getValue()) {
            nextLoginCopy.setDisabled(true);
        } else {
            nextLoginCopy.setDisabled(false);

        };
        if (noChangePwd.getValue()) {
            noChangePwdCopy.setDisabled(true);
        } else {
            noChangePwdCopy.setDisabled(false);
        };
        if (type == 'userTab') {
            if (userGeneric.getForm().isValid()) {
                var userInfo = this.getView().down('userInfo').getForm(),
                    userOfGroup = this.getView().down('userOfGroup'),
                    userControlList = this.getView().down('userControlList'),
                    radioGroup = userControlList.down('radiogroup').getValue(),
                    selectedTree = this.getView().down('userMgDomain').down('treepanel'),
                    operationAuthority = this.getView().down('userOpAuthority'),
                    userMgDomain = this.getView().down("userMgDomain"),
                    subnetSet = userMgDomain.subnetSet,
                    subnetDevSet = userMgDomain.subnetDevSet,
                    symbolSet = userMgDomain.symbolSet,
                    delSubnetSet = userMgDomain.delSubnetSet,
                    delSymbolSet = userMgDomain.delSymbolSet,
                    subnetArr = [],
                    subnetDevArr = [],
                    symbolArr = [],
                    delSubnetArr = [],
                    delSymbolArr = [],
                    controller = this;
                //=================================集合遍历转化为数组=================================
                if (subnetSet != undefined) {
                    subnetSet.forEach(function (element, sameElement, set) {
                        subnetArr.push(element);
                    });
                }
                if (subnetDevSet != undefined) {
                    subnetDevSet.forEach(function (element, sameElement, set) {
                        subnetDevArr.push(element);
                    });
                }
                if (symbolSet != undefined) {
                    symbolSet.forEach(function (element, sameElement, set) {
                        symbolArr.push(element);
                    });
                }
                if (delSubnetSet != undefined) {
                    delSubnetSet.forEach(function (element, sameElement, set) {
                        delSubnetArr.push(element);
                    });
                }
                if (delSymbolSet != undefined) {
                    delSymbolSet.forEach(function (element, sameElement, set) {
                        delSymbolArr.push(element);
                    });
                };
                var operset_ids = this.getView().down('userOpAuthority').operset_ids;
                var selectControlListId = [];
                if (radioGroup.use_all_acl == 2) {
                    var records = userControlList.store.getData();
                    for (var i in records.items) {
                        if (records.items[i].get('checked')) {
                            selectControlListId.push(records.items[i].get('id'))
                        }
                    }
                };

                var params = {
                    selectedId: userOfGroup.selectedId.join(','),
                    selectControlListId: selectControlListId.join(','),
                    use_all_acl: radioGroup.use_all_acl,
                    resource_ids: selectedTree.selectedIds,
                    opSelectedIds: operset_ids.join(','),
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-"),
                    type: 'user'
                };

                Ext.Object.merge(params, userInfo.getValues()); //将对象合并
                userGeneric.getForm().submit({
                    url: '/security/add_user',
                    params: params,
                    success: function (self, action) {
                        Ext.Msg.alert(_('Notice'), action.result.msg,
                            function () {
                                controller.getView().up('#security_user_view').lookupController().onRefresh();
                                controller.getView().up('secUserLeftTree').lookupController().onRefresh();
                                controller.getView().up().close();
                            });
                    },
                    failure: function (self, action) {
                        var num = action.result.num;
                        if (!num) {
                            num = "";
                        }
                        Ext.Msg.alert(_('Notice'), _(action.result.msg) + num);
                    }
                });
            } else {
                Ext.Msg.alert(_('Notice'), _('The input parameter is not formatted correctly'));
            }
        } else {
            if (userGeneric.getForm().isValid()) {
                userGeneric.getForm().submit({
                    url: '/security/user_genericinfo_modify',
                    waitTitle: _('Please wait...'),
                    waitMsg: _('Please wait...'),
                    success: function (form, action) {
                        Ext.MessageBox.alert(_('Notice'), _(action.result.msg),
                            function () {
                                controller.getView().up('secUserLeftTree').down('#security_user_view').lookupController().onRefresh();
                                controller.getView().up('secUserLeftTree').lookupController().onRefresh();
                            });
                    },
                    failure: function (form, action) {
                        Ext.MessageBox.alert(_('Notice'), _(action.result.msg));
                    }
                });
            } else {
                Ext.Msg.alert(_('Notice'), _('The input parameter is not formatted correctly'));
            }
        }
    }
});