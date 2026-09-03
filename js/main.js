document.addEventListener('DOMContentLoaded', function () {
  TabManager.init();

  document.getElementById('add-btn').addEventListener('click', function () {
    Picker.open();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
});
