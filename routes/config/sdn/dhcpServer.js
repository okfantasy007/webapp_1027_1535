var express = require('express');
var router = express.Router();
var request = require('request');

var username = 'admin';
var password = 'admin';
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

var IPv4 = 'http://' +  APP.sdn_rest.host + ':' + APP.sdn_rest.port;

router.route('/pools').get(function(req, res, next){
    var options = {
        //url: IPv4 + '/restconf/operations/zero-config:get-ip-pools',
        url: IPv4 + '/restconf/operations/dhcp-pool:get-ip-pools',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json'
        }
    };

    request.post(options, function(err, response, data) {

        var responseObj = {
            success: false,
            msg:""
        };

        if (!err && response.statusCode == 200) {
            if(data){
                data = JSON.parse(data);
                responseObj.success = true;
                responseObj.data = data.output["ip-pools"];
            }
            res.status(200).json(responseObj);
        } else if(response && data){
            data = JSON.parse(data);
            responseObj.success = true;
            responseObj.msg = data.errors.error[0]["error-message"];
            responseObj.data=[];
            res.status(200).json(responseObj);
        } else {
            responseObj.success = false;
            responseObj.data=[];
            res.status(400).json(responseObj);
        }
    });

});

router.route('/create').post(function(req, res, next) {

    var body = {
        input: req.body
    };

    var options = {
        url: IPv4 + '/restconf/operations/dhcp-pool:create-ip-pool',
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
            msg: "failed"
        };

        if (!err && response && response.statusCode == 200) {
            var data = JSON.parse(data).output;
            if(data['error-code'] == 200){
                responseObj.success = true;
                responseObj.msg = "success";
            }else {
                responseObj.success = false;
                responseObj.msg = data['error-type'];
            }
        }

        res.json(200, responseObj);
    });
});

router.route('/delete').post(function(req, res, next) {

    var body = {
        input: {pool_id:req.body.ids}
    };

    var options = {
        url: IPv4 + '/restconf/operations/dhcp-pool:delete-ip-pool',
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
            msg: ""
        };
        if (!err && response.statusCode == 200) {
            if (data=="") {
                responseObj.success = true;
                responseObj.msg= "成功！"
            }
        } else {
            responseObj.msg = JSON.parse(data).errors.error[0]["error-message"];
            responseObj.success = false;
        }
        res.json(200, responseObj);
        //res.status(200).json(responseObj);
    });
});

router.route('/ips').get(function(req, res, next) {

    var body = {
        input: {pool_id:req.query.pool_id}
    };

    var options = {
        url: IPv4 + '/restconf/operations/dhcp-pool:get-ips',
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
            msg: ""
        };

        data = JSON.parse(data);

        if (!err && response.statusCode == 200) {
            if (data) {
                responseObj.success = true;
                responseObj.data = data.output["ips"];
            }
        } else {
            responseObj.success = true;
            responseObj.msg = data.errors.error[0]["error-message"];
            responseObj.data = [];
        }
        res.json(200, responseObj);
    });
});

router.route('/release').post(function(req, res, next) {
   /* var ips=[];
    for(var i in req.body.ips){
        if(req.body.ips.hasOwnProperty(i))
            ips.push({"release_ip":req.body.ips[i]});
    }*/
    var body = {
        input: {
            pool_id:req.body.pool_id,
            ips:req.body.ips
        }
    };

    var options = {
        url: IPv4 + '/restconf/operations/dhcp-pool:release-ips',
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
            msg: ""
        };
        if (!err && response.statusCode == 200) {
            if (data=="") {
                responseObj.success = true;
                responseObj.msg= "成功！"
            }
        } else {
            responseObj.msg = JSON.parse(data).errors.error[0]["error-message"];
            responseObj.success = false;
        }
        res.json(200, responseObj);
        //res.status(200).json(responseObj);
    });
});


module.exports = router;