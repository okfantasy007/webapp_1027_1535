var async = require('async');
var schedule = require("node-schedule");
var sprintf = require('sprintf-js').sprintf;
var request = require('request');
const util = require('util');

var utilcomm = require('../../routes/resource/util');
var nesync = require('../../routes/resource/mq/ne_sync');

const TASK_STATUS_STARTED = 1, TASK_STATUS_STOPPED = 2, TASK_STATUS_INVALID = 3;
const TASK_START_MANUAL = 1, TASK_START_AUTO = 2, TASK_START_DISABLED = 3;
const TASK_PERIOD_DAY = 1, TASK_PERIOD_WEEK = 2;

let taskJobs = new Map();	//任务id - schedule job id
let taskDetails = new Map();	// 任务id - 任务参数
let allNEIDs = [];
let globalEnable = true;	//资源同步服务全局使能设置

function init() {
	utilcomm.promiseQuery(adjustSyncTaskStatus)
	.then(function() {
		return utilcomm.promiseQuery(initGlobalEnable);
	})
	.then(function() {
		return utilcomm.promiseQuery(addSyncTask, sprintf("task_start_type = %d", TASK_START_AUTO));
	})
	.then(function(taskDetailsIn) {
		return scheduleJobs(taskDetailsIn);
	})
	.then(function(taskIds) {
		console.log('auto scheduled res sync taskIds:', taskIds);
		showTaskCache();
		if(taskIds.length > 0) {
			return utilcomm.promiseQuery(updateTaskStatus, taskIds, TASK_STATUS_STARTED);
		}
	}).catch(function(err) {
		log.error(err);
	});
}

function updateTaskStatus(conn, pArr) {
	let taskIds = pArr[0];
	let newStatus = pArr[1];
	let sql = sprintf("update res_syn_task set task_status = %d where syn_task_id in (%s)", 
		newStatus, taskIds.join(','));
	log.debug(sql);
	conn.query(sql);
}

function scheduleJobs(taskDetailsIn) {
	let taskIds = [];
	for(let [taskId, detail] of taskDetailsIn) {
		// console.log(JSON.stringify(detail));
		let hhMM = detail.execute_time.split(':');
		let hh = parseInt(hhMM[0], 10);
		let mm = parseInt(hhMM[1], 10);

		let baseRule;
		if(detail.task_period == TASK_PERIOD_DAY) {
			baseRule = sprintf('0 %d %d * * *', mm, hh);
		}

		if(detail.task_period == TASK_PERIOD_WEEK) {
			let dow = detail.task_period_info.split(',').map(function(day) {
				return parseInt(day, 10) - 1;
			});
			baseRule = sprintf('0 %d %d * * %s', mm, hh, dow.join(','));
		}

		if(!baseRule) {
			log.error('no schedule rule got for sync task(id): ', taskId);
			continue;
		}

		let rule = {rule: baseRule};
		if(detail.is_continual_syn == 0) {
			if(detail.task_expiry_start_time != null) {
				rule.start = new Date(detail.task_expiry_start_time);
			}
			// if(detail.task_expiry_end_time != null) {
			// 	rule.end = new Date(detail.task_expiry_end_time);
			// }
		}
		// console.log('taskId %d rule %s', taskId, JSON.stringify(rule));

		let hOld = taskJobs.get(taskId);
		if(hOld) {
			taskJobs.delete(taskId);
			hOld.cancel();
			log.error('task(id:', taskId, ') may double start');
		}

		let h = schedule.scheduleJob(rule, function() {
			if(!globalEnable) {
				return;
			}

			let detail = taskDetails.get(taskId);
			if(!detail || !detail.neids) {
				log.error('task(id', taskId, ') undefined');
				return;
			}

			if(detail.is_continual_syn == 0) {
				if(detail.task_expiry_end_time != null) {
					if(Date.now() > Date.parse(detail.task_expiry_end_time)){
						h.cancel();
						log.debug('task(id:', taskId, ') stopped schedule for end time expire');
						taskJobs.delete(taskId);
						
						taskDetails.delete(taskId);
						log.debug('task(id:', taskId, ') removed running info for end time expire');

						utilcomm.promiseQuery(updateTaskStatus, [taskId], TASK_STATUS_STOPPED);
						return;
					}
				}
			}

			udpateSyncTaskExecTime(taskId)
			.catch(function(err) {
				log.error('udpateSyncTaskExecTime error, task id', taskId, 'desc:', err);
			})
			.then(function() {
				doSync(detail);
			});
		});

		if(h) {
			log.debug('task id', taskId, 'successfully scheduled with rule', rule);
			taskJobs.set(taskId, h);
			taskIds.push(taskId);
		} else {
			log.error('task id', taskId, 'scheduled failed');
		}
	}

	return taskIds;
}

