var socket = io();

var user;
var userId;
var userName;
var userNumber;

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
	    			FB.api('/me', function(response) {
						userId = response.id;
						userName = response.first_name + response.last_name;
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
function displayMenu() {
	socket.emit('get-restaurants');
	socket.on('restaurants', function(restaurants) {
		restaurantMenu = "<p><button type=\'button\' onclick=\'back()\'>Back</button></p><p>";
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
		restaurantMenu += "</p>";
		load('/', displayRestaurants);
	});
}

var menuItemMenu;
function selectRestaurant(restaurantID) {
	socket.emit('get-menu', restaurantID);
	socket.on('menu', function(menu){
		menuItemMenu = "<p><button type=\'button\' onclick=\'back()\'>Back</button></p><p>";
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
		menuItemMenu += "</p>";
		load('/', displayMenuItems);
	});
}

var subMenuItemMenu;
function expandMenuItem(menuItem) {
	socket.emit('get-sub-menu', menuItem);
	socket.on('sub-menu', function(submenu){
		subMenuItemMenu = "<p><button type=\'button\' onclick=\'back()\'>Back</button></p>";
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
		subMenuItemMenu += "</p>";
		load('/', displaySubMenuItems);
	});
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