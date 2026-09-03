var MoreSheet = (function () {
  var overlay = document.getElementById('more-sheet');
  var listEl = document.getElementById('more-sheet-list');
  var closeBtn = document.getElementById('more-sheet-close');

  function renderList() {
    listEl.innerHTML = '';
    var active = CanvasManager.getActive();
    if (active.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">No tools added yet.</p>';
      return;
    }

    active.forEach(function (moduleId) {
      var def = ModuleRegistry.get(moduleId);
      if (!def) return;

      var row = document.createElement('div');
      row.className = 'more-sheet__row';

      var label = document.createElement('button');
      label.type = 'button';
      label.className = 'more-sheet__label';
      label.innerHTML = '<span>' + def.icon + '</span><span>' + def.title + '</span>';
      label.addEventListener('click', function () {
        CanvasManager.scrollToModule(moduleId);
        close();
      });

      var pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = 'icon-btn';
      pinBtn.setAttribute('aria-label', 'Toggle pin');
      pinBtn.textContent = CanvasManager.isPinned(moduleId) ? '★' : '☆';
      pinBtn.addEventListener('click', function () {
        CanvasManager.togglePin(moduleId);
        pinBtn.textContent = CanvasManager.isPinned(moduleId) ? '★' : '☆';
      });

      row.appendChild(label);
      row.appendChild(pinBtn);
      listEl.appendChild(row);
    });
  }

  function open() {
    renderList();
    overlay.hidden = false;
  }

  function close() {
    overlay.hidden = true;
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  return { open: open, close: close };
})();
