Ext.define('widget.helloView', {
    extend: 'Ext.container.Container',
    
    layout: 'center',

    controller: {
        onClick: function() {
            document.write('<video controls autoplay name="media"> <source src="audio/Kalimba.mp3" type="audio/mpeg"></video>');
            alert('Hello world!');
        },
    },

    items: [
        {
            xtype: 'button',
            text: 'Hello world!',
            listeners: {
                click: 'onClick'
            }
        }
    ]
});
