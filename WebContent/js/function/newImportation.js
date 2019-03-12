var importation = {};

importation.init = function() {
    var w = alasql('SELECT * FROM whouse;');
    for (var i = 0; i < w.length; i++) {
        var option = $('<option>');
        option.attr('value', w[i].id);
        option.text(w[i].whouseName);
        $('select[name="whouse3"]').append(option);
    }
    var r = alasql('SELECT * FROM item;');
    for (var i = 0; i < r.length; i++) {
        var option = $('<option>');
        option.attr('value', r[i].id);
        option.text('[' + r[i].code + '] ' + r[i].itemName);
        $('select[name="item3"]').append(option);
    }
    $('#confirmNewImportation').click(function() {
        importation.confirmNewImportation();
    });
}

importation.new = function(itemId) {
    console.log('importation.new has been called, ', itemId);
    itemId = parseInt(itemId);
    $('select[name="whouse3"]').val(S.inv);
    $('select[name="item3"]').val(itemId);
    $('input[name="qty3"]').focus();
    var w = alasql('SELECT * FROM whouse;');
    var m = DB.complexQuery('maker.maker', 'item', 'maker', 'item.id = ' + itemId)[0].maker;

    $('input[name="qty3"]').change(function() {
        var num = parseInt(this.value);
        var frw = 0;
        if (frw == 0) {
            var maximum = alasql('SELECT maximum FROM stock WHERE itemId = ' + itemId)[0].maximum;
            var balance = alasql('SELECT balance FROM stock WHERE itemId = ? AND whouseId = ?;', [itemId, S.inv])[0].balance;
            var max = maximum - balance;
        } else {
            var max = alasql('SELECT balance FROM stock WHERE itemId = ? AND whouseId = ?;', [itemId, frw])[0].balance;
        }
        var spare = Pos[S.inv].total - Pos[S.inv].used;
        max = max < spare ? max : spare;
        if (num <= 0 || isNaN(num)) {
            this.value = 0;
        } else if (num > max) {
            this.value = max;
            if (max == spare) {
                $('#erroInfo3').text('* There isn\'t enough space to put !');
            } else if (frw == 0) {
                $('#erroInfo3').text('* Your import request exceeds the maximum limit !');
            } else {
                $('#erroInfo3').text('* There isn\'t enough goods in the target inventory !');
            }
        } else {
            this.value = num;
        }
    });
}

importation.confirmNewImportation = function() {
    var itemId = parseInt($('select[name="item3"]').val());
    var qty = parseInt($('input[name="qty3"]').val());
    var memo = $('textarea[name="memo"]').val();
    var stock = alasql('SELECT id FROM stock WHERE whouseId = ? AND itemId = ?;', [S.inv, itemId])[0].id;
    if (qty > 0) {
        Trans.newImport(stock, qty);
        $('#modal2').modal('hide');
    } else {
        $('#erroInfo3').text('* The quantity can not be 0 !')
    }
}

// Initialization

importation.init();