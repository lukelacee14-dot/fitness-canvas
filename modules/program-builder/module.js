(function () {
  // Exercise database (~60 exercises across 10 muscle groups) lives in the
  // shared js/exercise-database.js so Exercise Library & Muscle Guide can
  // reuse it without a second copy.
  var EXERCISES = ExerciseDatabase.EXERCISES;
  var MUSCLE_GROUPS = ExerciseDatabase.MUSCLE_GROUPS;
  var EQUIPMENT_OPTIONS = ExerciseDatabase.EQUIPMENT_OPTIONS;

  var GOAL_LABELS = { strength: 'Strength', hypertrophy: 'Hypertrophy', endurance: 'Endurance', general: 'General Fitness' };

  var PRESCRIPTIONS = {
    strength: { sets: 4, reps: '4-6', restLabel: '2-3 min' },
    hypertrophy: { sets: '3-4', reps: '8-12', restLabel: '60-90s' },
    endurance: { sets: '2-3', reps: '15-20', restLabel: '30-45s' },
    general: { sets: 3, reps: '10-12', restLabel: 'moderate' }
  };

  var SPLIT_TEMPLATES = {
    fullBody: {
      label: 'Full Body',
      days: [
        { label: 'Full Body', slots: [
          { group: 'Chest', count: 1 }, { group: 'Back', count: 1 }, { group: 'Shoulders', count: 1 },
          { group: 'Quads', count: 1 }, { group: 'Hamstrings', count: 1 }, { group: 'Glutes', count: 1 },
          { group: 'Core/Abs', count: 1 }
        ] }
      ]
    },
    upperLower: {
      label: 'Upper / Lower',
      days: [
        { label: 'Upper', slots: [
          { group: 'Chest', count: 2 }, { group: 'Back', count: 2 }, { group: 'Shoulders', count: 1 },
          { group: 'Biceps', count: 1 }, { group: 'Triceps', count: 1 }
        ] },
        { label: 'Lower', slots: [
          { group: 'Quads', count: 2 }, { group: 'Hamstrings', count: 2 }, { group: 'Glutes', count: 1 },
          { group: 'Calves', count: 1 }, { group: 'Core/Abs', count: 1 }
        ] }
      ]
    },
    ppl: {
      label: 'Push / Pull / Legs',
      days: [
        { label: 'Push', slots: [
          { group: 'Chest', count: 2 }, { group: 'Shoulders', count: 2 }, { group: 'Triceps', count: 2 }
        ] },
        { label: 'Pull', slots: [
          { group: 'Back', count: 3 }, { group: 'Biceps', count: 2 }, { group: 'Core/Abs', count: 1 }
        ] },
        { label: 'Legs', slots: [
          { group: 'Quads', count: 2 }, { group: 'Hamstrings', count: 2 }, { group: 'Glutes', count: 1 }, { group: 'Calves', count: 1 }
        ] }
      ]
    }
  };

  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    var d = new Date();
    var localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    return new Date(localMs).toISOString().slice(0, 10);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Program generation ------------------------------------------------

  function splitTypeForDays(n) {
    if (n <= 3) return 'fullBody';
    if (n === 4) return 'upperLower';
    return 'ppl';
  }

  function difficultyRank(level) {
    return { Beginner: 1, Intermediate: 2, Advanced: 3 }[level] || 2;
  }

  function filterExercises(group, experience, equipment) {
    var maxRank = difficultyRank(experience);
    return EXERCISES.filter(function (ex) {
      if (ex.group !== group) return false;
      if (difficultyRank(ex.difficulty) > maxRank) return false;
      if (equipment && equipment.length > 0 && equipment.indexOf(ex.equipment) === -1) return false;
      return true;
    });
  }

  function generateProgram(options) {
    var splitType = splitTypeForDays(options.daysPerWeek);
    var split = SPLIT_TEMPLATES[splitType];
    var prescription = PRESCRIPTIONS[options.goal] || PRESCRIPTIONS.general;
    var cursors = {};

    var days = [];
    for (var i = 0; i < options.daysPerWeek; i++) {
      var template = split.days[i % split.days.length];
      var exercises = [];

      template.slots.forEach(function (slot) {
        var pool = filterExercises(slot.group, options.experience, options.equipment);
        if (pool.length === 0) return;

        var startCursor = cursors[slot.group] || 0;
        for (var c = 0; c < slot.count; c++) {
          var pick = pool[(startCursor + c) % pool.length];
          exercises.push({
            name: pick.name,
            group: pick.group,
            sets: prescription.sets,
            reps: prescription.reps,
            restLabel: prescription.restLabel
          });
        }
        cursors[slot.group] = startCursor + slot.count;
      });

      days.push({ label: template.label, exercises: exercises });
    }

    return {
      id: uid(),
      name: GOAL_LABELS[options.goal] + ' Program (' + options.daysPerWeek + 'd/wk)',
      goal: options.goal,
      daysPerWeek: options.daysPerWeek,
      experience: options.experience,
      equipment: options.equipment,
      splitType: splitType,
      splitLabel: split.label,
      weeks: 4,
      createdAt: todayStr(),
      days: days
    };
  }

  // ---- Shared render helpers ---------------------------------------------

  function renderProgramDaysHtml(days) {
    return '<div class="pb-days">' +
      days.map(function (day, i) {
        return '<div class="pb-day">' +
          '<h4 class="pb-day__title">Day ' + (i + 1) + ': ' + escapeHtml(day.label) + '</h4>' +
          '<div class="pb-day__exercises">' +
            day.exercises.map(function (ex) {
              return '<div class="pb-day__ex">' +
                '<span class="pb-day__ex-name">' + escapeHtml(ex.name) + '</span>' +
                '<span class="pb-day__ex-scheme">' + ex.sets + ' × ' + ex.reps + ' · rest ' + escapeHtml(ex.restLabel) + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  // ---- Module mount -------------------------------------------------------

  function mount(container, api) {
    var data = api.load({});
    if (!data.savedPrograms) data.savedPrograms = [];
    if (data.activeProgramId === undefined) data.activeProgramId = null;
    if (data.activeProgramStartDate === undefined) data.activeProgramStartDate = null;

    function save() { api.save(data); }

    container.innerHTML =
      '<div class="pb-mode-nav">' +
        '<button type="button" class="pb-mode-btn pb-mode-btn--active" data-mode="quick">Quick Suggestions</button>' +
        '<button type="button" class="pb-mode-btn" data-mode="build">Build a Program</button>' +
        '<button type="button" class="pb-mode-btn" data-mode="mine">My Programs</button>' +
      '</div>' +
      '<div class="pb-mode" data-mode="quick"></div>' +
      '<div class="pb-mode" data-mode="build" hidden></div>' +
      '<div class="pb-mode" data-mode="mine" hidden></div>';

    var modeBtns = container.querySelectorAll('.pb-mode-btn');
    var quickEl = container.querySelector('.pb-mode[data-mode="quick"]');
    var buildEl = container.querySelector('.pb-mode[data-mode="build"]');
    var mineEl = container.querySelector('.pb-mode[data-mode="mine"]');

    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        modeBtns.forEach(function (b) { b.classList.remove('pb-mode-btn--active'); });
        btn.classList.add('pb-mode-btn--active');
        var mode = btn.dataset.mode;
        quickEl.hidden = mode !== 'quick';
        buildEl.hidden = mode !== 'build';
        mineEl.hidden = mode !== 'mine';
        if (mode === 'mine') renderMyPrograms();
      });
    });

    // ---- Mode 1: Quick Suggestions ----

    function renderQuickSuggestions() {
      quickEl.innerHTML = '<div class="pb-chips"></div><div class="pb-results"></div>';
      var chipsEl = quickEl.querySelector('.pb-chips');
      var resultsEl = quickEl.querySelector('.pb-results');

      MUSCLE_GROUPS.forEach(function (group) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pb-chip';
        chip.textContent = group;
        chip.addEventListener('click', function () {
          chipsEl.querySelectorAll('.pb-chip').forEach(function (c) { c.classList.remove('pb-chip--active'); });
          chip.classList.add('pb-chip--active');
          showQuickResults(group, resultsEl);
        });
        chipsEl.appendChild(chip);
      });
    }

    function showQuickResults(group, resultsEl) {
      var matches = EXERCISES.filter(function (ex) { return ex.group === group; });
      resultsEl.innerHTML = '<h4 class="pb-results__title">' + escapeHtml(group) + '</h4>';

      var list = document.createElement('div');
      list.className = 'pb-list';
      matches.forEach(function (ex) {
        var item = document.createElement('div');
        item.className = 'pb-list__item';
        item.innerHTML =
          '<div class="pb-list__row">' +
            '<span class="pb-list__name">' + escapeHtml(ex.name) + '</span>' +
            '<span class="pb-list__tags">' + escapeHtml(ex.equipment) + ' · ' + escapeHtml(ex.difficulty) + '</span>' +
          '</div>' +
          '<span class="pb-list__desc">' + escapeHtml(ex.desc) + '</span>' +
          (ex.secondary.length ? '<span class="pb-list__secondary">Also works: ' + escapeHtml(ex.secondary.join(', ')) + '</span>' : '');
        list.appendChild(item);
      });
      resultsEl.appendChild(list);
    }

    // ---- Mode 2: Build a Program ----

    function renderBuildForm() {
      buildEl.innerHTML =
        '<form class="pb-build-form">' +
          '<div class="field-row"><label>Goal' +
            '<select name="goal">' +
              '<option value="strength">Strength</option>' +
              '<option value="hypertrophy" selected>Hypertrophy</option>' +
              '<option value="endurance">Endurance</option>' +
              '<option value="general">General Fitness</option>' +
            '</select></label></div>' +
          '<div class="field-row"><label>Days Per Week' +
            '<select name="days">' +
              '<option value="2">2</option><option value="3" selected>3</option><option value="4">4</option>' +
              '<option value="5">5</option><option value="6">6</option>' +
            '</select></label></div>' +
          '<div class="field-row"><label>Experience Level' +
            '<select name="experience">' +
              '<option value="Beginner">Beginner</option>' +
              '<option value="Intermediate" selected>Intermediate</option>' +
              '<option value="Advanced">Advanced</option>' +
            '</select></label></div>' +
          '<div class="field-row"><label>Equipment Available <span class="pb-hint">(optional — leave all unchecked to allow everything)</span></label>' +
            '<div class="pb-equip-grid">' +
              EQUIPMENT_OPTIONS.map(function (eq) {
                return '<label class="pb-equip-chip"><input type="checkbox" name="equipment" value="' + eq + '"> ' + eq + '</label>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<button type="submit" class="btn-primary">Generate Program</button>' +
        '</form>' +
        '<div class="pb-generated"></div>';

      var form = buildEl.querySelector('.pb-build-form');
      var generatedEl = buildEl.querySelector('.pb-generated');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var program = generateProgram({
          goal: fd.get('goal'),
          daysPerWeek: Number(fd.get('days')),
          experience: fd.get('experience'),
          equipment: fd.getAll('equipment')
        });
        renderGeneratedProgram(generatedEl, program);
      });
    }

    function renderGeneratedProgram(target, program) {
      target.innerHTML =
        '<div class="pb-program">' +
          '<div class="pb-program__meta">' + escapeHtml(program.splitLabel) + ' split · ' + program.daysPerWeek +
            ' days/week · ' + escapeHtml(GOAL_LABELS[program.goal]) + ' · ' + program.weeks + '-week program</div>' +
          renderProgramDaysHtml(program.days) +
          '<div class="field-row"><label>Program Name<input type="text" class="pb-save-name" value="' + escapeHtml(program.name) + '"></label></div>' +
          '<button type="button" class="btn-primary pb-save-btn">Save to My Programs</button>' +
        '</div>';

      var saveBtn = target.querySelector('.pb-save-btn');
      saveBtn.addEventListener('click', function () {
        var nameInput = target.querySelector('.pb-save-name');
        program.name = nameInput.value.toString().trim() || program.name;
        data.savedPrograms.push(program);
        save();
        saveBtn.textContent = 'Saved!';
        saveBtn.disabled = true;
      });
    }

    // ---- Mode 3: My Programs ----

    function renderMyPrograms() {
      if (data.savedPrograms.length === 0) {
        mineEl.innerHTML = '<p class="empty-hint">No saved programs yet. Generate one under Build a Program.</p>';
        return;
      }

      mineEl.innerHTML = '';
      data.savedPrograms.forEach(function (program) {
        var isActive = data.activeProgramId === program.id;

        var card = document.createElement('div');
        card.className = 'pb-my-program';

        var header = document.createElement('div');
        header.className = 'pb-my-program__header';
        header.innerHTML =
          '<div class="pb-my-program__text">' +
            '<span class="pb-my-program__name">' + escapeHtml(program.name) + '</span>' +
            '<span class="pb-my-program__meta">' + escapeHtml(program.splitLabel) + ' · ' + program.daysPerWeek +
              'd/wk · ' + escapeHtml(GOAL_LABELS[program.goal]) + '</span>' +
          '</div>' +
          (isActive ? '<span class="pb-active-badge">Active</span>' : '');
        card.appendChild(header);

        var body = document.createElement('div');
        body.className = 'pb-my-program__body';
        body.innerHTML = renderProgramDaysHtml(program.days);
        body.hidden = true;
        card.appendChild(body);

        var actions = document.createElement('div');
        actions.className = 'pb-my-program__actions';

        var viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'btn-secondary';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', function () {
          body.hidden = !body.hidden;
          viewBtn.textContent = body.hidden ? 'View' : 'Hide';
        });

        var startBtn = document.createElement('button');
        startBtn.type = 'button';
        startBtn.className = 'btn-primary';
        startBtn.textContent = isActive ? 'Stop' : 'Start';
        startBtn.addEventListener('click', function () {
          if (isActive) {
            data.activeProgramId = null;
            data.activeProgramStartDate = null;
          } else {
            data.activeProgramId = program.id;
            data.activeProgramStartDate = todayStr();
          }
          save();
          renderMyPrograms();
        });

        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'row-delete';
        delBtn.setAttribute('aria-label', 'Delete program');
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', function () {
          data.savedPrograms = data.savedPrograms.filter(function (p) { return p.id !== program.id; });
          if (data.activeProgramId === program.id) {
            data.activeProgramId = null;
            data.activeProgramStartDate = null;
          }
          save();
          renderMyPrograms();
        });

        actions.appendChild(viewBtn);
        actions.appendChild(startBtn);
        actions.appendChild(delBtn);
        card.appendChild(actions);

        mineEl.appendChild(card);
      });
    }

    renderQuickSuggestions();
    renderBuildForm();
  }

  ModuleRegistry.register({
    id: 'program-builder',
    title: 'Program Builder',
    icon: '📋',
    mount: mount
  });
})();
