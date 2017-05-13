
function debugPlayNote( note, velocity ) {
	var el = $("#debugnote"+(note%12));
	if( velocity == 0 ) {
		el.trigger("pause");
	} else {
		el.prop("currentTime",0);
		el.trigger("play");
	}	
}

$(function(){
	$('body').append('<div id="audiodump"></div>');
	notes = ['A4','Bb4','B4','C5','Db5','D5','Eb5','E5','F5','Gb5','G5','Ab5'];
	for( var i = 0; i < 12; ++i ) {
		$('#audiodump').append('<audio id="debugnote' + i + '" src="mp3/Piano.mf.' + notes[i] + '.mp3" preload="auto"></audio>');
	}
	$('#debug').click(function(){
		if( $('#debug').is(':checked') ) {
			console.log('Debug on');
			socket.on('noteon', debugPlayNote );
		} else {
			console.log('Debug off');
			socket.off('noteon', debugPlayNote );
			for( i = 0; i < 12; ++i )
				debugPlayNote(i,0);
		}
	});
});