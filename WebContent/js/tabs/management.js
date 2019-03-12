var management = {
    selects: S.role - 1 ? ['Balance', 'Share', 'Maximum'] : ['All'],
    op: {
        1: S.role - 1 ? 'configShelves' : 'newGood',
        2: S.role - 1 ? 'newImportation' : 'editGood'
    },
    whouseId: function() {
        return S.role - 1 ? S.inv : this.selects.indexOf($('#manageSelect').val());
    },
    btn: function() {
        if (S.role == 1) return '<span class="glyphicon glyphicon-plus"></span> New Item';
        if (S.role == 2) return '<span class="glyphicon glyphicon-cog"></span> Shelves Configuration';
    },
    keywords: []
};

management.init = function() {
    if (S.role == 1) {
        var whouses = alasql('SELECT whouseName FROM whouse');
        for (var i = 0; i < whouses.length; i++) {
            management.selects.push(whouses[i].whouseName);
        }
    }
    for (var i = 0; i < management.selects.length; i++) {
        $('#manageSelect').append('<option>' + management.selects[i] + '</option>');
    }
    if (S.role == 1) {
        $('#manageSelect').val('All');
        $('#manageSelect').change(management.update);
    } else if (S.role == 2) {
        $('#manageSelect').val(config.maximumMode[S.inv]);
        $('#manageSelect').change(function() {
            config.maximumMode[S.inv] = $('#manageSelect').val();
            index.update();
        });
    }

    $('#search').keyup(function() {
        var val = $('#search').val();
        management.keywords = val.split(' ');
        management.update();
    });

    for (var x in management.op) {
        var y = management.op[x];
        $('#modal'+x).load('template/tabs/' + y + '.html');
    }
    $('#profitType').text(S.role - 1 ? 'Transfer' : 'Export');
    $('button[data-target="#modal1"]').html(management.btn());
    management.update();
}

management.update = function() {
    $('#tbody1').empty();
    var r = DB.complexQuery('item.id, kind.kind, code, maker.maker, itemName, importPrice, exportProfit, transProfit, unit', 'item', 'kind, maker');
    var s = alasql('SELECT itemId, balance, minimum, maximum FROM stock'+(management.whouseId() ? ' WHERE whouseId = '+management.whouseId() : ''));
    for (var i = 0; i < s.length; i++) {
        var j = s[i].itemId - 1;
        if (management.whouseId()) {
            r[j] = Object.assign(r[j], s[i]);
        } else {
            r[j].minimum = r[j].minimum == undefined ? s[i].minimum : 
                          (r[j].minimum == s[i].minimum) ? r[j].minimum : '-';
            r[j].maximum = r[j].maximum == undefined ? s[i].maximum :
                          (r[j].maximum == s[i].maximum) ? r[j].maximum : '-';
            r[j].balance = r[j].balance == undefined ? s[i].balance : r[j].balance + s[i].balance;
        }
    }
    var h = Tool.search(r, 'code, itemName', management.keywords);
    function pencil(x) {
        return ' <span class="glyphicon glyphicon-pencil edit" id="' + x + '"></span>';
    }
    for (var i = 0; i < r.length; i++) {
        r[i].index = '';
        r[i].value = r[i].balance * r[i].importPrice;
        r[i].profit = S.role - 1 ? r[i].transProfit : r[i].exportProfit;
        var edit = S.role - 1 ? ['profit', 'minimum', 'maximum'] : ['itemName', 'importPrice', 'profit', 'minimum', 'maximum'];
        for (var j = 0; j < edit.length; j++) {
            r[i][edit[j]] += pencil(r[i].id + ',' + edit[j]);
        }
        if (S.role == 2) {
            var num = DB.complexQuery('SUM(quantity) AS num', 'trans', 'stock, item',
                                      'trans.type in (1, 3) AND trans.tstate = 2 AND item.id = ' + r[i].id)[0].num;
            // console.log('Importing num is: ', num);
            r[i].balance = '<div id="'+r[i].id+'"><div class="col-xs-1">' + r[i].balance + '</div><div class="col-xs-1 import"> \
            <span class="glyphicon glyphicon-plus plus"></span></div><div class="col-xs-1 importNum">' + num + '</div></div>';
        }
    }
    var rr = Tool.sortTable(r, h, 'code, itemName', 'index, code, itemName, importPrice, profit, balance, minimum, maximum, value');
    Tool.displayTable('tbody1', rr, 'index, code, itemName, importPrice, profit, balance, minimum, maximum, value');

    $('td').mouseenter(function() { $(this).children('span.edit').show(); });
    $('td').mouseleave(function() { $(this).children('span.edit').hide(); });

    $('td > span').click(function() {
        var ids = $(this).attr('id').split(',');
        var itemId = parseInt(ids[0]);

        if (ids[1] == 'itemName') {
            $('#modal2').modal('show');
            editGood(itemId);
        } else {
            var td = $(this).parent();
            var val = parseInt(td.text());
            td.empty();
            td.append('<input type="number" name="immediateEdit">');
            td.children('input').focus();
            td.children('input').val(val);

            (function() {
                $('input[name="immediateEdit"]').focusout(function() {
                    updateInput(this, ids);
                });
                $('input[name="immediateEdit"]').keypress(function(e) {
                    if(e.which == 13) {
                        updateInput(this, ids);
                    }
                });
            })(ids)
        }
    });

    $('.import').click(function() {
        var id = $(this).parent().attr('id');
        $('#modal2').modal('show');
        importation.new(id);
    });

    function updateInput(xxx, ids) {
        var val = $(xxx).val();
        if (ids[1] == 'importPrice') {
            var sql = 'UPDATE item SET importPrice = ' + val + ' WHERE id = ' + ids[0];
        } else if (ids[1] == 'minimum' || ids[1] == 'maximum') {
            var sql = 'UPDATE stock SET ' + ids[1] + ' = ' + val + ' WHERE itemId = ' + ids[0] + 
                      (management.whouseId() == 0 ? '' : ' AND whouseId = ' + management.whouseId());
        } else if (ids[1] == 'profit') {
            var sql = 'UPDATE item SET ' + (S.role - 1 ? 'transProfit' : 'exportProfit') + ' = ' + val + ' WHERE id = ' + ids[0];
        }
        alasql(sql);
        console.log(sql);
        management.update();
    }
}

// Initialization

management.init();