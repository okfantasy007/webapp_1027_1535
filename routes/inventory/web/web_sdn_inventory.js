var express = require('express');
var nodeExcel = require('excel-export');
var router = express.Router();
var request = require('request');
var _auth = {username: 'admin', password: 'admin'};
var urlPre = 'http://' +  APP.sdn_rest.host + ':' + APP.sdn_rest.port;

// 网元res_ne表CURL API
router.get('/:openflowid', function(req, res, next) {
    var testData = {
        "output": {
            "DeviceTransmitDelay": 17,
            "DeviceModel": "",
            "SlotConfigEntry": [{
                "SlotIndex": 4,
                "SlotName": "PG8",
                "SlotStatus": "inservice",
                "SlotFirmwareRevision": "1.1.020170317",
                "SlotSerialNum": "136576459028765492100024",
                "SlotType": "GE",
                "SlotHardwareRevision": "CGOFA-A.01",
                "SlotCapablity": "GE"
            }, {
                "SlotIndex": 3,
                "SlotName": "PG8",
                "SlotStatus": "null",
                "SlotFirmwareRevision": "1.1.020170317",
                "SlotSerialNum": "136576459028765492100013",
                "SlotType": "GE",
                "SlotHardwareRevision": "CGOFA-A.01",
                "SlotCapablity": "GE"
            }, {
                "SlotIndex": 8,
                "SlotName": "PX2",
                "SlotStatus": "null",
                "SlotFirmwareRevision": "1.1.020170317",
                "SlotSerialNum": "136576459028765492100016",
                "SlotType": "GE",
                "SlotHardwareRevision": "CGOFA-A.01",
                "SlotCapablity": "GE;XE"
            }, {
                "SlotIndex": 7,
                "SlotName": "PX2",
                "SlotStatus": "null",
                "SlotFirmwareRevision": "1.1.020170317",
                "SlotSerialNum": "136576459028765492100025",
                "SlotType": "GE",
                "SlotHardwareRevision": "CGOFA-A.01",
                "SlotCapablity": "GE;XE"
            }, {
                "SlotIndex": 6,
                "SlotName": "PG8",
                "SlotStatus": "null",
                "SlotFirmwareRevision": "1.1.020170317",
                "SlotSerialNum": "136576459028765492100006",
                "SlotType": "GE",
                "SlotHardwareRevision": "CGOFA-A.01",
                "SlotCapablity": "GE"
            }, {
                "SlotIndex": 5,
                "SlotName": "PG8",
                "SlotStatus": "null",
                "SlotFirmwareRevision": "1.1.020170317",
                "SlotSerialNum": "136576459028765492100017",
                "SlotType": "GE",
                "SlotHardwareRevision": "CGOFA-A.01",
                "SlotCapablity": "GE"
            }],
            "HardwareVersion": "",
            "FirmwareVersion": "1.0.7_20170601",
            "DeviceMfiVendor": "Raisecom Corp.",
            "DeviceSerialNumber": "",
            "DeviceMacAddress": "00:0e:5e:00:00:55"
        }
    };
    var body = {
        input: {
            'node-id': req.params.openflowid
        }
    };
    var responseObj = {
        success: false,
        data: {}
    };

    request.post({
        url: urlPre + '/restconf/operations/config-device:get-deviceinfo',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    }, function(err, response, body){
        if(body){
            body = JSON.parse(body);

            if(body.output && body.output['error-code'] == 200){
                responseObj.success = true;
                responseObj.data = body;
            }
        }

        res.status(200).json(responseObj);
    });
});

module.exports = router;
