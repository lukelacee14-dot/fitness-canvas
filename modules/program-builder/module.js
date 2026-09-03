(function () {
  // ---- Exercise database (~60 exercises across 10 muscle groups) -------

  var EXERCISES = [
    // Chest
    { id: 'chest-bench-press', name: 'Barbell Bench Press', group: 'Chest', secondary: ['Shoulders', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A horizontal pressing movement that loads the pectorals through a long range of motion, with the front shoulders and triceps assisting to lock out the weight.' },
    { id: 'chest-incline-db-press', name: 'Incline Dumbbell Press', group: 'Chest', secondary: ['Shoulders', 'Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Pressing on an incline shifts more emphasis onto the upper chest and front delts, and dumbbells allow a deeper stretch at the bottom than a barbell.' },
    { id: 'chest-pushup', name: 'Push-Up', group: 'Chest', secondary: ['Shoulders', 'Triceps', 'Core/Abs'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'A bodyweight press that builds chest and triceps strength while forcing the core to stay braced to keep the body in a straight line.' },
    { id: 'chest-cable-fly', name: 'Cable Fly', group: 'Chest', secondary: ['Shoulders'], equipment: 'Cable', difficulty: 'Beginner', desc: 'An isolation move that keeps constant tension on the chest through a wide arcing motion, stretching and squeezing the pecs without much triceps involvement.' },
    { id: 'chest-db-pullover', name: 'Dumbbell Pullover', group: 'Chest', secondary: ['Back', 'Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Lying across a bench and lowering a dumbbell overhead stretches the chest and lats together, building shoulder mobility along with chest size.' },
    { id: 'chest-machine-press', name: 'Machine Chest Press', group: 'Chest', secondary: ['Shoulders', 'Triceps'], equipment: 'Machine', difficulty: 'Beginner', desc: 'A guided pressing pattern that lets beginners load the chest safely without needing to stabilize a free weight, useful for learning the pressing motion.' },

    // Back
    { id: 'back-deadlift', name: 'Deadlift', group: 'Back', secondary: ['Hamstrings', 'Glutes', 'Core/Abs'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'A full posterior-chain pull from the floor that builds the entire back, grip, and hips at once; one of the best overall strength builders in the gym.' },
    { id: 'back-pullup', name: 'Pull-Up', group: 'Back', secondary: ['Biceps', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'A vertical pulling movement that builds lat width and upper-back strength by pulling your own bodyweight up to a bar.' },
    { id: 'back-bent-over-row', name: 'Barbell Bent-Over Row', group: 'Back', secondary: ['Biceps', 'Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A horizontal pull that thickens the mid-back and lats, hinging at the hips to row the bar into the torso under control.' },
    { id: 'back-lat-pulldown', name: 'Lat Pulldown', group: 'Back', secondary: ['Biceps'], equipment: 'Cable', difficulty: 'Beginner', desc: 'A machine-assisted vertical pull that mimics the pull-up motion, letting you dial in a weight you can control while building lat width.' },
    { id: 'back-seated-row', name: 'Seated Cable Row', group: 'Back', secondary: ['Biceps', 'Shoulders'], equipment: 'Cable', difficulty: 'Beginner', desc: 'A horizontal pulling exercise that targets the mid-back and rear shoulders while keeping tension on the muscle through the full range.' },
    { id: 'back-single-arm-row', name: 'Single-Arm Dumbbell Row', group: 'Back', secondary: ['Biceps', 'Core/Abs'], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Rowing one side at a time lets you focus on pulling with the back rather than momentum, and challenges the core to resist rotation.' },

    // Shoulders
    { id: 'shoulders-overhead-press', name: 'Overhead Press', group: 'Shoulders', secondary: ['Triceps', 'Core/Abs'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A standing vertical press that builds total shoulder strength and stability, requiring the core and legs to brace as you press the bar overhead.' },
    { id: 'shoulders-lateral-raise', name: 'Dumbbell Lateral Raise', group: 'Shoulders', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'An isolation move that targets the side deltoid directly, building shoulder width by raising the arms out to the sides against gravity.' },
    { id: 'shoulders-arnold-press', name: 'Arnold Press', group: 'Shoulders', secondary: ['Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'A rotating overhead press that takes the shoulder through internal-to-external rotation, hitting all three heads of the deltoid in one movement.' },
    { id: 'shoulders-face-pull', name: 'Face Pull', group: 'Shoulders', secondary: ['Back'], equipment: 'Cable', difficulty: 'Beginner', desc: 'Pulling a rope toward the face targets the rear delts and upper back, muscles that are often neglected and important for shoulder health and posture.' },
    { id: 'shoulders-machine-press', name: 'Machine Shoulder Press', group: 'Shoulders', secondary: ['Triceps'], equipment: 'Machine', difficulty: 'Beginner', desc: 'A guided pressing pattern for the shoulders that removes the balance demands of a free-weight press, good for building pressing strength safely.' },
    { id: 'shoulders-kb-push-press', name: 'Kettlebell Push Press', group: 'Shoulders', secondary: ['Triceps', 'Quads'], equipment: 'Kettlebell', difficulty: 'Intermediate', desc: 'A slight leg drive helps launch the kettlebell overhead, letting you press more weight than a strict press while still building shoulder strength.' },

    // Biceps
    { id: 'biceps-barbell-curl', name: 'Barbell Curl', group: 'Biceps', secondary: [], equipment: 'Barbell', difficulty: 'Beginner', desc: 'The classic biceps builder — curling a straight bar from full extension to full flexion isolates the biceps through its whole range of motion.' },
    { id: 'biceps-hammer-curl', name: 'Dumbbell Hammer Curl', group: 'Biceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Curling with a neutral (palms-in) grip shifts some emphasis onto the brachialis and forearms alongside the biceps, building thicker-looking arms.' },
    { id: 'biceps-incline-curl', name: 'Incline Dumbbell Curl', group: 'Biceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Curling while seated on an incline bench stretches the biceps behind the body first, increasing the range of motion and time under tension.' },
    { id: 'biceps-cable-curl', name: 'Cable Curl', group: 'Biceps', secondary: [], equipment: 'Cable', difficulty: 'Beginner', desc: "A cable's constant tension keeps the biceps loaded through the entire curl, including the bottom position where a dumbbell would go slack." },
    { id: 'biceps-preacher-curl', name: 'Preacher Curl', group: 'Biceps', secondary: [], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Bracing the arms against an angled pad removes the ability to swing the weight, isolating the biceps and emphasizing the stretched bottom position.' },
    { id: 'biceps-concentration-curl', name: 'Concentration Curl', group: 'Biceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Curling one arm at a time with the elbow braced against the inner thigh isolates the biceps almost completely, good for building a peak.' },

    // Triceps
    { id: 'triceps-close-grip-bench', name: 'Close-Grip Bench Press', group: 'Triceps', secondary: ['Chest', 'Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A bench press with the hands set close together shifts most of the pressing load onto the triceps while still working the chest and shoulders.' },
    { id: 'triceps-pushdown', name: 'Triceps Pushdown', group: 'Triceps', secondary: [], equipment: 'Cable', difficulty: 'Beginner', desc: 'Pushing a cable attachment down from a bent-elbow position isolates the triceps through extension, a straightforward way to build arm size.' },
    { id: 'triceps-skull-crusher', name: 'Skull Crusher', group: 'Triceps', secondary: [], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Lying down and lowering a bar toward the forehead stretches the triceps at the top before extending back out, a strong isolation builder.' },
    { id: 'triceps-overhead-extension', name: 'Overhead Dumbbell Extension', group: 'Triceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Extending a dumbbell overhead stretches the long head of the triceps more than pushdown variations, helping build overall arm size.' },
    { id: 'triceps-dips', name: 'Dips', group: 'Triceps', secondary: ['Chest', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Lowering and pressing your bodyweight between parallel bars builds serious triceps and chest strength, with depth controlling the difficulty.' },
    { id: 'triceps-kb-kickback', name: 'Kettlebell Triceps Kickback', group: 'Triceps', secondary: [], equipment: 'Kettlebell', difficulty: 'Beginner', desc: 'Hinging forward and extending the arm behind the body isolates the triceps at full contraction, a light but effective finishing move.' },

    // Quads
    { id: 'quads-back-squat', name: 'Back Squat', group: 'Quads', secondary: ['Glutes', 'Hamstrings', 'Core/Abs'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'The foundational lower-body lift — squatting a barbell on the back builds quad, glute, and core strength through a deep, controlled range of motion.' },
    { id: 'quads-front-squat', name: 'Front Squat', group: 'Quads', secondary: ['Core/Abs', 'Glutes'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'Holding the bar across the front shoulders keeps the torso more upright than a back squat, placing even more direct emphasis on the quads.' },
    { id: 'quads-leg-press', name: 'Leg Press', group: 'Quads', secondary: ['Glutes', 'Hamstrings'], equipment: 'Machine', difficulty: 'Beginner', desc: 'A machine squat pattern that lets you load the quads and glutes heavily without needing to balance a bar, easier to learn than a free-weight squat.' },
    { id: 'quads-walking-lunge', name: 'Walking Lunge', group: 'Quads', secondary: ['Glutes', 'Hamstrings', 'Core/Abs'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Stepping forward into a lunge and alternating legs builds single-leg quad and glute strength while also challenging balance and core stability.' },
    { id: 'quads-goblet-squat', name: 'Goblet Squat', group: 'Quads', secondary: ['Glutes', 'Core/Abs'], equipment: 'Kettlebell', difficulty: 'Beginner', desc: 'Holding a kettlebell at chest height while squatting is one of the easiest ways to learn good squat form while still building real quad strength.' },
    { id: 'quads-leg-extension', name: 'Leg Extension', group: 'Quads', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: 'An isolation move that extends the knee against resistance, targeting the quads directly without involving the hips or hamstrings at all.' },

    // Hamstrings
    { id: 'hamstrings-rdl', name: 'Romanian Deadlift', group: 'Hamstrings', secondary: ['Glutes', 'Back'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A hip-hinge movement that lowers the bar along the legs to stretch the hamstrings under load, one of the best builders of hamstring size and strength.' },
    { id: 'hamstrings-leg-curl', name: 'Leg Curl', group: 'Hamstrings', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: 'An isolation move that curls the heel toward the glutes against resistance, targeting the hamstrings directly without hip involvement.' },
    { id: 'hamstrings-stiff-leg-deadlift', name: 'Dumbbell Stiff-Leg Deadlift', group: 'Hamstrings', secondary: ['Glutes', 'Back'], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Keeping the legs nearly straight while hinging at the hips isolates the hamstrings and glutes more than a standard deadlift.' },
    { id: 'hamstrings-nordic-curl', name: 'Nordic Curl', group: 'Hamstrings', secondary: ['Glutes'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Anchoring the feet and lowering the torso forward under control builds tremendous hamstring strength eccentrically, a demanding bodyweight move.' },
    { id: 'hamstrings-kb-swing', name: 'Kettlebell Swing', group: 'Hamstrings', secondary: ['Glutes', 'Core/Abs', 'Back'], equipment: 'Kettlebell', difficulty: 'Intermediate', desc: 'A ballistic hip-hinge that snaps the hips forward to swing the kettlebell, building explosive hamstring and glute power along with conditioning.' },
    { id: 'hamstrings-good-morning', name: 'Good Morning', group: 'Hamstrings', secondary: ['Glutes', 'Back'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Hinging forward at the hips with a bar on the back stretches and strengthens the hamstrings and lower back through a controlled bow.' },

    // Glutes
    { id: 'glutes-hip-thrust', name: 'Hip Thrust', group: 'Glutes', secondary: ['Hamstrings'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Driving the hips up with a barbell across the lap directly targets the glutes at the top of the movement better than almost any other exercise.' },
    { id: 'glutes-bridge', name: 'Glute Bridge', group: 'Glutes', secondary: ['Hamstrings'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'A simpler version of the hip thrust performed on the floor, squeezing the glutes at the top to build activation and endurance.' },
    { id: 'glutes-bulgarian-split-squat', name: 'Bulgarian Split Squat', group: 'Glutes', secondary: ['Quads', 'Hamstrings'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'With the rear foot elevated on a bench, this single-leg squat variation loads one glute and quad hard while demanding balance and control.' },
    { id: 'glutes-cable-kickback', name: 'Cable Kickback', group: 'Glutes', secondary: ['Hamstrings'], equipment: 'Cable', difficulty: 'Beginner', desc: 'Kicking one leg back against cable resistance isolates the glute at the end range, a focused finisher for glute activation.' },
    { id: 'glutes-sumo-deadlift', name: 'Sumo Deadlift', group: 'Glutes', secondary: ['Quads', 'Hamstrings', 'Back'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'A wide-stance deadlift variation that shifts more load onto the glutes and inner quads compared to a conventional pull.' },
    { id: 'glutes-banded-walk', name: 'Banded Lateral Walk', group: 'Glutes', secondary: [], equipment: 'Bands', difficulty: 'Beginner', desc: "Stepping sideways against a resistance band targets the glute medius, the side-glute muscle responsible for hip stability." },

    // Calves
    { id: 'calves-standing-raise', name: 'Standing Calf Raise', group: 'Calves', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: 'Rising up onto the toes against resistance targets the larger gastrocnemius muscle, the main muscle that gives the calf its shape.' },
    { id: 'calves-seated-raise', name: 'Seated Calf Raise', group: 'Calves', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: "Performing the raise with the knee bent shifts emphasis onto the soleus, the deeper calf muscle that's harder to reach with straight-leg raises." },
    { id: 'calves-db-raise', name: 'Dumbbell Calf Raise', group: 'Calves', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Holding dumbbells while rising onto the toes on a raised surface allows a deep stretch at the bottom and a full contraction at the top.' },
    { id: 'calves-bodyweight-raise', name: 'Bodyweight Calf Raise', group: 'Calves', secondary: [], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'A simple, equipment-free way to build calf endurance and size by rising onto the toes repeatedly, easy to do almost anywhere.' },
    { id: 'calves-barbell-raise', name: 'Barbell Calf Raise', group: 'Calves', secondary: [], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Loading a barbell across the back while raising onto the toes lets more advanced lifters add heavier resistance than bodyweight alone allows.' },
    { id: 'calves-jump-rope', name: 'Jump Rope', group: 'Calves', secondary: ['Core/Abs'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'The repeated push-off of jump rope builds calf endurance and power while doubling as a solid cardio conditioning tool.' },

    // Core/Abs
    { id: 'core-plank', name: 'Plank', group: 'Core/Abs', secondary: ['Shoulders'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'Holding a straight-body position on the forearms builds anti-extension core strength — the ability to resist your hips sagging under load.' },
    { id: 'core-hanging-leg-raise', name: 'Hanging Leg Raise', group: 'Core/Abs', secondary: [], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Raising the legs while hanging from a bar targets the lower abs and hip flexors, a challenging move that also tests grip endurance.' },
    { id: 'core-cable-woodchop', name: 'Cable Woodchop', group: 'Core/Abs', secondary: ['Shoulders'], equipment: 'Cable', difficulty: 'Intermediate', desc: 'Rotating the torso against cable resistance from high to low builds rotational core strength, useful for sports and everyday twisting movements.' },
    { id: 'core-ab-wheel', name: 'Ab Wheel Rollout', group: 'Core/Abs', secondary: ['Shoulders', 'Back'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Rolling a wheel out from a kneeling position demands serious anti-extension core control to keep the lower back from collapsing.' },
    { id: 'core-russian-twist', name: 'Russian Twist', group: 'Core/Abs', secondary: [], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'Rotating a weight side to side while balanced on the tailbone targets the obliques, the muscles that give the waist its twisting strength.' },
    { id: 'core-dead-bug', name: 'Dead Bug', group: 'Core/Abs', secondary: [], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'Slowly extending opposite arm and leg while keeping the lower back flat against the floor teaches core bracing without any spinal movement.' }
  ];

  var MUSCLE_GROUPS = [];
  EXERCISES.forEach(function (ex) { if (MUSCLE_GROUPS.indexOf(ex.group) === -1) MUSCLE_GROUPS.push(ex.group); });

  var EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Bands'];

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
