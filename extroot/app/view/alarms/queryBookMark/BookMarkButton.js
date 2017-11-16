//module属性：排障经验：AlarmReparExp
Ext.define('Admin.view.alarms.queryBookMark.BookMarkButton', {
    extend: 'Ext.button.Button',
    xtype: 'BookMarkButton',
    initItems: function() {
        this.containerType = '';
        this.formReference = '';
        this.module = '';
        this.defaultName = '';
        this.callParent();
    },
    addBookMark: function(bookmarkname,formValues) {
    	Ext.Ajax.request({
            url: '/alarm/AlarmRepairExp/addBookMark?module=' + this.module + '&bookmarkname=' + bookmarkname,
            method: 'post',
            params: formValues,
            success: function(response) {
            	if (response.responseText) {
                	Ext.Msg.alert(_('Success'), _('Add Successfully'));                        		
            	}else{
                	Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
            	}
            },
            failure : function () {
                Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
            }
        }); 
    },
    saveBookMark: function(textfield,selection,editButton,deleteButton) {
    	var newBookmarkname = textfield.getValue();
    	Ext.Ajax.request({
            url: '/alarm/AlarmRepairExp/saveBookMark',
            method: 'post',
            params: {'newBookmarkname':newBookmarkname,'oldBookmarkname':selection.get('bookmarkname'),'module':this.module},
            success: function(response) {
            	if (response.responseText) {
            		textfield.setValue('');
            		textfield.setEditable(false);
            		editButton.setDisabled(true);
            		deleteButton.setDisabled(true);
            		selection.set('bookmarkname',newBookmarkname);
                	Ext.Msg.alert(_('Success'), _('Modify Successfully'));                        		
            	}else{
                	Ext.Msg.alert(_('Tips'), _('Modify unsuccessfully'));
            	}
            },
            failure : function () {
                Ext.Msg.alert(_('Tips'), _('Modify unsuccessfully'));
            }
        }); 
    },
    deleteBookMark: function(textfield,grid,editButton,deleteButton) {
    	var selection = grid.getSelection()[0];
    	Ext.Ajax.request({
            url: '/alarm/AlarmRepairExp/deleteBookMark',
            method: 'post',
            params: {'bookmarkname':selection.get('bookmarkname'),'module':this.module},
            success: function(response) {
            	if (response.responseText) {
            		textfield.setValue('');
            		textfield.setEditable(false);
            		editButton.setDisabled(true);
            		deleteButton.setDisabled(true);
            		var gridData = grid.getStore().getData();
            		gridData.remove(selection);
                	Ext.Msg.alert(_('Success'), _('Delete Success'));                        		
            	}else{
                	Ext.Msg.alert(_('Tips'), _('Delete unsuccessfully'));
            	}
            },
            failure : function () {
                Ext.Msg.alert(_('Tips'), _('Delete unsuccessfully'));
            }
        });
    },
    deleteBookMarkBeforeAdd: function(bookmarkname) {
    	Ext.Ajax.request({
            url: '/alarm/AlarmRepairExp/deleteBookMark',
            method: 'post',
            params: {'bookmarkname':bookmarkname,'module':this.module},
            success: function(response) {
            	if (!response.responseText) {
                	Ext.Msg.alert(_('Success'), _('Add unsuccessfully'));                        		
            	}else{
                    return false;
                }                
            },
            failure : function () {
                Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
            }
        });
    },
    splitButtonShow: false,
    editButtonShow: true,
    allBookMarks : '',
    text: _('Book Mark'),
    menu:{
    	items: [
    		{
    			name: 'addBookMark',
    			text: _('Add To Book Mark'),
    			iconCls:'x-fa fa-bookmark-o', 
    			handler: function(){
    				var bookMarkButton = this.up('BookMarkButton');
            		var container = bookMarkButton.up(bookMarkButton.containerType);
            		var form = container.lookup(bookMarkButton.formReference);
            		var formValues = form.getForm().getValues();
            		var module = bookMarkButton.module;
            		var popWindow = Ext.create("Ext.window.Window", {
                		title: _('Add To Book Mark'),
                		modal:true,
						resizable:false,
                		border: false,
                		layout: 'auto',
                		bodyStyle: "padding:20px;",
                		items: {
                			xtype: 'fieldset',
                			title: _('Add Condition To Book Mark'),
    						items: [{
        						xtype: 'textfield',
        						fieldLabel: _('Name'),
        						width: 300,
        						labelWidth: 50,
        						value: bookMarkButton.defaultName,
    						}]
                		},
                		width: 400,
                		height: 250,
                		buttons: [
                		{
                    		xtype: "button",
                    		text: _("Save"),
                    		handler: function() {
                    			var bookmarkname = popWindow.down('textfield').getValue();
                    			var allBookMarks = bookMarkButton.allBookMarks;
                                var hasSame = false;
                    			for(var i in allBookMarks){                                 
                    				var oldBookmarkname = allBookMarks[i].bookmarkname;
                    				if(oldBookmarkname == bookmarkname){
                                        hasSame = true;
                                        break;
                    				}
                    			}
                                if(hasSame){
                                    Ext.Msg.confirm(_('Confirmation'), _('Name exist in Book Mark,Sure To Replace'), function(buttonId,value,opt){
                                        if(buttonId=='yes'){
                                            var same = bookMarkButton.deleteBookMarkBeforeAdd(bookmarkname);
                                            hasSame = same;
                                            if(!same){
                                                bookMarkButton.addBookMark(bookmarkname,formValues);
                                            }
                                        }
                                    });
                                }
                                if(!hasSame){
                                    bookMarkButton.addBookMark(bookmarkname,formValues);
                                }
                    			popWindow.close();
                    		}
                    	},{
                    		xtype: "button",
                    		text: _("Cancel"),
                    		handler: function() {
                    			popWindow.close();
                    		}
                    	}
                    	]
            		});
            		popWindow.show();
    			}
    		},
    		{
    			name: 'editBookMark',
    			text: _('Arrange Book Mark'),
    			iconCls:'x-fa fa-bookmark-o', 
    			handler: function(){
    			 	var bookMarkButton = this.up('BookMarkButton');
            		var container = bookMarkButton.up(bookMarkButton.containerType);
            		var form = container.lookup(bookMarkButton.formReference);
            		var formValues = form.getForm().getValues();
            		var module = bookMarkButton.module;
            		var popWindow = Ext.create("Ext.window.Window", {
                		title: _('Arrange Book Mark'),
                		modal:true,
						resizable:false,
                		border: false,
                		layout: 'auto',
                		bodyStyle: "padding:20px;",
                		items: [
                		{
                			xtype: 'fieldset',
                			title: _('Book Mark List'),
    						items: [
    						{
        						xtype: 'grid',
        						height: 200,
        						store:{
        							fields:['bookmarkname'],
        							data: bookMarkButton.allBookMarks,
        						},
        						columns:[{ dataIndex: 'bookmarkname', flex: 1 }],
        						listeners: {
        							select: {
        								fn: function(me, records, eOpts){
        									var textfield = popWindow.down('textfield');
        									textfield.setValue(records.get('bookmarkname'));
        									var toolbar =  popWindow.getDockedItems('toolbar')[0];
        									var editButton = toolbar.getComponent('editButton');
        									var deleteButton = toolbar.getComponent('deleteButton');
        									editButton.setDisabled(false);
        									deleteButton.setDisabled(false);
        								}
        							}
        						}
    						}
    						]
                		},{
                			xtype: 'fieldset',
                			title: _('Basic Info'),
    						items: [
    						{
        						xtype: 'textfield',
        						fieldLabel: _('Name'),
        						width: 300,
        						labelWidth: 50,
        						editable: false,
    						}
    						]
                		}
                		],
                		width: 400,
                		height: 500,
                		buttons: [
                		{
                    		xtype: "button",
                    		itemId: 'editButton',
                    		text: _("Modify"),
                    		disabled: true,
                    		handler: function() {
                    			var textfield = popWindow.down('textfield');                   			
                    			if(bookMarkButton.editButtonShow==true){
                    				textfield.setEditable(true);
                    				this.setText(_("Save"));                    
                    				bookMarkButton.editButtonShow=false;
                    			}else if(bookMarkButton.editButtonShow==false){
                    				var grid = popWindow.down('grid');
                    				var selection = grid.getSelection()[0];
                    				var toolbar =  popWindow.getDockedItems('toolbar')[0];
                    				var deleteButton = toolbar.getComponent('deleteButton');
                    				bookMarkButton.saveBookMark(textfield,selection,this,deleteButton);
                    				textfield.setEditable(false);
                    				this.setText(_("Modify"));
                    				bookMarkButton.editButtonShow=true;
                    			}                			
                    		}
                    	},{
                    		xtype: "button",
                    		itemId: 'deleteButton',
                    		text: _("Delete"),
                    		disabled: true,
                    		handler: function() {
                    			var grid = popWindow.down('grid');
                    			var textfield = popWindow.down('textfield');
                    			var toolbar =  popWindow.getDockedItems('toolbar')[0];
        						var editButton = toolbar.getComponent('editButton');
        						var deleteButton = this;
        						Ext.Msg.confirm(_('Confirmation'), _('Selected Book Mark Will be Deleted'), function(buttonId,value,opt){
        							if(buttonId=='yes'){
        								bookMarkButton.deleteBookMark(textfield,grid,editButton,deleteButton);
        							}
        						});
                    		}
                    	},{
                    		xtype: "button",
                    		text: _("Close"),
                    		handler: function() {
                    			popWindow.close();
                    		}
                    	}
                    	]
            		});
            		popWindow.show();
    			}
    		}
    	]
    },
    listeners: {
        click: {
            fn: function(){ 
            	var bookMarkButton = this;
            	var module = bookMarkButton.module;
            	var container = bookMarkButton.up(this.containerType);
            	var form = container.lookup(this.formReference);
            	var menu = bookMarkButton.menu;
            	if(bookMarkButton.splitButtonShow){
                    var splitbutton = menu.down('splitbutton');
                    menu.remove(splitbutton);
            		bookMarkButton.splitButtonShow = false;
                }
            	Ext.Ajax.request({
                		url: '/alarm/AlarmRepairExp/getAllBookMark?module=' + module,
                		method: 'post',
                		success: function(response) {
                    		if (response.responseText) {
                    			var text = response.responseText;
                    			var bookMarks = Ext.JSON.decode(text);
                                if(bookMarks[0].bookmarkname==null){
                                    return;
                                }
                                bookMarkButton.allBookMarks = bookMarks;
                    			if(!bookMarkButton.splitButtonShow){
                    				menu.add([{
            							xtype: 'splitbutton',
                						text: _('Selected Book Mark'),
                						margin: '0 0 0 0',
                						menu:[]
            						}]);
                    				var splitbutton = menu.down('splitbutton');
                    				var smenu = splitbutton.menu;
                    				for(var i in bookMarks){
                    					var bookmarkname = bookMarks[i].bookmarkname;
                    					smenu.add({
                    						text: bookmarkname,
											iconCls:'x-fa fa-bookmark-o', 
                    						handler: function(me){
                    							Ext.Ajax.request({
                									url: '/alarm/AlarmRepairExp/getBookMark?module=' + module + '&bookmarkname=' + me.text,
                									method: 'post',
                									success: function(response) {
                    									if (response.responseText) {
                    										var text = response.responseText;
                    										var record = Ext.JSON.decode(text);
                    										var values = Ext.JSON.decode(record[0].records);
                    										form.getForm().setValues(values);
                    									}else{
                        									Ext.Msg.alert(_('Tips'), _('Get Book Mark Failed'));
                    									}
                									},
                									failure : function () {
                    									Ext.Msg.alert(_('Tips'), _('Get Book Mark Failed'));
                									}
            									}); 
                    						}
                    					});
                    				}
            						bookMarkButton.splitButtonShow = true;
                    			}
            					
                    		}else{
                        		Ext.Msg.alert(_('Tips'), _('Get Book Mark Failed'));
                    		}
                		},
                		failure : function () {
                    		Ext.Msg.alert(_('Tips'), _('Get Book Mark Failed'));
                		}
            		});
            }
        }
    }
});

