var customer = {
    keywords: [],
    order: {}
};

// Public

customer.init = function() {
    var whouses = alasql('SELECT whouseName FROM whouse');
    for (var i = 0; i < whouses.length; i++) {
        $('#whouse8').append('<option>' + whouses[i].whouseName + '</option>')
    }
    $('#whouse8').change(function() {
        customer.update();
    });

    $('#search').keyup(function() {
        var val = $('#search').val();
        customer.keywords = val.split(' ');
        customer.update();
    });

    $('#submitOrder').click(function() {
        if (!$(this).hasClass('disabled')) { 
            customer.submitOrder();
        }
    });

    customer.changeHeight();
    $(window).resize(function() {
        customer.changeHeight();
    });
    
    customer.update();
}

customer.update = function() {
    $('#tbody8').empty();
    customer.order = {};
    var r = DB.complexQuery('stock.id, itemId, whouseId, maximum, item.code, whouseName, kind.kind, maker.maker, item.itemName, balance, item.unit',
                            'stock', 'whouse, item, kind, maker');
    var t = {};
    for (var i = 0; i < r.length; i++) {
        var x = r[i].itemId;
        t[x] = t[x] == undefined ? r[i].balance : t[x] + r[i].balance;
    }
    var h = Tool.search(r, 'code, kind, maker, itemName', customer.keywords);
    for (var i = 0; i < r.length; i++) {
        var mode = config.maximumMode[r[i].whouseId];
        var tmp = {'Balance': r[i].balance, 'Share': t[r[i].itemId], 'Maximum': r[i].maximum};
        r[i].bal = tmp[mode];
        if (r[i].bal) {
            r[i].input = '<div class="col-xs-10" id="'+i+'"><input type="number" value=0 id="' + i
                       + 'i" class="itemNum"></div><div class="col-xs-2">/</div>';
        } else {
            r[i].input = '<div class="col-xs-9 col-xs-offset-1" id="'+i+'">Out of Stock</div><div class="col-xs-2">/<div>';
        }
        customer.order[r[i].id] = 0;
    }
    var rr = Tool.sortTable(r, h, 'code, kind, maker, itemName', 'code, kind, maker, itemName, input, bal, unit');
    Tool.displayTable('tbody8', rr, 'code, kind, maker, itemName, input, bal, unit');

    for (var i = 0; i < r.length; i++) {
        if (r[i].whouseName == $('#whouse8').val()) {
            $('#'+i).parent().parent().show();
        } else {
            $('#'+i).parent().parent().hide();
        }
    }
    $('.itemNum').change(function() {
        updateOrder($(this)[0]);
    });

    function updateOrder(input) {
        var num = parseInt(input.value);
        var i = parseInt(input.id);
        // console.log(num, i);
        if (num > r[i].bal) {
            input.value = num = r[i].bal;
        } else if (num <= 0 || isNaN(num)) {
            input.value = num = 0;
        }
        input.value = customer.order[r[i].id] = num;
        updateSubmitButton();
    }
    function updateSubmitButton() {
        var sum = 0;
        for (var i in customer.order) {
            sum += customer.order[i];
        }
        if (sum <= 0) { $('#submitOrder').addClass('disabled'); }
        else { $('#submitOrder').removeClass('disabled'); }
    }
}

customer.submitOrder = function() {
    for (var i in customer.order) {
        if (customer.order[i] > 0) {
            Trans.new(i, -customer.order[i], 2, 'Exportation made by customers');
        }
    }
    alert('Successfully make a new order!');
    index.refresh();
}

customer.changeHeight = function() {
    var h = $(window).height() - 162;
    if (h > 0) {
        $('#orderList').show();
        $('#orderList').css({
            'overflow-y': 'auto',
            'min-height': h + 'px',
            'max-height': h + 'px'
        });
    } else {
        $('#orderList').hide();
    }
}

// Initialization

customer.init();
