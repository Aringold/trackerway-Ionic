(function () {
  angular.module("rewire.events").service("createAlertService", createAlertService);

  createAlertService.$inject = ["utilService", "$http", "global", "$q"];

  function createAlertService(utilService, $http, global, $q) {
    var service = {
      saveEvent: saveEvent
    };

    function saveEvent(event) {
      var defer = $q.defer();
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);

        var cmd = 'create';
        if (event && event.hasOwnProperty('event_id')) {
          cmd = 'update'
        }

        var request = {
          alert: event.eventType,
          cmd: cmd,
          user_id: user.id,
          event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
          imei: event.objects.map(function (object) {
            return object.imei;
          }).join(','),
          event_name: event.name,
          active: event.isActive ? 'true' : 'false',
          system_alert: event.system_alert ? "true,true,true,alarm1.mp3" : "false,false,false,alarm1.mp3",
          alert_by_email: event.alert_to_email ? "true" : "false",
          alert_on_emails: event.emails.join(','),
          alert_by_sms: event.alert_to_sms ? "true" : "false",
          alert_on_phones: event.phones.join(','),
          duration: 0
        };

        if (event.eventType == 'SPEEDING_ALERT') {
          request.speedParam = event.speed_limit;
        }
        if (event.eventType == 'ZONE_IN_ALERT' || event.eventType == 'ZONE_IN_OUT_ALERT') {
          request.zones = event.zones.map(function (zone) {
            return zone.id;
          }).join(',');
        }
        if (event.hasOwnProperty('checked_value') && event.checked_value) {
          request.checked_value = event.checked_value;
        }

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
          if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
            event.event_id = response.data;
          }

          defer.resolve(event);
        });
      });

      return defer.promise;
    }

    return service;
  }
}())
