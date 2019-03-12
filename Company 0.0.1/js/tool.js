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

Tool.displayTable = function(tbody, r, showCols) {
	var c = showCols.split(', ');
	for (var i = 0; i < r.length; i++) {
		var tr = $('<tr>');
		for (var j = 0; j < c.length; j++) {
			var now = r[i][c[j]];
			// console.log(c[j], now);
			if (typeof now == "number") {
				now = Tool.commas(now);
			}
			tr.append('<td>' + now + '</td>');
		}
		tr.appendTo($('#' + tbody));
	}
}

Tool.search = function(r, cols, keywords) {
	var res = [];
	cols = cols.split(', ');
	console.log(cols, keywords);	
	for (var i = 0; i < r.length; i++) {
		r[i].score = 0, res[i] = {};
		for (var j = 0; j < cols.length; j++) {
			var now = r[i][cols[j]];
			res[i][cols[j]] = '';
			var max = 0;
			for (var k = 0; k < keywords.length; k++) {
				var key = keywords[k], ok = false;
				// console.log(key, ok);
				for (var x = key.length; x > max && !ok; x--) {
					for (var Kst = 0; Kst <= key.length - x; Kst++) {
						var p = now.toLowerCase().search(key.toLowerCase().slice(Kst, Kst + x));
						if (p != -1) {
							ok = true;
							max = x;
							res[i][cols[j]] = now.slice(p, p + x);
							break;
						}
						// console.log(now, key.slice(Kst, Kst + x));
					}
				}
			}
			r[i].score += Math.pow(cols.length, max);
		}
		res[i].data = r[i].score;
		res[i].id = i;
		// console.log(i, res[i]);
	}
	res.sort(function(a, b) {
		return b.data - a.data;
	});
	return res;
}

Tool.sortTable = function(r, h, col, showCols) {
	var res = [];
	c = col.split(', ');
	showCols = showCols.split(', ');
	for (var i = 0; i < r.length; i++) {
		var fi = h[i].id;
		res[i] = {};
		for (var j = 0; j < showCols.length; j++) {
			var now = showCols[j];
			res[i][now] = r[fi][now];
		}
		for (var j = 0; j < c.length; j++) {
			var now = c[j];
			var ori = res[i][now];
			var tar = h[i][now];
			var pos = ori.search(tar);
			var tmp = ori.slice(0,pos) + '<span class="searchMatch">'
					+ tar + '</span>' + ori.slice(pos + tar.length, ori.length);
			res[i][now] = tmp;
			// console.log(pos, tar, tmp);
		}
	}
	// console.log(res);
	return res;
}

Tool.commas = function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}