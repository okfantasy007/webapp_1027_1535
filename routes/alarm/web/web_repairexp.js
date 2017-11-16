var express = require('express');
var nodeExcel = require('excel-export');
var router = express.Router();
var currentPageResult;
var allResult;
router.post('/export/currentPage', function(req, res){
	var fields = JSON.parse(req.query.fields);
  	var conf ={};
    var array = [];
    fields.forEach(function(element){
    	array.push({
    		'caption': element,
    		type:'string',
    		width:100.1
    	});
    });
  	conf.cols = array;
  	conf.rows = JSON.parse(req.body.data);
  	// console.log("**conf:",conf);
  	try {
   		currentPageResult = nodeExcel.execute(conf);
	}
	catch (e) {
   		res.json(200, {success: false, msg: '操作失败!' });
   		console.log(e);
	}
  	res.json(200, {success: true, msg: '操作成功!' });
});

router.get('/export/getCurrentPageExcel', function(req, res){
  	res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	// res.setHeader("Content-Disposition", "attachment; filename=" + "RepairExp.xlsx");
  	res.setHeader("Content-Disposition", "attachment; filename=" + "RepairExp.csv");
  	res.end(currentPageResult, 'binary');
});

router.post('/export/all', function(req, res){
	var fields = JSON.parse(req.query.fields);
	var dataIndex = JSON.parse(req.query.dataIndex);
	var conditionString = req.body.conditionString;
	var sql = "SELECT distinct fm_experience.experienceid from fm_symptom left join fm_experience_2_symptom on fm_symptom.symptomid = fm_experience_2_symptom.symptomid left join fm_experience on fm_experience_2_symptom.experienceid = fm_experience.experienceid";
	sql = sql + conditionString;
	var sqltemp = "select";
	dataIndex.forEach(function(element){
		sqltemp += ", " + element;
	});
	sqltemp = sqltemp.replace(/select,/, 'select');
	sqltemp += " from fm_experience where experienceid in ( " + sql + ")";
	// console.log("**sql:",sqltemp);
	var conf ={};
	var array = [];
    fields.forEach(function(element){
    	array.push({
    		'caption': element,
    		type:'string',
    		width:100.1
    	});
    });
    conf.cols = array;
    conf.rows = [];
	APP.dbpool.getConnection(function(err, conn) {
		conn.query(sqltemp, function(err, rows) {
			if (err){
				res.json(200, {success: false, msg: '操作失败!' });
				console.log(sqltemp + "执行失败");
			}else{
		    	for (var i in rows) {
		    		var array = Object.values(rows[i]);
		    		conf.rows.push(array);
				}
				console.log("**conf:",conf);
				try {
   					allResult = nodeExcel.execute(conf);
				}
				catch (e) {
   					res.json(200, {success: false, msg: '操作失败!' });
   					console.log(e);
				}
				res.json(200, {success: true, msg: '操作成功!' });
			}        					
		});
	});
});

router.get('/export/getAllExcel', function(req, res){
  	res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	// res.setHeader("Content-Disposition", "attachment; filename=" + "RepairExp.xlsx");
  	res.setHeader("Content-Disposition", "attachment; filename=" + "RepairExp.csv");
  	res.end(allResult, 'binary');
});

module.exports = router;