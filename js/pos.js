var Pos = {};

Pos.init = function() {
    var whouses = alasql('SELECT id, whouseName, shelfNum, rowNum, colNum FROM whouse;');
    Pos.invs = whouses.length;
    for (var i = 0; i < whouses.length; i++) {
        var x = whouses[i];
        Pos[x.id] = {
            name: x.whouseName,
            shelves: x.shelfNum,
            rows: x.rowNum,
            cols: x.colNum,
            used: 0,
            importing: 0,
        };
        for (var s = 1; s <= x.shelfNum; s++) {
            Pos[x.id][s] = {};
            for (var r = 1; r <= x.rowNum; r++) {
                Pos[x.id][s][r] = {};
            }
        }
    }
    // console.log(Pos);
}

Pos.suggest = function(stock) {
    if (debug) console.log('Pos.suggest has been called.');
    var x = alasql('SELECT whouseId FROM stock WHERE id = ?;', [stock])[0].whouseId;
    for (var s = 1; s <= Pos[x].shelves; s++) {
        for (var r = 1; r <= Pos[x].rows; r++) {
            for (var c = 1; c <= Pos[x].cols; c++) {
                if (Pos.check(x, s, r, c) == 0) {
                    return x+'-'+s+'-'+r+'-'+c;
                }
            }
        }
    }
}

Pos.update = function(position) {
    if (position != undefined) {
        var i = position.split('-');
        var x = alasql('SELECT id FROM good WHERE state in (6,7,8,9,10,11,16,17) AND position = ?;', [position]);
        Pos[i[0]][i[1]][i[2]][i[3]] = (x == undefined || x.length == 0) ? 0 : x[0].id;
        console.log('Pos.update has run, position = ', position, Pos[i[0]][i[1]][i[2]][i[3]]);
    }
}

Pos.condition = function(x) {
    var p = Pos[x], used = 0, profit = 0, value = 0;
    var tot = p.shelves * p.rows * p.cols;
    for (var s = 1; s <= p.shelves; s++) {
        for (var r = 1; r <= p.rows; r++) {
            for (var c = 1; c <= p.cols; c++) {
                if (Pos.check(x, s, r, c)) {
                    used++;
                }
            }
        }
    }
    var t = DB.complexQuery('quantity, transProfit', 'trans', 'stock, item', 'type = 4 AND tstate = 3 AND whouseId = ' + x);
    t = t.concat(DB.complexQuery('quantity, exportProfit', 'trans', 'stock, item', 'type = 2 AND tstate = 3 AND whouseId = ' + x));
    for (var i = 0; i < t.length; i++) {
        profit -= (t[i].transProfit == undefined ? t[i].exportProfit : t[i].transProfit) * t[i].quantity;
    }
    var v = DB.complexQuery('balance, importPrice', 'stock', 'item', 'whouseId = ' + x);
    for (var i = 0; i < v.length; i++) {
        value += v[i].balance * v[i].importPrice;
    }
    return {spare: Tool.commas(tot-used), total: Tool.commas(tot), profit: Tool.commas(profit), value: Tool.commas(value)};
}

Pos.countImport = function(x) {
    var res = DB.complexQuery('count(*) AS cnt', 'good', 'trans, stock', 
                              'good.state < 9 AND trans.tstate < 4 AND trans.type = 1 AND stock.whouseId = ' + x.id)[0].cnt;
    console.log(x.id, 'importing', res);
    return res;
}

Pos.show = function(x) {
    var res = $('<div>');
    for (var s = 1; s <= Pos[x].shelves; s++) {
        res.append('<h3>Shelf '+ s +' of '+ Pos[x].name +'\'s Inventory</h3>');
        var table = $('<table>'), tbody = $('<tbody>');
        for (var r = 1; r <= Pos[x].rows; r++) {
            var tr = $('<tr>');
            for (var c = 1; c <= Pos[x].cols; c++) {
                var now = x+'-'+s+'-'+r+'-'+c;
                var td = $('<td id="' + now + '" class="gezi">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>');
                if (Pos.check(x, s, r, c)) {
                    td.addClass('occupied');
                }
                td.appendTo(tr);
            }
            tr.appendTo(tbody);
        }
        tbody.appendTo(table);
        table.appendTo(res);
    }
    return res;
}

Pos.highlight = function(transId, type) {
    goods = alasql('SELECT position FROM good WHERE transId = ' + transId);
    console.log(transId, goods);
    for (var i = 0; i < goods.length; i++) {
        var now = goods[i].position;
        $('#'+now).removeClass('occupied');
        $('#'+now).addClass(type);
    }
}

// Private

Pos.check = function(x, s, r, c) {
    if (Pos[x][s][r][c] == undefined) {
        Pos.update(x+'-'+s+'-'+r+'-'+c);
    }
    return Pos[x][s][r][c];
}

// Initialization

Pos.init();
