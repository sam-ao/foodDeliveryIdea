var socket = io();
var user;

function login() {
	FB.login(function(response) {
		if (response.status === 'connected') {
			FB.api('/me', function(response) {
				user = new User(response.id, response.first_name);
			});
			window.location.href = "http://localhost:3000/";
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
	"First name: <input type=\"text\" name=\"fname\"><br>"+
	"</form>"+
	"<button type=\"button\" onclick=\'redirect()\'>Submit</button>";
}

function loginUnsuccessful(xhttp){
	document.getElementById("login-result").innerHTML = "Login Failed";
}

User = function(userid, name) {
    this.userId = userid;
    this.username = name;
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
