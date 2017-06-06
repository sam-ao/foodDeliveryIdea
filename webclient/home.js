$(function () {
	socket.on('connect', function(data) {
		console.log('checking login');
		FB.getLoginStatus(function(response) {
    		if(response.status !== 'connected'){
    			window.location.href = "http://localhost:3000/login";
    		}
    	});
	});