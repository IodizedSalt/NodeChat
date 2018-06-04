http = require('http');

const chai = require("chai");
const assert = chai.assert;


describe('/', function () {
  it('should return 200', function (done) {
    http.get('http://localhost:3000/', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  
});
