(function () {
  angular.module("rewire.driverBehavior").controller("driverBehaviorEventsDataController", driverBehaviorEventsDataController);

  driverBehaviorEventsDataController.$inject = ["$scope", "driverBehaviorEventsDataService", "utilService", "$translate", "$ionicPopup", "$rootScope"];

  function driverBehaviorEventsDataController($scope, driverBehaviorEventsDataService, utilService, $translate, $ionicPopup, $rootScope) {
    var vm = this;
    
    vm.working = true;
    vm.modalIsOpen = false;
    vm.filter = '';
    vm.sorting = {
      name: 'By Vehicle Name',
      value: 'name'
    };
    vm.direction = 'asc';
    $scope.pageNum = 1;
    vm.ratings = ['0', 'C', 'B', 'A', 'A+'];

    vm.table = [];

    vm.data = driverBehaviorEventsDataService.getTable();
    vm._data = JSON.parse(JSON.stringify(vm.data));
    if (vm._data.length) {
      vm.working = false;
    }

    _filterTable();
    orderTable();
    showPage($scope.pageNum);

    driverBehaviorEventsDataService.initService();

    $scope.$on('$ionicView.leave', function() {
      driverBehaviorEventsDataService.stopService();
      clearInterval(interval);
    });

    var interval = setInterval(function () {
      vm.data = driverBehaviorEventsDataService.getTable();
      vm._data = JSON.parse(JSON.stringify(vm.data));

      if (vm._data.length) {
        vm.working = false;
      }

      _filterTable();
      orderTable();
      showPage($scope.pageNum);
    }, 1000);

    vm.filterTable = filterTable;
    vm.selectSorting = selectSorting;
    vm.changeDirection = changeDirection;
    vm.pageLeft = pageLeft;
    vm.pageRight = pageRight;
    vm.getPagesCount = getPagesCount;

    $scope.$watch('pageNum', function (pageNum) {
      showPage(pageNum);
    });

    function pageLeft() {
      if ($scope.pageNum > 1) {
        $scope.pageNum--;
      }
    }

    function pageRight() {
      if ($scope.pageNum < getPagesCount()) {
        $scope.pageNum++;
      }
    }

    function showPage(pageNum) {
      var min = 1;
      var max = Math.ceil(vm._data.length / 10);

      if (pageNum < min) {
        pageNum = min;
      }
      if (pageNum > max) {
        pageNum = max;
      }

      vm.table = vm._data.slice((pageNum - 1) * 10, (pageNum) * 10);
    }

    function getPagesCount() {
      return Math.ceil(vm._data.length / 10);
    }

    function filterTable() {
      if (typeof vm.filter !== 'string' || !vm.filter.length) {
        vm._data = JSON.parse(JSON.stringify(vm.data));

        orderTable();
        showPage(1);
        return;
      }

      _filterTable();
      orderTable();
      showPage(1);
    }

    function _filterTable() {
      var filter = vm.filter.toLowerCase();
      var _tmp = [];
      for (var i in vm.data) {
        var row = vm.data[i];
        if (row.name.toLowerCase().indexOf(filter) >= 0 || row.imei.toLowerCase().indexOf(filter) >= 0 || row.date.toLowerCase().indexOf(filter) >= 0) {
          _tmp.push(row);
        }
      }

      vm._data = _tmp;
    }

    function orderTable() {
      var sortKey = vm.sorting.value;

      var asc = function (a, b) {
        if (a[sortKey] < b[sortKey]) {
          return -1;
        }

        if (a[sortKey] > b[sortKey]) {
          return 1;
        }

        return 0;
      };
      var desc = function (a, b) {
        if (a[sortKey] > b[sortKey]) {
          return -1;
        }

        if (a[sortKey] < b[sortKey]) {
          return 1;
        }

        return 0;
      };

      if (vm.direction == 'asc') {
        vm._data.sort(asc);
      } else {
        vm._data.sort(desc);
      }

      showPage($scope.pageNum);
    }

    function changeDirection() {
      if (vm.direction == 'asc') {
        vm.direction = 'desc';
      } else {
        vm.direction = 'asc';
      }

      _filterTable();
      orderTable();
    }

    function selectSorting() {
      if (vm.modalIsOpen) {
        return;
      }

      vm.modalIsOpen = true;

      var currentSorting = vm.sorting;

      $scope.sorting = currentSorting;
      $scope.selectedItem = currentSorting.value;
      $scope.sortBy = [{
        name: 'By Vechile Name',
        value: 'name'
      }, {
        name: 'By Date',
        value: 'date'
      }, {
        name: 'By Rating',
        value: 'rating'
      }, {
        name: 'By EcoScore',
        value: 'ecoscore'
      }];

      $scope.selectSorting = function (value) {
        $scope.sorting = value;
      }

      var popup = $ionicPopup.show({
        templateUrl: 'js/driver_behavior_events_data/select_sorting.html',
        title: 'Sort By',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel' 
          }, {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              return $scope.sorting;
            }
          }
        ]
      });

      popup.then(function(res) {
        vm.modalIsOpen = false;
        if (!res) {
          vm.sorting = currentSorting;
        } else {
          vm.sorting = res;

          _filterTable();
          orderTable();
        }
      });
    }
  }
}());
