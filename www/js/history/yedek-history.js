(function () {
  angular.module("rewire.history", []);
  angular.module("rewire.history").controller("historyController", historyController);

  historyController.$inject = ["homeService", "$scope", "global", "$http", "utilService", "toastr", "$timeout", "$state"];

  function historyController(homeService, $scope, global, $http, utilService, toastr, $timeout, $state) {
    var vm = this;
    vm.choice = "last_hour";
    vm.selectedImei = "";
    vm.to = "";
    vm.from = "";
    vm.toCustom = "";
    vm.fromCustom = "";
    vm.objects = [];
    vm.working = false;

    vm.searchCustom = searchCustom;
    vm.searchPredefined = searchPredefined;

    $scope.$on("$ionicView.beforeEnter", function () {
      getUserObjects();
    });

    ///////////////////
    $scope.$watch("history.choice", function (a, b) {
      if (a == "last_hour") last_hour();
      if (a == "today") today();
      if (a == "yesterday") yesterday();
      if (a == "this_week") this_week();
    });

    function getUserObjects() {
      vm.objects = homeService.getCachedObjects();
      vm.selectedImei = vm.objects[0].imei
    }

    function searchCustom() {
      var from = formatLocalDate(vm.fromCustom);
      var to = formatLocalDate(vm.toCustom);
      sendHistoryRequest(from, to);
    }

    function searchPredefined() {
      sendHistoryRequest(vm.from, vm.to);
    }

    function sendHistoryRequest(from, to) {
      vm.working = true;
      var user = utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var user_id = user.manager_id == '0' ? user.id : user.manager_id;
        var priv = user.manager_id == '0' ? "" : "subuser";

        var data = {
          user_id: user_id,
          priv: priv,
          imei: vm.selectedImei,
          dst: user.dst,
          dst_start: user.dst_start,
          dst_end: user.dst_end,
          from: from,
          to: to
        }
        $http.post(global.baseUrl + "/api/mobilapp/history.php", data).then(function (res) {
          if (res.data.route.length == 0) {
            toastr.info("No data");
          } else {
            sessionStorage.map = JSON.stringify({
              type: 'history',
              object: res.data
            })
            $state.go("map");
          }
          $timeout(function () {
            vm.working = false;
          }, 300);
        });
      });

    }

    function last_hour() {
      vm.to = new Date().toISOString().replace("T", " ").split(".")[0];
      vm.from = new Date(new Date().getTime() - 1000 * 60 * 60).toISOString().replace("T", " ").split(".")[0];
    }

    function today() {
      var today = Date.now();
      var todayFrom = new Date(today).setUTCHours(0, 0, 1);
      var todayTo = new Date(today).setUTCHours(23, 59, 59);
      vm.from = new Date(todayFrom).toISOString().replace("T", " ").split(".")[0];
      vm.to = new Date(todayTo).toISOString().replace("T", " ").split(".")[0];
    }

    function yesterday() {
      var yesterday = Date.now() - (1000 * 60 * 60 * 24);
      var yesterdayFrom = new Date(yesterday).setUTCHours(0, 0, 1);
      var yesterdayTo = new Date(yesterday).setUTCHours(23, 59, 59);
      vm.from = new Date(yesterdayFrom).toISOString().replace("T", " ").split(".")[0];
      vm.to = new Date(yesterdayTo).toISOString().replace("T", " ").split(".")[0];
    }

    function this_week() {
      vm.to = new Date().toISOString().replace("T", " ").split(".")[0];
      vm.from = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 7)).toISOString().replace("T", " ").split(".")[0];
    }
  }
}())
