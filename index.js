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
    socket.on('user-login', function(number){
		console.log(number);
	});
	socket.on('get-restaurants', function(){
		con.query('SELECT * FROM restaurants', function(err,rows){
			if(err) throw err;
			rows.sort(compare);
			socket.emit('restaurants', rows);
		});
	});
	socket.on('get-menu', function(restaurantID){
		con.query('SELECT * FROM menu_items WHERE restaurantID=' + restaurantID, function(err,rows){
			if(err) throw err;
			rows.sort(compare);
			socket.emit('menu', rows);
		});
	});
	socket.on('get-sub-menu', function(menuItemID){
		con.query('SELECT * FROM sub_menu_items WHERE menuItemID=' + menuItemID, function(err,rows){
			if(err) throw err;
			rows.sort(compare);
			socket.emit('sub-menu', rows);
		});
	});
	socket.on('find-restaurant-id', function(menuItemID){
		con.query('SELECT restaurantID FROM menu_items WHERE id=' + menuItemID, function(err,rows){
			if(err) throw err;
			rows.sort(compare);
			socket.emit('restaurant-id', rows);
		});
	});
	socket.on('order-submitted', function(userOrder){
		con.query('INSERT INTO orders (userID, orderContent, completed) VALUES (' + userOrder.user.id + ', \"' + userOrder.order + '\", 0);', function(err){
			if(err) throw err;
		});
		con.query('SELECT * FROM users WHERE id=' + userOrder.user.id, function(err,rows){
			if(err) throw err;
			if(rows == null) {
				con.query('INSERT INTO users (id, phoneNumber, name, picture) VALUES (' + userOrder.user.id + ', ' + userOrder.user.phoneNumber +
						 ', \"' + userOrder.user.name + '\", \"' + userOrder.user.picture + '\");', function(err){
					if(err) throw err;
				});
			}
			else {
				con.query('UPDATE users SET name=\"' + userOrder.user.name + '\", picture=\"' + userOrder.user.picture + '\" WHERE id=' + userOrder.user.id, function(err){
					if(err) throw err;
				});
			} 
		});
	});
	socket.on('get-orders', function(){
		con.query('SELECT * FROM orders WHERE delivererID IS NULL', function(err,rows){
			if(err) throw err;
			socket.emit('orders', rows);
		});
	});
	socket.on('get-user', function(userID){
		con.query('SELECT * FROM users WHERE id=' + userID, function(err,rows){
			if(err) throw err;
			rows.sort(compare);
			socket.emit('user', rows);
		});
	});
	socket.on('claim-order', function(orderClaim) {
		console.log(orderClaim.userID);
		console.log(orderClaim.orderID);
		con.query('UPDATE orders SET delivererID=' + orderClaim.userID + ' WHERE id=' + orderClaim.orderID + ";", function(err){
			if(err) throw err;
		});
	});
});

function compare(a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}