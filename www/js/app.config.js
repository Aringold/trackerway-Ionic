(function () {

  /* TOASTR CONFIG */
  angular.module("starter").config(function (toastrConfig, $ionicConfigProvider) {
    angular.extend(toastrConfig, {
      containerId: "toast-container",
      timeOut: 2000,
      newestOnTop: true,
      tapToDismiss: true,
      positionClass: "toast-top-center",
      target: "body"
    });

    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text('');
  });

  /* ROUTER CONFIG */
  angular.module("starter").config(function ($stateProvider) {

    $stateProvider.state("login", {
      url: "/login",
      templateUrl: "js/login/login.html",
    });

    $stateProvider.state("register", {
      url: "/register",
      templateUrl: "js/login/register/register.html",
    });

    $stateProvider.state("home", {
      url: "/home",
      templateUrl: "js/home/home.html",
      preload: true,
      params: {openNestedPage: null}
    });

    $stateProvider.state("gdprAgreement", {
      url: "/gdpr_agreement",
      templateUrl: "js/gdpr_agreement/gdpr_agreement.html",
      preload: true
    })

    $stateProvider.state("about", {
      url: "/about",
      templateUrl: "js/about_us/about_us.html",
      preload: true
    });
    
    $stateProvider.state("map", {
      url: "/map",
      templateUrl: "js/map/map.html",
      preload: true
    });

    $stateProvider.state("setZone", {
			url: "/set_zone",
      templateUrl: "js/setZone/setZone.html",
      preload: true,
			params: {form: null}
    });

    $stateProvider.state("listFences", {
      url: "/listFences",
      templateUrl: "js/map/listFences/listFences.html",
      preload: true
    });

    $stateProvider.state("addFence", {
      url: "/addFence",
      templateUrl: "js/map/addFence/addFence.html",
      preload: true,
			params: {formData: null}
    });


    $stateProvider.state("objects", {
      url: "/objects",
      templateUrl: "js/objects/objects.html",
      preload: true
    });

    $stateProvider.state("addObject", {
      url: "/addObject",
      templateUrl: "js/objects/addObject/addObject.html",
      preload: true
    });

    $stateProvider.state("events", {
      url: "/events",
      templateUrl: "js/events/events.html",
      preload: true
    });

    $stateProvider.state("history", {
      url: "/history",
      templateUrl: "js/history/history.html",
      preload: true
    });

    $stateProvider.state("create-alert", {
      url: "/create-alert",
      templateUrl: "js/create-alert/create-alert.html",
      preload: true
    });

    $stateProvider.state("edit-alert", {
      url: "/edit-alert",
      templateUrl: "js/create-alert/create-alert.html",
      preload: true,
      params: {event: null}
    });

    $stateProvider.state("alerts", {
      url: "/alerts",
      templateUrl: "js/alerts/alerts.html",
      preload: true
    });

    $stateProvider.state("settings", {
      url: "/settings",
      templateUrl: "js/settings/settings.html",
      preload: true
    });

    $stateProvider.state("privacy", {
      url: "/privacy",
      templateUrl: "js/settings/privacy/privacy.html",
      preload: true
    });

    $stateProvider.state("trackerConfig", {
      url: "/trackerConfig",
      templateUrl: "js/trackerConfig/trackerConfig.html",
      preload: true
    });

    $stateProvider.state("liveTrackingSetup", {
      url: "/liveTrackingSetup",
      templateUrl: "js/trackerConfig/liveTrackingSetup/liveTrackingSetup.html",
      preload: true
    });

    $stateProvider.state("gprsCommand", {
      url: "/gprsCommand",
      templateUrl: "js/gprs_command/gprs_command.html",
      preload: true
    });

    $stateProvider.state("myAccount", {
      url: "/myAccount",
      templateUrl: "js/myAccount/myAccount.html",
      preload: true
    });

    $stateProvider.state("reports", {
      url: "/reports",
      templateUrl: "js/reports/reports.html",
      preload: true
    });

    $stateProvider.state("homepageCustomizer", {
      url: "/homepageCustomizer",
      templateUrl: "js/homepage_customizer/homepage_customizer.html",
      preload: true
    });

    // Remove Driver Behavior (not delete!)
    // $stateProvider.state("driver_behavior", {
    //   url: "/driver_behavior",
    //   templateUrl: "js/driver_behavior/driver_behavior.html",
    //   preload: true
    // });

    // $stateProvider.state("driver_behavior_events_data", {
    //   url: "/driver_behavior_events_data",
    //   templateUrl: "js/driver_behavior_events_data/driver_behavior_events_data.html",
    //   preload: true
    // });

    // $stateProvider.state("driver_behavior_vehicle_events_data", {
    //   url: "/driver_behavior_vehicle_events_data",
    //   templateUrl: "js/driver_behavior_events_data/driver_behavior_events_data.html",
    //   preload: true,
    //   params: {imei: null}
    // });
  });
}());
