var request = {
    data: {},
    keywords: []
};

request.init = function() {
    $('#search').keyup(function() {
        request.keywords = $('#search').val().split(' ');
        request.update();
    });

    $('#autoHandle').click(function() {
        var r = request.data;
        console.log('autoHandle has been clicked! ', r);
        for (i in r) {
            console.log(r[i]);
            if (-r[i].quantity <= r[i].balance) {
                Trans.confirmExport(r[i].id);
            }
        }
        request.update();
    });

    $('#modal3').load('template/tabs/newImportation.html');

    request.update();
}

request.update = function() {
    $('#tbody2-1').empty();
    var r = DB.complexQuery('trans.id, stockId, date, item.code, kind.kind, item.itemName, quantity, maker.maker, stock.balance, item.unit', 'trans',
    'stock, item, kind, maker', 'trans.type = 2 AND trans.tstate = 1 AND stock.whouseId = ' + S.inv);
    var h = Tool.search(r, 'date, code, itemName, maker', request.keywords);
    for (var i = 0; i < r.length; i++) {
        request.data[i] = {};
        for (var x in r[i]) {
            request.data[i][x] = r[i][x];
        }
        var confirm = '<button transId="' + r[i].id + '" class="btn btn-primary btn-xs confirmEx">Confirm</button>';
        var refuse = '<button transId="' + r[i].id + '" class="btn btn-danger btn-xs refuseEx">Refuse</button>';
        var trans = '<button transId="' + r[i].id + '" class="btn btn-success btn-xs transEx">Import</button>';
        var blank = '&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;';
        r[i].btn = (r[i].balance >= -r[i].quantity ? confirm : trans) + blank + refuse;
        r[i].quantity = '<div class="col-md-7">' + r[i].quantity + '</div><div class="col-md-2">/</div>';
    }
    var rr = Tool.sortTable(r, h, 'date, code, itemName, maker', 'date, code, itemName, maker, quantity, balance, unit, btn');
    Tool.displayTable('tbody2-1', rr, 'date, code, itemName, maker, quantity, balance, unit, btn');

    $('.confirmEx').click(function() {
        if (!Trans.confirmExport(parseInt($(this).attr('transId')))) {
            alert('There is not enough goods!');
        }
        request.update();
    });
    $('.refuseEx').click(function() {
        Trans.refuse(parseInt($(this).attr('transId')));
        request.update();
    });
    $('.transEx').click(function() {
        $('#modal3').modal('show');
        var transId = parseInt($(this).attr('transId'));
        var itemId = DB.complexQuery('item.id', 'trans', 'stock, item', 'trans.id = ' + transId)[0].id;
        importation.new(itemId);
    });
}

// Initialization

request.init();