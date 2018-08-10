var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name : String
});

mongoose.model('users', { name: String });
app.get('/users', function (req, res) {
  mongoose.model('users').find(function (err, users) {
    res.send(users);
  });
});


// require('dotenv').config();
// var open = require("open");
// open("http://localhost:8080/index.html");
// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');
// // Connection URL
// const url = 'mongodb://localhost:27017';
// // Database Name
// const dbName = 'travel';
// // Use connect method to connect to the server
// MongoClient.connect(url, function (err, client) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");
//   const db = client.db(dbName);
//   client.close();
// });
// add documents
// const insertDocuments = function(db, callback) {
//   // Get the documents collection
//   const collection = db.collection('documents');
//   // Insert some documents
//   collection.insertMany([
//     {a : 1}, {a : 2}, {a : 3}
//   ], function(err, result) {
//     assert.equal(err, null);
//     assert.equal(3, result.result.n);
//     assert.equal(3, result.ops.length);
//     console.log("Inserted 3 documents into the collection");
//     callback(result);
//   });
// }
// use insert documents
// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');
// // Connection URL
// const url = 'mongodb://localhost:27017';
// // Database Name
// const dbName = 'myproject';
// // Use connect method to connect to the server
// MongoClient.connect(url, function(err, client) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");
//   const db = client.db(dbName);
//   insertDocuments(db, function() {
//     client.close();
//   });
// });
// Find All Documents
// Add a query that returns all the documents.
// const findDocuments = function(db, callback) {
//   // Get the documents collection
//   const collection = db.collection('documents');
//   // Find some documents
//   collection.find({}).toArray(function(err, docs) {
//     assert.equal(err, null);
//     console.log("Found the following records");
//     console.log(docs)
//     callback(docs);
//   });
// }
// return document
// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');
// // Connection URL
// const url = 'mongodb://localhost:27017';
// // Database Name
// const dbName = 'myproject';
// // Use connect method to connect to the server
// MongoClient.connect(url, function(err, client) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server");
//   const db = client.db(dbName);
//   insertDocuments(db, function() {
//     findDocuments(db, function() {
//       client.close();
//     });
//   });
// });