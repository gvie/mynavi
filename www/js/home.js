$(document).ready(function() {
		updateLocationList();
		$('#locationlist').on($.eventStart, 'li', function() {
			$this = $(this);
			var location = $this.data('location');
			console.log(location);
			if(location == "bringmeto") {
				setTarget(null, new Date(), name, name, 12);
			} else if(location === "addnew") {
				editLocation();
			} else {
				var name = $this.find('div').text();
				var img = $this.find('img').attr('src');
				if(location && location.length === 2) {
					setTarget(location, new Date(), name, name, 12);
				} else {
					$.UIPopup({ selector: "#main",
								id: "welcome",
								title: 'No location set yet',
								message: 'Please select an address!',
								continueButton: 'Ok',
								callback: function() {
									editLocation(name, img);
								}});
				}
			}
		});
		
		$.subscribe('chui/navigate/enter', function(article, choice){
			if(choice === '#editplace' && editplacemap == null) {
				// map initialization
				editplacemap = L.map('editplacemap', { zoomControl:false }).setView([60.170833, 24.9375], 10);
				L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(editplacemap);
				$( "#placeinput" ).autocomplete({
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
						if(editplacemarker)
							editplacemap.removeLayer(editplacemarker);
						editplacemarker = L.marker(new L.LatLng(ui.item.data[1], ui.item.data[0]), {draggable:'true'});
						editplacemarker.addTo(editplacemap).bindPopup(ui.item.value).openPopup();
						
						editplacemap.setView(new L.LatLng(ui.item.data[1], ui.item.data[0]), 16 );
						editplacemarker.on('dragend', function(event){
							$( "#placeinput" ).val('');
							var marker = event.target;
							var position = marker.getLatLng();
							editplacemap.setView(position, 16 );
							$.ajax( "http://dev.hel.fi/geocoder/v1/address/?lat=" + position.lat + "&lon=" + position.lng + "&limit=1&format=json")
								.done(function(data) {
									if($.isArray(data.objects) && data.objects.length) {
										marker.bindPopup(data.objects[0].name).openPopup();
										if($('#placelabel').val().length === 0)
											$('#placelabel').val(data.objects[0].name);
									}
						});
						});
					}
				});
			}
		});
		
		$('#cancelplaceedit').on($.eventStart, function() {
			$( "#placeinput" ).val('');
			if(editplacemarker)
				editplacemap.removeLayer(editplacemarker);
			editplacemarker = null;
			$('article.show').removeClass('show');
			$('#myhsl').addClass('show');
		});
		$('#saveplace').on($.eventStart, function() {
			if(editplacemarker == null)
				return;
			var position = editplacemarker.getLatLng();
			var name = $('#placelabel').val();
			var img = $('#placeimage').attr('src');
			updateLocationList();
			saveLocation(name, position, img);
			updateLocationList();
			$( "#placelabel" ).val('');
			$( "#placeinput" ).val('');
			if(editplacemarker)
				editplacemap.removeLayer(editplacemarker);
			editplacemarker = null;
			$('article.show').removeClass('show');
			$('#myhsl').addClass('show');
		});
});

var editplacemap = null;
var editplacemarker = null;

function editLocation(name, img) {
	$( "#placeinput" ).val('');
	if(name)
		$('#placelabel').val(name);
	if(img)
		$('#placeimage').attr('src', img);
	else
		$('#placeimage').attr('src', "img/happy.png");
	$('article.show').removeClass('show');
	$('#editplace').addClass('show');
	$.publish('chui/navigate/enter', '#editplace');
}

function saveLocation(name, position, img) {
	var locs = localStorage.getItem("locations");
	if(locs) {
		var locations = JSON.parse(locs);
		for(var i = 0; i < locations.length; i++){
			if(locations[i].name == name) {
				locations[i].position = position;
				locations[i].img = img;
				break;
			}
		}
		if(i === locations.length) {
			locations.push({name: name, position: position, img:img});
		}
		localStorage.setItem("locations", JSON.stringify(locations));
	}
}

var bringMeTo = '<li class="comp" data-location="bringmeto">'+
				'<aside style="display:inline;margin-left: 30px;">'+
					'<img src="img/target.png" height="40px">'+
				'</aside>'+
				'<div style="display:inline; white-space:nowrap; font-size:140%;line-height: 50px;" >Bring me to...</div>' +
			'</li>';

var locationTemplate = '<li class="comp" data-location="[[ if (data.position) { ]][[[= data.position.lat ]],[[= data.position.lng ]]][[ }]]">' +
				'<aside style="display:inline;margin-left: 30px;">' +
					'<img src="[[= data.img ]]" height="40px">' +
				'</aside>' +
				'<div style="display:inline; white-space:nowrap; font-size:140%;line-height: 50px;" >[[= data.name ]]</div>' +
				//'<aside><img class="locconfig" src="img/config.png" height="40px"></aside>'
			'</li>';
			
var addNew = '<li class="comp" data-location="addnew">'+
				'<aside style="display:inline;">'+
					'<img src="img/new.jpg" height="40px">'+
				'</aside>'+
				'<div style="display:inline; white-space:nowrap; font-size:140%;line-height: 50px;" >Add new...</div>'+
			'</li>';

function updateLocationList() {
	$('#locationlist').empty();
	$('#locationlist').append($(bringMeTo));
	var locs = localStorage.getItem("locations");
	var locations = [];
	if(locs) {
		locations = JSON.parse(locs);
	}
	else {
		locations.push({name: "HOME", position: null, img:"img/homelogo.png"});
		locations.push({name: "WORK", position: null, img:"img/work.png"});
		locations.push({name: "SCHOOL", position: null, img:"img/school.png"});
		locations.push({name: "Friend's Place", position: null, img:"img/female.png"});
		localStorage.setItem("locations", JSON.stringify(locations));
	}
	
	$.template.repeater($('#locationlist'), locationTemplate, locations);
	$('#locationlist').append($(addNew));
}

