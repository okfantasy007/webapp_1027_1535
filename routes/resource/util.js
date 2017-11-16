var async = require('async');
var amqp = require('amqplib');
var request = require('request');
var sprintf = require("sprintf-js").sprintf;
const util = require('util');
const uuid = require('uuid/v1');

async function dbTemplate(serve, ...restParam) {
	let conn;
	try {
		conn = await APP.dbpool_promise.getConnection();
	} catch(err) {
		await Promise.reject(err);
	}

	let err;
	let result;
	try {
		result = await serve(conn, restParam);
	} catch(err1) {
		err = err1;
	}

	try {
		APP.dbpool_promise.releaseConnection(conn);
	} catch(err2) {
		log.error('release mysql connection exception, ', err2);
	}

	if(err) {
		await Promise.reject(err);
	} else {
		return result;
	}
}

function dbTemplateSimpleQuery(sql) {
	return dbTemplate(querySql, sql);
}

async function querySql(conn, pArr) {
	let sql = pArr[0];
	log.trace(sql);
	let rows = await conn.query(sql);
	return rows;
}

function sendToQueue(queue, message, hintOK) {
	let amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	return amqp.connect(amqp_url)
	.then(function(conn) {
		return conn.createChannel()
		.then(function(ch) {
			return ch.assertQueue(queue, {durable: false})
			.then(function() {
				ch.sendToQueue(queue, new Buffer(message));
				log.trace(hintOK, message);
				return ch.close();
			});
		})
		.finally(function() { conn.close(); });
	})
}

function sendToQueueBatch(queue, msgobjects, hintOK) {
	let amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	return amqp.connect(amqp_url)
	.then(function(conn) {
		return conn.createChannel()
		.then(function(ch) {
			return ch.assertQueue(queue, {durable: false})
			.then(function() {
				for(let oneObject of msgobjects) {
					oneObject.timestamp = parseInt(Date.now() / 1000);
					let message = JSON.stringify(oneObject);
					ch.sendToQueue(queue, new Buffer(message));
					log.trace(hintOK, message);
				}
				return ch.close();
			});
		})
		.finally(function() { conn.close(); });
	})
}

function getAuthorizedNEinCondition(req) {
	if(!req.session.user) {
		Promise.reject('session user is ' + req.session.user);
	}

	let payload =  JSON.stringify({user: req.session.user});
	let options = {
		url: sprintf('http://127.0.0.1:%d/rest/security/securityManagerCenter/getDomainAllNEIDString',
			req.app.get('port')),
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': payload.length
		},
		body: payload
	};

	return util.promisify(request.post)(options)
	.then(function(response) {
		if(response.statusCode == 200) {
			let resultBody = JSON.parse(response.body);
			if(resultBody.success == true) {
				switch(resultBody.resIds) {
					case 'all':
	                	return '';
                	case 'none':
                		return " and neid = 0 ";
					default:
						return " and neid in (" + resultBody.resIds + ")";
				}
            } else {
            	Promise.reject('getDomainAllNEIDString failed, user name no exist');
            }      
		} else {
			Promise.reject('getDomainAllNEIDString failed, error code:' + response.statusCode);
		}
	})
}

function acquireUUID() {
	return uuid();
}

function logSysOp(session, isOK, operateName, operateObject, operateContent) {
	let msg = {
		account: session.user,
		level: isOK ? 0 : 1,
		type: 0,
		operateName: operateName,
		operateObject: operateObject,
		operateContent: operateContent,
		operateTerminal: session.ip_address,
		result: isOK ? 0 : 1
	};
	let amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);

	return sendToQueue(amqp_url, 'logs_op_queue', JSON.stringify(msg), 'logSysOp')
	.catch(function(err) {
		log.error('logSysOp error', err);
	});
}

exports.promiseQuery = dbTemplate;
exports.promiseSimpleQuery = dbTemplateSimpleQuery;
exports.sendToQueue = sendToQueue;
exports.sendToQueueBatch = sendToQueueBatch;
exports.getAuthorizedNEinCondition = getAuthorizedNEinCondition;
exports.uuid = acquireUUID;
exports.logSysOp = logSysOp;