var express = require('express');
var router = express.Router();
var sprintf = require("sprintf-js").sprintf;

var utilcomm = require('../util');

router.get('/task_tree', function(req, res, next) {
    let sql1 = 'SELECT SYN_TASK_GROUP_ID AS id, remark as qtip, GROUP_NAME AS text FROM res_syn_task_group';
    let sql2 = 'SELECT TASK_NAME AS text, SYN_TASK_GROUP_ID, TASK_START_TYPE, TASK_STATUS,\
    TASK_PERIOD, TASK_PERIOD_INFO, EXECUTE_TIME, IS_CONTINUAL_SYN, TASK_EXPIRY_START_TIME, TASK_EXPIRY_END_TIME,\
    LAST_EXECUTE_TIME, LAST_EXECUTE_STATUS, CREATE_USER, CREATE_TIME, REMARK, SYN_TASK_ID, TASK_TYPE FROM res_syn_task';

    utilcomm.promiseSimpleQuery(sql1 + ';' + sql2)
	.then(function(rows) {
		var nodes = [];
		for (var i in rows[0]) {
			var flag = false;
			rows[0][i].children = [];
			for (var j in rows[1]) {
				if (rows[1][j].SYN_TASK_GROUP_ID == rows[0][i].id) {   			
					flag = true;
					rows[1][j].leaf = true;
					rows[1][j].parentname=rows[0][i].text;
					rows[1][j].qtip = rows[1][j].REMARK;
					rows[0][i].children.push(rows[1][j]);
					rows[0][i].expand = true;
				}
			}
			if (!flag) {
				delete rows[0][i].children;
				rows[0][i].leaf = true;
			}
			nodes.push(rows[0][i]);
		}
		res.status(200).json({success:true, expand: true, children: nodes});
	})
	.catch(function(err) {
		log.error('res sync task group tree get error', err);
		res.status(500).end();
	});
});

router.get('/task_group_info',function(req,res,next){
	let sql = 'SELECT SYN_TASK_GROUP_ID AS group_id, group_name, remark, task_type FROM res_syn_task_group';
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		let ary = rows.map(function(item){
			return [item.group_id, item.group_name];
		});
		res.status(200).json(ary); 
	})
	.catch(function(err) {
		log.error('res sync task group get error', err);
		res.status(500).end();
	});
});

router.post('/task_group/post', function(req, res, next) {
	let add_mode = !req.body.group_id;
	let sql = add_mode ?
	sprintf("INSERT INTO res_syn_task_group (GROUP_NAME, REMARK, TASK_TYPE) VALUES('%s',  '%s',  '%s')",
		req.body.group_name, req.body.remark, req.body.task_type)
	:
	sprintf("UPDATE res_syn_task_group SET GROUP_NAME = '%s', REMARK = '%s',TASK_TYPE = '%s' WHERE SYN_TASK_GROUP_ID = %d",
		req.body.group_name, req.body.remark, req.body.task_type, req.body.group_id);

	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		res.status(200).json({success: true, 
			msg: add_mode ? T.__('Successful operation') + ',' + rows.insertId : T.__('Successful operation')
		}); 
		utilcomm.logSysOp(req.session, true, T.__(add_mode ? 'Add' : 'Modify'), T.__('Task Group'), req.body.group_name);
	})
	.catch(function(err) {
		log.error('res sync task group post error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, 0, T.__(add_mode ? 'Add' : 'Modify'), T.__('Task Group'), req.body.group_name);
	});
});


router.post('/task_group/delete', function(req, res, next) {
	let sql = sprintf("select count(*) as count from res_syn_task where syn_task_group_id = %d", req.body.id);
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		if(rows[0].count > 0) {
			let lmsg = req.body.name + ' ' + T.__('contains sync task, cannot delete');
			res.status(200).json({success: false, msg: lmsg});
			utilcomm.logSysOp(req.session, false, T.__('Delete'), T.__('Task Group'), lmsg);
			return;
		}

		let sql = sprintf("DELETE FROM res_syn_task_group where syn_task_group_id = %d", req.body.id);
		return utilcomm.promiseSimpleQuery(sql);
	})
	.then(function(sth) {
		if(sth) {
			res.status(200).json({success: true, msg: T.__('Successful operation')}); 
			utilcomm.logSysOp(req.session, true, T.__('Delete'), T.__('Task Group'), req.body.name);
		}
	})
	.catch(function(err) {
		log.error('res sync task group delete error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, false, T.__('Delete'), T.__('Task Group'), req.body.name);
	});
});


module.exports = router;