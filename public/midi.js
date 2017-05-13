var midi = null;  // global MIDIAccess object
var inputdevice = null;  // global input device
var outputdevice = null;  // global output device
var use_cookies = true;  // manages usage of cookies
var socket = null;  // connection to the server

function onMIDIMessage( event ) {
	if( event.data[0] != 254 && event.data[0] != 248 ) {
		if( event.data[0] == 0x90 ) {
			socket.emit( 'noteon', event.data[1], event.data[2] );
			pianoDisplayPress( event.data[1], event.data[2] > 0 );
		}
		console.log( event );
	}
}

function updateInputDevice( id ) {
	if( id == "none" ) {
		inputdevice = null;
	} else {
		for( var entry of midi.inputs ) {
			if( entry[1].id == id ) {
				inputdevice = entry[1];
				inputdevice.onmidimessage = onMIDIMessage;
				if( use_cookies )
					Cookies.set('preferred_input_device_id', id, { expires: 7 });
				return 0;
			}
		}
	}
}

function updateOutputDevice( id ) {
	allNotesOff();
	if( id == "none" ) {
		outputdevice = null;
		socket.off('noteon', onServerNoteOn );
	} else {
		if( outputdevice == null )
			socket.on('noteon', onServerNoteOn );
		for( var entry of midi.outputs ) {
			if( entry[1].id == id ) {
				outputdevice = entry[1];
				if( use_cookies )
					Cookies.set('preferred_output_device_id', id, { expires: 7 });
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
	var found_id = false;
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
				alternative_id + '" disabled="true"><del>' + Cookies.get('preferred_input_device_display_name') + '</del></div>' );
		using_id = alternative_id;
	}
	$("input[name=midiInputDeviceChoice][value='" + using_id + "']").prop("checked",true);

	$('#midiOutputDevices').empty();
	using_id = Cookies.get('preferred_output_device_id');
	for( var entry of midi.outputs ) {
		alternative_id = entry[1].id;
		break;
	}
	found_id = false;
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
				alternative_id + '" disabled="true"><del>' + Cookies.get('preferred_output_device_display_name') + '</del></div>' );
		using_id = alternative_id;
	}
	$("input[name=midiOutputDeviceChoice][value='" + using_id + "']").prop("checked",true);

	updateInputDevice( $('input[name="midiInputDeviceChoice"]:checked').val() );
	updateOutputDevice( $('input[name="midiOutputDeviceChoice"]:checked').val() );
}

function allNotesOff() {
	if( outputdevice != null ) {
		outputdevice.send([0xB0,0x78,0]);
	}
}

function playNote( value, milliseconds ) {
	var noteOnMessage = [0x90, value, 0x7f];
	outputdevice.send( noteOnMessage );
	outputdevice.send( [0x80, value, 0x40], window.performance.now() + milliseconds );
}

function onServerNoteOn( note, velocity ) {
	console.log('servernote');
	outputdevice.send( [0x90,note,velocity] );
}

function onMIDISuccess( midiAccess ) {
	console.log( "MIDI ready!" );
	midi = midiAccess;
	listInputsAndOutputs( midi );
	midi.onstatechange = function( event ) {
		listInputsAndOutputs( midi );
	}
	inputdevice.onmidimessage = onMIDIMessage;
}

function onMIDIFailure(msg) {
	console.log( "Failed to get MIDI access - " + msg );
}

$(function() {
	console.log( 'input cookie:' + Cookies.get( 'preferred_input_device_id' ) );
	navigator.requestMIDIAccess( { sysex: false } ).then( onMIDISuccess, onMIDIFailure );
	socket = io();
});
