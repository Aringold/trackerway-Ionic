var objectStateEventRegistered = false;
var objectRefreshInterval;
(function () {
    angular.module("rewire.gprsCommand", []);

    angular.module("rewire.gprsCommand").controller("gprsCommandController", gprsCommandController);

    gprsCommandController.$inject = ["$scope", "gprsCommandService", "utilService", "global", "$timeout", "$state", "homeService", "toastr", "$ionicPopup", "$rootScope", "$interval", "$http", "$translate", "$ionicHistory", "objectsModel"];

    function gprsCommandController($scope, gprsCommandService, utilService, global, $timeout, $state, homeService, toastr, $ionicPopup, $rootScope, $interval, $http, $translate, $ionicHistory, objectsModel) {
        var vm = this;
        vm.objects = [];

        vm.demo = false;
        vm.subuser = false;
        vm.modalIsOpen = false;
        vm.modalIcons = true;
        vm.icons = [];
        vm.imgBaseUrl = global.baseUrl + "/img/markers/objects/";
        vm.baseUrl = global.baseUrl + "/";
        vm.disconnected = false;
        vm.working = false;

				vm.commands = [];
				vm.templates = [];
				vm.cmdForm = {
					imei: "",
  				name: "",
					gateway: "gprs",
					template: "Custom",
					type: "ascii",
					command: "",
					sim_number: ""
				};
        vm._tmpDevice = null;

        checkIfDemoUser();

        $scope.$on("$ionicView.beforeEnter", function () {
            getUserObjects();
            getCommandsList();
            getTemplatesList();
        });

				vm.sendCommand = sendCommand;
				vm.deleteCommand = deleteCommand;
				vm.updateForm = updateForm;
				vm.selectObject = selectObject;

				$scope.$watch(function () {
					return vm.cmdForm.template;
				}, function (value) {
					updateForm();
				});

        $scope.showAscii = function (event) {
          event.target.classList.toggle('ui-icon-minus');
          var idTarget = event.target.id.split('-')[1]
          var asciiDiv = document.getElementById(`${idTarget}`);
          vm.commands.forEach((item) => {
            if (item.id === asciiDiv.id && event.target.classList.contains('ui-icon-minus')) {
              if (item.ascii === '') {
                asciiDiv.innerHTML = 'No data'
              } else {
                asciiDiv.innerHTML = item.ascii
              }
            } else if (item.id === asciiDiv.id && event.target.classList.contains('ui-icon-plus')) {
              asciiDiv.innerHTML = ''
            }
          })
        }

        function checkIfDemoUser() {
            utilService.getItem("user", function (user) {
                var user = JSON.parse(user);
                vm.demo = user.username.indexOf("demo") !== -1;
                var privileges = JSON.parse(user.privileges);
                vm.subuser = privileges.type == 'subuser';
            });
        }

        function getUserObjects() {
            vm.objects = objectsModel.get();
            vm.cmdForm.imei = vm.objects[0].imei;
            vm.cmdForm.name = vm.objects[0].name;
        }

				function updateForm() {
					var template = false;
					for (let index in vm.templates) {
						if (vm.templates[index].name == vm.cmdForm.template) {
							template = vm.templates[index];
						}
					}

					if (!template) {
						return;
					}

					vm.cmdForm = {
						imei: vm.cmdForm.imei,
						gateway: template.gateway,
						template: template.name,
						type: template.type,
						command: template.cmd,
						sim_number: ""
					};
				}

        function getCommandsList() {
            if (vm.demo || vm.subuser) {
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
                return;
            }

						vm.working = true;

						gprsCommandService.getCommands().then(function (commands) {
							vm.commands = commands;
							vm.working = false;
						});
        }
        function getTemplatesList() {
            if (vm.demo || vm.subuser) {
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
                return;
            }

						gprsCommandService.getTemplates().then(function (templates) {
							vm.templates = templates;
						});
        }

        function selectObject() {
          if (vm.modalIsOpen) {
            return;
          }

          vm.modalIsOpen = true;

          vm._tmpDevice = {
            imei: vm.cmdForm.imei,
            name: vm.cmdForm.name
          };

          $scope.device = vm._tmpDevice;
          $scope.selectedItem = vm.cmdForm.imei;
          $scope.devices = vm.objects;

          $scope.selectItem = function (value) {
            $scope.device = value;
            $scope.selectedItem = value.imei;
          }

          var popup = $ionicPopup.show({
            templateUrl: 'js/gprs_command/select_device.html',
            cssClass: 'popup-with-search',
            title: 'Select Device',
            scope: $scope,
            buttons: [
              {
                text: 'Cancel'
              }, {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  vm.cmdForm.imei = $scope.device.imei;
                  vm.cmdForm.name = $scope.device.name;

                  return $scope.device;
                }
              }
            ]
          });

          popup.then(function(res) {
            vm.modalIsOpen = false;
            if (!res) {
              vm.cmdForm.imei = vm._tmpDevice.imei;
              vm.cmdForm.name = vm._tmpDevice.name;
            } else {
              vm.cmdForm.imei = res.imei;
              vm.cmdForm.name = res.name;
            }
          });
        }

        function sendCommand($event) {
            if (vm.demo) {
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
                $event.stopPropagation();
                $event.preventDefault();
                return;
            }

						gprsCommandService.sendCommand(
							vm.cmdForm.command,
							vm.cmdForm.gateway,
							vm.cmdForm.imei,
							vm.cmdForm.template,
							vm.cmdForm.sim_number,
							vm.cmdForm.type
						).then(function (result) {
							getCommandsList();
						});

            $event.stopPropagation();
            $event.preventDefault();
        }

        function deleteCommand($event, cmdId) {
            if (vm.demo || vm.subuser) {
                toastr.warning(capitalizeFirstLetter(translations[$translate.use()]["NO_PRIV"]));
                $event.stopPropagation();
                $event.preventDefault();
                return;
            }

						var confirmPopup = $ionicPopup.confirm({
							title: capitalizeFirstLetter(translations[$translate.use()]["GPRS_COMMAND"]),
							template: capitalizeFirstLetter(translations[$translate.use()]["WANT_TO_DELETE"]),
							cancelText: capitalizeFirstLetter(translations[$translate.use()]["CANCEL"]),
							okText: capitalizeFirstLetter(translations[$translate.use()]["OK"])
						});

						confirmPopup.then(function (res) {
							if (res) {
								gprsCommandService.deleteCommand(cmdId).then(function (result) {
									getCommandsList();
								});
							} else {

							}
						});

            $event.stopPropagation();
            $event.preventDefault();
        }

        var commands = {
            update_interval: {
                "30sec": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,30,60,30,60,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "60sec": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,60,60,60,60,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "5min": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,300,300,300,300,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "10min": "AT+GTFRI=ujhf8w,1,0,,,0000,0000,600,600,600,600,1F,1000,1000,0,1,50,1,0,1,FFFF$",
                "disab": "AT+GTFRI=ujhf8w,0,0,,,0000,0000,600,600,600,600,1F,1000,1000,0,1,50,1,0,1,FFFF$"
            },
            led_indicators: {
                "on": "AT+GTCFG=ujhf8w,ujhf8w,GL300,1,0.0,1,5,1F,1,,7DEF,0,1,1,3600,1,0,20491231235959,1,0,,FFFF$",
                "off": "AT+GTCFG=ujhf8w,ujhf8w,GL300,1,0.0,1,5,1F,1,,7DEF,0,0,1,3600,1,0,20491231235959,1,0,,FFFF$"
            },
            heartbeat: {
                "on": "AT+GTSRI=ujhf8w,3,,1,spytrackgps.co.uk,11604,144.76.58.21,11604,,25,1,0,0,,,FFFF$",
                "off": "AT+GTSRI=ujhf8w,2,,1,spytrackgps.co.uk,11604,144.76.58.21,11604,,25,0,0,0,,,FFFF$"
            }
        }
    }

}())
