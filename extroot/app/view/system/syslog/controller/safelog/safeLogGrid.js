Ext.define('Admin.view.system.syslog.controller.safelog.safeLogGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.safeLogGrid',
    
    onFilter:function(){
		var form = this.lookupReference('serchForm');
		form.setHidden(!form.isHidden() )
    },
    //打开查询界面
    isShow: function(obj, ischecked) {
        var fieldset = this.getView().down('form');
        if (ischecked) {
            fieldset.setVisible(true);
        } else {
            fieldset.setVisible(false);
        }
    },
	// 条件查询
	onQueryCondition:function(){
        var grid = this.getView().down('#safeLogGrid');
        var form = grid.down('#serchForm');
		var card=form.up().up();
		var values = form.getForm().getValues();
		var paging = grid.down('#pagingtoolbar');
		paging.moveFirst();
		var store = grid.getStore();

		store.proxy.url="/syslog/api/log/v1/safelog";
		store.proxy.extraParams = values;
		paging.reset();
		store.reload();
	},  
		
	 onResetSerchForm: function() {
		 this.lookupReference('serchForm').getForm().reset();
	 },

    onExportCsvFile: function() {
        window.location.href = "/syslog/api/log/v1/exportLogs/download?" +
            "type=0&" +
			// "limit=5000&" +
            "level=all&" +
            "result=all";
    },

    onExportCsvFileBy: function() {
        var grid = this.getView().down('#safeLogGrid');
        var form = grid.down('#serchForm');
        var values = form.getForm().getValues();
        var params = "";

        for(var i in values){
            //用javascript的for/in循环遍历对象的属性
            if (values[i] !== "")
            {
                params += i+"="+values[i]+"&";
            }
        }
        window.location.href = "/syslog/api/log/v1/exportLogs/download?" +
            "type=0&" +
            // "limit=5000&" +
            params.substr(0, params.length-1);

    }

});