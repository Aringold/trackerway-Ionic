(function () {
  angular.module("rewire.trackerConfig").controller("liveTrackingSetupController", liveTrackingSetupController);

  liveTrackingSetupController.$inject = ["$scope", "trackerConfigService"];

  function liveTrackingSetupController($scope, trackerConfigService) {
    var vm = this;
    vm.object;
    vm.type;

    vm.turnWebTrackingOn = turnWebTrackingOn;

    var smsOptions = {
      replaceLineBreaks: false,
      android: {
        intent: 'INTENT'
      }
    };

    var success = function () {
      // alert('Message sent successfully');
    };
    var error = function (e) {
      // alert('Message Failed:' + e);
    };

    getSelectedObjectAndType();

    /////////////////////////////////
    function turnWebTrackingOn() {
      sms.send("123321", "testsms", smsOptions, success, error);
    }

    function getSelectedObjectAndType() {
      vm.object = trackerConfigService.getSelectedObject();
      vm.type = trackerConfigService.getSelectedType();
    }
  }

}())
