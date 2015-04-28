var targetMarker = null;

// map initialization
var eventmap = L.map('eventmap', { zoomControl:false }).setView([60.170833, 24.9375], 10);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(eventmap);

// looks up routes from user location to target location
// and draws it on the map
// TODO: take time into consideration
function setTarget(location, time, name) {
	$('article.show').removeClass('show');
	$('#mappage').addClass('show');
	if(targetMarker)
		eventmap.removeLayer(targetMarker);
	targetMarker = L.marker(location);
	targetMarker.addTo(eventmap).bindPopup(name).openPopup();
	if(routeLayer != null)
		eventmap.removeLayer(routeLayer);
    routeLayer = null;
	eventmap._onResize();
	zoomToCoords(eventmap, new L.LatLng(location[0], location[1]), userLocation);
	var params = {
        toPlace: location[0] + "," + location[1],
        fromPlace: userLocation.lat+"," + userLocation.lng,
        minTransferTime: 180,
        walkSpeed: 1.17,
        maxWalkDistance: 100000,
		numItineraries: 3};
	$.getJSON("http://dev.hsl.fi/opentripplanner-api-webapp/ws/plan", params, function(data) {
		console.log(data);
		routeLayer = L.featureGroup().addTo(eventmap);
		var itinerary = data.plan.itineraries[0];
        render_route_layer(itinerary, routeLayer);
		zoomToCoords(eventmap, new L.LatLng(location[0], location[1]), userLocation);
	});
}

// shows the specified coordinates on the map
function zoomToCoords(mmap, source, target) {
	var start_bounds = L.latLngBounds([]);
    start_bounds.extend(source);
    start_bounds.extend(target);
    var zoom = Math.min(mmap.getBoundsZoom(start_bounds), 18);
    mmap.setView(start_bounds.getCenter(), zoom)
}

// ----------------- User Location ------------------

// save user location for later usage
var userLocation = null;

function onLocationFoundEvent(e) {
    var radius = e.accuracy / 2;
	userLocation = e.latlng;
    L.marker(e.latlng).addTo(eventmap)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(eventmap);
}

function onLocationErrorEvent(e) {
	console.log(e.message);
}

eventmap.on('locationfound', onLocationFoundEvent);
eventmap.on('locationerror', onLocationErrorEvent);
// start locating user
eventmap.locate({setView: false, maxZoom: 16});

// ----------------- Route Rendering ------------------

var routeLayer = null;
var google_colors = {WALK: '#9ab9c9',
					 CAR: '#9ab9c9',
					 BICYCLE: '#9ab9c9',
					 WAIT: '#999999',
					 0: '#00985f',
					 1: '#ff6319',
					 2: '#64be14',
					 3: '#007ac9',
					 4: '#007ac9',
					 109: '#64be14'};
					 
// TODO: add more information, like bus number, ...
function render_route_layer(itinerary, routeLayer) {
    var j, legs, len, dashArray, color, points, polyline;
    legs = itinerary.legs;
    for (j = 0, len = legs.length; j < len; j++) {
	    points = decodePolyline(legs[j].legGeometry.points)
        color = google_colors[legs[j].routeType != null ? legs[j].routeType : legs[j].mode];
        if (legs[j].routeType !== null) {
          dashArray = null;
        } else {
          dashArray = "5,10";
          color = "#000";
        }
        polyline = new L.Polyline(points, {
          color: color,
          weight: 8,
          opacity: 0.2,
          clickable: false,
          dashArray: dashArray
        });
        polyline.addTo(routeLayer);
        polyline = new L.Polyline(points, {
          color: color,
          opacity: 0.4,
          dashArray: dashArray
        }).on('click', function(e) {
          /*mapfitBounds(polyline.getBounds());
          if (typeof marker !== "undefined" && marker !== null) {
            return marker.openPopup();
          }*/
        });
        polyline.addTo(routeLayer);
    }
}

// creates a polyline from the decoded string
function decodePolyline(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;
        coordinates.push(new L.LatLng(lat / factor, lng / factor));
    }

    return coordinates;
};