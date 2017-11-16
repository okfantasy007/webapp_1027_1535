var express = require('express');
var cjson = require('cjson');
var router = express.Router();

// var security_user_info_example = {
//   "administrator": {
//     "elementMapSymbolId": {},
//     "is_admin": true,
//     "sec_user_id": 1,
//     "is_admin_usergroup": true,
//     "isObjectSetAll": true,
//     "isNMSAppSetAll": false
//   },
//   "aaaaaa": {
//     "elementMapSymbolId": {
//       "symbolId": "0",
//       "category": 2,
//       "class_type": "SubnetElement",
//       "child": [],
//       "fun": {}
//     },
//     "is_admin": false,
//     "sec_user_id": 24,
//     "is_admin_usergroup": false,
//     "isObjectSetAll": false,
//     "isNMSAppSetAll": false,
//     "nnmAppMap": {
//       "05": {
//         "fun_id": "05",
//         "fun_type": 1,
//         "permission": 0
//       },
//       "0501": {
//         "fun_id": "0501",
//         "fun_type": 1,
//         "permission": 0
//       },
//       "050101": {
//         "fun_id": "050101",
//         "fun_type": 1,
//         "permission": 0
//       },
//       "05010102": {
//         "fun_id": "05010102",
//         "fun_type": 1,
//         "permission": 0
//       }
//     },
//     "operationIdSet": {
//       "performanceView": "05",
//       "0501": "0501",
//       "performanceMainView": "050101",
//       "05010102": "05010102"
//     }
//   }
// }

function userPrivileges(req, funcCode) {
    if (!req.session.user) {
        return false
    }
    var userinfo = req.session.security_buffer;
    return userinfo.is_admin_usergroup || userinfo.operationIdSet[ funcCode ] || userinfo.nnmAppMap[ funcCode ]
}

var sec_filter = function(in_tree, req) {
    var out_tree = [];

    for (var i in in_tree) {
        var item = in_tree[i];
        console.log(i, item.text);

        if (userPrivileges(req, item.fun_id || item.viewType)) {

            if (item.children && item.children.length>0) {
                var children = sec_filter(item.children, req)
                if (children.length>0) {
                    item.children = children;
                } else {
                    delete item.children;
                }
            }
            item.text = req.__(item.text);
            out_tree.push( item )
        }
    };

    return out_tree;
}


router.get('/header', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/header.json');

    var menu = menuOrg.filter(function(item){
        item.text = req.__(item.text);
        if(item.viewType=='reportsView'||item.viewType=='systemView'){
            return true;
        }
        return userPrivileges( req, item.viewType )
    });

    res.json(200, menu);      
});

router.get('/topology', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/topology.json');

    var menu = sec_filter(menuOrg, req);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/inventory', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/inventory.json');

    var menu = sec_filter(menuOrg, req);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/alarm', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/alarm.json');

    var menu = sec_filter(menuOrg, req);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/performance', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/performance.json');

    var menu = sec_filter(menuOrg, req);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/reports', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/reports.json');

    // var menu = sec_filter(menuOrg, req);
    var menu = [];
    for (var i in menuOrg) {
        var item = menuOrg[i];
        item.text = req.__(item.text);
        menu.push( item )

    }

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/config', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/config.json');

    var menu = sec_filter(menuOrg, req);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/configcenter', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/configcenter.json');

    var menu = sec_filter(menuOrg, req);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/system', function(req, res, next) {

    var menuOrg = cjson.load('config/menu/system.json');

    var menu = sec_filter(menuOrg, req);
    console.log('*********************',menu);

    res.json(200, {
        text: 'root',
        expanded: true,
        children: menu,
    });  
});


router.get('/conv', function(req, res, next) {

    var conf = require('./header');
    console.log(conf);

    res.json(200, conf);      
});


module.exports = router;