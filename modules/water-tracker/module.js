(function () {
  // Standalone water-tracking tab. Deliberately ignores the api it's given —
  // water intake is owned by Meal Tracker's own storage (module:meal-tracker),
  // so this reads/writes that same key directly rather than keeping a second
  // copy of water data under module:water-tracker.

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
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function emptyDay() {
    return { breakfast: [], lunch: [], dinner: [], snacks: [], water: 0 };
  }

  function loadMealTrackerData() {
    var data = Storage.get('module:meal-tracker', {});
    if (!data.days) data.days = {};
    if (!data.savedMeals) data.savedMeals = [];
    if (!data.waterUnit) data.waterUnit = 'cups';
    if (data.waterGoal === undefined) data.waterGoal = null;
    return data;
  }

  function saveMealTrackerData(data) {
    Storage.set('module:meal-tracker', data);
  }

  function mount(container) {
    var viewDate = todayStr();

    var waterGoalOverlay = document.createElement('div');
    waterGoalOverlay.className = 'overlay overlay--center';
    waterGoalOverlay.hidden = true;
    waterGoalOverlay.innerHTML = '<div class="confirm-dialog wg-body"></div>';
    container.appendChild(waterGoalOverlay);
    var waterGoalBody = waterGoalOverlay.querySelector('.wg-body');
    waterGoalOverlay.addEventListener('click', function (e) { if (e.target === waterGoalOverlay) waterGoalOverlay.hidden = true; });

    container.innerHTML +=
      '<div class="mt-datenav">' +
        '<button type="button" class="icon-btn" data-nav="-1" aria-label="Previous day">&#8249;</button>' +
        '<span class="mt-datenav__label"></span>' +
        '<button type="button" class="icon-btn" data-nav="1" aria-label="Next day">&#8250;</button>' +
      '</div>' +
      '<div class="mt-water"></div>';

    container.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        viewDate = addDays(viewDate, Number(btn.dataset.nav));
        render();
      });
    });

    function openWaterGoalForm(data) {
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
        saveMealTrackerData(data);
        waterGoalOverlay.hidden = true;
        render();
      });
    }

    function render() {
      var data = loadMealTrackerData();
      if (!data.days[viewDate]) data.days[viewDate] = emptyDay();
      var day = data.days[viewDate];

      container.querySelector('.mt-datenav__label').textContent = formatDate(viewDate);

      var unit = data.waterUnit || 'cups';
      var amount = day.water || 0;
      var goal = data.waterGoal;
      var step = unit === 'ml' ? 250 : 1;

      var metaHtml = goal
        ? '<span class="mt-water__goal">of ' + goal + ' ' + unit + ' goal</span><button type="button" class="mt-water__editgoal">Edit</button>'
        : '<button type="button" class="mt-water__setgoal">Set a daily goal</button>';

      var waterEl = container.querySelector('.mt-water');
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
          saveMealTrackerData(data);
          render();
        });
      });

      var setGoalBtn = waterEl.querySelector('.mt-water__setgoal');
      if (setGoalBtn) setGoalBtn.addEventListener('click', function () { openWaterGoalForm(data); });
      var editGoalBtn = waterEl.querySelector('.mt-water__editgoal');
      if (editGoalBtn) editGoalBtn.addEventListener('click', function () { openWaterGoalForm(data); });
    }

    render();
  }

  ModuleRegistry.register({
    id: 'water-tracker',
    title: 'Water Tracker',
    icon: '💧',
    mount: mount
  });
})();
