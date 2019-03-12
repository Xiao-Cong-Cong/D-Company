$('#logout').click(function() {
	index.update(index.initStatus());
	index.refresh();
});

var navbar = {};

// public

navbar.update = function() {
	navbar.init();
	if (S.ugid > 0) {
		$('#welcome').text('Welcome,');
		navbar.inv();
		navbar.grp();
		$('#userName').text(S.uName + '!');
		$('#logout').append('<span class="glyphicon glyphicon-log-out"></span>');
	}
};

// private

navbar.init = function() {
	$('#welcome').empty();
	$('#inv').empty();
	$('#grp').empty();
	$('#userName').empty();
	$('#logout').empty();
};

navbar.inv = function() {
	var whouse = alasql('SELECT whouseName FROM whouse'); // whouse id begins from 1 and continuous

	if (S.ugid == 2 || S.ugid == 5 || S.ugid == 6 || S.ugid == 7) {
		$('#inv').append('<a>' + whouse[S.inv-1].whouseName + ',</a>');
	}
	
	if (S.ugid == 1 && (S.role == 2 || S.role == 5 || S.role == 6 || S.role == 7)) {
		$('#inv').append('<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + whouse[S.inv-1].whouseName +
						 ' <span class="glyphicon glyphicon-chevron-down"></span>,</a>');
		var ul = $('<ul class="dropdown-menu"></ul>');
		for (var i = 0; i < whouse.length; i++) {
			if (i + 1 != S.inv) {
				ul.append('<li><a onclick="index.update({inv: ' + (i+1) + '});index.refresh();">' + whouse[i].whouseName +'</a></li>');
			}
		}
		ul.appendTo('#inv');
	}
};

navbar.grp = function() {
	var uGroup = ['Guest', 'General manager', 'Inventory manager', 'Maker', 'Driver',
				  'Import operator', 'Check operator', 'Export operator', 'Customer'];
	
	if (S.ugid == 1) {
		select([1, 3, 4, 8, 2, 5, 7]);
	} else if (S.ugid == 2) {
		select([2, 5, 7]);
	} else {
		$('#grp').append('<a>' + uGroup[S.ugid] + ',</a>');
	}

	function select(g) {
		$('#grp').append('<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + uGroup[S.role] +
						 ' <span class="glyphicon glyphicon-chevron-down"></span>,</a>');
		var ul = $('<ul class="dropdown-menu"></ul>');
		for (var i = 0; i < g.length; i++) {
			if (i == 4) {
				ul.append('<li role="separator" class="divider"></li>');
			}
			if (g[i] != S.role) {
				ul.append('<li><a onclick="index.update({role: ' + g[i] + '});index.refresh();">' + uGroup[g[i]] +'</a></li>');
			}
		}
		ul.appendTo($('#grp'));
	}
};
