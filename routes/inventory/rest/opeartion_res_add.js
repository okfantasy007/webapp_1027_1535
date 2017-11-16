var express = require('express');
var router = express.Router();
var async = require('async');
const uuid = require('uuid/v1');
var moment = require('moment');
var request = require('request');
var http = require('http'); 
var querystring = require('querystring');

router.post('/res_port/add', function(req, res, next) {

	var info = req.body.port;
	console.log(info);
	var insertRows = [];
	var causeid, cause,conn,count, sql,oneRow;
	var port_uuid=[];
	var hasRows = [];
	async function port_add() {
		
		conn = await APP.dbpool_promise.getConnection();
		for(var i in info) {
			var sql = sprintf("select * from res_port where neid=%d", info[i].neid);
			var rows = await conn.query(sql);
			console.log("+++++++++");
			var existed = false;
			for(var j in rows) {
				if(info[i].port_id == rows[j].port_id) {
					existed = true;
					break;
				}
			}
			if(existed) {
				//TODO
				hasRows.push(info[i].port_id);
				continue;
			} else {
			
				if(info[i].uuid==undefined ){
					info[i].uuid=uuid();
				}
				if(info[i].macaddress==undefined){
					info[i].macaddress="";
				}
				if(info[i].userlabel==undefined){
					info[i].userlabel="";
				}
				if(info[i].port_fix_name==undefined){
					info[i].port_fix_name="";
				}
				if(info[i].port_index==undefined){
					info[i].port_index=null;
				}
				if(info[i].port_name==undefined){
					info[i].port_name="";
				}
				if(info[i].index_in_mib==undefined){
					info[i].index_in_mib="";
				}
				if(info[i].adminstatus==undefined){
					info[i].adminstatus=1;
				}
				if(info[i].operstatus==undefined){
					info[i].operstatus=1;
				}
				if(info[i].max_speed==undefined){
					info[i].max_speed=null;
				}
				if(info[i].update_time==undefined){
					info[i].update_time=moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
				}
				if(info[i].speed==undefined){
					info[i].speed=null;
				}
				if(info[i].card_id==undefined){
					info[i].card_id="";
				}
				if(info[i].duplex==undefined){
					info[i].duplex=null;
				}
				sql = sprintf("select port_type_id from res_port_type where port_type_name ='%s'",info[i].port_type_name);
				var porttypeidrows = await conn.query(sql);
				console.log(porttypeidrows);

				oneRow = sprintf("('%s', '%s', '%s','%s', '%s', \
					%s, %s, '%s', '%s', \
					%d, %d, %d, %s,%s,'%s','%s',%s)", 
					info[i].uuid,info[i].userlabel, info[i].port_id, info[i].port_fix_name, info[i].card_id, 
					porttypeidrows[0].port_type_id, info[i].port_index, info[i].port_name, info[i].index_in_mib, 
					info[i].neid, info[i].adminstatus, info[i].operstatus, info[i].max_speed,info[i].speed,info[i].update_time,
					info[i].macaddress,info[i].duplex);

				insertRows.push(oneRow);
				port_uuid.push(info[i].uuid);
				
			}
		}
		APP.dbpool_promise.releaseConnection(conn);
		if(insertRows.length > 0) {
			try{
				var conn = await APP.dbpool_promise.getConnection();
				sql = sprintf("insert into res_port(uuid,userlabel, port_id, port_fix_name, card_id, \
				port_type_id, port_index, port_name, index_in_mib, \
				neid, adminstatus, operstatus, max_speed,speed,update_time,macaddress,duplex) values %s", insertRows.join(','));
				console.log(sql);
				await conn.query(sql);

				sql = sprintf("select uuid,port_id,neid,card_id,userlabel,port_type_id from res_port where uuid in ('%s')",port_uuid.join("','"));
				console.log(sql);
				rows = await conn.query(sql);
				console.log(rows);
				throw null;
			}catch(err){
				console.log("============="+err);
				APP.dbpool_promise.releaseConnection(conn);
		        if (err) {
		        	res.json(500, {success: false, data: err });  
		    	} else {
		    		var result =[];
		    		for(var i in rows){
		    			if(rows[i].port_type_id==701){
		    				result.push(rows[i]);
		    			}
		    		}
		    		console.log(result);
		    		topo_port_add(result);
			        res.json(200, {success: true, data: rows});  
		    	}
			}
			
		}else{
			res.json(200, {success: false, cause:T.__( "this port  is exist!!")  });  
		}

	};
	async function topo_port_add(result){

		console.log("555555555555555555555555555");
		console.log(result);
		var symbol = [];
		for(var i in result ){
			var onedata = {

				userlabel : result[i].userlabel,
				ne_id : result[i].neid,
				res_id : result[i].port_id,
				res_type_name : "PORT",
				topo_type_id :result[i].port_type_id,
				is_visible:0
			
			};
			console.log(onedata);
			symbol.push(onedata);
			
		}
		var symbols ={symbols:symbol};
		var data = JSON.stringify(symbols);
		var request = await http.request( 
			{  
	            host: 'localhost',  
	            port: '3000',  
	            method: "POST",                 
	            path: '/rest/topo/add_symbol',
	            headers: { 
	            	"Content-Type": 'application/json',  
	            	'Content-Length' : data.length
	            },
	                                  
	        },
	        function(response) {
	            
	            if(response.statusCode=='200'){
	      			log.debug('add symbol success');
	            }else{
	            	log.debug('add symbol failed');   
	            }
	        } 
	    );	
	    request.write(data);  
        request.end();  
	};
	port_add();
});
router.post('/res_card/add', function(req, res, next) {

	var info = req.body.card;
	var insertRows = [];
	var causeid, cause,conn,count, sql,oneRow ;
	var card_uuid=[];
	
	async function card_add() {
		console.log("--------------------------------");
		var conn = await APP.dbpool_promise.getConnection();
		for(var i in info) {
			var sql = sprintf("select * from res_card where neid=%d", info[i].neid);
			var rows = await conn.query(sql);
			var existed = false;
			for(var j in rows) {
				if(info[i].card_id == rows[j].card_id) {
					console.log(info[i].card_id +"==================="+rows[j].card_id)
					existed = true;
					break;
				}
			}
			
			if(existed) {
				//TODO
				break;
			} else {
			
				if(info[i].uuid==undefined ){
					info[i].uuid=uuid();
				}
				if(info[i].userlabel==undefined){
					info[i].userlabel="";
				}
				if(info[i].card_fix_name==undefined){
					info[i].card_fix_name="";
				}
				if(info[i].chassis_id==undefined){
					info[i].chassis_id="";
				}
				if(info[i].card_name==undefined){
					info[i].card_name="";
				}
				if(info[i].card_type_id==undefined){
					info[i].card_type_id=null;
				}
				if(info[i].card_display_name==undefined){
					info[i].card_display_name="";
				}
				if(info[i].isexisting==undefined){
					info[i].isexisting=null;
				}
				if(info[i].hardware_ver==undefined){
					info[i].hardware_ver="";
				}
				if(info[i].firmware_ver==undefined){
					info[i].firmware_ver="";
				}
				if(info[i].index_in_mib==undefined){
					info[i].index_in_mib="";
				}
				if(info[i].type_oid==undefined){
					info[i].type_oid="";
				}
				if(info[i].is_local==undefined){
					info[i].is_local=1;
				}
				var oneRow = sprintf("('%s','%s', %d, '%s', '%s', \
				'%s', '%s', %s, '%s', \
				%s, '%s', '%s', '%s', \
				'%s', CURRENT_TIMESTAMP, %d)", 
				info[i].uuid,info[i].card_id, info[i].neid, info[i].card_fix_name, info[i].userlabel, 
				info[i].chassis_id, info[i].card_name, info[i].card_type_id, info[i].card_display_name, 
				info[i].isexisting, info[i].hardware_ver, info[i].firmware_ver, info[i].index_in_mib, 
				info[i].type_oid, info[i].is_local);

				insertRows.push(oneRow);
				console.log(insertRows);
				card_uuid.push(info[i].uuid);
			}
		}
		APP.dbpool_promise.releaseConnection(conn);
		if(insertRows.length > 0) {
			try{
				var conn = await APP.dbpool_promise.getConnection();

				sql = sprintf("insert into res_card(uuid,card_id, neid, card_fix_name, userlabel, \
				chassis_id, card_name, card_type_id, card_display_name, \
				isexisting, hardware_ver, firmware_ver, index_in_mib, \
				type_oid, last_sync_time, is_local) values %s", insertRows.join(','));
				console.log(sql);
				var result = await conn.query(sql);

				sql = sprintf("select uuid,neid,card_id from res_card where uuid in ('%s')",card_uuid.join("','"));
				console.log(sql);
				rows = await conn.query(sql);
				console.log(rows);
				throw null;
			}catch(err){
				APP.dbpool_promise.releaseConnection(conn);
		        if (err) {
		        	res.json(500, {success: false, data: err });  
		    	} else {
			        res.json(200, {success: true, data: rows});  
		    	}
			}
		
		}else{
			res.json(200, {success: false, cause:T.__("this card  is exist!!")  });  
		}
	};
	card_add();
});

