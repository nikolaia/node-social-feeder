node-social-feeder
====================

Get your social feeds as one single feed to display on your personal blog or company page.

Currently includes twitter, github and instagram.

Go to /api to get the merged feed

The untouched api responses are available at:
/api/twitter /api/github /api/instagram

TODO: 
* Turn into node module.
* Error handling and checking that env variables are set.
* Add support for facebook.
* More github events (only pushevents right now).
* Better cache system.
* Add an admin interface to easily manage variables and set options.

Add a .env file with the variables below and use 'foreman start' to test localy:

    twitter_consumer_key = replace_me
    twitter_consumer_secret = replace_me
    twitter_access_token_key = replace_me
    twitter_access_token_secret  = replace_me
    twitter_username = replace_me
    instagram_client_id = replace_me
    instagram_client_secret = replace_me
    instagram_access_token = replace_me
    instagram_userid = replace_me
    github_username = replace_me

## Getting your access token from instagram

[Check out this blogpost](http://dmolsen.com/2013/04/05/generating-access-tokens-for-instagram/)
