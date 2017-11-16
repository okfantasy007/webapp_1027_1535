/**
 * This controller manages the ChildSession view.
 */
Ext.define('Admin.view.system.options.uiConfigViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.uiConfigView',

    requires: [
        'Ext.window.Window',
        'Admin.view.system.options.uiConfigDialog',
    ],

    onSessionChangeClick: function () {
        var changes = this.getView().getSession().getChanges();
        if (changes !== null) {
            new Ext.window.Window({
                autoShow: true,
                title: 'Session Changes',
                modal: true,
                width: 600,
                height: 400,
                layout: 'fit',
                items: {
                    xtype: 'textarea',
                    value: JSON.stringify(changes, null, 4)
                }
            });
        } else {
            Ext.Msg.alert('No Changes', 'There are no changes to the session.');
        }
    },

    createDialog: function(record) {
        var view = this.getView();

        console.log(record.getData());
        this.isEdit = !!record;
        this.dialog = view.add({
            xtype: 'uiConfigDialog',
            viewModel: {
                // data: record.getData()
                data: {
                    title: record ? 'Edit: ' + record.get('name') : 'Add Company',
                    // title: 'Add Company'
                    record: record ? record.getData() : {}
                },
                // If we are passed a record, a copy of it will be created in the newly spawned session.
                // Otherwise, create a new phantom company in the child.
                // links: {
                //     theCompany: record 
                //     // || { 'name': 'Lisa22',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  }
                //     // {
                //     //     type: 'Company',
                //     //     create: true
                //     // }
                // }
            },

            // Creates a child session that will spawn from the current session
            // of this view.
            session: true
        });

        this.dialog.show();
    },

    onAddCompanyClick: function() {
        this.createDialog(null);
    },

    onEditCompanyClick: function (button) {
        console.log(button);
        console.log(button.getWidgetRecord());
        this.createDialog(button.getWidgetRecord());
    },

    onRemoveCompanyClick: function(button) {
        var companyGrid = this.lookupReference('companyGrid'),
            selection = companyGrid.getSelectionModel().getSelection()[0];

        selection.drop();
    },

    onAddOrderClick: function() {
        var orders = this.lookupReference('orders').getStore();
        orders.insert(0, {
            date: new Date(),
            shipped: false
        });
    },

    onRemoveOrderClick: function (button) {
        var orders = this.lookupReference('orders').getStore();
        orders.remove(button.getWidgetRecord());
    },

    onSaveClick: function () {
        // Save the changes pending in the dialog's child session back to the
        // parent session.
        var dialog = this.dialog,
            form = this.lookupReference('form'),
            isEdit = this.isEdit,
            id;

        if (form.isValid()) {
            if (!isEdit) {
                // Since we're not editing, we have a newly inserted record. Grab the id of
                // that record that exists in the child session
                id = dialog.getViewModel().get('theCompany').id;
            }
            dialog.getSession().save();
            if (!isEdit) {
                // Use the id of that child record to find the phantom in the parent session, 
                // we can then use it to insert the record into our store
                this.getStore('companies').insert(0, this.getSession().getRecord('Company', id));
            }
            this.onCancelClick();
        }
    },

    onCancelClick: function () {
        console.log('onCancelClick', this.dialog);
        this.dialog = Ext.destroy(this.dialog);
        console.log('onCancelClick', this.dialog);
    },

    renderOrderId: function(v) {
        if (String(v).indexOf('O') > -1) {
            v = v.replace('Order-', 'O');
        }
        return v;
    }
});