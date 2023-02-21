(function() {
    angular.module("rewire.events").controller("createAlertController", createAlertController);

    createAlertController.$inject = ["$scope", "$http", "utilService", "global", "$timeout", "$ionicPopup", "homeService", "createAlertService", "$q", "$state", "toastr", "$ionicLoading", "$stateParams", "$ionicHistory", "$ionicActionSheet"];

    function createAlertController($scope, $http, utilService, global, $timeout, $ionicPopup, homeService, createAlertService, $q, $state, toastr, $ionicLoading, $stateParams, $ionicHistory, $ionicActionSheet) {
        var vm = this;

        vm.alertTypesList = [
            { title: 'Select Event', value: null },
            { title: 'Moving', value: 'MOVEMENT_ALERT' },
            { title: 'Overspeed', value: 'SPEEDING_ALERT' },
            { title: 'Zone In', value: 'ZONE_IN_ALERT' },
            { title: 'Zone Out', value: 'ZONE_IN_OUT_ALERT' },
            { title: 'No Connection', value: 'CONNECTION_NO_ALERT' },
            { title: 'Tow', value: 'TOW_ALERT' },
            { title: 'Ignition', value: 'IGNITION_ALERT' },
            { title: 'SOS', value: 'SOS_ALERT' },
            { title: 'Wake', value: 'WAKE_ALERT' },
            { title: 'Low Battery', value: 'LOW_BATTERY_ALERT' }
        ];

        vm.isFormHidden = true;
        vm.returnAfterSave = false;
        vm.newAlert = {
            eventType: null,
            name: '',
            objects: [],
            zones: [],
            speed_limit: null,
            isActive: true,
            system_alert: true,
            alert_to_email: false,
            alert_to_sms: false,
            emails: [''],
            phones: ['']
        };

        if ($stateParams.event) {
            vm.newAlert = Object.assign(vm.newAlert, $stateParams.event);
            vm.isFormHidden = false;
            vm.returnAfterSave = true;
        }

        vm.openAlerts = openAlerts;
        vm.createAlert = createAlert;
        vm.save = save;
        vm.isValid = isValid;

        vm.addField = addField;
        vm.removeField = removeField;

        vm.formatAlertType = formatAlertType;
        vm.formatObjects = formatObjects;
        vm.formatZones = formatZones;

        vm.selectType = selectType;
        vm.selectObjects = selectObjects;
        vm.selectZones = selectZones;

        function addField(arr) {
            arr.push('');
        }

        function removeField(arr, index) {
            arr.splice(index, 1);
            if (!arr.length) {
                arr.push('');
            }
        }

        function openAlerts() {
            $state.go("alerts");
        }

        function createAlert(alertType) {
            vm.isFormHidden = false;
            vm.newAlert.eventType = alertType;

            initByType();
        }

        function save() {
            $ionicLoading.show({
                template: '<ion-spinner class="spinner-positive objects-loading-spinner"></ion-spinner>'
            }).then(function() {});

            createAlertService.saveEvent(vm.newAlert).then(function(event) {
                $ionicLoading.hide().then(function() {
                    if (vm.returnAfterSave) {
                        $ionicHistory.goBack();
                    } else {
                        savePostProcess();
                    }
                });
            });
        }

        function savePostProcess() {
            var hideSheet = $ionicActionSheet.show({
                titleText: 'Event was successfully saved.',
                cssClass: 'event-save-action-sheet',
                buttons: [
                    { text: 'Keep Form and Edit This Event' },
                    { text: 'Copy form to new Event' },
                    { text: 'Complete event creation and exit' }
                ],
                buttonClicked: function(index) {
                    switch (index) {
                        case 0:
                            break;
                        case 1:
                            delete vm.newAlert.event_id;
                            break;
                        case 2:
                            vm.newAlert = {
                                eventType: null,
                                name: '',
                                objects: [],
                                zones: [],
                                speed_limit: null,
                                isActive: true,
                                system_alert: true,
                                alert_to_email: false,
                                alert_to_sms: false,
                                emails: [''],
                                phones: ['']
                            };
                            break;
                    }

                    return true;
                }
            });
        }

        function isValid() {
            var isValid = false;
            switch (vm.newAlert.eventType) {
                case 'SPEEDING_ALERT':
                    isValid = vm.newAlert.name.length && vm.newAlert.objects.length && vm.newAlert.speed_limit > 0;
                    break;
                case 'ZONE_IN_ALERT':
                case 'ZONE_IN_OUT_ALERT':
                    isValid = vm.newAlert.name.length && vm.newAlert.objects.length && vm.newAlert.zones.length;
                    break;
                case 'MOVEMENT_ALERT':
                case 'CONNECTION_NO_ALERT':
                case 'TOW_ALERT':
                case 'IGNITION_ALERT':
                case 'SOS_ALERT':
                case 'WAKE_ALERT':
                case 'LOW_BATTERY_ALERT':
                    isValid = vm.newAlert.name.length && vm.newAlert.objects.length;
                    break;
            }

            if (vm.newAlert.alert_to_email) {
                isValid = isValid && vm.newAlert.emails.filter(function(email) {
                    return email && email.length > 0;
                }).length > 0;
            }

            if (vm.newAlert.alert_to_sms) {
                isValid = isValid && vm.newAlert.phones.filter(function(phone) {
                    return phone && phone.length > 0;
                }).length > 0;
            }

            return isValid;
        }

        function initByType() {
            switch (vm.newAlert.eventType) {
                case 'MOVEMENT_ALERT':
                    break;
                case 'SPEEDING_ALERT':
                    break;
                case 'ZONE_IN_ALERT':
                    break;
                case 'ZONE_IN_OUT_ALERT':
                    break;
                case 'CONNECTION_NO_ALERT':
                    break;
                case 'TOW_ALERT':
                    break;
                case 'IGNITION_ALERT':
                    break;
                case 'SOS_ALERT':
                    break;
                case 'WAKE_ALERT':
                    break;
                case 'LOW_BATTERY_ALERT':
                    break;
            }
        }

        function formatObjects() {
            return vm.newAlert.objects.map(function(object) {
                return object.name;
            }).join(', ');
        }

        function formatZones() {
            return vm.newAlert.zones.map(function(zone) {
                return zone.name;
            }).join(', ');
        }

        function formatAlertType() {
            return vm.alertTypesList.find(function(alertType) {
                return alertType.value == vm.newAlert.eventType;
            }).title;
        }

        function selectObjects() {
            if (vm.modalIsOpen) {
                return;
            }

            $ionicLoading.show({
                template: '<ion-spinner class="spinner-positive objects-loading-spinner"></ion-spinner>'
            }).then(function() {});

            vm.modalIsOpen = true;

            homeService.getUserObjects(function(objects) {
                $scope.objects = [];

                var compatibleObjects = objectsFilter(vm.newAlert.eventType, false, objects);

                for (var index in compatibleObjects) {
                    var selectedObjects = vm.newAlert.objects.find(function(object) {
                        return object.imei == objects[index].imei;
                    }) || false;

                    $scope.objects.push({
                        imei: compatibleObjects[index].imei,
                        name: compatibleObjects[index].name,
                        selected: !!selectedObjects
                    });
                }

                $ionicLoading.hide().then(function() {});

                var popup = $ionicPopup.show({
                    templateUrl: 'js/create-alert/select_objects.html',
                    cssClass: 'popup-with-search',
                    title: 'Select Objects',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel'
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            vm.newAlert.objects = [];
                            for (var index in $scope.objects) {
                                if ($scope.objects[index].selected) {
                                    vm.newAlert.objects.push($scope.objects[index]);
                                }
                            }
                            return vm.newAlert.objects;
                        }
                    }]
                });

                popup.then(function(res) {
                    vm.modalIsOpen = false;
                });
            });
        }

        function selectZones() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            utilService.getItem("user", function(user) {
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

                promises['zones'] = $http.post(global.baseUrl + "/api/mobilapp/places.php", request).then(function(response) {
                    return response.data;
                });

                var groupRequest = {
                    user_id: user.id,
                    manager_id: user.manager_id,
                    privileges: JSON.parse(user.privileges),
                    cmd: "load_place_group_data",
                };

                promises['groups'] = $http.post(global.baseUrl + "/api/mobilapp/places.php", groupRequest).then(function(response) {
                    return response.data;
                });

                $q.all(promises).then(function(results) {
                    var zones = results.zones;
                    var groups = results.groups;

                    var result = [];
                    for (var i in zones) {
                        var zone = zones[i];

                        zone.data.id = i;
                        zone.data.group = groups[zone.data.group_id].name || "Ungrouped";

                        result.push(zone.data);
                    }

                    $scope.zones = [];
                    for (var index in result) {
                        var selectedZones = vm.newAlert.zones.find(function(zone) {
                            return zone.id == result[index].id;
                        }) || false;

                        $scope.zones.push({
                            id: result[index].id,
                            name: result[index].name,
                            selected: !!selectedZones
                        });
                    }

                    var popup = $ionicPopup.show({
                        templateUrl: 'js/create-alert/select_zones.html',
                        title: 'Select Zones',
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                vm.newAlert.zones = [];
                                for (var index in $scope.zones) {
                                    if ($scope.zones[index].selected) {
                                        vm.newAlert.zones.push($scope.zones[index]);
                                    }
                                }
                                return vm.newAlert.zones;
                            }
                        }]
                    });

                    popup.then(function(res) {
                        vm.modalIsOpen = false;
                    });
                });
            });
        }

        function selectType() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            vm._tmpType = vm.newAlert.eventType;

            $scope.selectedItem = vm.newAlert.eventType;
            $scope.types = vm.alertTypesList;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/create-alert/select_type.html',
                title: 'Select Event Type',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (vm.newAlert.objects.length && vm.newAlert.eventType != $scope.selectedItem && objectsFilter($scope.selectedItem, true).length > 0) {
                            var updatedList = objectsFilter($scope.selectedItem);
                            var removedObjects = objectsFilter($scope.selectedItem, true).map(function(object) {
                                return object.name;
                            }).join(', ');

                            var confirmPopup = $ionicPopup.confirm({
                                title: 'Objects List will change',
                                template: 'Objects ' + removedObjects + ' incompatible with selected event type and will be removed from list. Do you want to continue?'
                            });

                            confirmPopup.then(function(res) {
                                if (res) {
                                    vm.newAlert.objects = updatedList;
                                    vm.newAlert.eventType = $scope.selectedItem;
                                } else {}
                            });
                        } else {
                            vm.newAlert.eventType = $scope.selectedItem;
                        }
                        return vm.newAlert.eventType;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
                if (!res) {
                    vm.newAlert.eventType = vm._tmpType;
                } else {
                    vm.newAlert.eventType = res;
                }

                initByType();
            });
        }

        function objectsFilter(eventType, revert = false, objectsSrc = null) {
            var _objects = vm.newAlert.objects;
            if (objectsSrc) {
                _objects = objectsSrc;
            }

            var objects = [];
            switch (eventType) {
                case 'MOVEMENT_ALERT':
                case 'SPEEDING_ALERT':
                case 'ZONE_IN_ALERT':
                case 'ZONE_IN_OUT_ALERT':
                case 'CONNECTION_NO_ALERT':
                    if (!revert) {
                        objects = _objects;
                    } else {
                        objects = [];
                    }
                    break;
                case 'TOW_ALERT':
                case 'IGNITION_ALERT':
                    if (!revert) {
                        objects = _objects.filter(function(object) {
                            return object.protocol == 'teltonikafm';
                        });
                    } else {
                        objects = _objects.filter(function(object) {
                            return object.protocol != 'teltonikafm';
                        });
                    }
                    break;
                case 'SOS_ALERT':
                case 'WAKE_ALERT':
                    if (!revert) {
                        objects = _objects.filter(function(object) {
                            return object.protocol == 'queclinkgl300' || object.protocol == 'queclinkgl200';
                        });
                    } else {
                        objects = _objects.filter(function(object) {
                            return object.protocol != 'queclinkgl300' && object.protocol != 'queclinkgl200';
                        });
                    }
                    break;
                case 'LOW_BATTERY_ALERT':
                    if (!revert) {
                        objects = _objects.filter(function(object) {
                            return object.protocol == 'queclinkgl300' || object.protocol == 'queclinkgl200' || object.protocol == 'coban' || object.protocol == 'teltonikagh';
                        });
                    } else {
                        objects = _objects.filter(function(object) {
                            return object.protocol != 'queclinkgl300' && object.protocol != 'queclinkgl200' && object.protocol != 'coban' && object.protocol != 'teltonikagh';
                        });
                    }
                    break;
            }

            return objects;
        }
    }
}())