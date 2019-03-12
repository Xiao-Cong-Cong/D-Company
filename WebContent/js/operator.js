var op = {
    name: {
        5: 'Import',
        7: 'Export'
    },
    states: {
        5: '5, 6',
        7: '16, 17'
    },
    x: {
        5: 5,
        7: 16
    },
    y: {
        5: 6,
        7: 17
    },
    confirm: {
        5: 'Finished Placing',
        7: 'Finished Picking'
    },
    btn1: {
        5: 'Importation',
        7: 'Exportation'
    },
    S: function(x) {
        return op[x][S.role];
    }
};

// Public

op.init = function() {
    $('#header-op').text('Task Lists for ' + Pos[S.inv].name + '\'s ' + op.S('name') + ' Operator');
    $('#confirm-op').text(op.S('confirm'));
    op.initList();
}

// Private

op.initList = function() {
    var r = DB.complexQuery('good.state, trans.id, trans.date, item.code, item.itemName, trans.quantity, item.unit', 'good', 'trans, stock, item',
                            'good.state IN (' + op.S('states') + ') AND stock.whouseId = ' + S.inv);
    if (debug) console.log('op.initList', r);

    for (i in r) {
        r[i].btn = '<button transId="' + r[i].id + '" class="btn btn-xs ';
        if (r[i].state == op.S('x')) {
            r[i].btn += 'btn-primary btn-op1">Start ' + op.S('btn1');
        } else if (r[i].state == op.S('y')) {
            r[i].btn += 'btn-warning btn-op2" data-toggle="modal" \
                         data-target="#goodsPositionModal">Select Positions';
        }
        r[i].btn += '</button>';
    }

    Tool.displayTable('tbody-op', r, 'date, code, itemName, quantity, unit, btn');

    Pos.show(S.inv).appendTo($('#pos-graph'));

    $('.btn-op1').click(function() {
        var transId = parseInt($(this).attr('transId'));
        Trans.continue(transId);
        index.refresh();
    });
    
    $('.btn-op2').click(function() {
        var transId = parseInt($(this).attr('transId'));
        if (S.role == 7) {
            Pos.highlight(transId, 'selected');
        } else if (S.role == 5) {
            Pos.highlight(transId, 'suggested');
        }
        $('#confirm-op').click(function() {
            Trans.continue(transId);
            $('#goodsPositionModal').modal('hide');
        });
        $('#goodsPositionModal').on('hidden.bs.modal', function(e) {
            index.refresh();
        });
    });
}

// Initialization

op.init();