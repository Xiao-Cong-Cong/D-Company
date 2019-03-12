var Trans = {
    type: {
        1: 'inport from maker',
        2: 'sale export',
        3: 'transfer import',
        4: 'transfer export',
        5: 'other'
    },
    tstate: {
        1: 'wait to deal',
        2: 'mapped to goods',
        3: 'finished',
        4: 'refused'
    },
    mstate: {
        0: 'unpaid',
        1: 'paid'
    }
};

// public

Trans.new = function(stockId, quantity, type, memo, from) {
    if (debug) console.log('Trans.new has been called.');
    var r = {
        id: Trans.getNewId(),
        stockId: parseInt(stockId),
        date: Date.getTime(),
        quantity: parseInt(quantity),
        type: parseInt(type),
        tstate: 1,
        memo: memo
    };
    var ok = alasql('INSERT INTO trans VALUES ?;', [r]);
    console.log(r, ok);
};

Trans.confirmImport = function(transId) {
    if (debug) console.log('Trans.confirmImport has been called.');
    var whouseId = DB.complexQuery('stock.whouseId', 'trans', 'stock', 'trans.id = ' + transId)[0].whouseId;
    var r = DB.complexQuery('trans.quantity', 'good', 'trans, stock',
                            'good.state in (3,4,5,6) AND stock.whouseId = ' + whouseId);
    var importingWhouse = sum(r, 'quantity');
    var whouseSpare = Pos.condition(whouseId).spare - importingWhouse;
    var r = DB.complexQuery('stock.maximum, stock.balance', 'trans', 'stock', 'trans.id = ' + transId)[0];
    var stock = alasql('SELECT stockId FROM trans WHERE id = ' + transId)[0].stockId;
    var r = DB.complexQuery('trans.quantity', 'good', 'trans',
                            'good.state in (3,4,5,6) AND trans.stockId = ' + stock);
    var importingItem = sum(r, 'quantity');
    var itemSpare = r.maximum - r.balance - importingItem;
    var spare = whouseSpare > itemSpare ? itemSpare : whouseSpare;
    var qty = alasql('SELECT quantity FROM trans WHERE id = ' + transId)[0].quantity;
    console.log('importingWhouse = ', importingWhouse, 'whouseSpare = ', whouseSpare, 'importingItem = ', importingItem, 'itemSpare = ', itemSpare, 'spare = ', spare);
    if (qty <= spare) {
        Trans.mappedToGoods(transId, 3);
    } else {
        alert('There isn\'t enough space for the target inventory to put!');
    }

    function sum(a, name) {
        var res = 0;
        for (var i in a) {
            res += a[i][name];
        }
        return res;
    }
};

Trans.confirmExport = function(transId) {
    t = DB.complexQuery('quantity, balance', 'trans', 'stock', 'trans.id = ' + transId)[0];
    if (debug) console.log('confirmExport has been called.', t.quantity, t.balance);
    if (Math.abs(t.quantity) <= t.balance) {
        var type = alasql('SELECT type FROM trans WHERE id = ' + transId)[0].type;
        Trans.mappedToGoods(transId, 16, 9);
        Trans.updateBalance(transId);
        return true;
    } else {
        return false;
    }
};

Trans.refuse = function(transId) {
    alasql('UPDATE trans SET tstate = 4 WHERE id = ?;', [transId]);
};

Trans.continue = function(transId, y) {
    if (debug) console.log('Trans.continue has been called. transId = ', transId, ' y = ', y);
    var x = alasql('SELECT DISTINCT state FROM good WHERE transId = ?;', [transId])[0].state;
    if (y == undefined) {
        y = x + 1;
    }
    // In this version, skip checking and update related info
    if (y == 7) {
        Trans.updateBalance(transId);
        Trans.finish(transId);
        y = 9;
    }
    alasql('UPDATE good SET state = ? WHERE transId = ?;', [y, transId]);
    if (y == 6) {
        var stock = alasql('SELECT stockId FROM trans WHERE id = ' + transId)[0].stockId;
        var g = alasql('SELECT id FROM good WHERE transId = ' + transId);
        for (var i = 0; i < g.length; i++) {
            var position = Pos.suggest(stock);
            console.log(position);
            alasql('UPDATE good SET position = ? WHERE id = ?;', [position, g[i].id]);
            Pos.update(position);
        }
    }
    Trans.updatePos(transId);
}

Trans.finish = function(transId) {
    alasql('UPDATE trans SET tstate = 3 WHERE id = ?;', [transId]);
    Trans.updatePos(transId);
}

// private

Trans.getNewId = function() {
    if (debug) console.log('Trans.getNewId has been called.');
    var res = alasql('SELECT MAX(id) as id FROM trans;')[0].id + 1;
    console.log(res);
    return res;
}

Trans.mappedToGoods = function(transId, toState, fromState) {
    if (debug) console.log('Trans.mappedToGoods has been called. transId = ', transId, ' toState = ', toState, ' fromState = ', fromState);
    alasql('UPDATE trans SET tstate = 2 WHERE id = ?;', [transId]);
    var quantity = Math.abs(alasql('SELECT quantity FROM trans WHERE id = ?;', [transId])[0].quantity);
    while(quantity--) {
        if (fromState == undefined) {   // create some new goods
            alasql('INSERT INTO good(id, transId, state) VALUES (?,?,?);', [Goods.getNewId(), transId, toState]);
        } else { // change from old states (There is always enough goods to trans)
            var stockId = alasql('SELECT stockId FROM trans WHERE id = ?;', [transId])[0].stockId;
            var oldId = DB.complexQuery('min(trans.id) as id', 'good', 'trans',
                                        'state = ' + fromState + ' AND stockId = ' + stockId + ' AND tstate = 3')[0].id;
            var goodId = alasql('SELECT min(id) as id FROM good WHERE transId = ? AND state = ?;', [oldId, fromState])[0].id;
            console.log('goodId = ', goodId);
            var ok = alasql('UPDATE good SET state = ?, transId = ? WHERE id = ?', [toState, transId, goodId]);
            if(debug) console.log('transId = ', transId, 'stockId = ', stockId, 'oldId = ', oldId, 'goodId = ', goodId, 'ok = ', ok);
        }
    }
    Trans.updatePos(transId);
    // something write for callee db.js
    if (toState == 21) {
        Trans.finish(transId);
    }
};

Trans.updateBalance = function(transId) {
    var stockId = parseInt(alasql('SELECT stockId FROM trans WHERE id = ?;', [transId])[0].stockId);
    var balance = parseInt(alasql('SELECT balance FROM stock WHERE id = ?;', [stockId])[0].balance);
    var quantity = parseInt(alasql('SELECT quantity FROM trans WHERE id = ?;', [transId])[0].quantity);
    var newBalance = balance + quantity;
    alasql('UPDATE stock SET balance = ? WHERE id = ?;', [newBalance, stockId]);
};

Trans.updatePos = function(transId) {
    if (debug) console.log('Trans.updatePos, transId = ', transId);
    var p = alasql('SELECT position FROM good WHERE transId = ' + transId);
    for (var i = 0; i < p.length; i++) {
        console.log(p[i].position);
        Pos.update(p[i].position);
    }
}