var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/', function(req, res, next) {
    var path = __dirname + '/../../static/widget';
    console.log(path);
    fs.readdir(path, function(err,files){
        var ary = files.filter(function(item){
            return item != ".svn";
        });
        var views=[];
        for (var i in ary) {
            console.log("####", ary[i]);
            var viewType = ary[i].split('.')[0];
            views.push({
                text: ary[i],
                iconCls: 'x-fa fa-circle-o',
                routeId: viewType,
                viewType: viewType,
                leaf: true
            })
        }

        res.json(200, {
            text: 'root',
            expanded: true,
            children: views,
        });  
    });
});

module.exports = router;