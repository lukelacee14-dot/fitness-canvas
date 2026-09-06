(function () {
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function mount(container) {
    var records = PRComputation.computeRecords();

    if (records.length === 0) {
      container.innerHTML = '<p class="empty-hint">Log some workouts under Workout Logger to see your personal records here.</p>';
      return;
    }

    container.innerHTML = records.map(function (rec) {
      var rows = rec.rows.map(function (row) {
        return '<div class="pa-record-row"><span class="pa-record-row__name">' + escapeHtml(row.name) + '</span>' +
          '<span class="pa-record-row__value">' + escapeHtml(row.value) + '</span></div>' +
          (row.date ? '<div class="pa-record-row__date">' + escapeHtml(formatDate(row.date)) + '</div>' : '');
      }).join('');
      return '<div class="pa-record-card"><h4 class="pa-record-card__title">' + escapeHtml(rec.title) + '</h4>' + rows + '</div>';
    }).join('');
  }

  ModuleRegistry.register({
    id: 'pr-tracker',
    title: 'PR Tracker',
    icon: '🥇',
    mount: mount
  });
})();
