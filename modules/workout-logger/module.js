(function () {
  function uid() {
    return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
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

    container.innerHTML =
      '<form class="wl-form">' +
        '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
        '<div class="field-row"><label>Exercise<input type="text" name="exercise" placeholder="e.g. Bench Press" required></label></div>' +
        '<div class="field-row field-row--3">' +
          '<label>Sets<input type="number" name="sets" min="0" inputmode="numeric"></label>' +
          '<label>Reps<input type="number" name="reps" min="0" inputmode="numeric"></label>' +
          '<label>Weight<input type="number" name="weight" min="0" step="0.5" inputmode="decimal"></label>' +
        '</div>' +
        '<div class="field-row"><label>Notes<input type="text" name="notes" placeholder="optional"></label></div>' +
        '<button type="submit" class="btn-primary">Add Set</button>' +
      '</form>' +
      '<div class="wl-log"></div>';

    var form = container.querySelector('.wl-form');
    var logEl = container.querySelector('.wl-log');

    function save() { api.save(data); }

    function render() {
      logEl.innerHTML = '';
      if (data.entries.length === 0) {
        logEl.innerHTML = '<p class="empty-hint">No sets logged yet.</p>';
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

        var table = document.createElement('table');
        table.className = 'wl-table';
        table.innerHTML = '<thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Notes</th><th></th></tr></thead>';

        var tbody = document.createElement('tbody');
        byDate[date].forEach(function (entry) {
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td>' + escapeHtml(entry.exercise) + '</td>' +
            '<td>' + (entry.sets || '') + '</td>' +
            '<td>' + (entry.reps || '') + '</td>' +
            '<td>' + (entry.weight || '') + '</td>' +
            '<td>' + escapeHtml(entry.notes || '') + '</td>' +
            '<td></td>';

          var delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'row-delete';
          delBtn.setAttribute('aria-label', 'Delete row');
          delBtn.textContent = '✕';
          delBtn.addEventListener('click', function () {
            data.entries = data.entries.filter(function (e) { return e.id !== entry.id; });
            save();
            render();
          });
          tr.lastElementChild.appendChild(delBtn);
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        group.appendChild(table);
        logEl.appendChild(group);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var exercise = (fd.get('exercise') || '').toString().trim();
      if (!exercise) return;

      data.entries.push({
        id: uid(),
        date: fd.get('date') || todayStr(),
        exercise: exercise,
        sets: fd.get('sets') ? Number(fd.get('sets')) : null,
        reps: fd.get('reps') ? Number(fd.get('reps')) : null,
        weight: fd.get('weight') ? Number(fd.get('weight')) : null,
        notes: (fd.get('notes') || '').toString().trim()
      });

      save();
      render();
      form.reset();
      form.querySelector('[name="date"]').value = todayStr();
      form.querySelector('[name="exercise"]').focus();
    });

    render();
  }

  ModuleRegistry.register({
    id: 'workout-logger',
    title: 'Workout Logger',
    icon: '🏋️',
    mount: mount
  });
})();
