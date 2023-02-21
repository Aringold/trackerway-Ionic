(function() {
    angular.module("rewire.login", []);
    angular.module("rewire.login").controller("loginController", loginController);

    loginController.$inject = ["$scope", "$timeout", "toastr", "loginService", "global", "$translate", "utilService", "$ionicPopup", "$rootScope"];

    function loginController($scope, $timeout, toastr, loginService, global, $translate, utilService, $ionicPopup, $rootScope) {
        var vm = this;
        vm.gpsLiveSelected = true;
        vm.formData = {};
        vm.working = false; // for spinning annimation
        vm.demoWorking = false; // for spinning annimation
        vm.rememberme = false;

        vm.login = login;
        vm.demoLogin = demoLogin;
        vm.gpsLiveClicked = gpsLiveClicked;
        vm.gpsLivePremiumClicked = gpsLivePremiumClicked;


        /////////////////////////////////////////////////////////
        $scope.$on("$ionicView.afterEnter", function() {
            $timeout(function() {
                loginService.initialize();
                if (navigator.splashscreen)
                    navigator.splashscreen.hide();

            }, 500);
        });

        function gpsLiveClicked() {
            var url = global.debug ? global.debugUrl : global.baseUrl;
            loginService.setBaseUrl(url);
            vm.gpsLiveSelected = true;
        }

        function gpsLivePremiumClicked() {
            console.log("gpsLivePremiumClicked clicked");
            loginService.setBaseUrl("https://www.gpslivepremium.co.uk");
            vm.gpsLiveSelected = false;
        }

        function login() {
            var inputs = angular.element(document.getElementsByClassName("loginForm"));
            if (inputs.hasClass("ng-invalid")) {
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["CHECK_FIELDS"]));
                return;
            }

            vm.working = true;

            $timeout(function() {
                vm.formData.username = vm.formData.username.toLowerCase();
                loginService.login(global.baseUrl, JSON.stringify(vm.formData), function(res) {
                    $timeout(function() {
                        if (res.data == "null") {
                            toastr.error(capitalizeFirstLetter(translations[$translate.use()]["USERNAME_INVALID"]));
                            vm.working = false;
                        } else if (res.data && res.data.active == "false") {
                            toastr.warning("Account is deactivated.");
                            vm.working = false;
                        } else if (res.data && res.data.active == "true") {
                            $rootScope.locales.find(function (locale) {
                                var lang = res.data.language[0].toUpperCase() + res.data.language.slice(1);
                                if (locale.lang == lang) {
                                    utilService.setItem("lang", locale.locale, function () {
                                        $translate.use(locale.locale);
                                    });
                                }
                            });

                            // $state.transitionTo("dash");
                            vm.formData.username = "";
                            vm.formData.password = "";
                            vm.working = false;
                        } else {
                            toastr.warning("Server unavailable. Login to default server.");
                            loginService.setBaseUrl(global.defaultUrl);
                            loginService.login(global.defaultUrl, JSON.stringify(vm.formData), loginCallback);
                        }
                    }, 300);
                });
            }, 600);
        }

        function demoLogin() {
            vm.demoWorking = true;

            $timeout(function() {
                var formData = {
                    "username": "demo",
                    "password": "demo123"
                };

                loginService.login(global.baseUrl, JSON.stringify(formData), function(res) {
                    $timeout(function() {
                        if (res.data == "null") {
                            toastr.error(capitalizeFirstLetter(translations[$translate.use()]["USERNAME_INVALID"]));
                            vm.demoWorking = false;
                        } else if (res.data && res.data.active == "false") {
                            toastr.warning("Account is deactivated.");
                            vm.demoWorking = false;
                        } else if (res.data && res.data.active == "true") {
                            // $state.transitionTo("dash");
                            vm.formData.username = "";
                            vm.formData.password = "";
                            vm.demoWorking = false;
                        } else {
                            toastr.warning("Server unavailable. Login to default server.");
                            loginService.setBaseUrl(global.defaultUrl);
                            loginService.login(global.defaultUrl, JSON.stringify(formData), loginCallback);
                        }
                    }, 300);
                });
            }, 600);
        }

        function loginCallback(res) {
            $timeout(function() {
                vm.working = false;
                vm.demoWorking = false;
                if (res.data == "null")
                    toastr.error(capitalizeFirstLetter(translations[$translate.use()]["USERNAME_INVALID"]));
                else if (res.data && res.data.active == "false")
                    toastr.warning("Account is deactivated.");
                else if (res.data && res.data.active == "true") {
                    // $state.transitionTo("dash");
                    vm.formData.username = "";
                    vm.formData.password = "";
                } else {
                    toastr.warning("Could not login.");
                }
            }, 300);
        }
    }
}());