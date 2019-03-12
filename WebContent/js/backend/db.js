var DB = {};

// friend

DB.init = function() {
	if (window.confirm('Are you sure to initialize database?')) {
		DB.load();
	}
}

DB.remove = function() {
	if (window.confirm('Are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE EMP')
	}
};

DB.select = function(fields, targetTable, joinTables, conditions) {
	var joinConditions = {
		trans: 'trans.id = good.transId',
		stock: 'stock.id = trans.stockId',
		item: 'item.id = stock.itemId',
		whouse: 'whouse.id = stock.whouseId',
		kind: 'kind.id = item.kindId',
		maker: 'maker.id = item.makerId'
	};

	var sql = 'SELECT DISTINCT ' + fields + ' FROM ' + targetTable;
	var joins = joinTables.split(', ');
	for (var i = 0; i < joins.length; i++) {
		var x = joins[i];
		sql += ' JOIN ' + x + ' ON ' + joinConditions[x];
	}
	sql += (conditions ? ' WHERE ' + conditions : '') + ';';
	var res = alasql(sql);
	if (debug) console.log(sql, res);
	return res;
}

// private

DB.tables = {
	kind: {
		id: 'INT IDENTITY',
		kindName: 'STRING'
	},
	maker: {
		id: 'INT IDENTITY',
		makerName: 'STRING'
	},
	item: {
		id: 'INT IDENTITY',
		itemCode: 'STRING',
		kindId: 'INT',
		itemName: 'STRING',
		makerId: 'INT',
		importPrice: 'INT',
		transProfit: 'INT',
		exportProfit: 'INT',
		itemUnit: 'STRING'
	},
	whouse: {
		id: 'INT IDENTITY',
		whouseName: 'STRING',
		shelfNum: 'INT',
		rowNum: 'INT',
		colNum: 'INT',
		usedSpace: 'INT',		///
		totalProfit: 'INT'		///
	},
	stock: {
		id: 'INT IDENTITY',
		itemId: 'INT',
		whouseId: 'INT',
		minimum: 'INT',
		maximum: 'INT',
		balance: 'INT'
	},
	trans: {
		id: 'INT IDENTITY',
		stockId: 'INT',
		TransDate: 'DATETIME',
		quantity: 'INT',
		transType: 'INT',
		transState: 'INT'
	},
	good: {
		id: 'INT IDENTITY',
		transId: 'INT',
		goodState: 'INT',
		position: 'STRING'
	},
	user: {
		id: 'INT IDENTITY',
		userName: 'STRING',
		password: 'STRING',
		userGroup: 'INT',
		inv: 'INT',
		maker: 'INT'
	},
	config: {
		id: 'INT IDENTITY',
		data: 'STRING'
	}
};

DB.load = function() {
	if(debug) console.log('DB.load has been called.');

	alasql.options.joinstar = 'overwrite';

	alasql.promise = function(sql, params) {
		return new Promise(function(resolve, reject) {
			alasql(sql, params, function(data, err) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	};

	var p = [];

	for (var x in DB.tables) {
		var table = DB.tables[x];
		alasql('DROP TABLE IF EXISTS ' + x + ';');
		var sql = 'CREATE TABLE ' + x;
		var val = '';
		for (var y in table) {
			sql += val ? ', ' : '(';
			sql += y + ' ' + table[y];
			val += val ? ',?' : '?';
		}
		sql += ');';
		alasql(sql);
		if (debug) console.log(sql + ');');
		if (x == 'config' || x == 'good') continue;
		var csv = x.toUpperCase() + '-' + x.toUpperCase();
		(function (xx, vv) {
			p.push(alasql.promise('SELECT MATRIX * FROM CSV("data/' + csv + '.csv", {headers: true})').then(function(data) {
				for (var i = 0; i < data.length; i++) {
					alasql('INSERT INTO ' + xx + ' VALUES(' + vv + ');', data[i]);
					if(debug) console.log('INSERT INTO ' + xx + ' VALUES(' + vv + ');', data[i]);
				}
			}));
		})(x, val)
	}
	
	Promise.all(p).then(function() {
		Pos.init();
		DB.generate();
		index.refresh();
	});
};

DB.generate = function() {
	// Generate `good` records according to `trans`
	if(debug) console.log('DB.generate has been called.');
	var r = alasql('SELECT id, type FROM trans');
	for (var i in r) {
		if (r[i].type == 1) { // inport
			
		}
		if (r[i].type == 2) { // export

		}
	}

	for (var i = 0; i < r.length; i++) {
		if (r[i].quantity >= 0) {
			while (r[i].quantity--) {
				Goods.new(r[i].id, 9);
			}
		} else {
			Trans.mappedToGoods(r[i].id, 21, 9);
		}
		Trans.updateBalance(r[i].id);
	}
	// Generate stock according to `item` and `whouse`
	var stockId = 46;
	for (var whouse = 1; whouse <= 4; whouse++) {
		for (var item = 1; item <= 18; item++) {
			if (alasql('SELECT count(*) AS cnt FROM stock WHERE itemId = ? and whouseId = ?', [item, whouse])[0].cnt == 0) {
				alasql('INSERT INTO stock VALUES (?,?,?,?,?,?)', [++stockId, item, whouse, 10, 100, 0]);
			}
		}
	}
	if(debug) console.log('DB.generate has finished.');
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE EMP');
	alasql('USE EMP');
} catch (e) {
	alasql('CREATE localStorage DATABASE EMP');
	alasql('ATTACH localStorage DATABASE EMP');
	alasql('USE EMP');
	DB.load();
}