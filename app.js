
var https = require('https'),
		express = require('express'),
		config = require('./config'),
		client = require('./redis'),
		sockets = require('./data/socket');
// TODO add ws
var app = express();

app.use(express.static(__dirname + '/static'));
app.set('port', config.PORT);

var server = app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + server.address().port);
});

//start up ws
sockets(server, client);
