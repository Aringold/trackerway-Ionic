(function () {
    angular.module("rewire.events").service("alertsService", alertsService);

    alertsService.$inject = ["utilService", "$http", "global", "$q"];

    function alertsService(utilService, $http, global, $q) {
        var service = {
            getUserEvents: getUserEvents,
            setMovementAlert: setMovementAlert,
            setSpeedingAlert: setSpeedingAlert,
            setLowBatteryAlert: setLowBatteryAlert,
            setWakeAlert: setWakeAlert,
            setSosAlert: setSosAlert,
            setIgnitionAlert: setIgnitionAlert,
            setTowAlert: setTowAlert,
						setZoneInAlert: setZoneInAlert,
						setZoneInOutAlert: setZoneInOutAlert,
            setConnectionNoAlert: setConnectionNoAlert
        }
        return service;

        ////////////////////////////////////////
        function setTowAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'TOW_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

        function setIgnitionAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'IGNITION_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

        function setSosAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'SOS_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

        function setWakeAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'WAKE_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

        function setLowBatteryAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'LOW_BATTERY_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

        function getUserEvents(callback) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);
                var request = {
                    cmd: "GET_USER_EVENTS",
                    user_id: user.id,
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                    callback(response.data);
                });
            });
        }

        function setSpeedingAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'SPEEDING_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    speedParam: event.checked_value,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

        function setMovementAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'MOVEMENT_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

				function setZoneInAlert(object, event) {
						var defer = $q.defer();
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'ZONE_IN_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
										zones: event.zones,
										system_alert: event.notify_system,
										alert_by_email: event.notify_email,
										alert_on_emails: event.notify_email_address,
										alert_by_sms: event.notify_sms,
										alert_on_phones: event.notify_sms_number,
										duration: 0,
										checked_value: '',
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }

									defer.resolve(response);
                });
            });

						return defer.promise;
				}

				function setZoneInOutAlert(object, event) {
						var defer = $q.defer();
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'ZONE_IN_OUT_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
										zones: event.zones,
										system_alert: event.notify_system,
										alert_by_email: event.notify_email,
										alert_on_emails: event.notify_email_address,
										alert_by_sms: event.notify_sms,
										alert_on_phones: event.notify_sms_number,
										duration: 0,
										checked_value: '',
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }

									defer.resolve(response);
                });
            });

						return defer.promise;
				}

        function setConnectionNoAlert(object, event) {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);

                var cmd = 'create';
                if (event && event.hasOwnProperty('event_id')) {
                  cmd = 'update'
                }

                var request = {
                    alert: 'CONNECTION_NO_ALERT',
                    cmd: cmd,
                    user_id: user.id,
                    event_id: event.hasOwnProperty('event_id') ? event.event_id : null,
                    imei: event.hasOwnProperty('imei') && event.imei ? event.imei : object.imei,
                    object_name: object.name,
                    active: event.isActive ? 'true' : 'false'
                };

                $http.post(global.baseUrl + "/api/mobilapp/alerts.php", request).then(function (response) {
                  if (cmd == 'create' && response.hasOwnProperty('data') && parseInt(response.data) > 0) {
                    event.event_id = response.data;
                  }
                });
            });
        }

    }


}())
