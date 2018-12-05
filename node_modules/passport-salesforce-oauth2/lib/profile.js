/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  var profile = {};
  profile.id = json.user_id;
  profile.organization_id = json.organization_id;
  profile.username = json.preferred_username;
  profile.displayName = json.name;
  profile.name = { familyName: json.family_name,
                   givenName: json.given_name};

  profile.profileUrl = json.profile;
  profile.email = json.email ;
 
  
  if (json.picture) {
          profile.photos =   json.picture ;
    }
  
  
  return profile;
};
