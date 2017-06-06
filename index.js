var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var mysql = require('mysql');

http.listen( port, function () {
    console.log('listening on port', port);
});

app.set('views', __dirname + '/pug');
app.set('view engine', "pug");
app.engine('pug', require('pug').__express);
app.use(express.static(__dirname + '/webclient'));

app.get('/', function(req, res){
  res.render("home");
});

app.get('/login', function(req, res){
  res.render("login");
});



var con = mysql.createConnection({
  host: "localhost",
  user: "dba",
  password: "1qaz2wsx",
  database: "deliverus"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

// listen to 'chat' messages
io.on('connect', function(socket){
    socket.on('login', function(response){
		
    });
});