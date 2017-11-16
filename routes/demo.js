var express = require('express');
var router = express.Router();

router.get('/employees', function(req, res, next) {

	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 
	   		'SELECT emp_no,\
	    	 	    first_name,\
	    	  		last_name,\
	    	   		gender,\
	    	    	CONCAT(`first_name`," ",`last_name`) AS full_name,\
	    	     	DATE_FORMAT(birth_date,"%Y-%m-%d") AS birth_date,\
	    	      	DATE_FORMAT(hire_date,"%Y-%m-%d") AS hire_date\
	    	   FROM employees.employees\
	    	  LIMIT 100';
	    conn.query(sql, function(err, rows, fields) {
		    for (var i in rows) {
		    	console.log(i, rows[i].full_name);
			}
	        conn.release();
	  		res.json(200, {success: true, data: rows });  
	    });
	});
});

router.get('/device_poll', function(req, res, next) {
	var poll_time = req.query.time;
	APP.dbpool_res.getConnection(function(err, conn) {
		console.log(poll_time);
	    var sql = 
	   		 sprintf(" SELECT id,\
	    	  hostname,\
	    	  ip_address,\
	    	  type,\
	    	  poll_interval,\
	    	  poll_template,\
	    	  last_polling_time,\
	    	  last_polling_duration\
	    	  FROM res_node WHERE poll_interval = %d",  poll_time);
	    	 // console.log(sql);
	    conn.query(sql, function(err, rows, fields) {
	    	//console.log(poll_time);
		    for (var i in rows) {
		    	console.log(i, rows[i].hostname);
			}
	        conn.release();
	  		res.json(200, {success: true, data: rows });  
	    });
	});
});

router.get('/employees/page', function(req, res, next) {

	log.debug('GET /demo/employees/page', req.query);

	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {

	   	var sqls=[];
	   	sqls.push("SELECT COUNT(*) AS count FROM employees.employees");

	    var sql =
	    	'SELECT employees.emp_no AS id,\
     			    employees.emp_no,\
     			    employees.first_name,\
     			    employees.last_name,\
     			    employees.gender,\
     			    CONCAT(employees.first_name," ",employees.last_name) AS full_name,\
     			    DATE_FORMAT(employees.birth_date,"%Y-%m-%d") AS birth_date,\
     			    DATE_FORMAT(employees.hire_date,"%Y-%m-%d") AS hire_date,\
     			    dict.gender.name AS gender_name \
	     	   FROM employees.employees, dict.gender\
	          WHERE employees.employees.gender=dict.gender.abbr';
		sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
	   	sqls.push(sql);

	   	// 将两条sql语句合并
	   	sql_all = sqls.join(';');

    	log.debug("##SQL##", sql_all);

	    conn.query(sql_all, function(err, rows_ary, fields) {

			// 获取记录总数
			var rows_count  = rows_ary[0];
	    	var totalCount = rows_count[0].count;

			// 获取记录数组
			var rows = rows_ary[1];

			// 释放数据库连接
	        conn.release();

	        // 返回结果
	  		res.json(200, {
	  			success: true,
	  			total: totalCount,
	  			data: rows,
	  		});  

	    });

	});
	
});


router.post('/employees/post', function(req, res, next) {
	console.log(req.body);

	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {

		var sql;
		var add_mode = req.body.emp_no == '';
	   	console.log("####",req.query);
		if (add_mode) {
			sql = sprintf(
				"INSERT INTO  `employees`.`employees` (\
					`emp_no` ,\
					`birth_date` ,\
					`first_name` ,\
					`last_name` ,\
					`gender` ,\
					`hire_date`	)\
				VALUES (NULL,  '%s',  '%s',  '%s',  '%s',  '%s'\
					)",
				req.body.birth_date,
				req.body.first_name,
				req.body.last_name,
				req.body.gender,
				req.body.hire_date
			);
		} else {
			sql = sprintf(
				"UPDATE  `employees`.`employees`\
				    SET  `birth_date` = '%s',\
				         `first_name` = '%s',\
				         `last_name` = '%s',\
				         `gender` = '%s',\
					     `hire_date` = '%s'\
		 		  WHERE  `employees`.`emp_no` = %d",
				req.body.birth_date,
				req.body.first_name,
				req.body.last_name,
				req.body.gender,
				req.body.hire_date,
				req.body.emp_no
		 	);
		};

		if (!add_mode && parseInt(req.body.emp_no)<500000) {
			conn.release();
			res.json(200, {success: false, 'msg': '当前记录受保护不能修改!' });  
		} else {
			console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				console.log("##Result##", result);
				console.log(result);
				conn.release();
				res.json(200, {success: true, msg: '操作成功!' });  
		    })
		}

	})

});

router.post('/employees/delete', function(req, res, next) {
	console.log(req.body);
	var ids = req.body.ids.split(',');
	var infos = [];
	var with_err = false;
	var ids_del = [];

	for (var i in ids) {
		console.log(ids[i]);
		if ( parseInt(ids[i])<500000 ) {
			with_err = true;
			infos.push( '[Error] Record ID: ' + ids[i] + ' is protected!');
		} else {
			infos.push( 'Record ID: ' + ids[i] + ' was deleted!');
			ids_del.push(ids[i]);
		}
	}

	if (ids_del.length>0) {
		var sql = sprintf("DELETE FROM `employees`.`employees` WHERE `employees`.`emp_no` IN (%s)",
			ids_del.join(","));
		console.log("##SQL##",sql);

		APP.dbpool.getConnection(function(err, conn) {
		    conn.query(sql, function(err, result) {
		        conn.release();
				res.json(200, {
					success: true,
					with_err: with_err,
					msg: infos.join('</br>')
				});  
		    });
		});
	} else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: infos.join('</br>')
		});  
	}

});

// 返回一个combobox使用的ArrayStore格式数据
router.get('/employees/gender', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT * FROM dict.gender';
	    conn.query(sql, function(err, rows, fields) {
			var ary = rows.map(function(item){
				return [item.abbr, item.name];
			});
	        conn.release();
	  		res.json(200, ary);  
	    });
	});
});


router.post('/user/kickoff', function(req, res, next) {

	var msg = {
		"session_id": 	req.body.session_id,
		"user": 		req.body.user,
		"immediately":  req.body.immediately,
	};

	log.debug( JSON.stringify(msg,null,2) );
	APP.mqtt_client.publish('user_kickoff', JSON.stringify(msg,null,2));

	res.json(200, {
		success: true,
		msg: 'oper success'
	});  	
});


module.exports = router;
