var Trans = {
    type: {
        IMPORT: 1,
        EXPORT: 2
    },
    tstate: {
        WAITED: 1,
        MAPPED: 2,
        FINISH: 3,
        REFUSE: 4
    },
    newImport: function(stockId, quantity) {
        Trans.new(stockId, quantity, Trans.type.IMPORT);
    },
    newExport: function(stockId, quantity) {
        Trans.new(stockId, -quantity, Trans.type.EXPORT);
    },
    confirmImport: function(transId) {
        Trans.confirm(transId);
        Goods.create(transId);
    },
    confirmExport: function(transId) {

    },
    refuseImport: function(transId) {

    },
    refuseExport: function(transId) {

    },
    continue: function(transId) {
        var x = Trans.getGoodState(transId);
        Goods.updateState(transId, x + 1);
    }
};

// Private

Trans.new = function(stockId, quantity, type) {
    if (debug) console.log('Trans.new has been called.');
    var r = {
        id: Trans.getNewId(),
        stockId: stockId,
        date: Date.getTime(),
        quantity: quantity,
        type: type,
        tstate: Trans.tstate.WAITED
    };
    var ok = alasql('INSERT INTO trans VALUES ?;', [r]);
};

Trans.getGoodState = function(transId) {
    var x = alasql('SELECT DISTINCT state FROM good WHERE transId = ' + transId)[0].state;
    return x;
}

Trans.confirmImport = function(transId) {
    if (debug) console.log('Trans.confirmImport has been called.');
    var whouseId = DB.complexQuery('stock.whouseId', 'trans', 'stock', 'trans.id = ' + transId)[0].whouseId;
    var r = DB.complexQuery('trans.quantity', 'good', 'trans, stock',
                            'good.state in (3,4,5,6) AND stock.whouseId = ' + whouseId);
    var importingWhouse = sum(r, 'quantity');
    var whouseSpare = Pos[whouseId].total - Pos[whouseId].used - importingWhouse;
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
    if (Math.abs(t.quantity) <= t.balance) {
        var type = alasql('SELECT type FROM trans WHERE id = ' + transId)[0].type;
        Trans.mappedToGoods(transId, 16, 9);
        Trans.updateBalance(transId);
        return true;
    } else {
        return false;
    }
};

Trans.confirm = function(transId) {
    var type = alasql('SELECT type FROM trans WHERE id = ' + transId)[0].type;
    if (type == Trans.type.IMPORT) {
        Trans.confirmImport();
    }
    if (type == Trans.type.EXPORT) {
        Trans.confirmExport();
    }
    Trans.updateTstate(transId, Trans.tstate.MAPPED);
}

Trans.finish = function(transId) {
    Trans.updateTstate(transId, Trans.tstate.FINISH);
}

Trans.refuse = function(transId) {
    Trans.updateTstate(transId, Trans.tstate.REFUSE);
};

// private

Trans.getNewId = function() {
    return alasql('SELECT MAX(id) as id FROM trans;')[0].id + 1;
}

Trans.updateBalance = function(transId) {
    var r = DB.complexQuery('stock.id, balance, quantity', 'trans', 'stock', 'trans.id = ' + transId)[0];
    alasql('UPDATE stock SET balance = ? WHERE id = ?;', [r.balance + r.quantity, r.id]);
};

Trans.updateTstate = function(transId, state) {
    alasql('UPDATE trans SET tstate = ? WHERE id = ?;', [state, transId]);
}

Trans.confirmImport = function(transId) {
    Goods.new(transId);
}

Trans.confirmExport = function(transId) {
    Goods.pick(transId);
}