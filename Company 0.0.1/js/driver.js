if (S.ugid == 4 || (S.ugid == 1 && S.role == 4)) {
    var r = DB.complexQuery('state, trans.id, trans.date, type, trans.quantity, whouseName, item.code, item.unit, maker.maker', 'good',
                            'trans, stock, whouse, item, maker', 'state IN (3, 4, 12, 13, 18, 19)');

    for (var i = 0; i < r.length; i++) {
        var type = r[i].type - 1;
        r[i].type = type ? 'Exportation' : 'Importation';   // TODO: add `transfer` type and handle this type
        r[i].from = type ? r[i].whouseName : r[i].maker;
        r[i].to = type ? r[i].maker : r[i].whouseName;
        r[i].btn = '<button transId="' + r[i].id + '" state="' + r[i].state + '" class="btn btn-xs btn3 ';
        r[i].btn += r[i].state % 3 ? 'btn-warning">Finish Transportation' : 'btn-primary">Start Transportation';
        r[i].btn += '</button>';
    }

    console.log(r);

    Tool.displayTable('tbody4', r, 'date, type, from, to, code, quantity, unit, btn');

    $('.btn3').click(function() {
        var transId = parseInt( $(this).attr('transId') );
        var state = parseInt( $(this).attr('state') );
        var res = alasql('UPDATE good SET state = ? WHERE transId = ?', [state+1, transId]);
        if (state == 19) {
            alasql('UPDATE good SET state = 21 WHERE transId = ?', [transId]);
            Trans.finish(transId);
        }
        index.refresh();
    });
}