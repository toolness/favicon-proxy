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

app.proxyFavicon = function(protocol, domain, serverReq, serverRes) {
  var faviconReq = require(protocol).request({
    host: domain,
    path: '/favicon.ico'
  }, function(faviconRes) {
    if (faviconRes.statusCode >= 300 && faviconRes.statusCode < 400) {
      var location = faviconRes.headers['location'];
      if (location) {
        var parsed = url.parse(location);
        if (parsed.protocol == "http:" || parsed.protocol == "https:") {
          if (parsed.pathname == "/favicon.ico" && parsed.hostname) {
            serverRes.header("Location", "/" + parsed.protocol.slice(0, -1) + "/" + parsed.hostname);
            return serverRes.send(faviconRes.statusCode);
            //return serverRes.send("LOL REDIRECT " + parsed.hostname);
          }
        }
      }
    }
    if (faviconRes.statusCode != 200)
      return serverRes.send(404);
    serverRes.header("Content-Type", faviconRes.headers['content-type']);
    serverRes.header("Content-Length", faviconRes.headers['content-length']);
    faviconRes.on('data', function(chunk) {
      serverRes.write(chunk);
    });
    faviconRes.on('end', function() {
      serverRes.end();
    });
  });
  
  faviconReq.on('error', function() {
    return serverRes.send(404);
  });
  faviconReq.end();
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

  //app.proxyFavicon(protocol, domain, req, res);
  /*
  var uri = protocol + '://' + domain + '/favicon.ico';
  var r = request(uri, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var output = 'it is ' + response.header('Content-Type') + ' ' + response.header("Content-Length") + ' ' + typeof(body);
      console.log(output);
      return res.send(output);
      //res.header("Content-Type", response.header("Content-Type"));
      //return res.send(new Buffer());
      //res.header("Content-Type", response.header("Content-Type"));
      
      //return res.send(new Buffer(body));
      //return response.pipe(res);
      //return res.pipe(response);
    }
    return res.send(404);
  });*/
  //return res.send("HAiI " + protocol + " " + domain);
});

module.exports = app;

if (!module.parent) {
  console.log("listening on", config.hostname + ":" + config.port);
  app.listen(config.port);
}
