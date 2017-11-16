Ext.define('widget.helloMvcView', {
    extend: 'Ext.container.Container',
    
    layout: 'center',

    viewModel: {
        data: {
            greeting: 'Click here!',
            count: 0
        }
    },

    controller: {
        onClick: function() {
            var count = this.getViewModel().get('count');
            count++;
            this.getViewModel().set('greeting', 'You are click me '+ count + ' times');
            this.getViewModel().set('count', count);
        },
    },

    items: [
        {
            xtype: 'button',
            bind: {
                text: '{greeting}',
            },
            listeners: {
                click: 'onClick'
            }
        }
    ]
});
