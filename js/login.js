$('#submit').click(function() {
    if (S.ugid == 0) {
        login();
    }
});

function login() {
    var name = $('#name').val();
    var pswd = $('#pswd').val();
    var res = alasql('SELECT count(*) as cnt FROM user where name = ? and pswd = ?', [name, pswd])[0].cnt;
    if (res == 1) {
        var res = alasql('SELECT grp, inv FROM user where name = ? and pswd = ?', [name, pswd])[0];
        var ugrp = res.grp, uinv = res.inv ? res.inv : 1;
        index.update({uName: name, ugid: ugrp, role: ugrp, inv: uinv});
        index.refresh();
    } else {
        alert('Username or password is wrong!');
    }
}