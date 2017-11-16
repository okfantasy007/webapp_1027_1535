/**
 * Created by 李建强 on 2017/6/14.
 */
var express = require('express');
var router = express.Router();
var mysql= require("mysql");
/* GET home page. */
router.post('/', function(req, res, next) {
    var connection = mysql.createConnection({
        host     : '192.168.202.108',
        user     : 'root',
        password : '123456',
        database : 'ExtJSTest'
    });
    //'id','name','age', 'Tel','address','email'

    var id = req.body.id;

    var editSQL= "delete from  peopleInfo where id="+id+";";
    connection.connect();
    console.info(editSQL);
    connection.query(editSQL,function (err,result) {
        if(err){
            console.info("更新信息出错")
            res.end({faliure:404});
        }
        console.info(result)
       res.send({success:200});
    });
    // res.render('extWindow01');
});


module.exports = router;