Date.prototype.toDateTime = function() {
    // 2016-01-01 09:00:00
    var o = {
        'Y': this.getYear() + 1900,
        'M': this.getMonth() + 1,
        'D': this.getDate(),
        'h': this.getHours(),
        'm': this.getMinutes(),
        's': this.getSeconds()
    }
    for (var i in o) {
        o[i] = o[i] < 10 ? '0'+o[i].toString() : o[i].toString();
    }
    return o.Y+'-'+o.M+'-'+o.D+' '+o.h+':'+o.m+':'+o.s;
};

Date.getTime = function() {
    return new Date().toDateTime();
}

var Tool = {};

Tool.appendSelect = function(selectName, options, changeFunction) {
    for (var i in options) {
        $('#' + selectName).append('<option>' + options[i] + '</options>');
    }
    $('#' + selectName).change(changeFunction);
};

Tool.commas = function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
