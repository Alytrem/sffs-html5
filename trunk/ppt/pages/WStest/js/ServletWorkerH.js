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
$.ajax.get('http://localhost:8080/WebApps/PingServlet?data='+status.message)
                // If an error occurs
                .error(function(er) {
					return;
                })
                // in case of success
                .success(function(received){
                    if(received.trim().toString() == status.message.trim().toString()){
                        status.exchangedMessages++;
                        if(status.exchangedMessages < status.messagesToExchange){
                            if(status.exchangedMessages % (status.messagesToExchange/5) == 0 && status.exchangedMessages != 0)
								postStatus();
                            run();
                        }else{
                            printStatus();
                        }
                    }
                });
}

function postStatus(){
	$.send(status);
}