(function () {
  angular.module("rewire.driverBehavior").service("driverBehaviorEventsDataService", driverBehaviorEventsDataService);

  driverBehaviorEventsDataService.$inject = ["$http", "global", "utilService", "$q", "apiProvider", "objectsModel"];

  function driverBehaviorEventsDataService($http, global, utilService, $q, apiProvider, objectsModel) {
    var table = [];
    var _hasEvents = {overspeed: false, engidle: false};

    var UPDATE_INTERVAL = 5 * 1000;

    var interval = null;
    var isLoading = false;

    var ratings = ['', 'C', 'B', 'A', 'A<sup>+</sup>'];
    
    var service = {
      getTable: getTable,
      hasEvents: hasEvents,
      initService: initService,
      stopService: stopService,
      clean: clean,
      initTimer: initTimer
    };

    function initTimer() {
      utilService.getItem("receiveUpdates", function (time) {
        console.debug(time);
        UPDATE_INTERVAL = time * 1000 || UPDATE_INTERVAL;
  
        if (interval) {
          clearInterval(interval);
  
          interval = null;
          initService();
        }
      });  
    }

    function getTable() {
      return table;
    }

    function hasEvents() {
      return _hasEvents;
    }

    function initService() {
      console.log('UPDATE_INTERVAL', UPDATE_INTERVAL);

      if (interval) {
        return;
      }

      interval = setInterval(function () {
        if (isLoading) {
          return;
        }

        isLoading = true;

        apiProvider.getDriverBehaviorEventsData().then(function (result) {
          isLoading = false;
        
          _hasEvents = result.hasEvents;
          var _table = [];  

          for (let i in result.table) {
            var row = result.table[i];

            var ratingIndex = ratings.indexOf(row[2]);
            var object = objectsModel.get(row[0]);

            _table.push({
              imei: object && object.imei ? object.imei : '',
              name: row[0],
              date: row[1],
              rating: ratingIndex >= 0 ? ratingIndex : 0,
              ecoscore: row[3],
              overspeed: row[4],
              idling: row[5],
              total: row[4] + row[5]
            });
          }

          table = _table;
        });
      }, UPDATE_INTERVAL);
    }

    function stopService() {
      if (interval) {
        clearInterval(interval);
      }
      interval = null;
      isLoading = false;
    }

    function clean() {
      table = [];
      _hasEvents = {overspeed: false, engidle: false};
    }

    initTimer();

    return service;
  }
}())
