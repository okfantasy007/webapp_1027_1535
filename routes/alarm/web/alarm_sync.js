var express = require('express');
var router = express.Router();
var async = require('async');
var amqp = require('amqplib/callback_api');
var abilityConfig = require('../abilities').config;
var alarmSyncJobMap = require('../../../modules/alarmSync').alarmSyncJobMap;
var executeTask = require('../../../modules/alarmSync').executeTask;
var startTask = require('../../../modules/alarmSync').startTask;
var getInterval = require('../../../modules/alarmSync').getInterval;
var getNEids = require('../../../modules/alarmSync').getNEids;
var amqp_conn,
	amqp_chanel;

async function assembleTask(conn, neid) {
	var sql = sprintf("select 'ressync' as poll_type, n.neid, n.ipaddress as hostname, \
			n.south_protocol, n.proto_param, nt.abilities \
			from res_ne n, res_ne_type nt \
			where n.neid = %d and n.netypeid=nt.netypeid", neid); 
	var rows = await conn.query(sql);
	if(rows.length == 0) {
		await Promise.reject('wrong ne id: ' + neid);
	}
	for(var i in rows) {
		var templateParsed = JSON.parse(rows[i].proto_param);
		delete rows[i].proto_param;

		var type = 'SNMP';
		switch(rows[i].south_protocol) {
			case 1:
				type = 'SNMP';
				break;
			case 2:
				type = 'TR069';
				break;
			case 3:
				type = 'NETCONF';
				break;
			case 4:
				type = 'OPENFLOW';
				break;
		}
		delete rows[i].south_protocol;
		if(!rows[i].abilities) {
			await Promise.reject('abilities is null for ne id:' + neid);
		}
		rows[i].polling_templates = [];
		rows[i].polling_templates.push({type: type, Config: templateParsed});

		var abilities = JSON.parse(rows[i].abilities).alarm;
		if(!abilities) {
			await Promise.reject("abilities format error for ne id:" + neid);
		}
		delete rows[i].abilities;
		rows[i].node_abilities = [];
		for(var j in abilities) {
			var abiliName = abilities[j];
			var match = abilityConfig[abiliName];
			if(match) {
				match.name = abiliName;
				match.call_type = 'extend';
				match.protocol = type;

				rows[i].node_abilities.push(match);
			}
		}
		return rows[i];
	}
}

router.post('/process_next', function(req, res) {
	// log.debug('************************req.body',req.body);
})

async function startSync(conn,neid) {
	var task = await assembleTask(conn, neid);
	if(task.polling_templates[0].type == 'SNMP') {
		var amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	    amqp_conn = await amqp_connect_promise(amqp_url);
	    amqp_chanel = await amqp_createChannel_promise(amqp_conn);

   		// var rest_url = sprintf("http://localhost:%d/alarm_node/alarm_sync/process_next", req.app.get('port'));
   		var rest_url = "http://localhost:8080/AlarmSynMgt/test";
   		task.rest_url = rest_url;
   		task.timestamp = parseInt(Date.now() / 1000);
   		// task.queuename = "alarm_synchro_queue";
		var jstr = JSON.stringify(task,null,2);
	    console.log(jstr);
	    amqp_send('polling_task', jstr);
	}
}

router.post('/neid/:neid', function(req, res) {
	var conn;
	log.debug('************************同步网元：',req.params.neid);
	(async function() {
		conn = await APP.dbpool_promise.getConnection();
		await startSync(conn,req.params.neid);
		/*
		conn = await APP.dbpool_promise.getConnection();
		var task = await assembleTask(conn, req.params.neid);
		if(task.polling_templates[0].type == 'SNMP') {
			var amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	    	amqp_conn = await amqp_connect_promise(amqp_url);
	    	amqp_chanel = await amqp_createChannel_promise(amqp_conn);

   			// var rest_url = sprintf("http://localhost:%d/alarm_node/alarm_sync/process_next", req.app.get('port'));
   			var rest_url = "http://localhost:8080/AlarmSynMgt/test";
   			task.rest_url = rest_url;
   			task.timestamp = parseInt(Date.now() / 1000);
   			// task.queuename = "alarm_synchro_queue";
			var jstr = JSON.stringify(task,null,2);
	    	console.log(jstr);
	    	amqp_send('polling_task', jstr);
	    	
		}*/
	})()
	.catch(function(err) {
		log.error(err);
		return err;
	})
	.then(function(err) {
		if(conn) {
			APP.dbpool_promise.releaseConnection(conn);
		}
		if(err) {
			res.status(500).end();
		} else {
			res.status(200).end();
		}
	});
});

function amqp_createChannel_promise(amqp_conn) {
	return new Promise(function(resolve, reject) {
		amqp_conn.createChannel(function(err, mq_ch) {
			if(err) {
				reject(err);
			}
			resolve(mq_ch);
		});
	});
}

function amqp_connect_promise(amqp_url) {
	return new Promise(function(resolve, reject) {
		amqp.connect(amqp_url, function(err, mq_conn) {
			if(err) {
				reject(err);
			}
	        resolve(mq_conn);
		});
	});
}

var amqp_send = function(topic, payload) {
    var queueName = topic;
    amqp_chanel.assertQueue(queueName, {durable: false});
    amqp_chanel.sendToQueue(queueName, new Buffer(payload));
    if(amqp_chanel) {
		amqp_chanel.close(function() {
			amqp_conn.close(function() {
			})
		})
	}
}

