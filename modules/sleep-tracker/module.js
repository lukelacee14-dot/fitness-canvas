(function () {
  var QUALITY_OPTIONS = ['Poor', 'Fair', 'Good', 'Great'];

  function uid() {
    return 'sl' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    var d = new Date();
    var localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    return new Date(localMs).toISOString().slice(0, 10);
  }

  function addDays(dateStr, delta) {
    var parts = dateStr.split('-');
    var d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
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
      '<div class="sl-avg"></div>' +
      '<form class="sl-form">' +
        '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
        '<div class="field-row"><label>Duration (hours)<input type="number" name="duration" step="any" min="0" inputmode="decimal"></label></div>' +
        '<div class="field-row"><label>Sleep Quality<select name="quality"><option value=""></option>' +
          QUALITY_OPTIONS.map(function (q) { return '<option value="' + q + '">' + q + '</option>'; }).join('') +
        '</select></label></div>' +
        '<div class="field-row field-row--3">' +
          '<label>Bedtime<input type="time" name="bedtime"></label>' +
          '<label>Wake Time<input type="time" name="wakeTime"></label>' +
        '</div>' +
        '<button type="submit" class="btn-primary">Add Entry</button>' +
      '</form>' +
      '<div class="sl-log"></div>';

    var avgEl = container.querySelector('.sl-avg');
    var form = container.querySelector('.sl-form');
    var logEl = container.querySelector('.sl-log');

    function computeWeeklyAvg() {
      var cutoff = addDays(todayStr(), -6);
      var recent = data.entries.filter(function (e) { return e.date >= cutoff && e.duration !== undefined; });
      if (recent.length === 0) return null;
      var sum = recent.reduce(function (s, e) { return s + e.duration; }, 0);
      return Math.round((sum / recent.length) * 10) / 10;
    }

    function renderAvg() {
      var avg = computeWeeklyAvg();
      avgEl.innerHTML =
        '<span class="sl-avg__label">7-Day Avg Sleep</span>' +
        '<span class="sl-avg__value">' + (avg !== null ? avg + ' hrs' : '—') + '</span>';
    }

    function renderLog() {
      logEl.innerHTML = '';

      if (data.entries.length === 0) {
        logEl.innerHTML = '<p class="empty-hint">No sleep logged yet.</p>';
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
          if (entry.duration !== undefined) summary.push(entry.duration + ' hrs');
          if (entry.quality) summary.push(entry.quality);
          if (entry.bedtime) summary.push('Bed ' + entry.bedtime);
          if (entry.wakeTime) summary.push('Wake ' + entry.wakeTime);

          var row = document.createElement('div');
          row.className = 'mt-row';
          row.innerHTML =
            '<div class="mt-row__text">' +
              '<span class="mt-row__name">' + (summary.length ? escapeHtml(summary.join(' · ')) : 'Entry') + '</span>' +
            '</div>';

          var delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'row-delete';
          delBtn.setAttribute('aria-label', 'Delete entry');
          delBtn.textContent = '✕';
          delBtn.addEventListener('click', function () {
            data.entries = data.entries.filter(function (e) { return e.id !== entry.id; });
            save();
            renderDynamic();
          });

          row.appendChild(delBtn);
          group.appendChild(row);
        });

        logEl.appendChild(group);
      });
    }

    function renderDynamic() {
      renderAvg();
      renderLog();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var entry = { id: uid(), date: fd.get('date') || todayStr() };

      var durationRaw = (fd.get('duration') || '').toString().trim();
      if (durationRaw !== '') entry.duration = Number(durationRaw);
      var quality = (fd.get('quality') || '').toString().trim();
      if (quality) entry.quality = quality;
      var bedtime = (fd.get('bedtime') || '').toString().trim();
      if (bedtime) entry.bedtime = bedtime;
      var wakeTime = (fd.get('wakeTime') || '').toString().trim();
      if (wakeTime) entry.wakeTime = wakeTime;

      data.entries.push(entry);
      save();
      renderDynamic();
      form.reset();
      form.querySelector('[name="date"]').value = todayStr();
    });

    renderDynamic();
  }

  ModuleRegistry.register({
    id: 'sleep-tracker',
    title: 'Sleep Tracker',
    icon: '😴',
    mount: mount
  });
})();
