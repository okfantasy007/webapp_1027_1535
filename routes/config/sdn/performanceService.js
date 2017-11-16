var express = require('express');
var router = express.Router();
var request = require('request');

var username = 'admin';
var password = 'admin';
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
//var IPv4 = "http://172.16.61.225:8181";
var IPv4 = 'http://' +  APP.sdn_rest.host + ':' + APP.sdn_rest.port;

function testData(){
    var temp=[];
    temp.push({'eline-id':"600",
        'user-label':"测试",
        'name':"瑞斯康达",
        'cir':"",
        'eir':"",
        'source-ne-id':"op6",
        'source-port':"22",
        'destination-ne-id':"op3",
        'destination-port':"22",
        'isDA':false});
    return temp;
}

router.route('/elines').get(function(req, res, next) {
    var options = {
        url: IPv4 + '/restconf/operational/raisecom-eline:service',
        headers: {
            'authorization': _auth
        }
    };

    request.get(options, function(err, response, data) {
        var responseObj = {
            success: true,
            data:[],
        };

        if (!(!err) || response.statusCode != 200) {
            responseObj.success=false;
            res.status(200).json({
                success: false,
                data:[]
            });
            return;
        }

        res.status(200).json({
            success: true,
            data:data
        });
    });
   /* res.status(200).json({
        success: true,
        data:testData()
    });*/
});

router.route('/ne-label/:type/:id').get(function(req, res, next) {
    var type = req.params.type;
    var id = req.params.id;
    var url="";

    if(type==1)
        url= '/restconf/operational/opendaylight-inventory:nodes/node/' +id;
    else
        url= '/restconf/operational/sptn-net-topology:net-topology/ext-nodes/ext-node/' + id;

    var options = {
        url: IPv4 + url,
        headers: {
            'authorization': _auth
        }
    };

    request.get(options, function(err, response, data) {
        if (!(!err)||response.statusCode != 200)  {
            res.status(200).json({
                success: false,
                data:""
            });

            return;
        }
        var result = JSON.parse(data);
        if(type==1)
            result = result['node'][0]['sdn-inventory:user-label'];
        else
            result = result['ext-node'][0]['user-label'];

        res.status(200).json({
            success: true,
            data:result
        });
    });
});

router.route('/port-label/:id/:port').get(function(req,res,next){
    var id = req.params.id;
    var port =req.params.port;

    var options = {
        url: IPv4 + "/restconf/operational/opendaylight-inventory:nodes/node/" + id + "/node-connector/" + port,
        headers: {
            'authorization': _auth
        }
    };
    request.get(options, function(err, response, data) {
        try {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: ""
                });

                return;
            }
            var result = JSON.parse(data);
            result = result['node-connector'][0]['sdn-inventory:user-label'];
            res.status(200).json({
                success: true,
                data: result
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: ""
            })
        }
    });
});

router.route('/elines-status').get(function(req,res,next){
    var options = {
        url: IPv4 + "/restconf/operations/business-statistics:get-business-statistics-status",
        headers: {
            'authorization': _auth
        }
    };
    request.post(options,function(err, response, data){
        try{

            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: ""
                });
                return;
            }
            var result = JSON.parse(data);
            result = result.output["business-statistics-switch"];
            res.status(200).json({
                success: true,
                data: result
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: ""
            })
        }
    });
});

router.route('/set-elines-status').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/business-statistics:enable-business-statistics",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };
    request.post(options,function(err, response, data){
        try{

            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: ""
                });
                return;
            }
            var result = JSON.parse(data);
            result = result.output["business-statistics-switch"];
            res.status(200).json({
                success: true,
                data: result
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: ""
            })
        }
    });
});

