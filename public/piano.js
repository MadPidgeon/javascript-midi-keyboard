function draw_octave( note_offset, horisontal_offset = 0 ) {
	var whites = [0,2,4,5,7,9,11];
	var blacks = [1,3,6,8,10];
	var white_index = 0;
	var black_index = 0;
	for( var i of whites ) {
		var value = note_offset+i;
		$('#pianoKeyHolder').append( '<div class="white_key_medium key_released" id="pianoDisplayKey' + value
			+ '" style="left:' + (72 * white_index + horisontal_offset ) + 'px" data-key="' + value + '"></div>' );
		white_index++;
	}
	for( var i of blacks ) {
		var value = note_offset+i;
		$('#pianoKeyHolder').append( '<div class="black_key_medium key_released" id="pianoDisplayKey' + value
			+ '" style="left:' + (40 + 72 * black_index + horisontal_offset ) + 'px" data-key="' + value + '"></div>' );
		black_index++;
		if( black_index % 7 == 2 )
			black_index++;
	}
	return horisontal_offset + 72*7;
}

function pianoDisplayPress( note, press=true ) {
	if( $('#pianoDisplayKey'+note).length ) {
		if( press )
			$('#pianoDisplayKey'+note).removeClass('key_released').addClass('key_pressed');
		else
			$('#pianoDisplayKey'+note).removeClass('key_pressed').addClass('key_released');
	}
}

$(function() {
	draw_octave( 72, draw_octave( 60 ) );
});