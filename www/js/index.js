$(function() {
	$.UISlideout();
	$.UISlideout.populate([{login:"My HSL"},{settings:"Settings"},{contacts:"My Contacts"}]);
	$("#facebooklogin").click(function(){
		console.log("herer");
	});
	
	
});
var map = L.map('map',  { zoomControl:false }).setView([60.170833, 24.9375], 10);
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}
function onLocationError(e) {
			alert(e.message);
		}

		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);

		map.locate({setView: true, maxZoom: 16});