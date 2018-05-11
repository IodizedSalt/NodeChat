var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var expect = chai.expect();
var assert = require('assert'),
http = require('http');
chai.use(chaiHttp);

describe('/', function () {
  it('should return 200', function (done) {
    http.get('http://localhost:3000/', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });
  
});