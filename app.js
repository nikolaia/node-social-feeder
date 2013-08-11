var express = require('express'), 
	app = express(),
	feed = require('./feed');

app.get('/refreshFeed', function(req, res) {
	feed.updateFeed();
	res.write("Feed update process was triggered.")
	res.end();
});

app.get('/', function(req, res) {

	// This can be replaced with a worker job, but this is the cheap way of doing it :)
	if (feed.cache.length == 0 || feed.lastUpdated+1 > new Date().getDate()) {
		console.log("Feed is empty or more than one day old!");
		feed.updateFeed();
	}
	res.json(feed.cache);
});

app.listen(process.env.PORT);
console.log('Listening on port '+ process.env.PORT);