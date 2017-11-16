Ext.define('Admin.view.performance.templateMangement.controller.userRightTree.userRightTree', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userRightTree',

    onLoad: function () {
        var treeMenu = this.lookupReference('treepanel'); //用updown不好使
        if (treeMenu) {
            if (!treeMenu.getSelectionModel().getSelection().length) {
                treeMenu.getSelectionModel().select([treeMenu.getRootNode().firstChild.firstChild]);
            }
        }
    },
});