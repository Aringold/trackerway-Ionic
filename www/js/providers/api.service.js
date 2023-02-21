(function () {
  angular.module("starter").service("apiProvider", apiProvider);

  apiProvider.$inject = ["$q", "$http", "global", "userModel", "utilService"];

  function apiProvider($q, $http, global, userModel, utilService) {
    var API = {
      OBJECTS: "/api/mobilapp/objects_v3.php",
      OBJECTS_SETTINGS: "/api/mobilapp/objects_settings.php",
      // DRIVER_BEHAVIOR: "/api/mobilapp/driver_behavior.php"
    };

    var service = {
      getObjects: getObjects,
      getObjectsSettings: getObjectsSettings,
      // Remove Driver Behavior (not delete!)
      // getDriverBehaviorOverview: getDriverBehaviorOverview,
      // getDriverBehaviorEventsData: getDriverBehaviorEventsData
    }

    return service;

    function getObjects() {
      var BASE_URL = global.debug ? global.debugUrl : global.baseUrl;
      var timezone = utilService.convertTZ('+ 0 hour');
      return $q.when(userModel.get()).then(function (_user) {
        if (!_user) {
          return [];
        }

        timezone = utilService.convertTZ(_user.timezone);
        user = JSON.parse(JSON.stringify(_user));
        user.timezone = "+ 0 hour";
        user = JSON.stringify(user);

        return $http.post(BASE_URL + API.OBJECTS, user);
      }).then(function (result) {
        objects = result.data;

        objects.forEach(function (object) {
          object.getTime = function () {
            return moment.tz(object.dt_tracker, 'UTC').utcOffset(timezone).format('LLLL');
          };
          object.getSpeed = function (units) {
            var result = object.speed + " km/h";
            if (units == "mph") {
              result = Math.round(object.speed * .621371) + " mph";
            } else if (units == "kn") {
              result = Math.round(object.speed * .539957) + " kn";
            }

            return result;
          }
        });

        return objects;
      });
    }

    function getObjectsSettings() {
      var BASE_URL = global.debug ? global.debugUrl : global.baseUrl;
      var timezone = utilService.convertTZ('+ 0 hour');
      return $q.when(userModel.get()).then(function (_user) {
        if (!_user) {
          return [];
        }

        timezone = utilService.convertTZ(_user.timezone);
        user = JSON.parse(JSON.stringify(_user));
        user.timezone = "+ 0 hour";
        user = JSON.stringify(user);

        return $http.post(BASE_URL + API.OBJECTS_SETTINGS, user);
      }).then(function (result) {
        return result.data;
      });
    }
    // Remove Driver Behavior (not delete!)
    // function getDriverBehaviorOverview() {
    //   var BASE_URL = global.debug ? global.debugUrl : global.baseUrl;
    //   var timezone = utilService.convertTZ('+ 0 hour');
    //   return $q.when(userModel.get()).then(function (_user) {
    //     if (!_user) {
    //       return [];
    //     }

    //     timezone = utilService.convertTZ(_user.timezone);
    //     user = JSON.parse(JSON.stringify(_user));
    //     user.timezone = "+ 0 hour";
    //     user['cmd'] = 'get_overview';
    //     user = JSON.stringify(user);

    //     return $http.post(BASE_URL + API.DRIVER_BEHAVIOR, user);
    //   }).then(function (result) {
    //     return result.data;
    //   });
    // }

    // function getDriverBehaviorEventsData() {
    //   var BASE_URL = global.debug ? global.debugUrl : global.baseUrl;
    //   var timezone = utilService.convertTZ('+ 0 hour');
    //   return $q.when(userModel.get()).then(function (_user) {
    //     if (!_user) {
    //       return [];
    //     }

    //     timezone = utilService.convertTZ(_user.timezone);
    //     user = JSON.parse(JSON.stringify(_user));
    //     user.timezone = "+ 0 hour";
    //     user['cmd'] = 'get_table';
    //     user = JSON.stringify(user);

    //     return $http.post(BASE_URL + API.DRIVER_BEHAVIOR, user);
    //   }).then(function (result) {
    //     return result.data;
    //   });
    // }
  }
}());
