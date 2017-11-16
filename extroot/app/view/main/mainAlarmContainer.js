Ext.define('Admin.view.main.mainAlarmContainer', {
    extend: 'Ext.container.Container',
    xtype: 'mainAlarmContainer',
    reference: 'mainAlarmContainer',

    layout: 'hbox',
    margin: '10 30 10 30',
    style: 'border-radius: 8px',

    msg: '',
    level: 'success',
    closeDelay: 10,
    timer: null,

    initComponent: function () {
        var me = this;
        me.setStyle({
            background: Public.colors[this.level],
            color: '#fff',
        });

        me.setConfig({
            items: [
                {
                    xtype: 'container',
                    layout: 'center',
                    flex: 1,
                    minHeight: 31,
                    margin: 10,
                    items: [
                        {
                            xtype: 'label',
                            html: '<span style="font-size:15px; font-weight:700">'+this.msg+'</span>'
                        }
                    ]
                },
                {
                    xtype: 'container',
                    layout: 'center',
                    height: '100%',
                    items: [
                        {
                            itemId: 'timerlabel',
                            xtype: 'label',
                        }
                    ]
                },
                {
                    xtype: 'container',
                    layout: 'center',
                    height: '100%',
                    margin: 10,
                    items: {
                        xtype: 'button',
                        iconCls: 'x-fa fa-close',
                        tooltip: _('Close'),
                        style: 'border-radius: 50%',
                        handler: function() {
                            if (me.timer!=null) {
                                Ext.TaskManager.stop(me.timer);
                            }
                            var parent = me.up();
                            parent.remove(me);
                        }
                    }
                }
            ]            
        });

        var start = Public.get_current_time();
        if (me.closeDelay > 0) {
            me.timer = Ext.TaskManager.start({
                interval: 1000, // 1 second
                run: function() {
                    // console.log(Public.get_current_time() );
                    var downcounter = me.closeDelay - (Public.get_current_time()-start);
                    var label = me.down('#timerlabel');
                    label.setConfig({
                        html: Ext.String.format(_('Close after {0} seconds'), downcounter)
                    });

                    if (downcounter <=0) {
                        Ext.TaskManager.stop(me.timer);
                        var parent = me.up();
                        parent.remove(me);
                    }
                }
            });
        }

        this.callParent();
    }

})