(function () {
  angular.module("starter").controller("menuController", menuController);

  menuController.$inject = [
    "$q",
    "$state",
    "$scope",
    "$timeout",
    "utilService",
    "$rootScope",
    "$translate",
    "$filter",
    "$ionicSideMenuDelegate",
    "$stateParams",
    "$ionicHistory",
    "settingsService"
  ];

  function menuController(
    $q,
    $state,
    $scope,
    $timeout,
    utilService,
    $rootScope,
    $translate,
    $filter,
    $ionicSideMenuDelegate,
    $stateParams,
    $ionicHistory,
    settingsService
  ) {
    var vm = this;

    vm.menu = settingsService.getHomeMenu();
    vm.sideMenu = settingsService.getSideMenu;
  }
})();
