function newGood() {
    var selects = ['kind', 'maker'];
    var inputs = ['code', 'itemName', 'importPrice', 'exportProfit', 'unit', 'minimum', 'maximum'];
    var isNum = ['kindId', 'makerId', 'importPrice', 'exportProfit', 'minimum', 'maximum'];
    
    for (var i = 0; i < selects.length; i++) {
        var s = selects[i];
        var rows = alasql('SELECT * FROM ' + s);
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            var option = $('<option>');
            option.attr('value', row.id);
            option.text(row[s]);
            $('select[name="' + s + '"]').append(option);
        }
    }
    
    $('#confirmNewGood').click(function() {
        var ok = true, values = {};
        for (var i = 0; i < inputs.length; i++) {
            var now = $('input[name="' + inputs[i] + '"]');
            if (now.val() == '' || now.val() == undefined) {
                $('#erroInfo').text('* The blank can not be empty!');
                now.focus();
                ok = false;
                break;
            } else {
                values[inputs[i]] = now.val();
                console.log(inputs, values);
            }
        }
        for (var i = 0; i < selects.length; i++) {
            var now = $('select[name="' + selects[i] + '"]');
            values[selects[i]+'Id'] = now.val();
        }
        for (var x in values) {
            if (isNum.indexOf(x) != -1) {
                values[x] = parseInt(values[x]);
            }
        }
        values.id = alasql('SELECT max(id) as id FROM item;')[0].id + 1;
        if (debug) console.log(values);
        
        if (ok) {
            var itemCols = ['id', 'code', 'kindId', 'itemName', 'makerId', 'importPrice', 'exportProfit', 'unit'], newItem = {};
            for (var i = 0; i < itemCols.length; i++) {
                var x = itemCols[i];
                newItem[x] = values[x];
            }
            newItem.transProfit = 0;
            console.log(newItem);
            alasql('INSERT INTO item VALUES ?', [newItem]);
    
            var stockId = alasql('SELECT max(id) as id FROM stock;')[0].id;
            var whouseNum = alasql('SELECT max(id) as id FROM whouse;')[0].id;
    
            for (var i = 1; i <= whouseNum; i++) {
                var newStock = {
                    id: stockId + i,
                    itemId: values.id,
                    whouseId: i,
                    minimum: values.minimum,
                    maximum: values.maximum,
                    balance: 0
                };
                alasql('INSERT INTO stock VALUES ?', [newStock]);
            }
    
            $('#modal1').modal('hide');
            $('#modal1').on('hidden.bs.modal', function(e) {
                management.update();
            });
        }
    });
}

newGood();

// TODO: validate the fields of the form, eg. , >= 0 ...