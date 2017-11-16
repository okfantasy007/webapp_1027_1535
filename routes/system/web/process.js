var express = require('express');
var router = express.Router();
var request = require('request');
var os = require('os');

router.get('/getall', function(req, res, next) {
	var url = sprintf("%s/pm2", req.app.locals.self_url);
	console.log(url);
	request.get(url, function (error, response, body) {
		console.log(response.headers);

		if (!error && response.statusCode == 200) {
			var obj = JSON.parse(body);
			console.log("-->",obj.system_info);
			res.json(200, {success: true, data: obj });  
		} else {
			res.json(200, {success: false, data: error });  
		}
	});
});

router.get('/server_info', function(req, res, next) {

	var ary = [];
	ary.push({
		id: 'hostname',
		value: os.hostname(),
	});

	ary.push({
		id: 'uptime',
		value: os.uptime(),
	});

	ary.push({
		id: 'loadavg1m',
		value: os.loadavg()[0],
	});
	ary.push({
		id: 'loadavg5m',
		value: os.loadavg()[1],
	});
	ary.push({
		id: 'loadavg15m',
		value: os.loadavg()[2],
	});

	ary.push({
		id: 'platform',
		value: sprintf("%s (%s)", os.platform(), os.arch()),
	});

	ary.push({
		id: 'os_release',
		value: os.release(),
		value: sprintf("%s %s", os.type(), os.release()),
	});

	ary.push({
		id: 'totalmem',
		value: os.totalmem(),
	});

	ary.push({
		id: 'freemem',
		value: os.freemem(),
	});

	var totalmem = os.totalmem();
	var freemem = os.freemem();
	ary.push({
		id: 'memory_usage',
		value: (totalmem-freemem) / totalmem * 100,
	});

	ary.push({
		id: 'cpus',
		value: os.cpus().length,
	});

	ary.push({
		id: 'cpus',
		value: os.cpus().length,
	});

	var ifs = os.networkInterfaces();
	for (var k in ifs) {
		ary.push({
			id: 'if_'+k,
			value: ifs[k][0].address + '/' + ifs[k][0].netmask,
		});
	}

	function calcMem(){
	    let mem_total = os.totalmem(),
	        mem_free = os.freemem(),
	        mem_used = mem_total - mem_free,
	        mem_ratio = 0;
	    mem_total = (mem_total / (1024 * 1024 * 1024)).toFixed(1);
	    mem_used = (mem_used / (1024 * 1024 * 1024)).toFixed(1);
	    mem_ratio = parseInt(mem_used / mem_total * 100);
	    return {
	        total: mem_total,
	        used: mem_used,
	        ratio: mem_ratio
	    }  
	}

	// ary.push({
	// 	id: 'memoryUsage',
	// 	value: calcMem(),
	// });

	log.debug(JSON.stringify(ary, null, 2))

	res.json(200, {success: true, data: ary});  

});

router.get('/daemons', function(req, res, next) {
	var url = sprintf("%s/pm2", req.app.locals.self_url);
	console.log(url);
	request.get(url, function (error, response, body) {
		console.log(response.headers);

		if (!error && response.statusCode == 200) {
			var obj = JSON.parse(body);
			// console.log("-->",obj.system_info);
			var procs = obj.processes;
			var daemons = [];
			for (var i in procs) {
				var r = procs[i];
				daemons.push({
					name: 	r.name,
					pid: 	r.pid,
					status: r.pid==0 ? 'stopped' : 'online',
					memory: r.monit.memory,
					cpu: 	r.monit.cpu,
					uptime: r.pm2_env.pm_uptime,
				});
			}
			res.json(200, {success: true, data: daemons });  
		} else {
			res.json(200, {success: false, data: error });  
		}
	});
});

router.get('/dbstatus', function(req, res, next) {
	async function get_db_status() {
	    var conn=null;
	    var rows;
	    try {
	        conn = await APP.dbpool_promise.getConnection();
	        var sql = "show global status";
	        rows = await conn.query(sql)
	        for (var i in rows) {
	        	rows[i].id = i+1;
	            // console.log(i, rows[i]);
	        }
	        throw null;
	    } catch (err) {
	        // do something
	        console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	res.json(500, {success: false, data: err });  
	    	} else {
		        res.json(200, {success: true, data: rows });  
	    	}
	    }    
	};	
	get_db_status();
});

router.get('/mqstatus', function(req, res, next) {
	var url = sprintf("%s/mq/api/overview", req.app.locals.self_url);
	console.log(url);
	request.get(
	{
		url: url,
		auth: {
		    'user': 'guest',
		    'pass': 'guest',
		},		
	},
  	function (error, response, body) {
		console.log(response.headers);

		if (!error && response.statusCode == 200) {
			var obj = JSON.parse(body);
			log.debug(JSON.stringify(obj, null, 2))

			var s = [];
			for (k in obj) {
				var t = typeof obj[k];
				console.log("-->", k, t);
				if (t=='string' || t=='number') {
					s.push({
						name: 	k,
						value: 	obj[k],
					});
				}
			}

			res.json(200, {success: true, data: s });  
		} else {
			res.json(200, {success: false, data: error });  
		}
	});
});

module.exports = router;