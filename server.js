var http = require('http');
var url = require('url');
var fs = require('fs');
var webSocketServer = require('websocket').server;

var clientDir = './client';
var ext2mimeMap = {
    '.htm' : 'text.html',
    '.html' : 'text.html',
    '.js' : 'application/javascript',
    '.css' : 'text/css',
    '.ico' : 'image/x-icon'
};

function start() {
    console.log((new Date()) + 'Server started');
    var clients = [];
	var onRequest = function(request, response) {
        console.log((new Date()) + ' received request ' + request.url);
		request.setEncoding("utf8");
		request.addListener("end", function() {
            var parsedUrl = url.parse(request.url, true ).pathname;
            var filePath = clientDir + parsedUrl;
            var extension = /(?:\.([^.]+))?$/.exec(filePath)[0];
            fs.readFile(filePath, 'utf8', function (err, file) {
                if (err) {
                    console.log((new Date()) + ' Error fetching file ' + err);
                    response.writeHead(404, {'content-Type' : 'text/plain'});
                    response.write('404. File Not Found.');
                    response.end();
                } else {
                    response.writeHead(200, {'content-Type' : ext2mimeMap[extension]});
                    response.write(file);
                    response.end();
                }
            });
		});
        request.resume();
	};
    var onWsRequest = function(request) {
        console.log((new Date()) + ' Connection from ' + request.origin);
        var connection = request.accept(null, request.origin);
        var index = clients.push(connection) - 1;
        console.log((new Date()) + ' Connection established');

        connection.on('message', function(message) {
            console.log((new Date()) + ' Client Message Received. ' + message.utf8Data)
            if (message.type === 'utf8') {
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(message.utf8Data);
                    console.log((new Date()) + ' Message Forwarded.')
                }
            }
        })
    };
	var server = http.createServer(onRequest).listen(8000);
    var wsServer = new webSocketServer({httpServer : server});
    wsServer.on('request', onWsRequest);
}
exports.start = start;
