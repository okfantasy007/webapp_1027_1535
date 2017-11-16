Ext.define('Admin.view.performance.templateMangement.controller.detailPage.detailPage', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.detailPage',
    onSubmit: function () {
        console.info(this.getView().getForm());
    },

    onCancel: function () {
        this.getView().up().setActiveItem(0);
    },

    onReset: function () {
        this.getView().getForm().reset();
        var grid = this.getView(),
            card = grid.up().up(),
            form = card.down('#editPage');
    },
    //左边向右边添加节点
    AddTreeNode: function () {

        var storeRight = this.getView().down('#PMTTreeright').getStore().getRootNode();
        var storeLeft = this.getView().down('#PMTTreeLeft').getStore();
        var tmpNode = storeLeft.getNodeById(3);

        var checkedNodes = this.getView().down('#PMTTreeLeft').getChecked();

        var storeR = this.getView().down('#PMTTreeright').getStore();
        storeR.setData(checkedNodes);
        console.info(storeR.getData());
        storeLeft.remove(checkedNodes);
        storeR.sync();
        storeLeft.sync();
        console.info(storeR.getData());

    },
    //右边删除节点到左边
    deleteTreeNode: function () {
        var storeRight = this.getView().down('#PMTTreeright').getStore().getRootNode();
        var storeLeft = this.getView().down('#PMTTreeLeft').getStore();

        var storeR = this.getView().down('#PMTTreeright').getStore();
        storeR.setData(checkedNodes);
        storeLeft.remove(checkedNodes);
        storeR.flushLoad();
        storeLeft.sync();
        var checkedNodes = this.getView().down('#PMTTreeright').getChecked();
        console.info(checkedNodes);

    },

});