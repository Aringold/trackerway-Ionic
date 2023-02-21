(function () {
  angular.module("rewire.myAccount", []);
  angular.module("rewire.myAccount").controller("myAccountController", myAccountController);

  myAccountController.$inject = ["$scope", "myAccountService", "utilService", "$translate", "homeService", "$ionicPopup"];

  function myAccountController($scope, myAccountService, utilService, $translate, homeService, $ionicPopup) {
    var vm = this;
		vm.registrationDate = "";
		vm.expirationDate = "";

		vm.demo = true;

		vm.user = {};
		vm.email = "";
		vm.oldPassword = "";
		vm.newPassword = "";
		vm.confirmNewPassword = "";

		vm.updateEmail = updateEmail;
		vm.updatePassword = updatePassword;

		Chart.pluginService.register({
			beforeDraw: function (chart) {
				if (chart.config.options.elements.center) {
					//Get ctx from string
					var ctx = chart.chart.ctx;

					//Get options from the center object in options
					var centerConfig = chart.config.options.elements.center;
					var fontStyle = centerConfig.fontStyle || 'Arial';
					var txt = centerConfig.text;
					var color = centerConfig.color || '#000';
					var sidePadding = centerConfig.sidePadding || 20;
					var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
						//Start with a base font of 30px
						ctx.font = "35px " + fontStyle;

					//Get the width of the string and also the width of the element minus 10 to give it 5px side padding
					var stringWidth = ctx.measureText(txt).width;
					var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

					// Find out how much the font can grow in width.
					var widthRatio = elementWidth / stringWidth;
					var newFontSize = Math.floor(30 * widthRatio);
					var elementHeight = (chart.innerRadius * 2);

					// Pick a new font size so it will not be larger than the height of label.
					var fontSizeToUse = Math.min(newFontSize, elementHeight);

					//Set font settings to draw it correctly.
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
					var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
					ctx.font = fontSizeToUse+"px " + fontStyle;
					ctx.fillStyle = color;

					//Draw text in center
					ctx.fillText(txt, centerX, centerY);
				}
			}
		});

		vm.objectsChartConfig = {
			type: 'doughnut',
			data: {
				labels: [
					"Objects Used",
					"Total Objects"
				],
				datasets: [{
					data: [],
					backgroundColor: [
						"#2b82d4",
						"#73afe8"
					],
				}]
			},
			options: {
				title: {
					display: false,
					text: 'Object Usage'
				},
				legend: {
					display: false
				},
				tooltips: {
					enabled: false
				},
				responsive:false,
				cutoutPercentage:65,
				elements: {
					center: {
						text: "",
						color: '#329932', // Default is #000000
						fontStyle: 'Arial', // Default is Arial
						sidePadding: 20 // Defualt is 20 (as a percentage)
					}
				}
			}
		};

		vm.daysChartConfig = {
			responsive: true,
			type: 'doughnut',
			data: {
				labels: [
					"Days Remaining"
				],
				datasets: [{
					data: [],
					backgroundColor: [
						"#2b82d4"
					],
				}]
			},
			options: {
				legend: {
					display: false
				},
				tooltips: {
					enabled: false
				},
				responsive:false,
				cutoutPercentage:65,
				elements: {
					center: {
						text: "",
						color: '#329932', // Default is #000000
						fontStyle: 'Arial', // Default is Arial
						sidePadding: 20 // Defualt is 20 (as a percentage)
					}
				}
			}
		};

		utilService.getItem("user", function (user) {
			var user = JSON.parse(user);
			vm.user = user;
			vm.demo = user.username.indexOf("demo") !== -1;

			vm.email = user.email;

      utilService.getItem("lang", function (lang) {
				vm.registrationDate = moment(user.dt_reg).locale(lang).format('LLL');
				vm.expirationDate = moment(user.account_expire_dt).locale(lang).format('LL');
      });

			homeService.getUserObjects(function (objects) {
				var daysRemain = parseInt((new Date(user.obj_days_dt) - new Date()) / (1000 * 60 * 60 * 24));
				vm.daysChartConfig.options.elements.center.text = daysRemain;
				vm.objectsChartConfig.options.elements.center.text = objects.length + "/" + user.obj_limit_num;

				vm.daysChartConfig.data.datasets[0].data = [daysRemain];
				vm.objectsChartConfig.data.datasets[0].data = [objects.length, user.obj_limit_num - objects.length];

				var ctx1 = document.getElementById("doughnut-objects");
				objectsChart = new Chart(ctx1, vm.objectsChartConfig);
				var ctx2 = document.getElementById("doughnut-days");
				daysChart = new Chart(ctx2, vm.daysChartConfig);
			});
		});

		function updateEmail() {
			if (!vm.email.length || vm.email === vm.user.email) {
				return;
			}

			var data = {
				email: vm.email
			};

			myAccountService.updateEmail(data).then(function (result) {
				if (result.data.code == 200) {
					vm.user.email = vm.email;
				}

				console.log(result);

				var popup = $ionicPopup.alert({
					title: result.data.code == 200 ? "Successful" : "Update failed",
					template: result.data.result
				});

				popup.then(function (res) {
					return res;
				});
			}, function (result) {
				var popup = $ionicPopup.alert({
					title: result.data.code == 200 ? "Successful" : "Update failed",
					template: result.data.result
				});

				popup.then(function (res) {
					return res;
				});
			});
		}

		function updatePassword() {
			if (
				!vm.oldPassword.length || 
				!vm.newPassword.length || 
				!vm.confirmNewPassword.length ||
				vm.newPassword !== vm.confirmNewPassword
			) {
				return;
			}

			var data = {
				old_password: vm.oldPassword,
				new_password: vm.newPassword,
				confirm_new_password: vm.confirmNewPassword
			};

			myAccountService.updatePassword(data).then(function (result) {
				console.log(result);

				var popup = $ionicPopup.alert({
					title: result.data.code == 200 ? "Successful" : "Update failed",
					template: result.data.result
				});

				popup.then(function (res) {
					return res;
				});
			}, function (result) {
				var popup = $ionicPopup.alert({
					title: result.data.code == 200 ? "Successful" : "Update failed",
					template: result.data.result
				});

				popup.then(function (res) {
					return res;
				});
			});
		}
  }
}())
