// --------------- Global Variables ---------------
var debug = false, config = {}, S = {};
// --------------- Global Variables ---------------

$('#navbar').load('template/navbar.html', function() {
    index.init();
});

var index = {};

// friend

index.init = function() {
    S = index.initStatus();
    index.readCookies();
    index.readConfig();
    index.refresh();
};

// public

index.initStatus = function() {
    return { uName: '', ugid: 0, role: 0, tab: 0, inv: 1 };
};

index.update = function(c) {
    if (c) {
        for (var x in c) {
            S[x] = c[x];
            index.setCookie(x, S[x], 30);
        }
    }
    alasql('UPDATE config SET data = ? WHERE id = 1;', [JSON.stringify(config)]);
    // console.log(config, JSON.stringify(config));
};

index.refresh = function() {
    navbar.update();
    var pages = ['login', 'manager', 'manager', 'maker', 'driver', 'operator', 'operator', 'operator', 'customer'];
    var i = (S.ugid == 1 || S.ugid == 2) ? S.role : S.ugid;
    $('#main').load('template/' + pages[i] + '.html');
};

// private

index.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

index.readCookies = function() {
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        for (var x in index.initStatus()) {
            if (c.indexOf(x) == 0) {
                S[x] = c.substring(x.length+1, c.length);
            }
        }
    }
    S.ugid = parseInt(S.ugid);
    S.role = parseInt(S.role);
    S.inv = parseInt(S.inv);
    S.tab = parseInt(S.tab);
}

index.readConfig = function() {
    var c = alasql('SELECT data FROM config WHERE id = 1;');
    if (c == undefined || c.length == 0) {
        config.maximumMode = [];
        for (var i = 1; i <= 4; i++) {
            config.maximumMode[i] = 'Balance';
        }
        alasql('INSERT INTO config VALUES ?;', [{id: 1, data: JSON.stringify(config)}]);
    } else {
        config = JSON.parse(c[0].data);
    }
}
