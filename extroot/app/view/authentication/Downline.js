Ext.define('Admin.view.authentication.Downline', {
    extend: 'Ext.window.Window',
    layout: 'center',
    xtype: 'downline',
    border: false,
    title: '下线通知',
    closable: true,//屏蔽window右上角的关闭按钮
    resizable: false,
    autoShow: true,
    width: 200,
    height: 120,
    controller: {
        onRender: function () {
            this.goTime();
        },
        goTime: function () {
            var s = 5;
            var controller = this;
            var panel = this.getView();
            Ext.TaskManager.start({
                run: function () {
                    if (s < 0) {
                        panel.close();
                        window.location.href = 'logout';
                        console.log('hello world');
                        return false;
                    } else {
                        panel.setHtml('<h3 style="text-align:center;line-height:50px">' + '距离登出剩余' + s + '秒' + '</h3>');
                        s--;
                    }
                },
                interval: 1000
            });
        }
    },
    listeners: {
        render: 'onRender'
    }
});
