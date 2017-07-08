var midi = null;  // global MIDIAccess object
var inputdevice = null;  // global input device
var outputdevice = null;  // global output device
var use_cookies = true;  // manages usage of cookies
var socket = null;  // connection to the server

var inputStatus = {  // state for pedal translation
	pedal_on: false,
	sustained: new Array(128).fill(0),  // 0=off, 1=on, 2=off but sustained
};

function resetInputStatus() {
	inputStatus.pedal_on = false;
	inputStatus.sustained = new Array(128).fill(0);
}

function onMIDIMessage( event ) {
	if( event.data[0] != 254 && event.data[0] != 248 ) {
		if( event.data[0] == 0x90 && event.data[2] != 0 ) {
			socket.emit( 'noteon', event.data[1], event.data[2] );
			pianoDisplayPress( event.data[1], true );
			if( inputStatus.pedal_on )
				inputStatus.sustained[event.data[1]] = 1;
		} else if( event.data[0] == 0x80 || (event.data[0] == 0x90 && event.data[2] == 0) ) {
			if( inputStatus.pedal_on ) {
				inputStatus.sustained[event.data[1]] = 2;
			} else {
				socket.emit( 'noteon', event.data[1], 0 );
				pianoDisplayPress( event.data[1], false );
			}
		} else if( event.data[0] == 0xB0 && event.data[1] == 0x40 ) {
			if(event.data[2] >= 64) {
				inputStatus.pedal_on = true;
			} else {
				inputStatus.pedal_on = false;
				for( var i = 0; i < 128; i++ ) {
					if( inputStatus.sustained[i] == 2 ) {
						socket.emit( 'noteon', i, 0 );
						pianoDisplayPress( i, false );
					}
				}
				inputStatus.sustained = new Array(128).fill(0);
			}
		}
		console.log( event );
	}
}

function updateInputDevice( id ) {
	if( use_cookies )
		Cookies.set('preferred_input_device_id', id, { expires: 7 });
	if( id == "none" ) {
		inputdevice = null;
	} else {
		for( var entry of midi.inputs ) {
			if( entry[1].id == id ) {
				inputdevice = entry[1];
				inputdevice.onmidimessage = onMIDIMessage;
				return 0;
			}
		}
	}
}

function updateOutputDevice( id ) {
	allNotesOff();
	if( use_cookies )
		Cookies.set('preferred_output_device_id', id, { expires: 7 });
	if( id == "none" ) {
		outputdevice = null;
		socket.off('noteon', onServerNoteOn );
	} else {
		if( outputdevice == null )
			socket.on('noteon', onServerNoteOn );
		for( var entry of midi.outputs ) {
			if( entry[1].id == id ) {
				outputdevice = entry[1];
				return 0;
			}
		}
	}	
}

