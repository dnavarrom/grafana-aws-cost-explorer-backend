const auth = require('basic-auth');
const config = require('config');

let admins = {};

if (config.has('AUTH') && config.has('AUTH.enabled') && config.has('AUTH.secret')) {
    admins = { username: { password: config.get('AUTH.secret') } }
}
else {
    throw new Error("Secret Key no configurado en /config/default.json");
}

module.exports = function(request, response, next) {
  var user = auth(request)
  console.log(request);
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    response.set('WWW-Authenticate', 'Basic realm="My Realm"')
    return response.status(401).send()
  }
  return next()
}