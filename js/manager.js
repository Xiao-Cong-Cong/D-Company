var manager = {};

// public

manager.init = function() {
    if (S.role == 2) {
        $('#ove > a').empty();
        $('#ove > a').text('Request');
    }
    $('.tab').click(function() {
        manager.switch(parseInt($(this).attr('tab')));
    });
    manager.switch(S.tab);
}

// private

manager.switch = function(x) {
    var tabs = ['ove', 'mng', 'his'];
    for (var i = 0; i < tabs.length; i++) {
        $('#' + tabs[i]).removeClass('active');
    }
    $('#' + tabs[x]).addClass('active');
    index.update({tab: x});
    manager.refresh();
}

manager.refresh = function() {
    $('#page').empty();
    var page = [ S.role - 1 ? 'request' : 'overview', 'management', 'history'][S.tab];
    page == 'overview' ? manager.overview() : $('#page').load('template/tabs/' + page + '.html');
}

manager.overview = function() {
    var row = $('<div class="row"></div>'), ok = 0;
    var num = alasql('SELECT count(*) AS cnt FROM whouse')[0].cnt;
    for (var i = 0; i < num; i++) {
        var div = $('<div id="w'+i+'"></div>');
        div.load('template/tabs/overview.html', function(){
            if (++ok == num) {
                manager.calculate();
            }
        });
        div.appendTo(row);
    }
    row.appendTo('#page');
}

manager.calculate = function () {
    var r = alasql('SELECT id, whouseName, shelfNum, rowNum, colNum FROM whouse');
    var spans = ['whouseName', 'profit', 'spare', 'total', 'value'];
    for (var i = 0; i < r.length; i++) {
        r[i] = Object.assign(r[i], Pos.condition(r[i].id));
        for (var j = 0; j < spans.length; j++) {
            $('.'+spans[j]+':eq('+i+')').text(r[i][spans[j]]);
        }
    }
}

// Initialization

manager.init();
