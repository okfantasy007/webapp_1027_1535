Ext.define("Admin.view.security.controller.userGroup.userGroupMgDomain", {
    extend: "Ext.app.ViewController",
    alias: "controller.userGroupMgDomain",
    lock: 0,
    onEdit: function () {
        var meView = this.getView();
        var window = new Admin.view.security.view.userGroup.userGroupMgDomainWindow();
        var storeL = window.down("#noselectTree").getStore();
        var storeR = window.down("#selectTree").getStore();
        meView.subnetSet.clear();
        meView.subnetDevSet.clear();
        meView.delSubnetSet.clear();
        meView.delSymbolSet.clear();
        meView.symbolSet.clear();
        var sec_usergroup_id = meView.up('userGroupTab').sec_usergroup_id;
        storeL.proxy.extraParams = {
            NEG: 1,
            use_checkbox: 1,
            symbol_id: 0,
            sec_usergroup_id: sec_usergroup_id
        };
        storeL.load();
        storeL.getRootNode().set("expanded", true);
        storeR.proxy.extraParams = {
            use_checkbox: 1,
            symbol_id: 0,
            sec_usergroup_id: sec_usergroup_id
        };
        storeR.load();
        storeR.getRootNode().set("expanded", true);
        window.show();
        this.getView().up("secUserLeftTree").add(window);
    },

    loadPages: function (rec) {
        var meView = this.getView();
        var store = meView.down("treepanel").getStore();
        var groupid = rec.get("sec_usergroup_id");
        var isAdmin = rec.get("is_belongto_admin");
        var editButton = meView.down("#editButton");
        editButton.setDisabled(isAdmin || groupid == 1);
        store.proxy.extraParams = {
            sec_usergroup_id: groupid,
            symbol_id: 0
        };
        store.reload();
    },

    onBeforeItemExpand: function (node, optd) {
        var meView = this.getView();
        var symbolId = node.data.symbol_id,
            subnetSet = meView.subnetSet,
            subnetDevSet = meView.subnetDevSet,
            delSubnetSet = meView.delSubnetSet,
            delSymbolSet = meView.delSymbolSet,
            symbolSet = meView.symbolSet,
            subnetArr = [],
            subnetDevArr = [],
            symbolArr = [],
            delSubnetArr = [],
            delSymbolArr = [];
        var sec_usergroup_id = meView.up('userGroupTab').sec_usergroup_id;
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
        }

        if (symbolId != "" && symbolId != undefined) {
            var childcount = node.childNodes.length;
            for (var i = 0; i < childcount; i++) {
                node.childNodes[0].remove();
            }
            Ext.Ajax.request({
                url: "/security/security_group/tree",
                method: "GET",
                params: {
                    symbol_id: symbolId,
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-"),
                    sec_usergroup_id: sec_usergroup_id,
                    flag: 1,
                    type: "user"
                },
                success: function (response) {
                    var r = Ext.decode(response.responseText).children;
                    for (var i = 0; i < r.length; i++) {
                        node.appendChild(r[i]);
                    }
                    if (node.lastChild && !node.lastChild.isLeaf()) {
                        node.lastChild.triggerUIUpdate();
                    }
                }
            });
        }
    }
});