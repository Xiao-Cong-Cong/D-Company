var Goods = {
    state: {
        PRODUCED: 3,
        IMPORT_TRANSPORTING: 4,
        IMPORT_WAITING: 5,
        IMPORTING: 6,
        IMPORTED: 7,
        CHECKING: 8,
        STORING: 9,
        EXPORT_WAITING: 16,
        EXPORTING: 17,
        EXPORTED: 18,
        EXPORT_TRANSPORTING: 19,
        CONFIRM_WAITING: 20,
        FINISHED: 21
    },
    create: function(transId) {
        Goods.insert(transId, 3);
    },
    import: function(transId) {
        Goods.setPosition(transId);
    },
    export: function(transId) {
        
    }
};

// Public

Goods.getNewId = function() {
    return alasql('SELECT MAX(id) as id FROM good;')[0].id + 1;
}

Goods.insert = function(transId, state) {
    alasql('INSERT INTO good(id,transId,state) VALUES (?,?,?);', [Goods.getNewId(), transId, state]);
}

Goods.put = function(transId) {
    var g = alasql('SELECT id FROM good WHERE transId = ' + transId);
    var inv = DB.complexQuery('whouse.id', 'trans', 'stock, whouse', 'trans.id = ' + transId)[0].id;
    for (var i in g) {
        var position = Pos.suggest(inv);
        alasql('UPDATE good SET position = ? WHERE id = ?;', [position, g[i].id]);
    }
    Pos.update();
}

Goods.pick = function(transId) {
    var r = DB.complexQuery('stockId, quantity, state', 'good', 'trans', 'trans.id = ' + transId)[0];
    while(r.quantity--) {
        var old = DB.complexQuery('min(trans.id) AS trans, min(good.id) AS good', 'good', 'trans', 'state = 9 AND stockId = ' + stockId);

        var goodId = alasql('SELECT min(id) as id FROM good WHERE transId = ? AND state = ?;', [oldId, fromState])[0].id;
        var ok = alasql('UPDATE good SET state = ?, transId = ? WHERE id = ?', [toState, transId, goodId]);
    }
}

Goods.updateState = function(transId, y) {
    if (y == Goods.state.IMPORTED) {
        y = Goods.state.STORING;
        Goods.put(transId);
        Trans.updateBalance(transId);
        Trans.finish(transId);
    }
    if (y == Goods.state.EXPORTED) {
        Pos.update();
    }
    if (y == Goods.state.CONFIRM_WAITING) {
        y = Goods.state.FINISHED;
        Trans.finish(transId);
    }
    alasql('UPDATE good SET state = ? WHERE transId = ?;', [y, transId]);
}
