var AccountTabManager = (function () {
  var active = Storage.get('accountActive', []);
  var currentTab = Storage.get('accountCurrentTab', null);
  var screenEl = document.getElementById('screen');

  function persist() {
    Storage.set('accountActive', active);
    Storage.set('accountCurrentTab', currentTab);
  }

  function markActive() {
    Storage.set('lastActiveSource', 'account');
  }

  function isActiveSource() {
    return Storage.get('lastActiveSource', 'tool') === 'account';
  }

  function makeApi(id) {
    var key = 'account-module:' + id;
    return {
      load: function (fallback) { return Storage.get(key, fallback); },
      save: function (value) { Storage.set(key, value); }
    };
  }

  function showEmpty() {
    screenEl.innerHTML = '<p class="screen-empty">Tap + to add an account item.</p>';
  }

  function renderScreen() {
    if (!currentTab || active.indexOf(currentTab) === -1) {
      showEmpty();
      return;
    }

    var def = AccountRegistry.get(currentTab);
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

  function switchTab(id) {
    if (active.indexOf(id) === -1) return;
    currentTab = id;
    persist();
    markActive();
    renderScreen();
    if (window.AccountTabStrip) window.AccountTabStrip.render();
    if (window.TabStrip) window.TabStrip.render();
  }

  function addItem(id) {
    if (active.indexOf(id) === -1) {
      active.push(id);
    }
    currentTab = id;
    persist();
    markActive();
    if (window.AccountTabStrip) window.AccountTabStrip.render();
    renderScreen();
    if (window.TabStrip) window.TabStrip.render();
  }

  function removeItem(id) {
    active = active.filter(function (i) { return i !== id; });
    var wasCurrent = currentTab === id;
    if (wasCurrent) currentTab = null;
    persist();
    if (window.AccountTabStrip) window.AccountTabStrip.render();
    if (wasCurrent && isActiveSource()) renderScreen();
  }

  function init() {
    if (currentTab && active.indexOf(currentTab) === -1) {
      currentTab = null;
    }
    if (window.AccountTabStrip) window.AccountTabStrip.render();
    if (isActiveSource()) renderScreen();
  }

  function getActive() { return active.slice(); }
  function getCurrentTab() { return currentTab; }

  return {
    init: init,
    addItem: addItem,
    removeItem: removeItem,
    switchTab: switchTab,
    getActive: getActive,
    getCurrentTab: getCurrentTab,
    isActiveSource: isActiveSource
  };
})();
