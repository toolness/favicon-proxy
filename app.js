var express = require('express'),
    config = require('./config.js'),
    request = require('request'),
    path = require('path'),
    fs = require('fs'),
    url = require('url');

var app = config.https ? express.createServer(config.https) :
                         express.createServer();

app.isDomainValid = function(domain) {
  // TODO: Validate domain name better.
  return domain.match(/^[A-Za-z0-9._-]+$/) != null;
};

app.cacheDir = path.join(__dirname, 'cache');
app.cache = express.static(app.cacheDir);
app.use(app.cache);

app.get('/:protocol/:domain.ico', function(req, res, next) {
  var protocol = req.params['protocol'];
  var domain = req.params['domain'];
  
  if (protocol != "http" && protocol != "https")
    return res.send("bad protocol", 400);

  if (!app.isDomainValid(domain))
    return res.send("bad domain name", 400);

  var uri = protocol + '://' + domain + '/favicon.ico';
  var filename = path.join(app.cacheDir, protocol, domain + '.ico');
  var r = request.get(uri);
  r.pipe(fs.createWriteStream(filename));
  r.on("end", function() {
    return app.cache(req, res, next);
  });
  r.on("error", function() {
    return res.send(404);
  });
});

module.exports = app;

if (!module.parent) {
  console.log("listening on", config.hostname + ":" + config.port);
  app.listen(config.port);
}
