(function () {
  angular.module("rewire.settings", []);
  angular.module("rewire.settings").controller("settingsController", settingsController);

  settingsController.$inject = ["$scope", "settingsService", "utilService", "$translate", "$ionicPopup", "$rootScope", "objectsModel"];
  // Remove Driver Behavior (not delete!)
  // "driverBehaviorEventsDataService", "driverBehaviorService"];

  function settingsController($scope, settingsService, utilService, $translate, $ionicPopup, $rootScope, objectsModel,
    // Remove Driver Behavior (not delete!)
    // driverBehaviorEventsDataService, driverBehaviorService
    ) {
    var vm = this;
    vm.sendNotification;
    vm.speedDisplay;
    vm.showZones;
    vm.showMarkers;
    vm.showArrows;
    vm.showTail;
    vm.selectedLang;
		vm.selectLanguage = selectLanguage;
		vm.formatLanguage = formatLanguage;
    vm.menu = settingsService.getFullMenu();
    var _menu = JSON.stringify(vm.menu);

    vm.reorderItem = function (item, $fromIndex, $toIndex) {
      vm.menu.splice($fromIndex, 1);
      vm.menu.splice($toIndex, 0, item);
      settingsService.saveMenu(vm.menu);
    };
    vm.saveMenu = function () {
      settingsService.saveMenu(vm.menu);
    };

    loadSendNotification();
    loadSpeedDisplay();
    loadShowZones();
    loadShowMarkers();
    loadShowArrows();
    loadShowTail();
    loadLang();
    loadReceiveUpdates();

    ////////////////////////////////////////////////////////

    $scope.$watch("settings.selectedLang", function (newval, oldval) {
      if (oldval === undefined || newval === undefined) {
        return;
      }
      var language = $rootScope.locales.find(function (locale) {
				return locale.locale == vm.selectedLang;
			}).lang;

      utilService.setItem("lang", newval, function () {
        $translate.use(vm.selectedLang);
      });

      settingsService.setLanguageApp(language);
    });

    $scope.$watch("settings.showTail", function (newval, oldval) {
      if (oldval === undefined || newval === undefined)
        return;
      settingsService.setShowTail(newval);
    });

    $scope.$watch("settings.showArrows", function (newval, oldval) {
      if (oldval === undefined || newval === undefined)
        return;
      settingsService.setShowArrows(newval);
    });

    $scope.$watch("settings.showZones", function (newval, oldval) {
      if (oldval === undefined || newval === undefined)
        return;
      settingsService.setShowZones(newval);
    });

    $scope.$watch("settings.showMarkers", function (newval, oldval) {
      if (oldval === undefined || newval === undefined)
        return;
      settingsService.setShowMarkers(newval);
    });

    $scope.$watch("settings.sendNotification", function (newval, oldval) {
      if (oldval === undefined || newval === undefined)
        return;
      settingsService.setSendNotification(newval);
    });

    $scope.$watch("settings.speedDisplay", function (newval, oldval) {
      if (oldval === undefined)
        return;
      utilService.setItem("speedDisplay", newval);
    });

    // $scope.$watch("settings.receiveUpdates", function (newval, oldval) {
    //   if (oldval === undefined)
    //     return;
    //   utilService.setItem("receiveUpdates", newval, function () {
    //     objectsModel.initTimer();
    //     driverBehaviorService.initTimer();
    //   });
    // });

    function loadShowArrows() {
      settingsService.getShowArrows(function (val) {
        vm.showArrows = val;
      });
    }

    function loadShowTail() {
      settingsService.getShowTail(function (val) {
        vm.showTail = val;
      });
    }

    function loadShowZones() {
      settingsService.getShowZones(function (val) {
        vm.showZones = val;
      });
    }

    function loadShowMarkers() {
      settingsService.getShowMarkers(function (val) {
        vm.showMarkers = val;
      });
    }

    function loadSpeedDisplay() {
      utilService.getItem("speedDisplay", function (speedDisplay) {
        if (speedDisplay) {
          vm.speedDisplay = speedDisplay;
        } else {
          vm.speedDisplay = "kph";
          utilService.setItem("speedDisplay", "kph");
        }
      });
    }

    function loadSendNotification() {
      settingsService.getSendNotification(function (send_notification) {
        vm.sendNotification = send_notification == 1;
      });
    }

    function loadLang() {
      utilService.getItem("lang", function (lang) {
        vm.selectedLang = lang;
      });
    }

    function loadReceiveUpdates() {
      utilService.getItem("receiveUpdates", function (time) {
        vm.receiveUpdates = time || 5;
      });
    }

		function selectLanguage() {
			if (vm.modalIsOpen) {
				return;
			}

			vm.modalIsOpen = true;

			$scope.selectedItem = vm.selectedLang;
			$scope.locales = $rootScope.locales;

			$scope.selectItem = function (value) {
				$scope.selectedItem = value;
			}

			var popup = $ionicPopup.show({
				templateUrl: 'js/settings/select_language.html',
				title: 'Select Language',
				scope: $scope,
				buttons: [
					{
						text: 'Cancel' 
					}, {
						text: '<b>Save</b>',
						type: 'button-positive',
						onTap: function(e) {
							vm.selectedLang = $scope.selectedItem;
							return vm.selectedLang;
						}
					}
				]
			});

			popup.then(function(res) {
				vm.modalIsOpen = false;
			});
		}

		function formatLanguage() {
			return $rootScope.locales.find(function (locale) {
				return locale.locale == vm.selectedLang;
			}).lang;
		}

  }

}())
