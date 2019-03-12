function editGood(id) {
    console.log(id);

    var selects = ['kind', 'maker'];
    var inputs = ['code', 'itemName', 'unit'];
    var vals = alasql('SELECT code, itemName, unit, makerId, kindId FROM item WHERE id = ?', [id])[0];

    if (debug) console.log(vals);
    
    for (var i = 0; i < selects.length; i++) {
        var s = selects[i];
        var rows = alasql('SELECT * FROM ' + s);
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            var option = $('<option>');
            option.attr('value', row.id);
            option.text(row[s]);
            $('select[name="' + s + '2"]').append(option);
        }
        $('select[name="' + s + '2"]').val(vals[s+'Id']);
    }

    for (var i = 0; i < inputs.length; i++) {
        var now = inputs[i];
        $('input[name="' + now + '2"]').val(vals[now]);
    }

    (function(xx) {
        $('#confirmEditGood').click(function() {
            console.log('haha');

            var ok = true, values = {};
            for (var i = 0; i < inputs.length; i++) {
                var now = $('input[name="' + inputs[i] + '2"]');
                if (now.val() == '' || now.val() == undefined) {
                    $('#erroInfo2').text('* The blank can not be empty!');
                    now.focus();
                    ok = false;
                    break;
                } else {
                    values[inputs[i]] = now.val();
                }
            }
        
            for (var i = 0; i < selects.length; i++) {
                var now = $('select[name="' + selects[i] + '2"]');
                values[selects[i]+'Id'] = parseInt(now.val());
            }

            values.id = xx;
        
            if (debug) console.log(values);
            
            if (ok) {
                console.log('ok');
                for (var x in values) {
                    alasql('UPDATE item SET '+x+' = ? WHERE id = ?', [values[x], values.id]);
                }
        
                $('#modal2').modal('hide');
                $('#modal2').on('hidden.bs.modal', function(e) {
                    management.update();
                });
            }
        });
    })(id);
}
