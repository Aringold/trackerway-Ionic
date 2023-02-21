(function () {
  angular.module("rewire.homepageCustomizer").service("homepageCustomizerService", homepageCustomizerService);

  homepageCustomizerService.$inject = ["$http", "global", "utilService", "$q", "objectsModel", "userModel", "apiProvider", "$rootScope"];

  function homepageCustomizerService($http, global, utilService, $q, objectsModel, userModel, apiProvider, $rootScope) {
    var listeners = {};
    var settingsLoaded = false;

    var settings = {
      "status": {
        visible: true,
        editable: false
      },
      "since": {
        visible: true,
        editable: false
      },
      "battery": {
        visible: false,
        editable: true
      },
      "ignition": {
        visible: true,
        editable: true
      },
      "start_at": {
        visible: true,
        editable: true
      },
      "length": {
        visible: false,
        editable: true
      },
      "address": {
        visible: true,
        editable: true
      },
      "rating": {
        visible: false,
        editable: true
      }
    };

    var isInitialized = false;

    var objectsSettings = {};

    var service = {
      get: get,
      set: set,
      init: init,
      clean: clean
    };

    return service;

    function get() {
      return objectsSettings;
    }

    function set(value) {
      utilService.hasHotfix('homepage_settings_2020_08_27').then(function (hasHotfix) {
        if (hasHotfix) {
          return value;
        }

        for (var imei in value) {
          value[imei].sensors.rating.visible = false;
        }

        return value;
      }).then(function (value) {
        objectsSettings = value;

        utilService.setItem("homepage_settings", JSON.stringify(value), function (result) {});
      });
    }

    function init() {
      if (isInitialized) {
        return;
      }

      utilService.getItem("homepage_settings", function (homepage_settings) {
        if (homepage_settings) {
          objectsSettings = JSON.parse(homepage_settings);
        }
      });

      _initEventsListeners();

      isInitialized = true;
    }

    function _initEventsListeners() {
      if (listeners.hasOwnProperty('objectsSettings.reload')) {
        return;
      }

      listeners['objectsSettings.reload'] = $rootScope.$on('objectsSettings.reload', function (event, isForceReload) {
        if (!isForceReload) {
          isForceReload = false;
        }

        if (settingsLoaded && !isForceReload) {
          return;
        }

        bulkPromises = {};

        bulkPromises['objects'] = $q.when(objectsModel.get());

        bulkPromises['settings'] = apiProvider.getObjectsSettings();

        $q.all(bulkPromises).then(function (result) {
          var _tmp = {};
          var customSettings = {};
          for (var index in result['objects']) {
            var imei = result['objects'][index].imei;
            var name = result['objects'][index].name;

            var _sensors = JSON.parse(JSON.stringify(settings));

            if (!result['settings'].hasOwnProperty(imei) || !angular.isObject(result['settings'][imei].sensors) || angular.isArray(result['settings'][imei].sensors)) {
              customSettings[imei] = {
                imei: imei,
                name: name,
                sensors: _sensors
              };

              continue;
            }

            var params = result['objects'][index].params;
            var sensors =  result['settings'][imei].sensors;

            _tmp[imei] = {
              imei: imei,
              name: name,
              sensors: sensors,
              params: params,
              visible: false,
              editable: true
            };

            for (let id in sensors) {
              var sensorName = sensors[id].name;
              _sensors[sensorName] = {
                visible: false,
                editable: true,
                data: sensors[id]
              };
            }

            customSettings[imei] = {
              imei: imei,
              name: name,
              sensors: _sensors
            };
          }

          for (var imei in customSettings) {
            if (!objectsSettings.hasOwnProperty(imei)) {
              objectsSettings[imei] = customSettings[imei];
              continue;
            }

            for (var sensorName in customSettings[imei].sensors) {
              if (!objectsSettings[imei].sensors.hasOwnProperty(sensorName)) {
                objectsSettings[imei].sensors[sensorName] = customSettings[imei].sensors[sensorName];
              }
            }
            for (var sensorName in objectsSettings[imei].sensors) {
              if (!customSettings[imei].sensors.hasOwnProperty(sensorName)) {
                delete objectsSettings[imei].sensors[sensorName];
              }
            }
          }

          set(objectsSettings);
          settingsLoaded = true;
        }, function (error) {
        });
      });
    }

    function clean() {
      objectsSettings = {};
      utilService.setItem("homepage_settings", JSON.stringify(objectsSettings), function (result) {});
      isInitialized = false;
      settingsLoaded = false;

      for (let event in listeners) {
        listeners[event]();
      }
      listeners = {};
    }
  }
}())
