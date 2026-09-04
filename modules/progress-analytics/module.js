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

  function parseDurationMinutes(text) {
    if (typeof text !== 'string' || text.trim() === '') return NaN;
    var parts = text.trim().split(':').map(Number);
    if (parts.some(function (n) { return isNaN(n); })) return NaN;
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
    if (parts.length === 2) return parts[0] + parts[1] / 60;
    return parts[0];
  }

  function formatMinutes(mins) {
    var h = Math.floor(mins / 60);
    var m = Math.round(mins - h * 60);
    return h > 0 ? (h + 'h ' + m + 'm') : (m + ' min');
  }

  var SPORT_TITLES = {
    run: 'Run', 'trail-run': 'Trail Run', treadmill: 'Treadmill',
    'road-bike': 'Road Bike', 'mountain-bike': 'Mountain Bike', 'indoor-bike': 'Indoor Bike',
    hike: 'Hike', walk: 'Walk', elliptical: 'Elliptical', 'indoor-row': 'Indoor Row',
    'pool-swim': 'Pool Swim', 'open-water-swim': 'Open Water Swim',
    ski: 'Ski', snowboard: 'Snowboard',
    kayak: 'Kayak', sup: 'Stand-Up Paddleboard', surf: 'Surf',
    basketball: 'Basketball', soccer: 'Soccer', 'american-football': 'American Football',
    tennis: 'Tennis', pickleball: 'Pickleball',
    hiit: 'HIIT', boxing: 'Boxing', yoga: 'Yoga'
  };

  function sportTitle(id) {
    return SPORT_TITLES[id] || id.split('-').map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  // Which field best represents a "personal record" for each sport, and how
  // to compare it. Sports without a clean numeric/parseable "best" metric
  // (e.g. Yoga) are intentionally left out.
  var SPORT_PR_METRIC = {
    run: 'distance', 'trail-run': 'distance', treadmill: 'distance',
    'road-bike': 'distance', 'mountain-bike': 'distance', 'indoor-bike': 'distance',
    hike: 'distance', walk: 'distance', elliptical: 'distance', 'indoor-row': 'distance',
    'pool-swim': 'duration', 'open-water-swim': 'duration',
    ski: 'verticalDescent', snowboard: 'verticalDescent',
    kayak: 'distance', sup: 'distance', surf: 'distance',
    basketball: 'yourScore', soccer: 'yourScore', 'american-football': 'yourScore',
    tennis: 'setsWon', pickleball: 'setsWon',
    hiit: 'roundsIntervals', boxing: 'roundsIntervals'
  };

  var METRIC_LABELS = {
    distance: 'Longest Distance',
    duration: 'Longest Duration',
    verticalDescent: 'Best Vertical Descent',
    yourScore: 'Highest Score',
    setsWon: 'Most Sets Won',
    roundsIntervals: 'Most Rounds'
  };

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
      var wl = Storage.get('module:workout-logger', null);
      var allEntries = wl && wl.entries ? wl.entries : {};
      var sportIds = Object.keys(allEntries).filter(function (id) { return allEntries[id] && allEntries[id].length > 0; });

      if (sportIds.length === 0) {
        target.innerHTML = '<p class="empty-hint">Log some workouts under Workout Logger to see personal records here.</p>';
        return;
      }

      var cards = [];

      if (allEntries['strength-training'] && allEntries['strength-training'].length > 0) {
        var byExercise = {};
        allEntries['strength-training'].forEach(function (e) {
          if (typeof e.weight !== 'number' || !e.exercise) return;
          if (!byExercise[e.exercise] || e.weight > byExercise[e.exercise].weight) byExercise[e.exercise] = e;
        });

        var exNames = Object.keys(byExercise).sort();
        if (exNames.length > 0) {
          var rows = exNames.map(function (name) {
            var e = byExercise[name];
            return '<div class="pa-record-row"><span class="pa-record-row__name">' + escapeHtml(name) + '</span>' +
              '<span class="pa-record-row__value">' + escapeHtml(String(e.weight)) +
              (e.reps ? ' &times; ' + escapeHtml(String(e.reps)) : '') + '</span></div>';
          }).join('');
          cards.push('<div class="pa-record-card"><h4 class="pa-record-card__title">Strength Training</h4>' + rows + '</div>');
        }
      }

      sportIds.forEach(function (id) {
        if (id === 'strength-training') return;
        var metricKey = SPORT_PR_METRIC[id];
        if (!metricKey) return;

        var entries = allEntries[id];
        var best = null;
        var bestValue = -Infinity;

        entries.forEach(function (e) {
          var raw = e[metricKey];
          var value = metricKey === 'duration' ? parseDurationMinutes(raw) : (typeof raw === 'number' ? raw : NaN);
          if (isNaN(value)) return;
          if (value > bestValue) {
            bestValue = value;
            best = e;
          }
        });

        if (!best) return;

        var displayValue = metricKey === 'duration' ? formatMinutes(bestValue) : String(bestValue);
        cards.push(
          '<div class="pa-record-card"><h4 class="pa-record-card__title">' + escapeHtml(sportTitle(id)) + '</h4>' +
            '<div class="pa-record-row"><span class="pa-record-row__name">' + escapeHtml(METRIC_LABELS[metricKey]) + '</span>' +
              '<span class="pa-record-row__value">' + escapeHtml(displayValue) + '</span></div>' +
            '<div class="pa-record-row__date">' + escapeHtml(formatDate(best.date)) + '</div>' +
          '</div>'
        );
      });

      if (cards.length === 0) {
        target.innerHTML = '<p class="empty-hint">No personal records to show yet — log a few sessions under Workout Logger.</p>';
        return;
      }

      target.innerHTML = cards.join('');
    }
  }

  ModuleRegistry.register({
    id: 'progress-analytics',
    title: 'Progress & Analytics',
    icon: '📈',
    mount: mount
  });
})();
