var ModuleRegistry = (function () {
  var modules = {};

  function register(definition) {
    modules[definition.id] = definition;
  }

  function get(id) {
    return modules[id];
  }

  function all() {
    return Object.keys(modules).map(function (id) { return modules[id]; });
  }

  return { register: register, get: get, all: all };
})();
