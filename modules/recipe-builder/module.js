(function () {
  var NUTRITION_KEYS = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'potassium', 'calcium', 'iron', 'vitaminC'];

  function uid() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  var nutritionDbPromise = null;
  function loadNutritionDb() {
    if (!nutritionDbPromise) {
      nutritionDbPromise = fetch('data/nutrition-database.json')
        .then(function (res) { return res.json(); })
        .catch(function () { return []; });
    }
    return nutritionDbPromise;
  }

  function sumTotals(ingredients) {
    var totals = {};
    NUTRITION_KEYS.forEach(function (key) { totals[key] = 0; });
    ingredients.forEach(function (ing) {
      NUTRITION_KEYS.forEach(function (key) {
        totals[key] += ing[key] || 0;
      });
    });
    return totals;
  }

  function mount(container) {
    var ingredients = [];

    container.innerHTML =
      '<p class="fd-attribution rb-url-note">Pasting a recipe URL to auto-import is planned for later, once a backend exists to fetch external pages. For now, build the recipe by adding ingredients below.</p>' +
      '<div class="field-row"><label>Search Ingredients<input type="text" class="rb-search-input" placeholder="e.g. chicken breast" autocomplete="off"></label></div>' +
      '<div class="rb-search-results"></div>' +
      '<div class="rb-grams-prompt" hidden></div>' +
      '<h4 class="rb-section-title">Ingredients Added</h4>' +
      '<div class="rb-ingredients"></div>' +
      '<div class="mt-totals rb-totals"></div>' +
      '<div class="field-row"><label>Recipe Name<input type="text" class="rb-name-input" placeholder="e.g. Weeknight Chili"></label></div>' +
      '<button type="button" class="btn-primary rb-save-btn">Save to Saved Meals</button>' +
      '<p class="rb-save-status"></p>';

    var searchInput = container.querySelector('.rb-search-input');
    var resultsEl = container.querySelector('.rb-search-results');
    var gramsPromptEl = container.querySelector('.rb-grams-prompt');
    var ingredientsEl = container.querySelector('.rb-ingredients');
    var totalsEl = container.querySelector('.rb-totals');
    var nameInput = container.querySelector('.rb-name-input');
    var saveBtn = container.querySelector('.rb-save-btn');
    var statusEl = container.querySelector('.rb-save-status');

    function renderTotals() {
      var totals = sumTotals(ingredients);
      totalsEl.innerHTML =
        '<div class="mt-totals__item"><strong>' + Math.round(totals.calories) + '</strong><span>kcal</span></div>' +
        '<div class="mt-totals__item"><strong>' + Math.round(totals.protein) + 'g</strong><span>protein</span></div>' +
        '<div class="mt-totals__item"><strong>' + Math.round(totals.carbs) + 'g</strong><span>carbs</span></div>' +
        '<div class="mt-totals__item"><strong>' + Math.round(totals.fat) + 'g</strong><span>fat</span></div>';
    }

    function renderIngredients() {
      if (ingredients.length === 0) {
        ingredientsEl.innerHTML = '<p class="empty-hint">No ingredients added yet.</p>';
      } else {
        ingredientsEl.innerHTML = '';
        ingredients.forEach(function (ing) {
          var row = document.createElement('div');
          row.className = 'mt-row';
          row.innerHTML =
            '<div class="mt-row__text">' +
              '<span class="mt-row__name">' + escapeHtml(ing.name) + ' &middot; ' + ing.grams + 'g</span>' +
              '<span class="mt-row__macros">' + Math.round(ing.calories || 0) + ' kcal &middot; P' + Math.round(ing.protein || 0) +
                ' C' + Math.round(ing.carbs || 0) + ' F' + Math.round(ing.fat || 0) + '</span>' +
            '</div>';

          var delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'row-delete';
          delBtn.setAttribute('aria-label', 'Remove ingredient');
          delBtn.textContent = '✕';
          delBtn.addEventListener('click', function () {
            ingredients = ingredients.filter(function (i) { return i.id !== ing.id; });
            renderIngredients();
            renderTotals();
          });

          row.appendChild(delBtn);
          ingredientsEl.appendChild(row);
        });
      }
      renderTotals();
    }

    function renderGramsPrompt(food) {
      gramsPromptEl.hidden = false;
      resultsEl.hidden = true;
      gramsPromptEl.innerHTML =
        '<div class="fd-selected"><strong>' + escapeHtml(food.name) + '</strong><span>' + food.calories + ' kcal per 100g</span></div>' +
        '<div class="field-row"><label>Grams<input type="number" class="rb-grams-input" min="0" step="any" value="100"></label></div>' +
        '<div class="profile-form-actions">' +
          '<button type="button" class="btn-secondary rb-grams-cancel">Cancel</button>' +
          '<button type="button" class="btn-primary rb-grams-add">Add Ingredient</button>' +
        '</div>';

      gramsPromptEl.querySelector('.rb-grams-cancel').addEventListener('click', function () {
        gramsPromptEl.hidden = true;
        resultsEl.hidden = false;
      });
      gramsPromptEl.querySelector('.rb-grams-add').addEventListener('click', function () {
        var grams = Number(gramsPromptEl.querySelector('.rb-grams-input').value) || 0;
        var scale = grams / 100;
        var ing = { id: uid(), name: food.name, grams: grams };
        NUTRITION_KEYS.forEach(function (key) {
          if (food[key] !== undefined) ing[key] = Math.round(food[key] * scale * 10) / 10;
        });
        ingredients.push(ing);
        renderIngredients();
        gramsPromptEl.hidden = true;
        resultsEl.hidden = false;
        searchInput.value = '';
        resultsEl.innerHTML = '';
        searchInput.focus();
      });
    }

    loadNutritionDb().then(function (db) {
      searchInput.addEventListener('input', function () {
        var q = searchInput.value.trim().toLowerCase();
        if (!q) { resultsEl.innerHTML = ''; return; }

        var matches = db.filter(function (f) { return f.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 25);
        if (matches.length === 0) {
          resultsEl.innerHTML = '<p class="empty-hint">No matches found.</p>';
          return;
        }

        resultsEl.innerHTML = '';
        matches.forEach(function (f) {
          var row = document.createElement('div');
          row.className = 'af-saved-row';
          row.innerHTML =
            '<span class="af-saved-name">' + escapeHtml(f.name) + '</span>' +
            '<span class="af-saved-cals">' + f.calories + ' kcal/100g</span>';
          row.addEventListener('click', function () { renderGramsPrompt(f); });
          resultsEl.appendChild(row);
        });
      });
    });

    saveBtn.addEventListener('click', function () {
      var name = nameInput.value.toString().trim();
      if (!name) {
        statusEl.textContent = 'Give your recipe a name first.';
        return;
      }
      if (ingredients.length === 0) {
        statusEl.textContent = 'Add at least one ingredient first.';
        return;
      }

      var totals = sumTotals(ingredients);
      var meal = { id: uid(), name: name };
      NUTRITION_KEYS.forEach(function (key) {
        meal[key] = Math.round(totals[key] * 10) / 10;
      });

      var mtData = Storage.get('module:meal-tracker', {});
      if (!mtData.days) mtData.days = {};
      if (!mtData.savedMeals) mtData.savedMeals = [];
      if (!mtData.waterUnit) mtData.waterUnit = 'cups';
      if (mtData.waterGoal === undefined) mtData.waterGoal = null;
      mtData.savedMeals.push(meal);
      Storage.set('module:meal-tracker', mtData);

      statusEl.textContent = 'Saved "' + name + '" to Saved Meals — log it from Meal Tracker any time.';
      ingredients = [];
      nameInput.value = '';
      renderIngredients();
    });

    renderIngredients();
  }

  ModuleRegistry.register({
    id: 'recipe-builder',
    title: 'Recipe Builder',
    icon: '🧾',
    mount: mount
  });
})();
