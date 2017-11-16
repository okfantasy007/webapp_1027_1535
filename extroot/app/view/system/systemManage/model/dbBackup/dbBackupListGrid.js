Ext.define('Admin.view.system.systemManage.model.dbBackup.dbBackupListGrid', {
	 extend: 'Ext.data.Model',
	    proxy: {
	        type: 'ajax',
	        url: '/sysmanage/sysmng/backup/bakdata',
	        reader: {
	            type: 'json',
	            rootProperty: 'files',
	            totalProperty: 'total_count'
	        }
	    }
	});