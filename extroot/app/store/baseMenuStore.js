Ext.define('Admin.store.baseMenuStore', {
    extend: 'Ext.data.TreeStore',
    storeId: 'baseMenuStore',

    fields: [{
        name: 'text'
    }],
    
    // filters: [
    // 	// SEC.menu_filter,
    // 	function(item) {
    // 		console.log(item.get('id'));
    // 		return true;
    // 	}
    // ],

    // listeners: {
    //     // beforeload : 'onMenuTreeLoaded',
    //     beforeload : function ( store , operation , eOpts ) {
    //         console.log('beforeload ...', store);
    //         store.on('load', function() {
    //             console.log('loaded...',store.isLoading());
    //         })

    //     },
    // }
    
});
