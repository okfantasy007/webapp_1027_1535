Ext.define('Admin.view.performance.historyTask.controller.detailControl', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.detailControl',

    onCancel: function () {
        this.getView().up().setActiveItem(0);
    },
})