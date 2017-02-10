// Start listening for deviceready event.
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {}
var x;
var lat;
var lon;
var alpha;
var beta;
var gamma;
var image;
var watchPos;
var isOldApiSupported;
var isNewApiSupported;


//START:Javascript for emergency.html
function getLocation() {
	x = document.getElementById("coordinates");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else {
		new $.nd2Toast({message : "Geolocation is not supported by this browser."});
	}
}

function showPosition(position) {
	x.innerHTML = "Latitude: " + position.coords.latitude +  "<br>Longitude: " + position.coords.longitude;
	lat = position.coords.latitude;
	lon = position.coords.longitude;
}

function showError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED:
			new $.nd2Toast({message : "User denied the request for Geolocation."});
			break;
		case error.POSITION_UNAVAILABLE:
			new $.nd2Toast({message : "Location information is unavailable."});
			break;
		case error.TIMEOUT:
			new $.nd2Toast({message : "The request to get user location timed out."});
			break;
		case error.UNKNOWN_ERROR:
			new $.nd2Toast({message : "An unknown error occurred."});
			break;
	}
}

function imgPreview(input) {
	if (input.files && input.files[0]) {
		var filerdr = new FileReader();
		filerdr.onload = function(e) {
			$('#capturedImg').attr('src', e.target.result);
			image = e.target.result;
		};
		filerdr.readAsDataURL(input.files[0]);
	}

	var img = document.getElementById('capturedImg');
	img.height = 150;
	img.width = 150;
}

function gyroscope() {
	if (window.DeviceOrientationEvent) {
		var text = document.getElementById("gyro");
		window.addEventListener('deviceorientation', function(eventData) {
			// gamma is the left-to-right tilt in degrees
			console.log(eventData.gamma);
			gamma = Math.round(eventData.gamma * 10) / 10; //round to 1 digit after comma
			// beta is the front-to-back tilt in degrees
			console.log(eventData.beta);
			beta = Math.round(eventData.beta * 10) / 10;
			// alpha is the compass direction the device is facing in degrees
			console.log(eventData.alpha);
			alpha = Math.round(eventData.alpha * 10) / 10;
			
			text.innerHTML = "Alpha (Kompasswinkel in Grad):<br>" + alpha + "°<br>Beta (Vorwärts-Rückwärts Neigung):<br>" + beta + "°<br>Gamma (Rechts-Links Neigung):<br>" + gamma + "°";
		},false);
	}
}

function sendEmail() {
	var addText = $('#addinfoText').val();
	var body = "Coordinates: " + lat + ", " + lon + ". Device Orientation: Alpha: " + alpha + "°. Beta: " + beta + "°. Gamma: " + gamma + "°. Additional information: " + addText;
	var email = "mailto:test@example.com?subject=Emergency&body=" + body;
	window.open(email, '_system');
}
//END:Javascript for emergency.html

//START:Javascript for battery_state.html
function getBatteryData() {
	navigator.getBattery()
		.then(setBatteryState)
		.catch(setErrorState);
}

function setErrorState() {
	var batteryData = document.getElementById("batterySensorData");
	var batteryUndefinedState = document.getElementById("batteryUndefined");
	
	document.getElementById("batteryStateImg").src = "img/battery-undefined.png";
	batteryData.style.display = 'none'; //hide the data segment
	batteryUndefinedState.innerHTML = "<h3>Battery state undefined or Battery-API not supported!</h3>";
	
	new $.nd2Toast({message : "Battery state undefined."});
}

function setBatteryState(battery) {
	var batteryUndefinedState = document.getElementById("batteryUndefined");
	var batteryLevel = Math.round(battery.level * 100);
	
	if(batteryLevel >= 80) {
		document.getElementById("batteryStateImg").src = "img/battery-bar-5-full.png";
	} else if(batteryLevel >= 60) {
		document.getElementById("batteryStateImg").src = "img/battery-bar-4.png";
	} else if(batteryLevel >= 40) {
		document.getElementById("batteryStateImg").src = "img/battery-bar-3.png";
	} else if(batteryLevel >= 20) {
		document.getElementById("batteryStateImg").src = "img/battery-bar-2.png";
	} else if(batteryLevel >= 1) {
		document.getElementById("batteryStateImg").src = "img/battery-bar-1.png";
	} else {
		document.getElementById("batteryStateImg").src = "img/battery-undefined.png";
	}
	
	var chargingStateString = (battery.charging) ? "charging." : "not charging.";
	
	document.getElementById("batterySensorData").innerHTML = "<h4>Your battery level is " + batteryLevel + "%.<br>Your battery is currently " + chargingStateString + "</h4>";
	batteryUndefinedState.style.display = 'none'; //hide the 'undefined' segment
	
	//set EventListener
	battery.addEventListener("levelchange", getBatteryData, false);
	battery.addEventListener("chargingchange", getBatteryData, false);
}
//END:Javascript for battery_state.html

