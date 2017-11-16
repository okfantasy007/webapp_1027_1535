var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
var util = require('util');

var upload_dir = './static/images/topo/background';

router.post('/', function(req, res, next){

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
			var inputFile = files.upload_file[0];
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

module.exports = router;
