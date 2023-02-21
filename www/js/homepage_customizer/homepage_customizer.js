(function () {
  angular.module("rewire.homepageCustomizer", []);
  angular.module("rewire.homepageCustomizer").controller("homepageCustomizerController", homepageCustomizerController);

  homepageCustomizerController.$inject = ["$scope", "homepageCustomizerService", "utilService", "$translate", "$ionicPopup", "$rootScope", "$q"];

  function homepageCustomizerController($scope, homepageCustomizerService, utilService, $translate, $ionicPopup, $rootScope, $q) {
    var vm = this;

    $rootScope.$broadcast('objectsSettings.reload', true);

    vm.searchObject = "";
    vm.searchSensor = "";

    $scope.objectsSettings = {};
    $q.when(homepageCustomizerService.get()).then(function (result) {
      for (var imei in result) {
        var object = result[imei];
        var _object = $scope.objectsSettings.hasOwnProperty(imei) ? $scope.objectsSettings[imei] : false;

        if (!_object) {
          continue;
        }

        for (var sensorName in object.sensors) {
          var sensor = object.sensors[sensorName];
          var _sensor = _object.sensors.hasOwnProperty(sensorName) ? _object.sensors[sensorName] : false;
          
          if (!_sensor) {
            continue;
          }

          result[imei].sensors[sensorName].visible = _sensor.visible;
          result[imei].sensors[sensorName].editable = _sensor.editable;
        }
      }

      $scope.objectsSettings = result;
    }, function (error) {
      console.error(error);
    });

    $scope.$watch(function () {
      return JSON.stringify($scope.objectsSettings);
    }, function (newval, oldval) {
      if (newval === oldval) {
        return;
      }

      homepageCustomizerService.set($scope.objectsSettings);
    });

    vm.filterObjects = function (object) {
      if (vm.searchObject.length && object.name.toLowerCase().indexOf(vm.searchObject.toLowerCase()) < 0) {
        return false;
      }
      if (vm.searchSensor.length && !Object.keys(object.sensors).filter(function (sensorName) { return sensorName.toLowerCase().indexOf(vm.searchSensor.toLowerCase()) >= 0;}).length) {
        return false;
      }

      return true;
    };

    vm.filterSensors = function (sensorName) {
      if (vm.searchSensor.length && sensorName.toLowerCase().indexOf(vm.searchSensor.toLowerCase()) < 0) {
        return false;
      }

      return true;
    };
  }
}())
