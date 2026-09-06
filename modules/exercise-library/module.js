(function () {
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function mount(container) {
    var EXERCISES = ExerciseDatabase.EXERCISES;
    var MUSCLE_GROUPS = ExerciseDatabase.MUSCLE_GROUPS;
    var EQUIPMENT_OPTIONS = ExerciseDatabase.EQUIPMENT_OPTIONS;

    container.innerHTML =
      '<input type="text" class="el-search" placeholder="Search exercises..." autocomplete="off">' +
      '<div class="el-filters">' +
        '<select class="el-filter-group"><option value="">All Muscle Groups</option>' +
          MUSCLE_GROUPS.map(function (g) { return '<option value="' + escapeHtml(g) + '">' + escapeHtml(g) + '</option>'; }).join('') +
        '</select>' +
        '<select class="el-filter-equipment"><option value="">All Equipment</option>' +
          EQUIPMENT_OPTIONS.map(function (eq) { return '<option value="' + escapeHtml(eq) + '">' + escapeHtml(eq) + '</option>'; }).join('') +
        '</select>' +
        '<select class="el-filter-difficulty"><option value="">All Difficulties</option>' +
          ['Beginner', 'Intermediate', 'Advanced'].map(function (d) { return '<option value="' + d + '">' + d + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
      '<div class="el-results"></div>';

    var searchInput = container.querySelector('.el-search');
    var groupSelect = container.querySelector('.el-filter-group');
    var equipmentSelect = container.querySelector('.el-filter-equipment');
    var difficultySelect = container.querySelector('.el-filter-difficulty');
    var resultsEl = container.querySelector('.el-results');

    function applyFilters() {
      var term = searchInput.value.trim().toLowerCase();
      var group = groupSelect.value;
      var equipment = equipmentSelect.value;
      var difficulty = difficultySelect.value;

      var matches = EXERCISES.filter(function (ex) {
        if (term && ex.name.toLowerCase().indexOf(term) === -1) return false;
        if (group && ex.group !== group) return false;
        if (equipment && ex.equipment !== equipment) return false;
        if (difficulty && ex.difficulty !== difficulty) return false;
        return true;
      });

      if (matches.length === 0) {
        resultsEl.innerHTML = '<p class="empty-hint">No exercises match your search/filters.</p>';
        return;
      }

      var list = document.createElement('div');
      list.className = 'pb-list';
      matches.forEach(function (ex) {
        var item = document.createElement('div');
        item.className = 'pb-list__item';
        item.innerHTML =
          '<div class="pb-list__row">' +
            '<span class="pb-list__name">' + escapeHtml(ex.name) + '</span>' +
            '<span class="pb-list__tags">' + escapeHtml(ex.group) + ' &middot; ' + escapeHtml(ex.equipment) + ' &middot; ' + escapeHtml(ex.difficulty) + '</span>' +
          '</div>' +
          '<span class="pb-list__desc">' + escapeHtml(ex.desc) + '</span>' +
          (ex.secondary.length ? '<span class="pb-list__secondary">Also works: ' + escapeHtml(ex.secondary.join(', ')) + '</span>' : '');
        list.appendChild(item);
      });

      resultsEl.innerHTML = '';
      resultsEl.appendChild(list);
    }

    searchInput.addEventListener('input', applyFilters);
    groupSelect.addEventListener('change', applyFilters);
    equipmentSelect.addEventListener('change', applyFilters);
    difficultySelect.addEventListener('change', applyFilters);

    applyFilters();
  }

  ModuleRegistry.register({
    id: 'exercise-library',
    title: 'Exercise Library & Muscle Guide',
    icon: '📚',
    mount: mount
  });
})();
