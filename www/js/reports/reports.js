(function() {
    angular.module("rewire.reports", ["ionic", "pdfjsViewer"]);
    angular.module("rewire.reports").controller("reportsController", reportsController);

    reportsController.$inject = ["$scope", "$translate", "reportsService", "$ionicPopup", "homeService", "utilService", "$http", "$q", "global", "toastr", "$window", "$cordovaSocialSharing"];

    function reportsController($scope, $translate, reportsService, $ionicPopup, homeService, utilService, $http, $q, global, toastr, $window, $cordovaSocialSharing) {
        var vm = this;

        vm.dataItems = {
            "general": [
                { name: "Route start", value: "route_start" },
                { name: "Route end", value: "route_end" },
                { name: "Route length", value: "route_length" },
                { name: "Move duration", value: "move_duration" },
                { name: "Stop duration", value: "stop_duration" },
                { name: "Stop count", value: "stop_count" },
                { name: "Top speed", value: "top_speed" },
                { name: "Average speed", value: "avg_speed" },
                { name: "Overspeed count", value: "overspeed_count" },
                { name: "Fuel consumption", value: "fuel_consumption" },
                { name: "Fuel cost", value: "fuel_cost" },
                { name: "Engine work", value: "engine_work" },
                { name: "Engine idle", value: "engine_idle" },
                { name: "Odometer", value: "odometer" },
                { name: "Engine hours", value: "engine_hours" },
                { name: "Driver", value: "driver" },
                { name: "Trailer", value: "trailer" }
            ],
            "proximity": [
                { name: "Status", value: "status" },
                { name: "Start", value: "start" },
                { name: "End", value: "end" },
                { name: "Duration", value: "duration" },
                { name: "Move duration", value: "move_duration" },
                { name: "Stop duration", value: "stop_duration" },
                { name: "Route length", value: "route_length" },
                { name: "Top speed", value: "top_speed" },
                { name: "Average speed", value: "avg_speed" },
                { name: "Fuel consumption", value: "fuel_consumption" },
                { name: "Fuel cost", value: "fuel_cost" },
                { name: "Engine work", value: "engine_work" },
                { name: "Engine idle", value: "engine_idle" }
            ],
            "drives_stops": [
                { name: "Status", value: "status" },
                { name: "Start", value: "start" },
                { name: "End", value: "end" },
                { name: "Duration", value: "duration" },
                { name: "Move duration", value: "move_duration" },
                { name: "Stop duration", value: "stop_duration" },
                { name: "Route length", value: "route_length" },
                { name: "Top speed", value: "top_speed" },
                { name: "Average speed", value: "avg_speed" },
                { name: "Fuel consumption", value: "fuel_consumption" },
                { name: "Fuel cost", value: "fuel_cost" },
                { name: "Engine work", value: "engine_work" },
                { name: "Engine idle", value: "engine_idle" }
            ],
            "overspeed": [
                { name: "Start", value: "start" },
                { name: "End", value: "end" },
                { name: "Duration", value: "duration" },
                { name: "Top speed", value: "top_speed" },
                { name: "Average speed", value: "avg_speed" },
                { name: "Overspeed position", value: "overspeed_position" }
            ],
            "zone_in_out": [
                { name: "Zone in", value: "zone_in" },
                { name: "Zone out", value: "zone_out" },
                { name: "Duration", value: "duration" },
                { name: "Route length", value: "route_length" },
                { name: "Zone name", value: "zone_name" },
                { name: "Zone position", value: "zone_position" }
            ],
            "travel_sheet": [
                { name: "Time A", value: "time_a" },
                { name: "Position A", value: "position_a" },
                { name: "Time B", value: "time_b" },
                { name: "Position B", value: "position_b" },
                { name: "Duration", value: "duration" },
                { name: "Route length", value: "route_length" },
                { name: "Fuel consumption", value: "fuel_consumption" },
                { name: "Fuel cost", value: "fuel_cost" },
                { name: "Total", value: "total" }
            ]
        };

        vm.currentDataItems = vm.dataItems.general;
        $scope.displayMode = { text: "VIEW_REPORT", value: "view" };

        vm.stopsList = [
            { title: '> 1 min', value: 1 },
            { title: '> 2 min', value: 2 },
            { title: '> 5 min', value: 5 },
            { title: '> 10 min', value: 10 },
            { title: '> 20 min', value: 20 },
            { title: '> 30 min', value: 30 },
            { title: '> 1 h', value: 60 },
            { title: '> 2 h', value: 120 },
            { title: '> 5 h', value: 300 }
        ];
        vm.distancesList = [
            { title: '< 10 m', value: 10 },
            { title: '< 20 m', value: 20 },
            { title: '< 50 m', value: 50 },
            { title: '< 100 m', value: 100 },
            { title: '< 200 m', value: 200 },
            { title: '< 300 m', value: 300 },
            { title: '< 1 km', value: 1000 },
            { title: '< 2 km', value: 2000 },
            { title: '< 5 km', value: 5000 },
            { title: '< 10 km', value: 10000 }
        ];
        vm.formatsList = [
            { title: 'HTML', value: 'html' },
            { title: 'PDF', value: 'pdf' },
            { title: 'XLS', value: 'xls' }
        ];
        vm.periodsList = [
            { title: 'Last Hour', value: 1 },
            { title: 'Today', value: 2 },
            { title: 'Yesterday', value: 3 },
            { title: 'Before 2 days', value: 4 },
            { title: 'Before 3 days', value: 5 },
            { title: 'This week', value: 6 },
            { title: 'Last week', value: 7 },
            { title: 'This month', value: 8 },
            { title: 'Last month', value: 9 }
        ];

        vm.form = {
            type: 'general',
            name: '',
            objects: [],
            zones: [],
            data_items: vm.currentDataItems,
            show_coordinates: false,
            show_addresses: true,
            show_markers: true,
            zones_instead_of_addresses: true,
            stops: '1',
            distance_between_vehicles: '10',
            speed_limit: '',
            format: 'html',
            time_period: '2'
        };

        $scope.modeList = [
            { text: "VIEW_REPORT", value: "view" },
            { text: "SHARING_REPORT", value: "sharing" },
        ];

        $scope.changeMode = function(item) {
            $scope.displayMode.value = item.value;
        };

        vm.selectObjects = selectObjects;
        vm.selectZones = selectZones;
        vm.selectDataItems = selectDataItems;

        vm.selectFormat = selectFormat;
        vm.selectTimePeriod = selectTimePeriod;
        vm.selectStops = selectStops;
        vm.selectDistance = selectDistance;

        vm.formatObjects = formatObjects;
        vm.formatZones = formatZones;
        vm.formatDataItems = formatDataItems;

        vm.formatFormat = formatFormat;
        vm.formatTimePeriod = formatTimePeriod;
        vm.formatStops = formatStops;
        vm.formatDistance = formatDistance;

        vm.updateDataItems = updateDataItems;

        vm.generateReport = generateReport;

        vm.isFormValid = isFormValid;

        vm.modalIsOpen = false;

        vm._tmpType = 'general';

        vm.pdfData = null;

        function formatObjects() {
            return vm.form.objects.map(function(object) {
                return object.name;
            }).join(', ');
        }

        function formatZones() {
            return vm.form.zones.map(function(zone) {
                return zone.name;
            }).join(', ');
        }

        function formatDataItems() {
            return vm.form.data_items.map(function(data_item) {
                return data_item.name;
            }).join(', ');
        }

        function formatFormat() {
            return vm.formatsList.find(function(format) {
                return format.value == vm.form.format;
            }).title;
        }

        function formatTimePeriod() {
            return vm.periodsList.find(function(period) {
                return period.value == vm.form.time_period;
            }).title;
        }

        function formatStops() {
            return vm.stopsList.find(function(stop) {
                return stop.value == vm.form.stops;
            }).title;
        }

        function formatDistance() {
            return vm.distancesList.find(function(distance) {
                return distance.value == vm.form.distance_between_vehicles;
            }).title;
        }

        function updateDataItems() {
            vm.currentDataItems = vm.dataItems[vm.form.type];
            vm.form.data_items = vm.currentDataItems;
        }

        function selectObjects() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            homeService.getUserObjects(function(objects) {
                $scope.objects = [];
                for (var index in objects) {
                    var selectedObjects = vm.form.objects.find(function(object) {
                        return object.imei == objects[index].imei;
                    }) || false;

                    $scope.objects.push({
                        imei: objects[index].imei,
                        name: objects[index].name,
                        selected: !!selectedObjects
                    });
                }

                var popup = $ionicPopup.show({
                    templateUrl: 'js/reports/select_objects.html',
                    title: 'Select objects',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel'
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            vm.form.objects = [];
                            for (var index in $scope.objects) {
                                if ($scope.objects[index].selected) {
                                    vm.form.objects.push($scope.objects[index]);
                                }
                            }
                            return vm.form.objects;
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
                        var selectedZones = vm.form.zones.find(function(zone) {
                            return zone.id == result[index].id;
                        }) || false;

                        $scope.zones.push({
                            id: result[index].id,
                            name: result[index].name,
                            selected: !!selectedZones
                        });
                    }

                    var popup = $ionicPopup.show({
                        templateUrl: 'js/reports/select_zones.html',
                        title: 'Select zones',
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                vm.form.zones = [];
                                for (var index in $scope.zones) {
                                    if ($scope.zones[index].selected) {
                                        vm.form.zones.push($scope.zones[index]);
                                    }
                                }
                                return vm.form.zones;
                            }
                        }]
                    });

                    popup.then(function(res) {
                        vm.modalIsOpen = false;
                    });
                });
            });
        }

        function selectDataItems() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            $scope.data_items = [];
            for (var index in vm.currentDataItems) {
                var selectedDataItems = vm.form.data_items.find(function(data_item) {
                    return data_item.value == vm.currentDataItems[index].value;
                }) || false;

                $scope.data_items.push({
                    value: vm.currentDataItems[index].value,
                    name: vm.currentDataItems[index].name,
                    selected: !!selectedDataItems
                });
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/reports/select_data_items.html',
                title: 'Select data items',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        vm.form.data_items = [];
                        for (var index in $scope.data_items) {
                            if ($scope.data_items[index].selected) {
                                vm.form.data_items.push($scope.data_items[index]);
                            }
                        }
                        return vm.form.data_items;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
            });
        }

        function selectFormat() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            vm._tmpType = vm.form.type;

            $scope.selectedItem = vm.form.format;
            $scope.formats = vm.formatsList;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/reports/select_format.html',
                title: 'Select Report Format',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        vm.form.format = $scope.selectedItem;
                        return vm.form.format;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
                vm.form.type = vm._tmpType;
            });
        }

        function selectTimePeriod() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            vm._tmpType = vm.form.type;

            $scope.selectedItem = vm.form.time_period;
            $scope.periods = vm.periodsList;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/reports/select_time_period.html',
                title: 'Select Time Period',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        vm.form.time_period = $scope.selectedItem;
                        return vm.form.time_period;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
                vm.form.type = vm._tmpType;
            });
        }

        function selectStops() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            vm._tmpType = vm.form.type;

            $scope.selectedItem = vm.form.stop;
            $scope.stops = vm.stopsList;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/reports/select_stop.html',
                title: 'Select Stops',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        vm.form.stops = $scope.selectedItem;
                        return vm.form.stops;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
                vm.form.type = vm._tmpType;
            });
        }

        function selectDistance() {
            if (vm.modalIsOpen) {
                return;
            }

            vm.modalIsOpen = true;

            vm._tmpType = vm.form.type;

            $scope.selectedItem = vm.form.distance_between_vehicles;
            $scope.distances = vm.distancesList;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/reports/select_distance.html',
                title: 'Select Distance',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        vm.form.distance_between_vehicles = $scope.selectedItem;
                        return vm.form.distance_between_vehicles;
                    }
                }]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
                vm.form.type = vm._tmpType;
            });
        }

        function getDtf() {
            var dtf = moment().format('YYYY-MM-DD+HH:mm:ss');
            var period = parseInt(vm.form.time_period);
            switch (period) {
                case 1:
                    dtf = moment().format('YYYY-MM-DD+HH:00:00');
                    break;
                case 2:
                    dtf = moment().format('YYYY-MM-DD+00:00:00');
                    break;
                case 3:
                    dtf = moment().subtract('1', 'day').format('YYYY-MM-DD+00:00:00');
                    break;
                case 4:
                    dtf = moment().subtract('2', 'days').format('YYYY-MM-DD+00:00:00');
                    break;
                case 5:
                    dtf = moment().subtract('3', 'days').format('YYYY-MM-DD+00:00:00');
                    break;
                case 6:
                    dtf = moment().startOf('isoWeek').format('YYYY-MM-DD+00:00:00');
                    break;
                case 7:
                    dtf = moment().subtract('1', 'week').startOf('isoWeek').format('YYYY-MM-DD+00:00:00');
                    break;
                case 8:
                    dtf = moment().startOf('month').format('YYYY-MM-DD+00:00:00');
                    break;
                case 9:
                    dtf = moment().subtract('1', 'month').startOf('month').format('YYYY-MM-DD+00:00:00');
                    break;
            }

            return dtf;
        }

        function getDtt() {
            var dtt = moment().format('YYYY-MM-DD+HH:mm:ss');
            var period = parseInt(vm.form.time_period);
            switch (period) {
                case 1:
                    dtt = moment().add('1', 'hour').format('YYYY-MM-DD+HH:00:00');
                    break;
                case 2:
                    dtt = moment().add('1', 'day').format('YYYY-MM-DD+00:00:00');
                    break;
                case 3:
                    dtt = moment().format('YYYY-MM-DD+00:00:00');
                    break;
                case 4:
                    dtt = moment().subtract('1', 'days').format('YYYY-MM-DD+00:00:00');
                    break;
                case 5:
                    dtt = moment().subtract('2', 'days').format('YYYY-MM-DD+00:00:00');
                    break;
                case 6:
                    dtt = moment().endOf('isoWeek').format('YYYY-MM-DD+00:00:00');
                    break;
                case 7:
                    dtt = moment().startOf('isoWeek').format('YYYY-MM-DD+00:00:00');
                    break;
                case 8:
                    dtt = moment().endOf('month').format('YYYY-MM-DD+00:00:00');
                    break;
                case 9:
                    dtt = moment().startOf('month').format('YYYY-MM-DD+00:00:00');
                    break;
            }

            return dtt;
        }

        function generateReport() {
            utilService.getItem("user", function(user) {
                var user = JSON.parse(user);

                var request = {
                    "user_id": user.id,
                    "manager_id": user.manager_id,
                    "privileges": JSON.parse(user.privileges),
                    "dst": user.dst,
                    "dst_start": user.dst_start,
                    "dst_end": user.dst_end,
                    "timezone": user.timezone,
                    "unit_distance": user.units.split(',')[0],
                    "currency": user.currency,
                    "cmd": "report",
                    "data_items": vm.form.data_items.map(function(data_item) {
                        return data_item.value;
                    }).join(","),
                    "dtf": getDtf(),
                    "dtt": getDtt(),
                    "format": vm.form.format,
                    "imei": vm.form.objects.map(function(object) {
                        return object.imei;
                    }).join(","),
                    "name": vm.form.name,
                    "proximity_distance": vm.form.distance_between_vehicles,
                    "sensor_names": "",
                    "show_addresses": vm.form.show_addresses,
                    "show_coordinates": vm.form.show_coordinates,
                    "show_markers": vm.form.show_markers,
                    "speed_limit": vm.form.speed_limit,
                    "stop_duration": vm.form.stops,
                    "type": vm.form.type,
                    "zone_ids": vm.form.zones.map(function(zone) {
                        return zone.id;
                    }).join(","),
                    "zones_addresses": vm.form.zones_instead_of_addresses
                };

                if ($scope.displayMode.value == 'view') {
                    request.format = "pdf";
                    toastr.info("Starting to download the report", null, {
                        timeOut: 5000
                    });

                    $http.post(global.baseUrl + "/api/mobilapp/reports.php", request).then(function(response) {
                        if (response.data.code != 200) {
                            toastr.warning("Unable to download report", null, {
                                timeOut: 5000
                            });

                            return;
                        }

                        toastr.info("Report successfully downloaded", null, {
                            timeOut: 5000
                        });

                        var filename = vm.form.name + "_" + vm.form.type + "_" + formatObjects() + '_' + getDtf().replace("+", "_") + "_" + getDtt().replace("+", "_");
                        filename = filename.replace(/[^\w]/g, '_');
                        filename += "." + vm.form.format;
                        var mime = 'application/pdf'

                        $scope.pdfData = Uint8Array.from(atob(response.data.result), function(c) {
                            return c.charCodeAt(0);
                        });

                        vm.modalIsOpen = true;

                        var popup = $ionicPopup.show({
                            templateUrl: 'js/reports/view_report.html',
                            cssClass: 'view-report',
                            title: vm.form.type + ' report: ' + vm.form.name,
                            scope: $scope,
                            buttons: [{
                                text: 'OK',
                                type: 'button-positive'
                            }]
                        });

                        popup.then(function(res) {
                            vm.modalIsOpen = false;
                        });

                        /*
                        var file = 'df:' + filename + ';data:' + mime + ';base64,' + response.data.result;

                        var blobPdf = b64toBlob(response.data.result, mime, 512);
                        console.log(JSON.stringify($cordovaFile));
                        console.log($cordovaFile.externalRootDirectory);
                        $cordovaFile.writeFile($cordovaFile.externalRootDirectory, filename, blobPdf, { replace: true }).then(function(res) {
                            console.log(res);
                            console.log('wres', res);
                            $cordovaFile.fileOpener.open(res.toInternalURL(), 'application/pdf').then(function(ores) {
                                console.log('ores', ores)
                            }).catch(function(err) {
                                console.log('open error');
                            });
                        });
                        var VIEWER_OPTIONS = {
                            documentView: {
                                closeLabel: "Fertig"
                            },
                            navigationView: {
                                closeLabel: "Zurück"
                            },
                            email: {
                                enabled: false
                            },
                            print: {
                                enabled: true
                            },
                            openWith: {
                                enabled: false
                            },
                            bookmarks: {
                                enabled: false
                            },
                            search: {
                                enabled: false
                            },
                            autoClose: {
                                onPause: false
                            }
                        }
                        window.cordova.plugins.SitewaertsDocumentViewer.canViewDocument(
                            file, mime, VIEWER_OPTIONS);
                        */
                    });
                } else {
                    toastr.info("Starting to download the report", null, {
                        timeOut: 5000
                    });

                    $http.post(global.baseUrl + "/api/mobilapp/reports.php", request).then(function(response) {
                        if (response.data.code != 200) {
                            toastr.warning("Unable to download report", null, {
                                timeOut: 5000
                            });

                            return;
                        }

                        toastr.info("Report successfully downloaded", null, {
                            timeOut: 5000
                        });

                        var filename = vm.form.name + "_" + vm.form.type + "_" + formatObjects() + '_' + getDtf().replace("+", "_") + "_" + getDtt().replace("+", "_");
                        filename = filename.replace(/[^\w]/g, '_');
                        filename += "." + vm.form.format;
                        var mime = {
                            html: 'text/html',
                            pdf: 'application/pdf',
                            xls: 'application/vnd.ms-excel'
                        };

                        var file = 'df:' + filename + ';data:' + mime[vm.form.type] + ';base64,' + response.data.result;

                        $cordovaSocialSharing.canShareViaEmail().then(function(result) {
                            $cordovaSocialSharing.shareViaEmail('Report', 'Tracking Platform: Report', [], null, null, file).then(function(result) {
                                toastr.info("Report successfully sent", null, {
                                    timeOut: 5000
                                });
                            }, function(err) {
                                toastr.warning("Can not send report", null, {
                                    timeOut: 5000
                                });
                            });
                        }, function(err) {
                            toastr.warning("Please configure default mail client", null, {
                                timeOut: 5000
                            });
                        });
                    });
                }
            });
        }

        function isFormValid() {
            return vm.form.name.length && vm.form.objects.length && vm.form.data_items.length;
        }

        var b64toBlob = function(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }
    }
})();