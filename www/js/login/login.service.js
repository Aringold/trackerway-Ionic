(function () {
  angular.module("rewire.login").factory("loginService", loginService);

  loginService.$inject = ["global", "$state", "utilService", "$ionicHistory", "$http", "toastr", "$rootScope", "$translate", "userModel", "objectsModel",
  // Remove Driver Behavior (not delete!)
  // "driverBehaviorService", "driverBehaviorEventsDataService", 
  "homepageCustomizerService"];

  function loginService(global, $state, utilService, $ionicHistory, $http, toastr, $rootScope, $translate, userModel, objectsModel,
    // Remove Driver Behavior (not delete!)
    // driverBehaviorService, driverBehaviorEventsDataService, 
    homepageCustomizerService) {

    //hide navigation bar
    document.getElementsByTagName("ion-nav-bar")[0].style.visibility = "hidden";

    var service = {
      initialize: initialize,
      setBaseUrl: setBaseUrl,
      login: login,
      logout: logout
    }
    return service;

    ////////////////////////

    function logout() {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });

      //hide navigation bar
      document.getElementsByTagName("ion-nav-bar")[0].style.visibility = "hidden";

      if (ionic.Platform.isWebView()) {
        utilService.getItem("user", function (user) {
          user = JSON.parse(user);
          utilService.getItem("register_id", function (register_id) {
            var data = {
              register_id: register_id,
              user_id: user.id
            }

            utilService.delItem("userDetails", dummy);
            utilService.delItem("user", dummy);
            utilService.delItem("register_id", dummy);

          $http.patch(global.baseUrl + "/api/mobilapp/device.php", data).then(function (result) {
          });
          });
        });
      } else {
        utilService.delItem("userDetails", dummy);
        utilService.delItem("user", dummy);
        utilService.delItem("register_id", dummy);
      }

      userModel.clean();

      objectsModel.stopRefreshing();
      objectsModel.clean();
      // Remove Driver Behavior (not delete!)
      // driverBehaviorService.stopService();
      // driverBehaviorService.clean();

      // driverBehaviorEventsDataService.stopService();
      // driverBehaviorEventsDataService.clean();

      homepageCustomizerService.clean();

      homeScreenEventsListers['objectsModel.updated']();
      homeScreenEventsListers = {};
      
      $state.go("login");
    }

    function login(url, data, loginControllerCallback) {
      $http.post(url + "/api/mobilapp/login.php", data).then(function (res) {
        if (res.data && res.data.active == "true") {
          setBaseUrl(url);
          loginSuccess(res.data, data);
        } else {
          utilService.delItem("register_id", dummy);
          utilService.delItem("userDetails", dummy);
          utilService.delItem("user", dummy);
        }
        loginControllerCallback(res);
      }, function (res) {
        loginControllerCallback(res);
      });
    }

    function loginSuccess(user, data) {
      if (ionic.Platform.isWebView()) // using a device, not browser
        insertRegisterId(user);

      window.isSubuser = JSON.parse(user.privileges).type == "subuser";
      utilService.setItem("user", JSON.stringify(user));
      utilService.setItem("baseUrl", global.baseUrl);
      utilService.setItem("userDetails", data);
      userModel.set(user);
      objectsModel.initObjects();
      //driverBehaviorService.initService();
      homepageCustomizerService.init();

      $ionicHistory.nextViewOptions({
        disableBack: true
      });

      if (user.gdpr_agreement) {
        $state.go("home");
      } else {
        $state.go("gdprAgreement");
      }
      
      //show navigation bar
      setTimeout(function () {
        document.getElementsByTagName("ion-nav-bar")[0].style.visibility = "visible";
        $rootScope.inactive_object_count = parseInt(user.inactive_object_count);
        if (parseInt(user.inactive_object_count) > 0) {
          toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["EXPIRED_OBJECTS"]), {
            timeOut: 3000
          });
        }
      }, 500);
    }

    function insertRegisterId(user) {
      utilService.setupPush(function (register_id) { // setup push returns register_id
        var deviceRequest = {
          user_id: user.id,
          register_id: register_id,
          device_type: ionic.Platform.platform()
        }
        utilService.setItem("register_id", register_id);
        $http.post(global.baseUrl + "/api/mobilapp/device.php", deviceRequest).then(function (response) {
				}, function (error) {
				});
      });

    }

    function setBaseUrl(url) {
      global.baseUrl = global.debug ? global.debugUrl : url;
    }


    ////////// INITIALIZE ///////////
    function initialize() {
      setLoginBoxMoveUpwardsDistance();
      setLoginContainerHeightToViewport();
    }

    function setLoginContainerHeightToViewport() {
      // var loginContainer = document.getElementsByClassName("loginContainer")[0];
      // loginContainer.style.height = window.innerHeight + "px";
      // loginContainer.style.background = "url(img/login-background.jpg)";
      // loginContainer.style.backgroundSize = "100% 100%";
    }

    function setLoginBoxMoveUpwardsDistance() {
      var loginBox = document.getElementsByClassName("loginBox")[0];
      var distanceToTop = -loginBox.getBoundingClientRect().top + 30;
      var style = document.createElement("style");
      style.innerHTML = "body.keyboard-open .loginLogo { -webkit-transform: translateY(" + distanceToTop + "px);} " + "body.keyboard-open .loginBox { -webkit-transform: translateY(" + distanceToTop + "px);}";
      document.body.appendChild(style);
    }
  }

}());
