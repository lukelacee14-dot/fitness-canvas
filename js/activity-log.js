// Shared, read-only cross-module helper: figures out which calendar dates
// have "any logged activity in any tool" and computes streaks from that.
// Reads other modules' localStorage data directly (via Storage.get) and
// never writes anything itself.
var ActivityLog = (function () {
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

  function daysBetween(a, b) {
    function toUTC(s) {
      var p = s.split('-');
      return Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }
    return Math.round((toUTC(b) - toUTC(a)) / 86400000);
  }

  function markDatesFromArray(dateSet, entries) {
    (entries || []).forEach(function (e) { if (e && e.date) dateSet[e.date] = true; });
  }

  function getAllActiveDates() {
    var dateSet = {};

    var wl = Storage.get('module:workout-logger', null);
    if (wl && wl.entries) {
      Object.keys(wl.entries).forEach(function (sportId) {
        markDatesFromArray(dateSet, wl.entries[sportId]);
      });
    }

    var mt = Storage.get('module:meal-tracker', null);
    if (mt && mt.days) {
      Object.keys(mt.days).forEach(function (date) {
        var day = mt.days[date];
        var hasFood = ['breakfast', 'lunch', 'dinner', 'snacks'].some(function (s) {
          return (day[s] || []).length > 0;
        });
        if (hasFood || (day.water && day.water > 0)) dateSet[date] = true;
      });
    }

    markDatesFromArray(dateSet, (Storage.get('module:body-measurements', null) || {}).entries);
    markDatesFromArray(dateSet, (Storage.get('module:sleep-tracker', null) || {}).entries);
    markDatesFromArray(dateSet, (Storage.get('module:soreness-rpe-log', null) || {}).entries);
    markDatesFromArray(dateSet, (Storage.get('module:progress-photos', null) || {}).entries);

    return Object.keys(dateSet).sort();
  }

  function computeStreaks(referenceDateStr) {
    var dates = getAllActiveDates();
    if (dates.length === 0) return { current: 0, longest: 0 };

    var longest = 1;
    var run = 1;
    for (var i = 1; i < dates.length; i++) {
      if (daysBetween(dates[i - 1], dates[i]) === 1) {
        run++;
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
    }

    var dateSet = {};
    dates.forEach(function (d) { dateSet[d] = true; });

    var today = referenceDateStr || todayStr();
    var cursor = dateSet[today] ? today : addDays(today, -1);

    var current = 0;
    while (dateSet[cursor]) {
      current++;
      cursor = addDays(cursor, -1);
    }

    return { current: current, longest: longest };
  }

  return {
    getAllActiveDates: getAllActiveDates,
    computeStreaks: computeStreaks,
    todayStr: todayStr,
    addDays: addDays,
    daysBetween: daysBetween
  };
})();
