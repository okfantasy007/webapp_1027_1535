var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment');

/*
接口说明
接口输入输出格式：
输入：{"name":"aaa","ip":"111.23.12.11","netypeid":"111","topo_type_id":"56"...........}
必有属性：name,ip,netypeid
可选属性：symbol_name2,symbol_name3,remark,userlabel,Telnet_port,islocal,port,poll_enabled,poll_interval,longitude,latitude,
          map_parent_id,tree_parent_id, map_hierarchy,x,y,ne_parent_id,level

IP检测已存在则输出：{"success":false,"msg":"ip已存在！"}

添加设备成功则输出：{"success":true,"msg":"添加设备成功！"}

*/


// 添加设备
router.route('/:deviceInfo')
    .get(function(req, res, next) {
        var deviceInfo = JSON.parse(req.params.deviceInfo);
        var symbol_name1=deviceInfo.name;
        var ipaddress=deviceInfo.ip;
        var netypeid=deviceInfo.netypeid;
        var topo_type_id=deviceInfo.topo_type_id;

        var symbol_name2=deviceInfo.symbol_name2;
        if(symbol_name2==undefined){
        	symbol_name2=symbol_name1;
        }
        var symbol_name3=deviceInfo.symbol_name3;
        if(symbol_name3==undefined){
        	symbol_name3=symbol_name1;
        }
        var remark=deviceInfo.remark;
        if(remark==undefined){
        	remark=null;
        }
        var userlabel=deviceInfo.userlabel;
        if(userlabel==undefined){
        	userlabel=null;
        }
        var Telnet_port=deviceInfo.Telnet_port;
        if(Telnet_port==undefined){
        	Telnet_port=23;
        }
     	var islocal=deviceInfo.islocal;
     	if(islocal==undefined){
     		islocal=0;
     	}
     	var port=deviceInfo.port;
     	if(port==undefined){
     		port=161;
     	}
     	var poll_enabled=deviceInfo.poll_enabled;
     	if(poll_enabled==undefined){
     		poll_enabled=1;
     	}
     	var poll_interval=deviceInfo.poll_interval;
     	if(poll_interval==undefined){
     		poll_interval=1800;
     	}
     	var longitude=deviceInfo.longitude;
     	if(longitude==undefined){
     		longitude=null;
     	}
     	var latitude=deviceInfo.latitude;
     	if(latitude==undefined){
     		latitude=null;
     	}
        var map_parent_id=deviceInfo.map_parent_id;
        if(map_parent_id==undefined){
        	map_parent_id=0;
        }
        var tree_parent_id=deviceInfo.tree_parent_id;
        if(tree_parent_id==undefined){
        	tree_parent_id=0;
        }
        var map_hierarchy=deviceInfo.map_hierarchy;
        var x=deviceInfo.x;
        if(x==undefined){
        	x=0;
        }
        var y=deviceInfo.y;
        if(y==undefined){
        	y=0;
        }
        var level=deviceInfo.level;
     	if(level==undefined){
        	level=0;
        }

        async.waterfall(
		[
		    // step 1 func
		    function(callback) {
		    	APP.dbpool.getConnection(function(err, conn) {
		    		callback(null, conn);
		    	})
		    },

		    // step 2 func  检测ip地址是否存在
		    function(conn, callback) {
		    	var sql="select count(neid) as count from res_ne where ipaddress='"+ipaddress+"';";
		    	conn.query(sql, function(err, rows, fields) {
			    	if(err){
			    		callback(err);
			    	}
			    	var count=parseInt(rows[0].count);
			    	if(count==0)
			    		callback(null, conn,false);
			    	else
			    		callback(null, conn,true);

			    });
		    },

		    function(conn,flag,callback){
		    	if(flag){
		    		conn.release();
		    		res.status(200).json({
			            success: false,
			            msg:'ip已存在！'
		       		 });  
		    	}else{
		    		var sql = "select max(neid)+1 as id from res_ne";
		    		conn.query(sql, function(err, rows, fields) {
				    	var NE_ID=rows[0].id;
				        callback(null,conn,NE_ID);
				    });
		    	}
		    },

		    // step 3 func
		    function(conn,NE_ID,callback) {
			    var sql = "select max(symbol_id)+1 as id from topo_symbol";
			    conn.query(sql, function(err, rows, fields) {
			    	var SYMBOL_ID=rows[0].id;
			        callback(null, conn,NE_ID,SYMBOL_ID);
			    });
		    },

		    // step 4 func
		    function(conn,NE_ID,SYMBOL_ID,callback){
	            var CREATE_TIME=moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		     	var neid=NE_ID;
		     	sql = sprintf("INSERT INTO `res_ne`\
		     			(`create_time`,`neid`,`userlabel`,`Telnet_port`,`ipaddress`,`netypeid`,\
		     			`islocal`,`port`,`poll_enabled`,`poll_interval`)\
						VALUES('%s',%d,'%s',%d,'%s',%d,\
						      %d,%d,%d,%d)",
	 				 	CREATE_TIME,neid,userlabel,Telnet_port,ipaddress,netypeid,
	 				 	islocal,port,poll_enabled,poll_interval
				    );
		     	conn.query(sql, function(err, rows, fields) {
		     		if(err){
		     			callback(err);
		     		}
			        callback(null,conn,NE_ID,SYMBOL_ID);
			    });
		    },

		    // step 4 func
			function(conn, NE_ID,SYMBOL_ID,callback) {
		        if(map_hierarchy==undefined){
					map_hierarchy=',0,'+SYMBOL_ID + ',';
				}
				sql = sprintf("INSERT INTO `topo_symbol`\
			        (`symbol_id`, `main_view_id`, `ne_id`,`symbol_style`, `create_user`, `map_hierarchy`, `res_type_name`,`map_parent_id`,`tree_parent_id`,\
			         `symbol_name1`, `symbol_name2`, `symbol_name3`, `remark`, `x`, `y`,\
			         `status_is_ping_ok`, `is_visible`, `res_id`, `topo_type_id`, `real_res_type_name`, `real_res_id`,`level`)\
			        VALUES(%d, %d, %d, %d, '%s', '%s', '%s', %d, %d, '%s', '%s', '%s', '%s', %d, %d, %d, %d, '%s', '%s', '%s', '%s',%d)",
			        SYMBOL_ID,
			        1,
			        NE_ID,
	                1,
	                req.session['user'],
	                map_hierarchy,
	                'NE',
	                map_parent_id,
	                tree_parent_id,
	                symbol_name1,
	                symbol_name2,
	                symbol_name3,
	                remark,
	                x,
	                y,
	                1,
	                1,
	                NE_ID,
	                topo_type_id,
	                'NE',
	                NE_ID,
	                0
			    );
		    		
				conn.query(sql, function(err, rows, fields) {
			        callback(null, conn, rows);
			    });
		    }
		], 

		// final func
		function (err, conn, rows) {
	        conn.release();
	        if(!err){
	        	res.status(200).json({
		            success: true,
		            msg:'添加设备成功！'
		        });  
	        }else{
	        	if(rows){

	        	}
	        }
		}); 
    });
 

module.exports = router;