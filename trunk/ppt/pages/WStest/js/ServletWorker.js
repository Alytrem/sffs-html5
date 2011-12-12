importScripts('jquery.hive.pollen.js'); 

var status = new Object();

self.onmessage = function(event) {
    var data = JSON.parse(event.data);
    switch (data.op.toLowerCase()) {
        case "init":
            init(data.data);
            break;
    }
};

function init(json){
    status = json;
	
    status.exchangedMessages = 0;
    status.status = "closed";
	
    run();
}

function run(){
    $.ajax.get({
        url: 'http://localhost:8080/WebApps/PingServlet?data='+status.message,
        success: function(received){
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
    self.postMessage(JSON.stringify(status));
}