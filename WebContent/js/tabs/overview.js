manager.overview = function() {
    var row = $('<div class="row"></div>'), ok = 0;
    var num = alasql('SELECT count(*) AS cnt FROM whouse')[0].cnt;
    for (var i = 0; i < num; i++) {
        var div = $('<div>');
        div.load('template/tabs/overview.html', function(){
            if (++ok == num) {
                update();
            }
        });
        div.appendTo(row);
    }
    row.appendTo('#page');

    function update() {
        var c = ['whouseName', 'profit', 'spare', 'total', 'value'];
        for (var i = 0; i < Pos.invs; i++) {
            var p = Pos[i+1];
            r = {
                whouseName: p.name,
                profit: Tool.commas(p.profit),
                spare: Tool.commas(p.total - p.used),
                total: Tool.commas(p.total),
                value: Tool.commas(calculateTotalValue(i+1))
            };
            for (var j = 0; j < c.length; j++) {
                $('.'+c[j]+':eq('+i+')').text(r[c[j]]);
            }
        }
    }
    function calculateTotalValue(x) {
        var v = DB.complexQuery('balance, importPrice', 'stock', 'item', 'whouseId = ' + x), value = 0;
        for (var i = 0; i < v.length; i++) {
            value += v[i].balance * v[i].importPrice;
        }
        return value;
    }
}