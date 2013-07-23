var feed = {}, async = require('async'),
	Twitter = require('mtwitter'), 
	Instagram = require('instagram-node-lib'),
	config = require('./config');

var twitter = new Twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
});

Instagram.set('client_id', config.instagram.client_id);
Instagram.set('client_secret', config.instagram.client_secret);
Instagram.set('access_token', config.instagram.access_token);

feed.cache = Array();
feed.lastUpdated = new Date();

feed.updateFeed = function() {
	console.log("Starting feed update.");
	feed.cache = new Array();
	async.parallel([
		function(callback) {
			twitter.get('statuses/user_timeline', {screen_name: 'nikolaiii', count: 15}, function(err, data) {
				var result = new Array();
				data.forEach(function(item) { 
					result.push({
						score: (item.retweeted ? item.retweeted : 0) + (item.favorited ? item.favorited : 0),
						image: item.entities.media != null ? item.entities.media[0].media_url : null,
						text: item.text,
						date: new Date(item.created_at.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/, "$1 $2 $4 $3 UTC"))
					});
				});
				callback(err,result);
		 	});
		},
		function(callback) {
			Instagram.users.recent({ 
				user_id: 2296300,
				count: 15,
			 	complete: function(data, pagination) {
			 		var result = new Array();
					data.forEach(function(item) { 
						result.push({
							score: item.likes.count,
							image: item.images.standard_resolution.url,
							text: item.caption ? item.caption.text : "",
							date: new Date(parseInt(item.created_time) * 1000)
						});
					});
					callback(null, result);
				}
			});
		}
	], 
	function(err, results) {
		if (err) console.log(err);

		feed.cache = results[0].concat(results[1]);

		function compare(a,b) {
		  if (a.date > b.date)
		     return -1;
		  if (a.date < b.date)
		    return 1;
		  return 0;
		}
		feed.cache.sort(compare);

		lastUpdated = new Date();

		console.log("Finished updating feed.");
	});
}

module.exports = feed;