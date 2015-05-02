function getEvents() {
	facebookConnectPlugin.api("/me/events/attending?fields=cover,name,place&limit=6&since=" + Math.round(+new Date()/1000), 
							  ["public_profile", "user_photos", "user_tagged_places"], gotEvents,
							  function(error) {
								  window.console.log( "" + error);
							  });
}

var eventTemplate = '<li class="comp nav" data-id="[[= data.id]]" data-time="[[= data.start_time]]" data-location=\'[[ if (data.place && data.place.location) { ]][[[= data.place.location.latitude]],[[= data.place.location.longitude]]][[ } ]]\'>'+
        '<aside>'+
			'<div style="background: url([[= data.cover.source ]]) 50% 50% no-repeat;width: 250px;height: 80px;"></div>'+
            //'<img title="Event Image" src="[[= data.cover.source ]]" height="80px">'+
        '</aside>'+
        '<div>'+
            '<h3>[[= data.name]]</h3>'+
            '<h4>[[= new Date(data.start_time).toLocaleTimeString("en-us", {weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"})]]</h4>'+
            '<h4 class="asd">[[ if (data.place) { ]] [[= data.place.name ]] [[ } ]]</h4>'+
		'</div>'+
    '</li>';

function gotEvents(data) {
	window.console.log(data)
	var events = data.data;
	events.sort(function(a,b){ return new Date(a.start_time) - new Date(b.start_time)});
	$.template.repeater($('#facebookevents'), eventTemplate, events);
  
	$('#facebookevents').on('singletap', 'li', function() {
		var whichSong = this.id;
		$this = $(this);
		var location = $this.data("location");
		var time = $this.data("time");
		var id = $this.data("id");
		if(location.length === 2 && time !== "") {
			setTarget(location, new Date(time), $this.find('h3').text(), $this.find('h4.asd').text(), id);
		}
	});
}