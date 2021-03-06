Ext.define('Admin.view.resource.syncmanage.syncTask.diffTreatmentView', {
    extend: 'Ext.tree.Panel',
    xtype: 'check_tree',

    checkPropagation: 'both',
    autoHeight : true,
    rootVisible: true,
    useArrows: true,
    bufferedRenderer: false,
    animate: true,
 
    //controller: 'check-tree',
    store:{
    	root:{

    		text:'资源变更设置',
    		checked:false,
	    	expanded:true,
	    	children:[
	    	{
	    		text:'网元',
	        	cls:'folder',
	        	checked:false,
	        	expanded:true,
	        	children:[
	        	{
	        		text:'新增网元自动确认',
	        		leaf:true,
	        		checked:false,
	        	},
	        	{
	        		text:'删除网元自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'网元属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'机箱',
	        	cls:'folder',
	        	checked:false,
	        	expanded:true,
	        	children:[
	        	{
	        		text:'新增机箱自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除机箱自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'机箱属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'板卡',
	        	cls:'folder',
	        	checked:false,
	        	expanded:true,
	        	children:[
	        	{
	        		text:'新增板卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除板卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'板卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'远端',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增远端自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除远端自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'远端属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
	    	{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},{
	    		text:'子卡',
	        	cls:'folder',
	        	expanded:true,
	        	checked:false,
	        	children:[
	        	{
	        		text:'新增子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'删除子卡自动确认',
	        		checked:false,
	        		leaf:true
	        	},
	        	{
	        		text:'子卡属性变更自动确认',
	        		checked:false,
	        		leaf:true
	        	}
	        	]

	    	},
    		]
    	},
    },
 });