var maker = {};

maker.init = function() {
    var r = DB.complexQuery('trans.id, date, whouseName, item.code, item.itemName, quantity, item.unit',
                             'trans', 'stock, item, whouse', 'tstate = 1 AND type = 1');
    for (i in r) {
        r[i].btn = '<button transId="' + r[i].id + '" class="btn btn-success btn-xs btn0">Produced</button>';
    }

    Tool.displayTable('tbody3', r, 'date, whouseName, code, itemName, quantity, unit, btn');

    $('.btn0').click(function() {
        var transId = parseInt( $(this).attr('transId') );
        Trans.confirmImport(transId);
        index.refresh();
    });
}

// Initialization

maker.init();