var feed = {}, async = require('async'),
	Twitter = require('mtwitter'), 
	Instagram = require('instagram-node-lib'),
	config = require('./config'),
	GitHubApi = require("github");

var twitter = new Twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
});

Instagram.set('client_id', config.instagram.client_id);
Instagram.set('client_secret', config.instagram.client_secret);
Instagram.set('access_token', config.instagram.access_token);

var github = new GitHubApi({
    version: "3.0.0",
    timeout: 5000
});

feed.cache = Array();
feed.lastUpdated = new Date();


feed.GithubMessage = function(item) {
	switch (item.type) {
		case 'PushEvent':
			return item.payload.commits[0].message + " in " + item.repo.name;
			break;
		case 'FollowEvent':
			return "Started following "+item.payload.target.login;
			break;
		default:
			return "No info"
			break;
	}
}

feed.GithubLink = function(item) {
	switch (item.type) {
		case 'PushEvent':
			return item.payload.commits[0].url;
			break;
		case 'FollowEvent':
			return item.payload.target.url;
			break;
		default:
			return "No info"
			break;
	}
}

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
						date: new Date(item.created_at.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/, "$1 $2 $4 $3 UTC")),
						type: 'twitter',
						link: item.url
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
							date: new Date(parseInt(item.created_time) * 1000),
							type: 'instagram',
							link: item.url
						});
					});
					callback(null, result);
				}
			});
		},
		function(callback) {
			github.events.getFromUser({
			    user: "nikolaia",
			    count: 15
			}, function(err, res) {
			    var result = new Array();
				res.forEach(function(item) { 
					if (item.type == 'PushEvent') // TODO: Add all Github eventTypes and make support for them.
					result.push({
						score: 0,
						image: item.actor.avatar_url,
						text: feed.GithubMessage(item),
						date: new Date(item.created_at),
						type: 'github',
						link: feed.GithubLink(item)
					});
				});
				callback(null, result);
			});
		}
	], 
	function(err, results) {
		if (err) console.log(err);

		feed.cache = results[0].concat(results[1]).concat(results[2]);

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