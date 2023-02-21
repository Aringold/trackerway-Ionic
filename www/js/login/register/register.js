(function() {
    angular.module("rewire.login").controller("registerController", registerController);

    registerController.$inject = ["$window", "toastr", "global", "$http", "$translate"];

    function registerController($window, toastr, global, $http, $translate) {
        var vm = this;
        vm.gpslive = true;
        vm.email = "";

        vm.cancel = cancel;
        vm.register = register;
        setupKeyboard();


        ////////////////////////////////////////////////////////////////////////////////
        function cancel() {
            $window.history.back();
        }

        function register() {
            console.log(vm.email);
            if (!validateEmail(vm.email)) {
                window.trans = $translate;
                console.log($translate)
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["PLS_CHECK_EMAIL"]));
                return;
            }

            vm.working = true;

            var data = {
                cmd: 'register',
                email: vm.email
            };

            $http.post(global.baseUrl + "/api/mobilapp/register.php", data).then(function(res) {
                if (res.data == "OK") {
                    toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["PLS_CHECK_EMAIL"]));
                    $window.history.back();
                } else {
                    if (res.data == "ERROR_EMAIL_EXISTS")
                        toastr.warning("Email exists.");
                    else
                        toastr.warning(res.data);
                }
                vm.working = false;
            });
        }


        function setupKeyboard() {
            var registerBox = document.getElementsByClassName("registerBox")[0];
            var distanceToTop = -registerBox.getBoundingClientRect().top + 30;
            var style = document.createElement("style");
            style.innerHTML = "body.keyboard-open .loginLogo { -webkit-transform: translateY(" + distanceToTop + "px);} " + "body.keyboard-open .registerBox { -webkit-transform: translateY(" + distanceToTop + "px);}";
            document.head.appendChild(style);
            console.log("setup keyboard")
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    }

}());