var express = require('express');
var router = express.Router();

router.get("/", function (req, res, next) {
	var chartdData = [];
	for (i = 0; i < 1; i++) {
		chartdData.push({
			cpu: Math.floor(Math.random() * 100),
			mem: Math.floor(Math.random() * 100),
			disk: Math.floor(Math.random() * 100)
		});
	}
	res.json(200, {data: chartdData });    
});

router.get("/syslogTest", function (req, res, next) {
        res.json(200, {
        	  "success": true,
        	  "causeid": 0,
        	  "rows": [
        	    {
        	      "id": "6e171fa4-46a9-49a1-9e61-ead5404f8fe1",
        	      "type": 0,
        	      "isEnable": 0,
        	      "backupType": 0,
        	      "days": 14,
        	      "capacity": 15,
        	      "retainPolicy": 0
        	    },
        	    {
        	      "id": "7d1108c1-4c7b-41a6-80ea-22d2ddf9878f",
        	      "type": 1,
        	      "isEnable": 0,
        	      "backupType": 0,
        	      "days": 17,
        	      "capacity": 18,
        	      "retainPolicy": 1
        	    },
        	    {
        	      "id": "65b4305f-59c4-422c-ac38-ea9ab7bdac9f",
        	      "type": 2,
        	      "isEnable": 0,
        	      "backupType": 0,
        	      "days": 12,
        	      "capacity": 3,
        	      "retainPolicy": 0
        	    },
        	    {
        	      "id": "a2477a38-745d-41e3-97a8-148460d873b7",
        	      "type": 3,
        	      "isEnable": 0,
        	      "backupType": 0,
        	      "days": 14,
        	      "capacity": 5,
        	      "retainPolicy": 1
        	    },
        	    {
        	      "id": "ccf35efa-1d0c-4151-9d26-97749ac3f915",
        	      "type": 4,
        	      "isEnable": 0,
        	      "backupType": 0,
        	      "days": 9,
        	      "capacity": 10,
        	      "retainPolicy": 0
        	    }
        	  ]
       })
});

router.get("/syslogBackup", function (req, res, next) {
    res.json(200, {
    	  "success": true,
    	  "causeid": 0,
    	  "rows": [
    	    {
    	      "id": "54e7c39d-8814-4033-8d77-5ab24f819510",
    	      "isLoginLogEnable": false,
    	      "isSafeLogEnable": true,
    	      "isSysOpLogEnable": false,
    	      "isRunLogEnable": true,
    	      "isSysLogEnable": false,
    	      "isAutoBackup": 0,
    	      "backupType": 0,
    	      "backupPath": "/var/backup",
    	      "fileServerIp": "1.2.2.2",
    	      "fileServerPort": 0,
    	      "username": "raisecom",
    	      "password": "123",
    	      "days": 17,
    	      "capacity": 1,
    	      "retainPolicy": 0
    	    }
    	  ]
    	})
});

router.get("/syslogConfigTest", function (req, res, next) {
    res.json(200, {
    	  "success": true,
    	  "causeid": 0,
    	  "rows": [
    	    {
    	      "id": 0,
    	      "syslogServerIp": "5.5.5.5",
    	      "port": 555,
    	      "proctolType": 0,
    	      "isEnabled": 1
    	    },
    	    {
    	      "id": 1,
    	      "syslogServerIp": "4.4.4.4",
    	      "port": 4444,
    	      "proctolType": 0,
    	      "isEnabled": 0
    	    },
    	    {
    	      "id": 2,
    	      "syslogServerIp": "3.3.3.3",
    	      "port": 333,
    	      "proctolType": 1,
    	      "isEnabled": 1
    	    },
    	    {
    	      "id": 3,
    	      "syslogServerIp": "2.2.2.2",
    	      "port": 22,
    	      "proctolType": 0,
    	      "isEnabled": 0
    	    },
    	    {
    	      "id": 4,
    	      "syslogServerIp": "1.1.1.1",
    	      "port": 11,
    	      "proctolType": 1,
    	      "isEnabled": 0
    	    }
    	  ]
    	}
)
});

router.get("/storagePolicyTest", function (req, res, next) {
    res.json(200, {
		"success": true,
		"data": {
			"csvRpIsEnable": 0,
			"csvStorageCapacity": 56,
			"csvStorageDays": 87,
			"dbDataStorageCapacity": 37,
			"dbDataStorageDays": 96,
			"dbRpIsEnable": 1,
			"fileFormat": 0,
			"id": 109
		}
    })
});

router.get("/dbBackupTest", function (req, res, next) {
    res.json(200, {
    	"schedule":[
    	  {
    		"ip": "192.168.202.109",
    		"mode": 0,
    		"password": "passme",
    		"path": "/usr/local/msp/dump",
    		"port": "22",
    		"reserve": 7,
    		"schedule_date": "2017-09-13 03:31:20",
    		"schedule_interval": 7,
    		"schedule_type": 1,
    		"user": "raisecom"
    	  }
    	]
    })
});



module.exports = router;
