var CanvasManager = (function () {
  var active = Storage.get('active', []);
  var pinned = Storage.get('pinned', []);
  var canvasEl = document.getElementById('canvas');
  var cardEls = {};

  function persist() {
    Storage.set('active', active);
    Storage.set('pinned', pinned);
  }

  function makeApi(moduleId) {
    var key = 'module:' + moduleId;
    return {
      load: function (fallback) { return Storage.get(key, fallback); },
      save: function (value) { Storage.set(key, value); }
    };
  }

  function renderCard(moduleId) {
    var def = ModuleRegistry.get(moduleId);
    if (!def) return null;

    var card = document.createElement('section');
    card.className = 'module-card';
    card.dataset.moduleId = moduleId;

    var header = document.createElement('div');
    header.className = 'module-card__header';

    var titleWrap = document.createElement('div');
    titleWrap.className = 'module-card__title';
    titleWrap.innerHTML =
      '<span class="module-card__icon">' + (def.icon || '') + '</span><span>' + def.title + '</span>';

    var actions = document.createElement('div');
    actions.className = 'module-card__actions';

    var pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = 'icon-btn module-card__pin';
    pinBtn.setAttribute('aria-label', 'Pin to bottom bar');
    pinBtn.textContent = pinned.indexOf(moduleId) !== -1 ? '★' : '☆';
    pinBtn.addEventListener('click', function () { togglePin(moduleId); });

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'icon-btn module-card__remove';
    removeBtn.setAttribute('aria-label', 'Remove from canvas');
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', function () { removeModule(moduleId); });

    actions.appendChild(pinBtn);
    actions.appendChild(removeBtn);
    header.appendChild(titleWrap);
    header.appendChild(actions);

    var body = document.createElement('div');
    body.className = 'module-card__body';

    card.appendChild(header);
    card.appendChild(body);
    canvasEl.appendChild(card);
    cardEls[moduleId] = card;

    def.mount(body, makeApi(moduleId));
    return card;
  }

  function togglePin(moduleId) {
    var idx = pinned.indexOf(moduleId);
    if (idx === -1) {
      pinned.push(moduleId);
    } else {
      pinned.splice(idx, 1);
    }
    persist();

    var card = cardEls[moduleId];
    if (card) {
      var pinBtn = card.querySelector('.module-card__pin');
      if (pinBtn) pinBtn.textContent = pinned.indexOf(moduleId) !== -1 ? '★' : '☆';
    }
    if (window.BottomBar) window.BottomBar.render();
  }

  function addModule(moduleId) {
    if (active.indexOf(moduleId) !== -1) {
      scrollToModule(moduleId);
      return;
    }
    active.push(moduleId);
    persist();

    var card = renderCard(moduleId);
    if (card) {
      card.classList.add('module-card--new');
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { card.classList.remove('module-card--new'); }, 1600);
    }
    if (window.BottomBar) window.BottomBar.render();
    updateEmptyState();
  }

  function removeModule(moduleId) {
    var def = ModuleRegistry.get(moduleId);
    var card = cardEls[moduleId];
    if (def && def.unmount && card) {
      try { def.unmount(card.querySelector('.module-card__body')); } catch (e) {}
    }
    if (card) card.remove();
    delete cardEls[moduleId];

    active = active.filter(function (id) { return id !== moduleId; });
    var wasPinned = pinned.indexOf(moduleId) !== -1;
    pinned = pinned.filter(function (id) { return id !== moduleId; });
    persist();

    if (wasPinned && window.BottomBar) window.BottomBar.render();
    updateEmptyState();
  }

  function scrollToModule(moduleId) {
    var card = cardEls[moduleId];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.classList.add('module-card--highlight');
      setTimeout(function () { card.classList.remove('module-card--highlight'); }, 900);
    }
  }

  function updateEmptyState() {
    var emptyEl = document.getElementById('canvas-empty');
    if (emptyEl) emptyEl.hidden = active.length > 0;
  }

  function init() {
    active.forEach(function (moduleId) {
      if (ModuleRegistry.get(moduleId)) renderCard(moduleId);
    });
    updateEmptyState();
  }

  function isPinned(moduleId) { return pinned.indexOf(moduleId) !== -1; }
  function getActive() { return active.slice(); }
  function getPinned() { return pinned.slice(); }

  return {
    init: init,
    addModule: addModule,
    removeModule: removeModule,
    togglePin: togglePin,
    scrollToModule: scrollToModule,
    isPinned: isPinned,
    getActive: getActive,
    getPinned: getPinned
  };
})();
