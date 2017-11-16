var express = require('express');
var router = express.Router();

router.get("/load", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var userType = req.query.user_type;
		if(userType!=''&& typeof(userType)!='undefined'){
			sql = "select sec_usergroup_id as sec_usergroup_id,\
						sec_usergroup_name as sec_usergroup_name,\
						sec_usergroup_type as sec_usergroup_type,\
						sec_usergroup_fullname as sec_usergroup_fullname,\
						enable_status as enable_status,\
						create_time as create_time,\
						sec_usergroup_desc as sec_usergroup_desc\
		 			from sec_usergroup where is_user_private = 0 and sec_usergroup_type in ("+userType+",0)";
		}else{
			sql = "select sec_usergroup_id as sec_usergroup_id,\
						sec_usergroup_name as sec_usergroup_name,\
						sec_usergroup_type as sec_usergroup_type,\
						sec_usergroup_fullname as sec_usergroup_fullname,\
						enable_status as enable_status,\
						create_time as create_time,\
						sec_usergroup_desc as sec_usergroup_desc\
		 			from sec_usergroup where is_user_private = 0";
		}
		conn.query(sql, function(err, result){
			console.log("##load_control##",result);
			if(err){
				conn.release();
				res.json(200, {success: true, msg: err});
			}else{
				conn.release();
				res.json(200, {success: true, root: result});
			}
		});
	});
});

// router.get("/ok", function(req, res, next){


// });


module.exports = router;