(function () {
  var MUSCLE_GROUPS = {
    'Chest': [
      { name: 'Barbell Bench Press', desc: 'Compound press targeting the chest, front shoulders, and triceps.' },
      { name: 'Incline Dumbbell Press', desc: 'Emphasizes the upper chest with a greater range of motion.' },
      { name: 'Push-Up', desc: 'Bodyweight press that builds chest, shoulder, and core stability.' },
      { name: 'Cable Fly', desc: 'Isolation move that stretches and squeezes the chest through a wide arc.' }
    ],
    'Back': [
      { name: 'Deadlift', desc: 'Full posterior-chain pull that builds back, glutes, and grip strength.' },
      { name: 'Pull-Up', desc: 'Vertical pull targeting the lats and upper back.' },
      { name: 'Barbell Row', desc: 'Horizontal pull that thickens the mid-back and lats.' },
      { name: 'Lat Pulldown', desc: 'Machine-assisted vertical pull, good for building lat width.' }
    ],
    'Shoulders': [
      { name: 'Overhead Press', desc: 'Compound press building overall shoulder strength and stability.' },
      { name: 'Lateral Raise', desc: 'Isolation move targeting the side delts for width.' },
      { name: 'Face Pull', desc: 'Targets rear delts and upper back, supports shoulder health.' },
      { name: 'Arnold Press', desc: 'Rotational press hitting all three heads of the shoulder.' }
    ],
    'Legs': [
      { name: 'Back Squat', desc: 'Compound lower-body move targeting quads, glutes, and core.' },
      { name: 'Romanian Deadlift', desc: 'Hip-hinge move that targets hamstrings and glutes.' },
      { name: 'Walking Lunge', desc: 'Unilateral move building quads, glutes, and balance.' },
      { name: 'Leg Press', desc: 'Machine compound move targeting quads and glutes with less spinal load.' }
    ],
    'Arms': [
      { name: 'Barbell Curl', desc: 'Isolation move targeting the biceps.' },
      { name: 'Triceps Pushdown', desc: 'Isolation move targeting the triceps.' },
      { name: 'Hammer Curl', desc: 'Targets biceps and forearms with a neutral grip.' },
      { name: 'Skull Crusher', desc: 'Lying triceps extension for overall arm size.' }
    ],
    'Core': [
      { name: 'Plank', desc: 'Isometric hold that builds core and anti-extension stability.' },
      { name: 'Hanging Leg Raise', desc: 'Targets lower abs and hip flexors.' },
      { name: 'Cable Woodchop', desc: 'Rotational move targeting obliques and core stability.' },
      { name: 'Ab Wheel Rollout', desc: 'Advanced anti-extension move building deep core strength.' }
    ]
  };

  var GOALS = {
    'Strength': [
      { name: 'Back Squat (3-5 reps)', desc: 'Heavy compound lift, low reps, focus on maximal load.' },
      { name: 'Bench Press (3-5 reps)', desc: 'Heavy pressing strength for chest, shoulders, and triceps.' },
      { name: 'Deadlift (3-5 reps)', desc: 'Heavy full-body pull for total-body strength.' },
      { name: 'Overhead Press (3-5 reps)', desc: 'Heavy vertical press for shoulder strength.' }
    ],
    'Hypertrophy': [
      { name: 'Dumbbell Bench Press (8-12 reps)', desc: 'Moderate load, higher volume for chest growth.' },
      { name: 'Lat Pulldown (8-12 reps)', desc: 'Controlled volume work for back width.' },
      { name: 'Leg Press (10-15 reps)', desc: 'High-volume quad and glute builder with less fatigue than squats.' },
      { name: 'Cable Fly (12-15 reps)', desc: 'Isolation volume work for chest shape.' }
    ],
    'Endurance': [
      { name: 'Bodyweight Circuit (15-20 reps)', desc: 'High-rep, low-rest circuit to build muscular endurance.' },
      { name: 'Kettlebell Swing', desc: 'Ballistic hip-hinge move that builds conditioning and posterior endurance.' },
      { name: 'Rowing Machine Intervals', desc: 'Full-body cardio intervals for aerobic and muscular endurance.' },
      { name: 'Battle Ropes', desc: 'High-intensity upper-body conditioning move.' }
    ],
    'Fat Loss': [
      { name: 'Full-Body Circuit', desc: 'Compound moves back-to-back to maximize calorie burn.' },
      { name: 'Kettlebell Swing', desc: 'High-intensity hip-hinge move that elevates heart rate fast.' },
      { name: 'Jump Rope', desc: 'Simple, effective cardio for burning calories in short bursts.' },
      { name: 'Stair Climber Intervals', desc: 'Lower-body cardio that also builds leg endurance.' }
    ],
    'Mobility': [
      { name: "World's Greatest Stretch", desc: 'Dynamic full-body stretch opening hips, spine, and shoulders.' },
      { name: 'Hip 90/90', desc: 'Improves internal and external hip rotation.' },
      { name: 'Thoracic Rotation', desc: 'Improves upper-back rotation for better lifting mechanics.' },
      { name: 'Ankle Dorsiflexion Stretch', desc: 'Improves ankle range of motion for squatting depth.' }
    ]
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function mount(container) {
    container.innerHTML =
      '<div class="pb-tabs">' +
        '<button type="button" class="pb-tab pb-tab--active" data-tab="muscle">By Muscle Group</button>' +
        '<button type="button" class="pb-tab" data-tab="goal">By Goal</button>' +
      '</div>' +
      '<div class="pb-chips" data-panel="muscle"></div>' +
      '<div class="pb-chips" data-panel="goal" hidden></div>' +
      '<div class="pb-results"></div>';

    var muscleChips = container.querySelector('[data-panel="muscle"]');
    var goalChips = container.querySelector('[data-panel="goal"]');
    var resultsEl = container.querySelector('.pb-results');
    var tabs = container.querySelectorAll('.pb-tab');
    var panels = { muscle: muscleChips, goal: goalChips };

    function buildChips(panelEl, dataset) {
      Object.keys(dataset).forEach(function (key) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pb-chip';
        chip.textContent = key;
        chip.addEventListener('click', function () {
          panelEl.querySelectorAll('.pb-chip').forEach(function (c) { c.classList.remove('pb-chip--active'); });
          chip.classList.add('pb-chip--active');
          showResults(key, dataset[key]);
        });
        panelEl.appendChild(chip);
      });
    }

    function showResults(title, exercises) {
      resultsEl.innerHTML = '<h4 class="pb-results__title">' + escapeHtml(title) + '</h4>';
      var list = document.createElement('div');
      list.className = 'pb-list';
      exercises.forEach(function (ex) {
        var item = document.createElement('div');
        item.className = 'pb-list__item';
        item.innerHTML =
          '<span class="pb-list__name">' + escapeHtml(ex.name) + '</span>' +
          '<span class="pb-list__desc">' + escapeHtml(ex.desc) + '</span>';
        list.appendChild(item);
      });
      resultsEl.appendChild(list);
    }

    buildChips(muscleChips, MUSCLE_GROUPS);
    buildChips(goalChips, GOALS);

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('pb-tab--active'); });
        tab.classList.add('pb-tab--active');
        Object.keys(panels).forEach(function (key) {
          panels[key].hidden = key !== tab.dataset.tab;
        });
        resultsEl.innerHTML = '';
      });
    });
  }

  ModuleRegistry.register({
    id: 'program-builder',
    title: 'Program Builder',
    icon: '📋',
    mount: mount
  });
})();
