var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
var util = require('util');
var async = require('async');

var upload_dir = './static/images/topo/background';

router.get('/', function(req, res, next){

    var filepath = upload_dir;
    // console.log(filepath);        

    fs.readdir(filepath, function(err,files){
        var pics = files.filter(function(item){
            return item != ".svn";
        });
        // console.log(pics);        

        var objs = pics.map(function(item){
            return {
            	src: 'images/topo/background/' + item,
            	caption: item
            }
        });
        // console.log(objs);
		res.json(200, objs);        
    });

});


router.post('/upload', function(req, res, next){

    //生成multiparty对象，并配置上传目标路径
    var form = new multiparty.Form({uploadDir: upload_dir});

    //上传完成后处理
    form.parse(req, function(err, fields, files) {
		var filesTmp = JSON.stringify(files,null,2);
		console.log(filesTmp);

      	if(err){
        	console.log('parse error: ' + err);
			res.json(500, {
				success: false,
				msg: err
			});        
      	} else {
        	console.log('parse files: ' + filesTmp);
			var inputFile = files.imagepath[0];
	        var uploadedPath = inputFile.path;
	        var dstPath = path.join(upload_dir, inputFile.originalFilename);
	        //重命名为真实文件名
	        fs.rename(uploadedPath, dstPath, function(err) {
	          	if(err){
	            	console.log('rename error: ' + err);
					res.json(500, {
						success: false,
						msg: err
					});        
	          	} else {
	            	console.log('rename ok');
					res.json(200, {
						success: true
					});        
	          	}
	        });
	    }
  	});
 
});


router.post('/delete', function(req, res, next){

	// console.log(req.body);

	var filepath = path.join('./static', req.body.src);
	fs.unlink(filepath, function(err){
		if(err){
			res.json(500, {
				success: false,
				msg: err
			});    
		}
		console.log('文件:'+filepath+'删除成功！');
		res.json(200, {
			success: true
		});    
	})

});


router.post('/select', function(req, res, next){
	// console.log(req.body);

	APP.dbpool.getConnection(function(err, conn) {
		
	    var sql = sprintf("update topo_mainview_symbol set background_image_path = '%s' where symbol_id = %d ",
	    	req.body.src, parseInt(req.body.subnetid)
	    );
		console.log("##SQL##", sql);
	    conn.query(sql, function(err, result) {
			// console.log("##Result##", result);
			conn.release();
			var msg;
		    if( err ) {
		      	// One of the iterations produced an error.
		      	// All processing will now stop.
		      	msg = err;
		    } else {
		      	msg = '设置背景图成功！'
		    };
			res.json(200, {
				success: !err,
				msg: msg
			});  
	    });
	}); // getConnection
});


router.post('/clean', function(req, res, next){

	// console.log(req.body);

	APP.dbpool.getConnection(function(err, conn) {
		
	    var sql = sprintf("update topo_mainview_symbol set background_image_path = '' where symbol_id = %d ",
	    	parseInt(req.body.subnetid)
	    );
		console.log("##SQL##", sql);
	    conn.query(sql, function(err, result) {
			// console.log("##Result##", result);
			conn.release();
			var msg;
		    if( err ) {
		      	// One of the iterations produced an error.
		      	// All processing will now stop.
		      	msg = err;
		    } else {
		      	msg = '清除背景图成功！'
		    };
			res.json(200, {
				success: !err,
				msg: msg
			});  
	    });
	}); // getConnection  

});

router.post('/backgroundcolor', function(req, res, next){
	// console.log(req.body);

	APP.dbpool.getConnection(function(err, conn) {
		
	    var sql = sprintf("update topo_mainview_symbol set background_color = '%s' where symbol_id = %d ",
	    	req.body.backgroundcolor, parseInt(req.body.subnetid)
	    );
		console.log("##SQL##", sql);
	    conn.query(sql, function(err, result) {
			// console.log("##Result##", result);
			conn.release();
			var msg;
		    if( err ) {
		      	// One of the iterations produced an error.
		      	// All processing will now stop.
		      	msg = err;
		    } else {
		      	msg = ''
		    };
			res.json(200, {
				success: !err,
				msg: msg
			});  
	    });
	}); // getConnection
});

router.post('/opacity', function(req, res, next){
	console.log(req.body);

	APP.dbpool.getConnection(function(err, conn) {
		
	    var sql = sprintf("update topo_mainview_symbol set opacity = %.2f where symbol_id = %d ",
	    	parseFloat(req.body.opacity), parseInt(req.body.subnetid)
	    );
		console.log("##SQL##", sql);
	    conn.query(sql, function(err, result) {
			// console.log("##Result##", result);
			conn.release();
			var msg;
		    if( err ) {
		      	// One of the iterations produced an error.
		      	// All processing will now stop.
		      	msg = err;
		    } else {
		      	msg = ''
		    };
			res.json(200, {
				success: !err,
				msg: msg
			});  
	    });
	}); // getConnection
});

module.exports = router;
