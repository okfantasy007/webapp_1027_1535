Ext.define('Admin.view.alarms.alarmsController', {
    extend: 'Admin.view.main.LeftMenuController',
    alias: 'controller.alarmsView',
    //  onRouteChange:function(v1,v2,v3,v4,v5,v6,v7,v8){
    //     console.log('L2 onRouteChange', v1,v2,v3);
        
    //     var viewport = this.getView().up('viewport');
    //     var model = viewport.lookupViewModel();
    //     var v1_last = model.get('route_lv1_last');
    //     var v2_last = model.get('route_lv2_last');
    //     console.log(v1_last,v2_last,v1,v2);
    //     if (v1_last==v1 && v2_last==v2) {
    //         // 1,2级路由均未改变
    //         return;
    //     } else {
    //         model.set('route_lv2_last', v2);
    //     }

    //     // console.log('L2 onRouteChange', v1,v2,v3);
    //     var myWin= Ext.getCmp('myWin');
    //     if(myWin) myWin.hide();

    //     var routeView = this.getView();
    //     var activateView = this.getView().up('container').getLayout().getActiveItem();
    //     var activate = this.getReferences().mainCardPanel.getLayout().getActiveItem();
    //     if (activateView === routeView) {
    //         // console.log("####L2#### onRouteChange", activateView.getId(), routeView.getId());
    //         this.setCurrentView(v2);
    //         var  mainCardPanel = this.getReferences().mainCardPanel;
    //         var nowActivate =mainCardPanel.getLayout().getActiveItem();
    //         if(nowActivate!=activate){
    //             mainCardPanel.remove(activate, true); 
    //         }
    //     }
    // },
    // onMainViewRender:async function(me,ope){
    //     await this.onGetAlarmSecFilterLevel(0);//获得当前告警的安全权限
    //     await this.onGetHistoryAlarmSecFilterLevel(0);//获得历史告警的安全权限
    //     console.log("L2 onMainViewRender:", window.location.hash);
    //     var v = window.location.hash.split('/');
    //     if (v.length<2) {
    //         this.redirectTo(v[0] +'/'+ this.getView().default_routeId);
    //     } else {
    //         this.setCurrentView(v[1]);
    //     }
    // },
    // //获取当前用户下对于告警的安全限制,subneid---->symbolid
    // onGetAlarmSecFilterLevel:function(subneid){
    //     var model = this.getView().getViewModel();
    //     return new Promise(resolve => {
    //         Ext.Ajax.request({
    //             method:'get',
    //             url:'/rest/security/securityManagerCenter/getDomainAlarmIDStringBelongToSubnet',
    //             params:{
    //                 user: APP.user,
    //                 subnetID:subneid
    //             },
    //             success:function(response){
    //                 resolve(response);
    //                 var r = Ext.decode(response.responseText);
    //                 if(r.success){
    //                     var secResult = r.ircalarmlogid;
    //                     if(secResult=="all"){
    //                         model.set('alarm_sec_filter','1=1');
    //                         model.set('alarm_sec_level','all');
    //                     }else if(secResult=="none"){
    //                         model.set('alarm_sec_filter','1<>1');
    //                         model.set('alarm_sec_level','none');
    //                     }else{
    //                     model.set('alarm_sec_filter','iRCAlarmLogID in ('+secResult+')');
    //                     model.set('alarm_sec_level','section');
    //                     }
    //                 }else{
    //                     model.set('alarm_sec_filter','');
    //                     model.set('alarm_sec_level','');
    //                 }
    //                 console.log('---alarm_sec_filter:'+model.get('alarm_sec_filter'));
    //             },
    //             failure: function(response) {
    //                 resolve(response);
    //                 model.set('alarm_sec_filter','');
    //                 model.set('alarm_sec_level','');
    //             }
    //         });
    //     })
    // },
    // //获取当前用户下对于历史告警的安全限制,subneid---->symbolid
    // onGetHistoryAlarmSecFilterLevel:function(subneid){
    //     var model = this.getView().getViewModel();
    //     return new Promise(resolve => {
    //         Ext.Ajax.request({
    //             method:'get',
    //             url:'/rest/security/securityManagerCenter/getDomainHistoryAlarmIDStringBelongToSubnet',
    //             params:{
    //                 user: APP.user,
    //                 subnetID:subneid
    //             },
    //             success:function(response){
    //                 resolve(response);
    //                 var r = Ext.decode(response.responseText);
    //                 if(r.success){
    //                     var secResult = r.ircalarmlogid;
    //                     if(secResult=="all"){
    //                         model.set('historyalarm_sec_filter','1=1');
    //                         model.set('historyalarm_sec_level','all');
    //                     }else if(secResult=="none"){
    //                         model.set('historyalarm_sec_filter','1<>1');
    //                         model.set('historyalarm_sec_level','none');
    //                     }else{
    //                         model.set('historyalarm_sec_filter','iRCAlarmLogID in ('+secResult+')');
    //                         model.set('historyalarm_sec_level','section');
    //                     }
    //                     console.log('---historyalarm_sec_filter:'+model.get('historyalarm_sec_filter'));
    //                 }else{
    //                     model.set('historyalarm_sec_filter','');
    //                     model.set('historyalarm_sec_level','');
    //                 }
    //             },
    //             failure: function(response) {
    //                 resolve(response);
    //                 model.set('historyalarm_sec_filter','');
    //                 model.set('historyalarm_sec_level','');
    //             }
    //         });
    //     })
        
    // }
});
