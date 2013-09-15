nodejs-social-feeder
====================

Merge your social feeds to one single feed. 

Currently includes twitter, github and instagram.

Local testing can be done by adding a config.js with the values under and running in NODE_ENV == 'development'

	process.env['twitter_consumer_key'] = 'replace_me';
	process.env['twitter_consumer_secret'] =  'replace_me';
	process.env['twitter_access_token_key'] =  'replace_me';
	process.env['twitter_access_token_secret'] =  'replace_me';
	process.env['instagram_client_id'] = 'replace_me';
	process.env['instagram_client_secret'] = 'replace_me';
	process.env['instagram_access_token'] = 'replace_me';