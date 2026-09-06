(function () {
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

  // Same per-sport metric philosophy as Progress & Analytics: a numeric field
  // that's safe to rank (avoids parsing free-text pace/speed fields, which
  // can't be reliably sorted since format is unconstrained user input).
  var SPORT_METRIC = {
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
    distance: 'Distance',
    duration: 'Duration',
    verticalDescent: 'Vertical Descent',
    yourScore: 'Score',
    setsWon: 'Sets Won',
    roundsIntervals: 'Rounds'
  };

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

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderLeaderboardCard(title, subtitle, rows) {
    return '<div class="lb-card"><h4 class="lb-card__title">' + escapeHtml(title) + '</h4>' +
      '<span class="lb-card__subtitle">' + escapeHtml(subtitle) + '</span>' +
      rows.map(function (r) {
        return '<div class="lb-row"><span class="lb-rank">#' + r.rank + '</span>' +
          '<span class="lb-row__name">' + escapeHtml(r.name) + '</span>' +
          '<span class="lb-row__value">' + escapeHtml(r.value) + '</span></div>';
      }).join('') +
    '</div>';
  }

  function mount(container) {
    var wl = Storage.get('module:workout-logger', null);
    var allEntries = wl && wl.entries ? wl.entries : {};
    var sportIds = Object.keys(allEntries).filter(function (id) { return (allEntries[id] || []).length > 0; });

    container.innerHTML =
      '<p class="lb-solo-note">Personal-bests preview — real multi-user leaderboards arrive once accounts are added.</p>' +
      '<div class="lb-list"></div>';

    var listEl = container.querySelector('.lb-list');

    if (sportIds.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">Log some workouts under Workout Logger to build your leaderboards here.</p>';
      return;
    }

    var cards = [];

    if (allEntries['strength-training'] && allEntries['strength-training'].length > 0) {
      var lifts = allEntries['strength-training']
        .filter(function (e) { return typeof e.weight === 'number'; })
        .slice()
        .sort(function (a, b) { return b.weight - a.weight; })
        .slice(0, 5);

      if (lifts.length > 0) {
        cards.push(renderLeaderboardCard('Strength Training', 'Top 5 Heaviest Sets', lifts.map(function (e, i) {
          return { rank: i + 1, name: e.exercise || 'Lift', value: e.weight + (e.reps ? ' × ' + e.reps : '') };
        })));
      }
    }

    sportIds.forEach(function (id) {
      if (id === 'strength-training') return;
      var metricKey = SPORT_METRIC[id];
      if (!metricKey) return;

      var ranked = allEntries[id]
        .map(function (e) {
          var raw = e[metricKey];
          var value = metricKey === 'duration' ? parseDurationMinutes(raw) : (typeof raw === 'number' ? raw : NaN);
          return { entry: e, value: value };
        })
        .filter(function (r) { return !isNaN(r.value); })
        .sort(function (a, b) { return b.value - a.value; })
        .slice(0, 5);

      if (ranked.length === 0) return;

      cards.push(renderLeaderboardCard(sportTitle(id), 'Top 5 by ' + METRIC_LABELS[metricKey], ranked.map(function (r, i) {
        var displayValue = metricKey === 'duration' ? formatMinutes(r.value) : String(r.value);
        return { rank: i + 1, name: formatDate(r.entry.date), value: displayValue };
      })));
    });

    if (cards.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">No rankable entries yet — keep logging to build your leaderboards.</p>';
      return;
    }

    listEl.innerHTML = cards.join('');
  }

  ModuleRegistry.register({
    id: 'leaderboards',
    title: 'Leaderboards',
    icon: '🏅',
    mount: mount
  });
})();
