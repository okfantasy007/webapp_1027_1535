Ext.define('Admin.view.system.systemModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.systemView',

    stores: {
        userlist_remote: {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/users/list',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                },
                simpleSortMode: true
            }
        },
        userlist_local: {
            fields: ['SEC_USER_ID', 'USER_NAME', 'FULL_NAME'],
            data: [
                { "SEC_USER_ID":"1", 'USER_NAME': 'user1', "FULL_NAME":"user full name 1"  },
                { "SEC_USER_ID":"2", 'USER_NAME': 'user2', "FULL_NAME":"user full name 2"  },
                { "SEC_USER_ID":"3", 'USER_NAME': 'user3', "FULL_NAME":"user full name 3"  },
                { "SEC_USER_ID":"4", 'USER_NAME': 'user4', "FULL_NAME":"user full name 4"  },
                { "SEC_USER_ID":"5", 'USER_NAME': 'user5', "FULL_NAME":"user full name 5"  },
                { "SEC_USER_ID":"6", 'USER_NAME': 'user6', "FULL_NAME":"user full name 6"  },
                { "SEC_USER_ID":"7", 'USER_NAME': 'user7', "FULL_NAME":"user full name 7"  },
                { "SEC_USER_ID":"8", 'USER_NAME': 'user8', "FULL_NAME":"user full name 8"  },
                { "SEC_USER_ID":"9", 'USER_NAME': 'user9', "FULL_NAME":"user full name 9"  },
            ]
        }
    }

});
