var async = require('async');

var filterType = 'discard';
var filterRules = [];

async function getFilterType() {
	var conn = await APP.dbpool_promise.getConnection();
	var property_value = 'discard';
	try {
		var sql = "SELECT property_value from sys_properties \
			where group_name='res_discovery' and PROPERTY_NAME='filter_type'";
		var rows = await conn.query(sql);

		if(rows.length == 0) {
			conn.query(sprintf("insert into sys_properties(group_name, property_name, property_value) \
				values('res_discovery', 'filter_type', '%s')", property_value));
		} else {
			property_value = rows[0].property_value; 
		}
	} catch(err) {
		await APP.dbpool_promise.releaseConnection(conn);
		await Promise.reject(err);
	}
	await APP.dbpool_promise.releaseConnection(conn);

	return property_value;
}

async function updateFilterType() {
	filterType = await getFilterType();
}

function getCachedFilterType() {
	return filterType;
}

async function getAllRules() {
	var conn = await APP.dbpool_promise.getConnection();
	var rows;
	try {
		var sql='select f.FILTER_ID, t.netypename as NETYPE_NAME, f.SW_VERSION, f.HW_VERSION, f.HW_PREFIX \
			from res_discovery_filter f, res_ne_type t \
			where f.NETYPE_ID=t.netypeid';
		rows = await conn.query(sql);
	} catch(err) {
		await APP.dbpool_promise.releaseConnection(conn);
		await Promise.reject(err);
	}
	await APP.dbpool_promise.releaseConnection(conn);

	return rows;
}

async function updateAllRules() {
	filterRules = await getAllRules();
}

function getCachedAllRules() {
	return filterRules;
}

async function modifyFilterType(filterType) {
	var conn = await APP.dbpool_promise.getConnection();
	try {
		var sql = sprintf("update sys_properties set PROPERTY_VALUE='%s' \
			where group_name='res_discovery' and PROPERTY_NAME='filter_type'", filterType);
		await conn.query(sql);
	} catch(err) {
		await APP.dbpool_promise.releaseConnection(conn);
		await Promise.reject(err);
	}
	await APP.dbpool_promise.releaseConnection(conn);
}

exports.getFilterType = getFilterType;
exports.updateFilterType = updateFilterType;
exports.getCachedFilterType = getCachedFilterType;

exports.getAllRules = getAllRules;
exports.updateAllRules = updateAllRules;
exports.getCachedAllRules = getCachedAllRules;

exports.modifyFilterType = modifyFilterType;
