// Ext.define('Admin.view.pages.FormBind', {
//     extend: 'Ext.container.Container',
//     xtype: 'formband',

//     requires: [
//         'Ext.container.Container'
//     ],

//     anchor : '100% -1',

//     layout:{
//         type:'vbox',
//         pack:'center',
//         align:'center'
//     },

//     items: [
//         {
//             xtype: 'box',
//             cls: 'blank-page-container',
//             html: '<div class=\'fa-outer-class\'><span class=\'x-fa fa-clock-o\'></span></div><h1>Coming Soon!</h1><span class=\'blank-page-text\'>Stay tuned for updates</span>'
//         }
//     ]
// });

Ext.define('Admin.view.pages.FormViewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.test', // connects to viewModel/type below

    data: {
        firstName: 'John',
        lastName: 'Doe'
    },

    formulas: {
        // We'll explain formulas in more detail soon.
        name: function (get) {
            var fn = get('firstName'), ln = get('lastName');
            return (fn && ln) ? (fn + ' ' + ln) : (fn || ln || '');
        }
    }
});

Ext.define('Admin.view.pages.FormView', {
    extend: 'Ext.panel.Panel',
    xtype: 'formview',

    layout: 'form',
    cls: 'shadow',

    // Always use this form when defining a view class. This
    // allows the creator of the component to pass data without
    // erasing the ViewModel type that we want.
    viewModel: {
        type: 'test'  // references alias "viewmodel.test"
    },

    bind: {
        title: 'Hello {name}'
    },

    defaultType: 'textfield',
    items: [{
        fieldLabel: 'First Name',
        bind: '{firstName}'
    },{
        fieldLabel: 'Last Name',
        bind: '{lastName}'
    },{
        xtype: 'button',
        text: 'Submit',
        bind: {
            hidden: '{!name}'
        }
    }]
});