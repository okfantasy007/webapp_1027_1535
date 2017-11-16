Ext.define("widget.test01", {
    extend: "Ext.container.Container",
    layout: "hbox",
    items: [{
        xtype: "container",
        flex: 1,
        layout: "fit",
        items: [{
            xtype: "checkboxfield",
            boxLabel: "test01"
        }]
    }, {
        xtype: "container",
        flex: 1,
        layout: "fit",
        items: [{
            xtype: "textfield",
            fieldLabel: "test01"
        }]
    }, {
        xtype: "container",
        layout: "hbox",
        flex: 1,
        items: [
            {
                xtype: "container",
                flex: 1
            },
            {
                xtype: "button",
                text: "test01"
            }]
    }]
});