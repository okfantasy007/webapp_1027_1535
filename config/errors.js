
var err_hash = {};
async function syncsql() {
    var conn=null;
    try {
        conn = await APP.dbpool_promise.getConnection();
        var sql = 'SELECT global_errors.* FROM app.global_errors';
        var rows = await conn.query(sql)
        // console.log("###############",rows);
        for (var i in rows) {
            err_hash[ rows[i].err_no ] = rows[i]
            // console.log(i, rows[i]);
        }
        throw null;
    } catch (err) {
        // do something
        console.log("=======",err);
        APP.dbpool_promise.releaseConnection(conn);
    }    
};
// syncsql();

var errfunc = function(errno) {
    var h = err_hash[errno.toString()];
    if (!h) {
        h = {
            err_msg: "undefined error type",
            err_no: "90001",
            err_module: "undefined"
        }
    } 
    return h;
}

// APP.dbpool_res.getConnection(function(err, conn) {
//     var sql = 'SELECT global_errors.* FROM app.global_errors';
//     conn.query(sql, function(err, rows, fields) {
//         for (var i in rows) {
//             err_hash[ rows[i].err_no ] = rows[i]
//             // console.log(i, rows[i]);
//         }
//         conn.release();
//     });
// });

module.exports = errfunc;
