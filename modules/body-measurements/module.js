(function () {
  var FIELDS = [
    { key: 'weight', label: 'Weight (lbs/kg)' },
    { key: 'bodyFatPct', label: 'Body Fat %' },
    { key: 'waist', label: 'Waist (in/cm)' },
    { key: 'chest', label: 'Chest (in/cm)' },
    { key: 'hips', label: 'Hips (in/cm)' },
    { key: 'arms', label: 'Arms (in/cm)' },
    { key: 'thighs', label: 'Thighs (in/cm)' },
    { key: 'neck', label: 'Neck (in/cm)' }
  ];

  function shortLabel(label) {
    return label.replace(/\s*\(.*\)/, '');
  }

  function uid() {
    return 'bm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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
      '<div class="bm-nav">' +
        '<button type="button" class="bm-nav-btn bm-nav-btn--active" data-view="log">Log</button>' +
        '<button type="button" class="bm-nav-btn" data-view="trends">Trends</button>' +
      '</div>' +
      '<div class="bm-view" data-view="log"></div>' +
      '<div class="bm-view" data-view="trends" hidden></div>';

    var navBtns = container.querySelectorAll('.bm-nav-btn');
    var logEl = container.querySelector('.bm-view[data-view="log"]');
    var trendsEl = container.querySelector('.bm-view[data-view="trends"]');

    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        navBtns.forEach(function (b) { b.classList.remove('bm-nav-btn--active'); });
        btn.classList.add('bm-nav-btn--active');
        var view = btn.dataset.view;
        logEl.hidden = view !== 'log';
        trendsEl.hidden = view !== 'trends';
        if (view === 'trends') renderTrends();
      });
    });

    function renderLogShell() {
      logEl.innerHTML =
        '<form class="bm-form">' +
          '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
          FIELDS.map(function (f) {
            return '<div class="field-row"><label>' + f.label +
              '<input type="number" name="' + f.key + '" step="any" inputmode="decimal"></label></div>';
          }).join('') +
          '<button type="submit" class="btn-primary">Add Entry</button>' +
        '</form>' +
        '<div class="bm-log"></div>';

      var form = logEl.querySelector('.bm-form');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var entry = { id: uid(), date: fd.get('date') || todayStr() };
        FIELDS.forEach(function (f) {
          var raw = (fd.get(f.key) || '').toString().trim();
          if (raw !== '') entry[f.key] = Number(raw);
        });
        data.entries.push(entry);
        save();
        renderLogList();
        form.reset();
        form.querySelector('[name="date"]').value = todayStr();
      });

      renderLogList();
    }

    function renderLogList() {
      var listEl = logEl.querySelector('.bm-log');
      listEl.innerHTML = '';

      if (data.entries.length === 0) {
        listEl.innerHTML = '<p class="empty-hint">No measurements logged yet.</p>';
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
          var summary = FIELDS
            .filter(function (f) { return entry[f.key] !== undefined; })
            .map(function (f) { return shortLabel(f.label) + ' ' + entry[f.key]; });

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
            renderLogList();
          });

          row.appendChild(delBtn);
          group.appendChild(row);
        });

        listEl.appendChild(group);
      });
    }

    function renderTrends() {
      var available = FIELDS.filter(function (f) {
        return data.entries.some(function (e) { return e[f.key] !== undefined; });
      });

      if (available.length === 0) {
        trendsEl.innerHTML = '<p class="empty-hint">Log a few entries to see trends.</p>';
        return;
      }

      trendsEl.innerHTML =
        '<div class="bm-metric-chips"></div>' +
        '<div class="bm-chart-wrap"></div>';

      var chipsEl = trendsEl.querySelector('.bm-metric-chips');
      var chartWrap = trendsEl.querySelector('.bm-chart-wrap');

      function renderChart(key, label) {
        var points = data.entries
          .filter(function (e) { return e[key] !== undefined; })
          .slice()
          .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

        if (points.length < 2) {
          chartWrap.innerHTML = '<p class="empty-hint">Need at least 2 entries for ' + escapeHtml(shortLabel(label)) + ' to show a trend.</p>';
          return;
        }

        var values = points.map(function (p) { return p[key]; });
        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);
        var range = max - min || 1;
        var w = 300, h = 120, pad = 10;

        var coords = points.map(function (p, i) {
          var x = pad + (i / (points.length - 1)) * (w - pad * 2);
          var y = h - pad - ((p[key] - min) / range) * (h - pad * 2);
          return x.toFixed(1) + ',' + y.toFixed(1);
        });

        chartWrap.innerHTML =
          '<svg viewBox="0 0 ' + w + ' ' + h + '" class="bm-chart" preserveAspectRatio="none">' +
            '<polyline points="' + coords.join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="2"></polyline>' +
          '</svg>' +
          '<div class="bm-chart-labels">' +
            '<span>' + formatDate(points[0].date) + ' · ' + points[0][key] + '</span>' +
            '<span>' + formatDate(points[points.length - 1].date) + ' · ' + points[points.length - 1][key] + '</span>' +
          '</div>';
      }

      available.forEach(function (f, i) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pb-chip' + (i === 0 ? ' pb-chip--active' : '');
        chip.textContent = shortLabel(f.label);
        chip.addEventListener('click', function () {
          chipsEl.querySelectorAll('.pb-chip').forEach(function (c) { c.classList.remove('pb-chip--active'); });
          chip.classList.add('pb-chip--active');
          renderChart(f.key, f.label);
        });
        chipsEl.appendChild(chip);
      });

      renderChart(available[0].key, available[0].label);
    }

    renderLogShell();
  }

  ModuleRegistry.register({
    id: 'body-measurements',
    title: 'Body Measurements',
    icon: '📏',
    mount: mount
  });
})();
