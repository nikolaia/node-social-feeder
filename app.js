var express = require('express'), 
	app = express(),
	feed = require('./feed'),
	config = require('./config');

app.get('/refreshFeed', function(req, res) {
	feed.updateFeed();
	res.write("Feed update process was triggered.")
	res.end();
});

app.get('/', function(req, res) {
	if (feed.cache.length == 0 || feed.lastUpdated+1 > new Date().getDate()) {
		console.log("Feed is empty or more than one day old!");
		feed.updateFeed();
	}
	res.json(feed.cache);
});

app.listen(config.port);
console.log('Listening on port '+ config.port);