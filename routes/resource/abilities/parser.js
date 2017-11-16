var parse = {
	rcDeviceSerialNumber: function(str) {
		if(str.trim().length==0)
			return 'empty';
		else
			return str;
	}
};

exports.parse = parse;
