var express = require('express');
var router = express.Router();

var filterfunc = require('./filter_func');
var utilcomm = require('../util');


router.get('/getAllRules', function(req, res) {
	filterfunc.getAllRules()
	.then(function(data) {
		res.status(200).json({success: true, data: data});
	})
	.catch(function(err) {
		console.log('getAllRules error: ', err);
		res.status(500).json(err);
	});
});

router.get('/getFilterType', function(req, res) {
	filterfunc.getFilterType()
	.then(function(data) {
		res.status(200).json({property_value: data});
	})
	.catch(function(err) {
		console.log('getFilterType error:', err);
		res.status(500).json(err);
	});
});

router.post('/modifyFilterType', function(req, res) {
	let text = req.body.filterType == 'discard' ? T.__('filter_discard') : T.__('filter_keep');
	filterfunc.modifyFilterType(req.body.filterType)
	.then(function(){
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, T.__('Modify'), T.__('filter_policy'), text);
	})
	.catch(function(err){
		console.log('filter modifyFilterType error:', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, false, T.__('Modify'), T.__('filter_policy'), text);
	});
});

var get_type_tree_children = function(symbols, parent) {
    var tree=[];
    for (i in symbols) {
    	var v = symbols[i];
        if (v['PARENT_ID'] != parent) {
            continue;
        }

		v['text'] = v['CATEGORY_NAME'];
        v['expanded'] = false;
		v['checked'] = false;
		v['children'] = get_type_tree_children(symbols, v['CATEGORY_ID']);
        
        tree.push(v);
    }
    return tree;
};

router.get('/getDeviceType',  function (req, res, next) {
	let sql = "select categoryid as CATEGORY_ID, categoryname as CATEGORY_NAME, parentid as PARENT_ID \
		from res_type_category where categorytype=0 and parentid='company';\
		select netypeid as NETYPE_ID, categoryid as CATEGORY_ID, netypename as NETYPE_NAME, iconfile as TREE_ICON_PATH \
		from res_ne_type where netypeid not in (select netype_id from res_discovery_filter)";

	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		var nodetypes = rows[0];
		var child = get_type_tree_children(nodetypes, 'company');
		var tree = {text: T.__('Device Type'), children: child, expanded: true, checked : false};

		var netypes = rows[1];
		for( i in netypes) {
			for( j in nodetypes) {

				if( netypes[i].CATEGORY_ID == nodetypes[j].CATEGORY_ID ) {
					netypes[i].netype_id = netypes[i].NETYPE_ID;
					netypes[i].text = netypes[i].NETYPE_NAME;
					netypes[i].leaf = true;
					netypes[i].checked = false;
					nodetypes[j].children.push(netypes[i]);
				}
			}
		}

  		res.status(200).json({success: true, children: [tree]});
	})
	.catch(function(err) {
		log.error('filter getDeviceType error', err);
		res.status(500).end();
	});
});

function func2(rec) {
	return function (item) {

		if(rec[item] == undefined || rec[item].length ==0) {
			return 'null';
		} else {
			return sprintf("'%s'", rec[item]);
		}
	}
}

router.post('/addFilterRule', function(req, res, next) {
	var parsed = JSON.parse(req.body.records);
	var tempSegs = [];
	let netypes = [];
	for(var i in parsed) {
		var ff = func2(parsed[i]);
		if(!ff('netype_id')) { continue; }
		var temp1 = [ff('netype_id'), ff('softWareVersion'), ff('hardWareVersion'), ff('hardWarePrefix')];
		tempSegs.push(temp1.join(','));
		netypes.push(ff('netype_name'));
	}

	var segsReady = tempSegs.join('),(');

	var sql = sprintf('insert into res_discovery_filter(NETYPE_ID, SW_VERSION, HW_VERSION, HW_PREFIX) values(%s)', 
		segsReady);
	utilcomm.promiseSimpleQuery(sql)
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, T.__('Add'), T.__('discovery filter'), netypes.join(','));
	})
	.catch(function(err) {
		log.error('filter addFilterRule error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, false, T.__('Add'), T.__('discovery filter'), netypes.join(','));
	});
});

router.post('/deleteFilterRule', function(req, res, next) {
	var sql = sprintf('delete from res_discovery_filter where FILTER_ID in (%s)', req.body.rule_ids);
	utilcomm.promiseSimpleQuery(sql)
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, T.__('Delete'), T.__('discovery filter'), req.body.rule_names);
	})
	.catch(function(err) {
		log.error('filter deleteFilterRule error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, false, T.__('Delete'), T.__('discovery filter'), req.body.rule_names);
	});
});

module.exports = router;