router.post('/res_chassis/add', function(req, res, next) {
	var info = req.body.chassis;
	var insertRows = [];
	var causeid, cause,conn,count, sql,oneRow ;
	var chassis_uuid=[];
	
	async function Chassis_add() {
		var conn = await APP.dbpool_promise.getConnection();
		for(var i in info) {
			var sql = sprintf("select * from res_chassis where neid=%d", info[i].neid);
			var rows = await conn.query(sql);
			var existed = false;
			for(var j in rows) {
				if(info[i].chassis_id == rows[j].chassis_id) {
					existed = true;
					break;
				}
			}
			if(existed) {
				//TODO
				continue;
			} else {
				if(info[i].uuid==undefined ){
					info[i].uuid=uuid();
				}
				if(info[i].isexisting==undefined){
					info[i].isexisting=1;
				}
				if(info[i].chassis_index==undefined){
					info[i].chassis_index=null;
				}
				if(info[i].chassis_name==undefined){
					info[i].chassis_name="";
				}
				if(info[i].chassis_fix_name==undefined){
					info[i].chassis_fix_name="";
				}
				if(info[i].desc_info==undefined){
					info[i].desc_info="";
				}
				if(info[i].chassis_type_id==undefined){
					info[i].chassis_type_id=null;
				}
				if(info[i].userlabel==undefined){
					info[i].userlabel="";
				}
				if(info[i].neid==undefined){
					info[i].neid=null;
				}
				if(info[i].rackid==undefined){
					info[i].rackid=null;
				}
				var oneRow = sprintf("('%s', '%s', %d, %s, '%s', '%s', '%s',%s, %d, CURRENT_TIMESTAMP,'%s',%s)",info[i].uuid,
					info[i].chassis_id, parseInt(info[i].neid),info[i].chassis_index,info[i].chassis_name,
					info[i].chassis_fix_name,info[i].desc_info,info[i].chassis_type_id,info[i].isexisting,
					info[i].userlabel,info[i].rackid);
				console.log(oneRow);
				insertRows.push(oneRow);
				chassis_uuid.push(info[i].uuid);
				
			}
		}
		APP.dbpool_promise.releaseConnection(conn);
		if(insertRows.length > 0) {

			try{
			
				var conn = await APP.dbpool_promise.getConnection();
				sql = sprintf("insert into res_chassis(uuid,chassis_id, neid, chassis_index, chassis_name, chassis_fix_name, desc_info, \
					chassis_type_id, isexisting, update_time,userlabel,rackid) values %s", insertRows.join(','));
				console.log(sql);
				var result = await conn.query(sql);

				sql = sprintf("select *from res_chassis where uuid in ('%s')",chassis_uuid.join("','"));
				console.log(sql);
				rows = await conn.query(sql);
				console.log(rows);
				throw null;
			}catch(err){
				APP.dbpool_promise.releaseConnection(conn);
		        if (err) {
		        	res.json(500, {success: false, data: err });  
		    	} else {
			        res.json(200, {success: true, data: rows});  
		    	}
			}
			
		}else{
			res.json(200, {success: false, cause: T.__("this chassis is exist!!") });  
		}

	};
	Chassis_add();
	
});

