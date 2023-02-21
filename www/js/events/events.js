(function() {
    angular.module("rewire.events", []);
    angular.module("rewire.events").controller("eventController", eventController);
    angular.module("rewire.events").factory("notificationsCache", function() {
        var notifications = [];

        return {
            get: function() {
                return notifications;
            },
            set: function(value) {
                notifications = value;
            }
        }
    });


    eventController.$inject = ["$scope", "$http", "utilService", "global", "$timeout", "$state", "notificationsCache"];

    function eventController($scope, $http, utilService, global, $timeout, $state, notificationsCache) {
        var vm = this;
        vm.events = notificationsCache.get();
        vm.working = false;
        if (!vm.events.length) {
            vm.working = true;
        }

        vm.gotoMap = gotoMap;

        var timezone = '+0000';

        utilService.getItem("user", function(user) {
            user = JSON.parse(user);
            timezone = utilService.convertTZ(user.timezone);
        });

        ////////////////////////////////////////////////
        $timeout(function() {
            loadEvents();
        }, 100);

        function gotoMap(event) {
            var mapOptions = JSON.stringify({
                type: 'event',
                object: event
            });
            utilService.setItem("mapOptions", mapOptions, function() {
                $state.go("map");
            });
        }

        function loadEvents() {
            utilService.getItem("speedDisplay", function(speedDisplay) {


                utilService.getItem("user", function(user) {
                    var user = JSON.parse(user);
                    var data = {
                        user_id: user.id,
                        manager_id: user.manager_id,
                        privileges: user.privileges
                    }
                    $http.post(global.baseUrl + "/api/mobilapp/events.php", data).then(function(res) {
                        res.data.forEach(function(event) {
                            if (event.params != "") {
                                if (event.params.charAt(0) == "\"" && event.params.slice(-1) == "\"")
                                    event.params = event.params.substring(1, event.params.length - 1);
                                event.params = JSON.parse(event.params);
                            }


                            if (speedDisplay == "kph")
                                event.speedwithdisplay = event.speed + " km/h";

                            if (speedDisplay == "mph")
                                event.speedwithdisplay = Math.round(event.speed * .621371) + " mph";

                            if (speedDisplay == "kn")
                                event.speedwithdisplay = Math.round(event.speed * .539957) + " kn";

                            event.time = moment(event.dt_tracker).format('LLLL');

                            event.showBattery = event.params.hasOwnProperty("batp");
                            event.showIgnition = event.params.hasOwnProperty("di1") || event.params.hasOwnProperty("acc");

                            event.params.ignition =
                                event.params.di1 !== null ?
                                event.params.di1 == "0" ? "Off" : "On" :
                                event.params.acc == "0" ? "Off" : "On";

                            // if (object.params != "")
                            //   object.params = JSON.parse(object.params);
                        });

                        notificationsCache.set(res.data);
                        vm.events = res.data;

                        $timeout(function() {
                            vm.working = false;
                            if (!$scope.$$phase)
                                $scope.$digest();
                        }, 100);
                    });
                });
            });
        }
    }

}())