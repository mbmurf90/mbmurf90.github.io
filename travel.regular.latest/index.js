const express = require('express');
const path = require('path');

// create instance of express (let) - local = un block lifespance
let app  = express();

// this will allow you to look through your whole filesystem
app.use(express.static(__dirname + '/public'));

//! ejs declarations - creates templates
// light - on client and server side
app.set('views', __dirname + '/public/index.html');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//! check on this
// // this will use the page - no need for ejs
// app.use('/superpage.html', function(request, result){
//   result.sendFile(path.join(__dirname+'/public/superpage.html'));
// });
// // render will look into ejs declaration!
// app.use('/superpage', function(request, result){
//   result.render('superpage.html');
// });

// // needs to be result to work
// // from priority
// app.use('/hello', function(request, result){
//   result.send('<p>hello you there</p>')
// });

// // needs to be result to work
// app.use('/', function(request, result){
//   result.send('<p>hello</p>')
// });

// looks for the port number = to check the port number
app.listen('8080', function() {
  // console.log("hello everybody!");
  // console.log("hello here!");
});


