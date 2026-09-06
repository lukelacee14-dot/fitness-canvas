(function () {
  function todayStr() {
    var d = new Date();
    var localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    return new Date(localMs).toISOString().slice(0, 10);
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

  // Each badge is evaluated fresh against other modules' data every time this
  // screen mounts. Once a badge's condition is true, it's recorded as earned
  // (with a date) and stays earned permanently, even if the underlying data
  // later changes (e.g. a streak resets) — matching how real achievements work.
  var BADGES = [
    {
      id: 'first-workout',
      title: 'First Workout Logged',
      description: 'Log your first entry under Workout Logger.',
      check: function () {
        var wl = Storage.get('module:workout-logger', null);
        if (!wl || !wl.entries) return false;
        return Object.keys(wl.entries).some(function (id) { return (wl.entries[id] || []).length > 0; });
      }
    },
    {
      id: 'first-5k',
      title: 'First 5K',
      description: 'Log a Run, Trail Run, or Treadmill entry of at least 5 distance units.',
      check: function () {
        var wl = Storage.get('module:workout-logger', null);
        if (!wl || !wl.entries) return false;
        return ['run', 'trail-run', 'treadmill'].some(function (id) {
          return (wl.entries[id] || []).some(function (e) { return typeof e.distance === 'number' && e.distance >= 5; });
        });
      }
    },
    {
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Log any activity 7 days in a row.',
      check: function () { return ActivityLog.computeStreaks().longest >= 7; }
    },
    {
      id: 'streak-30',
      title: '30-Day Streak',
      description: 'Log any activity 30 days in a row.',
      check: function () { return ActivityLog.computeStreaks().longest >= 30; }
    },
    {
      id: 'ten-workouts',
      title: '10 Workouts Logged',
      description: 'Log 10 total entries across any sport in Workout Logger.',
      check: function () {
        var wl = Storage.get('module:workout-logger', null);
        if (!wl || !wl.entries) return false;
        var total = 0;
        Object.keys(wl.entries).forEach(function (id) { total += (wl.entries[id] || []).length; });
        return total >= 10;
      }
    },
    {
      id: 'first-meal',
      title: 'First Meal Logged',
      description: 'Log your first food entry under Meal Tracker.',
      check: function () {
        var mt = Storage.get('module:meal-tracker', null);
        if (!mt || !mt.days) return false;
        return Object.keys(mt.days).some(function (date) {
          var day = mt.days[date];
          return ['breakfast', 'lunch', 'dinner', 'snacks'].some(function (s) { return (day[s] || []).length > 0; });
        });
      }
    },
    {
      id: 'first-program',
      title: 'First Program Started',
      description: 'Start a saved program under Program Builder.',
      check: function () {
        var pb = Storage.get('module:program-builder', null);
        return !!(pb && pb.activeProgramId);
      }
    },
    {
      id: 'first-measurement',
      title: 'First Measurement Logged',
      description: 'Log your first entry under Body Measurements.',
      check: function () {
        var bm = Storage.get('module:body-measurements', null);
        return !!(bm && bm.entries && bm.entries.length > 0);
      }
    },
    {
      id: 'strength-century',
      title: 'Strength Century',
      description: 'Log a single Strength Training set of 100+ weight.',
      check: function () {
        var wl = Storage.get('module:workout-logger', null);
        if (!wl || !wl.entries || !wl.entries['strength-training']) return false;
        return wl.entries['strength-training'].some(function (e) { return typeof e.weight === 'number' && e.weight >= 100; });
      }
    },
    {
      id: 'first-post',
      title: 'First Update Shared',
      description: 'Post your first update to your Activity Feed.',
      check: function () {
        var af = Storage.get('module:activity-feed', null);
        return !!(af && af.posts && af.posts.length > 0);
      }
    }
  ];

  function mount(container, api) {
    var data = api.load({ earned: {} });
    if (!data.earned) data.earned = {};

    function save() { api.save(data); }

    var changed = false;
    BADGES.forEach(function (badge) {
      if (!data.earned[badge.id] && badge.check()) {
        data.earned[badge.id] = todayStr();
        changed = true;
      }
    });
    if (changed) save();

    var streaks = ActivityLog.computeStreaks();
    var earnedCount = Object.keys(data.earned).length;

    container.innerHTML =
      '<div class="sk-hero sk-hero--compact">' +
        '<div class="sk-hero__item"><span class="sk-hero__value">&#128293; ' + streaks.current + '</span><span class="sk-hero__label">Day Streak</span></div>' +
        '<div class="sk-hero__item"><span class="sk-hero__value">' + earnedCount + ' / ' + BADGES.length + '</span><span class="sk-hero__label">Badges Earned</span></div>' +
      '</div>' +
      '<div class="ac-grid"></div>';

    var gridEl = container.querySelector('.ac-grid');
    BADGES.forEach(function (badge) {
      var earnedDate = data.earned[badge.id];
      var card = document.createElement('div');
      card.className = 'ac-badge' + (earnedDate ? ' ac-badge--earned' : ' ac-badge--locked');
      card.innerHTML =
        '<div class="ac-badge__icon">' + (earnedDate ? '&#127942;' : '&#128274;') + '</div>' +
        '<div class="ac-badge__title">' + escapeHtml(badge.title) + '</div>' +
        '<div class="ac-badge__desc">' + escapeHtml(badge.description) + '</div>' +
        (earnedDate ? '<div class="ac-badge__date">Earned ' + escapeHtml(formatDate(earnedDate)) + '</div>' : '');
      gridEl.appendChild(card);
    });
  }

  ModuleRegistry.register({
    id: 'achievements',
    title: 'Achievements',
    icon: '🏆',
    mount: mount
  });
})();
