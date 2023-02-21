# Spinner 

Spinner implemented via ```ion-spinner```. Unfortunately it's not global solution. On several views like:


- ```www/js/objects/objects.html```
- ```www/js/objects/addObject/addObject.html```
- ```www/js/driver_behavior_events_data/driver_behavior_events_data.html```
- ```www/js/events/events.html```
- ```www/js/map/addFence/addFence.html```
- ```www/js/login/login.html```
- ```www/js/login/register/register.html```
- ```www/js/driver_behavior/driver_behavior.html```
- ```www/js/trackerConfig/addObject/addObject.html```
- ```www/js/alerts/alerts.html```
- ```www/js/gprs_command/gprs_command.html```
- ```www/js/history/history.html```
- ```www/js/home/home.html```
- ```www/js/create-alert/create-alert.js```  -- looks like service to display different kind of alerts


All spinners controlled via  controller status variable.  this means that cross screen requests not tracked and not whole network activity really  registered.

Spiner styles different. Sometimes it displayed as inline element. Controller status variable different too. 

Really we should move this into main controller. 