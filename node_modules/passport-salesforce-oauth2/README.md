# passport-saleforce

[Passport](http://passportjs.org/) strategy for authenticating with [Saleforce](http://www.salesforce.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Saleforce in your Node.js applications.
By plugging into Passport, Saleforce authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-salesforce-oauth2

## Usage


#### Configure Strategy

The Salesforce authentication strategy authenticates users using a Salesforce
account and OAuth 2.0 tokens.  The Consumer Key and Consumer secret obtained when creating an
application are supplied as options when creating the strategy.  The strategy
also requires a `verify` callback, which receives the access token and optional
refresh token, as well as `profile` which contains the authenticated user's
Salesforce profile.  The `verify` callback must call `cb` providing a user to
complete authentication.

```js
passport.use(new Strategy({
    clientID: CLIENT_ID,
    clientSecret:  CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/salesforce/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'salesforce'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/salesforce',
  passport.authenticate('salesforce'));

app.get('/auth/salesforce/callback',
  passport.authenticate('salesforce', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Examples

Developers using the popular [Express](http://expressjs.com/) web framework can
refer to an [example](https://github.com/shahid28/express-4.x-salesforce-example.git)
as a starting point for their own web applications.


## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2016  [Shahid Iqbal](http://nodejs-shahidiqbal.rhcloud.com//)