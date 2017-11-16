var _ = function(s) {
    if (APP.dict[s] != undefined) {
        return APP.dict[s];
    }
    return s;            
}
// console.log(_('My title'));
console.log(_('Login Successfully!'));
console.log(_('Alarms'));
