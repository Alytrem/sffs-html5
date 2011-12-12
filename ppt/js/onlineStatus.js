
		// online check
		var tempImage;
		onlineStatus = false;

function checkOnlineStatus() {
tempImage = new Image();
tempImage.onload = returnOnlineStatus;
tempImage.onerror = returnOfflineStatus;
var imgSrc = 'http://overlandunderwater.net/1-pixel.gif'; // point to the url of a valid image.
tempImage.src = imgSrc;
return !(tempImage.width == 0 && tempImage.height == 0);
}

function returnOnlineStatus() {
	if (tempImage.width == 0 && tempImage.height == 0) {
		onlineStatus = false;
	} else {
		onlineStatus = true;
	}
}

function returnOfflineStatus() {
	onlineStatus = false;
}

checkOnlineStatus();