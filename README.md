nodejs-social-feeder
====================

Merge your social feeds to one single feed. 

Currently only includes twitter and instagram, but will later include facebook and github also.

Remember to add a config.js file like this:

	var config = {}

	config.twitter = {
		consumer_key: 'replace_me',
		consumer_secret: 'replace_me',
		access_token_key: 'replace_me',
		access_token_secret: 'replace_me'
	};
	config.instagram = {
		client_id: 'replace_me',
		client_secret: 'replace_me',
		access_token: 'replace_me'
	};

	config.port = 3000;

	module.exports = config;