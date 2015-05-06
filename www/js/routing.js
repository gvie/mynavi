var targetMarker = null;

$.subscribe('chui/navigate/enter', function(article, choice){
			if(choice === '#navigate') {
			setTarget(null);
}});

// map initialization
var eventmap = L.map('eventmap', { zoomControl:false }).setView([60.170833, 24.9375], 10);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(eventmap);

function setDestinationMarker(location, name) {
	if(targetMarker)
		eventmap.removeLayer(targetMarker);
	targetMarker = L.marker(location, {draggable:'true'});
	showRoute(location, new Date());
	targetMarker.addTo(eventmap).bindPopup(name || "Destination").openPopup();
	targetMarker.on('dragend', function(event) {
		var marker = event.target;
		var position = marker.getLatLng();
		showRoute(position, new Date());
		$.ajax( "http://dev.hel.fi/geocoder/v1/address/?lat=" + position.lat + "&lon=" + position.lng + "&limit=1&format=json")
			.done(function(data) {
				if($.isArray(data.objects) && data.objects.length) {
					targetMarker.bindPopup(data.objects[0].name).openPopup();
				}
	});
	});
	$.ajax( "http://dev.hel.fi/geocoder/v1/address/?lat=" + location.lat + "&lon=" + location.lng + "&limit=1&format=json")
			.done(function(data) {
				if($.isArray(data.objects) && data.objects.length) {
					targetMarker.bindPopup(data.objects[0].name).openPopup();
				}
	});
}

eventmap.on('click', function(e) {
	if(userLocation == null) {
		userLocation = e.latlng;
		var myIcon = L.divIcon({className: 'mymarker', iconSize: [50,50], iconAnchor:[25,50], popupAnchor: [0,-50], html: "<div id='mymarkericon' class='myicon'></div>"});
		userLocationMarker = L.marker(e.latlng, {icon: myIcon}).addTo(eventmap)
        .bindPopup("Start").openPopup();
		L.circle(e.latlng, radius).addTo(eventmap);
		var img = localStorage.getItem("pic");
		if(img && img.length)
			$('#mymarkericon').css('background-image', 'url(' + img + ')');
		eventmap.setZoomAround(userLocation, 14);
	}
	else if(targetMarker == null) {
		setDestinationMarker(e.latlng);
	}
});

$( "#destinationinput" ).autocomplete({
	source: function (request, response) {
		$.ajax( "http://dev.hel.fi/geocoder/v1/address/?name=" + request.term + "&limit=10&distinct_streets=true&format=json" )
			.done(function(data) {
				if($.isArray(data.objects)) {
					response(data.objects.map(function(entry){
						return { value: entry.name, data: entry.location.coordinates };
					}));
				}
		});
	},
	minLength: 3,
	select: function (event, ui) {
		setDestinationMarker(new L.LatLng(ui.item.data[1], ui.item.data[0]), ui.item.value);
	}
});

function dateTimeNow() {
	var datetime = new Date();
	if (navigator.userAgent.indexOf("Android") > 0) {
		var params = {hour: "2-digit", minute: "2-digit"};
		$("#starttime").text(datetime.toLocaleTimeString("en-us", params));
		$("#starttime").data('time', datetime.getTime());
		
		var params = {month: "short", day: "numeric"};
		$("#startdate").text(datetime.toLocaleTimeString("en-us", params));
		$("#startdate").data('date', datetime.getTime());
	} else {
		$('#jqstarttime').timepicker("setDate", datetime);
		$("#jqstarttime").data('time', datetime.getTime());
		$('#jqstartdate').timepicker("setDate", datetime);
		$("#jqstartdate").data('date', datetime.getTime());
	}
}

function getStartDateTime() {
	if (navigator.userAgent.indexOf("Android") > 0) {
		var time = new Date($("#starttime").data('time'));
		var date = new Date($("#startdate").data('date'));
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
					   time.getHours(), time.getMinutes(), time.getSeconds());
	} 
		var time = new Date($("#jqstarttime").data('time'));
		var date = new Date($("#jqstartdate").data('date'));
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
					   time.getHours(), time.getMinutes(), time.getSeconds());
}

