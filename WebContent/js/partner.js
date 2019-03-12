var driverTable = createTable();
var customerTable = createTable();

var maker = {
    table: createTable(),
    init: function() {
        this.initTable();
    }
};

maker.initTable = function() {
    var title = 'Production Orders';
    var thead = ['Order Date', 'Warehouse', 'Product Code', 'Product Name', 'Order Quantity', 'Unit', 'Operation'];
    maker.table.setTableTitle(title);
    maker.table.setThead(thead);
    maker.table.hide('toolBar, modal');
};


maker.init = function() {
    // maker login
    if (S.ugid == 3) {
        var condition = ' AND maker.maker = ' + S.uName;
    } else {
        var condition = '';
    }

    var r = DB.complexQuery('trans.id, date, whouseName, item.code, item.itemName, quantity, item.unit',
                            'trans', 'stock, item, whouse, maker', 'tstate = 1 AND type = 1' + condition);
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



<div class="container">
    <h2>Transportation Tasks</h2>
    <table class="table table-stripped">
        <thead>
            <tr>
                <th>Order Date</th>
                <th>Type</th>
                <th>Departure</th>
                <th>Destination</th>
                <th>Product Code</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Operation</th>
            </tr>
        </thead>
        <tbody id="tbody4"></tbody>
    </table>
</div>

var driver = {};

driver.init = function() {
    var r = DB.complexQuery('state, trans.id, trans.date, type, trans.quantity, whouseName, item.code, item.unit, maker.maker', 'good',
                            'trans, stock, whouse, item, maker', 'state IN (3, 4, 12, 13, 18, 19)');

    for (var i = 0; i < r.length; i++) {
        var type = r[i].type - 1;
        r[i].type = type ? 'Exportation' : 'Importation';
        r[i].from = type ? r[i].whouseName : r[i].maker;
        r[i].to = type ? r[i].maker : r[i].whouseName;
        r[i].btn = '<button transId="' + r[i].id + '" class="btn btn-xs btn3 ';
        r[i].btn += r[i].state % 3 ? 'btn-warning">Finish Transportation' : 'btn-primary">Start Transportation';
        r[i].btn += '</button>';
    }

    Tool.displayTable('tbody4', r, 'date, type, from, to, code, quantity, unit, btn');

    $('.btn3').click(function() {
        var transId = parseInt($(this).attr('transId'));
        Trans.continue(transId);
        index.refresh();
    });
}

// Initialization

driver.init();
