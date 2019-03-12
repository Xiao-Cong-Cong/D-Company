function configShelves() {
    var inputs = ['shelves', 'rows', 'cols'];
    for (var x in inputs) {
        $('#' + x).val(Pos[S.inv].x);
    }
}

configShelves();