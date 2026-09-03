var Picker = (function () {
  var overlay = document.getElementById('picker');
  var listEl = document.getElementById('picker-list');
  var closeBtn = document.getElementById('picker-close');
  var built = false;

  function buildToolRow(tool) {
    var row = document.createElement('div');
    row.className = 'picker-tool' + (tool.status !== 'live' ? ' picker-tool--soon' : '');

    var text = document.createElement('div');
    text.className = 'picker-tool__text';
    text.innerHTML =
      '<span class="picker-tool__title">' + tool.title + '</span>' +
      '<span class="picker-tool__desc">' + tool.description + '</span>';
    row.appendChild(text);

    if (tool.status === 'live') {
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      var activate = function () {
        TabManager.addModule(tool.id);
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

  function buildSection(category) {
    var section = document.createElement('section');
    section.className = 'picker-section';

    var header = document.createElement('button');
    header.type = 'button';
    header.className = 'picker-section__header';
    header.innerHTML =
      '<span>' + category.category + '</span><span class="picker-section__chevron">&#8964;</span>';
    header.addEventListener('click', function () {
      section.classList.toggle('picker-section--collapsed');
    });

    var body = document.createElement('div');
    body.className = 'picker-section__body';
    category.tools.forEach(function (tool) { body.appendChild(buildToolRow(tool)); });

    section.appendChild(header);
    section.appendChild(body);
    return section;
  }

  function build() {
    if (built) return;
    CATALOG.forEach(function (category) { listEl.appendChild(buildSection(category)); });
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
