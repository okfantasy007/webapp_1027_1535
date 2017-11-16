Ext.define('Admin.view.main.LeftMenuController', {
    extend: 'Ext.app.ViewController',

    routes: {
        ':v1/:v2': 'onRouteChange',
        ':v1/:v2/:v3': 'onRouteChange',
        ':v1/:v2/:v3/:v4': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5/:v6': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5/:v6/:v7': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8': 'onRouteChange'
    },

    lastView: null,

    onRouteChange:function(v1,v2,v3,v4,v5,v6,v7,v8){
        console.log('L2 onRouteChange', v1,v2,v3);
        
        var viewport = this.getView().up('viewport');
        var model = viewport.lookupViewModel();
        var v1_last = model.get('route_lv1_last');
        var v2_last = model.get('route_lv2_last');
        // console.log(v1_last,v2_last,v1,v2);
        if (v1_last==v1 && v2_last==v2) {
            // 1,2级路由均未改变
            return;
        } else {
            model.set('route_lv2_last', v2);
        }

        // console.log('L2 onRouteChange', v1,v2,v3);
        var myWin= Ext.getCmp('myWin');
        if(myWin) myWin.hide();

        var routeView = this.getView();
        var activateView = this.getView().up('container').getLayout().getActiveItem();
        if (activateView === routeView) {
            // console.log("####L2#### onRouteChange", activateView.getId(), routeView.getId());
            this.setCurrentView(v2);
        }
    },

    selectCurrentView: function(treestore) {
        var v = window.location.hash.split('/');
        // console.log(v);
        if (v.length<2) {
            // 选择第一个叶子节点作为默认页面
            var routeId = treestore.findRecord('leaf', true).get('routeId');
            this.redirectTo(v[0] +'/'+ routeId);
        } else {
            this.setCurrentView(v[1]);
        }
    },

    onContainerRender: function() {
        // console.log("L2 onContainerRender:", window.location.hash);
        var ctrl = this;
        var view = ctrl.getView();

        var navigationTreeList = this.getReferences().navigationTreeList;

        var treestore = navigationTreeList.getStore();
        if (!treestore) {
            treestore = Ext.create('Ext.data.TreeStore',{
                autoLoad: false,
                proxy: {
                    type: 'ajax',
                    url: navigationTreeList.menuUrl,
                    reader: {
                        type: 'json'
                    }
                },                
            });
            navigationTreeList.setConfig({
                store: treestore
            })
            treestore.on('load', function() {
                // console.log('store loaded...',treestore.isLoaded());
                ctrl.selectCurrentView(treestore);
            });
            treestore.load();

        } else {
            ctrl.selectCurrentView(treestore);
        } 
    },

    onMenuSelectionChange: function (tree, node) {
        var ary = window.location.hash.split('/');
        var L2routeId = node.get('routeId');
        console.log('onMenuSelectionChange', ary, L2routeId);
        if (ary[1] == L2routeId) {
            return;
        }
        var to = node && (node.get('routeId') || node.get('viewType'));
        var root_routeId = window.location.hash.split('/')[0];
        if (root_routeId && to) {
            this.redirectTo(root_routeId +'/'+ to);
        }
    },

    onTreePanelSelectionChange: function (tree, selected, eOpts) {
        var node = selected[0];
        console.log('onTreePanelSelectionChange', node);
        var to = node && (node.get('routeId') || node.get('viewType'));
        var root_routeId = window.location.hash.split('/')[0];
        if (root_routeId && to) {
            this.redirectTo(root_routeId +'/'+ to);
        }
    },       

    setCurrentView: function(hashTag) {
        console.log("L2 setCurrentView:", hashTag);
        // hashTag = (hashTag || '').toLowerCase();

        var me = this,
            refs = me.getReferences(),
            navigationList = refs.navigationTreeList,
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            store = navigationList.getStore();

            var node = store.findNode('routeId', hashTag) ||
                    store.findNode('viewType', hashTag);

            var view = (node && node.get('viewType')) || 'page404';

            var lastView = me.lastView;
            var existingItem = mainCard.child('component[routeId=' + hashTag + ']');
            var newView;

        // Kill any previously routed window
        if (lastView && lastView.isWindow) {
            // console.log("destroy");
            lastView.destroy();
        }

        lastView = mainLayout.getActiveItem();

        if (!existingItem) {
            console.log("L2 create view:", view);
            newView = Ext.create({
                xtype: view,
                routeId: hashTag,  // for existingItem search later
                // title: node.get('text'),
                // iconCls: node.get('iconCls'),
                image: node.get('image'),
                hideMode: 'offsets',
            });
        }

        if (!newView || !newView.isWindow) {
            // !newView means we have an existing view, but if the newView isWindow
            // we don't add it to the card layout.
            if (existingItem) {
                // We don't have a newView, so activate the existing view.
                if (existingItem !== lastView) {
                    mainLayout.setActiveItem(existingItem);
                }
                newView = existingItem;
            }
            else {
                // newView is set (did not exist already), so add it and make it the
                // activeItem.
                Ext.suspendLayouts();
                mainLayout.setActiveItem(mainCard.add(newView));
                Ext.resumeLayouts(true);
            }
        }

        navigationList.setSelection(node);

        if (newView.isFocusable(true)) {
            newView.focus();
        }

        me.lastView = newView;
        // refs.titleContainer.setTitle(node.get('text'));
    }

});
