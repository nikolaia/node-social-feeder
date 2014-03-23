var express = require('express'), 
	app = express(),
	async = require('async'),
	OAuth = require('OAuth'),
	request = require('request'),
	util = require('util'),
	feed = require('./feed');

// force refresh of cache
app.get('/api/update', function(req, res) {
	feed.update();
	res.write("Feed update process was triggered.")
	res.end();
});

app.get('/api', function(req, res) {
	// This can be replaced with a worker job, but this is the cheap way of doing it :)
	if (feed.cache.length == 0 || feed.lastUpdated+1 > new Date().getDate()) {
		// Feed is empty or more than one day old!
		feed.update(function() {
			res.jsonp(feed.cache);
		});
	} else {
		res.jsonp(feed.cache);
	}
});

app.get('/api/twitter', function(req, res) {
	feed.getTwitter(function(err, data) {
		res.jsonp(data);
	})
});

app.get('/api/instagram', function(req, res) {
	feed.getInstagram(function(err, data) {
		res.jsonp(data);
	})
});

app.get('/api/github', function(req, res) {
	feed.getGithub(function(err, data) {
		res.jsonp(data);
	})
});

app.listen(process.env.PORT);
console.log('Listening on port '+ process.env.PORT);