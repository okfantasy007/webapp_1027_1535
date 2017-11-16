var express = require('express');
var router = express.Router();
var sprintf = require("sprintf-js").sprintf;

var utilcomm = require('../util');
var ressync = require('../../../modules/ressync');

router.get('/',function(req,res,next){
	let preSQL = "update res_syn_task set task_status = 3 where is_continual_syn = 0 and task_expiry_end_time<=current_date";
	utilcomm.promiseSimpleQuery(preSQL)
	.then(function() {
		let sqlsBase = [
			"SELECT SYN_TASK_ID, SYN_TASK_GROUP_ID, TEMPLATE_ID, TASK_NAME, TASK_START_TYPE, TASK_STATUS, \
			TASK_PERIOD, TASK_PERIOD_INFO, EXECUTE_TIME, IS_CONTINUAL_SYN, \
			TASK_EXPIRY_START_TIME, TASK_EXPIRY_END_TIME, LAST_EXECUTE_TIME, LAST_EXECUTE_STATUS, \
			CREATE_USER, CREATE_TIME, REMARK, TASK_TYPE FROM res_syn_task",
			
			"SELECT COUNT(*) AS count FROM res_syn_task",
			
			"SELECT GROUP_NAME AS text, SYN_TASK_GROUP_ID AS id FROM res_syn_task_group"
			]
			
		let sql = (req.query.group_id =='root') ? sqlsBase.join(';') : sqlsBase.map(function(oneSql) {
				console.log('req.query.group_id',  req.query.group_id);
	    		return oneSql + sprintf(' where SYN_TASK_GROUP_ID = %s', req.query.group_id);
	    	}).join(';');

		return utilcomm.promiseSimpleQuery(sql);
	})
	.then(function(rows) {
		let rows_taskInfo = rows[0];
		let rows_taskCount = rows[1];
		let rows_taskGroup = rows[2];

		for (let oneGroup in rows_taskGroup) {
			for(let oneTask in rows_taskInfo){
				if (oneTask.SYN_TASK_GROUP_ID == oneGroup.id) {  
					oneTask.parentname = oneGroup.text;
				} 	
			}
		}
  		res.status(200).json({success: true, data: rows_taskInfo,	total: rows_taskCount[0].count});  
	})
	.catch(function(err) {
		res.status(500).end();
		log.error(err);
	});
});

router.post('/post', function(req, res, next) {
	console.log(JSON.stringify(req.body));
	let TASK_PERIOD_INFO = req.body.weekday ? req.body.weekday.toString() : '';
	let IS_CONTINUAL_SYN = req.body.isContinul ? 1 : 0;

	let add_mode = !req.body.SYN_TASK_ID;
	let sql = add_mode ? 
	sprintf(
		"INSERT INTO res_syn_task(task_status, SYN_TASK_GROUP_ID, TASK_NAME, TASK_START_TYPE, TASK_PERIOD, \
		TASK_PERIOD_INFO, EXECUTE_TIME, IS_CONTINUAL_SYN, TASK_EXPIRY_START_TIME, TASK_EXPIRY_END_TIME, REMARK)\
		VALUES (2,  '%s',  '%s',  '%s','%s', '%s','%s', '%s', '%s', '%s','%s')",
		req.body.SYN_TASK_GROUP_ID,
		req.body.TASK_NAME,
		req.body.TASK_START_TYPE,
		req.body.TASK_PERIOD,
		TASK_PERIOD_INFO,
		req.body.EXECUTE_TIME,
		IS_CONTINUAL_SYN,
		req.body.TASK_EXPIRY_START_TIME,
		req.body.TASK_EXPIRY_END_TIME,
		req.body.REMARK)
	:
	sprintf(
		"UPDATE res_syn_task SET task_status = 2, SYN_TASK_GROUP_ID = '%s', TASK_NAME = '%s', TASK_START_TYPE = '%s', \
		TASK_PERIOD = '%s', TASK_PERIOD_INFO = '%s', EXECUTE_TIME = '%s', IS_CONTINUAL_SYN = '%s', \
		TASK_EXPIRY_START_TIME = '%s', TASK_EXPIRY_END_TIME = '%s', REMARK = '%s' WHERE SYN_TASK_ID = %d",
		req.body.SYN_TASK_GROUP_ID,
		req.body.TASK_NAME,
		req.body.TASK_START_TYPE,
		req.body.TASK_PERIOD,
		TASK_PERIOD_INFO,
		req.body.EXECUTE_TIME,
		IS_CONTINUAL_SYN,
		req.body.TASK_EXPIRY_START_TIME,
		req.body.TASK_EXPIRY_END_TIME,
		req.body.REMARK,
		req.body.SYN_TASK_ID);

	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		let taskId = req.body.SYN_TASK_ID ? req.body.SYN_TASK_ID : rows.insertId;
		let infos = req.body.info ? JSON.parse(req.body.info) : {};

		let insertRows = [];
		for(let symbol_id in infos){
			let oneInfo = infos[symbol_id];
			oneRow = sprintf("(%d, '%s', '%s', %d, %s)", 
				taskId, oneInfo.res_type_name, oneInfo.res_id, symbol_id, 
				oneInfo.category ? oneInfo.category : null);
		 	insertRows.push(oneRow);
		}
		
		if(insertRows.length > 0) {
			let sql = sprintf("DELETE FROM res_syn_task_area WHERE (SYN_TASK_ID='%s');\
			INSERT INTO res_syn_task_area (syn_task_id, res_type_name, res_id, symbol_id, category) VALUES %s ",
			taskId,insertRows.join(','));

			return utilcomm.promiseSimpleQuery(sql);
		}

		return;
	})
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')}); 
		utilcomm.logSysOp(req.session, true, T.__(add_mode ? 'Add' : 'Modify'), T.__('Synchro Task'), req.body.TASK_NAME);
	})
	.catch(function(err) {
		log.error('res sync task post error', err);
		let emsg = err.errno == 1062 ? T.__('Duplicated task name') : T.__('operation failed');
		res.status(200).json({success: false, msg: emsg});
		utilcomm.logSysOp(req.session, false, T.__(add_mode ? 'Add' : 'Modify'), T.__('Synchro Task'), req.body.TASK_NAME);
	});
});

