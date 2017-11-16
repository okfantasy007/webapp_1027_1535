var schedule = require("node-schedule");
var sprintf = require('sprintf-js').sprintf;
var alarmSyncJobMap = new Map();
var init = function() {
	log.debug('alarm synchronization------------- 进入告警同步');
	initAutoAlarmSync();
}

async function initAutoAlarmSync() {
	var conn = await APP.dbpool_promise.getConnection();
	var sql = "select concat('job', syn_task_id) AS jobID, syn_task_id, task_name, task_period, create_time, execute_time,\
		is_continual_syn, task_expiry_start_time, task_expiry_end_time from alarm_syn_task\
		where task_type = 2 and task_start_type = 2 and task_status = 1 ORDER BY syn_task_id";
	var rows = await conn.query(sql);
	for(var i in rows) {
		startTask(rows[i]);
	}
	// startTask(rows[1]);
	await APP.dbpool_promise.releaseConnection(conn);
}

function startTask(taskInfo){
	var jobID = taskInfo.jobID;
	var task_name = taskInfo.task_name;
	var syn_task_id = taskInfo.syn_task_id;
	var task_period = taskInfo.task_period;
	var create_time = taskInfo.create_time;
	var org_execute_time = taskInfo.execute_time;
	var d =  new Date(Date.now());
	var execute_time = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() + ' ' + org_execute_time;
	if(new Date(execute_time).toLocaleTimeString()<d.toLocaleTimeString()){
		d =  new Date(Date.now()+24*60*60*1000);
		execute_time = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() + ' ' + org_execute_time;
	}
	log.debug('alarm synchronization------------- start task:',task_name);
	var is_continual_syn = taskInfo.is_continual_syn;
	if(is_continual_syn==1){
		creatContinualJob(jobID,syn_task_id,task_period,execute_time);
	}
}

function creatContinualJob(jobID,syn_task_id,task_period,execute_time){
	var interval = getInterval(task_period);
	makeSchedule(jobID,syn_task_id,interval,execute_time);
}

function getInterval(task_period){
	if(task_period==1){//每天
		return 24 * 60 * 60 * 1000;
	}
	if(task_period==4){//每2小时
		return 2 * 60 * 60 * 1000;
	}
	if(task_period==5){//每4小时
		return 4 * 60 * 60 * 1000;
	}
	if(task_period==6){//每6小时
		return 6 * 60 * 60 * 1000;
	}
	if(task_period==7){//每8小时
		return 8 * 60 * 60 * 1000;
	}
}

async function getNEids(syn_task_id){
	var conn = await APP.dbpool_promise.getConnection();
	var completeSetSql = "SELECT symbol_id FROM alarm_syn_task_area WHERE res_type_name = 'TOPO_SUBNET' AND (category = '1' OR category is NULL) AND syn_task_id = " + syn_task_id;
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
	var subsetSql = "SELECT symbol_id FROM alarm_syn_task_area WHERE res_type_name = 'TOPO_SUBNET' AND category = '2' AND syn_task_id = " + syn_task_id;
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
		neidSet.add(fullSubnetNeRows[i].ne_id + '');
	}
	var areaNeSql = "SELECT res_id FROM alarm_syn_task_area WHERE res_type_name = 'NE' and syn_task_id = " + syn_task_id;
	var areaNeRows = await conn.query(areaNeSql);
	for (var i in areaNeRows) {
		neidSet.add(areaNeRows[i].res_id);
	}
	await APP.dbpool_promise.releaseConnection(conn);
	neidSet.delete(null);
	return neidSet;
}

async function makeSchedule(jobID,syn_task_id,interval,execute_time){
	var neidSet = await getNEids(syn_task_id);
	var date = new Date(execute_time);
	var schedulejob = schedule.scheduleJob(date, function(){
			log.debug('alarm synchronization------------- jobID:',jobID);
			// log.debug('alarm synchronization------------- neidSet:',neidSet);
  			executeTask(jobID,interval,neidSet,syn_task_id);
		});
	alarmSyncJobMap.set(jobID,schedulejob);
}

async function executeTask(jobID,interval,neidSet,syn_task_id){
	log.debug("alarm synchronization------------- executing job:",jobID);
	var job = alarmSyncJobMap.get(jobID);
	var now = Date.now();
	var	nextTime = new Date( now + interval);
	if(job){
		// var nextTime = new Date( now + 5000);
		var reschedule = job.reschedule(nextTime);
	}
	let neids = [];
	for (let item of neidSet){
		// log.debug("alarm synchronization------------- 同步网元，网元id:",item);
		//同步每个网元前要判断是否支持告警同步
		//同步完成后将同步是否成功入库到同步监控的表格
		neids.push(item);
	}
	log.debug("alarm synchronization------------- 同步网元:",neids);
	// for(var i in neidSet){
	// 	// log.debug("alarm synchronization------------- 同步网元:",neids[i]);
	// 	//同步每个网元
	// 	//同步完成后将同步是否成功入库到同步监控的表格
	// }
	
	var nextTimeStr = nextTime.toLocaleTimeString();
	var lastTime = new Date(now);
	var lastTimeStr = lastTime.getFullYear() + '-' + (lastTime.getMonth()+1) + '-' + lastTime.getDate() + ' ' + lastTime.toLocaleTimeString();
	var conn = await APP.dbpool_promise.getConnection();
	var sql = sprintf("UPDATE alarm_syn_task SET last_execute_time = '%s', execute_time = '%s' WHERE syn_task_id = '%s'",lastTimeStr,nextTimeStr,syn_task_id);
	var rows = await conn.query(sql);
	await APP.dbpool_promise.releaseConnection(conn);
}

exports.init = init;
exports.alarmSyncJobMap = alarmSyncJobMap;
exports.executeTask = executeTask;
exports.getInterval = getInterval;
exports.startTask = startTask;
exports.getNEids = getNEids;
