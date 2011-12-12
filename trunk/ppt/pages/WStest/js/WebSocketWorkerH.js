importScripts('jquery.hive.pollen.js'); 

var status = new Object();

$(function (data) { 
	switch (data.op.toLowerCase()) {
		case "init":
			init(data.data);
			break;
	}
}); 

function init(json){
	status = json;
	
	status.exchangedMessages = 0;
	status.status = "closed";
	
	run();
}

function run(){
	var ws = new WebSocket("ws://localhost:8080/WebApps/PingWebSocket");
	ws.onmessage = function(received){
		if(received.data.toString() != status.message){
			return;
		}
		status.exchangedMessages++;
		
		if(status.exchangedMessages < status.messagesToExchange){
			if(status.exchangedMessages % (status.messagesToExchange/5) == 0 && status.exchangedMessages != 0)
			postStatus();
			ws.send(status.message);
		}else{
			postStatus();
		}
	};
	ws.onopen = function(){
		status.status = "opened";
		ws.send(status.message);
	}
}

function postStatus(){
	$.send(status);
}