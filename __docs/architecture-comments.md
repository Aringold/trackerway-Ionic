# Architecture details

## API service 

```www/js/providers/api.service.js```  attempt to build centrlized API working service. Unfinished.  Generally in each controller we have own ```<screen-view-name>.service.js``` which propose implementation of API requests


## Authorization

Seems now we send `<username>` +  `<hash of password>` and on backend we always check is exists such user or not. Unfortunately this is bad way and need to be changed.  Username and password hash stored on devise in persistent storage. 


Seems somethere username and password stored in plain way. At least seems while we are on home page, application sent request to ```login.php``` and in parameters username and password in plain text ( while use not enter such data nearest several hours )

## Alert UI Service 

```www/js/create-alert/create-alert.js```  ?


## Router

```www/js/app.config.js```  here 

## Translation concept 

TBD

## Background \ Foreground

Application try to use "resume" and "pause" events 
https://cordova.apache.org/docs/en/5.0.0/cordova/events/events.pause.html
https://cordova.apache.org/docs/en/5.0.0/cordova/events/events.resume.html

In the event handlers ( ```www/js/app.js``` ) we setup ```$rootScope.paused```  which later use to decide send requests or not in the background. For example 

- www/js/home/home.js line 323
- www/js/models/objects.service.js line 187
- www/js/objects/objects.js
- www/js/map/map.js
- www/js/setZone/setZone.js


Not sure that this approach good enough. Seems during background OS can highly reduce memory used by application. Alternative in which we clear\remove time intervals and re create them as goes to foreground looks like robust solution.  Also additional check require behaviour under ios. High probablity that we should use another events not "pause" and "resume".