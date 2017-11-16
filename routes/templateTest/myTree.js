var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	console.info('进入后台获取树的节点数据');
	var rows = {
			"success": true ,
		    "children": [
		        { "id": 1, "text": "Phil","checked":false,"leaf": true },
		        { "id": 2, "text": "Nico", "checked":false,"expanded": true, "children": [
		            { "id": 3, "text": "Mitchell","checked":false, "leaf": true }
		        ]},
		        { "id": 4, "text": "Sue","checked":false, "loaded": true },
		        { "id": 5, "text": "Sue", "checked":false,"loaded": true }
		     ]
	};
	res.send(rows );  
});

router.get('/alsoselected', function(req, res, next) {
	console.info('进入后台获取树的节点数据');
	var rows;
	var templateName =req.body.templateName;
	console.info(typeof(templateName));
	console.info("获取到的模板名称："+templateName);
	if(true){
		 rows = {
				"success": true ,
			    "children": [
			        { "id": 1, "text": "Phil","checked":false,"leaf": true },
			        { "id": 2, "text": "Nico", "checked":false,"expanded": true, "children": [
			            { "id": 3, "text": "Mitchell","checked":false, "leaf": true }
			        ]},
			        
			     ]
		};
	}else{
		rows = {
				"success": true ,
			    "children": [
			     ]
		};
	}
	
	res.send(rows );  
});

module.exports = router;