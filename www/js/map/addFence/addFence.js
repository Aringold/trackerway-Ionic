(function() {
    angular.module("rewire.map").controller("addFenceController", addFenceController);

    addFenceController.$inject = ["homeService", "toastr", "$http", "global", "utilService", "$ionicHistory", "$q", "$stateParams", "$window", "$scope"];

    function addFenceController(homeService, toastr, $http, global, utilService, $ionicHistory, $q, $stateParams, $window, $scope) {
        var vm = this;

        vm.working = false;

        vm.formData = {
            cmd: 'save_zone',
            id: "false",
            name: "",
            group: 0,
            color: "#ff0000",
            visible: false,
            name_visible: false,
            area: 0,
            zone_radius: "",
            zone_circle_center: "",
            vertices: "",
            places_zones: ""
        };

        if ($stateParams.formData) {
            vm.formData = $stateParams.formData;
            if (vm.formData.group == undefined) {
                vm.formData.group = 0;
            }
        }
        vm.areas = [
            "Off",
            "Acres",
            "Hectares",
            "Square meters",
            "Square kilometers",
            "Square foot",
            "Square miles"
        ];

        $scope.area = vm.areas[vm.formData.area];

        vm.groups = [];

        $scope.group = { id: 0, 'name': 'Ungrouped' };

        vm.save = save;

        $scope.$watch(function() {
            return vm.formData.group;
        }, function(newValue) {
            vm.group = newValue;
        });

        $scope.$watch(function() {
            return vm.formData.area;
        }, function(newValue) {
            vm.area = newValue;
        });

        loadGroups().then(function(groups) {
            vm.groups = groups;
            $scope.group = vm.groups.find(function(group) {
                return group.id == vm.formData.group;
            });
        });

        var mapOptions = JSON.stringify({
            type: "all"
        });

        function loadGroups() {
            var defer = $q.defer();

            utilService.getItem("user", function(user) {
                var user = JSON.parse(user);
                var request = {
                    user_id: user.id,
                    manager_id: user.manager_id,
                    privileges: JSON.parse(user.privileges),
                    cmd: "load_place_group_data",
                };

                $http.post(global.baseUrl + "/api/mobilapp/places.php", request).then(function(response) {
                    var groups = response.data;

                    var result = [];
                    for (var i in groups) {
                        result.push({
                            id: i,
                            name: groups[i].name || 'Ungrouped'
                        });
                    }

                    defer.resolve(result);
                });
            });

            return defer.promise;
        }

        function save() {
            vm.formData.area = vm.areas.indexOf($scope.area);
            vm.formData.group = $scope.hasOwnProperty('group') ? $scope.group.id : null;
            var form = angular.element(document.getElementsByClassName("addFenceForm"));

            if (!vm.formData.zone_circle_center.length) {
              toastr.warning("Please set zone on map");
              return;
            }
            if (form.hasClass("ng-invalid")) {
                toastr.warning("Please fill all the fields.");
                return;
            }
            vm.working = true;
            utilService.getItem("user", function(user) {
                var user = JSON.parse(user);
                var request = {
                    /*
                    cmd	save_zone
                    group_id	0
                    zone_area	4
                    zone_color	#FF0000
                    zone_id	false
                    zone_name	New+zone+1
                    zone_name_visible	true
                    zone_vertices	52.659726,10.140381,52.514549,10.346375,52.574681,9.898682,52.739618,9.865723,52.659726,10.140381
                    zone_visible	true
                    */
                   // zone_vertices: vm.formData.verticles.split(",").map(function(point) {
                   //     return Math.round(parseFloat(point) * 1000000) / 1000000;
                   // }).join(","),

                    cmd: "save_zone",
                    group_id: vm.formData.group,
                    zone_area: vm.formData.area,
                    zone_color: vm.formData.color,
                    zone_id: vm.formData.id,
                    zone_name: vm.formData.name,
                    zone_name_visible: (new Boolean(vm.formData.name_visible)).toString(),
                    zone_vertices: vm.formData.vertices,
                    zone_circle_center: vm.formData.zone_circle_center,
                    zone_radius: vm.formData.zone_radius,
                    zone_visible: (new Boolean(vm.formData.visible)).toString(),
                    user_id: user.id,
                    manager_id: user.manager_id,
                    privileges: JSON.parse(user.privileges),
                    places_zones: vm.formData.places_zones
                  };


                $http.post(global.baseUrl + "/api/mobilapp/places.php", request).then(function(response) {
                    vm.working = false;
                    if (response.data == "ERROR_ZONE_LIMIT") {
                        toastr.warning("Zone limit was reached.");
                    } else if (response.data == "OK") {
                        toastr.success("Zone saved successfully.");
                        var goBack = vm.formData.id == "false" ? -3 : -1;
                        $ionicHistory.goBack(goBack);
                    } else {
                        toastr.warning("Unexpected error occured\n" + response.data);
                    }
                });
            })
        }
    }
}())
