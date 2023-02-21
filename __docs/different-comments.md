
# Leaflet

## Leaflet migration

We create separate folder ```leaflet-1.7.1``` for new version of leaflet. We assume that migration can be spread over time and so we should have possibility to fast fallback. Plugins related to ```leaflet-1.7.1``` we've put into ```plugins``` folder. 

## Leaflet plugins

### **Leaflet.GridLayer.GoogleMutant**

Source: https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant

initially used custom implementation: ```www/3rdparty/leaflet/leaflet-google.js```  not it replaced to recommended plugin https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant

Usage:  
* ```map/map.js```
* ```map/setZone.js```

### **Leaflet.markercluster**

Source: https://github.com/Leaflet/Leaflet.markercluster

Really needed leaflet higher than 1.3.1 . Upgrade not critical. Clusters can be checked on "History" screen.

Usage: 
* ```map/map.js```
* ```map/setZone.js``` 

### **mapbox.js**

Source: https://github.com/mapbox/mapbox.js

Mapbox plugin. Official ```mapbox``` plugin for ```leaflet```.  We switch to include standalone version as it not contains leaflet itself. Looks like plugin needed ```leaflet``` version 1.4.0 and higher 

Usage:
* ```map/map.js```
* ```map/setZone.js``` 

### **marker.rotate.js**

Source: https://github.com/Leaflet/Leaflet/issues/386   

Usage: seems it's fix of ```_setPos``` method of ```leaflet```  discussion was in the 2011-2012 years and we assume that this was included \ fixed in base ```leaflet``` functionality and we comment out this js for a while


### **Leaflet.PolylineDecorator**

Source: https://github.com/bbecquet/Leaflet.PolylineDecorator

Plugin not update still moment of integration into trackerway. We just copy source from ```leaflet``` folder

Usage: 

###  **Leaflet.Editable**

Source: https://github.com/Leaflet/Leaflet.Editable 

From github: Make geometries editable in Leaflet.  This is not a plug and play UI, and will not be. This is a minimal, lightweight, and fully extendable API to control editing of geometries. So you can easily build your own UI with your own needs and choices.

Plugin not update still moment of integration into trackerway


### **Leaflet.MovingMarker**

Source: https://github.com/ewoken/Leaflet.MovingMarker

From github: A Leaflet plug-in to create moving marker. Very useful to represent transportations or other movable things !
Plugin not update still moment of integration into trackerway


### **Bing Maps Layer**

Source: https://github.com/digidem/leaflet-bing-layer 

From  github: Bing Maps Layer for Leaflet v1.0.0

While plugin not updated about 3 years our version slightly different from version in github repository.  Seems we should try version from repo because repository have not compressed version and it's important to have readable\ editable source for possible modifications.

Looks like bing really not used in application

# FILES

* ```www/js/map/map.js```  // maps integration, layers. leaflet used for map initialization.
* ```www/js/map/select_layer.html```   // response to list of available layers
* ```www/js/setZone/setZone.js``` // some zone setup functionality. leaflet used for map initialization.
* ```www/3rdparty/leaflet/leaflet-google.js``` // google maps integration seems outdated now or at least not full
* ```www/index.html```  // main file which used to include new js \ css 



