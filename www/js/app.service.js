(function () {
  angular.module("starter").service("utilService", utilService);

  utilService.$inject = ["toastr", "$state", "$cordovaNativeStorage", "$ionicPlatform", "$q"];

  function utilService(toastr, $state, $cordovaNativeStorage, $ionicPlatform, $q) {
    var service = {
      getItem: getItem,
      setItem: setItem,
      delItem: delItem,
      setupPush: setupPush,
      convertTZ: convertTZ,
      hasHotfix: hasHotfix
    }

    return service;

    //////////////////////////
    function delItem(key, callback) {
      $ionicPlatform.ready(function () {
        if (ionic.Platform.isWebView()) {
          $cordovaNativeStorage.remove(key).then(function (value) {
            callback(value);
          }, function (value) { // key doesnt exist
            callback(null);
          });
        } else {
          callback(localStorage.removeItem(key));
        }
      });
    }

    function getItem(key, callback) {
      $ionicPlatform.ready(function () {
        if (ionic.Platform.isWebView()) {
          $cordovaNativeStorage.getItem(key).then(function (value) {
            callback(value);
          }, function (value) { // key doesnt exist
            callback(null);
          });
        } else {
          callback(localStorage.getItem(key));
        }
      });
    }

    function setItem(key, value, callback) {
      $ionicPlatform.ready(function () {
        if (ionic.Platform.isWebView()) {
          $cordovaNativeStorage.setItem(key, value).then(callback ? callback : dummy, dummy);
        } else {
          localStorage.setItem(key, value);
          return callback ? callback() : null;
        }
      });
    }

    function setupPush(callback) {
      $ionicPlatform.ready(function () {
        if (!ionic.Platform.isWebView())
          return;

        //AIzaSyCjK8BjKkK_4Rz0lJionLKOyAsFpFRehyk

        var push = PushNotification.init({
          "android": {
            "senderID": "322976957830"
          },
          "ios": {
            "badge": false,
            "sound": true,
            "alert": true,
          }
        });

        push.on('registration', function (data) {
          $cordovaNativeStorage.setItem("register_id", data.registrationId).then(dummy, dummy);
          callback(data.registrationId);
        });

        push.on('notification', function (data) {
          if (!data.additionalData.coldstart) {
            toastr.info("Received notification, " + data.message, null, {
              timeOut: 5000
            });
          } else {
            setTimeout(function () {
              toastr.info("Received notification, " + data.message, null, {
                timeOut: 5000
              });
              $state.go("events");
            }, 500);
          }

        });

        push.on('error', function (e) {
          toastr.error("Could not register push", e);
        });
      });
    }

		function convertTZ(str) {
      if (str == '') {
        str = '+ 0 hour';
      }
			var _tmp = str.split(' ');
			var result = _tmp[0] + (_tmp[1].length == 1 ? '0' : '') + _tmp[1];
			if (_tmp.length == 6) {
				result += _tmp[4];
			} else {
				result += '00';
			}

			return result;
    }

    function hasHotfix(hotfix) {
      var deferred = $q.defer();

      getItem('hotfixes', function (hotfixes) {
        var result = false;
        if (!hotfixes) {
          hotfixes = {};
        } else {
          hotfixes = JSON.parse(hotfixes);
        }

        if (hotfixes.hasOwnProperty(hotfix)) {
          result = true;
        } else {
          hotfixes[hotfix] = moment().format('YYYY-MM-DD HH:mm:ss');
          setItem('hotfixes', JSON.stringify(hotfixes));
        }

        deferred.resolve(result);
      });

      return deferred.promise;
    }
  }
}());
