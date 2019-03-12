// <div class="container" id="toolBar">
//     <div class="row">
//         <div class="col-md-2" id="toolBarLeft"></div>
//         <div class="col-md-6 col-md-offset-1" id="search">
//             <div class="form-group">
//                 <input id="search" type="text" class="form-control" placeholder="Immediately Free-Keyword Search Here!" autofocus="">
//             </div>
//         </div>
//         <div class="col-md-2 col-md-offset-1" id="toolBarRight"></div>
//     </div>
//     <hr>
// </div>
// <div id="tableArea">
//     <div class="container">
//         <h2 id="tableTitle"></h2>
//         <table class="table" id="table">
//             <thead></thead>
//             <tbody></tbody>
//         </table>
//     </div>
// </div>
// <div class="modal fade" id="modal" tabindex="-1" role="dialog"></div>
// <script src="js/table.js"></script>

function createTable() {
    var Table = {
        title: '',
        thead: '',
        column: '',
        searchColumn: '',
        data: [],
        keywords: [],
        tableData: [],
        showToolBar: true,
        aboveHeight: 162
    };

    Table.init = function() {
        updateToolBar();
        changeTableAreaHeight();
        setTableTitle();
        setThead();
        Table.update();
    }

    Table.update = function() {
        var searchResult = giveScoreAccordingToKeywords();
        descendingSortScore(searchResult);
        var generateData = Table.generate();
        prepareTableData(generateData, searchResult);
        console.log(Table);
        updateTbody();
    }

    Table.generate = function() {
        return Table.data;
    }

    function giveScoreAccordingToKeywords() {
        var r = [], c = Table.searchColumn.split(', ');
        for (var i = 0; i < Table.data.length; i++) {
            r[i] = {id: i, score: 0};
            for (var j = 0; j < c.length; j++) {
                var maxMatchLength = 0;
                for (var k = 0; k < Table.keywords.length; k++) {
                    var keyword = Table.keywords[k], ok = false;
                    for (var x = key.length; x > maxMatchLength && !ok; x--) {
                        for(var keySt = 0; keySt <= keyword.length - x; keySt++) {
                            var now = Table.data[i][c[j]].toLowerCase();
                            var key = keyword.toLowerCase();
                            var z = now.search(key.slice(keySt, keySt + x));
                            if (z != -1) {
                                ok = true, maxMatchLength = z;
                                r[i][c[j]] = Table.data[i][c[j]].slice(z, z + x);
                                break;
                            }
                        }
                    }
                }
                r[i].score += Math.pow(c.length, maxMatchLength);
            } 
        }
        return r;
    }

    function descendingSortScore(x) {
        return x.sort(function(a, b) {
            return b.score - a.score;
        });
    }

    function prepareTableData(r, h) {
        sortTableData(r, h);
        highlightTableData(h);
    }

    function sortTableData(r, h) {
        Table.tableData = [];
        var c = Table.column.split(', ');
        for (var i = 0; i < r.length; i++) {
            Table.tableData[i] = {};
            for (var j = 0; j < c.length; j++) {
                Table.tableData[i][c[j]] = r[h[i].id][c[j]];
            }
        }
    }

    function highlightTableData(h) {
        var c = Table.searchColumn.split(', ');
        for (var i = 0; i < Table.tableData.length; i++) {
            for (var j = 0; j < c.length; j++) {
                var o = Table.tableData[i][c[j]];
                var t = h[i][c[j]];
                if (o != undefined && t != undefined) {
                    var p = o.search(t);
                    var x = '<span class="searchMatch">' + t + '</span>';
                    Table.tableData[i][c[j]] = o.slice(0, p) + x + o.slice(p + t.length, o.length);
                }
            }
        }
    }

    function init() {
        $('#search').keyup(function() {
            Table.keywords = $('#search').val().split(' ');
            Table.update();
        });
        $(window).resize(changeTableAreaHeight);
    }

    function setTableTitle() {
        $('#tableTitle').text(Table.title);
    }

    function setThead() {
        var thead = $('table > thead');
        var c = Table.thead.split(', ');
        var tr = $('<tr>');
        for (var i in c) {
            tr.append('<th>' + c[i] + '</th>');
        }
        tr.appendTo(thead);
    }

    function changeTableAreaHeight() {
        var h = $(window).height() - Table.aboveHeight;
        var div = $('#tableArea');
        if (h > 0) {
            div.show();
            div.css({
                'overflow-y': 'auto',
                'min-height': h + 'px',
                'max-height': h + 'px'
            });
        } else {
            div.hide();
        }
    }

    function updateToolBar() {
        var toolBar = $('#toolBar');
        Table.showToolBar ? toolBar.show() : toolBar.hide();
    }

    function updateTbody() {
        var tbody = $('table > tbody');
        tbody.empty();
        var c = Table.column.split(', ');
        for (var i = 0; i < Table.tableData.length; i++) {
            var tr = $('<tr>');
            for (var j = 0; j < c.length; j++) {
                tr.append('<td>' + Table.tableData[i][c[j]] + '</td>');
            }
            tr.appendTo(tbody);
        }
    }

    init();
    return Table;
}

