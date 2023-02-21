(function () {
    angular.module("rewire.about", []).controller("aboutController", aboutController);

    aboutController.$inject = ["$scope"];

    function aboutController($scope) {
        var vm = this;
        vm.objects = [];
        vm.version = '';
        vm.openMarket = openMarket;
        vm.url = '';
        function ionViewWillEnter() {
            const aux = document.getElementsByTagName('META');
            for (let i = 0; i < aux.length; i++) {
                if (aux[i].name === 'version') {
                    vm.version = aux[i].content;
                }
            }
        }

        ionViewWillEnter();

        function openMarket() {
            var isAndroid = navigator.userAgent.match(/android/i) ? true : false;
            var isIOS = navigator.userAgent.match(/(ipod|ipad|iphone)/i) ? true : false;
            if(isIOS){
                vm.url = "https://apps.apple.com/us/app/trackerway/id1440578572?itsct=apps_box_link&itscg=30200";
            } else if (isAndroid) {
                vm.url = "https://play.google.com/store/apps/details?id=com.yd.TrackerWay";
            }
        }
        openMarket();
    }
    

}())
