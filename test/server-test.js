const PORT = 3001;

var app = require('../app.js'),
    APIeasy = require('api-easy'),
    assert = require('assert');

app.listen(PORT);

var suite = APIeasy.describe("server");

suite.expectBody = function(expected) {
  var msg = "body is " + JSON.stringify(expected);
  return this.expect(msg, function(req, res, body) {
    assert.equal(body, expected);
  });
};

suite
  .use("localhost", PORT).followRedirect(false)
  .path('/badprotocol/u.com.ico')
    .get().expect(400).expectBody("bad protocol").unpath()
  .path('/http/baddomain!.ico')
    .get().expect(400).expectBody("bad domain name").unpath();

suite.export(module);
