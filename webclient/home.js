var socket = io();

var user;
var userId;
var userName;
var userNumber;
var userPicture;

$(function () {
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	socket.on('connect', function(data) {
		window.fbAsyncInit = function() {
			FB.init({
				appId      : '163634650841810',
				cookie     : true,
				xfbml      : true,
				version    : 'v2.8'
			});
			FB.AppEvents.logPageView();
			console.log('checking login');
			FB.getLoginStatus(function(response) {
				console.log(response.status);
	    		if(response.status !== 'connected'){
	    			window.location.href = "http://localhost:3000/login";
	    		}
	    		else {
	    			FB.api('/me', 'GET', {fields: 'first_name, last_name, name, id, picture.width(50).height(50)'}, function(response) {
	    				console.log(response);
	    				userPicture = response.picture.data.url;
						console.log(userPicture);
						console.log(userId);
						userId = response.id;
						userName = response.first_name + response.last_name;
						user = {id: userId, phoneNumber: 0, name: userName, picture: userPicture};
					});
	    		}
    		});
		};
	});
});

function submitNumber() {
	socket.emit('')
}

function changePhoneNumber() {
	load('/', openTextInput);
}

function openTextInput() {
	document.getElementById("phonenumber").innerHTML = 
	"<form>"+
	"<input type=\"text\" id=\"fname\"><br>"+
	"</form>"+
	"<button type=\"button\" onclick=\'submitNumber()\'>Submit</button>";
}

var restaurantMenu;
var orderDialog = "<p><img src='"+userPicture+"'></img><textarea rows='5' cols='50' id='order' placeholder=\"Enter your order and any special requests here. Don't forget to include your location!\"></textarea></p>" + 
				  "<p><button type='button' onclick='submitOrder()'>Submit Order</button><div id='submit-result'></div></p>";
function displayMenu() {
	socket.emit('get-restaurants');
	socket.on('restaurants', function(restaurants) {
		restaurantMenu = "<p><button type=\'button\' onclick=\'displayMainMenu()\'>Back</button></p><p>";
		var columnCounter = 0;
		restaurants.forEach(function(restaurant){
			columnCounter++;
			if(columnCounter == 4) {
				restaurantMenu += "</p><p>";
				columnCounter = 0;
			}
			restaurantMenu += "<button type=\"button\" onclick=\"selectRestaurant(" + restaurant.id + ")\"><p>" + restaurant.name + "</p>" +
								"<p>" + restaurant.location + "</p></button>"; 
		});
		restaurantMenu += "</p>" + orderDialog;
		load('/', displayRestaurants);
	});
}

var orderForum;
function displayForum() {
	socket.emit('get-orders');
	socket.on('orders', function(orders) {
		orderForum = "<p><button type=\'button\' onclick=\'displayMainMenu()\'>Back</button></p>";
		orders.forEach(function(order){
			socket.emit('get-user', order.userID);
			socket.on('user', function(user) {
				orderForum += "<p><img src='"+user.picture+"'></img>" + user.name + ": " + order.orderContent + "<button type='button' onclick=\'claimOrder(" + order.id + ")\''>Claim</button></p>"
			});
		});
		load('/', function(){
			document.getElementById("content").innerHTML = orderForum;
			console.log(orderForum);
		});
	});
}

function claimOrder(orderID) {
	socket.emit('claim-order', {orderID: orderID, userID: user.id});
	displayForum();
}

function submitOrder() {
	var order = document.getElementById("order").value;
	var userOrder = {user: user, order: order};
	socket.emit('order-submitted', userOrder);
	load('/', function(){
		document.getElementById("submit-result").innerHTML = 'Order Submitted!';
	});
}

var menuItemMenu;
function selectRestaurant(restaurantID) {
	socket.emit('get-menu', restaurantID);
	socket.on('menu', function(menu){
		menuItemMenu = "<p><button type=\'button\' onclick=\'backToRestaurants()\'>Back</button></p><p>";
		var columnCounter = 0;
		menu.forEach(function(menuItem){
			columnCounter++;
			if(columnCounter == 4) {
				menuItemMenu += "</p><p>";
				columnCounter = 0;
			}
			if(menu.subitem == 1) {
				menuItemMenu += "<button type=\"button\" onclick=\"selectMenuItem(" + menuItem.id + ")\">" + menuItem.name + "</p>" +
								"<p>" + menuItem.description + "</p></button>";
			}
			else {
				menuItemMenu += "<button type=\"button\" onclick=\"expandMenuItem(" + menuItem.id + ")\">" + menuItem.name + "</p>" +
								"<p>" + menuItem.description + "</p></button>";
			}
		});
		menuItemMenu += "</p>" + orderDialog;
		load('/', displayMenuItems);
	});
}

var subMenuItemMenu;
function expandMenuItem(menuItemID) {
	socket.emit('get-sub-menu', menuItemID);
	socket.on('sub-menu', function(submenu){
		subMenuItemMenu = "<p><button type=\'button\' onclick=\'backToMenuItems(" + menuItemID + ")\'>Back</button></p>";
		subMenuItemMenu += "<p>Select one of the following...</p><p>";
		var columnCounter = 0;
		submenu.forEach(function(subMenuItem){
			columnCounter++;
			if(columnCounter == 4) {
				subMenuItemMenu += "</p><p>";
				columnCounter = 0;
			}
			subMenuItemMenu += "<button type=\"button\" onclick=\"selectSubMenuItem(" + subMenuItem.id + ")\">" + subMenuItem.name + "</p>" +
								"<p>" + subMenuItem.description + "</p></button>";
		});
		subMenuItemMenu += "</p>" + orderDialog;
		load('/', displaySubMenuItems);
	});
}

function backToRestaurants() {
	displayMenu();
}

function backToMenuItems(menuItemID) {
	socket.emit('find-restaurant-id', menuItemID);
	socket.on('restaurant-id', function(restaurantID) {
		console.log(restaurantID[0].restaurantID);
		selectRestaurant(restaurantID[0].restaurantID);
	});
}

function displayMainMenu() {
	var mainMenu = "<button type='button', id='order', onclick='displayMenu()'> I want to order something</button>" +
    				"<button type='button', id='delivery', onclick='displayForum()'> I want to deliver something</button>";
    load('/', function() {
    	document.getElementById("content").innerHTML = mainMenu;
    })
}

function displayRestaurants() {
	document.getElementById("content").innerHTML = restaurantMenu;
}

function displayMenuItems() {
	document.getElementById("content").innerHTML = menuItemMenu;
}

function displaySubMenuItems() {
	document.getElementById("content").innerHTML = subMenuItemMenu;
}

function load(url, callback) {
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			callback(this);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

User = function(userid, name, number) {
    this.userId = userid;
    this.username = name;
    this.phoneNumber = number;
};