$(function() {
	dateTimeNow();
	if (navigator.userAgent.indexOf("Android") > 0) {
		$("#jqstarttime").hide();
		$("#starttime").data('time', new Date().getTime());
		var params = {hour: "2-digit", minute: "2-digit"};
		$("#starttime").text(new Date().toLocaleTimeString("en-us", params));
		$("#starttime").on($.eventStart, function() {
			var options = {
			  date: new Date($("#starttime").data('time')),
			  mode: 'time'
			};

			datePicker.show(options, function(time) {
				if(time) {
					var params = {hour: "2-digit", minute: "2-digit"};
					$("#starttime").text(new Date(time).toLocaleTimeString("en-us", params));
					$("#starttime").data('time', time.getTime());
					var date = new Date($("#startdate").data('date'));
					var datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
					   time.getHours(), time.getMinutes(), time.getSeconds());
					   
					showRoute(targetMarker.getLatLng(), datetime);
				}
			});
		});

		$("#jqstartdate").hide();
		$("#startdate").data('date', new Date().getTime());
		params = {month: "short", day: "numeric"};
		$("#startdate").text(new Date().toLocaleTimeString("en-us", params));
		$("#startdate").on($.eventStart, function(){
			var options = {
			  date: new Date($("#startdate").data('date')),
			  mode: 'date'
			};

			datePicker.show(options, function(date) {
				if(date) {
					var params = {month: "short", day: "numeric"};
					$("#startdate").text(new Date(date).toLocaleTimeString("en-us", params));
					$("#startdate").data('date', date.getTime());
					
					var time = new Date($("#starttime").data('date'));
					var datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
					   time.getHours(), time.getMinutes(), time.getSeconds());
					   
					showRoute(targetMarker.getLatLng(), datetime);
				}
			});
		});
	} else {
		$("#starttime").hide();
		$("#startdate").hide();
		$("#jqstarttime").timepicker({
			dateFormat: 'yy-mm-dd',
			defaultDate: new Date(),
			defaultTime: new Date(),
			onSelect: function(format, time){
				var date = $("#jqstartdate").datepicker('getDate');
				if(date && time) {
					var datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
					   time.hour, time.minute, 0);
					$("#jqstarttime").data('time', datetime.getTime());
						   
					showRoute(targetMarker.getLatLng(), datetime);
				}
			}
		});
		$('#jqstarttime').timepicker("setDate", new Date());
		$("#jqstarttime").data('time', new Date().getTime());
		$("#jqstartdate").datepicker({
			dateFormat: 'yy-mm-dd',
			inline: false,
			defaultDate: new Date(),
			onSelect: function(){
				var date = $("#jqstartdate").datepicker('getDate');
				$("#jqstartdate").data('date', date.getTime());
				var time = new Date($("#jqstarttime").data('time'));
				if(date && time) {
					var datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
					   time.getHours(), time.getMinutes(), time.getSeconds());
						   
					showRoute(targetMarker.getLatLng(), datetime);
				}
			}
		});
		$('#jqstartdate').timepicker("setDate", new Date());
		$("#jqstartdate").data('date', new Date().getTime());
	}
  });



String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// looks up routes from user location to target location
// and draws it on the map
// TODO: take time into consideration
function setTarget(location, time, name, place, eventid) {
	$('article.show').removeClass('show');
	$('#mappage').addClass('show');
	$('#notifyme').prop('checked', localStorage.getItem('event' + eventid));
	$('#notifyme').data('event', eventid);
	if(targetMarker)
		eventmap.removeLayer(targetMarker);
	$('#routeitem').hide();
	$('#routeheader').hide();
	if(!location) {
		eventmap.setZoomAround(userLocation, 14);
		eventmap.panTo(userLocation);	
		userLocationMarker.closePopup();
		userLocationMarker.openPopup();
		eventmap.setView(userLocation, 16 );
		eventmap._onResize();
		return;
	}
	eventmap._onResize();
	$("#destinationinput").val('');
	targetMarker = L.marker(location);
	targetMarker.addTo(eventmap).bindPopup(name).openPopup();
	showRoute(new L.LatLng(location[0], location[1]), time, place, eventid);
}
var globaleventid = 0;

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function formatDate(date) {
  var mon = date.getMonth()+1;
  if(mon <10)
	  mon = '0' + mon;
  var dat = date.getDate();
  if(dat <10)
	  dat = '0' + dat;
  return date.getFullYear() + '-' + mon + '-' + dat;
}

