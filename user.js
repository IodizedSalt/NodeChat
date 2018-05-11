var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var http = require('http'),
    fs = require('fs');
var $ = require('jQuery');
var request = require('request');
var UserSchema = new mongoose.Schema({

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  }
});

//authenticate input against database

UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          var username = User.findOne({username:username})          
          //   request.post({
          //     headers:{"Username": username},
          //     url: "http://localhost:3000/profile",
          //     method: "POST"
          //     },
          //     function (err, response, body) {
          //       if(err||response.statusCode !=200)
          //       {
          //         console.log(err);
          //       }else{
          //         console.log("success");
          //       }
          // });
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}
//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;

