var mongoose = require('mongoose');
var request = require('request');
var postSchema = new mongoose.Schema({ 
    title:{
        type: String,
        required: true,
        trim: true
    },
    body:{
        type: String,
        required: true,
        trim: true
        }
});
var Post = mongoose.model('Post', postSchema);
module.exports = Post;
