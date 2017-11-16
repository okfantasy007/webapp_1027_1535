var fs = require('fs');
var figlet = require('figlet').textSync;
 
fs.readFile('fonts.txt', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
    var fontfiles = data.split('\n')
    var fonts = fontfiles.map(function(item){
  		return item.split('.')[0]
    })

    for (var i in fonts) {
    	var font = fonts[i]
    	if (font=='') {
    		continue
    	}
	    console.log('------------------- Font:(' + font + ')-------------------');
		console.log(figlet("Hello world!",{
		  	font: font,
		}));
		console.log('');
		console.log('');
    }
});

