Ext.define('Admin.view.performance.templateMangement.controller.editPage.editPage', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.editPage',
    //加载前对树的节点进行删除操作 
    beforeshow: function () {


        this.getView().down('#PMTTreeLeft').getStore().reload();
        var rchildNodes = this.getView().down('#PMTTreeright').getRootNode().childNodes;
        var lchildNodes = this.getView().down('#PMTTreeLeft').getRootNode().childNodes;
        controller = this;
        controller.iteratorNodes(lchildNodes, rchildNodes);
    },
    iteratorNodes: function (lchildNodes, rchildNodes) {
        for (var i = 0; i < lchildNodes.length; i++) {
            for (var j = 0; j < rchildNodes.length; j++) {
                if (rchildNodes[j].id == lchildNodes[i].id) {
                    if (rchildNodes[j].childNodes.length == lchildNodes[i].childNodes.length && rchildNodes[j].childNodes.length != 0) {
                        lchildNodes[i].remove();
                    }
                    var length = rchildNodes[j].childNodes.length;
                    if (length == 0) {
                        lchildNodes[i].remove();
                    } else {
                        controller.iteratorNodes(lchildNodes[i].childNodes, rchildNodes[j].childNodes)
                    }
                }
            }
        }
    },
    onSubmit: function () {
        var grid = this.getView(),
            card = grid.up().up(),
            form = card.down('#editPage');
        var formdata = form.getValues();
        var view = this.getView().up();
        var mainPageGrid = view.down('#mainPageGrid');
        var storeL = this.getView().down('#PMTTreeLeft').getStore();
        if (form.getValues()["metricTmplName"].trim() == '') {
            Ext.Msg.alert(_('Prompt information'), _('The template name is required'), Ext.emptyFn);
            return null;
        };
        this.getView().down('#PMTTreeright').expandAll();
        var records = this.getView().down('#PMTTreeright').getStore().data.items;
        Ext.each(records,  function (node) {
            console.info();
        });
        console.info(records);
        var nodesIdArray = [];
        for (var i = 0; i < records.length; i++) {
            if (records[i].id == 'root') {
                continue;
            }
            nodesIdArray.push(records[i].id);
        }
        var conditonData = {};
        conditonData.metricId = nodesIdArray;
        conditonData.tmplName = formdata["metricTmplName"];
        conditonData.tmplDesc = formdata["tmplDesc"];
        conditonData.tmplId = formdata["tmplId"];
        console.info(JSON.stringify(conditonData));
        Ext.Ajax.request({
            url: '/pmManagement/api/pmmng/metricTmpl/update',
            method: "POST",
            jsonData: JSON.stringify(conditonData),
            success: function (response, options) {
                Ext.toast({
                    html: _('Successful operation'),
                    title: _('Prompt information'),
                    width: 200,
                    align: 't'
                });
                view.setActiveItem(0);
                storeL.reload();
                mainPageGrid.getStore().reload();

            },
            failure: function () {
                Ext.toast({
                    html: _('operation failed'),
                    title: _('Prompt information'),
                    width: 200,
                });
            }
        });

    },

    onCancel: function () {
        this.getView().up().setActiveItem(0);
        this.getView().down('#PMTTreeLeft').getStore().reload();
    },

    //左边向右边添加节点
    AddTreeNode: function () {
        var records = this.getView().down('#PMTTreeLeft').getChecked(),
            selectTree = this.getView().down('#PMTTreeright'),
            PMTTreeright = this.getView().down('#PMTTreeLeft'),
            controller = this;
        for (var i in records) {
            controller.pushNodeChanToTree(selectTree, records[i]);
        };
        for (var i in records) {
            if (records[i].get('depth') > 0) {
                records[i].remove();
            } else {
                records[i].set("checked", false);
            }
        }
        console.info(this.getView().down('#PMTTreeLeft').getStore());
    },
    pushNodeChanToTree: function (tree, node) {
        var chan = [];
        this.getTreeUpNodeChan(node, chan);
        chan = chan.reverse();
        for (var i in chan) {
            var existNode = tree.store.getNodeById(chan[i].get('id'));
            if (existNode == null) {
                var parentNode = tree.store.getNodeById(chan[i].parentNode.get('id'));
                var n = chan[i].copy();
                n.data.checked = false;
                var index = chan[i].get('index');
                parentNode.insertChild(index, n);
            }
        }
    },

    getTreeUpNodeChan: function (node, chan) {
        if (node.get('depth') == 0) {
            return;
        }
        chan.push(node)
        this.getTreeUpNodeChan(node.parentNode, chan);
    },
    //右边删除节点到左边
    deleteTreeNode: function () {
        var records = this.getView().down('#PMTTreeright').getChecked(),
            selectTree = this.getView().down('#PMTTreeLeft'),
            PMTTreeright = this.getView().down('#PMTTreeright'),
            controller = this;
        for (var i in records) {
            controller.pushNodeChanToTree(selectTree, records[i]);
        };
        for (var i in records) {
            if (records[i].get('depth') > 0) {
                records[i].remove();
            } else {
                records[i].set("checked", false);
            }
        }
    },

});