Ext.define('Admin.view.resource.discovery.template.protocol.baseForm', {
    extend: 'Admin.view.base.CardForm',
    xtype: 'baseForm',

    fieldDefaults: {
        labelWidth: 160
    },

    fbar: [
    {
        text: _('Reset'),
        iconCls:'x-fa fa-undo',
        handler: 'onReset',
    },
    {
        text: _('Cancel'),
        iconCls:'x-fa fa-close',
        handler: 'onCancel',
    },
    {
        text: _('Save'),
        iconCls:'x-fa fa-save',
        handler: 'onSubmit',
    }],

    controller: {

        onCancel: function() {
            var container = this.getView().up().up();
            var grid = container.down('discoveryTemplateGridView').up();
            container.setActiveItem(0);
        },

        onReset: function() {
            this.getView().getForm().reset();
        },

        onSubmit: function() {
            var form = this.getView(),
                container = form.up().up(),
                grid = container.down('discoveryTemplateGridView');

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/resource/discovery_template/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    submitEmptyText : false,
                    success: function(form, action) {
                        container.setActiveItem(0);
                        grid.lookupController().onRefresh();
                        Ext.Msg.alert(_('Success'), action.result.msg);
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert(_('Failed'), action.result.msg);
                    }
                });                
            } else {
                Ext.Msg.alert(_('input error'), _('Please Check The Input Content'));
            }
        }
    }

});
