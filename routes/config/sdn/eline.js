var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var path = require('path');
var username = 'admin';
var password = 'admin';
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

var IPv4 = 'http://' +  APP.sdn_rest.host + ':' + APP.sdn_rest.port;

//根据分页参数返回数据
function getDataByPage(params, data) {
	var len = data.length;
	var count = Math.ceil(len / params.limit);

	if (params.page < count) {
		return data.slice(params.start, params.page * params.limit);
	} else if (params.page == count) {
		return data.slice(params.start);
	}
}

//根据过滤参数返回过滤
function filterData(params, data) {
	var newData = data.filter(function(element, index, array) {
		var flag = true;

		for (var name in params) {
			if (name == "eline-vlan") {
				if (element["ingress-node-vlan"].toString().indexOf(params[name].toString()) == -1 && element["egress-node-vlan"].toString().indexOf(params[name].toString()) == -1) {
					flag = false;
					// 查询字段有一个不满足时即跳出循环
					break;
				}
			} else {
				if (element[name].toString().indexOf(params[name].toString()) == -1) {
					flag = false;
					// 查询字段有一个不满足时即跳出循环
					break;
				}
			}
		}
		return flag;
	});

	return newData;
}

function formatDetailData(eline) {
	if (eline) {
		if (eline['egress-end-points']) {
			for (var index in eline['egress-end-points']) {
				eline['egress-end-points'][index]['type'] = 'egress';
				delete eline['egress-end-points'][index].id;
			}
		}

		if (eline['egress-end-points']) {
			for (var index in eline['ingress-end-points']) {
				eline['ingress-end-points'][index]['type'] = 'ingress';
				delete eline['ingress-end-points'][index].id;
			}
		}
	}

	return eline;
}

//获取所有eline列表的路由
router.get('/list', function(req, res, next) {
	var options = {
		url: IPv4 + '/restconf/operational/raisecom-eline:service',
		headers: {
			'authorization': _auth
		}
	};

	request.get(options, function(err, response, data) {

		if (!err && response.statusCode == 200 && data) {
			data = JSON.parse(data);
			var responseObj = {
				success: true
			};
			var query = {
				page: req.query.page,
				limit: req.query.limit,
				start: req.query.start
			};

			var count = 0;
			var aPageEline;

			if (data.service && data.service.eline) {
				var aElines = data.service.eline;
				var aNewElines = [];
				var params = req.query;

				delete params['_dc'];
				delete params['page'];
				delete params['limit'];
				delete params['start'];

				aElines.forEach(function(eline) {
					var oEline = {
						'id': eline.id,
						'user-label': eline['user-label'],
						'operate-status': eline['operate-status'],
						'ingress-node': [],
						'ingress-node-ltp': [],
						'ingress-node-vlan': [],
						'egress-node': [],
						'egress-node-ltp': [],
						'egress-node-vlan': [],
						'name': eline['name'],
						'admin-status': eline['admin-status'],
						'vlan': ''
					};

					eline['ingress-end-points'].forEach(function(ingressNode) {
						oEline['ingress-node'].push(ingressNode['ne-id']);
						oEline['ingress-node-ltp'].push(ingressNode['ltp-id']);
						oEline['ingress-node-vlan'].push(ingressNode['dot1q-vlan-bitmap']);
					});

					eline['egress-end-points'].forEach(function(egressNode) {
						oEline['egress-node'].push(egressNode['ne-id']);
						oEline['egress-node-ltp'].push(egressNode['ltp-id']);
						oEline['egress-node-vlan'].push(egressNode['dot1q-vlan-bitmap']);
					});

					oEline['ingress-node'] = oEline['ingress-node'].join('<br/>');
					oEline['ingress-node-ltp'] = oEline['ingress-node-ltp'].join('<br/>');
					oEline['ingress-node-vlan'] = oEline['ingress-node-vlan'].join('<br/>');
					oEline['egress-node'] = oEline['egress-node'].join('<br/>');
					oEline['egress-node-ltp'] = oEline['egress-node-ltp'].join('<br/>');
					oEline['egress-node-vlan'] = oEline['egress-node-vlan'].join('<br/>');

					aNewElines.push(oEline);
				});

				var filterElines = filterData(params, aNewElines);
				aPageEline = getDataByPage(query, filterElines);
				count = filterElines.length;
			}

			responseObj.totalCount = count;
			responseObj.data = aPageEline ? aPageEline : [];

			res.status(200).json(responseObj);
		}else{
			if (!response) {
				res.status(400).json({
					totalCount: 0,
					data: []
				});
			} else {
				res.status(response.statusCode).json({
					totalCount: 0,
					data: []
				});
			}
		}
	});
});

