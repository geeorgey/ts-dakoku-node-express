// Load modules.
var OAuth2Strategy = require('passport-oauth2')
  , util = require('util')
  , uri = require('url')
  , crypto = require('crypto')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;



function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.salesforce.com/services/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://login.salesforce.com/services/oauth2/token';
  options.scopeSeparator = options.scopeSeparator || ',';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'salesforce';
  this._profileURL = options.profileURL || 'https://login.salesforce.com/services/oauth2/userinfo';
  this._clientSecret = options.clientSecret;
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);


/**
 * Authenticate request by delegating to Facebook using OAuth 2.0.
 *
 * @param {http.IncomingMessage} req
 * @param {object} options
 * @access protected
 */
Strategy.prototype.authenticate = function(req, options) {
 
  OAuth2Strategy.prototype.authenticate.call(this, req, options);
//}
};

function oauth (options, callback) {
    var base_url = options.base_url || baseUrl;
    options = _.omit(options, "base_url");
console.log(options);
    var uri = base_url + tokenUrl + "?" + qs.stringify(options);
console.log(uri);
    return request.post({
        url: uri
    }, function (err, response) {
        if (err) {
            return callback(err);
        }

        if (response.statusCode >= 400) {
            return callback({
                message:response.body,
                statusCode:response.statusCode
            });
        }
        var payload = JSON.parse(response.body);
        if (verifySignature(payload, options.client_secret)) {
            return callback(null, payload);
        } else {
            return callback({
                message:"The signature could not be verified.",
                payload:payload
            });
        }
    });    
};


Strategy.prototype.userProfile = function(accessToken, done) {

  var url = uri.parse(this._profileURL);

  url = uri.format(url);

  this._oauth2.get(url, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
      
      if (json && json.error && typeof json.error == 'object') {
        return done(new FacebookGraphAPIError(json.error.message, json.error.type, json.error.code, json.error.error_subcode, json.error.fbtrace_id));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = Profile.parse(json);
    profile.provider = 'salesforce';
    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
};


// Expose constructor.
module.exports = Strategy;