//START:Javascript for safe_driving.html
function getMovement() {
    if (navigator.geolocation && window.DeviceOrientationEvent) {
        navigator.geolocation.watchPosition(detectMovement);
    } else if(window.DeviceMotionEvent) {
		enableSafeDrivingAcc();
	} else {
        new $.nd2Toast({message : "Geolocation & DeviceMotion is not supported."});
    }
}

function detectMovement(position) {
	watchPos = position;
	navigator.geolocation.watchPosition(enableSafeDriving);
}

function enableSafeDriving(position) {
	document.getElementById("introduction").innerHTML = "Safe driving mode will color the site white once movement is detected.<br><br><font color=\"green\"><b>Safe Mode Enabled</b></font>";
	if (((Math.abs(position.coords.latitude - watchPos.coords.latitude)) > 0.00001) || ((Math.abs(position.coords.longitude - watchPos.coords.longitude)) > 0.00001)) {
		//Fires, when distance is greater than ~70cm
		document.getElementById("safeDriveHeader").style.backgroundColor = '#FFFFFF';
		document.getElementById("safeDriveHeader").style.display = 'none';
		document.getElementById("introduction").style.backgroundColor = '#FFFFFF';
		document.getElementById("introduction").style.display = 'none';
		document.getElementById("bodySD").style.backgroundColor = '#FFFFFF';
		document.getElementById("bodySD2").style.backgroundColor = '#FFFFFF';
		setTimeout(function(){}, 36000000); //1h
	} else if (window.DeviceOrientationEvent) {
		enableSafeDrivingAcc();
	}
}

function enableSafeDrivingAcc() {
	document.getElementById("introduction").innerHTML = "Safe driving mode will color the site white once movement is detected.<br><br><font color=\"green\"><b>Safe Mode Enabled</b></font>";
	window.addEventListener('devicemotion', function(eventData) {
		var x = Math.abs(eventData.acceleration.x); //Acceleration without gravity
		var y = Math.abs(eventData.acceleration.y);
		var z = Math.abs(eventData.acceleration.z);
		
		if (x > 0.2 || y > 0.2 || z > 0.2) {
			document.getElementById("safeDriveHeader").style.backgroundColor = '#FFFFFF';
			document.getElementById("safeDriveHeader").style.display = 'none';
			document.getElementById("introduction").style.backgroundColor = '#FFFFFF';
			document.getElementById("introduction").style.display = 'none';
			document.getElementById("bodySD").style.backgroundColor = '#FFFFFF';
			document.getElementById("bodySD2").style.backgroundColor = '#FFFFFF';
		}
	},false);
}
//END:Javascript for safe_driving.html

//START:Javascript for light_dependant.html
function getLux() {
	//Test for API-support
	isOldApiSupported = 'ondevicelight' in window;
	isNewApiSupported = 'AmbientLightSensor' in window;
	
	if (!isOldApiSupported && !isNewApiSupported) {
		document.getElementById("ambientLightSensorData").style.display = 'none';
		document.getElementById("ambientLightAPISupport").innerHTML = "<h3>AmbientLight-API not supported!</h3>";
	} else if (isOldApiSupported) {
		document.getElementById("ambientLightAPISupport").innerHTML = "<br><h3>Old AmbientLight-API supported!</h3>";
		
		//Add EventListener for old API
		window.addEventListener('devicelight', function(event) {
			updateLightLevel(event.value);
		});
	} else {
		document.getElementById("ambientLightAPISupport").innerHTML = "<br><h3>New AmbientLight-API supported!</h3>";
		
		//Add EventListener for new API
		var sensor = new AmbientLightSensor();
		sensor.start();
		sensor.addEventListener('change', function(event) {
			updateLightLevel(event.reading.illuminance);
		});
	}
}

function updateLightLevel(lightLevel) {
	document.getElementById("ambientLightSensorData").innerHTML = "Current lighting is: " + Math.round(lightLevel) + " lux.";
	
	if (lightLevel < 50) {
		document.getElementById("lightDepContent").className = "dark-theme";
	} else if (lightLevel < 10000) {
		document.getElementById("lightDepContent").className = "classic-theme";
	} else {
		document.getElementById("lightDepContent").className = "light-theme";
	}
}
//END:Javascript for light_dependant.html
//EOF