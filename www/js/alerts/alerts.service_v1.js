(function () {
  angular.module("rewire.events").service("alertsService", alertsService);

  alertsService.$inject = ["utilService", "$http", "global"];

  function alertsService(utilService, $http, global) {
    var service = {
      getUserEvents: getUserEvents,
      setMovementAlert: setMovementAlert,
      setSpeedingAlert: setSpeedingAlert,
      setLowBatteryAlert: setLowBatteryAlert,
      setWakeAlert: setWakeAlert,
      setSosAlert: setSosAlert,
      setIgnitionAlert: setIgnitionAlert,
      setTowAlert: setTowAlert,
      setShakeAlert: setShakeAlert,
      setChargingOnAlert: setChargingOnAlert,
      setChargingOffAlert: setChargingOffAlert,
      setPowerOnAlert: setPowerOnAlert,
      setPowerOffAlert: setPowerOffAlert

    }
    return service;

    ////////////////////////////////////////

    function setChargingOnAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'CHARGING_ON_ALERT',
          cmd: object.chargingOnAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };
        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setChargingOffAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'CHARGING_OFF_ALERT',
          cmd: object.chargingOffAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };
        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setPowerOnAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'POWER_ON_ALERT',
          cmd: object.powerOnAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };
        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setPowerOffAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'POWER_OFF_ALERT',
          cmd: object.powerOffAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };
        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setTowAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'TOW_ALERT',
          cmd: object.towAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setShakeAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'SHAKE_ALERT',
          cmd: object.shakeAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setIgnitionAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'IGNITION_ALERT',
          cmd: object.ignitionAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setSosAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'SOS_ALERT',
          cmd: object.sosAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setWakeAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'WAKE_ALERT',
          cmd: object.wakeAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setLowBatteryAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'LOW_BATTERY_ALERT',
          cmd: object.lowBatteryAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function getUserEvents(callback) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          cmd: "GET_USER_EVENTS",
          user_id: user.id,
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
          callback(response.data);
        });
      });
    }

    function setSpeedingAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'SPEEDING_ALERT',
          cmd: object.speedingAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name,
          speedParam: object.speedParam
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

    function setMovementAlert(object) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          alert: 'MOVEMENT_ALERT',
          cmd: object.movementAlert ? "create" : 'delete',
          user_id: user.id,
          imei: object.imei,
          object_name: object.name
        };

        $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
        });
      });
    }

  }


}())