router.post('/res_rack/add', function(req, res, next) {
	// region 管理域
	async function rack_add(){
		console.info("req:",req.body.rackid);
		var conn = await APP.dbpool_promise.getConnection();
		sql = sprintf("select count(*) as ct from res_rack where rackid = %d",req.body.rackid);
		console.log("##SQL##", sql);
		var rows = await conn.query(sql);
		if(req.body.userlabel==undefined){
			req.body.userlabel="";
		}
		if(req.body.racknum==undefined||req.body.racknum==""){
			req.body.racknum=null;
		}
		if(req.body.row==undefined ||req.body.row==""){
			req.body.row=null;
		}
		if(req.body.col==undefined||req.body.col==""){
			req.body.col=null;
		}
		if(req.body.floor_height==undefined||req.body.floor_height==""){
			req.body.floor_height=null;
		}
		if(req.body.carrying_weight==undefined||req.body.carrying_weight==""){
			req.body.carrying_weight=null;
		}
		if(req.body.floor==undefined||req.body.floor==""){
			req.body.floor=null;
		}
		if(req.body.area==undefined){
			req.body.area="";
		}
		if(req.body.vendor_name==undefined){
			req.body.vendor_name="";
		}

		if(req.body.remark==undefined){
			req.body.remark="";
		}
		if(req.body.update_time==undefined){
			req.body.update_time=moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		}
		if(req.body.tenant==undefined){
			req.body.tenant="";
		}
		
		if(rows[0].ct ==0){
			try{
				sql = sprintf(
					"INSERT INTO `res_rack` (\
						`uuid` ,\
						`userlabel`,\
						`rackid` ,\
						`racknum` ,\
						`row` ,\
						`col` ,\
						`floor_height` ,\
						`carrying_weight` ,\
						`floor` ,\
						`area` ,\
						`vendor_name` ,\
						`remark` ,\
						`update_time` ,\
						`tenant`)\
					VALUES ('%s',  '%s',  '%s',  %s,  %s,  %s,  %s,\
					%s,  %s,  '%s',  '%s',  '%s', '%s', '%s'\
					)",
					uuid(),
					req.body.userlabel,
					req.body.rackid,
					req.body.racknum,
					req.body.row,
					req.body.col,

					req.body.floor_height,
					req.body.carrying_weight,
					req.body.floor,
					req.body.area,
					req.body.vendor_name,

					req.body.remark,
					req.body.update_time,
					req.body.tenant
				);
				console.log("##SQL##", sql);
		    	rows = await conn.query(sql);
				console.log(rows);
				throw null;

			}catch(err){
				APP.dbpool_promise.releaseConnection(conn);
		        if (err) {
		        	res.json(500, {success: false, data: err });  
		    	} else {
			        res.json(200, {success: true, data: T.__("add rack success")});  
		    	}
					
			}		
		}else{
			res.json(200, {success: false, data: T.__('this rack is existed!') });  
		}
		
	};
	rack_add();
});

