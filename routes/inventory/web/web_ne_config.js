var express = require('express');
var router = express.Router();

router.post('/configmenu', function(req, res, next) {
    var netypeid = req.body.netypeid;
    var south_protocol = req.body.south_protocol;
    var response = {
        success: false
    };

    if(netypeid && south_protocol){
        // 从数据库连接池获取连接
        APP.dbpool.getConnection(function(err, conn) {
            var sql = sprintf('\
            SELECT operation FROM db_msp.south_protocol_rest WHERE (netypeid=%d OR netypeid=-1) AND south_protocol=%d AND operation=0;\
            SELECT operation FROM db_msp.south_protocol_rest WHERE (netypeid=%d OR netypeid=-1) AND south_protocol=%d AND (operation=1 OR operation=2);\
            SELECT operation FROM db_msp.south_protocol_rest WHERE (netypeid=%d OR netypeid=-1) AND south_protocol=%d AND (operation=3 OR operation=4 OR operation=5);\
            SELECT operation FROM db_msp.south_protocol_rest WHERE (netypeid=%d OR netypeid=-1) AND south_protocol=%d AND (operation=11 OR operation=12)\
        ', netypeid, south_protocol,netypeid, south_protocol,netypeid, south_protocol,netypeid, south_protocol);
            console.log("##SQL##", sql);
            conn.query(sql, function(err, rows, fields) {
                if(!err && rows && rows.length > 0){
                    response.success = true;
                    response.restart =  rows[0].length > 0 ? true : false;
                    response.port =  rows[1].length > 0 ? true : false;
                    response.banner =  rows[2].length > 0 ? true : false;
                    response.ntp =  rows[3].length > 0 ? true : false;
                }

                res.status(200).json(response);
            });
        });
    }else{
        res.status(200).json(response);
    }
});

module.exports = router;
