(function () {
  angular.module("rewire.settings").service("settingsService", settingsService);

  settingsService.$inject = ["$http", "global", "utilService", "$filter", "$translate"];

  function settingsService($http, global, utilService, $filter, $translate) {
    var menu = {
      map: true,
      devices: true,
      history: true,
      alerts: true,
      reports: true,
      my_account: false,
      notifications: false,
      homepage_customizer: false,
      settings: false,
      // Remove Driver Behavior (not delete!)
      // driver_behavior: false,
      zones: false,
      gprs: false,
      about: false,
      more: true
    };
    var _menu = {};

    var menuItems = {
      map: {
        route: 'gotoMap',
        icon: 'icon',
        class: 'ion-map',
        src: '',
        src_inactive: '',
        title: "MAP"
      },
      devices: {
        route: 'openObjects',
        icon: 'icon',
        class: 'ion-location',
        src: '',
        src_inactive: '',
        title: "DEVICES"
      },
      history: {
        route: 'openHistory',
        icon: 'icon',
        class: 'ion-calendar',
        src: '',
        src_inactive: '',
        title: "HISTORY"
      },
      alerts: {
        route: 'gotoAlerts',
        icon: 'img',
        class: 'svg replace',
        src: 'img/newevent_blue.svg',
        src_inactive: 'img/newevent_gray.svg',
        title: "ALERTS"
      },
      reports: {
        route: 'openReports',
        icon: 'img',
        class: 'svg',
        src: 'img/report.svg',
        src_inactive: 'img/report_gray.svg',
        title: "REPORTS"
      },
      my_account: {
        route: 'openMyAccount',
        icon: 'icon',
        class: 'ion-person',
        src: '',
        src_inactive: '',
        title: "MY_ACCOUNT"
      },
      notifications: {
        route: 'openNotifications',
        icon: 'icon',
        class: 'ion-clipboard',
        src: '',
        src_inactive: '',
        title: "NOTIFICATIONS"
      },
      homepage_customizer: {
        route: 'openHomepageCustomizer',
        icon: 'icon',
        class: 'ion-settings',
        src: '',
        src_inactive: '',
        title: "HOMEPAGE_CUSTOMIZER"
      },
      settings: {
        route: 'openSettings',
        icon: 'icon',
        class: 'ion-settings',
        src: '',
        src_inactive: '',
        title: "SETTINGS"
      },
      // driver_behavior: {
      //   route: 'openDriverBehavior',
      //   icon: 'img',
      //   class: 'svg',
      //   src: 'img/movement.svg',
      //   src_inactive: 'img/movement_gray.svg',
      //   title: "DRIVER_BEHAVIOR"
      // },
      zones: {
        route: 'openListFences',
        icon: 'img',
        class: 'svg',
        src: 'img/zones_red.svg',
        src_inactive: 'img/zones_gray.svg',
        title: "ZONES"
      },
      gprs: {
        route: 'openGprs',
        icon: 'img',
        class: 'svg',
        src: 'img/cmd.svg',
        src_inactive: 'img/cmd_gray.svg',
        title: "GPRS_COMMAND_SCREEN"
      },
      about: {
        route: 'openAbout',
        icon: 'img',
        class: 'svg',
        src: 'img/app.svg',
        src_inactive: 'img/app_gray.svg',
        title: "About app" 
      },
      more: {
        route: 'toggleLeftMenu',
        icon: 'icon',
        class: 'ion-more',
        src: '',
        src_inactive: '',
        title: "MORE_MENU"
      }
    };

    var service = {
      getSendNotification: getSendNotification,
      setSendNotification: setSendNotification,
      setShowZones: setShowZones,
      getShowZones: getShowZones,
      setShowMarkers: setShowMarkers,
      getShowMarkers: getShowMarkers,
      setShowArrows: setShowArrows,
      getShowArrows: getShowArrows,
      setShowTail: setShowTail,
      getShowTail: getShowTail,
      initMenu: initMenu,
      saveMenu: saveMenu,
      getFullMenu: getFullMenu,
      getHomeMenu: getHomeMenu,
      getSideMenu: getSideMenu,
      setLanguageApp: setLanguageApp
    };
    return service;


    //////////////////////////////////////////
    function setShowTail(val) {
      utilService.setItem("showTail", "" + val);
    }

    function getShowTail(callback) {
      utilService.getItem("showTail", function (showTail) {
        if (showTail == null) showTail = "true";
        callback(showTail == "true");
      });
    }

    function setShowArrows(val) {
      utilService.setItem("showArrows", "" + val);
    }

    function getShowArrows(callback) {
      utilService.getItem("showArrows", function (showArrows) {
        if (showArrows == null) showArrows = "true";
        callback(showArrows == "true");
      });
    }

    function setShowZones(val) {
      utilService.setItem("showZones", "" + val);
    }

    function getShowZones(callback) {
      utilService.getItem("showZones", function (showZones) {
        if (showZones == null) showZones = "true";
        callback(showZones == "true");
      });
    }

    function setShowMarkers(val) {
      utilService.setItem("showMarkers", "" + val);
    }

    function getShowMarkers(callback) {
      utilService.getItem("showMarkers", function (showMarkers) {
        if (showMarkers == null) showMarkers = "true";
        callback(showMarkers == "true");
      });
    }

    function getSendNotification(callback) {
      utilService.getItem("register_id", function (res) {
        var data = {
          cmd: 'getSendNotification',
          register_id: res
        }
        $http.post(global.baseUrl + "/api/mobilapp/notification_settings.php", data).then(function (res) {
          callback(res.data);
        });
      });
    }

    function setSendNotification(send_notification) {
      utilService.getItem("register_id", function (res) {
        var data = {
          cmd: 'setSendNotification',
          send_notification: send_notification ? 1 : 0,
          register_id: res
        };
        $http.post(global.baseUrl + "/api/mobilapp/notification_settings.php", data).then(function (res) {
        });
      });
    }

    function initMenu() {
      utilService.getItem("menu", function (res) {
        if (res) {
          // Remove Driver Behavior (not delete!)
          // _menu = JSON.parse(res);
          var tmpResult = JSON.parse(res);
          updateMenu(tmpResult)
          delete tmpResult.driver_behavior;
          _menu = tmpResult;
        } else {
          _menu = menu;
          utilService.setItem("menu", JSON.stringify(menu));
        }
      });
    }

    function updateMenu(tmpResult) {
      for(let i  in menu) {
        if(!tmpResult.hasOwnProperty(i)) {
          utilService.setItem("menu", JSON.stringify(menu));
        }
      }
      
    }

    function saveMenu(newmenu) {
      var shortmenu = {};
      for (var i in newmenu) {
        shortmenu[newmenu[i].name] = newmenu[i].showOnHome;
      }
      _menu = shortmenu;
      utilService.setItem("menu", JSON.stringify(shortmenu));
    }

    function getFullMenu() {
      var result = [];

      for (var item in _menu) {
        var _item = angular.copy(menuItems[item]);
        _item.showOnHome = _menu[item];
        _item.name = item;
        result.push(_item);
      }

      return result;
    }

    function getHomeMenu() {
      var result = [];

      for (var item in _menu) {
        if (!_menu[item]) {
          continue;
        }

        result.push(menuItems[item]);
      }

      return result;
    }

    function getSideMenu() {
      var result = [];

      for (var item in _menu) {
        if (_menu[item]) {
          continue;
        }
        result.push(menuItems[item]);
      }

      return result;
    }

    function setLanguageApp(language) {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var lang = {
          cmd: 'saveAppLanguage',
          user_id: user.id,
          language: language[0].toLowerCase() + language.slice(1)
        };
        $http.post(global.baseUrl + "/api/mobilapp/user_settings.php", lang).then(
          function(result) { }
        );
      });
    }
  }

}())
