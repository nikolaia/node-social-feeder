var feed = {}, async = require('async'),
	Twitter = require('mtwitter'), 
	Instagram = require('instagram-node-lib'),
	GitHubApi = require("github");

var twitter = new Twitter({
  consumer_key: process.env.twitter_consumer_key,
  consumer_secret: process.env.twitter_consumer_secret,
  access_token_key: process.env.twitter_access_token_key,
  access_token_secret: process.env.twitter_access_token_secret,
  application_only: true
});

Instagram.set('client_id', process.env.instagram_client_id);
Instagram.set('client_secret', process.env.instagram_client_secret);
Instagram.set('access_token', process.env.instagram_access_token);

var github = new GitHubApi({
    version: "3.0.0",
    timeout: 5000
});

feed.cache = new Array();
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
		/*
		-- THIS CODE IS USELESS UNTIL I FIND OUT HOW TO GO AROUND TWITTERS BLACKLISTING OF HEROKU IP's
		function(callback) {
			console.log("twitter starting");
			twitter.get('statuses/user_timeline', {screen_name: 'nikolaiii', count: 15}, function(err, data) {
				if (err) console.log(err);
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
				console.log("twitter done");
				callback(err,result);
		 	});
		},
		*/
		function(callback) {
			console.log("instagram starting");
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
							link: item.link
						});
					});
					console.log("instagram done");
					callback(null, result);
				},
				error: function(errorMessage, errorObject, caller){
			      console.log(errorMessage, errorObject);
			    }
			});
		},
		function(callback) {
			console.log("github starting");
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
				console.log("github done");
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