router.route('/eline-threshold').get(function(req,res,next){
    var options = {
        url: IPv4 + '/restconf/operations/pm-threshold:get-all-eline',
        headers: {
            'authorization': _auth
        }
    };
    request.post(options, function(err, response, data) {
        try {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: data
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/set-eline-threshold').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/pm-threshold:update-all-eline",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: ""
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });

});

router.route('/add-pm-task').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/pm-task:add-pm-business-task",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: ""
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/eline/:id').get(function(req,res,next){
    var elineId = req.params.id;

    var options = {
        url: IPv4 + "/restconf/operational/raisecom-eline:service/eline/" + elineId,
        headers: {
            'authorization': _auth,
        },
    };

    request.get(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                data:(data['eline'][0]) ? data['eline'][0]['pw']:[]
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-eline-threshold').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/pm-threshold:get-eline-threshold",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
           if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: (data.output) ? data.output:[]
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-pm-special-business-data').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/pm:get-pm-special-business-data",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }

            data = JSON.parse(data);
            res.status(200).json({
                success: true,
                data: (data.output["pm-special-business-data"]) ? data.output["pm-special-business-data"]:[]
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-special-business-threshold').post(function(req,res,next){
    var body = {input: req.body.input};

    var options = {
        url: IPv4 + "/restconf/operations/pm-threshold:"+req.body.service,
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: data
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/update-special-business-threshold').post(function(req,res,next){
    var body = {input: req.body.input};

    var options = {
        url: IPv4 + "/restconf/operations/pm-threshold:"+req.body.service,
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
           if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: []
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-pm-excel').post(function(req,res,next){
    var body = {input: req.body.input},
        type= req.body.type,
        serviceName = (type==1) ? "export-business-statistics-by-type" :"export-business-statistics";

    var options = {
        url: IPv4 + "/restconf/operations/pm:"+serviceName,
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            data = JSON.parse(data);
            if(data.output["xls-file-path"] || data.output["file-path"]){
                res.status(200).json({
                    success: true,
                    data: (type==1) ? data.output["xls-file-path"]:data.output["file-path"]
                });
            }
            else{
                res.status(200).json({
                    success: true,
                    data: ""
                });
            }
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-pm-pdf').post(function(req,res,next){
    var body = {input: req.body};
        options = {
        url: IPv4 + "/restconf/operations/pm:export-business-statistics-by-type",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            data = JSON.parse(data);
            res.status(200).json({
                    success: true,
                    data: (data.output["pdf-file-path"]) ? data.output["pdf-file-path"]:[]
            });
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-cf-result').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/y1564-api:get-result",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }

            data = JSON.parse(data);
            res.status(200).json({
                success: true,
                data: (data.output['throughput']['stepResult']) ? data.output['throughput']['stepResult']:[]
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-cf-result-step/:elineId').get(function(req,res,next){
    var elineId = req.params.elineId;

    var options = {
        url: IPv4 + "/restconf/operational/y1564-api:task/task-list/" + elineId + "/throughput-container",
        headers: {
            'authorization': _auth,
        },
    };

    request.get(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }

            var result=null
            data = JSON.parse(data);

            if (data['throughput-container'] && data['throughput-container']['throughput-task'] && data['throughput-container']['throughput-task'].length > 0) {
                if (data['throughput-container']['throughput-task'][0]['step'] !== undefined) {
                    result=data['throughput-container']['throughput-task'][0];
                } else {
                    result=data['throughput-container']['throughput-task'][1];
                }
            }
            res.status(200).json({
                success: true,
                data:result
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});

router.route('/get-pm-result').post(function(req,res,next){
    var body = {input: req.body};

    var options = {
        url: IPv4 + "/restconf/operations/pm:get-y1564-pm-data",
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        try
        {
            if (!(!err) || response.statusCode != 200) {
                res.status(200).json({
                    success: false,
                    data: null
                });
                return;
            }
            data = JSON.parse(data);
            res.status(200).json({
                success: true,
                data: (data.output['collect-data']) ? data.output['collect-data']:[]
            })
        }
        catch(e){
            res.status(200).json({
                success: false,
                data: null
            })
        }
    });
});


module.exports = router;