function showRoute(location, time, place, eventid) {
	if(!place)
		place = "";
	if(!eventid)
		eventid = globaleventid++;
	if(routeLayer != null)
		eventmap.removeLayer(routeLayer);
    routeLayer = null;
	zoomToCoords(eventmap, location, userLocation);
	var dat = {year: "full", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"};
	var tim = {hour: "2-digit", minute: "2-digit"};
	var params = {
        toPlace: location.lat + "," + location.lng,
        fromPlace: userLocation.lat + "," + userLocation.lng,
        minTransferTime: 180,
        walkSpeed: 1.17,
        maxWalkDistance: 100000,
		numItineraries: 3,
		date: formatDate(time),
		time: formatAMPM(time),
		arriveBy: place !== ""};
	$.getJSON("http://dev.hsl.fi/opentripplanner-api-webapp/ws/plan", params, function(data) {
		console.log(data);
		if(data.plan == null)
			return;
		routeLayer = L.featureGroup().addTo(eventmap);
		var itinerary = data.plan.itineraries[0];
        render_route_layer(itinerary, routeLayer);
		render_route_items(data.plan.itineraries[0]);
		var routeindex = 0;
		$('#routescrollprev').off($.eventStart);
		$('#routescrollnext').off($.eventStart);
		$('#routescrollprev').hide();
		if(data.plan.itineraries.length > 1)
			$('#routescrollnext').show();
		else
			$('#routescrollnext').hide();
		$('#routescrollnext').on($.eventStart, function() {
			routeindex++;
			itinerary = data.plan.itineraries[routeindex];
			render_route_items(data.plan.itineraries[routeindex]);
			eventmap.removeLayer(routeLayer);
			routeLayer = L.featureGroup().addTo(eventmap);
			render_route_layer(data.plan.itineraries[routeindex], routeLayer);
			if(routeindex >= data.plan.itineraries.length-1)
				$('#routescrollnext').hide();
			if(routeindex > 0)
				$('#routescrollprev').show();
		});
		$('#routescrollprev').on($.eventStart, function() {
			routeindex--;
			itinerary = data.plan.itineraries[routeindex];
			render_route_items(data.plan.itineraries[routeindex]);
			eventmap.removeLayer(routeLayer);
			routeLayer = L.featureGroup().addTo(eventmap);
			render_route_layer(data.plan.itineraries[routeindex], routeLayer);
			if(routeindex < data.plan.itineraries.length-1)
				$('#routescrollnext').show();
			if(routeindex == 0)
				$('#routescrollprev').hide();
		});
		zoomToCoords(eventmap, location, userLocation);
		$('#notifyme').off($.eventStart);
		$('#notifyme').on($.eventStart, function() {
			window.console.log("ischecked " + $('#notifyme').prop('checked'));
			if(!$('#notifyme').prop('checked')) {
				addToNoticationList(eventid, name, time, place);
				updateNotifications();
				for(var i = 0, count = 0; i < itinerary.legs.length; i++) {
					var last = i == (itinerary.legs.length-1);
					var leg = itinerary.legs[i];
					console.log(leg.mode);
					if(leg.mode == "WALK" && i == 0) {
						window.notify.notifyOn("Go to the busstation", "", leg.startTime - 12000, "file:///android_asset/www/img/walking.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
					}
					else if(leg.mode == "BUS") {
						window.notify.notifyOn("Enter Bus " + leg.route + " " + leg.headsign, "", leg.startTime - 6000, "file:///android_asset/www/img/bus_stop.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
						window.notify.notifyOn("Leave Bus " + leg.route + " " + leg.headsign, "", leg.endTime - 6000, "file:///android_asset/www/img/bus_stop.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
					} else if(leg.mode == "RAIL") {
						window.notify.notifyOn("Enter Train " + leg.route + " " + leg.headsign, "", leg.startTime - 6000, "file:///android_asset/www/img/train_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
						window.notify.notifyOn("Leave Train " + leg.route + " " + leg.headsign, "", leg.endTime - 6000, "file:///android_asset/www/img/train_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
					} else if(leg.mode == "TRAM") {
						window.notify.notifyOn("Enter Tram " + leg.route + " " + leg.headsign, "", leg.startTime - 6000, "file:///android_asset/www/img/tram_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
						window.notify.notifyOn("Leave Tram " + leg.route + " " + leg.headsign, "", leg.endTime - 6000, "file:///android_asset/www/img/tram_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
					} else if(leg.mode == "SUBWAY") {
						window.notify.notifyOn("Enter Subway " + leg.route + " " + leg.headsign, "", leg.startTime - 6000, "file:///android_asset/www/img/subway_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
						window.notify.notifyOn("Leave Subway " + leg.route + " " + leg.headsign, "", leg.endTime - 6000, "file:///android_asset/www/img/subway_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
					} else if(leg.mode == "FERRY") {
						window.notify.notifyOn("Enter Ferry " + leg.route + " " + leg.headsign, "", leg.startTime - 6000, "file:///android_asset/www/img/ferry_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
						window.notify.notifyOn("Leave Ferry " + leg.route + " " + leg.headsign, "", leg.endTime - 6000, "file:///android_asset/www/img/ferry_icon.png", (eventid + '-' + count).hashCode(), eventid, last);
						count++;
					}
				}
				localStorage.setItem('event' + eventid, itinerary.legs.length);
			} else {
				window.notify.remove(eventid, localStorage.getItem('event' + eventid));
				window.localStorage.removeItem('event' + eventid);
			}
		});
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
var userLocationMarker = null;

function onLocationFoundEvent(e) {
    var radius = e.accuracy / 2;
	userLocation = e.latlng;
	var myIcon = L.divIcon({className: 'mymarker', iconSize: [50,50], iconAnchor:[25,50], popupAnchor: [0,-50], html: "<div id='mymarkericon' class='myicon'></div>"});
    userLocationMarker = L.marker(e.latlng, {icon: myIcon}).addTo(eventmap)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(eventmap);
	var img = localStorage.getItem("pic");
	if(img && img.length)
		$('#mymarkericon').css('background-image', 'url(' + img + ')');
	eventmap.setZoomAround(userLocation, 14);
}

function onLocationErrorEvent(e) {
	console.log(e.message);
}

eventmap.on('locationfound', onLocationFoundEvent);
eventmap.on('locationerror', onLocationErrorEvent);
// start locating user
eventmap.locate({setView: false, maxZoom: 16});

function formatDatetime(time) {
	var params = {month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"};
	return new Date(time).toLocaleTimeString("en-us", params);
}

var routeitemTemplate = '<div style="float: left;text-align: center;">'+
					'<div style="line-height: 25px;font-size: 80%;">[[=data.distance_or_bus]]</div>'+
					'<img src="[[= data.typeimage]]">'+
					'<div style="width: 100%;font-size: 80%;">[[=data.duration]]</div>'+
					'</div>'+
					'<img style="float: left;margin-top: 26px;" src="img/arrow-right_colored.png">';
					// todo first item margin, last item remove
function render_route_items(itinerary){
	//{ typeimage: "img/walking_colored.png", duration: "4 min", distance_or_bus: "0.7 km"}
	var startTime = itinerary.startTime;
	var endTime = itinerary.endTime;
	$('#routeheader').show();
	$('#routetime').text(formatDatetime(startTime) + ' - ' + formatDatetime(endTime));
	var routeitems = [];
	for(var i = 0; i < itinerary.legs.length; i++) {
		var leg = itinerary.legs[i];
		var distance_or_bus;
		var typeimage;
		if(leg.mode === "WALK") {
			distance_or_bus = Math.round(leg.distance/100)/10 + " km";
			typeimage = "img/walking_colored.png";
		} else {
			distance_or_bus= leg.route;
			if(leg.mode === "BUS")
				typeimage = "img/bus_stop_colored.png";
			else if(leg.mode === "FERRY")
				typeimage = "img/ferry_colored.png";
			else if(leg.mode === "TRAM")
				typeimage = "img/tram_colored.png";
			else if(leg.mode === "RAIL")
				typeimage = "img/train_colored.png";
			else if(leg.mode === "SUBWAY")
				typeimage = "img/subway_colored.png";
			else if(leg.mode === "WAIT")
				typeimage = "img/waiting_colored.png";
		}
		var min = new Date(leg.duration).getMinutes();
		routeitems.push({typeimage: typeimage, duration: min + ' min', distance_or_bus: distance_or_bus});
	}
	$('#routeitem').show();
	$('#routeitem').empty();
	$.template.repeater($('#routeitem'), routeitemTemplate, routeitems);
	$('#routeitem div').first().css("margin-left","10px");
	$('#routeitem img').last().remove();
}


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