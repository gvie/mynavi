# mynavi

##Demo
Go to http://mynavi.atspace.eu

##Build
* install cordova (http://cordova.apache.org/)
* checkout this repository

###browser version
in order for this to work you need to add the following line:
* 127.0.0.1       localwebapp.dev
* in your /etc/hosts in *NIX or c:\windows\system32\drivers\etc\hosts in windows
* run
`cordova add platform browser`
* then
`cordova serve`
* the app runs now on:
`http://localwebapp.dev:8000/browser/www/`

###android version
* run
`cordova add platform android`
* then
`cordova run android`
