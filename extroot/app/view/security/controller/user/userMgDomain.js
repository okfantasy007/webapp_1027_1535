Ext.define("Admin.view.security.controller.user.userMgDomain", {
    extend: "Ext.app.ViewController",
    alias: "controller.userMgDomain",
    lock: 0,
    onEdit: function () {
        var meView = this.getView();
        var window = new Admin.view.security.view.user.userMgDomainWindow();
        var storeL = window.down("#noselectTree").getStore();
        var storeR = window.down("#selectTree").getStore();
        var sec_user_id = meView.up('userTab').sec_user_id;
        meView.subnetSet.clear();
        meView.subnetDevSet.clear();
        meView.delSubnetSet.clear();
        meView.delSymbolSet.clear();
        meView.symbolSet.clear();
        storeL.proxy.extraParams = {
            NEG: 1,
            use_checkbox: 1,
            symbol_id: 0,
            sec_usergroup_id: sec_user_id,
            type: 'user'
        };
        storeL.load();
        storeL.getRootNode().set("expanded", true);

        storeR.proxy.extraParams = {
            use_checkbox: 1,
            symbol_id: 0,
            sec_usergroup_id: sec_user_id,
            type: 'user'
        };
        storeR.load();
        storeR.getRootNode().set("expanded", true);

        window.show();
        meView.up("secUserLeftTree").add(window);
    },

    loadPages: function (rec) {
        var meView = this.getView();
        var tree = meView.down("treepanel");
        var userid = rec.get("sec_user_id");
        var isAdmin = rec.get("is_belongto_admin");
        var editButton = meView.down("#editButton");
        editButton.setDisabled(isAdmin || userid == 1);
        tree.getStore().proxy.extraParams = {
            sec_usergroup_id: userid,
            symbol_id: 0,
            type: 'user'
        };
        tree.getStore().reload();
    },

    onBeforeItemExpand: function (node, optd) {//异步加载点击监听事件
        var meView = this.getView();
        var subnetArr = [],
            subnetDevArr = [],
            symbolArr = [],
            delSubnetArr = [],
            delSymbolArr = [],
            symbolId = node.data.symbol_id,
            subnetSet = meView.subnetSet,
            subnetDevSet = meView.subnetDevSet,
            delSubnetSet = meView.delSubnetSet,
            delSymbolSet = meView.delSymbolSet,
            symbolSet = meView.symbolSet,
            sec_user_id = meView.up("userTab").sec_user_id;

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
                    sec_usergroup_id: sec_user_id,
                    flag: 1,
                    type: "user"
                },
                success: function (response, opts) {
                    var r = Ext.decode(response.responseText).children;
                    for (var i = 0; i < r.length; i++) {
                        node.appendChild(r[i]);
                    }
                    if (node.lastChild && !node.lastChild.isLeaf()) {
                        node.lastChild.triggerUIUpdate();
                    }
                },
                failure: function (response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
        }
    }
});