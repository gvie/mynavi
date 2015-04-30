function showInput() {
         var message_entered =  document.getElementById("user_input").value;

         document.getElementById('display').innerHTML = message_entered;
       }

$( document ).ready(function() {
   		
		//jQuery(".addressSearch").submit(function(e) {
		jQuery("#user_input").keyup(function(e) {	
			//e.preventDefault();

			var address = jQuery("#user_input").val();
			console.log(address);
	   		$.ajax( "http://dev.hel.fi/geocoder/v1/address/?name=" + address + "&limit=10&distinct_streets=true&format=json" )
				  .done(function(data) {
				   	console.log(data.objects);
				   	jQuery("#display").html(data.objects[0].name);
				  })
	  	});
		
	});