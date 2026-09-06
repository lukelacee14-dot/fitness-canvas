(function () {
  // This module is READ-ONLY: it never persists its own data. It only reads
  // the localStorage keys other modules already own (via Storage.get) and
  // summarizes them. It never calls api.save.

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function renderLineChart(points, formatValue) {
    if (points.length < 2) {
      return '<p class="empty-hint">Log at least 2 entries to see a trend.</p>';
    }

    var values = points.map(function (p) { return p.value; });
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var range = max - min || 1;
    var w = 300, h = 120, pad = 10;

    var coords = points.map(function (p, i) {
      var x = pad + (i / (points.length - 1)) * (w - pad * 2);
      var y = h - pad - ((p.value - min) / range) * (h - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });

    return (
      '<div class="bm-chart-wrap">' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" class="bm-chart" preserveAspectRatio="none">' +
          '<polyline points="' + coords.join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="2"></polyline>' +
        '</svg>' +
        '<div class="bm-chart-labels">' +
          '<span>' + escapeHtml(formatDate(points[0].date)) + ' &middot; ' + escapeHtml(formatValue(points[0].value)) + '</span>' +
          '<span>' + escapeHtml(formatDate(points[points.length - 1].date)) + ' &middot; ' + escapeHtml(formatValue(points[points.length - 1].value)) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function mount(container) {
    container.innerHTML =
      '<div class="pa-section"><h3 class="pa-section__title">Strength Progress</h3><div class="pa-strength"></div></div>' +
      '<div class="pa-section"><h3 class="pa-section__title">Body Trend</h3><div class="pa-body"></div></div>' +
      '<div class="pa-section"><h3 class="pa-section__title">Calorie Trend</h3><div class="pa-calorie"></div></div>' +
      '<div class="pa-section"><h3 class="pa-section__title">Personal Records by Sport</h3><div class="pa-records"></div></div>';

    renderStrengthProgress(container.querySelector('.pa-strength'));
    renderBodyTrend(container.querySelector('.pa-body'));
    renderCalorieTrend(container.querySelector('.pa-calorie'));
    renderPersonalRecords(container.querySelector('.pa-records'));

    function renderStrengthProgress(target) {
      var wl = Storage.get('module:workout-logger', null);
      var entries = wl && wl.entries && wl.entries['strength-training'] ? wl.entries['strength-training'] : [];

      if (entries.length === 0) {
        target.innerHTML = '<p class="empty-hint">Log some sets under Strength Training (inside Workout Logger) to see your strength progress here.</p>';
        return;
      }

      var exerciseNames = [];
      entries.forEach(function (e) {
        if (e.exercise && exerciseNames.indexOf(e.exercise) === -1) exerciseNames.push(e.exercise);
      });
      exerciseNames.sort();

      target.innerHTML = '<div class="pb-chips"></div><div class="pa-strength-detail"></div>';
      var chipsEl = target.querySelector('.pb-chips');
      var detailEl = target.querySelector('.pa-strength-detail');

      function showExercise(name) {
        var matching = entries
          .filter(function (e) { return e.exercise === name && typeof e.weight === 'number'; })
          .slice()
          .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

        if (matching.length === 0) {
          detailEl.innerHTML = '<p class="empty-hint">No weight logged for this exercise yet.</p>';
          return;
        }

        var best = matching.reduce(function (b, e) { return e.weight > b.weight ? e : b; }, matching[0]);
        var points = matching.map(function (e) { return { date: e.date, value: e.weight }; });

        detailEl.innerHTML =
          renderLineChart(points, function (v) { return v + ' lbs/kg'; }) +
          '<div class="pa-best">Best set: <strong>' + escapeHtml(String(best.weight)) + '</strong>' +
            (best.reps ? ' &times; ' + escapeHtml(String(best.reps)) + ' reps' : '') +
            ' on ' + escapeHtml(formatDate(best.date)) + '</div>';
      }

      exerciseNames.forEach(function (name, i) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pb-chip' + (i === 0 ? ' pb-chip--active' : '');
        chip.textContent = name;
        chip.addEventListener('click', function () {
          chipsEl.querySelectorAll('.pb-chip').forEach(function (c) { c.classList.remove('pb-chip--active'); });
          chip.classList.add('pb-chip--active');
          showExercise(name);
        });
        chipsEl.appendChild(chip);
      });

      showExercise(exerciseNames[0]);
    }

    function renderBodyTrend(target) {
      var bm = Storage.get('module:body-measurements', null);
      var entries = (bm && bm.entries ? bm.entries : []).filter(function (e) { return typeof e.weight === 'number'; });

      if (entries.length === 0) {
        target.innerHTML = '<p class="empty-hint">Log your weight under Body Measurements to see a trend here.</p>';
        return;
      }

      var sorted = entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
      var points = sorted.map(function (e) { return { date: e.date, value: e.weight }; });

      target.innerHTML = renderLineChart(points, function (v) { return v + ' lbs/kg'; });
    }

    function renderCalorieTrend(target) {
      var mt = Storage.get('module:meal-tracker', null);
      var days = mt && mt.days ? mt.days : {};

      var points = [];
      for (var i = 29; i >= 0; i--) {
        var date = addDays(todayStr(), -i);
        var day = days[date];
        var total = 0;
        if (day) {
          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(function (section) {
            (day[section] || []).forEach(function (entry) { total += entry.calories || 0; });
          });
        }
        points.push({ date: date, value: total });
      }

      var loggedPoints = points.filter(function (p) { return p.value > 0; });
      if (loggedPoints.length === 0) {
        target.innerHTML = '<p class="empty-hint">Log some meals under Meal Tracker to see your calorie trend here.</p>';
        return;
      }

      var avg = Math.round(loggedPoints.reduce(function (s, p) { return s + p.value; }, 0) / loggedPoints.length);

      target.innerHTML =
        '<div class="sl-avg"><span class="sl-avg__label">30-Day Avg (logged days)</span><span class="sl-avg__value">' + avg + ' kcal</span></div>' +
        renderLineChart(points, function (v) { return v + ' kcal'; });
    }

    function renderPersonalRecords(target) {
      var records = PRComputation.computeRecords();

      if (records.length === 0) {
        target.innerHTML = '<p class="empty-hint">Log some workouts under Workout Logger to see personal records here.</p>';
        return;
      }

      target.innerHTML = records.map(function (rec) {
        var rows = rec.rows.map(function (row) {
          return '<div class="pa-record-row"><span class="pa-record-row__name">' + escapeHtml(row.name) + '</span>' +
            '<span class="pa-record-row__value">' + escapeHtml(row.value) + '</span></div>' +
            (row.date ? '<div class="pa-record-row__date">' + escapeHtml(formatDate(row.date)) + '</div>' : '');
        }).join('');
        return '<div class="pa-record-card"><h4 class="pa-record-card__title">' + escapeHtml(rec.title) + '</h4>' + rows + '</div>';
      }).join('');
    }
  }

  ModuleRegistry.register({
    id: 'progress-analytics',
    title: 'Progress & Analytics',
    icon: '📈',
    mount: mount
  });
})();
