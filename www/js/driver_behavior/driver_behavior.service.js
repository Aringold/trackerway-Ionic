(function () {
  angular.module("rewire.driverBehavior").service("driverBehaviorService", driverBehaviorService);

  driverBehaviorService.$inject = ["$http", "global", "utilService", "$q", "apiProvider", "objectsModel"];

  function driverBehaviorService($http, global, utilService, $q, apiProvider, objectsModel) {
    var data = null;
    var overview = {
      vehicles: null,
      overspeed: null,
      idling: null,
      total: null,
      ratings: []
    };
    var _hasEvents = {overspeed: false, engidle: false};

    var UPDATE_INTERVAL = 5 * 1000;

    var interval = null;
    var isLoading = false;

    var ratings = ['', 'C', 'B', 'A', 'A<sup>+</sup>'];
    
    var service = {
      getOverview: getOverview,
      getData: getData,
      hasEvents: hasEvents,
      getRating: getRating,
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

    function getOverview() {
      return overview;
    }
  
    function getData() {
      return data;
    }

    function hasEvents() {
      return _hasEvents;
    }

    function getRating(imei) {
      var today = moment().format('D MMM, YYYY');
      if (
        data &&
        data.hasOwnProperty('ecoscore') &&
        data.ecoscore.hasOwnProperty('vehicles') && 
        data.ecoscore.vehicles.hasOwnProperty(imei) && 
        data.ecoscore.vehicles[imei].by_dates.hasOwnProperty(today) && 
        ratings.indexOf(data.ecoscore.vehicles[imei].by_dates[today].rating) >= 0
      ) {
        return ratings.indexOf(data.ecoscore.vehicles[imei].by_dates[today].rating);
      }

      return null;
    }

    function initService() {
      if (interval) {
        return;
      }

      interval = setInterval(function () {
        if (isLoading) {
          return;
        }

        isLoading = true;

        apiProvider.getDriverBehaviorOverview().then(function (result) {
          isLoading = false;

          _hasEvents = result.hasEvents;

          data = result;

          var today = moment().format('D MMM, YYYY');
          var rating = [0, 0, 0, 0];
          var overspeed = 0;
          var idling = 0;

          for (var imei in result.events.vehicles) {
            if (result.events.vehicles[imei].by_days.hasOwnProperty(today)) {
              overspeed += result.events.vehicles[imei].by_days[today].overspeed;
              idling += result.events.vehicles[imei].by_days[today].idling;
            }
          }

          for (var imei in result.ecoscore.vehicles) {
            if (result.ecoscore.vehicles[imei].by_dates.hasOwnProperty(today)) {
              switch (result.ecoscore.vehicles[imei].by_dates[today].rating) {
                case 'A<sup>+</sup>':
                  rating[0]++;
                  break;
                case 'A':
                  rating[1]++;
                  break;
                case 'B':
                  rating[2]++;
                  break;
                case 'C':
                  rating[3]++;
                  break;
              }
            }
          }

          overview = {
            vehicles: objectsModel.get().length,
            overspeed: overspeed,
            idling: idling,
            total: overspeed + idling,
            ratings: rating
          };
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
      data = null;
      overview = {
        vehicles: null,
        overspeed: null,
        idling: null,
        total: null,
        ratings: []
      };
      _hasEvents = {overspeed: false, engidle: false};
    }

    return service;
  }
}())
