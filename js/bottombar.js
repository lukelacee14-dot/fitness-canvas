var BottomBar = (function () {
  var CAPACITY = 4;
  var leftEl = document.getElementById('bottom-bar-left');
  var rightEl = document.getElementById('bottom-bar-right');

  function slotButton(moduleId) {
    var def = ModuleRegistry.get(moduleId);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bar-slot';
    btn.setAttribute('aria-label', def ? def.title : moduleId);
    btn.innerHTML = '<span>' + (def ? def.icon : '•') + '</span>';
    btn.addEventListener('click', function () { CanvasManager.scrollToModule(moduleId); });
    return btn;
  }

  function moreButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bar-slot bar-slot--more';
    btn.setAttribute('aria-label', 'More active tools');
    btn.innerHTML = '<span>&#8942;</span>';
    btn.addEventListener('click', function () { MoreSheet.open(); });
    return btn;
  }

  function render() {
    var pinned = CanvasManager.getPinned().filter(function (id) { return ModuleRegistry.get(id); });
    leftEl.innerHTML = '';
    rightEl.innerHTML = '';

    var overflow = pinned.length > CAPACITY;
    var slots = overflow ? pinned.slice(0, CAPACITY - 1) : pinned.slice(0, CAPACITY);

    var left = slots.slice(0, 2);
    var right = slots.slice(2);

    left.forEach(function (id) { leftEl.appendChild(slotButton(id)); });
    right.forEach(function (id) { rightEl.appendChild(slotButton(id)); });
    if (overflow) rightEl.appendChild(moreButton());
  }

  return { render: render };
})();
