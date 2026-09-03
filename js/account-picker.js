var AccountPicker = (function () {
  var overlay = document.getElementById('account-picker');
  var listEl = document.getElementById('account-picker-list');
  var closeBtn = document.getElementById('account-picker-close');
  var built = false;

  function buildRow(item) {
    var row = document.createElement('div');
    row.className = 'picker-tool' + (item.status !== 'live' ? ' picker-tool--soon' : '');

    var text = document.createElement('div');
    text.className = 'picker-tool__text';
    text.innerHTML = '<span class="picker-tool__title">' + item.title + '</span>';
    row.appendChild(text);

    if (item.status === 'live') {
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      var activate = function () {
        AccountTabManager.addItem(item.id);
        close();
      };
      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    } else {
      var badge = document.createElement('span');
      badge.className = 'picker-tool__badge';
      badge.textContent = 'Coming Soon';
      row.appendChild(badge);
      row.setAttribute('aria-disabled', 'true');
    }

    return row;
  }

  function build() {
    if (built) return;
    ACCOUNT_CATALOG.forEach(function (item) { listEl.appendChild(buildRow(item)); });
    built = true;
  }

  function open() {
    build();
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
