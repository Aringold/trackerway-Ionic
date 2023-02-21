isObjectsLoading = false;
objectsLoadedTime = null;

(function () {
  angular.module("starter").factory("objectsModel", objectsModel);

  objectsModel.$inject = ["$q", "apiProvider", "$rootScope", "utilService"];

  function objectsModel($q, apiProvider, $rootScope, utilService) {
    var UPDATE_INTERVAL = 5 * 1000;
    var objectsOrder = [];

    utilService.getItem("objectsOrder", function (result) {
      if (!result) {
        return;
      }

      objectsOrder = JSON.parse(result);
    });

    var interval = null;

    var objects = [];

    var service = {
      set: set,
      get: get,
      clean: clean,
      orderObjects: orderObjects,
      stopRefreshing: stopRefreshing,
      initObjects: initObjects,
      initTimer: initTimer
    }

    initTimer();

    return service;

    function initTimer() {
      utilService.getItem("receiveUpdates", function (time) {
        console.debug(time);
        UPDATE_INTERVAL = time * 1000 || UPDATE_INTERVAL;
  
        if (interval) {
          clearInterval(interval);
  
          interval = null;
          initObjects();
        }
      });  
    }

    function set(name, value) {
      if (typeof name !== "string") {
        value = name;
        name = false;
      }

      if (name) {
        var object = objects.find(function (element) {
          return element.name == name || element.imei == name;
        });

        if (!object) {
          return false;
        }

        object = value;
      } else {
        objects = value;
      }

      $rootScope.$broadcast('objectsModel.updated');
      $rootScope.$broadcast('objectsSettings.reload');

			return value;
    }

    function get(name) {
      var diff = moment.duration(moment().diff(moment(objectsLoadedTime))).asHours();
      if (diff > 2) {
        objects = [];
      }

      if (typeof name !== "string") {
        return objects;
      }

      var object = objects.find(function (element) {
        return element.name == name || element.imei == name;
      });

      if (!object) {
        return false;
      }

      return objects;
    }

    function clean(name) {
      if (typeof name !== "string") {
        objects = [];
      }

      return;
    }

    function orderObjects(objects, _objectsOrder) {
      utilService.getItem("objectsOrder", function (result) {
        if (!result) {
          return;
        }
  
        objectsOrder = JSON.parse(result);
      });

      if (!_objectsOrder) {
        _objectsOrder = objectsOrder;
      }

      var result = [];
      var newOrder = [].concat(_objectsOrder);

      for (var i = newOrder.length - 1; i >= 0; i--) {
        var imei = newOrder[i];
        var object = objects.find(function (_object) {
          return _object.imei === imei;
        });

        if (!object) {
          newOrder.splice(i, 1);
        }        
      }

      for (var index in objects) {
        var object = objects[index];
        if (newOrder.indexOf(object.imei) === -1) {
          newOrder.push(object.imei);
        }
      }

      for (var index in newOrder) {
        var imei = newOrder[index];
        var object = objects.find(function (object) {
          return object.imei === imei;
        });

        if (!object) {
          continue;
        }

        result.push(object);
      }

      utilService.setItem("objectsOrder", JSON.stringify(newOrder));

      return result;
    }
    
    function stopRefreshing() {
      if (interval) {
        clearInterval(interval);
      }
      interval = null;
      isObjectsLoading = false;
    }

    function initObjects() {
      console.log('UPDATE_INTERVAL', UPDATE_INTERVAL);
      
      if (interval) {
        return;
      }

      _loadObjects();

      interval = setInterval(function () {
        if (isObjectsLoading) {
          return;
        }

        return _loadObjects();
      }, UPDATE_INTERVAL);
    }

    function _loadObjects() {
      if ($rootScope.paused) return;

      isObjectsLoading = true;

      return apiProvider.getObjects().then(function (result) {
        isObjectsLoading = false;
        objectsLoadedTime = new Date();
        return set(orderObjects(result));
      });
    }
  }
}());
