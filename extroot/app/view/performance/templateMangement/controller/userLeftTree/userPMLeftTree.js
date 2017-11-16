Ext.define('Admin.view.performance.templateMangement.controller.userLeftTree.userPMLeftTree', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userPMLeftTree',
    change: function () {

        var queryText = this.getView().up().down('#queryText').value;
        console.info(queryText);
        var re = new RegExp(".*" + queryText.trim() + ".*");
        var _treeStore = this.getView().getStore();
        if (queryText.trim() == '') {
            _treeStore.reload();
            this.getView().expandAll();
            return null;
        }
        var records = this.getView().getStore().data.items;
        this.getView().expandAll();
        var nodesIdArray = [];
        for (var i = 0; i < records.length; i++) {
            if (records[i].id == 'root') {
                continue;
            }

            if (!re.test(records[i].data.text)) {
                console.info(records[i].data.text);
                var tree = this.getView();
                var record = tree.store.getNodeById(records[i].id); // returns with the record of the child
                Ext.fly(tree.getView().getNodeByRecord(record)).setVisible(false);
            }
        }
    },
    onRefresh: function () {

        var root = this.getView().getStore();


    },
    onLoad: function () {
        var treeMenu = this.lookupReference('treepanel'); //用updown不好使
        if (treeMenu) {
            if (!treeMenu.getSelectionModel().getSelection().length) {
                treeMenu.getSelectionModel().select([treeMenu.getRootNode().firstChild.firstChild]);
            }
        }
    },

    //对树的节点进行模糊查询
    queryTree: function () {

        // console.info(this.getView().getStore().getData().items[0].childNodes[0].childNodes[0].data.id);
        _treeStore.filter({
            filterFn: function (node) {
                var text = node.get('text');

                var children = node.childNodes;
                var len = children && children.length
                for (i = 0; i < len && !(visible = children[i].get(text)); i++);
                if (visible && node.parentNode != null)
                    node.parentNode.expand();
                return visible;
            }
        });


    },


});