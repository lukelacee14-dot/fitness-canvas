document.addEventListener('DOMContentLoaded', function () {
  TabManager.init();
  AccountTabManager.init();

  document.getElementById('add-btn').addEventListener('click', function () {
    Picker.open();
  });

  document.getElementById('account-add-btn').addEventListener('click', function () {
    AccountPicker.open();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  var splash = document.getElementById('app-splash');
  if (splash) {
    requestAnimationFrame(function () {
      splash.classList.add('app-splash--hidden');
      setTimeout(function () { splash.remove(); }, 300);
    });
  }
});
