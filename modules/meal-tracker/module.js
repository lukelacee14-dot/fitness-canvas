(function () {
  function uid() {
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function addDays(dateStr, delta) {
    var d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    return d.toISOString().slice(0, 10);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function mount(container, api) {
    var data = api.load({ entries: [] });
    var viewDate = todayStr();

    container.innerHTML =
      '<div class="mt-datenav">' +
        '<button type="button" class="icon-btn" data-nav="-1" aria-label="Previous day">&#8249;</button>' +
        '<span class="mt-datenav__label"></span>' +
        '<button type="button" class="icon-btn" data-nav="1" aria-label="Next day">&#8250;</button>' +
      '</div>' +
      '<div class="mt-totals"></div>' +
      '<form class="mt-form">' +
        '<div class="field-row"><label>Meal<input type="text" name="name" placeholder="e.g. Chicken & rice" required></label></div>' +
        '<div class="field-row field-row--4">' +
          '<label>Cals<input type="number" name="calories" min="0" inputmode="numeric"></label>' +
          '<label>Protein<input type="number" name="protein" min="0" inputmode="numeric"></label>' +
          '<label>Carbs<input type="number" name="carbs" min="0" inputmode="numeric"></label>' +
          '<label>Fat<input type="number" name="fat" min="0" inputmode="numeric"></label>' +
        '</div>' +
        '<button type="submit" class="btn-primary">Add Meal</button>' +
      '</form>' +
      '<div class="mt-log"></div>';

    var labelEl = container.querySelector('.mt-datenav__label');
    var totalsEl = container.querySelector('.mt-totals');
    var logEl = container.querySelector('.mt-log');
    var form = container.querySelector('.mt-form');

    function save() { api.save(data); }

    function render() {
      labelEl.textContent = formatDate(viewDate);
      var dayEntries = data.entries.filter(function (e) { return e.date === viewDate; });

      var totals = dayEntries.reduce(function (acc, e) {
        acc.calories += e.calories || 0;
        acc.protein += e.protein || 0;
        acc.carbs += e.carbs || 0;
        acc.fat += e.fat || 0;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

      totalsEl.innerHTML =
        '<div class="mt-totals__item"><strong>' + totals.calories + '</strong><span>kcal</span></div>' +
        '<div class="mt-totals__item"><strong>' + totals.protein + 'g</strong><span>protein</span></div>' +
        '<div class="mt-totals__item"><strong>' + totals.carbs + 'g</strong><span>carbs</span></div>' +
        '<div class="mt-totals__item"><strong>' + totals.fat + 'g</strong><span>fat</span></div>';

      logEl.innerHTML = '';
      if (dayEntries.length === 0) {
        logEl.innerHTML = '<p class="empty-hint">No meals logged for this day.</p>';
        return;
      }

      dayEntries.forEach(function (entry) {
        var row = document.createElement('div');
        row.className = 'mt-row';
        row.innerHTML =
          '<div class="mt-row__text">' +
            '<span class="mt-row__name">' + escapeHtml(entry.name) + '</span>' +
            '<span class="mt-row__macros">' + (entry.calories || 0) + ' kcal · P' + (entry.protein || 0) +
              ' C' + (entry.carbs || 0) + ' F' + (entry.fat || 0) + '</span>' +
          '</div>';

        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'row-delete';
        delBtn.setAttribute('aria-label', 'Delete meal');
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', function () {
          data.entries = data.entries.filter(function (e) { return e.id !== entry.id; });
          save();
          render();
        });

        row.appendChild(delBtn);
        logEl.appendChild(row);
      });
    }

    container.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        viewDate = addDays(viewDate, Number(btn.dataset.nav));
        render();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get('name') || '').toString().trim();
      if (!name) return;

      data.entries.push({
        id: uid(),
        date: viewDate,
        name: name,
        calories: fd.get('calories') ? Number(fd.get('calories')) : 0,
        protein: fd.get('protein') ? Number(fd.get('protein')) : 0,
        carbs: fd.get('carbs') ? Number(fd.get('carbs')) : 0,
        fat: fd.get('fat') ? Number(fd.get('fat')) : 0
      });

      save();
      render();
      form.reset();
      form.querySelector('[name="name"]').focus();
    });

    render();
  }

  ModuleRegistry.register({
    id: 'meal-tracker',
    title: 'Meal Tracker',
    icon: '🍽️',
    mount: mount
  });
})();
