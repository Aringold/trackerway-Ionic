(function () {
    angular.module("rewire.gdprAgreement").service("gdprAgreementService", gdprAgreementService);

    gdprAgreementService.$inject = ["$http", "$state", "global", "utilService", "$translate"];

    function gdprAgreementService($http, $state, global, utilService, $translate) {
        var url = global.baseUrl;
        var service = {
            saveUserData: saveUserData,
            setBaseUrl: setBaseUrl
        }
        return service;

        function saveUserData (userData, language) {
            $http.post(url + "/api/mobilapp/accept_agreement.php", userData).then(function(result) {
                if (result.data.acceptAgreement === true && result.data.saveUserData === true) {
                    utilService.setItem("lang", language, function () {
                        $translate.use(language);
                    });
                    setBaseUrl(url);
                    $state.go("home");
                } else {

                }
            }, function(result) {
                console.log(result);
            });
        }

        function setBaseUrl(url) {
            global.baseUrl = global.debug ? global.debugUrl : url;
        }
    }
}())