//获取特定eline的数据路由
router.get('/specificeline/:elineId', function(req, res, next) {
	var sElineId = req.params.elineId;
	var options = {
		url: IPv4 + '/restconf/operational/raisecom-eline:service/eline/' + sElineId,
		headers: {
			'authorization': _auth
		}
	};
	request.get(options, function(err, response, data) {
		// console.log(data);
		if (!err && response.statusCode == 200) {
			if (data) {
				data = JSON.parse(data);
				var responseObj = {
					success: true
				};

				if (data.eline[0]) {
					var eline = formatDetailData(data.eline[0]);

					responseObj.data = eline;
					res.json(200, responseObj);
				}
			}
		} else {
			res.status(response.statusCode).json({
				success: false,
				data: []
			});
		}
	});
});

//删除特定eline路由
router.post('/remove', function(req, res, next) {
	var sElineId = req.body.elineId;
	var body = {
		input: {
			id: sElineId
		}
	};
	var options = {
		url: IPv4 + '/restconf/operations/raisecom-eline:delete-snc-eline',
		headers: {
			'authorization': _auth,
			'Content-Type': 'application/json',
			'Content-Length': JSON.stringify(body).length
		},
		body: JSON.stringify(body)
	};

	request.post(options, function(err, response, data) {
		if (!err && response.statusCode == 200) {
			if (data) {
				data = JSON.parse(data);
				if(data['output'] && data['output']['error-code'] == "200"){
					res.status(200).json({
						success: true
					});
				}else{
					res.status(400).json({
						success: false
					});
				}
			} else {
				res.status(400).json({
					success: false
				});
			}
		} else {
			res.status(response.statusCode).json({
				success: false
			});
		}
	});
});

//创建eline路由
/*router.post('/create', function(req, res, next) {
	// var input = req.body.input;
	// input = JSON.parse(input);
	// var body = {
	// 	input: input
	// };
	var body = req.body;
	var options = {
		url: IPv4 + '/restconf/operations/raisecom-eline:create-snc-eline',
		headers: {
			'authorization': _auth,
			'Content-Type': 'application/json;charset=UTF-8',
			'Content-Length': Buffer.byteLength(JSON.stringify(body), 'utf8')
		},
		body: JSON.stringify(body)
	};

	request.post(options, function(err, response, data) {
		if (!err && response.statusCode == 200) {
			var data = JSON.parse(data);
			if (data && data['output'] && data['output']['error']) {
				if (data.output['error'][0] && data.output['error'][0]['error-code'] == "200") {
					res.status(200).json({
						success: true
					});
				} else {
					var error = [];
					if (data['output']['error']) {
						error = data['output']['error'];
					}
					res.status(400).json({
						success: false,
						error: error
					});
				}
			} else {
				res.status(400).json({
					success: false,
					error: 'unkonwn'
				});
			}
		} else {
			if (!response) {
				res.status(400).json({
					success: false,
					error: 'sdn controller unfound'
				});
			} else {
				var data = JSON.parse(data);
				//以下情况对应控制器起来了，但是没有安装业务模块服务，这种情况参数中没有error-code
				if(data && data['errors'] && data['errors']['error'] && data['errors']['error'][0]){
					res.status(response.statusCode).json({
						success: false,
						error: [{
							'error-code': 'N/A',
							'error-message': data['errors']['error'][0]['error-message']
						}]
					});
				}else{
					res.status(response.statusCode).json({
						success: false,
						error: 'unkonwn'
					});
				}

			}

		}
	});
});*/

router.post('/create', function(req, res, next) {

	var body = req.body;
	var options = {
		url: IPv4 + '/restconf/operations/raisecom-eline:create-snc-eline',
		headers: {
			'authorization': _auth,
			'Content-Type': 'application/json;charset=UTF-8',
			'Content-Length': Buffer.byteLength(JSON.stringify(body), 'utf8')
		},
		body: JSON.stringify(body)
	};

	request.post(options, function(err, response, data) {
		if (!err && response.statusCode == 200) {
			var data = JSON.parse(data);
			if (data && data['output'] && data['output']['error-code']) {
				if (data['output']['error-code'] == "200") {
					res.status(200).json({
						success: true
					});
				} else {
					var error = [];
					if (data['output']['error-message']) {
						error = JSON.parse(data['output']['error-message']);
					}
					res.status(400).json({
						success: false,
						error: error
					});
				}
			} else {
				res.status(400).json({
					success: false,
					error: 'unkonwn'
				});
			}
		} else {
			if (!response) {
				//控制器没有起来，response为空
				res.status(400).json({
					success: false,
					error: 'sdn controller unfound'
				});
			} else {
				var data = JSON.parse(data);
				//以下情况对应控制器起来了，但是没有安装业务模块服务，这种情况参数中没有error-code
				if(data && data['errors'] && data['errors']['error'] && data['errors']['error'][0]){
					res.status(response.statusCode).json({
						success: false,
						error: [{
							'errorCode': 'N/A',
							'errorMessage': data['errors']['error'][0]['error-message']
						}]
					});
				}else{
					res.status(response.statusCode).json({
						success: false,
						error: 'unkonwn'
					});
				}

			}

		}
	});
});

