var express = require('express');
var router = express.Router();

router.get("/load", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		console.log(req.query);
		console.log('########^^',req.query.use_all_acl);
		var secUserId = req.query.sec_user_id;
		var sql ;
		if(req.query.use_all_acl==2){
			sql = "select t1.*,t1.limit_id as id,if(isnull(t2.sec_user_id),0,1) as checked ,t2.sec_user_id from sec_ip_limit t1 left join sec_user_iplimit t2 on t1.limit_id = t2.limit_id and t2.sec_user_id ="+secUserId;
		}else{
			sql = "select limit_id as id,\
						ip_limit_type as ip_limit_type,\
						ip_range as ip_range,\
						limit_desc as limit_desc,\
						1 as checked\
		 			from sec_ip_limit";
		}
		
		conn.query(sql, function(err, result){
			conn.release();
			console.log("##load_control##",result);
			if(err){	
				res.json(200, {success: true, msg: err});
			}else{
				res.json(200, {success: true, root: result});
			}
		});
	});
});



module.exports = router;