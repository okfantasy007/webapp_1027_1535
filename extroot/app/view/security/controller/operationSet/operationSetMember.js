Ext.define('Admin.view.security.controller.operationSet.operationSetMember', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.operationSetMember',

    onApply: function () {
        var meView = this.getView(),
            name = meView.up('operationSetTab').name,
            selectedIds = [];
        var selectedTree = meView.down("#select_tree");
        var childNodes = selectedTree.getRootNode().childNodes;
        var getIds = function (childNodes) {
            for (var i in childNodes) {
                selectedIds.push(childNodes[i].get("fun_id"));
                if (childNodes[i].hasChildNodes) {
                    getIds(childNodes[i].childNodes);
                }
            }
        }
        getIds(childNodes);
        Ext.create('Ext.form.Panel').getForm().submit({
            url: '/security/security_operset/update_Operate',
            params: {
                name: name,
                ids: meView.ids_selected.join(","),
                sec_operator_set_id: meView.sec_operator_set_id,
                selectedIds: selectedIds.join(",")
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg),
                    function () {
                        meView.up('secUserLeftTree').down('#security_operset_view').lookupController().onRefresh();
                        meView.up('secUserLeftTree').lookupController().onRefresh();
                    });
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg));
                var noselect_tree = meView.down("#noselect_tree"),
                    select_tree = meView.down("#select_tree");
                noselect_tree.getStore().reload();
                select_tree.getStore().reload();
            }
        });
    },

    refresh_view: function () {//向后台发送代理请求将操作后的数组传给后台，以便后台绘树
        var me = this;
        var meView = me.getView(),
            noselect_tree = meView.down("#noselect_tree"),
            select_tree = meView.down("#select_tree"),
            proxyL = noselect_tree.store.proxy.extraParams,
            proxyR = select_tree.store.proxy.extraParams,
            operset_type = meView.up().down('operationSetGeneric').down('#sec_operator_set_type').getValue();
        var ids_move_add = me.setToArray(meView.ids_set_add, []);
        var ids_move_del = me.setToArray(meView.ids_set_del, []);
        proxyL.ids = meView.ids_noselected.join(',');
        proxyL.ids_move_add = ids_move_add.join(',');
        proxyL.ids_move_del = ids_move_del.join(',');
        proxyL.is_complete = meView.is_complete;
        proxyL.operset_type = operset_type;
        proxyL.use_token = 1;
        noselect_tree.getStore().load();
        noselect_tree.getStore().getRootNode().set("expanded", true);

        proxyR.ids = meView.ids_selected.join(',');
        proxyR.ids_move_add = ids_move_add.join(',');
        proxyR.ids_move_del = ids_move_del.join(',');
        proxyR.is_complete = meView.is_complete;
        proxyR.operset_type = operset_type;
        proxyR.use_token = 0;
        select_tree.getStore().load();
        select_tree.getStore().getRootNode().set("expanded", true);

    },

    load_form: function (vars) {//页面渲染时向后台发送请求获得id，然后左右移动时操作该数组
        var me = this;
        var meView = me.getView();
        meView.ids_set_add.clear();
        meView.ids_set_del.clear();
        meView.sec_operator_set_id = vars.sec_operator_set_id;
        Ext.Ajax.request({
            url: '/security/security_operset/getoperator',
            params: {
                sec_operator_set_id: vars.sec_operator_set_id,
                sec_operator_set_type: vars.sec_operator_set_type
            },
            success: function (response, opts) {
                var obj = Ext.decode(response.responseText);
                meView.ids_selected = obj.ids_selected;
                meView.ids_noselected = obj.ids_noselected;
                meView.is_complete = obj.is_complete;
                meView.operset_type = vars.sec_operator_set_type;
                me.refresh_view();
            }
        });
    },

    onSelect: function () {//向右移动
        var me = this;
        var meView = me.getView();
        var tree = meView.down("#noselect_tree");
        var select = tree.getSelection();
        var str = "";
        if (select.length != 0) {
            var recs = me.get_tree_nodes_ids(select);
        } else {
            console.log("Unselected Please Check");
            return;
        }

        for (var i in recs) {
            var fun_id = recs[i].get('fun_id');
            if (!Ext.Array.contains(meView.ids_selected, fun_id)) {
                meView.ids_selected.push(fun_id);
            }
            if (Ext.Array.contains(meView.ids_noselected, fun_id)) {
                Ext.Array.remove(meView.ids_noselected, fun_id);
            }
            me.getIds(recs[i], meView.ids_selected);
            meView.arr = [];
            me.getSet(recs[i], str, meView.arr);
            meView.ids_set_add.add(meView.arr[0]);
        }
        me.refresh_view();
    },

    onSelectAll: function () {
        var me = this;
        var meView = me.getView();
        meView.ids_set_add.clear();
        meView.ids_set_del.clear();
        while (meView.ids_noselected.length > 0) {
            meView.ids_selected.push(meView.ids_noselected.pop());
        }
        me.refresh_view();
    },

    onDeSelect: function () {
        var me = this;
        var meView = me.getView();
        var tree = meView.down("#select_tree");
        var select = tree.getSelection();
        var str = "";
        if (select.length != 0) {
            var recs = me.get_tree_nodes_ids(select);
        } else {
            console.log("Unselected Please Check");
            return;
        }
        for (var i in recs) {
            var fun_id = recs[i].get('fun_id');
            if (!Ext.Array.contains(meView.ids_noselected, fun_id)) {
                meView.ids_noselected.push(fun_id);
            }
            if (Ext.Array.contains(meView.ids_selected, fun_id)) {
                Ext.Array.remove(meView.ids_selected, fun_id);
            }
            me.getIds(recs[i], meView.ids_selected);
            meView.arr = [];
            me.getSet(recs[i], str, meView.arr);
            meView.ids_set_del.add(meView.arr[0]);
        }
        for (var x of meView.ids_set_del) { // 遍历Set
            meView.ids_set_add.delete(x);
            //meView.ids_set_del.delete(x);
        }
        me.refresh_view();
    },

    onDeSelectAll: function () {
        var me = this;
        var meView = me.getView();
        meView.ids_set_add.clear();
        meView.ids_set_del.clear();
        while (meView.ids_selected.length > 0) {
            meView.ids_noselected.push(meView.ids_selected.pop());
        }
        me.refresh_view();
    },

    get_tree_nodes_ids: function (nodes) {
        var me = this;
        var allNodes = [];
        for (var i in nodes) {
            if (nodes[i].childNodes.length > 0) {
                allNodes = allNodes.concat(me.get_tree_nodes_ids(nodes[i].childNodes))
            } else {
                allNodes.push(nodes[i]);
            }
        }
        return allNodes;
    },

    getIds: function (rec, ids) {//获得右边树的所有id包括已选节点的父节点
        var me = this;
        if (rec.parentNode && rec.parentNode.get("id") != "root") {
            ids.push(rec.parentNode.get("fun_id"));
            me.getIds(rec.parentNode, ids);
        }
    },

    getSet: function (rec, str, arr) {
        var me = this;
        if (rec && rec.get("id") != "root") {
            str = str + rec.get("fun_id") + "*";
            me.getSet(rec.parentNode, str, arr);
            arr.push(str);
        }
    },

    setToArray: function (set, ids_arr) {
        for (x of set) {
            ids_arr.push(x);
        }
        return ids_arr;
    }
});