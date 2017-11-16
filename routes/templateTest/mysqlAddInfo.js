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
    var name =req.body.name;
    var age =req.body.age;
    var Tel =req.body.Tel;
    var address =req.body.address;
    var email =req.body.email;
    console.info(age);
    var insertSQl= "insert into peopleInfo (id,name,age,Tel,address,email) values ("+id+',\"'+name+'\",'+age+','+Tel+',\"'+address+'\",\"'+email+"\");";
    connection.connect();
    console.info(insertSQl);
    connection.query(insertSQl,function (err,result) {
        if(err){
            console.info("插入信息出错")
            res.end({faliure:404});
        }
        console.info(result)
       res.send({success:200});
    });
    // res.render('extWindow01');
});


module.exports = router;