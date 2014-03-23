var feed = {}, 
	async = require('async'),
	OAuth = require('OAuth'),
	request = require('request'),
	util = require('util');

feed.cache = new Array();
feed.lastUpdated = new Date();

feed.update = function(callback) {
	async.parallel([
		function(callback) {
			feed.getTwitter(function(err,data) {
				if (err) return new Array();
				callback(err, data.map(function(v) { return feed.parseTwitter(v); }));
			});
		},
		function(callback) {
			feed.getInstagram(function(err,data) {
				if (err) return new Array();
				callback(err, data.map(function(v) { return feed.parseInstagram(v); }));
			});
		},
		function(callback) {
			feed.getGithub(function(err,data) {
				if (err) return new Array();
				callback(err, data.map(function(v) { return feed.parseGithub(v); }));
			});
		}],
		function(err, data) {
			if (err) console.log(err);

			feed.cache = data[0].concat(data[1]).concat(data[2]);

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

			callback();
		}
	);
}

feed.getTwitter = function(callback) {
	var OAuth2 = OAuth.OAuth2;
	var oauth2 = new OAuth2(
		process.env.twitter_consumer_key,
		process.env.twitter_consumer_secret, 
		'https://api.twitter.com/', 
		null,
		'oauth2/token', 
		null
	);
	oauth2.useAuthorizationHeaderforGET(true);
	oauth2.getOAuthAccessToken(
		'',
		{'grant_type':'client_credentials'},
		function (e, access_token, refresh_token, results){
			oauth2.get('https://api.twitter.com/1.1/statuses/user_timeline.json?count=20&screen_name='+process.env.twitter_username, access_token, function(e,data,res) {
				callback(e, JSON.parse(data));
			});
	});
}

feed.getInstagram = function(callback) {
	request('https://api.instagram.com/v1/users/'+process.env.instagram_userid+'/media/recent?access_token='+process.env.instagram_access_token, function (error, response, body) {
	  callback(error, JSON.parse(body).data);
	});
}

feed.getGithub = function(callback) {
	var options = {
    url: 'https://api.github.com/users/'+process.env.github_username+'/events',
    headers: {
        'User-Agent': 'request'
    }
  };
	request(options, function (error, response, body) {
		// TODO: Add support for more eventtypes
		callback(error, JSON.parse(body).filter(function(v) { return v.type == 'PushEvent'} ));
	});
}

feed.parseTwitter = function(item) {
	return {
		score: item.retweet_count + item.favorite_count,
		image: item.entities.media != null ? item.entities.media[0].media_url : null,
		text: item.text,
		date: new Date(item.created_at.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/, "$1 $2 $4 $3 UTC")),
		type: 'twitter',
		link: "https://twitter.com/"+item.user.screen_name+"/status/" + item.id_str
	}
}

feed.parseInstagram = function(item) {
	return {
		score: item.likes.count,
		image: item.images.standard_resolution.url,
		text: item.caption ? item.caption.text : "",
		date: new Date(parseInt(item.created_time) * 1000),
		type: 'instagram',
		link: item.link ? item.link : ""
	}
}

feed.parseGithub = function(item) {
	return {
		score: 0,
		image: item.actor.avatar_url,
		text: "Pushed to "+item.repo.name+": "+item.payload.commits[0].message,
		date: new Date(item.created_at),
		type: 'github',
		link: item.payload.commits[0].url.replace("api.", "").replace("repos/", "").replace("commits", "commit")
	}
}

module.exports = feed;