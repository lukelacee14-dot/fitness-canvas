var AccountTabStrip = (function () {
  var LONG_PRESS_MS = 550;
  var stripEl = document.getElementById('account-tab-strip');

  function buildTab(id, isActive) {
    var def = AccountRegistry.get(id);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab-btn' + (isActive ? ' tab-btn--active' : '');
    btn.dataset.itemId = id;
    btn.setAttribute('aria-label', def ? def.title : id);
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
        AccountRemoveConfirm.open(id);
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
      AccountTabManager.switchTab(id);
    });

    return btn;
  }

  function render() {
    var active = AccountTabManager.getActive();
    var current = AccountTabManager.getCurrentTab();
    var focused = AccountTabManager.isActiveSource();

    stripEl.innerHTML = '';
    active.forEach(function (id) {
      if (!AccountRegistry.get(id)) return;
      stripEl.appendChild(buildTab(id, focused && id === current));
    });
  }

  return { render: render };
})();