function udpateSyncTaskExecTime(taskId) {
	let sql = sprintf("update res_syn_task set last_execute_time = current_timestamp where syn_task_id = %d", taskId);
	return utilcomm.promiseSimpleQuery(sql);
}

async function doSync(detail) {
	for(let neid of detail.neids) {
		await nesync.startNESyncTask(neid)
		.then(function() {
			log.trace(sprintf('ressync task doSync, post res sync ne %d ok', neid));
		})
		.catch(function(err) {
			log.error(sprintf('ressync task doSync, post res sync ne %d failed, %s', neid, err));
		});
	}
}

async function addSyncTask(conn, pArr) {
	// 筛选出所有 task_status不为3（失效）的任务
	let sql = "select syn_task_id, task_period, task_period_info, execute_time, \
	is_continual_syn, task_expiry_start_time, task_expiry_end_time from res_syn_task where task_status != " 
	+ TASK_STATUS_INVALID;

	if(pArr) {
		for(let condition of pArr) {
			sql += ' and ' + condition;
		}
	}
	
	let rows1 = await conn.query(sql);
	log.debug(sql);
	if(rows1.length == 0) {
		log.error('addSyncTask, no task to add');
		return taskDetails;
	}

	for(let oneRow of rows1) {
		let oneTaskID = oneRow.syn_task_id;

		let taskids = await getTaskNEIDs(conn, oneTaskID);
		oneRow.neids = [...taskids];
		taskDetails.set(oneTaskID, oneRow);
		// console.log('oneTaskID', oneTaskID, 'oneRow', oneRow);
	}

	return taskDetails;
}

async function getTaskNEIDs(conn, syn_task_id){
	
	var completeSetSql = "SELECT symbol_id FROM res_syn_task_area WHERE res_type_name = 'TOPO_SUBNET' AND (category = '1' OR category is NULL) AND syn_task_id = " + syn_task_id;
	var completeSetRows = await conn.query(completeSetSql);
	var completeSetArray = [];
	for (var i in completeSetRows) {
		completeSetArray.push(completeSetRows[i].symbol_id);
	}

	var fullSubnetSql = "SELECT symbol_id FROM topo_symbol WHERE res_type_name = 'TOPO_SUBNET' AND map_hierarchy LIKE '%,";
	fullSubnetSql += completeSetArray.join(",%' OR map_hierarchy LIKE '%,");
	fullSubnetSql = fullSubnetSql + ",%'";
	var fullSubnetRows = await conn.query(fullSubnetSql);
	var fullSubnetArray = [];
	for (var i in fullSubnetRows) {
		fullSubnetArray.push(fullSubnetRows[i].symbol_id);
	}
	
	var subsetSql = "SELECT symbol_id FROM res_syn_task_area WHERE res_type_name = 'TOPO_SUBNET' AND category = '2' AND syn_task_id = " + syn_task_id;
	var subsetRows = await conn.query(subsetSql);
	var subsetArray = [];
	for (var i in subsetRows) {
		subsetArray.push(subsetRows[i].symbol_id);
	}
	var subsetStr = subsetArray.join();
	subsetStr = "," + subsetStr + ",";
	fullSubnetArray = fullSubnetArray.filter(element=>subsetStr.indexOf(","+element+",")==-1);
	
	var fullSubnetNeSql = "SELECT ne_id FROM topo_symbol WHERE res_type_name = 'NE' AND map_hierarchy LIKE '%,";
	fullSubnetNeSql += fullSubnetArray.join(",%' OR map_hierarchy LIKE '%,");
	fullSubnetNeSql = fullSubnetNeSql + ",%'";
	var fullSubnetNeRows = await conn.query(fullSubnetNeSql);

	var neidSet = new Set();
	for (var i in fullSubnetNeRows) {
		// console.log('+', fullSubnetNeRows[i].ne_id);
		neidSet.add(fullSubnetNeRows[i].ne_id + '');
	}
	
	var areaNeSql = "SELECT res_id FROM res_syn_task_area WHERE res_type_name = 'NE' and syn_task_id = " + syn_task_id;
	var areaNeRows = await conn.query(areaNeSql);
	for (var i in areaNeRows) {
		// console.log('+', areaNeRows[i].res_id);
		neidSet.add(areaNeRows[i].res_id);
	}

	neidSet.delete('null');
	// console.log('neidSet', neidSet);
	return neidSet;
}

