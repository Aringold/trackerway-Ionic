(function () {
    angular.module("rewire.history", []);
    angular.module("rewire.history").controller("historyController", historyController);

    historyController.$inject = ["$scope", "global", "$http", "utilService", "toastr", "$timeout", "$state", "homeService", "$translate", "objectsModel"];

    function historyController($scope, global, $http, utilService, toastr, $timeout, $state, homeService, $translate, objectsModel) {
        var vm = this;
        vm.choice = "last_hour";
        vm.selectedImei = "";
        vm.to = "";
        vm.from = "";
        vm.toCustom = "";
        vm.fromCustom = "";
        vm.objects = [];
        vm.working = false;
        vm.search = search;

        vm.searchCustom = searchCustom;
        vm.searchPredefined = searchPredefined;

				var timezone = '+0000';

				utilService.getItem("user", function (user) {
					user = JSON.parse(user);
					timezone = utilService.convertTZ(user.timezone);
				});
        $scope.$on("$ionicView.beforeEnter", function () {
            getUserObjects();
        });

        ///////////////////
        function search() {
            vm.objects.forEach(function (e) {
                if (e.name.toLowerCase().indexOf(vm.searchValue.toLowerCase()) != -1)
                    vm.selectedImei = e.imei;
            });
        }

        $scope.$watch("history.choice", function (a, b) {
            if (a == "last_hour") last_hour();
            if (a == "today") today();
            if (a == "yesterday") yesterday();
            if (a == "this_week") this_week();
        });

        function getUserObjects() {
            vm.objects = objectsModel.get();
            vm.selectedImei = vm.objects[0].imei;
        }

        function searchCustom() {
            var from = formatLocalDate(moment(vm.fromCustom).set({hour: 0, minute: 0, second: 0}).toDate());
            var to = formatLocalDate(moment(vm.toCustom).set({hour: 23, minute: 59, second: 59}).toDate());
            from = moment(from).utc().utcOffset(timezone).format('YYYY-MM-DD HH:mm:ss');
            to = moment(to).utc().utcOffset(timezone).format('YYYY-MM-DD HH:mm:ss');
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

                var selectedObject = getObjectByImei(vm.selectedImei);

                $http.post(global.baseUrl + "/api/mobilapp/history_v2.php", data).then(function (res) {
                    if (res.data.route.length == 0) {
                        toastr.info(capitalizeFirstLetter(translations[$translate.use()]["NO_DATA"]));
                    } else {
                        var mapOptions = JSON.stringify({
                            type: 'history',
                            historyObject: res.data,
                            object: selectedObject
                        });
                        utilService.setItem("mapOptions", mapOptions, function () {
                            $state.go("map");
                        });
                    }
                    $timeout(function () {
                        vm.working = false;
                    }, 300);
                });
            });

        }

        function getObjectByImei(imei) {
            var obj = {};
            vm.objects.forEach(function (object) {
                if (object.imei === imei)
                    obj = object;
            })
            return obj;
        }

        function last_hour() {
            vm.to = moment().utc().format('YYYY-MM-DD HH:mm:ss'); //new Date().toISOString().replace("T", " ").split(".")[0];
            vm.from = moment().subtract(1, 'hour').utc().format('YYYY-MM-DD HH:mm:ss'); //new Date(new Date().getTime() - 1000 * 60 * 60).toISOString().replace("T", " ").split(".")[0];
        }

        function today() {
					vm.from = moment().utc().utcOffset(timezone).startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
					vm.to = moment().utc().utcOffset(timezone).endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
        }

        function yesterday() {
					vm.from = moment().utc().utcOffset(timezone).startOf('day').subtract(1, 'day').utc().format('YYYY-MM-DD HH:mm:ss');
					vm.to = moment().utc().utcOffset(timezone).endOf('day').subtract(1, 'day').utc().format('YYYY-MM-DD HH:mm:ss');
        }

        function this_week() {
					vm.from = moment().utc().utcOffset(timezone).startOf('week').utc().format('YYYY-MM-DD HH:mm:ss');
					vm.to = moment().utc().utcOffset(timezone).endOf('week').utc().format('YYYY-MM-DD HH:mm:ss');
        }
    }
}())
