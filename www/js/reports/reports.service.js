(function () {
	angular.module("rewire.reports").service("reportsService", reportsService);

	reportsService.$inject = ["global", "$state", "utilService", "$ionicHistory", "$http", "toastr"];

	function reportsService(global, $state, utilService, $ionicHistory, $http, toastr) {
		var service = {};
		return service;
	}
})();
