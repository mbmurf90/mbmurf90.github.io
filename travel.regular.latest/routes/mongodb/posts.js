
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name : String,
  user: {
    type: Schema.ObjectId,
    ref: 'users'
});

mongoose.model('posts', postsSchema);
