Ext.define('Admin.view.main.titleContainer', {
    extend: 'Ext.Container',
    xtype: 'titleContainer',

    reference: 'titleContainer',
    layout: 'hbox',
    items: [
        {
            xtype: 'label',
            width: '100%',
            margin: '15 0 0 10',
        },
    ],
    setTitle: function(main_title) {
        var sub_title = '';
        var label = this.down('label');
        // console.log('setTitle', label);
        label.setConfig({
            html: '<span style="font-size:18px; font-weight:800">'
                + main_title
                + '</span> <span style="font-size:13px">'
                + sub_title
                + '</span>'
        })
    }
})