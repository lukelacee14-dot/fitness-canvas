// Shared personal-records computation — read-only, reads Workout Logger's
// data directly. The single source of truth for both Progress & Analytics'
// "Personal Records by Sport" section and the standalone PR Tracker, so the
// same logic and sport-metric mapping only lives in one place.
var PRComputation = (function () {
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

  // Returns an array of { title, rows: [{ name, value, date }] } cards,
  // ready for any consumer to render in its own markup.
  function computeRecords() {
    var wl = Storage.get('module:workout-logger', null);
    var allEntries = wl && wl.entries ? wl.entries : {};
    var sportIds = Object.keys(allEntries).filter(function (id) { return allEntries[id] && allEntries[id].length > 0; });

    var records = [];

    if (allEntries['strength-training'] && allEntries['strength-training'].length > 0) {
      var byExercise = {};
      allEntries['strength-training'].forEach(function (e) {
        if (typeof e.weight !== 'number' || !e.exercise) return;
        if (!byExercise[e.exercise] || e.weight > byExercise[e.exercise].weight) byExercise[e.exercise] = e;
      });

      var exNames = Object.keys(byExercise).sort();
      if (exNames.length > 0) {
        records.push({
          title: 'Strength Training',
          rows: exNames.map(function (name) {
            var e = byExercise[name];
            return { name: name, value: String(e.weight) + (e.reps ? ' × ' + e.reps : ''), date: null };
          })
        });
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
      records.push({
        title: sportTitle(id),
        rows: [{ name: METRIC_LABELS[metricKey], value: displayValue, date: best.date }]
      });
    });

    return records;
  }

  return { computeRecords: computeRecords, sportTitle: sportTitle };
})();
