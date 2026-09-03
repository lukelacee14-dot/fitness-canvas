document.addEventListener('DOMContentLoaded', function () {
  CanvasManager.init();
  BottomBar.render();

  document.getElementById('add-btn').addEventListener('click', function () {
    Picker.open();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
});
