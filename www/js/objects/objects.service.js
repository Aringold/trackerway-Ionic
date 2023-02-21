(function () {
  angular.module("rewire.objects").service("objectService", objectService);

  objectService.$inject = ["global", "$state", "utilService", "$ionicHistory", "$http", "toastr"];

  function objectService(global, $state, utilService, $ionicHistory, $http, toastr) {
    var cache = [];

    var service = {
      getIcons: getIcons,
      saveIcon: saveIcon,
      getAlarmEvent: getAlarmEvent,
      addRemoveAlarmEvent: addRemoveAlarmEvent
    }

    return service;

    ///////////////////////////////////////////

    function addRemoveAlarmEvent(object, callback) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          cmd: object.alarm ? 'add' : 'remove',
          imei: object.imei,
          user_id: user.id
        };
        $http.post(global.baseUrl + "/api/mobilapp/armDisarm.php", request).then(function (response) {
          callback(response.data);
        });
      });
    }

    function getAlarmEvent(callback) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          cmd: 'get',
          user_id: user.id
        };
        $http.post(global.baseUrl + "/api/mobilapp/armDisarm.php", request).then(function (response) {
          callback(response.data);
        });
      });
    }

    function saveIcon(imei, icon, callback) {
      var request = {
        imei: imei,
        icon: icon
      }
      $http.post(global.baseUrl + "/api/mobilapp/saveIcon.php", request).then(function (response) {
        callback(response.data);
      });
    }

    function getIcons(callback) {
      if (cache.length > 0)return callback(cache);

      var request = JSON.stringify({
        path: 'img/markers/objects'
      });
      $http.post(global.baseUrl + "/api/mobilapp/getIcons.php", request).then(function (response) {
        cache = response.data;
        callback(response.data);
      });
    }

  }

}())
