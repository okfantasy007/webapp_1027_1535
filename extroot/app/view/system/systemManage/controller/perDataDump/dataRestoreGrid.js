Ext.define('Admin.view.system.systemManage.controller.perDataDump.dataRestoreGrid', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.dataRestoreGrid',
    
    //刷新主机列表
    onRefresh: function () {
        this.getView().down('#dataRestoreGrid').store.reload();
    },
    
    //模糊查询
    onNameFilterKeyup: function() {
        var filterField = this.lookupReference('nameFilterField'),
            symbolInfo = this.lookupReference('symbolInfo'),
            filters = symbolInfo.store.getFilters();
        if (filterField.value) {
            this.nameFilter = filters.add({
                id            : 'nameFilter',
                property      : 'fileName',
                value         : filterField.value,
                anyMatch      : true,
                caseSensitive : false
            });
        } else if (this.nameFilter) {
            filters.remove(this.nameFilter);
            this.nameFilter = null;
        }
    },
    
});