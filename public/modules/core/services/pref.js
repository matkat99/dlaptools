var gui = require('nw.gui');
var w = gui.Window.get();

function clearCache(){
	gui.App.clearCache();
}

function fullscreen(){
	w.isFullscreen = w.isFullscreen ? false : true;
}

function kiosk(){	
	w.isKioskMode = w.isKioskMode ? false : true;
}

function dev(){
	w.showDevTools();
}

function closeWin(){
	w.isKioskMode = false;
	w.isFullscreen = false;
	w.close();
}

function menuFullScreen(ele){
	if (ele.innerHTML.indexOf('(Exit)') != -1){
		ele.innerHTML = ele.innerHTML.replace('(Exit) Full Screen', 'Full Screen')
	}
	else{
		ele.innerHTML = ele.innerHTML.replace('Full Screen', '(Exit) Full Screen')
	}
	kiosk();
}

function refresh(){
	w.reload();	
}

function getBrainhoneyCookie(callback){
	w.cookies.get({url: 'byui.brainhoney.com', name: '.ASPXAUTH'}, function(cookie){
		callback(cookie);
	})
}