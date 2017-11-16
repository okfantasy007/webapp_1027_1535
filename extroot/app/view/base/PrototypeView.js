Ext.define('Admin.view.base.PrototypeView', {
    extend: 'Ext.container.Container',
    xtype: 'PrototypeView',
    
    layout: 'fit',
    image: '',
    
    // 指定panel边缘的阴影效果
    cls: 'shadow',

    initComponent: function() {
        // this.items = {
        //     xtype: 'panel',
        //     bodyStyle: {
        //         background: 'url(/images/protopyte/'+ this.image +') no-repeat;' 
        //             +' background-position: center;'
        //     }            
        // };
        this.items = {
            xtype: 'image',
            src: '/images/protopyte/'+ this.image 
        };
        this.callParent();
    }    

});
