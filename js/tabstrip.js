var TabStrip = (function () {
  var LONG_PRESS_MS = 550;
  var stripEl = document.getElementById('tab-strip');

  function buildTab(moduleId, isActive) {
    var def = ModuleRegistry.get(moduleId);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab-btn' + (isActive ? ' tab-btn--active' : '');
    btn.dataset.moduleId = moduleId;
    btn.setAttribute('aria-label', def ? def.title : moduleId);
    btn.innerHTML = '<span>' + (def ? def.icon : '•') + '</span>';

    var timer = null;
    var longPressed = false;

    function startPress() {
      longPressed = false;
      timer = setTimeout(function () {
        longPressed = true;
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch (e) {}
        }
        RemoveConfirm.open(moduleId);
      }, LONG_PRESS_MS);
    }

    function cancelPress() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    btn.addEventListener('pointerdown', startPress);
    btn.addEventListener('pointerup', cancelPress);
    btn.addEventListener('pointerleave', cancelPress);
    btn.addEventListener('pointercancel', cancelPress);

    btn.addEventListener('click', function () {
      if (longPressed) {
        longPressed = false;
        return;
      }
      TabManager.switchTab(moduleId);
    });

    return btn;
  }

  function render() {
    var active = TabManager.getActive();
    var current = TabManager.getCurrentTab();

    stripEl.innerHTML = '';
    active.forEach(function (moduleId) {
      if (!ModuleRegistry.get(moduleId)) return;
      stripEl.appendChild(buildTab(moduleId, moduleId === current));
    });
  }

  return { render: render };
})();
