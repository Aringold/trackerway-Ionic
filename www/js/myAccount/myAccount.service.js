(function () {
  angular.module("rewire.myAccount").service("myAccountService", myAccountService);

  myAccountService.$inject = ["$http", "global", "utilService", "$q"];

  function myAccountService($http, global, utilService, $q) {

    var service = {
			updateEmail: updateEmail,
			updatePassword: updatePassword
    };
    return service;

    function updateEmail(formData) {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
				var user = JSON.parse(user);
        
				var data = {
          cmd: 'update_email',
          user_id: user.id,
        };
				data = Object.assign(data, formData);
				console.log(data);

        $http.post(global.baseUrl + "/api/mobilapp/my_account.php", data).then(function (res) {
					defer.resolve(res);
        }, function (res) {
					defer.reject(res);
        });
      });

			return defer.promise;
    }

    function updatePassword(formData) {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
				var user = JSON.parse(user);
        
				var data = {
          cmd: 'update_password',
          user_id: user.id,
        };
				data = Object.assign(data, formData);
				console.log(data);

        $http.post(global.baseUrl + "/api/mobilapp/my_account.php", data).then(function (res) {
					defer.resolve(res);
        }, function (res) {
					defer.reject(res);
				});
      });

			return defer.promise;
    }
  }

}())
