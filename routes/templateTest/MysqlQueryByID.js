var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var url = require('url');

/* GET home page. */
router.get('/',function(req, res, next) {

    var connection = mysql.createConnection({
        host     : '192.168.202.108',
        user     : 'root',
        password : '123456',
        database : 'ExtJSTest'
    });

    connection.connect();

    var arg = url.parse(req.url, true).query

    var id = arg.id;
    console.info("日志信息"+arg.id);

    connection.query('SELECT * from peopleInfo where id= '+id, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        console.info("条件查询完毕");
        //callback();
        res.send(results);

    });


    connection.end();
});


module.exports = router;
