(function () {
  angular.module("rewire.map").controller("listFencesController", listFencesController);

  listFencesController.$inject = ["homeService", "toastr", "$http", "global", "utilService", "$ionicHistory", "$q", "$ionicPopup", "$translate", "$state"];

  function listFencesController(homeService, toastr, $http, global, utilService, $ionicHistory, $q, $ionicPopup, $translate, $state) {
    var vm = this;

		vm.zones = [];
    vm.working = false;
		vm.deleteZone = deleteZone;
		vm.editZone = editZone;

		vm.areas = [
			"Off",
			"Acres",
			"Hectares",
			"Square meters",
			"Square kilometers",
			"Square foot",
			"Square miles"
		];

		vm.boolToLang = {
			"true": "Yes",
			"false": "No"
		};

		getFences().then(function (zones) {
			vm.zones = zones;
		});

		function getFences() {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          user_id: user.id,
					manager_id: user.manager_id,
					privileges: JSON.parse(user.privileges),
					dst: user.dst,
					dst_start: user.dst_start,
					dst_end: user.dst_end,
					timezone: user.timezone,
					cmd: "load_zone_data",
					page: "1",
					rows: "2048",
					sidx: "dt_cmd",
					sord: "desc"
        };

				var promises = {};

        promises['zones'] = $http.post(global.baseUrl + "/api/mobilapp/places.php", request).then(function (response) {
					return response.data;
				});

        var groupRequest = {
          user_id: user.id,
					manager_id: user.manager_id,
					privileges: JSON.parse(user.privileges),
					cmd: "load_place_group_data",
        };

        promises['groups'] = $http.post(global.baseUrl + "/api/mobilapp/places.php", groupRequest).then(function (response) {
					return response.data;
        });

				$q.all(promises).then(function (results) {
					var zones = results.zones;
					var groups = results.groups;
					var result = [];
					for (var i in zones) {
						var zone = zones[i];

						zone.data.id = i;
						zone.data.group = groups[zone.data.group_id].name || "Ungrouped";

						zone.data.visible = vm.boolToLang[(new Boolean(zone.data.visible)).toString()];
						zone.data.name_visible = vm.boolToLang[(new Boolean(zone.data.name_visible)).toString()];
						zone.data.area = vm.areas[zone.data.area];
						result.push(zone.data);
					}

          defer.resolve(result);
        });
      });

			return defer.promise;
		}

		function deleteZone($event, zone) {
			var confirmPopup = $ionicPopup.confirm({
				title: capitalizeFirstLetter(translations[$translate.use()]["DELETE_ZONE"]),
				template: capitalizeFirstLetter(translations[$translate.use()]["WANT_TO_DELETE_ZONE"]),
				cancelText: capitalizeFirstLetter(translations[$translate.use()]["CANCEL"]),
				okText: capitalizeFirstLetter(translations[$translate.use()]["OK"])
			});

			confirmPopup.then(function (res) {
				if (res) {
					utilService.getItem("user", function (user) {
						var user = JSON.parse(user);
							var request = {
								user_id: user.id,
								manager_id: user.manager_id,
								privileges: JSON.parse(user.privileges),
								cmd: "delete_zone",
								zone_id: zone.id
							};

							$http.post(global.baseUrl + "/api/mobilapp/places.php", request).then(function (response) {
								return getFences();
							}).then(function (zones) {
								return vm.zones = zones;
							});
					});
				} else {

				}
			});

			$event.stopPropagation();
			$event.preventDefault();
		}

		function editZone($event, zone) {
			if (zone.zone_radius === null) {
				toastr.warning("You can't edit that zone", {
						timeOut: 3000
				});
				return
			}
      $state.go('addFence', {
        formData: {
          cmd: 'save_zone',
          id: zone.id,
          name: zone.name,
          group: zone.group_id,
          color: zone.color,
          visible: zone.visible == "Yes" ? true : false,
          name_visible: zone.name_visible == "Yes" ? true : false,
          area: vm.areas.indexOf(zone.area),
          zone_radius: zone.zone_radius,
          zone_circle_center: zone.zone_circle_center,
          vertices: zone.vertices,
          places_zones: ""
        }
      });
		}
  }
}())
