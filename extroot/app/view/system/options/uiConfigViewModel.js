/**
 * This ViewModel provides data for the ChildSession view.
 */
Ext.define('Admin.view.system.options.uiConfigViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.uiConfigView',

    stores: {
        // Define a store of Company records that links to the Session.
        companies: {
            fields: ['name', 'email', 'phone'],
            data: [
                { 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
                { 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
                { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
                { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
                { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
                { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  }
            ]
            // model: 'Company',
            // autoLoad: true,
            // session: true
        }
    }
});