function terminate(jobID){
	var job = alarmSyncJobMap.get(jobID);
   	log.debug('停止该任务',jobID,job);//不仅仅是cancel该任务的再次执行，但是MAP里面还要删除该任务
   	if(job){
   		var terminate = job.cancel();//停止该任务
   		alarmSyncJobMap.delete(jobID);
   	}else{
   		return false;
   	}
   	return terminate;
}

router.post('/resume', function(req, res) {
	var IDs = JSON.parse(req.body.IDs);
	var result = [];
	var conn;
	(async function() {
		conn = await APP.dbpool_promise.getConnection();
		for(var i in IDs){
			var sql = "select concat('job', syn_task_id) AS jobID, syn_task_id, task_name, task_period, create_time, execute_time,\
				is_continual_syn, task_expiry_start_time, task_expiry_end_time from alarm_syn_task\
				where task_status = 2 and syn_task_id = " + IDs[i];//in resume, the task_status must be 2
			var rows = await conn.query(sql);
			if(rows.length == 0){
				continue;
			}
			result.push(rows[0]);
		}
	})()
	.catch(function(err) {
		log.error(err);
		return err;
	})
	.then(function(err) {
		if(err) {
			if(conn) {
				APP.dbpool_promise.releaseConnection(conn);
			}
			res.status(500).end();
			return;
		}else{
			(async function() {
				for(var i in result) {
					if(result[i]){
						startTask(result[i]);
						var sql = "UPDATE alarm_syn_task SET task_status = 1 WHERE syn_task_id = " + result[i].syn_task_id;
						var rows = await conn.query(sql);
					}
				}
			})()
			.catch(function(err) {
				log.error(err);
				return err;
			})
			.then(function(err) {
				if(err) {
					if(conn) {
						APP.dbpool_promise.releaseConnection(conn);
					}
					res.status(500).end();
					return;
				}else{
					res.status(200).json({success: true, msg: '启动同步任务成功!'});
				}
			});
		}
	});
});

router.post('/terminate', function(req, res) {
	var IDs = JSON.parse(req.body.IDs);
	var result = true;
	var conn;
	(async function() {
		conn = await APP.dbpool_promise.getConnection();
		for(var i in IDs){
			var jobID = "job" +IDs[i];
			var t = terminate(jobID);
			if(!t){
				result = false;
			}else{
				var sql = "UPDATE alarm_syn_task SET task_status = 2 WHERE syn_task_id = " + IDs[i];
				var rows = await conn.query(sql);
			}
		}
	})()
	.catch(function(err) {
		result = false;
		log.error(err);
		return err;
	})
	.then(function(err) {
		if(conn) {
			APP.dbpool_promise.releaseConnection(conn);
		}
		if(err) {
			res.status(500).end();
			return;
		}
		if(!result){
			res.status(200).json({success: false, msg: '操作失败!' });
		}else{
			res.status(200).json({success: true, msg: '操作成功!' });
		}
	});
});

router.post('/deleteTask/:jobID', function(req, res) {
	var jobID = req.params.jobID;
	var t = terminate(jobID);
	var remove = alarmSyncJobMap.delete(jobID);
	log.debug('remove job:',jobID,remove);
	if(remove){
		res.status(200).json({success: true, msg: '操作成功!' });
	}else{
		res.status(200).json({success: false, msg: '操作失败!' });
	}
	
});
// jobID,interval,neidSet,syn_task_id
async function getTaskInfo(IDs) {
	var conn = await APP.dbpool_promise.getConnection();
	var result = [];
	for(let i in IDs){
		var sql = "select concat('job', syn_task_id) AS jobID, syn_task_id, task_name, task_period, create_time, execute_time,\
			is_continual_syn, task_expiry_start_time, task_expiry_end_time from alarm_syn_task\
			where task_status <> 3 and syn_task_id = " + IDs[i];//in execution, the task_status must not be 2
		var rows = await conn.query(sql);
		if(rows.length == 0){
			continue;
		}
		result.push(rows[0]);
	}
	await APP.dbpool_promise.releaseConnection(conn);
	var jobID = [];
	var interval = [];
	var neids = [];
	var syn_task_id = [];
	for(let i in result){
		jobID.push(result[i].jobID);
		// var task_period = result[i].task_period;
		interval.push(getInterval(result[i].task_period));
		neids.push(await getNEids(result[i].syn_task_id));
		syn_task_id.push(result[i].syn_task_id);
	}
	var info = {};
	info.jobID = jobID;
	info.interval = interval;
	info.neids = neids;
	info.syn_task_id = syn_task_id;
	return info;
}

router.post('/executeTask', function(req, res) {
	// log.debug('req.body',req.body);
	var IDs = JSON.parse(req.body.IDs);
	// log.debug('****************IDs',IDs);
	var taskInfo;
	(async function(){
		taskInfo = await getTaskInfo(IDs);
		for(let i in taskInfo.jobID){
			await executeTask(taskInfo.jobID[i],taskInfo.interval[i],taskInfo.neids[i],taskInfo.syn_task_id[i]);
		}
	})()
	.catch(function(err) {
		log.error(err);
		return err;
	})
	.then(function(err) {
		if(err){
			res.status(500).json({success: false, msg: '操作失败!' });
		}else{
			res.status(200).json({success: true, msg: '操作成功!' });
		}
	});
	
	/*
	var jobID = req.body.jobID;
	var interval = req.body.interval;
	var neids = JSON.parse(req.body.neids);
	var syn_task_id = req.body.syn_task_id;
	log.debug(jobID,interval,syn_task_id,neids);
	log.debug('neids.length',neids.length);
	executeTask(jobID,interval,neids,syn_task_id);
	*/
		
});

module.exports = router;