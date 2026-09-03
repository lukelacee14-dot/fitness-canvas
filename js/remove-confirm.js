var RemoveConfirm = (function () {
  var overlay = document.getElementById('remove-confirm');
  var nameEl = document.getElementById('remove-confirm-name');
  var cancelBtn = document.getElementById('remove-confirm-cancel');
  var okBtn = document.getElementById('remove-confirm-ok');
  var pendingId = null;

  function open(moduleId) {
    var def = ModuleRegistry.get(moduleId);
    pendingId = moduleId;
    nameEl.textContent = def ? def.title : moduleId;
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
    if (pendingId) TabManager.removeModule(pendingId);
    close();
  });

  return { open: open, close: close };
})();
