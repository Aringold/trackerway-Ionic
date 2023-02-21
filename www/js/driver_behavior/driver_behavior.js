(function () {
  angular.module("rewire.driverBehavior", []);
  angular.module("rewire.driverBehavior").controller("driverBehaviorController", driverBehaviorController);

  driverBehaviorController.$inject = ["$scope", "driverBehaviorService", "utilService", "$translate", "$ionicPopup", "$rootScope", "userModel", "objectsModel", "$state"];

  function driverBehaviorController($scope, driverBehaviorService, utilService, $translate, $ionicPopup, $rootScope, userModel, objectsModel, $state) {
    var vm = this;

    var ratingOveriewChart = null;
    var eventsOverviewChart = null;

    vm.working = true;
    vm.modalIsOpen = false;
    vm.hasEvents = driverBehaviorService.hasEvents();
    vm.objects = objectsModel.get();

    vm.overview = driverBehaviorService.getOverview();
    if (vm.overview.ratings.length) {
      vm.working = false;
    }

    driverBehaviorService.initService();

    var interval = setInterval(function () {
      vm.overview = driverBehaviorService.getOverview();
      vm.hasEvents = driverBehaviorService.hasEvents();
      updateCharts();
      if (vm.overview.ratings.length) {
        vm.working = false;
      }
    }, 1000);

    vm.openEventsData = openEventsData;
    vm.openAlerts = openAlerts;
    vm.selectObject = selectObject;
    vm.vehicle = {
      imei: null,
      name: 'All Vehicles'
    }

    drawCharts();

    $scope.$on('$ionicView.leave', function() {
      driverBehaviorService.stopService();
      clearInterval(interval);
    });

    function drawCharts() {
      var chartColors = {
        red: 'rgb(249, 36, 63)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
      };

      var ratingOverviewData = {
        labels: ['A+', 'A', 'B', 'C'],
        datasets: [{
          label: 'Vehicles Amount',
          data: vm.overview.ratings,
          backgroundColor: [chartColors.green, chartColors.blue, chartColors.yellow, chartColors.red]
        }]
      };

      var ratingOverviewCfg = {
        responsive: true,
        type: 'doughnut',
        data: ratingOverviewData,
        options: {
          legend: {
            display: true,
            position: 'bottom'
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

      var eventsOverviewData = {
        labels: ['Overspeed', 'Engine Idle'],
        datasets: [{
          label: 'Events',
          data: [vm.overview.overspeed, vm.overview.idling],
          backgroundColor: [chartColors.green, chartColors.blue]
        }]
      };

      var eventsOverviewCfg = {
        type: 'doughnut',
        data: eventsOverviewData,
        options: {
          title: {
            display: false,
            text: 'Object Usage'
          },
          legend: {
            display: true,
            position: 'bottom'
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


      setTimeout(function () {
        var ctx1 = document.getElementById("rating-overview");
        ratingOveriewChart = new Chart(ctx1, ratingOverviewCfg);
        var ctx2 = document.getElementById("events-overview");
        eventsOverviewChart = new Chart(ctx2, eventsOverviewCfg);
      }, 0);
    }

    function drawVehicleRatingsChart(dates, ratings) {
      var vehicleRatingsData = {
        labels: dates,
        datasets: [{
          label: 'Weekly Ratings',
          data: ratings,
          borderColor: 'rgb(54, 162, 235)',
          pointBorderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor:  'rgb(54, 162, 235)',
          backgroundColor: 'rgb(54, 162, 235)',
          pointBorderWidth: 1,
          fill: false,
          lineTension: 0
        }]
      };

      var vehicleRatingsCfg = {
        type: 'line',
        data: vehicleRatingsData,
        options: {
          title: {
            display: false,
            text: 'Weekly Ratings'
          },
          legend: {
            display: false,
            position: 'bottom'
          },
          tooltips: {
            enabled: false,
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scaleLineColor: "rgba(0,0,0,.2)",
          scaleGridLineColor: "rgba(0,0,0,.05)",
          scaleFontColor: "#c5c7cc",
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: false,
                labelString: 'Date'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: false,
                labelString: 'Rating'
              },
              ticks: {
                min: 0,
                max: 4,
                stepSize: 1,
                suggestedMin: 0.5,
                suggestedMax: 4.5,
                callback: function(label, index, labels) {
                  var ratings = ['0', 'C', 'B', 'A', 'A+'];
                  return ratings[label | 0];
                }
              },
              gridLines: {
                display: false
              }
            }]          
          }        
        }
      };

      setTimeout(function () {
        var ctx1 = document.getElementById("vehicle-ratings");
        var vechileRatingsChart = new Chart(ctx1, vehicleRatingsCfg);
      }, 0);
    }

    function updateCharts() {
      ratingOveriewChart.data.datasets[0].data = vm.overview.ratings;
      ratingOveriewChart.update();

      eventsOverviewChart.data.datasets[0].data = [vm.overview.overspeed, vm.overview.idling];
      eventsOverviewChart.update();
    }

    function showVehicleOverview(vehicle) {
      var ecoscore = null;
      var events = null;
      var date = moment().format('D MMM, YYYY');
      var data = driverBehaviorService.getData();

      var _ratings = ['0', 'C', 'B', 'A', 'A<sup>+</sup>'];

      vehicle.rating = null;
      vehicle.overspeed = 0;
      vehicle.idling = 0;
      vehicle.total = 0;

      if (data.ecoscore.vehicles.hasOwnProperty(vehicle.imei)) {
        ecoscore = data.ecoscore.vehicles[vehicle.imei];
      }
      if (data.events.vehicles.hasOwnProperty(vehicle.imei)) {
        events = data.events.vehicles[vehicle.imei];
      }

      if (events && events.by_days.hasOwnProperty(date)) {
        vehicle.overspeed = events.by_days[date].overspeed;
        vehicle.idling = events.by_days[date].idling;
        vehicle.total = vehicle.overspeed + vehicle.idling;
      }

      if (ecoscore && ecoscore.by_dates.hasOwnProperty(date)) {
        vehicle.rating = ecoscore.by_dates[date].rating == 'A<sup>+</sup>' ? 'A+' : ecoscore.by_dates[date].rating;
      }

      if (vehicle.imei) {
        var dates = [];
        var ratings = [];
        for (let i = 6; i >= 0; i--) {
          var d1 = moment().subtract(i, 'days').format('D MMM');
          var d2 = moment().subtract(i, 'days').format('D MMM, YYYY');
          dates.push(d1);
          if (ecoscore && !ecoscore.by_dates.hasOwnProperty('length') && ecoscore.by_dates.hasOwnProperty(d2)) {
            var rating = _ratings.indexOf(ecoscore.by_dates[d2].rating) >= 0 ? _ratings.indexOf(ecoscore.by_dates[d2].rating) : 0;
            ratings.push(rating);
          } else {
            ratings.push(0);
          }
        }

        drawVehicleRatingsChart(dates, ratings);
      } else {
        drawCharts();
      }
    }

    function openEventsData() {
      if (vm.vehicle.imei == null) {
        $state.go("driver_behavior_events_data");
      } else {
        $state.go("driver_behavior_vehicle_events_data", {imei: vm.vehicle.imei});
      }
    }

    function openAlerts() {
      $state.go("create-alert");
    }

    function selectObject() {
      if (vm.modalIsOpen) {
        return;
      }

      vm.modalIsOpen = true;

      var _tmpDevice = {
        imei: vm.vehicle.imei,
        name: vm.vehicle.name
      };

      $scope.device = _tmpDevice;
      $scope.selectedItem = vm.vehicle.imei;
      $scope.devices = JSON.parse(JSON.stringify(vm.objects));
      $scope.devices.unshift({
        imei: null,
        name: 'All Vehicles'
      });

      $scope.selectItem = function (value) {
        $scope.device = value;
        $scope.selectedItem = value.imei;
      }

      var popup = $ionicPopup.show({
        templateUrl: 'js/driver_behavior/select_object.html',
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
              return $scope.device;
            }
          }
        ]
      });

      popup.then(function(res) {
        vm.modalIsOpen = false;
        if (!res) {
          vm.vehicle.imei = _tmpDevice.imei;
          vm.vehicle.name = _tmpDevice.name;
        } else {
          vm.vehicle.imei = res.imei;
          vm.vehicle.name = res.name;

          showVehicleOverview(vm.vehicle);
        }
      });
    }
  }
}())
