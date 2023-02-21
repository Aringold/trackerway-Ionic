(function() {
    angular.module("rewire.setZone", ['colorpicker.module']);
    angular.module("rewire.setZone").controller("setZoneController", setZoneController);

    setZoneController.$inject = ["$scope", "utilService", "settingsService", "homeService", "global", "$timeout", "$rootScope", "$compile", "$translate", "$cordovaGeolocation", "$stateParams", "toastr", "$ionicHistory", "objectsModel"];

    function setZoneController($scope, utilService, settingsService, homeService, global, $timeout, $rootScope, $compile, $translate, $cordovaGeolocation, $stateParams, toastr, $ionicHistory, objectsModel) {
        var BING_KEY = 'AhSo4y1XE042IpdDBogrIwApHZByv_ArhYgK4qnHa4hCt2Ge6VD99ywBs7NunD3D';
        L.mapbox.accessToken = "pk.eyJ1IjoicGFwb3VsYWtpc2wiLCJhIjoiY2ozZmpsdGJrMDAwZzJxanZxcWFkNzViNSJ9.CqQ5OONjvyyV2u52Xg_RMg";

        var map = {};
        var objectMarkerCluster = null;
        var mapInit = true; // to fitbounds only once (to not to fit bound after changing map type)
        var options = {};
        var refreshInterval = {}; // js interval to refresh state of objects on the map
        var allObjects = objectsModel.get();
        var speedDisplay;
        var showGoogleMaps = false;
        var showArrows = false;
        var showTail = false;
        var vm = this;
        vm.form = $stateParams.form || null;
        var placesZoneData = {
            edit_zone_layer: null
        };
        vm.editing = false;
        vm.mapLayers = [];
        vm.mapLayer = {};
        vm.address = "";

        vm.setMapStyle = setMapStyle;
        vm.openGoogleMaps = openGoogleMaps;
        vm.showSelf = showSelf;
        vm.showObject = showObject;

        vm.deletePoint = deletePoint;
        vm.savePoints = savePoints;

        unlockOrientation();

        //////////////////////////////////////////////////
        var selfMarker = {};

        function showSelf() {
            vm.showingSelf = true;
            var posOptions = { timeout: 10000, enableHighAccuracy: false };
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                map.setView([position.coords.latitude, position.coords.longitude]);

                var markerOptions = {
                    title: "You are here",
                    icon: new L.DivIcon({
                        iconSize: [54, 54],
                        iconAnchor: [27, 27],
                        popupAnchor: [0, 0],
                        className: 'mapDivIcon',
                        html: '<img src="https://api.tiles.mapbox.com/mapbox.js/v3.0.1/images/marker-icon-2x.png" ' +
                            'class="" title="You are here" ' +
                            'tabindex="0" style="width:20px">' +
                            '<div class="mapDivSpan">' +
                            "You are here" + '</div>'
                    })
                }

                selfMarker = L.marker([position.coords.latitude, position.coords.longitude], markerOptions).addTo(map);
                // selfMarker.bindPopup("Self location");

            }, function(err) {
                console.log(err);
            });
        }

        function showObject() {
            vm.showingSelf = false;
            map.removeLayer(selfMarker);
            if (object.lat) map.setView([object.lat, object.lng]);
            if (allObjects) map.fitBounds(objectMarkerCluster.getBounds());

        }

        function openGoogleMaps() {

            // https://www.google.com/maps/dir/?api=1&destination=43.12345,-76.12345
            // https://www.google.com/maps/dir/Current+Location/43.12345,-76.12345
            // https://maps.google.com?saddr=Current+Location&daddr=43.12345,-76.12345
            var posOptions = { timeout: 10000, enableHighAccuracy: false };
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, function(isAvailable) {
                    if (isAvailable) {
                        app = launchnavigator.APP.GOOGLE_MAPS;
                        launchnavigator.navigate([object.lat, object.lng], {
                            start: lat + ", " + lng,
                            app: app
                        });
                    } else {
                        var url = "https://www.google.com/maps/dir/?api=1&destination=" + object.lat + "," + object.lng;
                        window.open(url, "_system");
                    }
                });
            }, function(err) {
                console.log(err);
            });

        }

        function unlockOrientation() {
            if (ionic.Platform.isWebView()) {
                screen.orientation.unlock()
            }
        }

        // utilService.getItem("mapOptions", function(mapOptions) {
        utilService.getItem("speedDisplay", function(spd) {
            speedDisplay = spd;
            options = { type: 'all' };
            allObjects = objectsModel.get();
            objectMarkerCluster = null;
            $timeout(function() {
                initializeMap();
            }, 500);
        });
        // });

        $scope.$on("$ionicView.beforeLeave", function() {
            console.log("map leave, stopping interval if its running");
            if (refreshInterval)
                clearInterval(refreshInterval);
        });

        $scope.$watch("map.mapLayer", function(a) {
            if (a.layer == null) return;
            var index = vm.mapLayers.indexOf(a);
            utilService.setItem("map", index);
            setMapStyle();
        });

        function initializeMap() {
            utilService.getItem("map", function(index) {
                if (index == null) index = 0;

                var mapOptions = { maxZoom: 17 };
                vm.mapLayers.push({ name: 'Osm', layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', mapOptions) });
                vm.mapLayers.push({ name: 'Mapbox Street', layer: L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11')});
                vm.mapLayers.push({ name: 'Mapbox Hybrid', layer: L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-v9')});

                var roads = L.gridLayer.googleMutant({ type: 'roadmap' });
                var satellite = L.gridLayer.googleMutant({ type: 'satellite' });
                var hybrid = L.gridLayer.googleMutant({ type: 'hybrid' });
                var terrain = L.gridLayer.googleMutant({ type: 'terrain' });

                vm.mapLayers.push({ name: 'Google Streets', layer: roads });
                vm.mapLayers.push({ name: 'Google Satellite', layer: satellite });
                vm.mapLayers.push({ name: 'Google Terrain', layer: terrain });
                vm.mapLayers.push({ name: 'Google Hybrid', layer: hybrid });


                vm.mapLayer = vm.mapLayers[index];
                var mapOptions = { editable: false };
                if (vm.form) {
                    mapOptions = { editable: true };
                };
                map = L.map('map', mapOptions);
                if (vm.form && !vm.form.zone_circle_center.length) {
                    setTimeout(function () {
                        toastr.info( "Tap on the map to create zone", {
                            timeOut: 3000
                        });
                        // Default creation of a circle with subsequent editing
                        map.on("click", function (e) {
                            var maxValue = getMaxValue();
                            var slider = L.control.range({
                                position: 'topright',
                                min: 10,
                                max: maxValue,
                                value: 10,
                                step: 1,
                                orient: 'horizontal',
                                iconClass: 'leaflet-range-icon',
                                icon: false
                            });
                            changeMaxValueByZoom();
                            var circleRadius = slider.options.value;
                            var circleLanLng = e.latlng;
                            var circle = L.circle(circleLanLng, circleRadius, {
                                color: "#3388ff",
                                fillColor: "#f03",
                                fillOpacity: 0,
                            }).addTo(map);
                            vm.editing = true;
                            map.off("click");
                            placesZoneData.edit_zone_layer = circle;
                            map.addControl(slider);
                            slider.on('input change', function (e) {
                                circle.setRadius(e.value);
                                var value = ((map._controlCorners.topright.firstChild.children[0].value-map._controlCorners.topright.firstChild.children[0].min)/(map._controlCorners.topright.firstChild.children[0].max-map._controlCorners.topright.firstChild.children[0].min)*100).toFixed();
                                map._controlCorners.topright.firstChild.children[0].style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                            });
                        });
                        // var value = ((map._controlCorners.topright.children[0].value.value-map._controlCorners.topright.children[0].value.min)/(map._controlCorners.topright.children[0].value.max-map._controlCorners.topright.children[0].value.min)*100).toFixed();
                        // map._controlCorners.topright.children[0].value.style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                        map.on("editable:editing", function(e) {
                            placesZoneData.edit_zone_layer = e.layer;
                        });
                    }, 500);
                }

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        }

        function allAllObjectsToMap() {
            if (objectMarkerCluster != null)
                map.removeControl(objectMarkerCluster);

            objectMarkerCluster = L.markerClusterGroup();
            allObjects.forEach(function(object) {
                var icon = L.icon({ iconUrl: global.baseUrl + "/" + object.icon, iconSize: [40, 40] });

                if (speedDisplay == "kph")
                    object.speedwithdisplay = object.speed + " km/h";

                if (speedDisplay == "mph")
                    object.speedwithdisplay = Math.round(object.speed * .621371) + " mph";

                if (speedDisplay == "kn")
                    object.speedwithdisplay = Math.round(object.speed * .539957) + " kn";


                var markerOptions = {};
                if (showArrows) {
                    var icon_string = object.speed == 0 ? 'arrow_red' : object.status == "Moving" ? 'arrow_green' : 'arrow_red';

                    addBaseToIconUrl(icon_string);

                    markerOptions = {
                        title: object.name + ' (' + object.speedwithdisplay + ')',
                        // icon: mapMarkerIcons[icon_string],
                        icon: new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + mapMarkerIcons[icon_string].options.iconUrl + '"/>' // +
                                //'<div class="mapDivSpan">' + object.name + ' (' + object.speedwithdisplay + ')</div>'
                        }),
                        rotationAngle: object.angle
                    }
                } else {
                    markerOptions = {
                        title: object.name + ' (' + object.speedwithdisplay + ')',
                        icon: new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + global.baseUrl + "/" + object.icon + '"/>' // +
                                //'<div class="mapDivSpan">' + object.name + ' (' + object.speedwithdisplay + ')</div>'
                        })
                    }
                }

                var marker = L.marker([object.lat, object.lng], markerOptions);
                marker.bindTooltip(object.name + ' (' + object.getSpeed(speedDisplay) + ')', {
                    permanent: true,
                    direction: 'right',
                    offset: [15, 0]
                }).openPopup();
                marker.bindPopup(getPopupHTML(object));
                marker.object = object;
                // отображение маркеров на карте при загрузке карты
                if (showTail) {
                    var polyline = L.polyline([
                        [object.lat, object.lng]
                    ], { color: '#33fe5d' }).addTo(map);
                    marker.polyline = polyline;
                    objectMarkerCluster.addLayer(polyline);
                }

                objectMarkerCluster.addLayer(marker);
            });

            map.addControl(objectMarkerCluster);
            if (mapInit) {
                map.fitBounds(objectMarkerCluster.getBounds());
                mapInit = false;
            }

        }

        function addObject() {
            if (objectMarkerCluster != null)
                map.removeControl(objectMarkerCluster);

            objectMarkerCluster = L.markerClusterGroup();
            object = options.object;
            var icon = L.icon({ iconUrl: global.baseUrl + "/" + object.icon, iconSize: [40, 40] });
            if (speedDisplay == "kph")
                object.speedwithdisplay = object.speed + " km/h";

            if (speedDisplay == "mph")
                object.speedwithdisplay = Math.round(object.speed * .621371) + " mph";

            if (speedDisplay == "kn")
                object.speedwithdisplay = Math.round(object.speed * .539957) + " kn";

            var markerOptions = {};
            if (showArrows) {
                var icon_string = object.speed == 0 ? 'arrow_red' : object.status == "Moving" ? 'arrow_green' : 'arrow_red';

                addBaseToIconUrl(icon_string);

                markerOptions = {
                    title: object.name + ' (' + object.speedwithdisplay + ')',
                    // icon: mapMarkerIcons[icon_string],
                    icon: new L.DivIcon({
                        iconSize: [54, 54],
                        iconAnchor: [27, 27],
                        popupAnchor: [0, 0],
                        className: 'mapDivIcon',
                        html: '<img class="mapDivImage" src="' + mapMarkerIcons[icon_string].options.iconUrl + '"/>' // +
                            //'<div class="mapDivSpan">' + object.name + ' (' + object.speedwithdisplay + ')</div>'
                    }),
                    rotationAngle: object.angle
                }
            } else {
                markerOptions = {
                    title: object.name + ' (' + object.speedwithdisplay + ')',
                    icon: new L.DivIcon({
                        iconSize: [54, 54],
                        iconAnchor: [27, 27],
                        popupAnchor: [0, 0],
                        className: 'mapDivIcon',
                        html: '<img class="mapDivImage" src="' + global.baseUrl + "/" + object.icon + '"/>' // +
                            //'<div class="mapDivSpan">' + object.name + ' (' + object.speedwithdisplay + ')</div>'
                    })
                }
            }

            var marker = L.marker([object.lat, object.lng], markerOptions);
            marker.bindTooltip(object.name + ' (' + object.getSpeed(speedDisplay) + ')', {
                permanent: true,
                direction: 'right',
                offset: [15, 0]
            }).openPopup();

            var popupHtml = getPopupHTML(object);
            marker.popupHtml = popupHtml;
            addAddress(marker.popupHtml);

            marker.bindPopup(popupHtml);

            marker.object = object;
            if (showTail) {
                var polyline = L.polyline([
                    [object.lat, object.lng]
                ], { color: '#33fe5d' }).addTo(map);
                marker.polyline = polyline;
                objectMarkerCluster.addLayer(polyline);
            }
            objectMarkerCluster.addLayer(marker);

            map.addLayer(objectMarkerCluster);

            if (mapInit) {
                utilService.getItem("zoom_" + object.imei, function(zoom) {
                    if (zoom == null) zoom = 16;
                    map.setView([object.lat, object.lng], zoom);
                    mapInit = false;
                });
            }
        }

        function addBaseToIconUrl(icon) {
            if (!mapMarkerIcons[icon].options.baseUrlAdded) {
                mapMarkerIcons[icon].options.baseUrlAdded = true;
                mapMarkerIcons[icon].options.iconUrl = global.baseUrl + "/" + mapMarkerIcons[icon].options.iconUrl;
            }
        }

        function addEvent() {
            objectMarkerCluster = L.markerClusterGroup();

            object = options.object;
            var markerOptions = {
                title: object.name,
            }
            var marker = L.marker([object.lat, object.lng], markerOptions);
            marker.bindPopup(getPopupHTML(object));
            marker.object = object;
            objectMarkerCluster.addLayer(marker);

            map.addControl(objectMarkerCluster);

            setTimeout(function() {
                marker.openPopup();
            }, 1)

            if (mapInit) {
                map.setView([object.lat, object.lng], 10);
                mapInit = false;
            }
        }

        function addHistory() {

            var historyObject = options.historyObject;

            var stopsCluster = L.markerClusterGroup();

            historyObject.stops.forEach(function(stop) {
                var stopIcon = L.icon({ iconUrl: global.baseUrl + "/img/markers/route-stop.svg", iconSize: [24, 24] });
                var markerOptions = {
                    title: historyObject.name,
                    icon: stopIcon
                }
                var stopMarker = L.marker([stop[2], stop[3]], markerOptions);
                var obj = options.object;

                obj.lat = stop[2];
                obj.lng = stop[3];

                var stopobj = {
                    name: obj.name,
                    lat: stop[2],
                    lng: stop[3],
                    came: stop[6],
                    left: stop[7],
                    duration: stop[8]
                }

                stopMarker.object = {
                    name: obj.name,
                    lat: stop[2],
                    lng: stop[3],
                    came: stop[6],
                    left: stop[7],
                    duration: stop[8]
                };
                stopMarker.bindPopup(getEventPopupHTML(stopobj));

                stopsCluster.addLayer(stopMarker);
            });
            map.addControl(stopsCluster);


            var eventCluster = L.markerClusterGroup();

            historyObject.events.forEach(function(event) {
                var eventIcon = L.icon({ iconUrl: global.baseUrl + "/img/markers/route-event.svg", iconSize: [24, 24] });
                var markerOptions = {
                    title: historyObject.name,
                    icon: eventIcon
                }

                var eventMarker = L.marker([event[2], event[3]], markerOptions);
                eventMarker.object = {
                    lat: event[2],
                    lng: event[3]
                };
                options.object.event_desc = event[0];
                options.object.dt_tracker = event[1];

                var obj = {
                    name: options.object.name,
                    event_desc: event[0],
                    lat: event[2],
                    lng: event[3],
                    speed: event[6],
                    altitude: event[4],
                    angle: event[5],
                    dt_tracker: event[1]
                }

                eventMarker.bindPopup(getEventPopupHTML(obj));
                eventCluster.addLayer(eventMarker);
            });
            map.addControl(eventCluster);

            var routeCluster = L.markerClusterGroup();

            var latLngs = [];
            historyObject.route.forEach(function(route) {
                latLngs.push([route[1], route[2]]);
            });

            var firstRoute = historyObject.route[0];
            var firstRouteIcon = L.icon({ iconUrl: global.baseUrl + "/img/markers/route-start.svg", iconSize: [30, 30] });
            var firstRouteMarker = L.marker([firstRoute[1], firstRoute[2]], { icon: firstRouteIcon });
            options.object.dt_tracker = firstRoute[0];
            firstRouteMarker.bindPopup(getHistoryPopupHTML(options.object));
            firstRouteMarker.object = {
                lat: firstRoute[1],
                lng: firstRoute[2]
            };
            routeCluster.addLayer(firstRouteMarker);

            var lastRoute = historyObject.route[historyObject.route.length - 1];
            var lastRouteIcon = L.icon({ iconUrl: global.baseUrl + "/img/markers/route-end.svg", iconSize: [30, 30] });
            var lastRouteMarker = L.marker([lastRoute[1], lastRoute[2]], { icon: lastRouteIcon });
            options.object.dt_tracker = lastRoute[0];
            lastRouteMarker.bindPopup(getHistoryPopupHTML(options.object));
            lastRouteMarker.object = {
                lat: lastRoute[1],
                lng: lastRoute[2]
            };
            routeCluster.addLayer(lastRouteMarker);
            var polyline = L.polyline(latLngs, {
                color: '#ff312f',
                weight: 4
            });
            polyline.addTo(routeCluster);
            map.addControl(routeCluster);
            L.polylineDecorator(polyline, {
                patterns: [{
                    offset: 0,
                    repeat: 100,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 17,
                        headAngle: 40,
                        pathOptions: {
                            color: "#4800ff",
                            fillOpacity: 1,
                            weight: 0
                        }
                    })
                }]
            }).addTo(map);

            if (mapInit) {
                map.fitBounds(polyline.getBounds());
                mapInit = false;
            }
        }

        function setMapStyle() {
            settingsService.getShowTail(function(showTail_) {
                settingsService.getShowArrows(function(showArrows_) {
                    showArrows = showArrows_;
                    showTail = showTail_;

                    console.log("set map");
                    map.eachLayer(function(a) {
                        map.removeLayer(a);
                    });
                    map.addLayer(vm.mapLayer.layer);

                    console.log("stopping interval if its running");
                    if (refreshInterval)
                        clearInterval(refreshInterval);

                    if (options.type == "all") {
                        allAllObjectsToMap();
                        refreshObjects();
                    }

                    if (options.type == "object") {
                        addObject();
                        refreshSingleObject();
                        map.on('zoomend', function() {
                            saveZoom();
                        });
                    }

                    if (options.type == "event")
                        addEvent();

                    if (options.type == "history")
                        addHistory();

                    settingsService.getShowZones(function(showZones) {
                        if (showZones) addZones();
                    });

                    map.on('popupopen', function(e) {
                        var marker = e.popup._source;
                        addAddress(marker, e);
                    });
                });
            });

        }

        function saveZoom() {
            utilService.setItem("zoom_" + options.object.imei, map.getZoom());
        }

        function addZones() {
            homeService.getUserZones(function(zones) {
              if (vm.form.zone_circle_center.length && vm.form.id == "false") {
                  zones.push({
                      zone_id: vm.form.id,
                      zone_circle_center: vm.form.zone_circle_center,
                      zone_color: vm.form.color,
                      zone_name: vm.form.name,
                      zone_radius: vm.form.zone_radius
                  });
              }
              // Go through the array, with zones and draw all the zones that exist
            zones.forEach((zone) => {
                if (zone.zone_circle_center !== null) {
                  var circleRadius
                  var circleLanLng
                  if (vm.form.id === zone.zone_id) {
                    circleRadius = +vm.form.zone_radius;
                    circleLanLng = vm.form.zone_circle_center.split(',');
                  } else {
                    circleRadius = +zone.zone_radius;
                    circleLanLng = zone.zone_circle_center.split(',');
                  }
                  var circle = L.circle(circleLanLng, circleRadius, {
                  color: "red",
                  fillColor: "#f03",
                  fillOpacity: 0,
                  }).addTo(map);
                  // Editing a zone
                if (vm.form.id === zone.zone_id) {
                    var slider = L.control.range({
                        position: 'topright',
                        min: 10,
                        max: 900000,
                        value: circleRadius,
                        step: 1,
                        orient: 'horizontal',
                        iconClass: 'leaflet-range-icon',
                        icon: false
                    });
                    vm.editing = true;
                    changeMaxValueByZoom()
                    map.addControl(slider);
                    slider.on('input change', function (e) {
                        circle.setRadius(e.value);
                        var value = ((map._controlCorners.topright.firstChild.children[0].value-map._controlCorners.topright.firstChild.children[0].min)/(map._controlCorners.topright.firstChild.children[0].max-map._controlCorners.topright.firstChild.children[0].min)*100).toFixed();
                        map._controlCorners.topright.firstChild.children[0].style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                    });
                    placesZoneData.edit_zone_layer = circle;
                    map.on("editable:editing", function(e) {
                      placesZoneData.edit_zone_layer = e.layer;
                    });
                  }
                  // Creating a buffer with the zone name
                  if (zone.zone_name.length) {
                    circleLanLng[0] = (circleLanLng[0] - (circleRadius / 100000)).toString()
                    var label = L.marker(circleLanLng, {
                        icon: L.divIcon({
                            className: 'zoneTooltip',
                            html: zone.zone_name,
                        })
                    }).addTo(map);
                  }
                }
                if (zone.zone_radius === null) {
                    var vertices = zone.zone_vertices.split(",");
                    var odd = true;
                    var lat, lng;
                    var latlngs = [];
                    vertices.forEach(function (point) {
                        if (odd) {
                            lat = point;
                        } else {
                            lng = point
                            latlngs.push([lat, lng]);
                        }
                        odd = !odd;
                    })
                    var polygon = L.polygon(latlngs, { color: zone.zone_color }).addTo(map);
                    var label = L.marker(polygon.getBounds().getCenter(), {
                        icon: L.divIcon({
                            className: 'zoneTooltip',
                            html: zone.zone_name,
                        })
                    }).addTo(map);
                }
              });
            });
        }

        function refreshObjects() {
            if (refreshInterval)
                clearInterval(refreshInterval);
            refreshInterval = setInterval(function() {
                if ($rootScope.paused) return;
                homeService.getUserObjects(function(objects) {
                    objects.forEach(function(loopObj) {
                        objectMarkerCluster.eachLayer(function(layer) {
                            if (layer.object && layer.object.imei == loopObj.imei) {
                                loopObj.address = layer.object.address;
                                layer.object = loopObj;
                                // updatePopup(loopObj);
                                if (showArrows)
                                    layer.setRotationAngle(loopObj.angle);
                                layer.setLatLng([loopObj.lat, loopObj.lng]);
                                layer.update();
                                if (showTail) {
                                    var currentLineArray = layer.polyline.getLatLngs();
                                    if (currentLineArray.length > 14) currentLineArray.splice(0, 1);
                                    currentLineArray.push([loopObj.lat, loopObj.lng]);
                                    layer.polyline.setLatLngs(currentLineArray);
                                }
                            }
                        });
                    });
                });
            }, 5000);
        }

        function refreshSingleObject() {
            if (refreshInterval)
                clearInterval(refreshInterval);

            refreshInterval = setInterval(function() {
                if ($rootScope.paused) return;
                homeService.getUserObjects(function(objects) {
                    objects.forEach(function(loopObj) {
                        objectMarkerCluster.eachLayer(function(layer) {
                            if (layer.object && layer.object.imei == loopObj.imei) {
                                loopObj.address = layer.object.address;
                                layer.object = loopObj;
                                // updatePopup(loopObj);
                                if (showArrows)
                                layer.setRotationAngle(loopObj.angle);
                                layer.setLatLng([loopObj.lat, loopObj.lng]);
                                layer.update();
                                if (showTail) {
                                    var currentLineArray = layer.polyline.getLatLngs();
                                    if (currentLineArray.length > 14) currentLineArray.splice(0, 1);
                                    currentLineArray.push([loopObj.lat, loopObj.lng]);
                                    layer.polyline.setLatLngs(currentLineArray);
                                }
                                map.setView([loopObj.lat, loopObj.lng]);
                            }
                        });
                    });
                });
            }, 5000);
        }

        function updatePopup(object) {
            $scope.object = object;

            if ($scope.object.altitude)
                $scope.object.altitude = $scope.object.altitude.indexOf("mt") == -1 ? $scope.object.altitude + " mt" : $scope.object.altitude;
            $scope.object.angleText = $scope.object.angle + " °";
            $scope.object.latlng = $scope.object.lat + ", " + $scope.object.lng;

            if (speedDisplay == "kph")
                $scope.object.speedwithdisplay = object.speed + " km/h";

            if (speedDisplay == "mph")
                $scope.object.speedwithdisplay = Math.round(object.speed * .621371) + " mph";

            if (speedDisplay == "kn")
                $scope.object.speedwithdisplay = Math.round(object.speed * .539957) + " kn";

            if (!$scope.$$phase)
                $scope.$apply();

        }

        function addAddress(marker, e) {
            if (e === undefined) return;
            var popupDiv = e.popup._contentNode.getElementsByClassName("mapPopupContainer")[0];
            $compile(popupDiv)($scope);
            $scope.popupCompiled = true;
            updatePopup(marker.object);
            homeService.getAddress(marker.object, function(res) {
                // res = res.substring(1, res.length - 1);
                marker.object.address = res;
                $scope.object.address = res;
            });
        }

        function getHistoryPopupHTML(object) {
            var popup = "<div class='mapPopupContainer'>";
            popup += "<div class='popupKey'>" + getTranslation("DEVICE") + ":</div>" + "<div class='popupValue'>" + object.name + "</div>";

            popup += "<div class='popupKey'>" + getTranslation("ADDRESS") + ":</div>" + "<div class='addressValue popupValue' ng-bind='object.address'></div>";

            popup += "<div class='popupKey'>" + getTranslation("POSITION") + ":</div>" + "<div class='popupValue'>" + object.lat + ", " + object.lng + "</div>";

            if (object.dt_tracker)
                popup += "<div class='popupKey'>" + getTranslation("TIME") + ":</div>" + "<div class='popupValue'>" + object.dt_tracker + "</div>";

            if (object.came)
                popup += "<div class='popupKey'>" + getTranslation("CAME") + ":</div>" + "<div class='popupValue'>" + object.came + "</div>";
            if (object.left)
                popup += "<div class='popupKey'>" + getTranslation("LEFT") + ":</div>" + "<div class='popupValue'>" + object.left + "</div>";
            if (object.duration)
                popup += "<div class='popupKey'>" + getTranslation("DURATION") + ":</div>" + "<div class='popupValue'>" + object.duration + "</div>";


            popup += "</div>";

            return popup;
        }

        function getEventPopupHTML(object) {
            $scope.object = object;

            var popup = "<div class='mapPopupContainer'>";
            popup += "<div class='popupKey'>" + getTranslation("DEVICE") + ":</div>" + "<div class='popupValue'>" + object.name + "</div>";

            popup += "<div class='popupKey'>" + getTranslation("ADDRESS") + ":</div>" + "<div class='addressValue popupValue' ng-bind='object.address'></div>";

            popup += "<div class='popupKey'>" + getTranslation("POSITION") + ":</div>" + "<div class='popupValue'>" + object.lat + ", " + object.lng + "</div>";

            if (object.event_desc)
                popup += "<div class='popupKey'>" + getTranslation("EVENT") + ":</div>" + "<div class='popupValue'>" + object.event_desc + "</div>";

            if (object.dt_tracker)
                popup += "<div class='popupKey'>" + getTranslation("TIME") + ":</div>" + "<div class='popupValue'>" + object.dt_tracker + "</div>";

            if (object.came)
                popup += "<div class='popupKey'>" + getTranslation("CAME") + ":</div>" + "<div class='popupValue'>" + object.came + "</div>";
            if (object.left)
                popup += "<div class='popupKey'>" + getTranslation("LEFT") + ":</div>" + "<div class='popupValue'>" + object.left + "</div>";
            if (object.duration)
                popup += "<div class='popupKey'>" + getTranslation("DURATION") + ":</div>" + "<div class='popupValue'>" + object.duration + "</div>";


            popup += "</div>";

            return popup;
        }


        function getPopupHTML(object) {
            $scope.object = object;
            var popup = "<div class='mapPopupContainer'>";
            popup += "<div class='popupKey'>" + getTranslation("DEVICE") + ":</div>" + "<div class='popupValue' ng-bind='object.name'></div>";

            popup += "<div class='popupKey'>" + getTranslation("ADDRESS") + ":</div>" + "<div class='addressValue popupValue' ng-bind='object.address'></div>";

            if (object.event_desc)
                popup += "<div class='popupKey'>" + getTranslation("EVENT") + ":</div>" + "<div class='popupValue' ng-bind='object.event_desc'></div>";

            popup += "<div class='popupKey'>" + getTranslation("POSITION") + ":</div>" + "<div class='popupValue' ng-bind='object.latlng'></div>";
            popup += "<div class='popupKey'>" + getTranslation("ALTITUDE") + ":</div>" + "<div class='popupValue' ng-bind='object.altitude'> mt</div>";
            popup += "<div class='popupKey'>" + getTranslation("ANGLE") + ":</div>" + "<div class='popupValue' ng-bind='object.angleText'> °</div>";

            if (speedDisplay == "kph")
                object.speedwithdisplay = object.speed + " km/h";

            if (speedDisplay == "mph")
                object.speedwithdisplay = Math.round(object.speed * .621371) + " mph";

            if (speedDisplay == "kn")
                object.speedwithdisplay = Math.round(object.speed * .539957) + " kn";

            popup += "<div class='popupKey'>" + getTranslation("SPEED") + ":</div>" + "<div class='popupValue' ng-bind='object.speedwithdisplay'></div>";
            popup += "<div class='popupKey'>" + getTranslation("TIME") + ":</div>" + "<div class='popupValue' ng-bind='object.dt_tracker'></div>";
            popup += "</div>";

            return popup;
        }

        function getTranslation(word) {
            return capitalizeFirstLetter(translations[$translate.use()][word])
        };

        function deletePoint() {
            if (!vm.editing) {
                map.editTools.stopDrawing();
            }
            placesZoneData.edit_zone_layer.remove();
            placesZoneData.edit_zone_layer = [];
            map._controlCorners.topright.innerHTML = '';
            vm.editing = false;
            map.on("click", function (e) {
                var maxValue = getMaxValue()
                var slider = L.control.range({
                    position: 'topright',
                    min: 10,
                    max: maxValue,
                    value: 10,
                    step: 1,
                    orient: 'horizontal',
                    iconClass: 'leaflet-range-icon',
                    icon: false
                });
                changeMaxValueByZoom()
                var circleRadius = 10;
                var circleLanLng = e.latlng;
                var circle = L.circle(circleLanLng, circleRadius, {
                    color: "#3388ff",
                    fillColor: "#f03",
                    fillOpacity: 0,
                }).addTo(map);
                vm.editing = true;
                map.addControl(slider);
                slider.on('input change', function (e) {
                    circle.setRadius(e.value);
                    var value = ((map._controlCorners.topright.firstChild.children[0].value-map._controlCorners.topright.firstChild.children[0].min)/(map._controlCorners.topright.firstChild.children[0].max-map._controlCorners.topright.firstChild.children[0].min)*100).toFixed();
                    map._controlCorners.topright.firstChild.children[0].style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                });
                placesZoneData.edit_zone_layer = circle;
                map.off("click");
            })
            map.on("editable:editing", function(e) {
                placesZoneData.edit_zone_layer = e.layer;
            });
        }

        function savePoints() {
            var verticlesArr = []
            if (!vm.editing) {
                map.editTools.stopDrawing();
            }
            if (!angular.equals([], placesZoneData.edit_zone_layer)) {
                verticlesArr.push(placesZoneData.edit_zone_layer.getBounds().getCenter().lat);
                verticlesArr.push(placesZoneData.edit_zone_layer.getBounds().getCenter().lng);
                vm.form.zone_circle_center = verticlesArr.join(',');
                vm.form.zone_radius = placesZoneData.edit_zone_layer.getRadius().toString();
            } else {
                vm.form.zone_circle_center = "";
            }

            $ionicHistory.backView().stateParams = { formData: vm.form };
            $ionicHistory.goBack();
        }

        var oldSoftBack = $rootScope.$ionicGoBack;
        // $rootScope.$ionicGoBack = function(backCount) {
        //     savePoints();
        // };

        $scope.$on('$destroy', function() {
            $rootScope.$ionicGoBack = oldSoftBack;
        });
        function changeMaxValueByZoom() {
            map.on('zoomend', function () {
                if (map._controlCorners.topright.innerHTML != '') {
                    if (map.getZoom() === 17) {
                        map._controlCorners.topright.lastChild.lastChild.max = 230
                    } else if (map.getZoom() === 16) {
                        map._controlCorners.topright.lastChild.lastChild.max = 300
                    } else if (map.getZoom() === 15) {
                        map._controlCorners.topright.lastChild.lastChild.max = 700
                    } else if (map.getZoom() === 14) {
                        map._controlCorners.topright.lastChild.lastChild.max = 1300
                    } else if (map.getZoom() === 13) {
                        map._controlCorners.topright.lastChild.lastChild.max = 2300
                    } else if (map.getZoom() === 12) {
                        map._controlCorners.topright.lastChild.lastChild.max = 5000
                    } else if (map.getZoom() === 11) {
                        map._controlCorners.topright.lastChild.lastChild.max = 8300
                    } else if (map.getZoom() === 10) {
                        map._controlCorners.topright.lastChild.lastChild.max = 18000
                    } else if (map.getZoom() === 9) {
                        map._controlCorners.topright.lastChild.lastChild.max = 60000
                    } else if (map.getZoom() === 8) {
                        map._controlCorners.topright.lastChild.lastChild.max = 80000
                    } else {
                        map._controlCorners.topright.lastChild.lastChild.max = 900000
                    }
                }
            });
        }
        function getMaxValue() {
            if (map.getZoom() === 17) {
                return 230
            } else if (map.getZoom() === 16) {
                return 300
            } else if (map.getZoom() === 15) {
                return 700
            } else if (map.getZoom() === 14) {
                return 1300
            } else if (map.getZoom() === 13) {
                return 2300
            } else if (map.getZoom() === 12) {
                return 4300
            } else if (map.getZoom() === 11) {
                return 6300
            } else if (map.getZoom() === 10) {
                return 18000
            } else if (map.getZoom() === 9) {
                return 60000
            } else if (map.getZoom() === 8) {
                return 80000
            } else {
                return 900000
            }
        }
    }
}());
