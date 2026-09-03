var AccountRemoveConfirm = (function () {
  var overlay = document.getElementById('account-remove-confirm');
  var nameEl = document.getElementById('account-remove-confirm-name');
  var cancelBtn = document.getElementById('account-remove-confirm-cancel');
  var okBtn = document.getElementById('account-remove-confirm-ok');
  var pendingId = null;

  function open(id) {
    var def = AccountRegistry.get(id);
    pendingId = id;
    nameEl.textContent = def ? def.title : id;
    overlay.hidden = false;
  }

  function close() {
    overlay.hidden = true;
    pendingId = null;
  }

  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  okBtn.addEventListener('click', function () {
    if (pendingId) AccountTabManager.removeItem(pendingId);
    close();
  });

  return { open: open, close: close };
})();
