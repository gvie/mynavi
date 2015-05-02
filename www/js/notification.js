(function() {
  var AndroidNotify, Notify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Notify = (function() {
    function Notify() {
      window.Notification.requestPermission(function(granted) {
        this.granted = granted;
        return window.console.log(this.granted);
      });
    }

    Notify.prototype.notify = function(data) {
      return new window.Notification(data);
    };

	var queue = {};
	
    Notify.prototype.notifyOn = function(title, message, time, icon, id) {
	  console.log(new Date(time).toUTCString() + " " + id);
      var callb, diff;
      diff = time - new Date;
      callb = function() {
        return new window.Notification(title, {
          body: message,
          tag: id,
          icon: icon
        });
      };
	  if(!queue.hasOwnProperty(id))
		  queue[id] = [];
      queue[id].push(setTimeout(callb, diff));
    };

    Notify.prototype.remove = function(id, length) {
		if(queue.hasOwnProperty(id)) {
			var array = queue[id];
			for(var i = 0; i < array.length; i++){
				clearTimeout(array[i]);
			}
			delete queue[id];
		}
    };
    return Notify;

  })();

  AndroidNotify = (function(superClass) {
    extend(AndroidNotify, superClass);

    function AndroidNotify() {
      var k, ref, v;
      console.log(cordova.plugins);
      ref = cordova.plugins;
      for (k in ref) {
        v = ref[k];
        console.log(k + " is " + v);
      }
      cordova.plugins.notification.local.registerPermission(function(granted) {
        this.granted = granted;
        return window.console.log(this.granted);
      });
    }

    AndroidNotify.prototype.notify = function() {
      return alert(data);
    };

    AndroidNotify.prototype.notifyOn = function(title, message, time, icon, id) {
	  console.log(new Date(time).toUTCString() + " " + id);
      return cordova.plugins.notification.local.schedule({
        id: id,
        title: title,
        text: message,
        icon: icon,
        at: new Date(time),
		smallIcon: icon
      });
    };
	
	
    AndroidNotify.prototype.remove = function(id, length) {
		for(var i = 0; i < length; i++)
			cordova.plugins.notification.local.clear(id + i);
    };
	
	if (navigator.userAgent.indexOf("Android") > 0) {
		console.log("Android-------------------------------------------------------------------------------------------------");
		document.addEventListener("deviceready", function() {
			console.log("AndroidNotify-------------------------------------------------------------------------------------------------");
			document.addEventListener("resume", function(){
				window.notify = new AndroidNotify();
			});
			window.notify = new AndroidNotify();
		});
	} else {
		window.notify = new Notify();
	}
    return AndroidNotify;

  })(Notify);
}).call(this);


