(function () {
  function uid() {
    return 'sr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    var d = new Date();
    var localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    return new Date(localMs).toISOString().slice(0, 10);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function mount(container, api) {
    var data = api.load({ entries: [] });
    if (!data.entries) data.entries = [];

    function save() { api.save(data); }

    container.innerHTML =
      '<form class="sr-form">' +
        '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
        '<div class="field-row"><label>Overall Soreness (1-10)<input type="number" name="soreness" min="1" max="10" step="1" inputmode="numeric"></label></div>' +
        '<div class="field-row"><label>Sore Muscle Groups<input type="text" name="notes" placeholder="e.g. legs, lower back"></label></div>' +
        '<div class="field-row"><label>RPE — Training Effort (1-10)<input type="number" name="rpe" min="1" max="10" step="1" inputmode="numeric"></label></div>' +
        '<button type="submit" class="btn-primary">Add Entry</button>' +
      '</form>' +
      '<div class="sr-log"></div>';

    var form = container.querySelector('.sr-form');
    var logEl = container.querySelector('.sr-log');

    function renderLog() {
      logEl.innerHTML = '';

      if (data.entries.length === 0) {
        logEl.innerHTML = '<p class="empty-hint">No entries logged yet.</p>';
        return;
      }

      var byDate = {};
      data.entries.forEach(function (e) {
        if (!byDate[e.date]) byDate[e.date] = [];
        byDate[e.date].push(e);
      });

      var dates = Object.keys(byDate).sort().reverse();
      dates.forEach(function (date) {
        var group = document.createElement('div');
        group.className = 'wl-group';

        var heading = document.createElement('h4');
        heading.className = 'wl-group__date';
        heading.textContent = formatDate(date);
        group.appendChild(heading);

        byDate[date].forEach(function (entry) {
          var summary = [];
          if (entry.soreness !== undefined) summary.push('Soreness ' + entry.soreness + '/10');
          if (entry.rpe !== undefined) summary.push('RPE ' + entry.rpe + '/10');

          var row = document.createElement('div');
          row.className = 'mt-row';
          row.innerHTML =
            '<div class="mt-row__text">' +
              '<span class="mt-row__name">' + (summary.length ? escapeHtml(summary.join(' · ')) : 'Entry') + '</span>' +
              (entry.notes ? '<span class="mt-row__macros">' + escapeHtml(entry.notes) + '</span>' : '') +
            '</div>';

          var delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'row-delete';
          delBtn.setAttribute('aria-label', 'Delete entry');
          delBtn.textContent = '✕';
          delBtn.addEventListener('click', function () {
            data.entries = data.entries.filter(function (e) { return e.id !== entry.id; });
            save();
            renderLog();
          });

          row.appendChild(delBtn);
          group.appendChild(row);
        });

        logEl.appendChild(group);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var entry = { id: uid(), date: fd.get('date') || todayStr() };

      var soreRaw = (fd.get('soreness') || '').toString().trim();
      if (soreRaw !== '') entry.soreness = Number(soreRaw);
      var notes = (fd.get('notes') || '').toString().trim();
      if (notes) entry.notes = notes;
      var rpeRaw = (fd.get('rpe') || '').toString().trim();
      if (rpeRaw !== '') entry.rpe = Number(rpeRaw);

      data.entries.push(entry);
      save();
      renderLog();
      form.reset();
      form.querySelector('[name="date"]').value = todayStr();
    });

    renderLog();
  }

  ModuleRegistry.register({
    id: 'soreness-rpe-log',
    title: 'Soreness/RPE Log',
    icon: '💪',
    mount: mount
  });
})();
