# Recipes21

[![Build Status](https://travis-ci.com/andrescanavesi/recipes21.svg?branch=master)](https://travis-ci.com/andrescanavesi/recipes21)

Recipes21 is an open source project written in Node.js

# Environment variables

Create or edit the file `$HOME/.bash.profile`

```bash
export R21_CACHE_DEBUG=false
export R21_CACHE_ENABLED=false
export R21_CACHE_DURATION="1 minute"
export DATABASE_URL=**********************
export R21_BASE_URL="http://localhost:3000/"
export R21_META_CACHE=1
export R21_IS_PRODUCTION=false
export R21_GOOGLE_CLIENT_ID=**********************
export R21_GOOGLE_CLIENT_SECRET=**********************
export R21_GOOGLE_CALLBACK_URL=http://localhost:3000/sso/google/callback
export PGSSLMODE=require
export R21_SESSION_SECRET=*****************
export R21_ADMIN_SECRET=***************** ## to excute some admin tasks
export R21_LOG_LEVEL="info"
export R21_DEFAULT_IMAGE_URL="https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,w_900,q_auto:low/v1564258209/recipes21/default.jpg"
export R21_IMAGES_BASE_URL="https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,w_900,q_auto:low/v1564258209/recipes21/"
export R21_FACEBOOK_CLIENT_ID=**********************
export R21_FACEBOOK_CLIENT_SECRET=**********************
export R21_SHOW_ADS=false
export NODE_ENV="development"
export R21_REDIRECT_TO_HTTPS=false ## It should be true in production
export R21_SENDINBLUE_API_KEY_V3="*********"
```

After saving the file execute this to reload variables

`source .bash_profile`

# Run

`npm start`

# Packages

-   mocha
-   chai
-   chai-hhtp
-   nyc
-   mochawesome
-   npm-check
-   apicache
-   prettier
-   flexsearch

# Run tests

`npm test`

It will generate a `mochawesome` report at `test_results` folder. It also
will generate a conerage report at `coverage` folder

# Heroku

Heroku is the platform used to deploy this projects.
There is a pipeline with two apps: staging and production.

Staging app has automatic deploy enabled from `master` branch. It waits for Travis runs all the tests
before deploying.

# CI

[https://travis-ci.com](https://travis-ci.com)

# Google Lighthouse

Get some insight to optimize our frontend

`sudo npm install -g lighthouse`

Execute:

`lighthouse --view <url_to_test>`

After that a report will be generated in the home folder

# License

Apache License 2.0.
