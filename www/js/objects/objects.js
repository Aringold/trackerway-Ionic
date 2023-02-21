var objectStateEventRegistered = false;
var objectRefreshInterval;

(function() {
    angular.module("rewire.objects", []);

    angular.module("rewire.objects").factory("objectsCache", function() {
        var objects = [];

        return {
            get: function() {
                return objects;
            },
            set: function(value) {
                objects = value;
            }
        }
    });

    angular.module("rewire.objects").factory("scrollPosition", function() {
        var scroll = null;

        return {
            get: function() {
                return scroll;
            },
            set: function(value) {
                scroll = value;
            }
        }
    });

    angular.module("rewire.objects").controller("objectController", objectController);

    objectController.$inject = ["$scope", "objectService", "utilService", "global", "$timeout", "$state", "homeService", "toastr", "$ionicPopup", "$rootScope", "$interval", "$http", "$translate", "objectsCache", "$ionicScrollDelegate", "scrollPosition", "objectsModel"];

    function objectController($scope, objectService, utilService, global, $timeout, $state, homeService, toastr, $ionicPopup, $rootScope, $interval, $http, $translate, objectsCache, $ionicScrollDelegate, scrollPosition, objectsModel) {
        var vm = this;
        objectsCache.set(objectsModel.get());
        vm.objects = objectsCache.get();
        vm.working = vm.objects.length ? false : true;
        vm.demo = false;
        vm.subuser = false;
        vm.modalOpen = false;
        vm.modalIcons = true;
        vm.objectToEdit = {};
        vm.icons = [];
        vm.imgBaseUrl = global.baseUrl + "/img/markers/objects/";
        vm.baseUrl = global.baseUrl + "/";
        vm.disconnected = false;
        vm.search = "";

        vm.changeIcon = changeIcon;
        vm.gotoMap = gotoMap;
        vm.gotoMapAllObjects = gotoMapAllObjects;
        vm.editObject = editObject;
        vm.updateSettings = updateSettings;
        vm.getDtTrackerDate = getDtTrackerDate;
        vm.getDtTrackerTime = getDtTrackerTime;
        vm.upOrder = upOrder;
        vm.downOrder = downOrder;

        lockOrientation();
        checkIfDemoUser();

        var timezone = '+0000';
        utilService.getItem('user', function(user) {
            user = JSON.parse(user);
            timezone = utilService.convertTZ(user.timezone);
        });
        utilService.getItem('lang', function(lang) {
            moment.lang(lang);
        });
        ////////////////////////////////////////////////
        function getDtTrackerTime(object) {
            var date = moment.tz(object.dt_tracker, 'UTC');
            if (!date.isValid()) {
                return '';
            }

            return date.utcOffset(timezone).format('LT');
        }

        function getDtTrackerDate(object) {
            var date = moment.tz(object.dt_tracker, 'UTC');
            if (!date.isValid()) {
                return capitalizeFirstLetter(translations[$translate.use()]["UNKNOWN"]);
            }

            return date.utcOffset(timezone).format('L');
        }

        $timeout(function() {
            objectService.getAlarmEvent(function(res) {
                loadObjects(function() {
                    vm.imgBaseUrl = global.baseUrl + "/img/markers/objects/";
                    vm.baseUrl = global.baseUrl + "/";

                    if (res[0]) {
                        for (i in vm.objects) {
                            var object = vm.objects[i];
                            if (res[0].imei.indexOf(object.imei) !== -1) object.alarm = true;
                        }
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                    startObjectsRefresh();
                });
            });

            var sp = scrollPosition.get();
            if (sp) {
                $ionicScrollDelegate.scrollTo(sp.left, sp.top);
                scrollPosition.set({ left: 0, top: 0 });
            }

        }, 0);

        function lockOrientation() {
            if (ionic.Platform.isWebView()) {
                screen.orientation.lock('portrait');
            }
        }

        function updateSettings(key, val) {
            vm.modalOpen = false;
            var cmdData = {
                cmd: "exec_cmd",
                imei: vm.objectToEdit.imei,
                name: key + " " + val,
                gateway: 'm2m',
                sim_number: vm.objectToEdit.sim_number,
                type: "ASCII",
                cmd_: commands[key][val]
            };

            $http.post(global.baseUrl + "/api/mobilapp/deviceSettingsMobile.php", cmdData).then(function(e) {
                if (e.data == "OK") {
                    var data = { cmd: 'set', imei: vm.objectToEdit.imei, key: key, val: val };
                    $http.post(global.baseUrl + "/api/spytrack/deviceSettings.php", data).then(function(f) {
                        toastr.success(capitalizeFirstLetter(translations[$translate.use()]["SETTINGS_SAVED"]));
                    });
                } else {
                    toastr.error(capitalizeFirstLetter(translations[$translate.use()]["SETTINGS_NOT_SAVED"]) + " " + e.data);
                }
            });
        }

        function startObjectsRefresh() {
            if (!objectRefreshInterval) {
                objectRefreshInterval = $interval(function() {
                    if ($rootScope.paused) return;
                    loadObjects();
                }, 5000);
            }
        }

        if (!objectStateEventRegistered) {
            objectStateEventRegistered = true;
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    if (fromState.name == "objects") {
                        $interval.cancel(objectRefreshInterval);
                        objectRefreshInterval = null;
                    }
                });
        }

        function changeIcon(icon) {
            icon = "/img/markers/objects/" + icon;
            objectService.saveIcon(vm.objectToEdit.imei, icon, function(response) {
                if (response == "OK") {
                    toastr.success(capitalizeFirstLetter(translations[$translate.use()]["ICON_SAVED"]));
                    vm.objectToEdit.icon = icon;
                } else {
                    toastr.error(capitalizeFirstLetter(translations[$translate.use()]["PROBLEM_SAVING_ICON"]));
                }
                closeModal();
            });
        }

        function editObject($event, object) {
            if (vm.demo || vm.subuser) {
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
                $event.stopPropagation();
                $event.preventDefault();
                return;
            }
            vm.modalIcons = true;
            vm.objectToEdit = object;

            var data = { cmd: 'get', imei: object.imei };
            $http.post(global.baseUrl + "/api/spytrack/deviceSettings.php", data).then(function(e) {
                console.log(e);
                vm.update_interval = e.data.update_interval;
                vm.led_indicators = e.data.led_indicators;
                vm.heartbeat = e.data.heartbeat;
            });

            openModal();
            $event.stopPropagation();
            $event.preventDefault();
        }

        function upOrder($event, object) {
            $event.stopPropagation();
            $event.preventDefault();

            utilService.getItem("objectsOrder", function (objectsOrder) {
                if (!objectsOrder) {
                  return;
                }

                objectsOrder = JSON.parse(objectsOrder);

                var objectPosition = objectsOrder.indexOf(object.imei);

                if (objectPosition === -1) {
                    objectsOrder.push(object.imei);
                } else if (objectPosition === 0) {
                    return;
                } else {
                    var tmp = objectsOrder[objectPosition - 1];
                    objectsOrder[objectPosition - 1] = objectsOrder[objectPosition];
                    objectsOrder[objectPosition] = tmp;
                }

                utilService.setItem("objectsOrder", JSON.stringify(objectsOrder));

                objectsModel.set(objectsModel.orderObjects(objectsModel.get(), objectsOrder));
                objectsCache.set(objectsModel.get());
                vm.objects = objectsCache.get();
            });
        }

        function downOrder($event, object) {
            $event.stopPropagation();
            $event.preventDefault();

            utilService.getItem("objectsOrder", function (objectsOrder) {
                if (!objectsOrder) {
                  return;
                }

                objectsOrder = JSON.parse(objectsOrder);

                var objectPosition = objectsOrder.indexOf(object.imei);

                if (objectPosition === -1) {
                    objectsOrder.push(object.imei);
                } else if (objectPosition === (objectsOrder.length - 1)) {
                    return;
                } else {
                    var tmp = objectsOrder[objectPosition + 1];
                    objectsOrder[objectPosition + 1] = objectsOrder[objectPosition];
                    objectsOrder[objectPosition] = tmp;
                }

                utilService.setItem("objectsOrder", JSON.stringify(objectsOrder));

                objectsModel.set(objectsModel.orderObjects(objectsModel.get(), objectsOrder));
                objectsCache.set(objectsModel.get());
                vm.objects = objectsCache.get();
            });
        }

        function openModal() {
            vm.modalOpen = true;
            objectService.getIcons(function(response) {
                vm.icons = response;
            });
        }

        function closeModal() {
            vm.modalOpen = false;
        }

        function checkIfDemoUser() {
            utilService.getItem("user", function(user) {
                var user = JSON.parse(user);
                vm.demo = user.username.indexOf("demo") !== -1;
                var privileges = JSON.parse(user.privileges);
                vm.subuser = privileges.type == 'subuser';
            });
        }

        function gotoMap(object) {
            if (object.active != "true") return;

            $ionicScrollDelegate._instances.forEach(function(instance) {
                if (instance.element.className.search('objectsContent') > -1) {
                    scrollPosition.set(instance.getScrollPosition());
                }
            });

            var mapOptions = JSON.stringify({
                type: "object",
                object: object
            });
            utilService.setItem("mapOptions", mapOptions, function() {
                $state.go("map");
            })
        }

        function gotoMapAllObjects() {
            var mapOptions = JSON.stringify({
                type: "all"
            });
            utilService.setItem("mapOptions", mapOptions, function() {
                $state.go("map");
            });
        }

        function loadObjects(callback) {
            utilService.getItem("speedDisplay", function(speedDisplay) {
                var objects = objectsModel.get();
                objects.forEach(function(object) {
                    //if (object.params != "")
                    //    object.params = JSON.parse(object.params);

                    if (speedDisplay == "kph")
                        object.speedwithdisplay = object.speed + " km/h";

                    if (speedDisplay == "mph")
                        object.speedwithdisplay = Math.round(object.speed * .621371) + " mph";

                    if (speedDisplay == "kn")
                        object.speedwithdisplay = Math.round(object.speed * .539957) + " kn";

                    var t = object.dt_server_org.replace(" ", "T") + "Z";
                    var objTime = new Date(t).getTime();
                    var nowTime = new Date().getTime();

                    var diff = nowTime - objTime;
                    if (diff < 60 * 30 * 1000) {
                        if (object.loc_valid == 1) {
                            object.statusImageUrl = "img/status-online.png";
                        } else {
                            object.statusImageUrl = "img/status-orange.png";
                        }
                    } else {
                        object.statusImageUrl = "img/status-offline.png";
                        object.speed = 0;
                    }
                    if (object.speed == 0) {
                        object.status = "Stopped";
                    }

                    if (object.status == "Stopped") {
                        object.status = capitalizeFirstLetter(translations[$translate.use()]["STOPPED"])
                    } else if (object.status2 == "Moving") {
                        object.status = capitalizeFirstLetter(translations[$translate.use()]["MOVING"])
                    } else if (object.status2 == "Engine Idle") {
                        object.status = capitalizeFirstLetter(translations[$translate.use()]["ENGINE_IDLE"])
                    }
                    if (object.status2) {
                        object.statusstr = object.status2.ststr;
                        if (object.status2.st == "Stopped") {
                            object.status2.st = capitalizeFirstLetter(translations[$translate.use()]["STOPPED"])
                        } else if (object.status2.st == "Moving") {
                            object.status2.st = capitalizeFirstLetter(translations[$translate.use()]["MOVING"])
                        } else if (object.status2.st == "Engine Idle") {
                            object.status2.st = capitalizeFirstLetter(translations[$translate.use()]["ENGINE_IDLE"])
                        }
                    }

                    object.odometer = Math.round(object.odometer);
                    if (speedDisplay == "kph")
                        object.odowithdisplay = object.odometer + " km";

                    if (speedDisplay == "mph")
                        object.odowithdisplay = Math.round(object.odometer * .621371) + " mi";

                    if (speedDisplay == "mph")
                        object.odowithdisplay = Math.round(object.odometer * .539957) + " nmi";

                    object.showBattery = object.params.hasOwnProperty("batp");
                    object.showIgnition = object.params.hasOwnProperty("di1") || object.params.hasOwnProperty("acc");

                    object.params.ignition =
                        object.params.di1 !== null ?
                        object.params.di1 == "0" ? capitalizeFirstLetter(translations[$translate.use()]["OFF"]) : capitalizeFirstLetter(translations[$translate.use()]["ON"]) :
                        object.params.acc == "0" ? capitalizeFirstLetter(translations[$translate.use()]["OFF"]) : capitalizeFirstLetter(translations[$translate.use()]["ON"]);
                });

                vm.objects = objects;
                objectsCache.set(vm.objects);
                vm.working = false;
                if (!$scope.$$phase)
                    $scope.$digest();
                if (callback)
                    callback();
            });
        }

        var commands = {
            update_interval: {
                "30sec": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,30,60,30,60,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "60sec": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,60,60,60,60,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "5min": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,300,300,300,300,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "10min": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,600,600,600,600,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "disab": "AT+GTFRI=ujhf8w,0,0,,,0000,0000,600,600,600,600,1F,1000,1000,0,1,50,1,0,1,FFFF$"
            },
            led_indicators: {
                "on": "AT+GTCFG=ujhf8w,ujhf8w,GL300,1,0.0,1,5,1F,1,,7DEF,0,1,1,3600,1,0,20491231235959,1,0,,FFFF$",
                "off": "AT+GTCFG=ujhf8w,ujhf8w,GL300,1,0.0,1,5,1F,1,,7DEF,0,0,1,3600,1,0,20491231235959,1,0,,FFFF$"
            },
            heartbeat: {
                "on": "AT+GTSRI=ujhf8w,3,,1,spytrackgps.co.uk,11604,144.76.58.21,11604,,25,1,0,0,,,FFFF$",
                "off": "AT+GTSRI=ujhf8w,2,,1,spytrackgps.co.uk,11604,144.76.58.21,11604,,25,0,0,0,,,FFFF$"
            }
        }

    }

}())
