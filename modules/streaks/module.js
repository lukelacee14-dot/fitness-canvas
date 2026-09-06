(function () {
  function mount(container) {
    render();

    function render() {
      var streaks = ActivityLog.computeStreaks();
      var activeDates = {};
      ActivityLog.getAllActiveDates().forEach(function (d) { activeDates[d] = true; });

      var today = ActivityLog.todayStr();
      var days = [];
      for (var i = 27; i >= 0; i--) {
        var date = ActivityLog.addDays(today, -i);
        days.push({ date: date, active: !!activeDates[date] });
      }

      container.innerHTML =
        '<div class="sk-hero">' +
          '<div class="sk-hero__item"><span class="sk-hero__value">&#128293; ' + streaks.current + '</span><span class="sk-hero__label">Current Streak</span></div>' +
          '<div class="sk-hero__item"><span class="sk-hero__value">' + streaks.longest + '</span><span class="sk-hero__label">Longest Streak</span></div>' +
        '</div>' +
        '<h4 class="sk-grid-title">Last 4 Weeks</h4>' +
        '<div class="sk-grid">' +
          days.map(function (d) {
            return '<div class="sk-day' + (d.active ? ' sk-day--active' : '') + '" title="' + d.date + '"></div>';
          }).join('') +
        '</div>' +
        (streaks.current === 0 && streaks.longest === 0
          ? '<p class="empty-hint">Log any activity in any tool today to start a streak.</p>'
          : '');
    }
  }

  ModuleRegistry.register({
    id: 'streaks',
    title: 'Streaks',
    icon: '🔥',
    mount: mount
  });
})();