router.post('/delete', function(req, res, next) {
	let ids = req.body.ids.split(',');
	let info;
	let ids_del = [];

	for (var i in ids) {
		if(ids[i] == '1'){
			info = 'Global resouce sync task cannot be deleted';
		}else{
			ids_del.push(ids[i]);
		}
	}

	if (ids_del.length == 0) {
		res.status(200).json({success: false, msg: T.__(info)}); 
		return;
	}

	let sql = sprintf("DELETE FROM res_syn_task WHERE syn_task_id IN (%s);\
		DELETE FROM res_syn_task_area WHERE syn_task_id IN (%s)", ids_del.join(','), ids_del.join(','));
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		res.status(200).json({success: true, msg: T.__(info ? info : 'Successful operation')}); 
		utilcomm.logSysOp(req.session, true, T.__('Delete'), T.__('Synchro Task'), req.body.names);
	})
	.catch(function(err) {
		log.error('res sync task delete error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')}); 
		utilcomm.logSysOp(req.session, false, T.__('Delete'), T.__('Synchro Task'), req.body.names);
	});

});

router.post('/sync_service_status',function(req,res,next) {
	let res_sync_service_status = req.body.res_sync_service_status ? 1 : 0;
	let sql = sprintf("UPDATE sys_properties SET property_value='%s' WHERE (group_name='sync') AND (property_name='res_sync_service_status');\
		UPDATE sys_properties SET property_value='%s' WHERE (group_name='sync') AND (property_name='res_sync_max_execute_task_count')",res_sync_service_status,
		req.body.res_sync_max_execute_task_count);

	utilcomm.promiseSimpleQuery(sql)
	.then(function() {
		ressync.updateGlobalEnable();
	})
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, 
			T.__('Modify'), T.__('Synchro Task') + ' ' + T.__('Global Parameter Config'), 
			res_sync_service_status + ' ' + req.body.res_sync_max_execute_task_count);
	})
	.catch(function(err) {
		log.error('res sync post global control error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, false, 
			T.__('Modify'), T.__('Synchro Task') + ' ' + T.__('Global Parameter Config'), 
			res_sync_service_status + ' ' + req.body.res_sync_max_execute_task_count);
	});
});

router.get('/sync_service_status', function(req, res, next) {
	let sql = "SELECT property_value as res_sync_max_execute_task_count FROM sys_properties WHERE property_name = 'res_sync_max_execute_task_count';\
		SELECT property_value as res_sync_service_status FROM sys_properties WHERE property_name = 'res_sync_service_status'";

	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		rows[0][0].res_sync_service_status = rows[1][0].res_sync_service_status;
  		res.status(200).json({
  			success: true,
  			data: rows[0]
  		});
	})
	.catch(function(err) {
		res.status(500).end();
		log.error('res sync get global control error', err);
	});
});

router.post('/execTaskNowOnce', function(req, res) {
	res.status(200).json({success: true, msg: T.__('Successful operation')});
	ressync.executeSyncTaskOneTimeImmediately(req.body.taskIDs);
	utilcomm.logSysOp(req.session, true, T.__('Start Task Now'), T.__('Synchro Task'), req.body.taskNames);
});

router.post('/startSyncTask', function(req, res) {
	Promise.resolve(ressync.startSyncTask(req.body.taskIDs))
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, T.__('Start Task'), T.__('Synchro Task'), req.body.taskNames);
	})
	.catch(function(err) {
		log.error('res sync start task error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')}); 
		utilcomm.logSysOp(req.session, false, T.__('Start Task'), T.__('Synchro Task'), req.body.taskNames);
	});
});

router.post('/stopSyncTask', function(req, res) {
	Promise.resolve(ressync.stopSyncTask(req.body.taskIDs))
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, T.__('Stop Task'), T.__('Synchro Task'), req.body.taskNames);
	})
	.catch(function(err) {
		log.error('res sync stop task error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')}); 
		utilcomm.logSysOp(req.session, false, T.__('Stop Task'), T.__('Synchro Task'), req.body.taskNames);
	});
});

module.exports = router;