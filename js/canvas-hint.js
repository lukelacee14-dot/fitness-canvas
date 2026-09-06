var CanvasHint = (function () {
  var SHOWN_KEY = 'canvasHintShown';
  var DURATION_MS = 4800;

  function show() {
    if (Storage.get(SHOWN_KEY, false) === true) return;
    Storage.set(SHOWN_KEY, true);

    var addBtn = document.getElementById('add-btn');
    var hint = document.getElementById('canvas-hint');
    if (!addBtn || !hint) return;

    addBtn.classList.add('bar-add--pulse');
    hint.hidden = false;
    requestAnimationFrame(function () {
      hint.classList.add('canvas-hint--visible');
    });

    setTimeout(function () {
      addBtn.classList.remove('bar-add--pulse');
      hint.classList.remove('canvas-hint--visible');
      setTimeout(function () { hint.hidden = true; }, 300);
    }, DURATION_MS);
  }

  return { show: show };
})();
