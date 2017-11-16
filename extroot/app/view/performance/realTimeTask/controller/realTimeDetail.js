Ext.define('Admin.view.performance.realTimeTask.controller.realTimeDetail', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.realTimeDetail',
    onCancel: function () {
        var card = this.getView().up();
        card.setActiveItem(0);
    },

});