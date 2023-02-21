(function () {
    angular.module("rewire.events").controller("alertsController", alertsController);
    angular.module("rewire.events").factory("alertsCache", function () {
      var alerts = [];

      return {
        get: function () {
          return alerts;
        },
        set: function (value) {
          alerts = value;
        }
      }
    });

    alertsController.$inject = ["$scope", "$http", "utilService", "global", "$timeout", "$ionicPopup", "homeService", "alertsService", "$q", "$state", "toastr", "createAlertService", "$ionicLoading", "alertsCache"];

    function alertsController($scope, $http, utilService, global, $timeout, $ionicPopup, homeService, alertsService, $q, $state, toastr, createAlertService, $ionicLoading, alertsCache) {
        var vm = this;
        vm.objects = [];
        vm.zones = [];
        vm.events = alertsCache.get();
        vm.working = false;
        if (!vm.events.length) {
          vm.working = true;
        }

        vm.shouldShowDelete = false;
        vm.shouldShowReorder = false;
        vm.listCanSwipe = true;

        vm.eventFilter = '';
        vm.eventObjectFilter = '';

        vm.speedingAlert = speedingAlert;
        vm.movementAlert = movementAlert;
        vm.lowBatteryAlert = lowBatteryAlert;
        vm.wakeAlert = wakeAlert;
        vm.sosAlert = sosAlert;
        vm.ignitionAlert = ignitionAlert;
        vm.towAlert = towAlert;
        vm.zoneInAlert = zoneInAlert;
        vm.zoneInAlertSettings = zoneInAlertSettings;
        vm.zoneInOutAlert = zoneInOutAlert;
        vm.zoneInOutAlertSettings = zoneInOutAlertSettings;
        vm.connectionNoAlert = connectionNoAlert;

        vm.edit = editEvent;
        vm.activate = activateEvent;
        vm.deactivate = deactivateEvent;
        vm.formatObjects = formatObjects;
        vm.formatZones = formatZones;
        vm.filter = filter;

        $scope.expanded = [];

        getObjects();
        getZones();

        ///////////////////////////////////////////////////////////
        function editEvent(event) {
          $state.go("edit-alert", {event: event});
        }

        function activateEvent(event) {
          $ionicLoading.show({
            template: '<ion-spinner class="spinner-positive objects-loading-spinner"></ion-spinner>'
          }).then(function(){
          });

          event.isActive = true;

          createAlertService.saveEvent(event).then(function (_event) {
            $ionicLoading.hide().then(function () {
            });
          });
        }

        function deactivateEvent(event) {
          $ionicLoading.show({
            template: '<ion-spinner class="spinner-positive objects-loading-spinner"></ion-spinner>'
          }).then(function(){
          });

          event.isActive = false;

          createAlertService.saveEvent(event).then(function (_event) {
            $ionicLoading.hide().then(function () {
            });
          });
        }

        function filter(event) {
          if (vm.eventFilter.length && vm.eventObjectFilter.length) {
            return (event.objects.filter(function (object) {
              return object.name.toLowerCase().indexOf(vm.eventObjectFilter.toLowerCase()) >= 0;
            }).length > 0 ||
            event.zones.filter(function (zone) {
              return zone.name.toLowerCase().indexOf(vm.eventObjectFilter.toLowerCase()) >= 0;
            }).length > 0) &&
            event.name.toLowerCase().indexOf(vm.eventFilter.toLowerCase()) >= 0;
          } else if (vm.eventObjectFilter.length) {
            return event.objects.filter(function (object) {
              return object.name.toLowerCase().indexOf(vm.eventObjectFilter.toLowerCase()) >= 0;
            }).length > 0 ||
            event.zones.filter(function (zone) {
              return zone.name.toLowerCase().indexOf(vm.eventObjectFilter.toLowerCase()) >= 0;
            }).length > 0;
          } else if (vm.eventFilter.length) {
            return event.name.toLowerCase().indexOf(vm.eventFilter.toLowerCase()) >= 0;
          }

          return true;
        }

        function formatObjects(event) {
          return event.objects.map(function (object) {
            return object.name;
          }).join(', ');
        }

        function formatZones(event) {
          return event.zones.map(function (zone) {
            return zone.name;
          }).join(', ');
        }

        function towAlert(object, event, $event) {
            alertsService.setTowAlert(object, event);
        }

        function ignitionAlert(object, event, $event) {
            alertsService.setIgnitionAlert(object, event);
        }

        function sosAlert(object, event, $event) {
            alertsService.setSosAlert(object, event);
        }

        function wakeAlert(object, event, $event) {
            alertsService.setWakeAlert(object, event);
        }

        function lowBatteryAlert(object, event, $event) {
            alertsService.setLowBatteryAlert(object, event);
        }

        function speedingAlert(object, event, $event) {
            utilService.getItem("speedDisplay", function (speedDisplay) {

                if (!speedDisplay) {
                    speedDisplay = "kph";
                    utilService.setItem("speedDisplay", "kph");
                }


                if (event.isActive) {
                    $ionicPopup.prompt({
                        title: 'Speeding Alert',
                        template: 'Speed limit (kph)',
                        inputType: 'text',
                        inputPlaceholder: '',
                        defaultText: '60'
                    }).then(function (res) {
                        if (res) {
                            event.checked_value = res;
                            alertsService.setSpeedingAlert(object, event);
                        }
                    });
                } else {
                    alertsService.setSpeedingAlert(object, event);
                }
            });

        }

        function movementAlert(object, event, $event) {
          alertsService.setMovementAlert(object, event);
        }

        function connectionNoAlert(object, event, $event) {
          alertsService.setConnectionNoAlert(object, event);
        }

        function zoneInAlert(object, event, $event) {
					if (event.isActive) {
						var eventSettings = {
							zones: vm.zones.map(function (zone) {
								return {
									id: zone.id,
									title: zone.name,
									is_selected: false
								};
							}),
							system_alert: true,
							alert_to_email: false,
							alert_to_sms: false,
							emails: [''],
							phones: ['']
						};

						if (event.hasOwnProperty('event_id') && event.event_id) {
							var zones = event.zones.split(',');
							eventSettings.zones.forEach(function (zone) {
								if (zones.indexOf(zone.id) >= 0) {
									zone.is_selected = true;
								}
							});
							eventSettings.system_alert = (event.notify_system.split(',')[0] == "true" ? true : false);
							eventSettings.alert_to_email = (event.notify_email == "true" ? true : false);
							eventSettings.alert_to_sms = (event.notify_sms == "true" ? true : false);
							eventSettings.emails = event.notify_email_address.split(',');
							eventSettings.phones = event.notify_sms_number.split(',');
						} else {
							event = {
								zones: '',
								notify_system: "true,true,true,alarm1.mp3",
								notify_sms: '',
								notify_email: '',
								notify_email_address: '',
								notify_sms_number: ''
							};
						}

						$scope.eventSettings = eventSettings;

						$scope.addField = function (arr) {
							arr.push('');
						}

						$scope.removeField = function (arr, index) {
							arr.splice(index, 1);
							if (!arr.length) {
								arr.push('');
							}
						}

						var popup = $ionicPopup.show({
							templateUrl: 'js/alerts/zone_in_out_settings.html',
							cssClass: 'zone-alert-settings',
							title: 'Zone In Alert Settings',
							scope: $scope,
							buttons: [
								{
									text: 'Cancel',
									onTap: function (e) {
										object.zoneInAlert = false;
										//alertsService.setZoneInAlert(object);
									}
								}, {
									text: '<b>Save</b>',
									type: 'button-positive',
									onTap: function(e) {
										var hasZones = !!$scope.eventSettings.zones.filter(function (zone) {
											return zone.is_selected;
										}).length;
										var hasEmails = !!$scope.eventSettings.emails.filter(function (email) {
											return email != undefined && email != '';
										}).length;
										var hasPhones = !!$scope.eventSettings.phones.filter(function (phone) {
											return phone != undefined && phone != '';
										}).length;

										if (!hasZones) {
											toastr.warning("You should select at least one zone", null, {
												timeOut: 5000
											});
										}

										if ($scope.eventSettings.alert_to_email && !hasEmails) {
											toastr.warning("Emails list is empty or emails invalid", null, {
												timeOut: 5000
											});
										}

										if ($scope.eventSettings.alert_to_sms && !hasPhones) {
											toastr.warning("Phones list is empty or phones invalid", null, {
												timeOut: 5000
											});
										}

										if (
											!hasZones ||
											($scope.eventSettings.alert_to_email && !hasEmails) ||
											($scope.eventSettings.alert_to_sms && !hasPhones)
										) {
											e.preventDefault();
										} else {
											event.notify_system = $scope.eventSettings.system_alert ? "true,true,true,alarm1.mp3" : "false,false,false,alarm1.mp3";
											event.notify_email = $scope.eventSettings.alert_to_email ? "true" : "false";
											event.notify_email_address = $scope.eventSettings.emails.join(",");
											event.notify_sms = $scope.eventSettings.alert_to_sms ? "true" : "false";
											event.notify_sms_number = $scope.eventSettings.phones.join(",");
											event.zones = $scope.eventSettings.zones.filter(function (zone) {
												return zone.is_selected;
											}).map(function (zone) {
												return zone.id;
											}).join(',');

											event.isActive = true;
											alertsService.setZoneInAlert(object, event);
											return object;
										}
									}
								}
							]
						});

						$scope.openZoneCrud = function () {
							popup.close();
							$state.go('addFence');
						}

						popup.then(function(res) {
						});
					} else {
						event.isActive = false;
						alertsService.setZoneInAlert(object, event);
					}
        }

        function zoneInAlertSettings(object, event, $event) {
					var eventSettings = {
						zones: vm.zones.map(function (zone) {
							return {
								id: zone.id,
								title: zone.name,
								is_selected: false
							};
						}),
						system_alert: true,
						alert_to_email: false,
						alert_to_sms: false,
						emails: [''],
						phones: ['']
					};

					if (event.hasOwnProperty('event_id') && event.event_id) {
						var zones = event.zones.split(',');
						eventSettings.zones.forEach(function (zone) {
							if (zones.indexOf(zone.id) >= 0) {
								zone.is_selected = true;
							}
						});
						eventSettings.system_alert = (event.notify_system.split(',')[0] == "true" ? true : false);
						eventSettings.alert_to_email = (event.notify_email == "true" ? true : false);
						eventSettings.alert_to_sms = (event.notify_sms == "true" ? true : false);
						eventSettings.emails = event.notify_email_address.split(',');
						eventSettings.phones = event.notify_sms_number.split(',');
					} else {
						event = {
							zones: '',
							notify_system: "true,true,true,alarm1.mp3",
							notify_sms: '',
							notify_email: '',
							notify_email_address: '',
							notify_sms_number: ''
						};
					}

					$scope.eventSettings = eventSettings;

					$scope.addField = function (arr) {
						arr.push('');
					}

					$scope.removeField = function (arr, index) {
						arr.splice(index, 1);
						if (!arr.length) {
							arr.push('');
						}
					}

					var popup = $ionicPopup.show({
						templateUrl: 'js/alerts/zone_in_out_settings.html',
						cssClass: 'zone-alert-settings',
						title: 'Zone In Alert Settings',
						scope: $scope,
						buttons: [
							{
								text: 'Cancel'
							}, {
								text: '<b>Save</b>',
								type: 'button-positive',
								onTap: function(e) {
									var hasZones = !!$scope.eventSettings.zones.filter(function (zone) {
										return zone.is_selected;
									}).length;
									var hasEmails = !!$scope.eventSettings.emails.filter(function (email) {
										return email != undefined && email != '';
									}).length;
									var hasPhones = !!$scope.eventSettings.phones.filter(function (phone) {
										return phone != undefined && phone != '';
									}).length;

									if (!hasZones) {
										toastr.warning("You should select atleast one zone", null, {
											timeOut: 5000
										});
									}

									if ($scope.eventSettings.alert_to_email && !hasEmails) {
										toastr.warning("Emails list is empty or emails invalid", null, {
											timeOut: 5000
										});
									}

									if ($scope.eventSettings.alert_to_sms && !hasPhones) {
										toastr.warning("Phones list is empty or phones invalid", null, {
											timeOut: 5000
										});
									}

									if (
										!hasZones ||
										($scope.eventSettings.alert_to_email && !hasEmails) ||
										($scope.eventSettings.alert_to_sms && !hasPhones)
									) {
										e.preventDefault();
									} else {
										event.notify_system = $scope.eventSettings.system_alert ? "true,true,true,alarm1.mp3" : "false,false,false,alarm1.mp3";
										event.notify_email = $scope.eventSettings.alert_to_email ? "true" : "false";
										event.notify_email_address = $scope.eventSettings.emails.join(",");
										event.notify_sms = $scope.eventSettings.alert_to_sms ? "true" : "false";
										event.notify_sms_number = $scope.eventSettings.phones.join(",");
										event.zones = $scope.eventSettings.zones.filter(function (zone) {
											return zone.is_selected;
										}).map(function (zone) {
											return zone.id;
										}).join(',');

                    alertsService.setZoneInAlert(object, event);

										return object;
									}
								}
							}
						]
					});

					$scope.openZoneCrud = function () {
						popup.close();
						$state.go('addFence');
					}

					popup.then(function(res) {
					});
        }

        function zoneInOutAlert(object, event, $event) {
					if (event.isActive) {
						var eventSettings = {
							zones: vm.zones.map(function (zone) {
								return {
									id: zone.id,
									title: zone.name,
									is_selected: false
								};
							}),
							system_alert: true,
							alert_to_email: false,
							alert_to_sms: false,
							emails: [''],
							phones: ['']
						};

						if (event.hasOwnProperty('event_id') && event.event_id) {
							var zones = event.zones.split(',');
							eventSettings.zones.forEach(function (zone) {
								if (zones.indexOf(zone.id) >= 0) {
									zone.is_selected = true;
								}
							});
							eventSettings.system_alert = (event.notify_system.split(',')[0] == "true" ? true : false);
							eventSettings.alert_to_email = (event.notify_email == "true" ? true : false);
							eventSettings.alert_to_sms = (event.notify_sms == "true" ? true : false);
							eventSettings.emails = event.notify_email_address.split(',');
							eventSettings.phones = event.notify_sms_number.split(',');
						} else {
							event = {
								zones: '',
								notify_system: "true,true,true,alarm1.mp3",
								notify_sms: '',
								notify_email: '',
								notify_email_address: '',
								notify_sms_number: ''
							};
						}

						$scope.eventSettings = eventSettings;

						$scope.addField = function (arr) {
							arr.push('');
						}

						$scope.removeField = function (arr, index) {
							arr.splice(index, 1);
							if (!arr.length) {
								arr.push('');
							}
						}

						var popup = $ionicPopup.show({
							templateUrl: 'js/alerts/zone_in_out_settings.html',
							cssClass: 'zone-alert-settings',
							title: 'Zone Out Alert Settings',
							scope: $scope,
							buttons: [
								{
									text: 'Cancel',
									onTap: function (e) {
										object.zoneInOutAlert = false;
										//alertsService.setZoneInOutAlert(object);
									}
								}, {
									text: '<b>Save</b>',
									type: 'button-positive',
									onTap: function(e) {
										var hasZones = !!$scope.eventSettings.zones.filter(function (zone) {
											return zone.is_selected;
										}).length;
										var hasEmails = !!$scope.eventSettings.emails.filter(function (email) {
											return email != undefined && email != '';
										}).length;
										var hasPhones = !!$scope.eventSettings.phones.filter(function (phone) {
											return phone != undefined && phone != '';
										}).length;

										if (!hasZones) {
											toastr.warning("You should select at least one zone", null, {
												timeOut: 5000
											});
										}

										if ($scope.eventSettings.alert_to_email && !hasEmails) {
											toastr.warning("Emails list is empty or emails invalid", null, {
												timeOut: 5000
											});
										}

										if ($scope.eventSettings.alert_to_sms && !hasPhones) {
											toastr.warning("Phones list is empty or phones invalid", null, {
												timeOut: 5000
											});
										}

										if (
											!hasZones ||
											($scope.eventSettings.alert_to_email && !hasEmails) ||
											($scope.eventSettings.alert_to_sms && !hasPhones)
										) {
											e.preventDefault();
										} else {
											event.notify_system = $scope.eventSettings.system_alert ? "true,true,true,alarm1.mp3" : "false,false,false,alarm1.mp3";
											event.notify_email = $scope.eventSettings.alert_to_email ? "true" : "false";
											event.notify_email_address = $scope.eventSettings.emails.join(",");
											event.notify_sms = $scope.eventSettings.alert_to_sms ? "true" : "false";
											event.notify_sms_number = $scope.eventSettings.phones.join(",");
											event.zones = $scope.eventSettings.zones.filter(function (zone) {
												return zone.is_selected;
											}).map(function (zone) {
												return zone.id;
											}).join(',');

											event.isActive = true;
											alertsService.setZoneInOutAlert(object, event);
											return object;
										}
									}
								}
							]
						});

						$scope.openZoneCrud = function () {
							popup.close();
							$state.go('addFence');
						}

						popup.then(function(res) {
						});
					} else {
						event.isActive = false;
						alertsService.setZoneInOutAlert(object, event);
					}
        }

        function zoneInOutAlertSettings(object, event, $event) {
					var eventSettings = {
						zones: vm.zones.map(function (zone) {
							return {
								id: zone.id,
								title: zone.name,
								is_selected: false
							};
						}),
						system_alert: true,
						alert_to_email: false,
						alert_to_sms: false,
						emails: [''],
						phones: ['']
					};

					if (event.hasOwnProperty('event_id') && event.event_id) {
						var zones = event.zones.split(',');
						eventSettings.zones.forEach(function (zone) {
							if (zones.indexOf(zone.id) >= 0) {
								zone.is_selected = true;
							}
						});
						eventSettings.system_alert = (event.notify_system.split(',')[0] == "true" ? true : false);
						eventSettings.alert_to_email = (event.notify_email == "true" ? true : false);
						eventSettings.alert_to_sms = (event.notify_sms == "true" ? true : false);
						eventSettings.emails = event.notify_email_address.split(',');
						eventSettings.phones = event.notify_sms_number.split(',');
					} else {
						event = {
							zones: '',
							notify_system: "true,true,true,alarm1.mp3",
							notify_sms: '',
							notify_email: '',
							notify_email_address: '',
							notify_sms_number: ''
						};
					}

					$scope.eventSettings = eventSettings;

					$scope.addField = function (arr) {
						arr.push('');
					}

					$scope.removeField = function (arr, index) {
						arr.splice(index, 1);
						if (!arr.length) {
							arr.push('');
						}
					}

					var popup = $ionicPopup.show({
						templateUrl: 'js/alerts/zone_in_out_settings.html',
						cssClass: 'zone-alert-settings',
						title: 'Zone Out Alert Settings',
						scope: $scope,
						buttons: [
							{
								text: 'Cancel'
							}, {
								text: '<b>Save</b>',
								type: 'button-positive',
								onTap: function(e) {
									var hasZones = !!$scope.eventSettings.zones.filter(function (zone) {
										return zone.is_selected;
									}).length;
									var hasEmails = !!$scope.eventSettings.emails.filter(function (email) {
										return email != undefined && email != '';
									}).length;
									var hasPhones = !!$scope.eventSettings.phones.filter(function (phone) {
										return phone != undefined && phone != '';
									}).length;

									if (!hasZones) {
										toastr.warning("You should select atleast one zone", null, {
											timeOut: 5000
										});
									}

									if ($scope.eventSettings.alert_to_email && !hasEmails) {
										toastr.warning("Emails list is empty or emails invalid", null, {
											timeOut: 5000
										});
									}

									if ($scope.eventSettings.alert_to_sms && !hasPhones) {
										toastr.warning("Phones list is empty or phones invalid", null, {
											timeOut: 5000
										});
									}

									if (
										!hasZones ||
										($scope.eventSettings.alert_to_email && !hasEmails) ||
										($scope.eventSettings.alert_to_sms && !hasPhones)
									) {
										e.preventDefault();
									} else {
										event.notify_system = $scope.eventSettings.system_alert ? "true,true,true,alarm1.mp3" : "false,false,false,alarm1.mp3";
										event.notify_email = $scope.eventSettings.alert_to_email ? "true" : "false";
										event.notify_email_address = $scope.eventSettings.emails.join(",");
										event.notify_sms = $scope.eventSettings.alert_to_sms ? "true" : "false";
										event.notify_sms_number = $scope.eventSettings.phones.join(",");
										event.zones = $scope.eventSettings.zones.filter(function (zone) {
											return zone.is_selected;
										}).map(function (zone) {
											return zone.id;
										}).join(',');

                    alertsService.setZoneInOutAlert(object, event);

										return object;
									}
								}
							}
						]
					});

					$scope.openZoneCrud = function () {
						popup.close();
						$state.go('addFence');
					}

					popup.then(function(res) {
					});
        }

        function getUserEvents() {
            alertsService.getUserEvents(function (res) {
                var objects = {};
                vm.objects.forEach(function (object) {
                  objects[object.imei] = object;
                });

                var zones = {};
                vm.zones.forEach(function (zone) {
                  zones[zone.id] = zone;
                });

                var events = [];
                res.forEach(function (event) {
                  var _event = {
                    event_id: event.event_id,
                    eventType: '',
                    name: event.name,
                    objects: event.imei.split(',').map(function (imei) {
                      return objects.hasOwnProperty(imei) ? objects[imei] : null;
                    }).filter(function (object) {
                      return object !== null;
                    }),
                    zones: event.zones.split(',').map(function (zone) {
                      return zones.hasOwnProperty(zone) ? zones[zone] : null;
                    }).filter(function (zone) {
                      return zone !== null;
                    }),
                    speed_limit: event.type == 'overspeed' ? parseInt(event.checked_value) : '',
                    isActive: event.active ? true : false,
                    system_alert: (event.notify_system.split(',')[0] == "true" ? true : false),
                    alert_to_email: (event.notify_email == "true" ? true : false),
                    alert_to_sms: (event.notify_sms == "true" ? true : false),
                    emails: event.notify_email_address.split(','),
                    phones: event.notify_sms_number.split(','),
                    checked_value: event.checked_value,
                    _objects: event.imei.split(',').map(function (imei) {
                      return objects.hasOwnProperty(imei) ? objects[imei].name : null;
                    }).filter(function (object) {
                      return object !== null;
                    }),
                    _zones: event.zones.split(',').map(function (zone) {
                      return zones.hasOwnProperty(zone) ? zones[zone].name : null;
                    }).filter(function (zone) {
                      return zone !== null;
                    })
                  };

                  if (event.type == 'moving') {
                    _event.eventType = 'MOVEMENT_ALERT';
                  }

                  if (event.type == 'overspeed') {
                    _event.eventType = 'SPEEDING_ALERT';
                  }

                  if (event.type == 'lowbat') {
                    _event.eventType = 'LOW_BATTERY_ALERT';
                  }

                  if (event.type == 'connyes') {
                    _event.eventType = 'WAKE_ALERT';
                  }

                  if (event.type == 'sos') {
                    _event.eventType = 'SOS_ALERT';
                  }

                  if (event.type == 'param' && event.checked_value == 'di1|eq|1') {
                    _event.eventType = 'IGNITION_ALERT';
                  }

                  if (event.type == 'param' && event.checked_value == 'autogeo|eq|0') {
                    _event.eventType = 'TOW_ALERT';
                  }

                  if (event.type == 'zone_in') {
                    _event.eventType = 'ZONE_IN_ALERT';
                  }

                  if (event.type == 'zone_out') {
                    _event.eventType = 'ZONE_IN_OUT_ALERT';
                  }

                  if (event.type == 'connno') {
                    _event.eventType = 'CONNECTION_NO_ALERT';
                  }

                  events.push(_event);
                });
                alertsCache.set(events);
                vm.events = events;

                vm.objects.forEach(function (object) {
                    object.movementAlerts = [];
                    object.speedingAlerts = [];
                    object.lowBatteryAlerts = [];
                    object.wakeAlerts = [];
                    object.sosAlerts = [];
                    object.ignitionAlerts = [];
                    object.towAlerts = [];
                    object.zoneInAlerts = [];
                    object.zoneInOutAlerts = [];
                    object.connectionNoAlerts = [];

                    res.forEach(function (event) {
                        if (typeof event.imei != 'string') {
                          return;
                        }

                        event.imeiList = event.imei.split(',');
                        event.isActive = event.active == 'true' ? true : false;

                        if (isMovingAlert(object, event)) {
                          object.movementAlerts.push(event);
                        }

                        if (isSpeedingAlert(object, event)) {
                          object.speedingAlerts.push(event);
                        }

                        if (isLowBatteryAlert(object, event)) {
                          object.lowBatteryAlerts.push(event);
                        }

                        if (isWakeAlert(object, event)) {
                          object.wakeAlerts.push(event);
                        }

                        if (isSOSAlert(object, event)) {
                          object.sosAlerts.push(event);
                        }

                        if (isIgnitionAlert(object, event)) {
                          object.ignitionAlerts.push(event);
                        }

                        if (isTowAlert(object, event)) {
                          object.towAlerts.push(event);
                        }

                        if (isZoneInAlert(object, event)) {
                          object.zoneInAlerts.push(event);
                        }

                        if (isZoneOutAlert(object, event)) {
                          object.zoneInOutAlerts.push(event);
                        }

                        if (isConnectionNoAlert(object, event)) {
                          object.connectionNoAlerts.push(event);
                        }

                        /*
                        if (event.name == "Movement Alert " + object.name) object.movementAlert = true;
                        if (event.name == "Speeding Alert " + object.name) object.speedingAlert = true;
                        if (event.name == "Low Battery Alert " + object.name) object.lowBatteryAlert = true;
                        if (event.name == "Wake Alert " + object.name) object.wakeAlert = true;
                        if (event.name == "SOS Alert " + object.name) object.sosAlert = true;
                        if (event.name == "Ignition Alert " + object.name) object.ignitionAlert = true;
                        if (event.name == "Tow Alert " + object.name) object.towAlert = true;
                        if (event.name == "Zone Out Alert " + object.name) {
													object.zoneInOutAlert = true;
													object.zoneInOutAlertEventData = event;
												}
                        */
                    });
                });
            });

        }

        function isMovingAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'moving';
        }

        function isSpeedingAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'overspeed';
        }

        function isLowBatteryAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'lowbat';
        }

        function isWakeAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'connyes';
        }

        function isSOSAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'sos';
        }

        function isIgnitionAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'param' && event.checked_value == 'di1|eq|1';
        }

        function isTowAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'param' && event.checked_value == 'autogeo|eq|0';
        }

        function isZoneInAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'zone_in';
        }

        function isZoneOutAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'zone_out';
        }

        function isConnectionNoAlert(object, event) {
          return event.imeiList.indexOf(object.imei) >= 0 && event.type == 'connno';
        }

        function getObjects() {
            $timeout(function () {
                homeService.getUserObjects(function (objects) {
                    vm.objects = objects;
                    vm.working = false;
                    getUserEvents();
                });
            }, 200);
        }

        function getZones() {
            $timeout(function () {
							getFences().then(function (zones) {
								vm.zones = zones;
							});
            }, 200);
        }

				function getFences() {
					var defer = $q.defer();

					utilService.getItem("user", function (user) {
						var user = JSON.parse(user);
						var request = {
							user_id: user.id,
							manager_id: user.manager_id,
							privileges: JSON.parse(user.privileges),
							dst: user.dst,
							dst_start: user.dst_start,
							dst_end: user.dst_end,
							timezone: user.timezone,
							cmd: "load_zone_data",
							page: "1",
							rows: "2048",
							sidx: "dt_cmd",
							sord: "desc"
						};

						var promises = {};

						promises['zones'] = $http.post(global.baseUrl + "/api/mobilapp/places.php", request).then(function (response) {
							return response.data;
						});

						var groupRequest = {
							user_id: user.id,
							manager_id: user.manager_id,
							privileges: JSON.parse(user.privileges),
							cmd: "load_place_group_data",
						};

						promises['groups'] = $http.post(global.baseUrl + "/api/mobilapp/places.php", groupRequest).then(function (response) {
							return response.data;
						});

						$q.all(promises).then(function (results) {
							var zones = results.zones;
							var groups = results.groups;

							var result = [];
							for (var i in zones) {
								var zone = zones[i];

								zone.data.id = i;
								zone.data.group = groups[zone.data.group_id].name || "Ungrouped";

								result.push(zone.data);
							}

							defer.resolve(result);
						});
					});

					return defer.promise;
        }
    }

}())
