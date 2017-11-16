var _ = function(lang) {

	var dict=null; // 字典
	Ext.Ajax.request({
		url: '/lang/get_i18n_dict?lang='+lang,
		method: "GET",
		async: false,
		callback: function (opts, success, response) {
			if (success) {
				var r = Ext.decode(response.responseText);
				dict = r.dict;
				// console.log(lang);
				// console.log(dict);
			}
			else {
				dict = null;
			}
		}
	});

	return function(s) {
		if (dict!=null) {
			if (dict[s] != undefined) {
				return dict[s];
			}
		}
		return s;
	};

}(APP.lang);

// console.log(_('My title'));
// console.log(_('Login Successfully!'));
// console.log(_('Alarms'));
