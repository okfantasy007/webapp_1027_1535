var express = require('express');
// var fs = require('fs');
// const uuid = require('uuid/v1');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
// 	res.redirect(req.app.locals.area);
// });

// router
// 	.get('/login', function(req, res, next) {
// 		var path = __dirname + '/../public/stylesheets/resources/images/wallpaper';
// 		fs.readdir(path, function(err,files){
// 			var pics = files.filter(function(item){
// 			    return item != ".svn";
// 			});
// 			var i = parseInt( Math.floor( Math.random() * (pics.length-1) ) );
// 			console.log(i, pics);
// 		    res.render('login', {
// 		    	theme: 'triton',
// 		    	wallpaper: req.query.girl!=undefined ? '47098576_5.jpg' : pics[i],
// 		    });
// 		});

// 	})
// 	.post('/login', function(req, res, next) {
// 		console.log(req.body);
// 		req.app.locals.user = req.body.user;
// 		req.app.locals.password = req.body.password;

// 		req.session.user = req.body.user;
// 		req.session.success = 'Authenticated as ' + req.body.user;
//   		res.json(200, {success: true, 'url': req.app.locals.area });  
// 	});

// router.get('/logout', function(req, res, next) {
// 	// res.send('logout page assss');
// 	req.session.destroy(function(){
// 		res.redirect('login');
// 	});
// });

// router.post('/theme', function(req, res, next) {
// 	log.debug('switching theme to', req.body.theme);
// 	req.app.locals.theme = req.body.theme;
// 	res.json(200, {success: true});  
// });

// router.post('/lang', function(req, res, next) {
// 	log.debug('switching lang to', req.body.lang);
// 	req.app.locals.lang = req.body.lang;

//     // 全局使用i18n
//     console.log(T.getLocale());
//     T.setLocale(req.app.locals.lang);
//     console.log(T.getLocale());
//     console.log(T.__('Hello'));

//     // 模块内使用i18n
//     console.log(req.getLocale());
//     req.setLocale(req.app.locals.lang);
//     console.log(req.getLocale());
//     console.log(req.__('Hello'));

// 	res.json(200, {success: true});  
// });

// router.get('/get_i18n_dict', function(req, res, next) {
// 	req.setLocale(req.query.lang);
// 	res.json(200, {
// 		success: true,
// 		lang: req.app.locals.lang,
// 		dict: req.getCatalog()
// 	});  
// });

// router.get('/rest/uuid', function(req, res, next) {
// 	res.json(200, {success: true, 'uuid': uuid()});  
// })

// router.get('/test', function(req, res) {
//     res.render('test');
// });

// router.get('/widgets', function(req, res, next) {
//     var path = __dirname + '/../public/widget';
//     console.log(path);
//     fs.readdir(path, function(err,files){
//         var ary = files.filter(function(item){
//             return item != ".svn";
//         });
//         var views=[];
//         for (var i in ary) {
//             console.log("####", ary[i]);
//             var viewType = ary[i].split('.')[0];
//             views.push({
//                 text: ary[i],
//                 iconCls: 'x-fa fa-circle-o',
//                 routeId: i==0 ? 'home' : viewType,
//                 viewType: viewType,
//                 leaf: true
//             })
//         }

//         res.json(200, {
//             text: 'root',
//             expanded: true,
//             children: views,
//         });  
//     });
// });

module.exports = router;
