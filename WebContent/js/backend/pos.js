var Pos = {
    show: function(whouseId) {

    },
};

Pos.init = function() {
    var whouses = alasql('SELECT id, whouseName, shelfNum, rowNum, colNum, usedSpace, totalProfit FROM whouse;');
    Pos.invs = whouses.length;
    for (var i = 0; i < whouses.length; i++) {
        var x = whouses[i];
        Pos[x.id] = {
            name: x.whouseName,
            shelves: x.shelfNum,
            rows: x.rowNum,
            cols: x.colNum,
            used: x.usedSpace,
            total: x.shelfNum * x.rowNum * x.colNum,
            profit: x.totalProfit,
            addProfit: function(amount) {
                this.profit += amount;
                alasql('UPDATE whouse SET totalProfit = ? WHERE id = ?;', [this.profit, x.id]);
            }
        };
    }
    Pos.update();
}

Pos.suggest = function(x) {
    for (var s = 1; s <= Pos[x].shelves; s++) {
        for (var r = 1; r <= Pos[x].rows; r++) {
            for (var c = 1; c <= Pos[x].cols; c++) {
                if (Pos[x][s][r][c] == 0) {
                    var position = x+'-'+s+'-'+r+'-'+c;
                    if (debug) console.log('Pos.suggest for Inv ', x, ' is ', position);
                    return position;
                }
            }
        }
    }
}

Pos.update = function() {
    if (debug) console.log('Pos.update has been called.');
    Pos.clearItem();
    var r = alasql('SELECT id, position FROM good WHERE state in (6,7,8,9,10,11,16,17);');
    for (var i = 0; i < r.length; i++) {
        if (r[i].position == undefined) continue;
        var p = r[i].position.split('-');
        Pos[i[0]][i[1]][i[2]][i[3]] = r[i].id;
        Pos[i[0]].used++;
    }
    for (var x = 1; x <= Pos.invs; x++) {
        alasql('UPDATE whouse SET usedSpace = ? WHERE id = ?;', [Pos[x].used, x]);
    }
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
                if (Pos[x][s][r][c]) {
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
    for (var i = 0; i < goods.length; i++) {
        var now = goods[i].position;
        $('#'+now).removeClass('occupied');
        $('#'+now).addClass(type);
    }
}

// Private

Pos.clearItem = function() {
    for (var x = 1; x <= Pos.invs; x++) {
        for (var s = 1; s <= Pos[x].shelves; s++) {
            Pos[x][s] = {};
            for (var r = 1; r <= Pos[x].rows; r++) {
                Pos[x][s][r] = {};
                for (var c = 1; c <= Pos[x].cols; c++) {
                    Pos[x][s][r][c] = 0;
                }
            }
        }
        Pos[x].used = 0;
    }
}

// Initialization

Pos.init();
