Ext.define("Admin.view.security.controller.userGroup.userGroupTab", {
    extend: "Ext.app.ViewController",
    alias: "controller.userGroupTab",

    onOk: function () {
        var meView = this.getView();
        var userGroupGeneric = meView.down("userGroupGeneric").getForm(),
            selectedId = meView.down("userGroupMember").selectedId,
            userGroupMgDomain = meView.down("userGroupMgDomain"),
            subnetSet = userGroupMgDomain.subnetSet,
            subnetDevSet = userGroupMgDomain.subnetDevSet,
            symbolSet = userGroupMgDomain.symbolSet,
            delSubnetSet = userGroupMgDomain.delSubnetSet,
            delSymbolSet = userGroupMgDomain.delSymbolSet,
            subnetArr = [],
            subnetDevArr = [],
            symbolArr = [],
            delSubnetArr = [],
            delSymbolArr = [];
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
        var operset_ids = this.getView().down('userGroupOpAuthority').operset_ids;
        //=================================检验提交表单是否合法=================================
        if (userGroupGeneric.isValid()) {
            userGroupGeneric.submit({
                url: "/security/security_group/add",
                params: {
                    selectedId: selectedId.join("-"),
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-"),
                    opSelectedIds: operset_ids.join(",")
                },
                success: function (form, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg),
                        function () {
                            meView.up("#security_group_view").lookupController().onRefresh();
                            meView.up("secUserLeftTree").lookupController().onRefresh();
                            meView.up().close();
                        });
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg));
                }
            });
        } else {
            Ext.Msg.alert(_('Notice'), _("The input parameter is not formatted correctly"));
        }
    },

    onCancel: function () {
        var meView = this.getView();
        var userGroupOpAuthority = meView.down('userGroupOpAuthority')
        userGroupOpAuthority.addIds.clear();
        userGroupOpAuthority.delIds.clear();
        meView.up().close();
    },

    loadPages: function (rec) {
        var meView = this.getView();
        meView.down("#security_gorup_form_generic").getForm().loadRecord(rec);
        meView.down("#security_group_form_member").lookupController().loadPages(rec);
        meView.down("#user_group_form_resource").lookupController().loadPages(rec);
        meView.down("#user_group_form_operset").lookupController().loadPages(rec);
        meView.down('#user_group_form_operset').sec_usergroup_id = rec.get("sec_usergroup_id");
        meView.sec_usergroup_id = rec.get('sec_usergroup_id');
        meView.name = rec.get('sec_usergroup_name');
    }
});