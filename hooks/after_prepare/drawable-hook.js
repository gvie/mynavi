#!/usr/bin/env node

// This hook copies various resource files 
// from our version control system directories 
// into the appropriate platform specific location
//


// configure all the files to copy.  
// Key of object is the source file, 
// value is the destination location.  
// It's fine to put all platforms' icons 
// and splash screen files here, even if 
// we don't build for all platforms 
// on each developer's box.

var filestocopy = [{
    "www/img/bus_stop.png": 
    "platforms/android/res/drawable/bus_stop.png"
}, {
    "www/img/walking.png": 
    "platforms/android/res/drawable/walking.png"
}, {
    "www/img/ferry_icon.png": 
    "platforms/android/res/drawable/ferry_icon.png"
}, {
    "www/img/subway_icon.png": 
    "platforms/android/res/drawable/subway_icon.png"
}, {
    "www/img/tram_icon.png": 
    "platforms/android/res/drawable/tram_icon.png"
},{
    "www/img/train_icon.png": 
    "platforms/android/res/drawable/train_icon.png"
}, {
	"platforms/android/com.phonegap.plugins.facebookconnect/msp-FacebookLib/libs/android-support-v4.jar":
	"platforms/android/libs/android-support-v4.jar"
} ];

var fs = require('fs');
var path = require('path');

// no need to configure below
var rootdir = process.argv[2];

filestocopy.forEach(function(obj) {
    Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        var srcfile = path.join(rootdir, key);
        var destfile = path.join(rootdir, val);
        //console.log("copying "+srcfile+" to "+destfile);
        var destdir = path.dirname(destfile);
        if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
            fs.createReadStream(srcfile).pipe(
               fs.createWriteStream(destfile));
        }
    });
});