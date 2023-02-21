(function () {
  angular.module("starter").service("cachingProvider", cachingProvider);

  cachingProvider.$inject = ["$q"];

  function cachingProvider($q) {
    var service = {
      set: set,
      get: get,
      remove: remove
    }

    return service;

    function set(name, value, options) {
    }

    function get(name, options) {
    }

    function remove(name, options) {
    }
  }
}());
