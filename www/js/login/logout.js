(function () {
  angular.module("rewire.login").controller("logoutController", logoutController);

  logoutController.$inject = ["loginService", "$ionicPopup", "$translate"];

  function logoutController(loginService, $ionicPopup, $translate) {
    var vm = this;
    vm.logout = logout;


    /////////////////////
    function logout() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Tracking Platform',
        template: capitalizeFirstLetter(translations[$translate.use()]["WANT_TO_LOGOUT"]),
        cancelText: capitalizeFirstLetter(translations[$translate.use()]["CANCEL"]),
        okText: capitalizeFirstLetter(translations[$translate.use()]["OK"])
      });

      confirmPopup.then(function (res) {
        if (res) {
          loginService.logout();
        } else {

        }
      });
    }
  }

}())
