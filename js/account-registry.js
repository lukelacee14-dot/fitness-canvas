var AccountRegistry = (function () {
  var items = {};

  function register(definition) {
    items[definition.id] = definition;
  }

  function get(id) {
    return items[id];
  }

  function all() {
    return Object.keys(items).map(function (id) { return items[id]; });
  }

  return { register: register, get: get, all: all };
})();
