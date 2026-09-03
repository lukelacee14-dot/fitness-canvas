var TabManager = (function () {
  var active = Storage.get('active', []);
  var currentTab = Storage.get('currentTab', null);
  var screenEl = document.getElementById('screen');

  function persist() {
    Storage.set('active', active);
    Storage.set('currentTab', currentTab);
  }

  function makeApi(moduleId) {
    var key = 'module:' + moduleId;
    return {
      load: function (fallback) { return Storage.get(key, fallback); },
      save: function (value) { Storage.set(key, value); }
    };
  }

  function showEmpty() {
    screenEl.innerHTML = '<p class="screen-empty">Tap + to add your first tool.</p>';
  }

  function renderScreen() {
    if (!currentTab || active.indexOf(currentTab) === -1) {
      showEmpty();
      return;
    }

    var def = ModuleRegistry.get(currentTab);
    if (!def) {
      showEmpty();
      return;
    }

    screenEl.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML =
      '<span class="screen-header__icon">' + (def.icon || '') + '</span>' +
      '<span class="screen-header__title">' + def.title + '</span>';
    screenEl.appendChild(header);

    var body = document.createElement('div');
    body.className = 'screen-body';
    screenEl.appendChild(body);

    def.mount(body, makeApi(currentTab));
  }

  function switchTab(moduleId) {
    if (active.indexOf(moduleId) === -1) return;
    currentTab = moduleId;
    persist();
    renderScreen();
    if (window.TabStrip) window.TabStrip.render();
  }

  function addModule(moduleId) {
    if (active.indexOf(moduleId) === -1) {
      active.push(moduleId);
    }
    currentTab = moduleId;
    persist();
    if (window.TabStrip) window.TabStrip.render();
    renderScreen();
  }

  function removeModule(moduleId) {
    active = active.filter(function (id) { return id !== moduleId; });
    var wasCurrent = currentTab === moduleId;
    if (wasCurrent) currentTab = null;
    persist();
    if (window.TabStrip) window.TabStrip.render();
    if (wasCurrent) renderScreen();
  }

  function init() {
    if (currentTab && active.indexOf(currentTab) === -1) {
      currentTab = null;
    }
    if (window.TabStrip) window.TabStrip.render();
    renderScreen();
  }

  function getActive() { return active.slice(); }
  function getCurrentTab() { return currentTab; }

  return {
    init: init,
    addModule: addModule,
    removeModule: removeModule,
    switchTab: switchTab,
    getActive: getActive,
    getCurrentTab: getCurrentTab
  };
})();
