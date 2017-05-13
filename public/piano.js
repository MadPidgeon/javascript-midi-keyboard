function draw_octave( note_offset, size, horisontal_offset = 0 ) {
	var whites = [0,2,4,5,7,9,11];
	var blacks = [1,3,6,8,10];
	var white_index = 0;
	var black_index = 0;
	var size_name = "_key_small";
	var white_width = 36;
	var black_offset = 20;
	if( size == 1 ) {
		size_name = "_key_medium";
		white_width = 72;
		black_offset = 40;
	}
	for( var i of whites ) {
		var value = note_offset+i;
		$('#pianoKeyHolder').append( '<div class="white_key white' + size_name + ' key_released" id="pianoDisplayKey' + value
			+ '" style="left:' + (white_width * white_index + horisontal_offset ) + 'px" data-key="' + value + '"></div>' );
		white_index++;
	}
	for( var i of blacks ) {
		var value = note_offset+i;
		$('#pianoKeyHolder').append( '<div class="black_key black' + size_name + ' key_released" id="pianoDisplayKey' + value
			+ '" style="left:' + (black_offset + white_width * black_index + horisontal_offset ) + 'px" data-key="' + value + '"></div>' );
		black_index++;
		if( black_index % 7 == 2 )
			black_index++;
	}
	return horisontal_offset + white_width*7;
}

function pianoDisplayPress( note, press=true ) {
	if( $('#pianoDisplayKey'+note).length ) {
		if( press )
			$('#pianoDisplayKey'+note).removeClass('key_released').addClass('key_pressed');
		else
			$('#pianoDisplayKey'+note).removeClass('key_pressed').addClass('key_released');
	}
}

function redrawKeyboard( size ) {
	$('#pianoKeyHolder').empty();
	if( size == 1 )
		draw_octave( 72, 1, draw_octave( 60, 1 ) );
	else {
		draw_octave( 84, 0, draw_octave( 72, 0, draw_octave( 60, 0, draw_octave( 48, 0 ) ) ) );
	}
}

$(function() {
	redrawKeyboard( 0 );
	$('#kbd_size').click(function(){
		redrawKeyboard( $('#kbd_size').is(':checked') );
	});
});