function listInputsAndOutputs( midiAccess ) {
	$('#midiInputDevices').empty();
	var using_id = Cookies.get('preferred_input_device_id');
	var alternative_id;
	for( var entry of midi.inputs ) {
		alternative_id = entry[1].id;
		break;
	}
	var found_id = (using_id == "none");
	for( var entry of midiAccess.inputs ) {
		var input = entry[1];
		if( input.id == using_id )
			found_id = true;
		var manufacturer = input.manufacturer == '' ? '' : ( input.manufacturer + ' ' );
		$('#midiInputDevices').append( '<div class="radioButton"><input type="radio" name="midiInputDeviceChoice" value="' +
			input.id + '" onClick="updateInputDevice(this.value)">' + manufacturer + input.name + '</div>' );
	}
	$('#midiInputDevices').append( '<div class="radioButton"><input type="radio" name="midiInputDeviceChoice" value="none" onClick="updateInputDevice(this.value)">None</div>' );
	if( !found_id ) {
		if( using_id != undefined )
			$('#midiInputDevices').append( '<div class="radioButton"><input type="radio" name="midiInputDeviceChoice" value="' +
				alternative_id + '" disabled="true"><del>' + Cookies.get('preferred_input_device_id') + '</del></div>' );
		using_id = alternative_id;
	}
	$("input[name=midiInputDeviceChoice][value='" + using_id + "']").prop("checked",true);

	$('#midiOutputDevices').empty();
	using_id = Cookies.get('preferred_output_device_id');
	for( var entry of midi.outputs ) {
		alternative_id = entry[1].id;
		break;
	}
	found_id = (using_id == "none");
	for( var entry of midiAccess.outputs ) {
		var output = entry[1];
		if( output.id == using_id )
			found_id = true;
		var manufacturer = output.manufacturer == '' ? '' : ( output.manufacturer + ' ' );
		$('#midiOutputDevices').append( '<div class="radioButton"><input type="radio" name="midiOutputDeviceChoice" value="' +
			output.id + '" onClick="updateOutputDevice(this.value)">' + manufacturer + output.name + '</div>' );
	}
	$('#midiOutputDevices').append( '<div class="radioButton"><input type="radio" name="midiOutputDeviceChoice" value="none" onClick="updateOutputDevice(this.value)">None</div>' );
	if( !found_id ) {
		if( using_id != undefined )
			$('#midiOutputDevices').append( '<div class="radioButton"><input type="radio" name="midiOutputDeviceChoice" value="' +
				alternative_id + '" disabled="true"><del>' + Cookies.get('preferred_output_device_id') + '</del></div>' );
		using_id = alternative_id;
	}
	$("input[name=midiOutputDeviceChoice][value='" + using_id + "']").prop("checked",true);

	updateInputDevice( $('input[name="midiInputDeviceChoice"]:checked').val() );
	updateOutputDevice( $('input[name="midiOutputDeviceChoice"]:checked').val() );
}

function allNotesOff() {
	if( outputdevice != null ) {
		outputdevice.send([0xB0, 0x78, 0]);
	}
}

function playNote( value, milliseconds ) {
	var noteOnMessage = [0x90, value, 0x7f];
	outputdevice.send( noteOnMessage );
	outputdevice.send( [0x80, value, 0x40], window.performance.now() + milliseconds );
}

function onServerNoteOn( note, velocity ) {
	console.log('servernote');
	if( velocity == 0 ) {
		outputdevice.send( [0x80, note, 64] );
	} else {
		outputdevice.send( [0x90, note, velocity] );
	}
}

function onMIDISuccess( midiAccess ) {
	console.log( "MIDI ready!" );
	midi = midiAccess;
	listInputsAndOutputs( midi );
	midi.onstatechange = function( event ) {
		listInputsAndOutputs( midi );
	}
}

function onMIDIFailure(msg) {
	console.log( "Failed to get MIDI access - " + msg );
}

$(function() {
	console.log( 'input cookie:' + Cookies.get( 'preferred_input_device_id' ) );
	navigator.requestMIDIAccess( { sysex: false } ).then( onMIDISuccess, onMIDIFailure );
	socket = io();
	document.getElementById('log_play').addEventListener('click', readSingleFile, false);
});

let log_data = [];

function readSingleFile() {
	e = document.getElementById('log_file');
	if( e.files == null )
		return;
	let file = e.files[0];
	if (!file)
		return;
	let reader = new FileReader();
	reader.onload = function(e) {
		let commands = e.target.result.split("\n");
		log_data = commands.map( str => { 
			let x = str.split(/[:,]/); 
			return [ parseFloat(x[0]), x[1], parseInt(x[2]), parseInt(x[3]) ]; 
		} ).sort( (a,b) => {
			if (a[0] > b[0]) return -1;
   			if (a[0] < b[0]) return 1;
   			return 0;} 
   		);
		console.log(log_data);
		playLog();
	};
	reader.readAsText( file );
}

function playLog() {
	let c = log_data.pop();
	if( c[1] == "on" ) {
		socket.emit( 'noteon', c[2], c[3] );
		onServerNoteOn( c[2], c[3] );
	}
	if( log_data.length > 0 )
		setTimeout(playLog,log_data[log_data.length-1][0]-c[0]);
}
