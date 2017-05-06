var midi = null;  // global MIDIAccess object
var inputdevice = null;  // global input device
var outputdevice = null;  // global output device

function updateInputDevice( id ) {
	//console.log( 'Updating input device: ' + id );
	for( var entry of midi.inputs ) {
		if( entry[1].id == id ) {
			inputdevice = entry[1];
			return 0;
		}
	}
}

function updateOutputDevice( id ) {
	//console.log( 'Updating output device: ' + id );
	for( var entry of midi.outputs ) {
		if( entry[1].id == id ) {
			outputdevice = entry[1];
			return 0;
		}
	}
}

function listInputsAndOutputs( midiAccess ) {
	$('#midiInputDevices').empty();
	for( var entry of midiAccess.inputs ) {
		var input = entry[1];
		var manufacturer = input.manufacturer == '' ? '' : ( input.manufacturer + ' ' );
		$('#midiInputDevices').append( '<div class="radioButton"><input type="radio" name="midiInputDeviceChoice" value="' +
			input.id + '" onClick="updateInputDevice(this.value)" checked>' + manufacturer + input.name + '</div>' );
	}
	$('#midiOutputDevices').empty();
	for( var entry of midiAccess.outputs ) {
		var output = entry[1];
		var manufacturer = output.manufacturer == '' ? '' : ( output.manufacturer + ' ' );
		$('#midiOutputDevices').append( '<div class="radioButton"><input type="radio" name="midiOutputDeviceChoice" value="' +
			output.id + '" onClick="updateOutputDevice(this.value)" checked>' + manufacturer + output.name + '</div>' );
	}
	updateInputDevice( $('input[name="midiInputDeviceChoice"]:checked').val() );
	updateOutputDevice( $('input[name="midiOutputDeviceChoice"]:checked').val() );
}

function playNote( value, milliseconds ) {
	var noteOnMessage = [0x90, value, 0x7f];
	outputdevice.send( noteOnMessage );
	outputdevice.send( [0x80, value, 0x40], window.performance.now() + milliseconds );
}

function onMIDIMessage( event ) {
	if( event.data[0] != 254 && event.data[0] != 248 ) {
		if( event.data[0] == 0x90 ) {
			pianoDisplayPress( event.data[1], event.data[2] > 0 );
		}
		console.log( event );
	}
	
	//if( event)
}

function onMIDISuccess( midiAccess ) {
	console.log( "MIDI ready!" );
	midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
	listInputsAndOutputs( midi );
	// console.log( $('input[name="midiInputDeviceChoice"]:checked').val() );
	// playNote( 60, 1000.0 );
	inputdevice.onmidimessage = onMIDIMessage;
}

function onMIDIFailure(msg) {
	console.log( "Failed to get MIDI access - " + msg );
}

$(function() {
	navigator.requestMIDIAccess( { sysex: false } ).then( onMIDISuccess, onMIDIFailure );
});
