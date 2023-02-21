(function () {
  angular.module("rewire.trackerConfig", []);
  angular.module("rewire.trackerConfig").controller("trackerConfigController", trackerConfigController);

  trackerConfigController.$inject = ["$scope", "homeService", "trackerConfigService"];

  function trackerConfigController($scope, homeService, trackerConfigService) {
    var vm = this;
    vm.objects = [];
    vm.objectTypes = [];
    vm.selectedObjectIndex = "0";
    vm.selectedTypeIndex = "0";

    getUserObjects();
    getObjectTypes();

    ////////////////////////////////////////////////////////////////////////
    $scope.$watch("tracker.selectedObjectIndex", function (newval) {
      trackerConfigService.setSelectedObject(vm.objects[newval]);
    });

    $scope.$watch("tracker.selectedTypeIndex", function (newval) {
      trackerConfigService.setSelectedType(vm.objectTypes[newval]);
    });


    function getObjectTypes() {
      vm.objectTypes = trackerConfigService.getObjectTypes();
    }

    function getUserObjects() {
      vm.objects = homeService.getCachedObjects();
      vm.selectedImei = vm.objects[0].imei;
    }

  }
}())
