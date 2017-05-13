var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use( express.static(__dirname + '/public') );

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/bot/', function(req, res) {
	res.sendFile(__dirname + '/testbot.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('noteon', function(note, velocity){
		console.log('message: ' + note + ', ' + velocity );
		socket.broadcast.emit( 'noteon', note-12, velocity );
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});