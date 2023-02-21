(function() {
    angular.module("starter", ["ionic", "ngCordova", "rewire.login", "rewire.home", "rewire.objects",
        "rewire.events", "rewire.history", "rewire.map", "rewire.about",
        "rewire.settings", "rewire.gprsCommand", "rewire.myAccount",
        "rewire.setZone", "rewire.reports", "rewire.homepageCustomizer",
        // Remove Driver Behavior (not delete!)
        // "rewire.driverBehavior",
        "ngCordova.plugins.nativeStorage",
        "toastr", "ngAnimate", "pascalprecht.translate", "rewire.gdprAgreement"
    ]);

    angular.module("starter").value("global", {
        debug: false,
        debugUrl: "https://cloud.trackerway.com",
        baseUrl: "https://cloud.trackerway.com",
        defaultUrl: "https://cloud.trackerway.com"
    });

    angular.module("starter").filter('capFirst', function() {
        return function(e) {
            return capitalizeFirstLetter(e);
        };
    });

    angular.module("starter").filter('toUpperCase', function() {
        return function(e) {
            return e.toUpperCase();
        };
    });

    angular.module("starter").config(config);

    config.$inject = ["$translateProvider"];

    function config($translateProvider) {
        for (lang in translations) {
            $translateProvider.translations(lang, translations[lang]);
        }
        $translateProvider.preferredLanguage('en');
    }

    angular.module("starter").run(autorun);

    autorun.$inject = ["$ionicPlatform", "$state", "$rootScope", "utilService", "global", "loginService", "$translate", "$http", "settingsService"];

    function autorun($ionicPlatform, $state, $rootScope, utilService, global, loginService, $translate, $http, settingsService) {
        $ionicPlatform.ready(function() {
            settingsService.initMenu();
            utilService.getItem("lang", function(lang) {
                if (!lang) {
                    lang = "en";
                    utilService.setItem("lang", lang, function() {
                        $translate.use(lang);
                    });
                } else {
                    $translate.use(lang);
                }
            });
            $rootScope.locales = locales;

            document.addEventListener("pause", function() {
                $rootScope.paused = true;
                $rootScope.$apply();
                console.log("paused");
            }, false);

            document.addEventListener("resume", function() {
                $rootScope.paused = false;
                $rootScope.$apply();
                console.log("resumed");
            }, false);


            if (ionic.Platform.isWebView()) {
                if (window.isTablet) {
                    screen.orientation.unlock()
                } else {
                    screen.orientation.lock('portrait');
                }
            }

            utilService.setupPush(dummy);
            setupKeyboard();

            if (global.gebug) {
                global.baseUrl = global.debugUrl;
            } else {
                global.baseUrl = global.defaultUrl;
            }

            $rootScope.$state = $state;
            checkLogin($state, utilService);
        });

        function checkLogin($state, utilService) {
            utilService.getItem("userDetails", function(user) {
                if (user == null) {
                    $state.go("login");
                    return;
                }

                console.log("url:" + global.baseUrl);
                loginService.login(global.baseUrl, user, function(res) {
                    if (res.data == "null")
                        $state.go("login");
                    else if (res.data && res.data.active == "false")
                        $state.go("login");
                    else if (res.data && res.data.active == "true") {

                    } else {
                        $state.go("login");
                    }
                });
            });
        }

        // cache($http, $templateCache, $state);
    }

    function cache($http, $templateCache, $state) {
        var states = $state.get();
        for (var i in states) {
            var state = states[i];
            if (state.preload) {
                $http.get(state.templateUrl).success(function(response) {
                    $templateCache.put(state.templateUrl, response);
                });
            }
        }
    }

    function setupKeyboard() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.hideFormAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        window.addEventListener("native.keyboardshow", function() {
            document.body.classList.add("keyboard-open");
        });
    }

    angular.module("starter").directive('select', function($timeout) {
        return {
            restrict: 'E',
            link: function(_, element) {
                element.bind('touchstart focus', function(e) {
                    $timeout(function() {
                        console.log('strter focus');
                        if (window.cordova && window.cordova.plugins.Keyboard) {
                            //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                            //cordova.plugins.Keyboard.hideFormAccessoryBar(false);
                        }
                    })
                });
                element.bind('blur', function(e) {
                    $timeout(function() {
                        console.log('strter blur');
                        if (window.cordova && window.cordova.plugins.Keyboard) {
                            //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                            //cordova.plugins.Keyboard.hideFormAccessoryBar(true);
                        }
                    });
                });
            }
        }
    });
}());


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}