async function initGlobalEnable(conn) {
	let sql = "select property_value from sys_properties \
	where group_name='sync' and property_name='res_sync_service_status'";
	let rows = await conn.query(sql);
	if(rows[0].property_value == 0) {
		globalEnable = false;
	}
}

function updateGlobalEnable() {
	let sql = "select property_value from sys_properties \
	where group_name='sync' and property_name='res_sync_service_status'";
	return utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		if(rows[0].property_value == 0) {
			globalEnable = false;
		} else {
			globalEnable = true;
		}
	})
	.catch(function(err) {
		log.error(err);
	});
}

async function adjustSyncTaskStatus(conn) {
	// 设置task_start_type为（1 手动，3 已禁用）任务的task_status为（2 已停止）
	// 设置is_continual_syn为（0 否）、task_expiry_end_time小于当前时间任务的task_status为（3 失效）
	let sql = "update res_syn_task set task_status = 2 where task_start_type in (1, 3);\
	update res_syn_task set task_status = 3 where is_continual_syn = 0 and \
	unix_timestamp(task_expiry_end_time)<unix_timestamp()";
	await conn.query(sql);
}

function startSyncTask(taskIds) {
	log.debug('try to startSyncTask task(id:', taskIds, ')');

	return utilcomm.promiseQuery(addSyncTask, sprintf("syn_task_id in (%s)", taskIds))
	.then(function(taskDetailsIn) {
		return scheduleJobs(taskDetailsIn);
	})
	.then(function(taskIds) {
		log.debug('manually started res sync taskIds:', taskIds);
		if(taskIds.length > 0) {
			return utilcomm.promiseQuery(updateTaskStatus, taskIds, TASK_STATUS_STARTED);
		}
		showTaskCache();
	})
}

function showTaskCache() {
	console.log('current taskDetails:');
	for(let [taskId, detail] of taskDetails) {
		console.log(taskId, detail);
	}

	console.log('current taskJobs:');
	for(let [taskId, job] of taskJobs) {
		console.log(taskId, job);
	}
}

function stopSyncTask(taskIds) {
	log.debug('try to stopSyncTask task(id:', taskIds, ')');

	let taskIdsArr = taskIds.split(',');
	taskIdsArr.forEach(function(taskIdIn) {
		let taskId = parseInt(taskIdIn);
		if(isNaN(taskId)) {
			log.error('ressync.stopSyncTask failed on taskId', taskIdIn, ', it is NaN');
			return;
		}

		let h = taskJobs.get(taskId);
		if(h) {
			taskJobs.delete(taskId);
			h.cancel();
			log.debug('task(id:', taskId, ') cancelled schedule');
		} else {
			log.error('task(id:', taskId, ') daydream to cancel schedule');
		}
	});

	log.debug('manually stopped res sync taskIds:', taskIds);
	showTaskCache();
	return utilcomm.promiseQuery(updateTaskStatus, taskIdsArr, TASK_STATUS_STOPPED);
}

function executeSyncTaskOneTimeImmediately(taskIds) {
	log.debug('execTaskNowOnce task(id:', taskIds, ')');

	taskIds.split(',').forEach(function(taskIdIn) {
		let taskId = parseInt(taskIdIn);
		if(isNaN(taskId)) {
			log.error('ressync.executeSyncTaskOneTimeImmediately failed on taskId', taskIdIn, ', it is NaN');
			return;
		}

		let detail = taskDetails.get(taskId);
		if(!detail || !detail.neids) {
			log.error('task(id', taskId, ') undefined');
			return;
		}

		udpateSyncTaskExecTime(taskId)
		.catch(function(err) {
			log.error('udpateSyncTaskExecTime error, task id', taskId, 'desc:', err);
		})
		.then(function() {
			doSync(detail);
		});
	});
}

exports.init = init;
exports.startSyncTask = startSyncTask;
exports.stopSyncTask = stopSyncTask;
exports.executeSyncTaskOneTimeImmediately = executeSyncTaskOneTimeImmediately;
exports.updateGlobalEnable = updateGlobalEnable;