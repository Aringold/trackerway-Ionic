(function() {
    angular.module("rewire.home").service("homeService", homeService);

    homeService.$inject = ["utilService", "global", "$http", "$rootScope", "$translate"];

    function homeService(utilService, global, $http, $rootScope, $translate) {
        var service = {
            getUserObjects: getUserObjects,
            getCachedObjects: getCachedObjects,
            getAddress: getAddress,
            getUserZones: getUserZones,
            getUserStaticMarkers: getUserStaticMarkers,
            checkUserLangauge: checkUserLangauge
        }
        var objects = [];

        return service;
        //////////////////////

        function getUserStaticMarkers(callback) {
            utilService.getItem("user", function(user) {
                user = JSON.parse(user);
                var data = {
                    user_id: user.id,
                    privileges: user.privileges
                };

                $http.post(global.baseUrl + "/api/mobilapp/getMarkers.php", data).then(function(res) {
                    callback(res.data);
                });
            });
        }

        function getUserZones(callback) {
            utilService.getItem("user", function(user) {
                user = JSON.parse(user);
                var data = {
                    user_id: user.id
                };
                $http.post(global.baseUrl + "/api/mobilapp/getZones.php", data).then(function(res) {
                    callback(res.data);
                });
            });
        }

        function getAddress(object, callback) {
            var data = {
                cmd: "latlng",
                lat: "" + object.lat,
                lng: "" + object.lng
            };
            $http.post(global.baseUrl + "/api/mobilapp/address.php", data).then(function(res) {
                var result = res.data.split(',', 2).join(',');
                callback(result);
            });
        }

        function getCachedObjects() {
            return objects;
        }

        function getUserObjects(callback) {
            utilService.getItem("user", function(user) {
                var _user = JSON.parse(user);
                var timezone = utilService.convertTZ(_user.timezone);
                _user.timezone = "+ 0 hour";
                user = JSON.stringify(_user);
                $http.post(global.baseUrl + "/api/mobilapp/objects_v3.php", user).then(function(res) {
                    objects = res.data;
                    objects.forEach(function(object) {
                        object.getTime = function() {
                            return moment.tz(object.dt_tracker, 'UTC').utcOffset(timezone).format('LLLL');
                        };
                        object.getSpeed = function(units) {
                            var result = object.speed + " km/h";
                            if (units == "mph") {
                                result = Math.round(object.speed * .621371) + " mph";
                            } else if (units == "kn") {
                                result = Math.round(object.speed * .539957) + " kn";
                            }

                            return result;
                        }
                    });
                    callback(res.data);
                }, function(res) {
                    callback(res);
                });
            });
        }

        function checkUserLangauge() {
            utilService.getItem("user", function(user) {
                var _user = JSON.parse(user);
                var currentLanguage = _user.language;
                var data = {
                    cmd: 'getAppLanguage',
                    user_id: _user.id
                }
                $http.post(global.baseUrl + "/api/mobilapp/user_settings.php", data).then(function(res) {
                    if (!res || currentLanguage == res.data.language) {
                        return;
                    }
                    $rootScope.locales.find(function (locale) {
                        var lang = res.data.language[0].toUpperCase() + res.data.language.slice(1);
                        if (locale.lang == lang) {
                            utilService.setItem("lang", locale.locale, function () {
                                $translate.use(locale.locale);
                            });
                        }
                    });
                },
                function(res) {

                });
            });
        }
    }

}())