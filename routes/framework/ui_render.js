var express = require('express');
var router = express.Router();
var fs = require('fs');

var get_user_auth = function(security_buffer) {
    var user_auth = {};

    console.log('user-->', security_buffer);
    if (security_buffer!=''&& typeof(security_buffer)!='undefined') {
          user_auth = {
            
            'is_superuser'          : security_buffer.is_admin_usergroup,
            'user_menu_oper_map'    : security_buffer.operationIdSet
                
        };
        
    } else {
        user_auth = {
            'is_superuser'          : true,
            'user_oper_id_set'      : [],
            'user_menu_oper_map'    : {}
        }
        
    }
    
    return JSON.stringify(user_auth);
}

var render = function(req, res) {

    req.setLocale(req.app.locals.lang);
    var dict = req.getCatalog();

    var path = 'static/images/wallpaper';
    fs.readdir(path, function(err,files){
        var pics = files.filter(function(item){
            return item != ".svn";
        });
                
        var i = parseInt( Math.floor( Math.random() * (pics.length-1) ) );

        res.render(req.app.locals.ui_template, {
            "i18ndict": JSON.stringify(dict),
            "wallpaper": pics[i],
            "user": req.session.user,
            "sessionID": req.sessionID,
            "user_auth": get_user_auth(req.session.security_buffer),
            
        });
    });
};

router.get('/', render);

module.exports = router;