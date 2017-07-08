#!/usr/bin/env node
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var midi_log_index = -1;
var midi_log = undefined;
swapLog();

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
		let time = process.hrtime();
		socket.broadcast.emit( 'noteon', note, velocity );
		midi_log.write( ( time[0]*1000 + time[1]/1000000 ) + ":" + "on," + note + "," + velocity + "\n" );
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});

function swapLog() {
	midi_log_index = ( midi_log_index + 1 ) % 3;
	midi_log = fs.createWriteStream( 'logs/midi' + midi_log_index + '.log' );
}

setInterval( swapLog, 300*1000 );