(function () {
  var SECTIONS = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ];

  var NUTRITION_FIELDS = [
    { key: 'calories', label: 'Calories' },
    { key: 'protein', label: 'Protein (g)' },
    { key: 'carbs', label: 'Carbs (g)' },
    { key: 'fat', label: 'Fat (g)' },
    { key: 'fiber', label: 'Fiber (g)' },
    { key: 'sugar', label: 'Sugar (g)' },
    { key: 'sodium', label: 'Sodium (mg)' },
    { key: 'potassium', label: 'Potassium (mg)' },
    { key: 'calcium', label: 'Calcium (mg)' },
    { key: 'iron', label: 'Iron (mg)' },
    { key: 'vitaminC', label: 'Vitamin C (mg)' }
  ];

  var NUTRITION_KEYS = NUTRITION_FIELDS.map(function (f) { return f.key; });

  function uid() {
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    var d = new Date();
    var localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    return new Date(localMs).toISOString().slice(0, 10);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function addDays(dateStr, delta) {
    var parts = dateStr.split('-');
    var d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function emptyDay() {
    return { breakfast: [], lunch: [], dinner: [], snacks: [], water: 0 };
  }

  function macroSummary(entry) {
    return (entry.calories || 0) + ' kcal · P' + (entry.protein || 0) + ' C' + (entry.carbs || 0) + ' F' + (entry.fat || 0);
  }

  function buildFieldRowsHtml(fields, existing) {
    return fields.map(function (f) {
      var val = existing && existing[f.key] !== undefined ? existing[f.key] : '';
      return '<div class="field-row"><label>' + f.label +
        '<input type="number" name="' + f.key + '" step="any" inputmode="decimal" value="' + val + '"></label></div>';
    }).join('');
  }

  function readNutritionValues(form) {
    var fd = new FormData(form);
    var values = {};
    NUTRITION_KEYS.forEach(function (key) {
      var raw = (fd.get(key) || '').toString().trim();
      if (raw !== '') values[key] = Number(raw);
    });
    return values;
  }

  function computeTotals(day) {
    var totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    SECTIONS.forEach(function (s) {
      (day[s.key] || []).forEach(function (entry) {
        totals.calories += entry.calories || 0;
        totals.protein += entry.protein || 0;
        totals.carbs += entry.carbs || 0;
        totals.fat += entry.fat || 0;
      });
    });
    return totals;
  }

  function mount(container, api) {
    var data = api.load({});

    // Migrate the old flat-entries shape into the new day/section shape,
    // dropping old entries into "snacks" since there was no meal-section concept before.
    var migrated = false;
    if (Array.isArray(data.entries)) {
      var oldEntries = data.entries;
      data = { days: {}, savedMeals: [], waterUnit: 'cups', waterGoal: null };
      oldEntries.forEach(function (e) {
        if (!data.days[e.date]) data.days[e.date] = emptyDay();
        var entry = { id: e.id || uid(), name: e.name };
        ['calories', 'protein', 'carbs', 'fat'].forEach(function (k) {
          if (e[k] !== undefined && e[k] !== null) entry[k] = e[k];
        });
        data.days[e.date].snacks.push(entry);
      });
      migrated = true;
    }
    if (!data.days) data.days = {};
    if (!data.savedMeals) data.savedMeals = [];
    if (!data.waterUnit) data.waterUnit = 'cups';
    if (data.waterGoal === undefined) data.waterGoal = null;

    function save() { api.save(data); }

    if (migrated) save();

    var viewDate = todayStr();
    var pendingSection = null;

    function getDay(date) {
      if (!data.days[date]) data.days[date] = emptyDay();
      return data.days[date];
    }

    container.innerHTML =
      '<div class="mt-nav">' +
        '<button type="button" class="mt-nav-btn mt-nav-btn--active" data-view="daily">Today</button>' +
        '<button type="button" class="mt-nav-btn" data-view="saved">Saved Meals</button>' +
        '<button type="button" class="mt-nav-btn" data-view="weekly">Weekly Summary</button>' +
      '</div>' +
      '<div class="mt-view" data-view="daily"></div>' +
      '<div class="mt-view" data-view="saved" hidden></div>' +
      '<div class="mt-view" data-view="weekly" hidden></div>';

    var navBtns = container.querySelectorAll('.mt-nav-btn');
    var dailyEl = container.querySelector('.mt-view[data-view="daily"]');
    var savedEl = container.querySelector('.mt-view[data-view="saved"]');
    var weeklyEl = container.querySelector('.mt-view[data-view="weekly"]');

    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        navBtns.forEach(function (b) { b.classList.remove('mt-nav-btn--active'); });
        btn.classList.add('mt-nav-btn--active');
        var view = btn.dataset.view;
        dailyEl.hidden = view !== 'daily';
        savedEl.hidden = view !== 'saved';
        weeklyEl.hidden = view !== 'weekly';
        if (view === 'saved') renderSavedMealsView();
        if (view === 'weekly') renderWeeklyView();
      });
    });

    // ---- Add Food overlay (bottom sheet: choice -> new item form / saved meal list) ----
    var addFoodOverlay = document.createElement('div');
    addFoodOverlay.className = 'overlay';
    addFoodOverlay.hidden = true;
    addFoodOverlay.innerHTML =
      '<div class="overlay__panel">' +
        '<div class="overlay__header">' +
          '<h2>Add Food</h2>' +
          '<button type="button" class="icon-btn af-close" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div class="af-body overlay__body"></div>' +
      '</div>';
    container.appendChild(addFoodOverlay);
    var addFoodBody = addFoodOverlay.querySelector('.af-body');
    addFoodOverlay.querySelector('.af-close').addEventListener('click', closeAddFood);
    addFoodOverlay.addEventListener('click', function (e) { if (e.target === addFoodOverlay) closeAddFood(); });

    // ---- Saved meal create/edit overlay (bottom sheet) ----
    var savedFormOverlay = document.createElement('div');
    savedFormOverlay.className = 'overlay';
    savedFormOverlay.hidden = true;
    savedFormOverlay.innerHTML =
      '<div class="overlay__panel">' +
        '<div class="overlay__header">' +
          '<h2>Saved Meal</h2>' +
          '<button type="button" class="icon-btn sf-close" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div class="sf-body overlay__body"></div>' +
      '</div>';
    container.appendChild(savedFormOverlay);
    var savedFormBody = savedFormOverlay.querySelector('.sf-body');
    savedFormOverlay.querySelector('.sf-close').addEventListener('click', function () { savedFormOverlay.hidden = true; });
    savedFormOverlay.addEventListener('click', function (e) { if (e.target === savedFormOverlay) savedFormOverlay.hidden = true; });

    // ---- Water goal overlay (small centered dialog) ----
    var waterGoalOverlay = document.createElement('div');
    waterGoalOverlay.className = 'overlay overlay--center';
    waterGoalOverlay.hidden = true;
    waterGoalOverlay.innerHTML = '<div class="confirm-dialog wg-body"></div>';
    container.appendChild(waterGoalOverlay);
    var waterGoalBody = waterGoalOverlay.querySelector('.wg-body');
    waterGoalOverlay.addEventListener('click', function (e) { if (e.target === waterGoalOverlay) waterGoalOverlay.hidden = true; });

    function closeAddFood() {
      addFoodOverlay.hidden = true;
      pendingSection = null;
    }

    function openAddFoodChoice(section) {
      pendingSection = section;
      renderAddFoodChoice();
      addFoodOverlay.hidden = false;
    }

    function renderAddFoodChoice() {
      addFoodBody.innerHTML =
        '<div class="af-choices">' +
          '<button type="button" class="btn-primary af-choice-new">New Food Item</button>' +
          '<button type="button" class="btn-secondary af-choice-saved">Choose Saved Meal</button>' +
        '</div>';
      addFoodBody.querySelector('.af-choice-new').addEventListener('click', renderNewFoodForm);
      addFoodBody.querySelector('.af-choice-saved').addEventListener('click', renderSavedMealPicker);
    }

    function renderNewFoodForm() {
      addFoodBody.innerHTML =
        '<form class="af-form">' +
          '<div class="field-row"><label>Name<input type="text" name="name" placeholder="e.g. Grilled Chicken" required></label></div>' +
          buildFieldRowsHtml(NUTRITION_FIELDS, null) +
          '<div class="profile-form-actions">' +
            '<button type="button" class="btn-secondary af-back">Back</button>' +
            '<button type="submit" class="btn-primary">Add</button>' +
          '</div>' +
        '</form>';

      var form = addFoodBody.querySelector('.af-form');
      form.querySelector('.af-back').addEventListener('click', renderAddFoodChoice);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = (new FormData(form).get('name') || '').toString().trim();
        if (!name) return;

        var entry = { id: uid(), name: name };
        var values = readNutritionValues(form);
        Object.keys(values).forEach(function (k) { entry[k] = values[k]; });

        pushEntry(pendingSection, entry);
        closeAddFood();
      });
    }

    function renderSavedMealPicker() {
      if (data.savedMeals.length === 0) {
        addFoodBody.innerHTML =
          '<p class="empty-hint">No saved meals yet. Create one from the Saved Meals tab.</p>' +
          '<button type="button" class="btn-secondary af-back">Back</button>';
        addFoodBody.querySelector('.af-back').addEventListener('click', renderAddFoodChoice);
        return;
      }

      var listHtml = data.savedMeals.map(function (m) {
        return '<div class="af-saved-row" data-id="' + m.id + '">' +
          '<span class="af-saved-name">' + escapeHtml(m.name) + '</span>' +
          '<span class="af-saved-cals">' + (m.calories || 0) + ' kcal</span>' +
        '</div>';
      }).join('');

      addFoodBody.innerHTML =
        '<div class="af-saved-list">' + listHtml + '</div>' +
        '<button type="button" class="btn-secondary af-back">Back</button>';

      addFoodBody.querySelectorAll('.af-saved-row').forEach(function (row) {
        row.addEventListener('click', function () {
          var meal = data.savedMeals.filter(function (m) { return m.id === row.dataset.id; })[0];
          if (!meal) return;

          var entry = { id: uid(), name: meal.name };
          NUTRITION_KEYS.forEach(function (key) {
            if (meal[key] !== undefined) entry[key] = meal[key];
          });

          pushEntry(pendingSection, entry);
          closeAddFood();
        });
      });

      addFoodBody.querySelector('.af-back').addEventListener('click', renderAddFoodChoice);
    }

    function pushEntry(section, entry) {
      var day = getDay(viewDate);
      day[section].push(entry);
      save();
      renderDynamic();
    }

    function openSavedMealForm(existingMeal) {
      savedFormBody.innerHTML =
        '<form class="sf-form">' +
          '<div class="field-row"><label>Meal Name<input type="text" name="name" placeholder="e.g. My Protein Shake" required value="' +
            (existingMeal ? escapeHtml(existingMeal.name) : '') + '"></label></div>' +
          buildFieldRowsHtml(NUTRITION_FIELDS, existingMeal) +
          '<div class="profile-form-actions">' +
            '<button type="button" class="btn-secondary sf-cancel">Cancel</button>' +
            '<button type="submit" class="btn-primary">Save</button>' +
          '</div>' +
        '</form>';
      savedFormOverlay.hidden = false;

      var form = savedFormBody.querySelector('.sf-form');
      form.querySelector('.sf-cancel').addEventListener('click', function () { savedFormOverlay.hidden = true; });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = (new FormData(form).get('name') || '').toString().trim();
        if (!name) return;

        var meal = { id: existingMeal ? existingMeal.id : uid(), name: name };
        var values = readNutritionValues(form);
        Object.keys(values).forEach(function (k) { meal[k] = values[k]; });

        if (existingMeal) {
          data.savedMeals = data.savedMeals.map(function (m) { return m.id === meal.id ? meal : m; });
        } else {
          data.savedMeals.push(meal);
        }
        save();
        savedFormOverlay.hidden = true;
        renderSavedMealsList();
      });
    }

    function openWaterGoalForm() {
      waterGoalBody.innerHTML =
        '<div class="field-row"><label>Unit' +
          '<select name="unit">' +
            '<option value="cups"' + (data.waterUnit !== 'ml' ? ' selected' : '') + '>Cups</option>' +
            '<option value="ml"' + (data.waterUnit === 'ml' ? ' selected' : '') + '>Milliliters</option>' +
          '</select></label></div>' +
        '<div class="field-row"><label>Daily Goal<input type="number" name="goal" min="0" value="' + (data.waterGoal || '') + '"></label></div>' +
        '<div class="profile-form-actions">' +
          '<button type="button" class="btn-secondary wg-cancel">Cancel</button>' +
          '<button type="button" class="btn-primary wg-save">Save</button>' +
        '</div>';
      waterGoalOverlay.hidden = false;

      waterGoalBody.querySelector('.wg-cancel').addEventListener('click', function () { waterGoalOverlay.hidden = true; });
      waterGoalBody.querySelector('.wg-save').addEventListener('click', function () {
        var unit = waterGoalBody.querySelector('[name="unit"]').value;
        var goalRaw = waterGoalBody.querySelector('[name="goal"]').value.toString().trim();
        data.waterUnit = unit;
        data.waterGoal = goalRaw ? Number(goalRaw) : null;
        save();
        waterGoalOverlay.hidden = true;
        renderWater(getDay(viewDate));
      });
    }

    // ---- Daily view ----

    function renderDailyShell() {
      dailyEl.innerHTML =
        '<div class="mt-datenav">' +
          '<button type="button" class="icon-btn" data-nav="-1" aria-label="Previous day">&#8249;</button>' +
          '<span class="mt-datenav__label"></span>' +
          '<button type="button" class="icon-btn" data-nav="1" aria-label="Next day">&#8250;</button>' +
        '</div>' +
        '<div class="mt-totals"></div>' +
        '<div class="mt-water"></div>' +
        SECTIONS.map(function (s) {
          return '<div class="mt-section" data-section="' + s.key + '">' +
            '<div class="mt-section__header"><h4>' + s.label + '</h4>' +
              '<button type="button" class="mt-add-food-btn" data-section="' + s.key + '">+ Add Food</button></div>' +
            '<div class="mt-section__list"></div>' +
          '</div>';
        }).join('');

      dailyEl.querySelectorAll('[data-nav]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          viewDate = addDays(viewDate, Number(btn.dataset.nav));
          renderDynamic();
        });
      });

      dailyEl.querySelectorAll('.mt-add-food-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { openAddFoodChoice(btn.dataset.section); });
      });

      renderDynamic();
    }

    function renderDynamic() {
      var day = getDay(viewDate);
      dailyEl.querySelector('.mt-datenav__label').textContent = formatDate(viewDate);
      renderTotals(day);
      renderWater(day);
      SECTIONS.forEach(function (s) { renderSectionList(s.key, day); });
    }

    function renderTotals(day) {
      var totals = computeTotals(day);
      dailyEl.querySelector('.mt-totals').innerHTML =
        '<div class="mt-totals__item"><strong>' + totals.calories + '</strong><span>kcal</span></div>' +
        '<div class="mt-totals__item"><strong>' + totals.protein + 'g</strong><span>protein</span></div>' +
        '<div class="mt-totals__item"><strong>' + totals.carbs + 'g</strong><span>carbs</span></div>' +
        '<div class="mt-totals__item"><strong>' + totals.fat + 'g</strong><span>fat</span></div>';
    }

    function renderWater(day) {
      var unit = data.waterUnit || 'cups';
      var amount = day.water || 0;
      var goal = data.waterGoal;
      var step = unit === 'ml' ? 250 : 1;

      var metaHtml = goal
        ? '<span class="mt-water__goal">of ' + goal + ' ' + unit + ' goal</span><button type="button" class="mt-water__editgoal">Edit</button>'
        : '<button type="button" class="mt-water__setgoal">Set a daily goal</button>';

      var waterEl = dailyEl.querySelector('.mt-water');
      waterEl.innerHTML =
        '<div class="mt-water__row">' +
          '<span class="mt-water__label">&#128167; Water</span>' +
          '<div class="mt-water__controls">' +
            '<button type="button" class="mt-water__btn" data-water="-1" aria-label="Decrease water">&#8722;</button>' +
            '<span class="mt-water__amount">' + amount + ' ' + unit + '</span>' +
            '<button type="button" class="mt-water__btn" data-water="1" aria-label="Increase water">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="mt-water__meta">' + metaHtml + '</div>';

      waterEl.querySelectorAll('[data-water]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var delta = Number(btn.dataset.water) * step;
          day.water = Math.max(0, (day.water || 0) + delta);
          save();
          renderWater(day);
        });
      });

      var setGoalBtn = waterEl.querySelector('.mt-water__setgoal');
      if (setGoalBtn) setGoalBtn.addEventListener('click', openWaterGoalForm);
      var editGoalBtn = waterEl.querySelector('.mt-water__editgoal');
      if (editGoalBtn) editGoalBtn.addEventListener('click', openWaterGoalForm);
    }

    function renderSectionList(sectionKey, day) {
      var listEl = dailyEl.querySelector('.mt-section[data-section="' + sectionKey + '"] .mt-section__list');
      var items = day[sectionKey];

      if (items.length === 0) {
        listEl.innerHTML = '<p class="empty-hint">Nothing logged yet.</p>';
        return;
      }

      listEl.innerHTML = '';
      items.forEach(function (entry) {
        var row = document.createElement('div');
        row.className = 'mt-row';
        row.innerHTML =
          '<div class="mt-row__text">' +
            '<span class="mt-row__name">' + escapeHtml(entry.name) + '</span>' +
            '<span class="mt-row__macros">' + macroSummary(entry) + '</span>' +
          '</div>';

        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'row-delete';
        delBtn.setAttribute('aria-label', 'Delete food item');
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', function () {
          day[sectionKey] = day[sectionKey].filter(function (e) { return e.id !== entry.id; });
          save();
          renderDynamic();
        });

        row.appendChild(delBtn);
        listEl.appendChild(row);
      });
    }

    // ---- Saved Meals view ----

    function renderSavedMealsView() {
      savedEl.innerHTML =
        '<button type="button" class="btn-primary sm-new-btn">+ New Saved Meal</button>' +
        '<div class="sm-list"></div>';
      savedEl.querySelector('.sm-new-btn').addEventListener('click', function () { openSavedMealForm(null); });
      renderSavedMealsList();
    }

    function renderSavedMealsList() {
      var listEl = savedEl.querySelector('.sm-list');
      if (!listEl) return;

      if (data.savedMeals.length === 0) {
        listEl.innerHTML = '<p class="empty-hint">No saved meals yet.</p>';
        return;
      }

      listEl.innerHTML = '';
      data.savedMeals.forEach(function (meal) {
        var row = document.createElement('div');
        row.className = 'mt-row';
        row.innerHTML =
          '<div class="mt-row__text">' +
            '<span class="mt-row__name">' + escapeHtml(meal.name) + '</span>' +
            '<span class="mt-row__macros">' + macroSummary(meal) + '</span>' +
          '</div>';

        var actions = document.createElement('div');
        actions.className = 'sm-row-actions';

        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'icon-btn';
        editBtn.setAttribute('aria-label', 'Edit saved meal');
        editBtn.textContent = '✎';
        editBtn.addEventListener('click', function () { openSavedMealForm(meal); });

        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'row-delete';
        delBtn.setAttribute('aria-label', 'Delete saved meal');
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', function () {
          data.savedMeals = data.savedMeals.filter(function (m) { return m.id !== meal.id; });
          save();
          renderSavedMealsList();
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        row.appendChild(actions);
        listEl.appendChild(row);
      });
    }

    // ---- Weekly Summary view ----

    function renderWeeklyView() {
      var rows = [];
      for (var i = 6; i >= 0; i--) {
        var date = addDays(todayStr(), -i);
        var day = data.days[date] || emptyDay();
        rows.push({ date: date, totals: computeTotals(day) });
      }

      var bodyRows = rows.map(function (r) {
        return '<tr><td>' + formatDate(r.date) + '</td><td>' + r.totals.calories + '</td><td>' +
          r.totals.protein + '</td><td>' + r.totals.carbs + '</td><td>' + r.totals.fat + '</td></tr>';
      }).join('');

      weeklyEl.innerHTML =
        '<div class="wl-table-wrap">' +
          '<table class="wl-table">' +
            '<thead><tr><th>Date</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr></thead>' +
            '<tbody>' + bodyRows + '</tbody>' +
          '</table>' +
        '</div>';
    }

    renderDailyShell();
  }

  ModuleRegistry.register({
    id: 'meal-tracker',
    title: 'Meal Tracker',
    icon: '🍽️',
    mount: mount
  });
})();
