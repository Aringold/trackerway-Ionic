(function () {
  angular.module("starter").factory("userModel", userModel);

  userModel.$inject = ["$q"];

  function userModel($q) {
    var user = null;

    var service = {
      set: set,
      get: get,
      clean: clean
    }

    return service;

    function set(name, value) {
      if (typeof name !== "string") {
        value = name;
        name = false;
      }

      if (name) {
      } else {
        user = value;
      }
    }

    function get(name) {
      if (typeof name !== "string") {
        return user;
      }

      if (user.hasOwnProperty(name)) {
        return user[name];
      }

      return false;
    }

    function clean(name) {
      if (typeof name === "string" && user.hasOwnProperty(name)) {
        user[name] = null;
      }

      if (typeof name !== "string") {
        user = null;
      }

      return;
    }
  }
}());
