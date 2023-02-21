(function() {
    angular.module("rewire.map", ['colorpicker.module']);
    angular.module("rewire.map").controller("mapController", mapController);

    mapController.$inject = ["$scope", "utilService", "settingsService", "homeService", "global", "$timeout", "$rootScope", "$compile", "$translate", "$cordovaGeolocation", "$stateParams", "toastr", "$ionicHistory", "$ionicPopup", "objectsModel"];

    function mapController($scope, utilService, settingsService, homeService, global, $timeout, $rootScope, $compile, $translate, $cordovaGeolocation, $stateParams, toastr, $ionicHistory, $ionicPopup, objectsModel) {
        var BING_KEY = 'AhSo4y1XE042IpdDBogrIwApHZByv_ArhYgK4qnHa4hCt2Ge6VD99ywBs7NunD3D';
        L.mapbox.accessToken = "pk.eyJ1IjoicGFwb3VsYWtpc2wiLCJhIjoiY2ozZmpsdGJrMDAwZzJxanZxcWFkNzViNSJ9.CqQ5OONjvyyV2u52Xg_RMg";
        L.mapbox.FORCE_HTTPS = true;
        var typeForHistory = false;
        var map = {};
        var objectMarkerCluster = null;
        var markersGroup = [];
        var mapInit = true; // to fitbounds only once (to not to fit bound after changing map type)
        var options = {};
        var refreshInterval = {}; // js interval to refresh state of objects on the map
        var allObjects = objectsModel.get();
        var speedDisplay;
        var showGoogleMaps = false;
        var showArrows = false;
        var showTail = false;
        var showMarkers = false;
        var markersIds = [];
        var slideDuration = 5000;
        var timezone = '+0000';
        var vm = this;
        var flagMarker = false;
        var moveToFlag = false;
        var speedForMoveTo = 0;
        var startPosition = true;
        var switchValue = 0;
        var checkBoxFlag = false;
        vm.ckeckboxButtonFlag = false;
        vm.checkedStopped = true;
        vm.checkedMove = true;
        vm.hideTooltips = false;
        var markersArr = [];
        vm.form = $stateParams.form || null;
        var placesZoneData = {
            edit_zone_layer: null
        };
        vm.buttonIcon = 'play';

        vm.showRefreshButton = false;
        vm.showSingleRefreshButton = false;

        vm.mapLayers = [];
        vm.mapLayer = {};
        vm.address = "";
        vm.modalIsOpen = false;
        vm.sliderMarkerPosition
        vm.sliderSpeed;

        vm.myMovingMarker;
        vm.setMapStyle = setMapStyle;
        vm.openGoogleMaps = openGoogleMaps;
        vm.showSelf = showSelf;
        vm.showObject = showObject;
        vm.showMovingRoute = showMovingRoute;
        vm.addPoint = addPoint;
        vm.deletePoint = deletePoint;
        vm.cancelPoints = cancelPoints;
        vm.savePoints = savePoints;
        vm.displayCheckboxes = displayCheckboxes;
        vm.displayStoppedAuto = displayStoppedAuto;
        vm.displayMoveAuto = displayMoveAuto;
        vm.showAndHideTooltip = showAndHideTooltip;


        vm.intervalUpdate = intervalUpdate;
        vm.intervalSingleUpdate = intervalSingleUpdate;

        vm.selectLayer = selectLayer;

        unlockOrientation();

        //////////////////////////////////////////////////

        var selfMarker = {};

        utilService.getItem("user", function(user) {
            user = JSON.parse(user);
            timezone = utilService.convertTZ(user.timezone);
        });
        utilService.getItem("lang", function(lang) {
            moment.locale(lang);
        });

        function selectLayer() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            $scope.selectedItem = vm.mapLayer;
            $scope.layers = vm.mapLayers;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/map/select_layer.html',
                title: 'Select Map Layer',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        vm.mapLayer = $scope.selectedItem;
                        return vm.mapLayer;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
            });
        }

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
            //if (allObjects) map.fitBounds(objectMarkerCluster.getBounds());
            if (allObjects) map.fitBounds();

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
                        var url = "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng;
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

        utilService.getItem("mapOptions", function(mapOptions) {
            utilService.getItem("speedDisplay", function(spd) {
                speedDisplay = spd;
                options = JSON.parse(mapOptions);
                if (options.object) {
                    var object = options.object;
                    object.getTime = function() {
                        return moment.tz(object.dt_tracker, 'UTC').utcOffset(timezone).format('LLLL');
                    };
                    object.getSpeed = function(units) {
                        var result = object.speed + " km/h";
                        if (units == "mph") {
                            result = Math.round(object.speed * .621371) + " mph";
                        } else if (units == "kn") {
                            result = Math.round(object.speed * .539957) + " kn";
                        }

                        return result;
                    }
                }
                allObjects = objectsModel.get();
                objectMarkerCluster = null;
                $timeout(function() {
                    initializeMap();
                }, 500);
            });
        });

        $scope.$on("$ionicView.beforeLeave", function() {
            map.eachLayer(function (layer) {
                map.removeLayer(layer)
            });
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
                }
                map = L.map('map', mapOptions);
                if (!$scope.$$phase) {
                    $scope.$apply();
                }

                if (options.type == 'object') {
                    vm.showSingleRefreshButton = true;
                }
            });
        }

        function displayCheckboxes() {
            let checkBoxcesDiv = document.querySelector('.shift-div');
            if (!checkBoxFlag) {
                checkBoxcesDiv.classList.add('active');
                checkBoxFlag = true;
            } else {
                checkBoxcesDiv.classList.remove('active');
                checkBoxFlag = false;
            }
        }

        function displayStoppedAuto(event) {
            markersArr.forEach((marker)=>{
                if (marker.object.status === 'Stopped' || marker.object.status === 'Engine Idle') {
                    if(!event.target.checked) {
                        map.removeLayer(marker);
                    } else {
                        marker.addTo(map);
                        if (vm.hideTooltips) {
                            marker.toggleTooltip();
                        }
                    }
                }
                if (marker.object.status === 'Moving' && marker.object.speed === 0) {
                    if(!event.target.checked) {
                        map.removeLayer(marker);
                    } else {
                        marker.addTo(map);
                        if (vm.hideTooltips) {
                            marker.toggleTooltip();
                        }
                    }
                }
            })
            vm.checkedStopped = event.target.checked;
        }

        function displayMoveAuto(event) {
            markersArr.forEach((marker)=>{
                if (marker.object.status === 'Moving' && marker.object.speed != 0) {
                    if(!event.target.checked) {
                        map.removeLayer(marker);
                    } else {
                        marker.addTo(map);
                        if (vm.hideTooltips) {
                            marker.toggleTooltip();
                        }
                    }
                }
            })
            vm.checkedMove = event.target.checked;
        }

        function addAllObjectsToMap() {
            vm.ckeckboxButtonFlag = true;
            if (objectMarkerCluster != null)
                map.removeControl(objectMarkerCluster);
            
            //objectMarkerCluster = L.markerClusterGroup();
            markersGroup = [];
            allObjects.forEach(function(object) {
                var icon = L.icon({ iconUrl: global.baseUrl + "/" + object.icon, iconSize: [40, 40] });

                var markerOptions = {};
                if (showArrows) {
                    var icon_string = object.speed == 0 ? 'arrow_red' : object.status == "Moving" ? 'arrow_green' : 'arrow_red';

                    addBaseToIconUrl(icon_string);

                    markerOptions = {
                        title: object.name + ' (' + object.getSpeed(speedDisplay) + ')',
                        icon: new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + mapMarkerIcons[icon_string].options.iconUrl + '"/>'
                        }),
                        rotationAngle: object.angle
                    }
                } else {
                    markerOptions = {
                        title: object.name + ' (' + object.getSpeed(speedDisplay) + ')',
                        icon: new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + global.baseUrl + "/" + object.icon + '"/>'
                        })
                    }
                }

                var marker = L.Marker.movingMarker([
                    [object.lat, object.lng],
                    [object.lat, object.lng]
                ], slideDuration, markerOptions);

                markersGroup.push(marker);

                var tooltip = marker.getTooltip();
                if (tooltip) {
                    tooltip.remove();
                }
                marker.bindTooltip(object.name + ' (' + object.getSpeed(speedDisplay) + ')', {
                    permanent: true,
                    direction: 'right',
                    offset: [15, 0]
                });

                marker.bindPopup(getPopupHTML(object));
                marker.object = object;
                if (showTail) {
                    var polyline = L.polyline([
                        [object.lat, object.lng]
                    ], { color: '#33fe5d' }).addTo(map);
                    marker.polyline = polyline;
                    //objectMarkerCluster.addLayer(polyline);
                    polyline.addTo(map);
                    var i = 0;
                    var k = 0;
                    var queryArray = [];
                    marker.on('move', function(e) {
                        i++;
                        if (i % 15 == 0) {
                            k++;
                            var ll = e.target.getLatLng();
                            polyline.addLatLng(ll);
                        }
                    });

                    marker.on('end', function(e) {
                        queryArray.push(k);
                        var removeCount = queryArray[0];
                        if (queryArray.length > 14) {
                            var currentLineArray = polyline.getLatLngs();
                            currentLineArray.splice(0, removeCount);
                            polyline.setLatLngs(currentLineArray);
                            queryArray.splice(0, 1);
                        }
                        i = 0;
                        k = 0;
                    });
                }
                marker.on('click', function(event) {
                    vm.showRefreshButton = true;
                    map.setView([object.lat, object.lng], 17);
                });
                marker.getPopup().on('remove', function() {
                    vm.showRefreshButton = false;
                });
                markersArr.push(marker)
                //objectMarkerCluster.addLayer(marker);
                marker.addTo(map);
            })
            if (showMarkers) addStaticMarkers(true);
            //map.addControl(objectMarkerCluster);
            if (mapInit) {
                //map.fitBounds(objectMarkerCluster.getBounds());
                if (!showMarkers) map.fitBounds(L.featureGroup(markersGroup).getBounds());
                mapInit = false;
            }

        }

        function addObject() {
            if (objectMarkerCluster != null)
                map.removeControl(objectMarkerCluster);

            //objectMarkerCluster = L.markerClusterGroup();
            object = options.object;
            var icon = L.icon({ iconUrl: global.baseUrl + "/" + object.icon, iconSize: [40, 40] });

            var markerOptions = {};
            if (showArrows) {
                var icon_string = object.speed == 0 ? 'arrow_red' : object.status == "Moving" ? 'arrow_green' : 'arrow_red';

                addBaseToIconUrl(icon_string);
                markerOptions = {
                    title: object.name + ' (' + object.getSpeed(speedDisplay) + ')',
                    // icon: mapMarkerIcons[icon_string],
                    icon: new L.DivIcon({
                        iconSize: [54, 54],
                        iconAnchor: [27, 27],
                        popupAnchor: [0, 0],
                        className: 'mapDivIcon',
                        html: '<img class="mapDivImage" src="' + mapMarkerIcons[icon_string].options.iconUrl + '"/>' // +
                            //'<div class="mapDivSpan">' + object.name + ' (' + object.getSpeed(speedDisplay) + ')</div>'
                    }),
                    rotationAngle: object.angle
                }
            } else {
                markerOptions = {
                    title: object.name + ' (' + object.getSpeed(speedDisplay) + ')',
                    icon: new L.DivIcon({
                        iconSize: [54, 54],
                        iconAnchor: [27, 27],
                        popupAnchor: [0, 0],
                        className: 'mapDivIcon',
                        html: '<img class="mapDivImage" src="' + global.baseUrl + "/" + object.icon + '"/>' // +
                            //'<div class="mapDivSpan">' + object.name + ' (' + object.getSpeed(speedDisplay) + ')</div>'
                    })
                }
            }

            var marker = L.Marker.movingMarker([
                [object.lat, object.lng],
                [object.lat, object.lng]
            ], slideDuration, markerOptions);
            var tooltip = marker.getTooltip();
            if (tooltip) {
                tooltip.remove();
            }
            marker.bindTooltip(object.name + ' (' + object.getSpeed(speedDisplay) + ')', {
                permanent: true,
                direction: 'right',
                offset: [15, 0]
            });

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
                //objectMarkerCluster.addLayer(polyline);
                polyline.addTo(map);
                var i = 0;
                var k = 0;
                var queryArray = [];
                marker.on('move', function(e) {
                    i++;
                    if (i % 15 == 0) {
                        k++;
                        var ll = e.target.getLatLng();
                        polyline.addLatLng(ll);
                    }
                });

                marker.on('end', function(e) {
                    queryArray.push(k);
                    var removeCount = queryArray[0];
                    if (queryArray.length > 14) {
                        var currentLineArray = polyline.getLatLngs();
                        currentLineArray.splice(0, removeCount);
                        polyline.setLatLngs(currentLineArray);
                        queryArray.splice(0, 1);
                    }
                    i = 0;
                    k = 0;
                });
            }
            marker.on('click', function(event) {
                map.setView([object.lat, object.lng], 17);
            });

            //objectMarkerCluster.addLayer(marker);
            marker.addTo(map);
            //map.addLayer(objectMarkerCluster);
            if (showMarkers) addStaticMarkers();

            if (mapInit) {
                utilService.getItem("zoom_" + object.imei, function(zoom) {
                    if (zoom == null) zoom = 17;
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
            //objectMarkerCluster = L.markerClusterGroup();
            object = options.object;
            var markerOptions = {
                title: object.name,
            }
            var marker = L.marker([object.lat, object.lng], markerOptions);
            marker.bindPopup(getPopupHTML(object));
            marker.object = object;
            //objectMarkerCluster.addLayer(marker);
            marker.addTo(map);

            //map.addControl(objectMarkerCluster);

            setTimeout(function() {
                marker.openPopup();
            }, 1)

            if (mapInit) {
                map.setView([object.lat, object.lng], 10);
                mapInit = false;
            }
        }

        function addHistory() {
            vm.typeForHistory = true;
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
                    came: moment.tz(stop[6], 'UTC').utcOffset(timezone).format('LLLL'),
                    left: moment.tz(stop[7], 'UTC').utcOffset(timezone).format('LLLL'),
                    duration: stop[8]
                }

                stopMarker.object = {
                    name: obj.name,
                    lat: stop[2],
                    lng: stop[3],
                    came: moment.tz(stop[6], 'UTC').utcOffset(timezone).format('LLLL'),
                    left: moment.tz(stop[7], 'UTC').utcOffset(timezone).format('LLLL'),
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
            
            var latLngs = [];
            var dataForTooltip = [];

            historyObject.route.forEach(function(route) {
                latLngs.push([route[1], route[2], route[5]]);
                dataForTooltip.push([route[5], route[0]]);
            })
            // создание маркера
            var object = options.object
            var markerOptions = {
                icon: new L.DivIcon({
                    iconSize: [54, 54],
                    iconAnchor: [27, 27],
                    popupAnchor: [0, 0],
                    className: 'mapDivIcon',
                    html: '<img class="mapDivImage" src="' + global.baseUrl + "/" + object.icon + '"/>' 
                })
            }
            if (!flagMarker) {
                var arrSpeed = [];
                for (let i = 0; i < latLngs.length; i++) {
                    arrSpeed.push(((20000/latLngs.length)/(1/30)));
                }
                speedForMoveTo = ((20000/latLngs.length)/(1/30))
                vm.myMovingMarker = L.Marker.movingMarker(latLngs, arrSpeed, markerOptions);
                flagMarker = true;
                if (!map.hasLayer(vm.myMovingMarker)) {
                    vm.myMovingMarker.addTo(map);
                }
            }
            // создание ползунков для маркера
            vm.sliderSpeed = L.control.range({
                position: 'bottomright',
                min: 1,
                max: 60,
                value: 1,
                step: 1,
                orient: 'horizontal',
                iconClass: 'leaflet-range-icon',
                icon: false
            });
            vm.sliderMarkerPosition = L.control.range({
                position: 'bottomright',
                min: 1,
                max: latLngs.length - 1,
                value: 1,
                step: 1,
                orient: 'horizontal',
                iconClass: 'leaflet-range-icon',
                icon: false
            });

            vm.sliderSpeed.on('input change', function(e) {
                var arrSpeed = []
                for (let i = 0; i < latLngs.length; i++) {
                    arrSpeed.push(((20000/latLngs.length)/(e.value/30)));
                }
                var value = ((map._controlCorners.bottomright.children[1].lastChild.value-map._controlCorners.bottomright.children[1].lastChild.min)/(map._controlCorners.bottomright.children[1].lastChild.max-map._controlCorners.bottomright.children[1].lastChild.min)*100).toFixed();
                map._controlCorners.bottomright.children[1].lastChild.style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                speedForMoveTo = ((20000/latLngs.length)/(e.value/30))
                vm.myMovingMarker._durations = arrSpeed

            });

            vm.sliderMarkerPosition.on('input change', function(e) {
                if (vm.myMovingMarker) {
                    vm.myMovingMarker.moveTo(latLngs[e.value], 0);
                    switchValue = e.value;
                    vm.myMovingMarker.on('move', function() {
                        if(vm.myMovingMarker._tooltip) {
                            vm.myMovingMarker._tooltip._contentNode.childNodes[2].nodeValue = `Speed: ${dataForTooltip[e.value][0]} ${options.object.speedDisplay}`;
                            vm.myMovingMarker._tooltip._contentNode.childNodes[4].nodeValue = dataForTooltip[e.value][1];
                        }
                    });
                    moveToFlag = true;
                    startPosition = false;
                    var value = ((map._controlCorners.bottomright.firstChild.lastChild.value-map._controlCorners.bottomright.firstChild.lastChild.min)/(map._controlCorners.bottomright.firstChild.lastChild.max-map._controlCorners.bottomright.firstChild.lastChild.min)*100).toFixed();
                    map._controlCorners.bottomright.firstChild.lastChild.style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                }
            });
            
            
            map.addControl(vm.sliderSpeed);
            map.addControl(vm.sliderMarkerPosition);

            var routeCluster = L.markerClusterGroup();
 
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
            dataForTooltip = formatingSpeed(dataForTooltip);

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

            hotlineLayer = L.hotline(latLngs, {
                min: 0,
                max: 180,
                palette: {
                    0.0: 'red',
                    1.0: '#ffffff'
                },
                weight: 3,
                outlineColor: '#000000',
                outlineWidth: 1
            });

            hotlineLayer.addTo(routeCluster);
            map.addControl(routeCluster);

            L.polylineDecorator(hotlineLayer, {
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
                map.fitBounds(hotlineLayer.getBounds());
                mapInit = false;
            }
            // сообщение с данными по маршруту
            var popup = `<div>Name: ${options.object.name}, <br/> Driving length: ${options.object.driving_length} <br/> Avg speed: ${historyObject.avg_speed}, <br/> Drives duration:  ${historyObject.drives_duration}, <br/> Stops duration:  ${historyObject.stops_duration}, <br/> Top speed:  ${historyObject.top_speed}</div>`;
            hotlineLayer.bindPopup(popup).addTo(map);
        }

        function showMovingRoute() {
            vm.buttonIcon = vm.buttonIcon === 'play' ? 'pause' : 'play';
            var historyObject = options.historyObject;
            var latLngs = [];
            var dataForTooltip = [];
            historyObject.route.forEach(function(route) {
                latLngs.push([route[1], route[2], route[5]]);
                dataForTooltip.push([route[5], route[0]]);
            });
            dataForTooltip = formatingSpeed(dataForTooltip);
            // остановка и запуск движения маркера
            if(flagMarker && vm.buttonIcon === 'pause') {
                vm.myMovingMarker.start();
            } else if(flagMarker && vm.buttonIcon === 'play') {
                vm.myMovingMarker.pause();
            }

            // движение камеры
            var position = {lat: vm.myMovingMarker._latlngs[0][0], lng:vm.myMovingMarker._latlngs[0][1]};
            vm.myMovingMarker.on('move', function() {
                // передвижение ползунка при движении маркера
                if (startPosition) {
                    map._controlCorners.bottomright.firstChild.lastChild.value = vm.myMovingMarker._currentIndex;
                    var value = ((vm.myMovingMarker._currentIndex-map._controlCorners.bottomright.firstChild.lastChild.min)/(map._controlCorners.bottomright.firstChild.lastChild.max-map._controlCorners.bottomright.firstChild.lastChild.min)*100).toFixed();
                    map._controlCorners.bottomright.firstChild.lastChild.style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                    // изменение данных в тултипе
                    if (dataForTooltip[vm.myMovingMarker._currentIndex]) {
                        vm.myMovingMarker._tooltip._contentNode.childNodes[2].nodeValue = `Speed: ${dataForTooltip[vm.myMovingMarker._currentIndex][0]} ${options.object.speedDisplay}`;
                        vm.myMovingMarker._tooltip._contentNode.childNodes[4].nodeValue = dataForTooltip[vm.myMovingMarker._currentIndex][1];
                    }
                } else {
                    if (+vm.myMovingMarker._currentIndex === 0) {
                        vm.myMovingMarker._currentIndex = 1;
                    }
                    let newValue = +switchValue + (+vm.myMovingMarker._currentIndex);
                    map._controlCorners.bottomright.firstChild.lastChild.value = newValue;
                    var value = ((newValue-map._controlCorners.bottomright.firstChild.lastChild.min)/(map._controlCorners.bottomright.firstChild.lastChild.max-map._controlCorners.bottomright.firstChild.lastChild.min)*100).toFixed();
                    map._controlCorners.bottomright.firstChild.lastChild.style.background = 'linear-gradient(to right, #2d71ce 0%, #2d71ce ' + value + '%, #fff ' + value + '%, white 100%)'
                    if (dataForTooltipAfterMoveTo[vm.myMovingMarker._currentIndex]) {
                        vm.myMovingMarker._tooltip._contentNode.childNodes[2].nodeValue = `Speed: ${dataForTooltipAfterMoveTo[vm.myMovingMarker._currentIndex][0]} ${options.object.speedDisplay}`;
                        vm.myMovingMarker._tooltip._contentNode.childNodes[4].nodeValue = dataForTooltipAfterMoveTo[vm.myMovingMarker._currentIndex][1];
                    }
                }
                var object = vm.myMovingMarker.getLatLng();
                map.setView([object.lat, object.lng], map.getZoom());
            });

            // создание тултипа
            if (!vm.myMovingMarker._tooltip) {
                vm.myMovingMarker.bindTooltip(`${options.object.name }<br> Speed: ${0}<br>${1}`, {
                    permanent: true,
                    direction: 'auto',
                    offset: [0, -10]
                });
            }

            vm.myMovingMarker.on('end', function() {
                vm.buttonIcon = 'play';
            });

            map.on('zoomend', function() {
                saveZoom();
            });
            var dataForTooltipAfterMoveTo = []
            // возобновление движения маркера, если его положение было изменено при помощи ползунка
            if (moveToFlag) {
                var position = vm.myMovingMarker.getLatLng();
                let newArr = [];
                latLngs.forEach((item, index) => {
                    if (item[0] == position.lat  && item[1] == position.lng) {
                        vm.sliderMarkerPosition.options.value = index;
                        newArr = latLngs.slice(index, latLngs.length);
                        dataForTooltipAfterMoveTo = dataForTooltip.slice(index, dataForTooltip.length);
                    }
                });
                newArr.forEach((item) => {
                    vm.myMovingMarker.addLatLng([+item[0], +item[1]], speedForMoveTo);
                });
                moveToFlag = false;
            }
        }

        // обработка скорости в зависимости от выбранного типа
        function formatingSpeed(speedArr) {
            var newArr = []
            speedArr.forEach((item) => {
                let speed = 0;
                if (options.object.speedDisplay === 'mph') {
                    speed = (item[0] * .621371).toFixed();
                } else if (options.object.speedDisplay === 'kph') {
                    speed = item[0];
                } else if (options.object.speedDisplay === 'kn') {
                    speed = (item[0] * .539957).toFixed();
                }
                newArr.push([speed, item[1]])
            })
            return newArr
        }

        function setMapStyle() {
            settingsService.getShowTail(function(showTail_) {
                settingsService.getShowArrows(function(showArrows_) {
                    settingsService.getShowMarkers(function (showMarkers_) {

                        showArrows = showArrows_;
                        showTail = showTail_;
                        showMarkers = showMarkers_;

                        map.eachLayer(function(a) {
                            map.removeLayer(a);
                        });

                        map.addLayer(vm.mapLayer.layer);
                        if (refreshInterval)
                            clearInterval(refreshInterval);

                        if (options.type == "all") {
                            addAllObjectsToMap();
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
                        map.on('popupopen', function (e) {
                            var marker = e.popup._source;
                            addAddress(marker, e);
                        });
                    });
                });
            });

        }

        function saveZoom() {
            utilService.setItem("zoom_" + options.object.imei, map.getZoom());
        }

        function addZones() {
            homeService.getUserZones(function(zones) {
                zones.forEach(function (zone) {
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
                    } else {
                        if (zone.zone_circle_center !== null) {
                        var circleRadius = +zone.zone_radius;
                        var circleLanLng = zone.zone_circle_center.split(',');
                        if (zone.zone_radius !== undefined) {
                            var circle = L.circle(circleLanLng, circleRadius, {
                                color: "red",
                                fillColor: "#f03",
                                fillOpacity: 0,
                            }).addTo(map);
                            // Создание меркера с именем зоны
                            circleLanLng[0] = (circleLanLng[0] - (circleRadius / 100000)).toString();
                            if (zone.zone_name.length) {
                                var label = L.marker(circleLanLng, {
                                    icon: L.divIcon({
                                        className: 'zoneTooltip',
                                        html: zone.zone_name,
                                    })
                                }).addTo(map);
                            }
                            }
                        }
                    }
                });
            });
        }

        function addStaticMarkers(isAll) {
            homeService.getUserStaticMarkers(function(markers) {
                if (markers.length > 0) {
                    markers.forEach(function(marker) {
                        if (marker.marker_visible == 'true') {
                            var markerOptions = {
                                title: marker.name,
                                icon: new L.DivIcon({
                                    iconSize: [34, 34],
                                    className: 'mapDivIcon',
                                    html: '<img class="mapMarkerImage" src="' + global.baseUrl + "/" + marker.marker_icon + '"/>'
                                }),
                            };
                            var popUpText = "<b>" + marker.marker_name + '</b><br/>' + marker.marker_desc;
                            var current = L.marker([marker.marker_lat, marker.marker_lng], markerOptions).bindPopup(popUpText);
                            current.staticMarkerdata = marker;
                            markersIds.push(marker.marker_id);
                            current.addTo(map);
                            markersGroup.push(current);
                        }
                    });

                }

                if (angular.isDefined(isAll) && isAll) map.fitBounds(L.featureGroup(markersGroup).getBounds());
            });
        }

        function updateStaticMarkers() {
            homeService.getUserStaticMarkers(function(markers) {
                var newMarkersIds = {};
                var oldMarkersIds = angular.copy(markersIds);

                markersIds = [];
                markers.forEach(function(marker) {
                    if (marker.marker_visible == 'true') {
                        markersIds.push(marker.marker_id);
                        newMarkersIds[marker.marker_id] = marker;
                        map.eachLayer(function(layer) {
                            if (layer.staticMarkerdata) {
                                if (layer.staticMarkerdata.marker_id == marker.marker_id) {
                                    if (newMarkersIds.hasOwnProperty(marker.marker_id)) {
                                        delete newMarkersIds[marker.marker_id];
                                    }

                                    var k = oldMarkersIds.indexOf(marker.marker_id);
                                    oldMarkersIds.splice(k, 1);

                                    layer.staticMarkerdata = marker;
                                    var icon = new L.DivIcon({
                                        iconSize: [34, 34],
                                        className: 'mapDivIcon',
                                        html: '<img class="mapMarkerImage" src="' + global.baseUrl + "/" + marker.marker_icon + '"/>'
                                    });
                                    layer.setIcon(icon);
                                    layer.setLatLng([marker.marker_lat, marker.marker_lng]);
                                    layer.staticMarkerdata = marker;
                                    var popUpText = "<b>" + marker.marker_name + '</b><br/>' + marker.marker_desc;
                                    layer.getPopup().setContent(popUpText);
                                    layer.getPopup().update();
                                    layer.update();
                                }
                            }
                        });
                    }
                });

                //remove not isset markers
                if (!angular.equals([], oldMarkersIds)) {
                    oldMarkersIds.forEach(function(id) {
                        map.eachLayer(function(layer) {
                            if (layer.staticMarkerdata && layer.staticMarkerdata.marker_id == id) {
                                layer.remove();
                            }
                        });
                    });
                }

                //add new markers
                if (!angular.equals({}, newMarkersIds)) {
                    angular.forEach(newMarkersIds, function(marker) {
                        var current = null;
                        var markerOptions = {
                            title: marker.name,
                            icon: new L.DivIcon({
                                iconSize: [34, 34],
                                className: 'mapDivIcon',
                                html: '<img class="mapMarkerImage" src="' + global.baseUrl + "/" + marker.marker_icon + '"/>'
                            }),
                        };

                        var popUpText = "<b>" + marker.marker_name + '</b><br/>' + marker.marker_desc;
                        current = L.marker([marker.marker_lat, marker.marker_lng], markerOptions).bindPopup(popUpText);
                        current.staticMarkerdata = marker;
                        current.addTo(map);
                    });
                }
            });
        }

        function refreshObjects() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }

            refreshInterval = setInterval(function() {
                intervalUpdate();
            }, 5000);
        }

        function intervalUpdate() {
            if ($rootScope.paused) return;
            var objects = objectsModel.get();
            if (showMarkers) updateStaticMarkers();

            objects.forEach(function (loopObj) {
                map.eachLayer(function(layer) {
                    if (layer.object && layer.object.imei == loopObj.imei) {
                        loopObj.address = layer.object.address;
                        layer.object = loopObj;

                        var icon_string = loopObj.speed == 0 ? 'arrow_red' : loopObj.status == "Moving" ? 'arrow_green' : 'arrow_red';
                        var iconPicture = global.baseUrl + "/" + loopObj.icon;
                        if (showArrows) {
                            layer.setRotationAngle(loopObj.angle);
                            iconPicture = mapMarkerIcons[icon_string].options.iconUrl;
                        }

                        var icon = new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + iconPicture + '"/>'
                        });
                        var tooltip = layer.getTooltip();
                        if (tooltip) {
                            tooltip.remove();
                        }

                        if (!vm.hideTooltips) {
                            layer.bindTooltip(loopObj.name + ' (' + loopObj.getSpeed(speedDisplay) + ')', {
                                permanent: true,
                                direction: 'right',
                                offset: [15, 0]
                            });
                        }

                        layer.moveTo([loopObj.lat, loopObj.lng], slideDuration);
                        //wait marker was stopped, then change  and rotateicon
                        $timeout(function() {
                            if (showArrows) {
                                layer.setRotationAngle(loopObj.angle);
                            }
                            layer.setIcon(icon);
                        }, slideDuration);
                        layer.update();
                    }
                });
                markersArr.forEach((layer)=>{
                    if (layer.object && layer.object.imei == loopObj.imei) {
                        loopObj.address = layer.object.address;
                        layer.object = loopObj;
                        var icon_string = loopObj.speed == 0 ? 'arrow_red' : loopObj.status == "Moving" ? 'arrow_green' : 'arrow_red';
                        var iconPicture = global.baseUrl + "/" + loopObj.icon;
                        if (showArrows) {
                            layer.setRotationAngle(loopObj.angle);
                            iconPicture = mapMarkerIcons[icon_string].options.iconUrl;
                        }
                        var icon = new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + iconPicture + '"/>'
                        });
                        var tooltip = layer.getTooltip();
                        if (tooltip) {
                            tooltip.remove();
                        }

                        if (!vm.hideTooltips) {
                            layer.bindTooltip(loopObj.name + ' (' + loopObj.getSpeed(speedDisplay) + ')', {
                                permanent: true,
                                direction: 'right',
                                offset: [15, 0]
                            });
                        }

                        layer.moveTo([loopObj.lat, loopObj.lng], slideDuration);
                        //wait marker was stopped, then change  and rotateicon
                        $timeout(function() {
                            if (showArrows) {
                                layer.setRotationAngle(loopObj.angle);
                            }
                            layer.setIcon(icon);
                        }, slideDuration);
                        if (layer.object.status === 'Moving' && layer.object.speed === 0) {
                            if (!vm.checkedStopped) {
                                map.removeLayer(layer);
                            }
                        }
                        if(loopObj.status === 'Stopped' || loopObj.status === 'Engine Idle') {
                            if (!vm.checkedStopped) {
                                map.removeLayer(layer);
                            }
                        }
                        if (layer.object.status === 'Moving' && layer.object.speed !== 0) {
                            if (!vm.checkedMove) {
                                map.removeLayer(layer);
                            }
                        }

                    }
                });
            });
        }

        function refreshSingleObject() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
            refreshInterval = setInterval(function() {
                intervalSingleUpdate();
            }, 5000);
        }

        function intervalSingleUpdate() {
            if ($rootScope.paused) return;
            var objects = objectsModel.get();

            if (showMarkers) updateStaticMarkers();
            objects.forEach(function(loopObj) {
                map.eachLayer(function(layer) {
                    if (layer.object && layer.object.imei == loopObj.imei) {
                        loopObj.address = layer.object.address;
                        layer.object = loopObj;

                        var icon_string = loopObj.speed == 0 ? 'arrow_red' : loopObj.status == "Moving" ? 'arrow_green' : 'arrow_red';
                        var iconPicture = global.baseUrl + "/" + loopObj.icon;
                        if (showArrows) {
                            layer.setRotationAngle(loopObj.angle);
                            iconPicture = mapMarkerIcons[icon_string].options.iconUrl;
                        }

                        var icon = new L.DivIcon({
                            iconSize: [54, 54],
                            iconAnchor: [27, 27],
                            popupAnchor: [0, 0],
                            className: 'mapDivIcon',
                            html: '<img class="mapDivImage" src="' + iconPicture + '"/>'
                        });
                        var tooltip = layer.getTooltip();
                        if (tooltip) {
                            tooltip.remove();
                        }
                        layer.bindTooltip(loopObj.name + ' (' + loopObj.getSpeed(speedDisplay) + ')', {
                            permanent: true,
                            direction: 'right',
                            offset: [15, 0]
                        });
                        layer.moveTo([loopObj.lat, loopObj.lng], slideDuration);
                        //wait marker was stoped, then change icon
                        $timeout(function() {
                            if (showArrows) {
                                layer.setRotationAngle(loopObj.angle);
                            }
                            layer.setIcon(icon);
                        }, slideDuration);
                        layer.update();
                        map.setView([loopObj.lat, loopObj.lng], undefined, {
                            animate: true,
                            duration: 2.95
                        });
                    }
                });
            });
        }

        function updatePopup(object) {
            $scope.object = object;
            object.speedDisplay = speedDisplay;

            if ($scope.object.altitude)
                $scope.object.altitude = $scope.object.altitude.indexOf("mt") == -1 ? $scope.object.altitude + " mt" : $scope.object.altitude;
            $scope.object.angleText = $scope.object.angle + " °";
            $scope.object.latlng = $scope.object.lat + ", " + $scope.object.lng;

            if (!$scope.$$phase)
                $scope.$apply();

        }

        function addAddress(marker, e) {
            if (e === undefined) return;
            if (angular.isUndefined(marker.object)) return;
            var popupDiv = e.popup._contentNode.getElementsByClassName("mapPopupContainer")[0];
            $compile(popupDiv)($scope);
            $scope.popupCompiled = true;
            updatePopup(marker.object);
            homeService.getAddress(marker.object, function(res) {
                marker.object.address = res;
                $scope.object.address = res;
            });
        }

        function getHistoryPopupHTML(object) {
            object.speedDisplay = speedDisplay;
            var popup = "<div class='mapPopupContainer'>";
            popup += "<div class='popupKey'>" + getTranslation("DEVICE") + ":</div>" + "<div class='popupValue'>" + object.name + "</div>";

            popup += "<div class='popupKey'>" + getTranslation("ADDRESS") + ":</div>" + "<div class='addressValue popupValue' ng-bind='object.address'></div>";

            popup += "<div class='popupKey'>" + getTranslation("POSITION") + ":</div>" + "<div class='popupValue'>" + object.lat + ", " + object.lng + "</div>";

            if (object.dt_tracker)
                popup += "<div class='popupKey'>" + getTranslation("TIME") + ":</div>" + "<div class='popupValue'>" + moment.tz(object.dt_tracker, 'UTC').utcOffset(timezone).format('LLLL') + "</div>";

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
            object.speedDisplay = speedDisplay;

            var popup = "<div class='mapPopupContainer'>";
            popup += "<div class='popupKey'>" + getTranslation("DEVICE") + ":</div>" + "<div class='popupValue'>" + object.name + "</div>";

            popup += "<div class='popupKey'>" + getTranslation("ADDRESS") + ":</div>" + "<div class='addressValue popupValue' ng-bind='object.address'></div>";

            popup += "<div class='popupKey'>" + getTranslation("POSITION") + ":</div>" + "<div class='popupValue'>" + object.lat + ", " + object.lng + "</div>";

            if (object.event_desc)
                popup += "<div class='popupKey'>" + getTranslation("EVENT") + ":</div>" + "<div class='popupValue'>" + object.event_desc + "</div>";

            if (object.dt_tracker)
                popup += "<div class='popupKey'>" + getTranslation("TIME") + ":</div>" + "<div class='popupValue'>" + moment.tz(object.dt_tracker, 'UTC').utcOffset(timezone).format('LLLL') + "</div>";

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
            object.speedDisplay = speedDisplay;
            var popup = "<div class='mapPopupContainer'>";
            popup += "<div class='popupKey'>" + getTranslation("DEVICE") + ":</div>" + "<div class='popupValue' ng-bind='object.name'></div>";

            popup += "<div class='popupKey'>" + getTranslation("ADDRESS") + ":</div>" + "<div class='addressValue popupValue' ng-bind='object.address'></div>";

            if (object.event_desc)
                popup += "<div class='popupKey'>" + getTranslation("EVENT") + ":</div>" + "<div class='popupValue' ng-bind='object.event_desc'></div>";

            popup += "<div class='popupKey'>" + getTranslation("POSITION") + ":</div>" + "<div class='popupValue' ng-bind='object.latlng'></div>";
            popup += "<div class='popupKey'>" + getTranslation("ALTITUDE") + ":</div>" + "<div class='popupValue' ng-bind='object.altitude'> mt</div>";
            popup += "<div class='popupKey'>" + getTranslation("ANGLE") + ":</div>" + "<div class='popupValue' ng-bind='object.angleText'> °</div>";

            popup += "<div class='popupKey'>" + getTranslation("SPEED") + ":</div>" + "<div class='popupValue' ng-bind='object.getSpeed(object.speedDisplay)'></div>";
            popup += '<div class="popupKey">' + getTranslation("TIME") + ':</div>' + '<div class="popupValue" ng-bind="object.getTime()"></div>';
            popup += "</div>";

            return popup;
        }

        function getTranslation(word) {
            return capitalizeFirstLetter(translations[$translate.use()][word])
        };

        function addPoint(e) {
            if (placesZoneData.edit_zone_layer) {
                //placesZoneData.edit_zone_layer.enableEdit()
                //placesZoneData.edit_zone_layer.editor.continueForward();
            } else {
                map.editTools.startPolygon();
            }

            map.on("editable:drawing:end", function(e) {
                placesZoneData.edit_zone_layer = e.layer,
                    placesZoneData.edit_zone_layer.getLatLngs()[0].length < 3 ? placesZoneProperties("cancel") : placesZoneData.edit_zone_layer.getLatLngs()[0].length > 40 ? toastr.warning('Zone can not have more than 40 vertex') : map.off("editable:drawing:end")
            });
        }

        function deletePoint() {
            placesZoneData.edit_zone_layer.remove();
            placesZoneData.edit_zone_layer = [];
        }

        function cancelPoints() {
            map.editTools.stopDrawing();
        }

        function savePoints() {
            vm.form.formData.verticles = placesZoneData.edit_zone_layer.getLatLngs().map(function(zone) {
                return zone.map(function(point) {
                    return point.lat.toString() + ',' + point.lng.toString();
                }).join(',');
            }).join(',');

            $ionicHistory.backView().stateParams = { formData: vm.form.formData };
            $ionicHistory.goBack();
        }

        function showAndHideTooltip(event) {
            event.target.style.backgroundImage = vm.hideTooltips ? "url(./../../img/tooltip.svg)" : "url(./../../img/offTooltip.svg)";
            vm.hideTooltips = vm.hideTooltips ? false : true;
            objects.forEach(function (loopObj) {
                map.eachLayer(function(layer) {
                    if (layer.object && layer.object.imei == loopObj.imei) {
                        layer.toggleTooltip();
                    }
                });
            });
        }
    }
}());
