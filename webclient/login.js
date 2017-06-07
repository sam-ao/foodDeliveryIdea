var socket = io();
var user;
var userId;
var userName;
var userNumber;

function login() {
	FB.login(function(response) {
		if (response.status === 'connected') {
			FB.api('/me', function(response) {
				userId = response.id;
				userName = response.first_name + response.last_name;
			});
			load('/', loginSuccessful)
		} else {

		}
	});
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

function loginSuccessful(xhttp){
	document.getElementById("login-result").innerHTML = 
	"<form>"+
	"<p>Great! Now we just need your phone number</p>"+
	"<input type=\"text\" id=\"fname\"><br>"+
	"</form>"+
	"<button type=\"button\" onclick=\'redirect()\'>Submit</button>";
}

function redirect() {
	userNumber = document.getElementById("fname").value;
	user = new User(userId, userName, userNumber);
	socket.emit('user-login', user);
	window.location.href = "http://localhost:3000/";
}

function loginUnsuccessful(xhttp){
	document.getElementById("login-result").innerHTML = "Login Failed";
}

User = function(userid, name, number) {
    this.userId = userid;
    this.username = name;
    this.phoneNumber = number;
};

window.fbAsyncInit = function() {
	FB.init({
		appId      : '163634650841810',
		cookie     : true,
		xfbml      : true,
		version    : 'v2.8'
	});
	FB.AppEvents.logPageView();   
	};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
