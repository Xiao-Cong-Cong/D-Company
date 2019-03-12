var DB = {};

// friend

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
}

DB.remove = function() {
	if (window.confirm('are you sure do delete dababase?')) {
		alasql('DROP localStorage DATABASE EMP')
	}
};

DB.complexQuery = function(fields, targetTable, joinTables, conditions) {
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
		kind: 'STRING'
	},
	maker: {
		id: 'INT IDENTITY',
		maker: 'STRING'
	},
	item: {
		id: 'INT IDENTITY',
		code: 'STRING',
		kindId: 'INT',
		itemName: 'STRING',
		makerId: 'INT',
		importPrice: 'INT',
		transProfit: 'INT',
		exportProfit: 'INT',	///
		unit: 'STRING'
	},
	whouse: {
		id: 'INT IDENTITY',
		whouseName: 'STRING',	///
		shelfNum: 'INT',		///
		rowNum: 'INT',			///
		colNum: 'INT'			///
	},
	stock: {
		id: 'INT IDENTITY',
		itemId: 'INT',
		whouseId: 'INT',
		minimum: 'INT',			///
		maximum: 'INT',
		balance: 'INT'
	},
	trans: {
		id: 'INT IDENTITY',
		stockId: 'INT',
		date: 'DATETIME',
		quantity: 'INT',		///
		type: 'INT',
		tstate: 'INT',
		memo: 'STRING'
	},
	good: {
		id: 'INT IDENTITY',
		transId: 'INT',
		state: 'INT',
		position: 'STRING',
		history: 'STRING'
	},
	user: {
		id: 'INT IDENTITY',
		name: 'STRING',
		pswd: 'STRING',
		grp: 'INT',
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
		alasql(sql + ');');
		// console.log(sql + ');');
		if (x == 'config' || x == 'good') continue;
		var csv = x.toUpperCase() + '-' + x.toUpperCase();
		(function (xx, vv) {
			p.push(alasql.promise('SELECT MATRIX * FROM CSV("data/' + csv + '.csv", {headers: true})').then(function(data) {
				for (var i = 0; i < data.length; i++) {
					alasql('INSERT INTO ' + xx + ' VALUES(' + vv + ');', data[i]);
					// if(xx == 'trans') console.log('INSERT INTO ' + xx + ' VALUES(' + vv + ');', data[i]);
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
	if(debug) console.log('called generate function');
	var r = alasql('SELECT id, quantity, stockId FROM trans');
	for (var i = 0, id = 1; i < r.length; i++) {
		if (r[i].quantity >= 0) {
			for (var j = 0; j < r[i].quantity; j++) {
				var position = Pos.suggest(r[i].stockId);
				console.log(position);
				alasql('INSERT INTO good(id, transId, state, position) \
						VALUES (?,?,9,?);', [id++, r[i].id, position]);
				Pos.update(position);
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
	if(debug) console.log('Generation finished.');
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