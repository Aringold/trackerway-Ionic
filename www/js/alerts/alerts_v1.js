(function () {
  angular.module("rewire.events").controller("alertsController", alertsController);

  alertsController.$inject = ["$scope", "$http", "utilService", "global", "$timeout", "$ionicPopup", "homeService", "alertsService"];

  function alertsController($scope, $http, utilService, global, $timeout, $ionicPopup, homeService, alertsService) {
    var vm = this;
    vm.working = true;
    vm.objects = [];

    vm.speedingAlert = speedingAlert;
    vm.movementAlert = movementAlert;
    vm.lowBatteryAlert = lowBatteryAlert;
    vm.wakeAlert = wakeAlert;
    vm.sosAlert = sosAlert;
    vm.ignitionAlert = ignitionAlert;
    vm.towAlert = towAlert;
    vm.shakeAlert = shakeAlert;
    vm.powerOnAlert = powerOnAlert;
    vm.powerOffAlert = powerOffAlert;
    vm.chargingOnAlert = chargingOnAlert;
    vm.chargingOffAlert = chargingOffAlert;

    getObjects();

    ///////////////////////////////////////////////////////////
    function powerOnAlert(object, $event) {
      alertsService.setPowerOnAlert(object);
    }

    function powerOffAlert(object, $event) {
      alertsService.setPowerOffAlert(object);
    }

    function chargingOnAlert(object, $event) {
      alertsService.setChargingOnAlert(object);
    }

    function chargingOffAlert(object, $event) {
      alertsService.setChargingOffAlert(object);
    }

    function towAlert(object, $event) {
      alertsService.setTowAlert(object);
    }

    function shakeAlert(object, $event) {
      alertsService.setShakeAlert(object);
    }

    function ignitionAlert(object, $event) {
      alertsService.setIgnitionAlert(object);
    }

    function sosAlert(object, $event) {
      alertsService.setSosAlert(object);
    }

    function wakeAlert(object, $event) {
      alertsService.setWakeAlert(object);
    }

    function lowBatteryAlert(object, $event) {
      alertsService.setLowBatteryAlert(object);
    }

    function speedingAlert(object, $event) {
      if (object.speedingAlert) {
        object.speedingAlert = false;
        $ionicPopup.prompt({
          title: 'Speeding Alert',
          template: 'Speed limit (mph)',
          inputType: 'text',
          inputPlaceholder: '',
          defaultText: '60'
        }).then(function (res) {
          if (res) {
            object.speedingAlert = true;
            object.speedParam = res;
            alertsService.setSpeedingAlert(object);
          }
        });
      } else {
        alertsService.setSpeedingAlert(object);
      }


    }

    function movementAlert(object, $event) {
      alertsService.setMovementAlert(object);
    }

    function getUserEvents() {
      alertsService.getUserEvents(function (res) {
        vm.objects.forEach(function (object) {
          res.forEach(function (event) {
            if (event.name == "Movement Alert " + object.name) object.movementAlert = true;
            if (event.name == "Speeding Alert " + object.name) object.speedingAlert = true;
            if (event.name == "Low Battery " + object.name) object.lowBatteryAlert = true;
            if (event.name == "Wake Alert " + object.name) object.wakeAlert = true;
            if (event.name == "SOS Alert " + object.name) object.sosAlert = true;
            if (event.name == "Ignition Alert " + object.name) object.ignitionAlert = true;
            if (event.name == "Tow Alert " + object.name) object.towAlert = true;
            if (event.name == "Shake Alert " + object.name) object.shakeAlert = true;
            if (event.name == "Charging On Alert " + object.name) object.chargingOnAlert = true;
            if (event.name == "Charging Off Alert " + object.name) object.chargingOffAlert = true;
            if (event.name == "Power On Alert " + object.name) object.powerOnAlert = true;
            if (event.name == "Power Off Alert " + object.name) object.powerOffAlert = true;
          });
        });
      });

    }

    function getObjects() {
      $timeout(function () {
        homeService.getUserObjects(function (objects) {
          vm.objects = objects;
          vm.working = false;
          getUserEvents();
        });
      }, 200);
    }
  }

}())
