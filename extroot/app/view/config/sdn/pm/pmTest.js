Ext.define('Admin.view.config.sdn.pm.pmTest', {
    extend: 'Ext.container.Container',
    xtype: 'pmTest',

    layout: 'card',
    cls: 'shadow',//指定panel边缘的阴影效果

    listeners: {
        //activate: 'onActive',
        //afterRender:'onAfterRender',
        //activate:'onActiveItemchange'
    },
    controller: {
        winList:{},
        winIndex:0,
        winMaxNum:0,
        winMinList:[],
        getMinY:function(icount){
            var eBody=Ext.getBody(),
                me = this;
            return eBody.getHeight()-(icount-1) * (30+6) -50;
        },
        getMinX:function(){
            var eBody=Ext.getBody();
            return eBody.getWidth() - 150-20
        },
        getMaxY:function(winHeight){
            var eBody=Ext.getBody(),
                me = this;
            return (Math.floor(eBody.getHeight()/2)-Math.floor(winHeight/2)) +(me.winMaxNum-1) * 30;
        },
        getMaxX:function(winWidth){
            var eBody=Ext.getBody(),
                me = this;
            return Math.floor(eBody.getWidth()/2)-Math.floor(winWidth/2) + (me.winMaxNum-1) * 30;
        },

        showToast: function(msg) {
            Ext.toast({
                html: msg,
                align: 'tr',
                minWidth:300,
                slideInDuration: 500,
            });
        },

        openWindow:function(){
            var me = this,
                index=String(me.winIndex++);

            me.showToast('welcome the world')

            me.winList[index]=Ext.create('Ext.window.Window',{
                title:'新窗口'+index,
                width:300,
                height:200,
                resizable:false,
                minimizable:true,
                constrain: true,//禁止窗口移出浏览器屏幕
                renderTo:Ext.getBody(),
                winIndex:index,
                winCollapse:'open',
                html : '<div class="x-selectable" style=width:200px ; height:200px>第一行信息</div><div class="x-selectable" style=width:200px ; height:200px>第二行信息</div>',
                listeners: {
                    /*maximize:function(w){
                        //关键部分：最大化后需要将窗口重新定位，否则窗口会从最顶端开始最大化
                        w.setPosition(document.body.scrollLeft,document.body.scrollTop);
                    }*/
                    minimize: function () {
                        var eBody=Ext.getBody();

                        if(this.winCollapse=='open'){
                            me.winMaxNum--;
                            me.winMinList.push(this.winIndex);
                            this.winCollapse='close';
                            this.setWidth(150);
                            this.collapse();
                            this.getEl().setXY ([me.getMinX(),me.getMinY(me.winMinList.length)]);
                        } else {
                            me.winMaxNum++;
                            me.winMinList.splice(me.winMinList.indexOf(this.winIndex),1);
                            this.winCollapse='open';
                            this.setWidth(300);
                            this.toggleCollapse();
                            this.getEl().setXY ([me.getMaxX(this.getWidth()),me.getMaxY(this.getHeight())]);
                        }
                    },
                    close:function(){
                        delete me.winList[this.winIndex];
                        if(me.winMinList.length >0)
                            me.winMinList.splice(me.winMinList.indexOf(this.winIndex),1);
                        if(me.winMaxNum>0)
                            me.winMaxNum--;
                        if(me.winMinList.length >0){
                            for(var i=0;i<=me.winMinList.length;i++){
                                var win=me.winList[me.winMinList[i]];
                                if(win){
                                    win.getEl().setXY ([me.getMinX(),me.getMinY(i+1)]);
                                }
                            }
                        }
                    }
                },
            }).show();
            me.winMaxNum++;
        }
    },
    items:[{
        xtype: 'panel',
        title: '测试界面',
        iconCls: 'x-fa fa-tasks',
        reference: 'firstPanel',
        items: [{
            xtype: 'button',
            text: 'Small',
            handler:'openWindow'
        }]
    }]
});