(function () {
  angular.module("starter").service("localStorageProvider", localStorageProvider);

  localStorageProvider.$inject = ["$q", "localStorage"];

  function localStorageProvider($q, localStorage) {
    var service = {
      set: set,
      get: get,
      remove: remove
    }

    return service;

    function set(name, value) {
    }

    function get(name) {
    }

    function remove(name) {
    }
  }
}());