//强制保护
router.post('/forcedprotection', function(req, res, next) {
	var body = {
		input: {
			'eline-id': req.body['eline-id'],
			'psCommand': req.body['psCommand']
		}
	};
	var options = {
		url: IPv4 + '/restconf/operations/raisecom-eline:forced-protection',
		headers: {
			'authorization': _auth,
			'Content-Type': 'application/json',
			'Content-Length': JSON.stringify(body).length
		},
		body: JSON.stringify(body)
	};

	request.post(options, function(err, response, data) {
		var responseObj = {
			success: false,
			msg: '失败！'
		};
		if (!err && response.statusCode == 200) {
			if (data) {
				data = JSON.parse(data);

				if (data.output["result"]) {
					responseObj.success = true;
				}
			}
			res.json(200, responseObj);
		} else {
			responseObj.msg = data.data.errors.error[0]['error-message'];
			responseObj.success = false;
			res.json(response.statusCode, responseObj);
		}


	});
});

//qos操作 添加、修改、删除
router.post('/qos_operation/:type', function(req, res, next) {
	var type = req.params.type;
	// var input = req.body.input;
	// input = JSON.parse(input);
	// var body = {
	// 	input: input
	// };
	var body = req.body;

	var headers = {
		'content-type': "application/json",
		'content-length': JSON.stringify(body).length,
		'authorization': _auth
	};

	var options = {
		url: IPv4 + '/restconf/operations/raisecom-eline:' + (type == 'del' ? 'del' : 'update') + '-qos',
		method: 'POST',
		body: JSON.stringify(body),
		headers: headers
	};

	request(options, function(error, response, data) {
		if (!error && response.statusCode == 200) {
			// console.log("data", data);
			res.status(200).json({
				success: true
			});
		} else {
			res.status(response.statusCode).json({
				success: false
			});
		}
	});
	console.log("--------------------------qos_operation-------------------------");
});

//发送lm、dm请求
router.post('/send_lm_dm/:type/:operation', function(req, res, next) {
	var type = req.params.type;
	var operation = req.params.operation;
	// var input = req.body.input;
	// input = JSON.parse(input);
	// var body = {
	// 	input: input
	// };
	var body = req.body;

	var headers = {
		'content-type': "application/json",
		'content-length': JSON.stringify(body).length,
		'authorization': _auth
	};

	var options = {
		url: IPv4 + '/restconf/operations/sal-netconf:' + type + '-' + operation,
		method: 'POST',
		body: JSON.stringify(body),
		headers: headers
	};

	request(options, function(error, response, data) {
		if (!error && response.statusCode == 200) {
			// console.log("data", data);
			data = JSON.parse(data);
			if (data && data['output'] && data['output']['result']) {
				res.status(200).json({
					success: true
				});
			} else {
				res.status(400).json({
					success: false,
					error: 'unknown'
				});
			}
		} else {
			data = JSON.parse(data);
			if (data && data['errors'] && data['errors']['error']) {
				res.status(response.statusCode).json({
					success: false,
					error: data['errors']['error']
				});
			}else{
				res.status(response.statusCode).json({
					success: false,
					error: 'unknown'
				});
			}

		}
	});
	console.log("--------------------------send_lm_dm-------------------------");
});

//lm、dm性能采集任务操作 添加性能采集任务、删除性能采集任务
router.post('/lm_dm_pm_task/:operation', function(req, res, next) {
	var operation = req.params.operation;
	// var input = req.body.input;
	// input = JSON.parse(input);
	// var body = {
	// 	input: input
	// };
	var body = req.body;

	var headers = {
		'content-type': "application/json",
		'content-length': JSON.stringify(body).length,
		'authorization': _auth
	};

	var options = {
		url: IPv4 + '/restconf/operations/pm-task:' + operation + '-pm-business-task',
		method: 'POST',
		body: JSON.stringify(body),
		headers: headers
	};

	request(options, function(error, response, data) {
		if (!error && response.statusCode == 200) {
			// console.log("data", data);
			res.status(200).json({
				success: true
			});
		} else {
			data = JSON.parse(data);
			if (data && data['errors'] && data['errors']['error']) {
				res.status(response.statusCode).json({
					success: false,
					error: data['errors']['error']
				});
			}else{
				res.status(response.statusCode).json({
					success: false,
					error: 'unknown'
				});
			}

		}
	});
	console.log("--------------------------send_lm_dm-------------------------");
});

