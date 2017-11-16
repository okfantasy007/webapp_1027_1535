
var request = require('request');
const util = require('util');

var utilcomm = require('../../routes/resource/util');

function maintainHost() {
	doJob()
	.catch(function(err) {
	    log.error('maintainHost error:', err);
	});
}

async function doJob() {
	let sysMgrSideFail = false;
	let hostsSysMgr = await querySysMgr()
	.catch(function(err) {
		sysMgrSideFail = true;
		log.error('maintainHost query system manager error:', err);
	});

	if(sysMgrSideFail) {
		//sgy：加一个重试机制，比如重试3次，间隔30秒
		for(let i=0; i<3; i++) {
			hostsSysMgr = await new Promise(function (resolve, reject) {
				setTimeout(function () {
					resolve(querySysMgr());
				}, 30000);
			})
			.catch(function (err) {
			    log.error('maintainHost query system manager error:', err);
			});

			if(hostsSysMgr) {
				break;
			}
		}
		
		if(!hostsSysMgr) {
			await Promise.reject('query /sysmng/host failed after 3 times retries');
		}
	}

	let hostsDBArr = await queryDB();
	let hostsDB = new Map();
	for(let oneRow of hostsDBArr) {
		hostsDB.set(oneRow.ipaddress, oneRow.userlabel);
	}

	console.log('hostsSysMgr', hostsSysMgr);
	console.log('hostsDB', hostsDB);

	let add = new Map();
	let modify = new Map();
	for(let [ip, name] of hostsSysMgr) {
		if(hostsDB.has(ip)) {
			if(name != hostsDB.get(ip)) {
				modify.set(ip, name);
			}
		} else {
			add.set(ip, name);
		}
	}

	let remove = [];
	for(let oneRow of hostsDBArr) {
		if(!hostsSysMgr.has(oneRow.ipaddress)) {
			remove.push(oneRow.neid);
		}
	}

	if(add.size > 0) {
		console.log('add host', add);
		for(let [ip, name] of add) {
			await utilcomm.promiseQuery(async function(conn) {
				sql = sprintf("INSERT INTO res_ne (uuid, netypeid, ipaddress, userlabel, \
						poll_enabled, south_protocol, create_time)\
					VALUES ('%s', '%d', '%s', '%s', '0', '0', CURRENT_TIMESTAMP)",
					utilcomm.uuid(), 451, ip, name);
				log.debug("SQL:", sql);
				let rows = await conn.query(sql);

				let neid = rows.insertId;

				let symbol = {
					main_view_id: 1,
					symbol_name1: name,
					symbol_name2: name,
					symbol_name3: name,
					real_res_type_name: 'NE',
					real_res_id: neid,
					res_type_name: 'NE',
					res_id: neid,
					ne_id: neid,
					symbol_style: 1,
					layout: 2,
					expandable: 1,
					lockable: 1,
					topo_type_id: '11_NMS',
					tree_parent_id: 0,
					map_parent_id: 0,
					neparent_id: 0,
					x: Math.floor(Math.random()*50 + 100),
					y: Math.floor(Math.random()*50 + 100)
				};
				log.debug("prepared json: ", JSON.stringify(symbol));

				sql = sprintf("insert into topo_symbol(main_view_id, \
					symbol_name1, symbol_name2, symbol_name3, \
					real_res_type_name, real_res_id, res_type_name, res_id, \
					ne_id, symbol_style, topo_type_id, \
					TREE_PARENT_ID, MAP_PARENT_ID, NE_PARENT_ID, \
					layout, expandable, lockable, \
					x, y) values('%d', \
					'%s', '%s', '%s', \
					'%s', '%s', '%s', '%s', \
					'%d', '%d', '%s', \
					'%d', '%d', '%d', \
					'%d', '%d', '%d', \
					'%d', '%d')",
					symbol.main_view_id,
					symbol.symbol_name1, symbol.symbol_name2, symbol.symbol_name3, 
					symbol.real_res_type_name, symbol.real_res_id, symbol.res_type_name, symbol.res_id, 
					symbol.ne_id, symbol.symbol_style, symbol.topo_type_id, 
					symbol.tree_parent_id, symbol.map_parent_id, symbol.neparent_id, 
					symbol.layout, symbol.expandable, symbol.lockable,
					symbol.x, symbol.y
					);
				log.debug("SQL:", sql);
				rows = await conn.query(sql);
				var symbolid = rows.insertId;
				var hierarchy = ',0,' + symbolid + ',';
				sql = sprintf("update topo_symbol set map_hierarchy='%s' \
					where symbol_id=%d", hierarchy, symbolid);
				log.debug("SQL:", sql);
				rows = await conn.query(sql);
			});
		}
	}

	if(remove.length > 0) {
		console.log('remove host', remove);
		let sql1 = sprintf("delete from topo_symbol where ne_id in (%s)", remove.join(','));
		let sql2 = sprintf("delete from res_ne where neid in (%s)", remove.join(','));
		await utilcomm.promiseSimpleQuery(sql1 + ';' + sql2);
	}

	if(modify.size > 0) {
		console.log('modify host', modify);
		let sqls = [];
		for(let [ip, name] of modify) {
			sqls.push(sprintf("update topo_symbol set symbol_name1='%s', symbol_name2='%s', symbol_name3='%s' \
				where neid = (select neid from res_ne where ipaddress='%s')", name, name, name, ip));
		}

		utilcomm.promiseSimpleQuery(sqls.join(';'))
		.catch(function(err){
			log.error('maintainHost on modify: ', err);		
		});
	}

}

async function queryDB() {
	// 查询类型为NMS的网元
	let sql = "select ipaddress, userlabel, neid from res_ne where netypeid=451";
	let rows = await utilcomm.promiseSimpleQuery(sql);
	return rows;
}

async function querySysMgr() {
	let url = 'http://127.0.0.1:60001/sysmng/host';
	try {
		url = 'http://'+ APP.config.processes.sysmng.host + ':' 
		+ APP.config.processes.sysmng.port + '/sysmng/host';
	} catch(err) {
		console.log(err.message);
	}

	return await util.promisify(request.get)({url: url})
		.then(function(response) {
			if (response.statusCode == 200) {
				let body = JSON.parse(response.body);
				let infoMap = new Map();
				for(let oneHost of body.host) {
					infoMap.set(oneHost.ip, oneHost.host_name);
				}
				return infoMap;
			} else {
				Promise.reject('getHost failed, error code:' + response.statusCode);
			}
		});
}

exports.maintainHost = maintainHost;
