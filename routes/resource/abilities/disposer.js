var async = require('async');
var snmpValueParser = require('./parser');

var dispose = {
	dispose_ne_opticaldevice: dispose_ne_opticaldevice,
	dispose_chassis_opticaldevice: dispose_chassis_opticaldevice,
	dispose_card_optentity: dispose_card_optentity,
	dispose_port_iftable: dispose_port_iftable
}

function dispose_ne_opticaldevice(neid, records) {
	// console.log(neid);
	// console.log(JSON.stringify(records));

	var result = {class: 'ne', info:{
		neid: neid,
		software_ver: records["0"].rcSoftwareVersion,
		hardware_ver: records["0"].rcHardwareVersion
	}};

	return result;
}

async function dispose_chassis_opticaldevice(neid, records) {
	// console.log(neid);
	// console.log(JSON.stringify(records));

	var result = {class: 'chassis', info:[]};

	var sql = sprintf("select ct.chassis_type_id from res_chassis_type ct, res_ne n \
		where ct.netypeid=n.netypeid and n.neid=%d", neid);
	var conn = await APP.dbpool_promise.getConnection();
	var rows = await conn.query(sql);
	await APP.dbpool_promise.releaseConnection(conn);

	for(var instance in records) {
		var chassisid = sprintf("/ne=%d/shelf=%d", neid, instance);
		var oneInfo = {
			neid: neid, 
			chassis_id: chassisid,
			chassis_index: instance,
			chassis_name: records[instance].rcShelfName,
			chassis_fix_name: records[instance].rcShelfName,
			desc_info: records[instance].rcShelfDescr,
			chassis_type_id: rows[0].chassis_type_id
		};
		result.info.push(oneInfo);
	}

	return result;
}

async function dispose_card_optentity(neid, records) {
	// console.log(neid);
	// console.log(JSON.stringify(records));

	var result = {class: 'card', info:[]};

	var typeidInMibs = [];
	for(var instance in records) {
		typeidInMibs.push(records[instance].rcEntPhysicalModuleType);
	}
	var cardTypeCache = await queryCardTypeId(neid, typeidInMibs);

	for(var instance in records) {
		var arr = instance.split(".");
		if(arr.length < 4)
			continue;
		var isLocal = true;
		if(arr[0] > 3){
			isLocal = false;
			// as an example, deal with local card only
			continue;
		}

		var chassisid = sprintf("/ne=%d/shelf=%d", neid, arr[1]);
		var cardid = sprintf("%s/slot=%d", chassisid, arr[2]);
		var oneInfo = {
			neid: neid, 
			card_id: cardid,
			card_fix_name: records[instance].rcEntPhysicalName,
			userlabel: records[instance].rcEntPhysicalName,
			chassis_id: chassisid,
			card_name: records[instance].rcEntPhysicalName,
			card_display_name: records[instance].rcEntPhysicalName,
			card_type_id: cardTypeCache[records[instance].rcEntPhysicalModuleType],
			isexisting: 1,
			hardware_ver: records[instance].rcEntPhysicalHardwareVersion,
			firmware_ver: records[instance].rcEntPhysicalFirmwareVersion,
			index_in_mib: instance,
			type_oid: records[instance].rcEntPhysicalModuleType,
			is_local: 1
		};
		result.info.push(oneInfo);
	}

	return result;
}

async function queryCardTypeId(neid, typeidInMibs) {
	var cond = "'" + typeidInMibs.join("','") + "'";
	var sql = sprintf("select ct.type_oid, ct.card_type_id from res_card_type ct, res_ne n \
		where ct.netypeid=n.netypeid and n.neid=%d and ct.type_oid in (%s)",
		neid, cond);

	var cardTypeCache = {};
	var conn = await APP.dbpool_promise.getConnection();
	var rows = await conn.query(sql);
	for(var i in rows) {
		cardTypeCache[rows[i].type_oid] = rows[i].card_type_id;
	}

	await APP.dbpool_promise.releaseConnection(conn);
	return cardTypeCache;
}

async function dispose_port_iftable(neid, records) {
	// console.log(neid);
	// console.log(JSON.stringify(records));

	var result = {class: 'port', info:[]};
	for(var instance in records) {
		var oneInfo = {
			userlabel: records[instance].ifDescr,
			port_id: getPortID(neid, instance),
			port_fix_name: records[instance].ifDescr,
			card_id: getCardID(neid, instance),
			port_type_id: getPortTypeID(instance),
			port_index: getPortIndex(instance),
			port_name: records[instance].ifDescr,
			index_in_mib: instance,
			neid: neid,
			adminstatus: records[instance].ifAdminStatus,
			operstatus: records[instance].ifOperStatus,
			max_speed: records[instance].ifSpeed
		};
		result.info.push(oneInfo);		
	}

	return result;
}

function getPortIndex(ifindex) {
	return ifindex;
}

function getPortID(neid, ifindex) {
	return getCardID(neid, ifindex)+"/port="+ifindex+"/portType="+getPortTypeID(ifindex);
}

function getPortTypeID(ifindex) {
	return ifindex;
}

function getCardID(neid, ifindex) {
	// as an example, assume shelf=1
	return "/ne="+neid+"/shelf=1/slot=xxx/card=yyy";
}


exports.dispose = dispose;