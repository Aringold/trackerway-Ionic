(function () {
  angular.module("rewire.trackerConfig").service("trackerConfigService", trackerConfigService);

  trackerConfigService.$inject = [];

  function trackerConfigService() {
    var selectedObject;
    var selectedType;

    var service = {
      getObjectTypes: getObjectTypes,

      setSelectedObject: setSelectedObject,
      getSelectedObject: getSelectedObject,

      setSelectedType: setSelectedType,
      getSelectedType: getSelectedType
    }

    return service;
    ////////////////////////////////////
    function getObjectTypes() {
      var objectTypes = [];
      objectTypes.push({name: "Rewire Security 102-NANO", type: 'coban'});
      objectTypes.push({name: "Rewire Security 103-RS", type: 'coban'});
      objectTypes.push({name: "Rewire Security 104-PRO", type: 'coban'});
      objectTypes.push({name: "Rewire Security 303-FLEET", type: 'coban'});
      objectTypes.push({name: "Rewire Security OBD Plug and Play", type: 'coban'});
      objectTypes.push({name: "Rewire Security DB1", type: 'teltonika'});
      objectTypes.push({name: "Rewire Security DB1-LITE", type: 'teltonika'});
      objectTypes.push({name: "Rewire Security DB3", type: 'teltonika'});
      objectTypes.push({name: "Teltonika FM1 Series", type: 'teltonika'});
      objectTypes.push({name: "Teltonika FM5 Series", type: 'teltonika'});
      objectTypes.push({name: "Queclink GL200", type: 'queclink'});
      objectTypes.push({name: "Queclink GL300", type: 'queclink'});
      objectTypes.push({name: "Concox GT06", type: 'concox'});
      objectTypes.push({name: "Concox GT100", type: 'concox'});
      objectTypes.push({name: "Concox TR06", type: 'concox'});
      return objectTypes;
    }

    function getSelectedObject() {
      return selectedObject;
    }

    function setSelectedObject(object) {
      selectedObject = object;
    }

    function getSelectedType() {
      return selectedType;
    }

    function setSelectedType(type) {
      selectedType = type;
    }
  }

}())
