var express = require('express');
var router = express.Router();

router.post("/", function(req, res, next){
	var userId = req.body.sec_user_id;
	var ids=[];
	if(userId!='' && typeof(userId)!='undefined'){
		var sql ="select t1.sec_usergroup_id from sec_user_belongto_usergroup t1 ,sec_usergroup t2 where t2.is_user_private = 0 and t1.sec_usergroup_id=t2.sec_usergroup_id and sec_user_id ="+userId;
		APP.dbpool.getConnection(function(err, conn){
			conn.query(sql,function(err, rows,field){
				for(var i in rows){
					ids.push(rows[i].sec_usergroup_id);
				}
				console.log("##########^^",ids);
				if(err){
					conn.release();
					res.json(200, {success: true, msg: err});
				}else{
					conn.release();
					res.json(200, {success: true, selectedId: ids});
				}

			});
		});

	}else{
		res.json(200, {success: true, selectedId: ids});
	}

});






















module.exports = router;