/**
URL:http://localhost:3000/rest/inventory/res_ne/add
input:参数
{
  "nes":[
          {
                 "ipaddress":"1.1.1.1",
                 "netypename":"CGOFA",
                 "south_protocol":4,
                 "resourcestate":"1",
                 "islocal":1,
                 "pool_enabled":1,
                 "pool_interval":1800
          },
          {
          	"ipaddress":"2.2.2.2",
                 "netypename":"OpenvSwitch",
                 "south_protocol":4,
                 "resourcestate":"1",
                 "islocal":1,
                 "pool_enabled":1,
                 "pool_interval":1800
          }
           
   ]
      
}
*/
router.post('/res_ne/add', function(req, res, next) {
	
	var info = req.body.nes;
	var causeid, cause,conn,count, sql,oneRow ;
	var isexist = false;
	var ne_uuid=[];
	var hasRows = [];
	async function res_add(){
		conn = await APP.dbpool_promise.getConnection();
		await conn.beginTransaction();
		for(var i in info ){
			console.log(info[0].ipaddress);
			if(info[i].uuid==undefined){
				info[i].uuid=uuid();
			}
			if(info[i].hostname==undefined){
				info[i].hostname=info[i].ipaddress;
			}
			if(info[i].port==undefined){
				info[i].port = 161;
			}
			if(info[i].discoveredname==undefined){
				info[i].discoveredname=info[i].ipaddress;
			}
			if(info[i].userlabel==undefined){
				info[i].userlabel=info[i].discoveredname;
			}
			
			if(info[i].poll_enabled==undefined){
				info[i].poll_enabled=1;
			}
			if(info[i].poll_interval==undefined){
				info[i].poll_interval=1800;
			}
			if(info[i].proto_param==undefined){
				info[i].proto_param="";
			}
			if(info[i].create_time==undefined){
				info[i].create_time=moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
			}
			if(info[i].islocal==undefined){
				info[i].islocal=1;
			}
			sql = sprintf("select count(*) as ct  from res_ne where ipaddress='%s' and port='%d' and hostname = '%s' ",
		    		info[i].ipaddress,
					info[i].port,
					info[i].hostname);
			console.log("00000000000000000000000000000000000000000000"+sql);
		    rows = await conn.query(sql);
		    console.log(rows);
			
			console.log("==============rows[0].ct==============="+rows[0].ct);
			if(rows[0].ct==0){

				sql = sprintf("select netypeid from res_ne_type where userlabel ='%s'",info[i].netypename);
				var netypeidrows = await conn.query(sql);
				console.log(netypeidrows);
				oneRow = sprintf("('%s',%d, '%s', '%d', '%s','%s', '%s', '%s','%d',\
							'%d', '%s', '%s',%s)",
				info[i].uuid,netypeidrows[0].netypeid,info[i].ipaddress,info[i].port,info[i].hostname,
				info[i].userlabel,info[i].discoveredname,info[i].poll_enabled,
				info[i].poll_interval,info[i].south_protocol,
				JSON.stringify(info[i].proto_param),info[i].create_time,info[i].islocal);
			
				sql = sprintf("insert into res_ne(uuid,netypeid, ipaddress, port, hostname, userlabel, discoveredname, \
						poll_enabled, poll_interval, south_protocol, proto_param, create_time,islocal) values %s",oneRow);
				console.log(sql);
				await conn.query(sql);
				ne_uuid.push(info[i].uuid);
				
			}else{
				isexist = true;
		   		sql = sprintf("select *  from res_ne where ipaddress='%s' and port='%d' and hostname = '%s' ",
		    		info[i].ipaddress,
					info[i].port,
					info[i].hostname);
		   		var hasRows = await conn.query(sql);
		   		break;
			}	
		}	
		if(isexist){
			await conn.rollback();
			APP.dbpool_promise.releaseConnection(conn);
			console.log("shifanglianjie1111111111111111111111");
			res.json(200, {success: false, data:hasRows,cause: T.__("this ne is exist!!") });
		}else{
			await conn.commit();
			sql = sprintf("select uuid,neid,netypeid,ipaddress,macaddress,hostname,userlabel from res_ne where uuid in ('%s')",ne_uuid.join("','"));
				console.log(sql);
			rows = await conn.query(sql);
			APP.dbpool_promise.releaseConnection(conn);
			console.log(rows);
			await topo_ne_add(rows);
			res.json(200, {success: true, data: rows}); 
		}
		
	};
	async function topo_ne_add(rows){
		console.log(rows);
		var symbol = [];
		conn = await APP.dbpool_promise.getConnection();
		for(var i in rows ){
			
			sql = sprintf("select userlabel from res_ne_type where netypeid =%d",rows[i].netypeid);
			var userlabelrows = await conn.query(sql);
			console.log(userlabelrows);
			var onedata = {

				userlabel : rows[i].userlabel,
				ipaddress:rows[i].ipaddress,
				ne_id : rows[i].neid,
				res_id : rows[i].neid,
				res_type_name : "NE",
				topo_type_id :userlabelrows[0].userlabel,
			
			};
			console.log(onedata);
			symbol.push(onedata);
			
		}
		APP.dbpool_promise.releaseConnection(conn);
		var symbols ={symbols:symbol};		
	   	var data = JSON.stringify(symbols);   	  	
		var request = await http.request( 
			{  
	            host: 'localhost',  
	            port: '3000',  
	            method: "POST",                 
	            path: '/rest/topo/add_symbol',
	            headers: { 
	            	"Content-Type": 'application/json',  
	            	'Content-Length' : data.length
	            }                    
	        },
	        function(response) {	            
	            if(response.statusCode=='200'){            	
	            	log.debug('add symbol success');	              	
	            }else{	           
	                 log.debug('add symbol failed');	               
	            }

	           
	        } 
	    );	
	    request.write(data);  
        request.end();  
	   
	};
	res_add();
});


module.exports = router;



