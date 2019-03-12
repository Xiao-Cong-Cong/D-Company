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
    var tabs = ['ove', 'mng'];
    for (var i = 0; i < tabs.length; i++) {
        $('#' + tabs[i]).removeClass('active');
    }
    $('#' + tabs[x]).addClass('active');
    index.update({tab: x});
    manager.refresh();
}

manager.refresh = function() {
    $('#page').empty();
    var page = [ S.role - 1 ? 'request' : 'overview', 'management'][S.tab];
    page == 'overview' ? manager.overview() : $('#page').load('template/tabs/' + page + '.html');
}

// Initialization

manager.init();
