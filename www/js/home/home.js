var stateEventRegistered;
var refreshInterval;
var homeScreenEventsListers = {};

(function () {
  angular.module("rewire.home", ['rewire.settings']);
  angular.module("rewire.home").controller("homeController", homeController);

  homeController.$inject = ["$q", "$state", "homeService", "$scope", "$timeout", "utilService", "$rootScope", "global", "toastr", "$translate", "$filter", "$ionicSideMenuDelegate", "$stateParams", "$ionicHistory", "homepageCustomizerService", "objectsModel", "userModel",
  // Remove Driver Behavior (not delete!)
  // "driverBehaviorService",
  "settingsService"];

  function homeController($q, $state, homeService, $scope, $timeout, utilService, $rootScope, global, toastr, $translate, $filter, $ionicSideMenuDelegate, $stateParams, $ionicHistory, homepageCustomizerService, objectsModel, userModel,
    // Remove Driver Behavior (not delete!)
    // driverBehaviorService,
    settingsService) {
    var isDriverBehaviorFetching = false;

    var vm = this;
    var gage;

    var timezone = '+0000';

    utilService.getItem("user", function (user) {
      user = JSON.parse(user);
      if (user) {
        timezone = utilService.convertTZ(user.timezone);
      }
    });

    vm.demo = false;
    vm.currentIndex = 0;
    
    vm.showBattery = false;
    vm.showIgnition = false;
    vm.showAddress = false;

    vm.objects = objectsModel.get();
    vm._objects = objectsModel.get();

    vm.menu = settingsService.getHomeMenu;

    vm.homepageSettings = homepageCustomizerService.get();

    vm.currentObject = {};
    
    vm.loading = vm.objects.length ? false : true;
    vm.disconnected = vm.objects.status == -1;

    vm.progressPercent = 0;
    vm.isSubuser = window.isSubuser;
    vm.statusImageUrl = "";

    vm.gotoAlerts = gotoAlerts;
    vm.gotoMap = gotoMap;
    vm.gotoMapOneObject = gotoMapOneObject;

    vm.objectBack = objectBack;
    vm.objectForward = objectForward;
    vm.init = init;

    vm.toggleLeftMenu = toggleLeftMenu;
    vm.openGprs = openGprs;
    vm.openMyAccount = openMyAccount;
    vm.openListFences = openListFences;
    vm.openHomepageCustomizer = openHomepageCustomizer;
    // vm.openDriverBehavior = openDriverBehavior;
    vm.openNotifications = openNotifications;
    vm.openGprs = openGprs;
    vm.openSettings = openSettings;
    vm.openHistory = openHistory;
    vm.openObjects = openObjects;
    vm.openReports = openReports;
    vm.isSensorVisible = isSensorVisible;
    vm.getObjectRating = getObjectRating;
    vm.openAbout = openAbout;
    vm.customSensors = [];

    _initEventsListeners();
    _checkUserLanguage();

    vm.objFilter = '';
    if ($stateParams.openNestedPage && vm.hasOwnProperty($stateParams.openNestedPage)) {
      var nextPage = $stateParams.openNestedPage;
      $stateParams.openNestedPage = null;
      $ionicHistory.viewHistory().currentView.stateParams.openNestedPage = null;
      vm[nextPage]();
    }
    var oldSoftBack = $rootScope.$ionicGoBack;
    $rootScope.$ionicGoBack = function () {
      if ($ionicHistory.backTitle().indexOf('title-logo.png') > 0) {
        $ionicHistory.viewHistory().backView.stateId = "home";
        $rootScope.$ionicGoBack = oldSoftBack;
        $ionicHistory.goBack();
      } else {
        $rootScope.$ionicGoBack = oldSoftBack;
        $rootScope.$ionicGoBack();
      }
    };

    lockOrientation();
    replaceSvg();
    checkIfDemo();

    function _checkUserLanguage() {
      setInterval(function() {
        if ($rootScope.paused) {
          return;
        }
        homeService.checkUserLangauge();
      }, 900000);
    }

    function _initEventsListeners() {
      if (homeScreenEventsListers.hasOwnProperty('objectsModel.updated')) {
        return;
      }

      homeScreenEventsListers['objectsModel.updated'] = $rootScope.$on('objectsModel.updated', function () {
        vm.loading = false;

        vm.homepageSettings = homepageCustomizerService.get();
        $q.when(objectsModel.get()).then(function (objects) {
          objects.forEach(function (object, index) {
            var oldObject = vm.objects.find(function (_object) {
              return _object.imei == object.imei;
            });
            if (oldObject && oldObject.hasOwnProperty('address')) {
              object.address = oldObject.address;
            }

            if (vm.currentIndex == index) {
              homeService.getAddress(object, function (res) {
                object.address = res;
              });
            }

            if (object.hasOwnProperty('driving_today_start') && object.driving_today_start) {
              object.driving_start = moment(object.driving_today_start + '+0000').utcOffset(timezone).format('HH:mm:ss');
            }
            if (object.hasOwnProperty('driving_today_length') && object.driving_today_length) {
              utilService.getItem("speedDisplay", function (speedDisplay) {
                var speed = 0;

                if (!speedDisplay) {
                  speedDisplay = "kph";
                  utilService.setItem("speedDisplay", "kph");
                }

                if (speedDisplay == "kph") {
                  object.driving_length = Number(object.driving_today_length).toFixed(2) + ' km';
                } else if (speedDisplay == "mph") {
                  object.driving_length = (Number(object.driving_today_length) * .621371).toFixed(2) + ' mi';
                } else if (speedDisplay == "kn") {
                  object.driving_length = (Number(object.driving_today_length) * .539957).toFixed(2) + ' nmi';
                }
              });
            }
          });

          vm.disconnected = objects.status == -1;

          if (objects.length > 0) {
            for (var i = 0; i < objects.length; i++) {
              if (objects[i].params != "" && typeof objects[i].params === "string") {
                objects[i].params = JSON.parse(objects[i].params);
              }
            }

            vm._objects = objects;
            vm.objects = $filter('filter')(vm._objects, {name: vm.objFilter});

            setObject(vm.currentIndex);
            if (!$scope.$$phase) {
              $scope.$digest();
            }
          }
        });
      });

      isHomeScreenEventsListerInitialized = true;
    }

    function init() {
      if (!stateEventRegistered) {
        stateEventRegistered = true;
        $rootScope.$on('$stateChangeStart',
          function (event, toState, toParams, fromState, fromParams) {
            if (fromState.name == "home") {
              clearInterval(refreshInterval);
              refreshInterval = null;
            }
          });
      }

      $timeout(function () {
        initGauge(0);
        document.getElementsByTagName("ion-nav-bar")[0].style.visibility = "visible";
      }, 1);

      $scope.$on("$ionicView.afterLeave", function (event, args) {
        vm.loading = true;
      });

      $scope.$on('$ionicView.leave', function() {
        for (var event in homeScreenEventsListers) {
          if (typeof homeScreenEventsListers[event] === 'funtion') {
            homeScreenEventsListers[event]();
          }
          
          delete homeScreenEventsListers[event];
        }

        //driverBehaviorService.stopService();
      });

      $timeout(function () {
        //getUserObjects();
        //startRefreshObjects();
        if (navigator.splashscreen) {
          navigator.splashscreen.hide();
        }
      }, 1);

      if (!refreshInterval) {
        refreshInterval = setInterval(function () {
        }, 5000);
      }

      $scope.$watch(function () {
        return vm.objFilter;
      }, function (value) {
        vm.objects = $filter('filter')(vm._objects, {name: value});
        vm.currentIndex = 0;
        setObject();
      });
    }

    function toggleLeftMenu() {
      $ionicSideMenuDelegate.toggleLeft();
    }

    function lockOrientation() {
      if (ionic.Platform.isWebView()) {
        screen.orientation.lock('portrait');
      }
    }

    function checkIfDemo() {
      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        if (!user) {
          return;
        }
        vm.demo = user.username.indexOf("demo") !== -1;
      });
    }

    function gotoAlerts() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("create-alert");
    }

    function openObjects() {
      $state.go("objects");
    }

    function openHistory() {
      $state.go("history");
    }

    function openReports() {
      $state.go("reports");
    }

    function openGprs() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("gprsCommand");
    }

    function openMyAccount() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("myAccount");
    }

    function openListFences() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("listFences");
    }

    function openHomepageCustomizer() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("homepageCustomizer");
    }
    // Remove Driver Behavior (not delete!)
    // function openDriverBehavior() {
    //   if (vm.demo) {
    //     toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
    //     return;
    //   }
    //   $state.go("driver_behavior");
    // }

    function openNotifications() {
      $state.go("events");
    }

    function openSettings() {
      $state.go("settings");
    }

    function openGprs() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("gprsCommand");
    }

    function openAbout() {
      if (vm.demo) {
        toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
        return;
      }
      $state.go("about");
    }
    
    function startRefreshObjects() {
      if (!refreshInterval) {
        refreshInterval = setInterval(function () {
          if ($rootScope.paused) return;
          homeService.getUserObjects(function (objects) {
          });
        }, 5000);
      }
    }


    function gotoMapOneObject() {
      var object = vm.objects[vm.currentIndex];
      if (object.active != "true") return;

      var mapOptions = JSON.stringify({
        type: "object",
        object: object
      });
      utilService.setItem("mapOptions", mapOptions, function () {
        $state.go("map");
      })
    }

    function getUserObjects() {
      homeService.getUserObjects(function (objects) {
        objects.forEach(function (object, index) {
          var oldObject = vm.objects.find(function (_object) {
            return _object.imei == object.imei;
          });
          if (oldObject && oldObject.hasOwnProperty('address')) {
            object.address = oldObject.address;
          }

          if (vm.currentIndex == index) {
            homeService.getAddress(object, function (res) {
              object.address = res;
            });
          }

          if (object.hasOwnProperty('driving_today_start') && object.driving_today_start) {
            object.driving_start = moment(object.driving_today_start + '+0000').utcOffset(timezone).format('HH:mm:ss');
          }
          if (object.hasOwnProperty('driving_today_length') && object.driving_today_length) {
            utilService.getItem("speedDisplay", function (speedDisplay) {
              var speed = 0;

              if (!speedDisplay) {
                speedDisplay = "kph";
                utilService.setItem("speedDisplay", "kph");
              }

              if (speedDisplay == "kph") {
                object.driving_length = Number(object.driving_today_length).toFixed(2) + ' km';
              } else if (speedDisplay == "mph") {
                object.driving_length = (Number(object.driving_today_length) * .621371).toFixed(2) + ' mi';
              } else if (speedDisplay == "kn") {
                object.driving_length = (Number(object.driving_today_length) * .539957).toFixed(2) + ' nmi';
              }
            });
          }
        });


        vm.loading = false;
        vm.disconnected = objects.status == -1;

        if (objects.length > 0) {
          for (var i = 0; i < objects.length; i++)
            if (objects[i].params != "")
            objects[i].params = JSON.parse(objects[i].params);
          vm.objects = objects;
          vm.currentIndex = 0;
          setObject(vm.currentIndex);
        }
      });
    }

    function getObjectRating(imei) {
      // if (!isDriverBehaviorFetching) {
      //   driverBehaviorService.initService();
      //   isDriverBehaviorFetching = true;
      // }

      // return driverBehaviorService.getRating(imei);
    }

    function objectBack($event) {
      $event.stopPropagation();
      if (--vm.currentIndex < 0)
      vm.currentIndex = vm.objects.length - 1;
      setObject(vm.currentIndex);
    }

    function objectForward($event) {
      $event.stopPropagation();
      if (++vm.currentIndex + 1 > vm.objects.length)
      vm.currentIndex = 0;
      setObject();
    }

    function setObject() {
      vm.progressPercent = (vm.currentIndex + 1) * (100 / vm.objects.length);
      var object = vm.objects[vm.currentIndex];
      if (!object) {
        return;
      }

      if (!object.address) {
        homeService.getAddress(object, function (res) {
          object.address = res;
        });
      }

      vm.customSensors = _customSensors(vm.currentIndex);

      var t = object.dt_server_org.replace(" ", "T") + "Z";
      var objTime = new Date(t).getTime();
      var nowTime = new Date().getTime();

      if (object.speed == 0) {
        object.status2.st = "Stopped";
        //object.status2.ststr = "";
        }

      if (object.status2) {
        object.statusstr = object.status2.ststr;
        if (object.status2.st == "Stopped") {
          object.status2.st = capitalizeFirstLetter(translations[$translate.use()]["STOPPED"])
        } else if (object.status2.st == "Moving") {
          object.status2.st = capitalizeFirstLetter(translations[$translate.use()]["MOVING"])
        } else if (object.status2.st == "Engine Idle") {
          object.status2.st = capitalizeFirstLetter(translations[$translate.use()]["ENGINE_IDLE"])
        }
      }

      var diff = nowTime - objTime;
      // console.log("diff:" + diff);
      if (diff < 60 * 30 * 1000) {
        if (object.loc_valid == 1) {
          vm.statusImageUrl = "img/connection-gsm-gps.svg";
        } else {
          vm.statusImageUrl = 'img/connection-gsm.svg';
        }
      } else {
        vm.statusImageUrl = 'img/connection-no.svg';
      }


      vm.showBattery = object.params.hasOwnProperty("batp");
      vm.showIgnition = object.params.hasOwnProperty("di1") || object.params.hasOwnProperty("acc");

      object.params.ignition =
      object.params.di1 !== null ?
      object.params.di1 == "0" ? "Off" : "On" :
        object.params.acc == "0" ? "Off" : "On";

      utilService.getItem("speedDisplay", function (speedDisplay) {
        var speed = 0;

        if (!speedDisplay) {
          speedDisplay = "kph";
          utilService.setItem("speedDisplay", "kph");
        }

        if (speedDisplay == "kph") {
          speed = Number(vm.objects[vm.currentIndex].speed);
        } else if (speedDisplay == "mph") {
          speed = (Number(vm.objects[vm.currentIndex].speed) * .621371);
        } else if (speedDisplay == "kn") {
          speed = (Number(vm.objects[vm.currentIndex].speed) * .539957);
        }
        if (!gage) {
          initGauge(speed);
        } else {
          gage.refresh(speed);
        }
      }
      );
    }

    function initGauge(speed) {
      utilService.getItem("speedDisplay", function (speedDisplay) {
        if (!speedDisplay) {
          speedDisplay = "mph";
          utilService.setItem("speedDisplay", "mph");
        }

        var title = capitalizeFirstLetter(translations[$translate.use()]["SPEED"]) + " ";
        if (speedDisplay == "kph") {
          title += "km/h";
        } else if (speedDisplay == "mph") {
          title += "mph";
        } else if (speedDisplay == "kn"){
          title += "kn";
        }

        if (!gage) {
          gage = new JustGage({
            id: "gauge",
            value: speed,
            min: 0,
            max: 200,
            shadowOpacity: 0,
            showInnerShadow: false,
            noGradient: true,
            label: title
          });
        }
      });
    }

    function gotoMap() {
      var mapOptions = JSON.stringify({
        type: "all"
      });
      utilService.setItem("mapOptions", mapOptions, function () {
        $state.go("map");
      });
    }

    function isSensorVisible(sensorName, imei) {
      var result = false;
      if (vm.homepageSettings.hasOwnProperty(imei) && 
        vm.homepageSettings[imei].sensors.hasOwnProperty(sensorName) && 
        vm.homepageSettings[imei].sensors[sensorName].visible
      ) {
        result = true;
      }

      return result;
    }

    function _customSensors(index) {
      var result = [];

      var object = vm.objects[index];

      if (!object || !vm.homepageSettings.hasOwnProperty(object.imei)) {
        return result;
      }

      var settings = vm.homepageSettings[object.imei].sensors;

      if (!settings) {
        return result;
      }

      var defaults = ['status', 'since', 'battery', 'ignition', 'start_at', 'length', 'address', 'rating'];

      for (var name in settings) {
        if (defaults.indexOf(name) >= 0) {
          continue;
        }

        if (!settings[name].visible) {
          continue;
        }

        var value = 'No value';
        var sensorParam = settings[name].data.param;
        if (object.params.hasOwnProperty(sensorParam)) {
          value = getSensorValue(object.params, settings[name].data);
        }

        var sensor = {
          name: name,
          value: value.value_full
        };

        result.push(sensor);
      }

      return result;
    }

    function getParamValue(params, param)
    {
      var param_value = 0;

      if (params != null)
      {
        if (params[param] != undefined)
        {
          param_value = params[param];
        }
      }

      return param_value;
        }

        function calcString(str)
        {
          var result = 0;
          try {
            str = str.trim();
            str = str.replace(/[^-()\d/*+.]/g, '');
            return result + eval(str);
          } catch(err) {
            return result;
          }
    }

    function getSensorValue(params, sensor)
    {
      var result = [];
      result['value'] = 0;
      result['value_full'] = '';

      var param_value = getParamValue(params, sensor.param);

      // formula
      if ((sensor.result_type == 'abs') || (sensor.result_type == 'rel') || (sensor.result_type == 'value'))
        {
          param_value = parseFloat(param_value);

          if (!angular.isNumber(param_value))
          {
            param_value = 0;
          }

          if (sensor.formula != '')
          {
            var formula = sensor.formula.toLowerCase();
            formula = formula.replace('x', param_value);
            param_value = calcString(formula);
          }
        }

        if ((sensor.result_type == 'abs') || (sensor.result_type == 'rel'))
          {
            param_value = Math.round(param_value * 1000)/1000;

            result['value'] = param_value;
            result['value_full'] = param_value;
          }
          else if (sensor.result_type == 'logic')
            {
              if(param_value == 1)
                {
                  result['value'] = param_value;
                  result['value_full'] = sensor.text_1;
                }
                else
                {
                  result['value'] = param_value;
                  result['value_full'] = sensor.text_0;
                }
            }
            else if (sensor.result_type == 'value')
              {
                // calibration
                var out_of_cal = true;
                var calibration = sensor.calibration;

                // function to get calibration Y value
                var calGetY = function(x){
                  var result = 0;
                  for(var j=0;j<calibration.length;j++)
                    {
                      if (calibration[j]['x'] == x)
                        {
                          result = parseFloat(calibration[j]['y']);
                        }
                    }
                    return result;
                }

                if (calibration.length >= 2)
                {
                  // put all X values to separate array
                  var x_arr = new Array();
                  for(var i=0;i<calibration.length;i++)
                    {
                      x_arr.push(parseFloat(calibration[i]['x']));
                    }

                    x_arr.sort(sortNumber);

                  // loop and check if in cal
                  for(var i=0;i<x_arr.length;i++)
                    {
                      var x_low = x_arr[i];
                      var x_high = x_arr[i+1];

                      if ((param_value >= x_low) && (param_value <= x_high))
                      {
                        // get Y low and high
                        var y_low = calGetY(x_low);
                        var y_high = calGetY(x_high);

                        // get coeficient
                        var a = param_value - x_low;
                        var b = x_high - x_low;

                        var coef = (a/b);

                        var c = y_high - y_low;
                        coef = c * coef;

                        param_value = y_low + coef;

                        out_of_cal = false;

                        break;
                      }
                    }

                    if (out_of_cal)
                    {
                      // check if lower than cal
                      var x_low = x_arr[0];

                      if (param_value < x_low)
                      {
                        param_value = calGetY(x_low);
                      }

                      // check if higher than cal
                      var x_high = x_arr.slice(-1)[0];

                      if (param_value > x_high)
                      {
                        param_value = calGetY(x_high);
                      }
                    }
                }

                param_value = Math.round(param_value * 100)/100;

                result['value'] = param_value;
                result['value_full'] = param_value + ' ' + sensor.units;

              }
              else if (sensor.result_type == 'string')
                {
                  result['value'] = param_value;
                  result['value_full'] = param_value;
                }
                else if (sensor.result_type == 'percentage')
                  {
                    param_value = parseFloat(param_value);
                    sensor.lv = parseFloat(sensor.lv);
                    sensor.hv = parseFloat(sensor.hv);

                    if ((param_value > sensor.lv) && (param_value < sensor.hv))
                    {
                      var a = param_value - sensor.lv;
                      var b = sensor.hv - sensor.lv;

                      result['value'] = Math.round((a/b) * 100);
                    }
                    else if (param_value <= sensor.lv)
                    {
                      result['value'] = 0;
                    }
                    else if (param_value >= sensor.hv)
                    {
                      result['value'] = 100;
                    }

                    result['value_full'] = result['value'] + ' ' + sensor.units;
                  }

                  return result;
    }

  }
}());
