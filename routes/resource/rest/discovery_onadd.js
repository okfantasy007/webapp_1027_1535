var express = require('express');
var router = express.Router();
var async = require('async');
var amqp = require('amqplib/callback_api');
var utilcomm = require('../util');

router.post('/detect', function(req, res) {
	console.log('discovery_onadd /detect', req.body.hostname);

	let task = {
		poll_type: 'discovery_onadd',
		hostname: req.body.hostname,
		timestamp: parseInt(Date.now() / 1000),
		queueName : 'check_netype'
	};

	let template = {
		name: 'snmpv2_hardcoded',
		type: 'SNMP',
		config: {
			port: 161,
			retries: 1,
			timeout: 5,
			version: 2,
			community_read: 'public',
			community_write: 'private'
		}
	};
	task.polling_templates = [template];

	task.node_abilities = [];
	let protocols = ['ICMP', 'SNMP'];

	for (let protocol of protocols) {
		let abilities;
		switch (protocol) {
		case 'ICMP':
			abilities = {
	            name: "icmpPing",
	            call_type: "static",
			};
			break;
		case 'SNMP':
			abilities = {
	            name: "snmpMib2System",
	            call_type: "static",
			};
			break;
		case 'NETCONF':
			abilities = {
	            name: "netconfDiscovery",
	            call_type: "static",
			};
		}
	    abilities.protocol = protocol,
		task.node_abilities.push(abilities)
	}

	//建立一个RabbitMQ amqp链接
	//接收消息   
	amqp_url = sprintf("amqp://%s:%d", req.app.locals.amqp_host, req.app.locals.amqp_port);
	console.log(amqp_url+"接收消息");
	amqp.connect(amqp_url, function(err, mq_conn) {
		mq_conn.createChannel(function(err, mq_ch) {
		var queueName = 'check_netype';
    	mq_ch.assertQueue(queueName, {durable: false});
    	var timer = setTimeout(function() { 
    		mq_ch.close( function() {
	    	 console.log("################ channel closed timer ###############");
				mq_conn.close( function() {
			    	 console.log("################ connection closed timer ###############");
				}); 
			});
    	 	console.log('There is no message return');
	     	return	res.json(200, {success: false, msg:'There is no message return'});  	 		
	     }, 4*5000);
	    mq_ch.consume(queueName, function(msg) {
	    	console.log("======================================="+msg);
	    	clearTimeout(timer);
	    	 //console.log(" [x] Received %s", msg.content.toString());
	    	var message = JSON.parse(msg.content.toString());
	    	console.log(" [x] Received %s",message.node_abilities.icmpPing.ping_ok);
	    	 
	    	if (message.node_abilities.icmpPing.ping_ok) {
	    			checkNetypeResultSNMPOK(message);
			}else {
				console.log("This device is not ping ok");
				res.json(200, {success: false, msg:'This device is not ping ok'});  
			}
	    	 //关闭连接
	    	mq_ch.close( function() {
	    	 console.log("################ channel closed  recive ###############");
				mq_conn.close( function() {
			    	 console.log("################ connection closed recive ###############");
				}); 
			});	
	    }, {noAck: true});	
		});
	});
	
	//发送消息  
	console.log(amqp_url+"发送消息");
  	
	amqp.connect(amqp_url, function(err, mq_conn) {
		mq_conn.createChannel(function(err, mq_ch) {
			var queueName = 'polling_task';

		    mq_ch.assertQueue(queueName, {durable: false});
		   //queueName.setsockopt('expiration', 6 * 1000) ;  	
	    	var jstr = JSON.stringify(task);
	    	console.log(jstr);
		    //发送消息到队列
		    mq_ch.sendToQueue(queueName, new Buffer(jstr));
		    mq_ch.close( function() {
	    	 console.log("################ channel closed sender ###############");
			mq_conn.close( function() {
		    	 console.log("################ connection closed sender ###############");
			}); 
			});	
		});	

	});


	async function checkNetypeResultSNMPOK(message) {
		try{
			var oidGot = message.node_abilities.snmpMib2System.VarBinds[1].Variable.Value;
			if(oidGot.indexOf('.')!=0){
				oidGot = '.' + oidGot;
			}
			var sql = sprintf(
				"SELECT netypeid as id, netypename as name, type_oid as sysoid, userlabel \
				 FROM res_ne_type WHERE type_oid like '%%%s%%'",
				oidGot
			);
			var conn = await APP.dbpool_promise.getConnection();
			var rows = await conn.query(sql);
			await APP.dbpool_promise.getConnection();
			var netype = rows[0];
			console.log(netype);
			throw null;
		}catch(err){
			console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
			if(err){
				 res.json(200, {success: false, msg:"Can not find the device type" });
				
			}else{
				 res.json(200, {success: true, data:netype });  
				
			}
		}		
	}			
});

module.exports = router;
