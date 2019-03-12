if (S.role = 2) {
    var shelf = alasql('SELECT shelfNum, rowNum, colNum FROM whouse WHERE id = ?;', [S.inv])[0];
    $('#geshu').val(shelf.shelfNum);
    $('#rows').val(shelf.rowNum);
    $('#cols').val(shelf.colNum);

    $('#modal1').click(function() {
        var names = ['shelfNum', 'rowNum', 'colNum'];
        var value = ['#geshu', '#rows', '#cols'];
        for (var i = 0; i < names.length; i++) {
            alasql('UPDATE whouse SET ' + names[i] + ' = ' + $(value[i]).val() + ' WHERE id = ?;', [S.inv]);
        }
    });
}