//获取特定tunnel meg-id的路由
router.get('/get_tunnel_meg_id/:tunnelId', function(req, res, next) {
	var tunnelId = req.params.tunnelId;
	var options = {
		url: IPv4 + '/restconf/operational/raisecom-tunnel:service',
		headers: {
			'authorization': _auth
		}
	};

	request.get(options, function(err, response, data) {
		// console.log(data);
		if (!err && response.statusCode == 200) {
			data = JSON.parse(data);
			if (data && data['service'] && data['service']['tunnel'] && data['service']['tunnel'].length > 0) {
				var tunnel = data['service']['tunnel'].filter(function(ele){
					return ele.id == tunnelId;
				});
				if(tunnel['lsp'] && tunnel['lsp'][0] && tunnel['lsp'][0]['oam'] && tunnel['lsp'][0]['oam']['meg-id']){
					res.send(200, tunnel['lsp'][0]['oam']['meg-id']);
				}else{
					res.send(400);
				}
			}else{
				res.send(400);
			}
		}else{
			res.send(response.statusCode);
		}
	});
});

//lb操作 开始、停止、删除
router.post('/lb/:operation', function(req, res, next) {
	var operation = req.params.operation;
	// var input = req.body.input;
	// input = JSON.parse(input);
	// var body = {
	// 	input: input
	// };
	var body = req.body;

	var headers = {
		'content-type': "application/json",
		'content-length': JSON.stringify(body).length,
		'authorization': _auth
	};

	var options = {
		url: IPv4 + '/restconf/operations/sal-netconf:lb-' + operation,
		method: 'POST',
		body: JSON.stringify(body),
		headers: headers
	};

	request(options, function(error, response, data) {
		if (!error && response.statusCode == 200) {
			// console.log("data", data);
			data = JSON.parse(data);
			if (data && data['output'] && data['output']['result'] == true) {
				if(data['output']['lb-id'] !== undefined){
					res.status(200).json({
						success: true,
						'lb-id': data['output']['lb-id']
					});
				}else{
					res.status(400).json({
						success: false
					});
				}

			} else {
				res.status(400).json({
					success: false
				});
			}
		} else {
			res.status(response.statusCode).json({
				success: false
			});
		}
	});
	console.log("--------------------------lb-------------------------");
});

//获取lb结果
router.post('/get_lb_result', function(req, res, next) {
	// var input = req.body.input;
	// input = JSON.parse(input);
	// var body = {
	// 	input: input
	// };
	var body = req.body;

	var headers = {
		'content-type': "application/json",
		'content-length': JSON.stringify(body).length,
		'authorization': _auth
	};

	var options = {
		url: IPv4 + '/restconf/operations/sal-netconf:lb-status',
		method: 'POST',
		body: JSON.stringify(body),
		headers: headers
	};

	request(options, function(error, response, data) {
		if (!error && response.statusCode == 200) {
			// console.log("data", data);
			data = JSON.parse(data);
			if (data && data['output'] && data['output']['result']) {
				res.status(200).json({
					success: true,
					data: data['output']
				});
			} else {
				res.status(400).json({
					success: false
				});
			}
		} else {
			res.status(response.statusCode).json({
				success: false
			});
		}
	});
	console.log("--------------------------send_lm_dm-------------------------");
});

router.get('/get_ws_ip', function(req, res, next) {
	var path = __dirname + "/../../../../../../conf/global_config.json";
	// var path = __dirname + "/../../../../../sdn/global_config.json";
	var result = JSON.parse(fs.readFileSync(path));

	if(result && result.container){
		result.container.controllerIPPort = result.container.ip + ':' + result.container.port;
	}
	res.status(200).json(result.container);
	console.log("--------------------------get_ws_ip-------------------------");
});

router.get('/getcontrollerinfo', function(req, res, next) {
	var path = __dirname + "/../../../../../../conf/global_config.json";
	var result = JSON.parse(fs.readFileSync(path));

	var responseObj= {
		success:true,
		data: []
	};

	if(result && result.container){
		result.container.controllerIPPort = result.container.ip + ':' + result.container.port;
	}

	responseObj.data = [result.container];

	res.status(200).json(responseObj);
	console.log("--------------------------getcontrollerinfo-------------------------", responseObj);
});

module.exports = router;
