(function () {
  var LONG_PRESS_MS = 550;

  function uid() {
    return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Shared field definitions -------------------------------------

  var F = {
    duration: { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 45:30' },
    durationPlayed: { key: 'duration', label: 'Duration / Time Played', type: 'text', placeholder: 'e.g. 45:30' },
    distance: { key: 'distance', label: 'Distance', type: 'number', placeholder: 'mi or km' },
    avgPaceSpeed: { key: 'avgPaceSpeed', label: 'Avg Pace / Speed', type: 'text', placeholder: 'e.g. 8:30/mi or 18 mph' },
    elevationGain: { key: 'elevationGain', label: 'Elevation Gain', type: 'number' },
    avgHeartRate: { key: 'avgHeartRate', label: 'Avg Heart Rate', type: 'number', placeholder: 'bpm' },
    maxHeartRate: { key: 'maxHeartRate', label: 'Max Heart Rate', type: 'number', placeholder: 'bpm' },
    caloriesBurned: { key: 'caloriesBurned', label: 'Calories Burned', type: 'number' },
    notes: { key: 'notes', label: 'Notes', type: 'text', placeholder: 'optional' },
    laps: { key: 'laps', label: 'Number of Laps / Lengths', type: 'number' },
    strokeType: { key: 'strokeType', label: 'Stroke Type', type: 'select', options: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Mixed / IM', 'Other'] },
    avgPace100: { key: 'avgPace100', label: 'Avg Pace per 100m', type: 'text', placeholder: 'e.g. 1:45' },
    swolf: { key: 'swolf', label: 'SWOLF Score', type: 'number' },
    verticalDescent: { key: 'verticalDescent', label: 'Vertical Descent', type: 'number', placeholder: 'ft or m' },
    numberOfRuns: { key: 'numberOfRuns', label: 'Number of Runs', type: 'number' },
    avgSpeed: { key: 'avgSpeed', label: 'Avg Speed', type: 'text', placeholder: 'e.g. 12 mph' },
    yourScore: { key: 'yourScore', label: 'Your Score', type: 'number' },
    opponentScore: { key: 'opponentScore', label: 'Opponent Score', type: 'number' },
    setsWon: { key: 'setsWon', label: 'Sets Won', type: 'number' },
    setsLost: { key: 'setsLost', label: 'Sets Lost', type: 'number' },
    roundsIntervals: { key: 'roundsIntervals', label: 'Number of Rounds / Intervals', type: 'number' },
    styleType: { key: 'styleType', label: 'Style / Type', type: 'text', placeholder: 'e.g. Vinyasa, Hatha' }
  };

  var EXTRA_FIELDS = {
    basketball: [
      { key: 'pointsScored', label: 'Points Scored', type: 'number' },
      { key: 'firstHalfPoints', label: '1st Half Points', type: 'number' },
      { key: 'secondHalfPoints', label: '2nd Half Points', type: 'number' },
      { key: 'rebounds', label: 'Rebounds', type: 'number' },
      { key: 'assists', label: 'Assists', type: 'number' },
      { key: 'foulsCommitted', label: 'Fouls Committed', type: 'number' }
    ],
    soccer: [
      { key: 'goals', label: 'Goals', type: 'number' },
      { key: 'assists', label: 'Assists', type: 'number' },
      { key: 'shotsOnTarget', label: 'Shots on Target', type: 'number' },
      { key: 'foulsCommitted', label: 'Fouls Committed', type: 'number' },
      { key: 'yellowCards', label: 'Yellow Cards', type: 'number' },
      { key: 'redCards', label: 'Red Cards', type: 'number' },
      { key: 'firstHalfScore', label: '1st Half Score', type: 'text', placeholder: 'e.g. 1-0' },
      { key: 'secondHalfScore', label: '2nd Half Score', type: 'text', placeholder: 'e.g. 1-1' }
    ],
    'american-football': [
      { key: 'pointsScored', label: 'Points Scored', type: 'number' },
      { key: 'touchdowns', label: 'Touchdowns', type: 'number' },
      { key: 'tackles', label: 'Tackles', type: 'number' },
      { key: 'positionPlayed', label: 'Position Played', type: 'text' },
      { key: 'q1Points', label: 'Q1 Points', type: 'number' },
      { key: 'q2Points', label: 'Q2 Points', type: 'number' },
      { key: 'q3Points', label: 'Q3 Points', type: 'number' },
      { key: 'q4Points', label: 'Q4 Points', type: 'number' }
    ],
    tennis: [
      { key: 'gamesWon', label: 'Games Won', type: 'number' },
      { key: 'gamesLost', label: 'Games Lost', type: 'number' }
    ],
    pickleball: [
      { key: 'pointsScored', label: 'Points Scored', type: 'number' },
      { key: 'pointsAgainst', label: 'Points Against', type: 'number' }
    ]
  };

  var TEMPLATES = {
    gpsEndurance: { fields: [F.duration, F.distance, F.avgPaceSpeed, F.elevationGain, F.avgHeartRate, F.maxHeartRate, F.caloriesBurned, F.notes] },
    swim: { fields: [F.duration, F.distance, F.laps, F.strokeType, F.avgPace100, F.swolf, F.avgHeartRate, F.caloriesBurned, F.notes] },
    winterSport: { fields: [F.duration, F.distance, F.verticalDescent, F.numberOfRuns, F.avgSpeed, F.avgHeartRate, F.caloriesBurned, F.notes] },
    waterSport: { fields: [F.duration, F.distance, F.avgSpeed, F.avgHeartRate, F.caloriesBurned, F.notes] },
    teamSport: { before: [F.durationPlayed, F.yourScore, F.opponentScore], after: [F.avgHeartRate, F.caloriesBurned, F.notes] },
    racketSport: { before: [F.duration, F.setsWon, F.setsLost], after: [F.avgHeartRate, F.caloriesBurned, F.notes] },
    combatInterval: { fields: [F.duration, F.roundsIntervals, F.avgHeartRate, F.maxHeartRate, F.caloriesBurned, F.notes] },
    mindRecovery: { fields: [F.duration, F.styleType, F.avgHeartRate, F.caloriesBurned, F.notes] }
  };

  function templateFields(templateId, extra) {
    var t = TEMPLATES[templateId];
    if (t.fields) return t.fields;
    return t.before.concat(extra || []).concat(t.after);
  }

  // ---- Sport catalog ---------------------------------------------------

  var SPORT_CATALOG = [
    {
      category: 'Running',
      sports: [
        { id: 'run', title: 'Run', status: 'live', template: 'gpsEndurance' },
        { id: 'trail-run', title: 'Trail Run', status: 'live', template: 'gpsEndurance' },
        { id: 'treadmill', title: 'Treadmill', status: 'live', template: 'gpsEndurance' },
        { id: 'track-run', title: 'Track Run', status: 'soon' },
        { id: 'ultra-run', title: 'Ultra Run', status: 'soon' },
        { id: 'virtual-run', title: 'Virtual Run', status: 'soon' },
        { id: 'indoor-track', title: 'Indoor Track', status: 'soon' },
        { id: 'obstacle-racing', title: 'Obstacle Racing', status: 'soon' }
      ]
    },
    {
      category: 'Cycling',
      sports: [
        { id: 'road-bike', title: 'Road Bike', status: 'live', template: 'gpsEndurance' },
        { id: 'mountain-bike', title: 'Mountain Bike', status: 'live', template: 'gpsEndurance' },
        { id: 'indoor-bike', title: 'Indoor Bike', status: 'live', template: 'gpsEndurance' },
        { id: 'gravel-bike', title: 'Gravel Bike', status: 'soon' },
        { id: 'ebike', title: 'eBike', status: 'soon' },
        { id: 'emtb', title: 'eMTB', status: 'soon' },
        { id: 'bmx', title: 'BMX', status: 'soon' },
        { id: 'cyclocross', title: 'Cyclocross', status: 'soon' },
        { id: 'bike-commute', title: 'Bike Commute', status: 'soon' },
        { id: 'bike-tour', title: 'Bike Tour', status: 'soon' }
      ]
    },
    {
      category: 'Swimming',
      sports: [
        { id: 'pool-swim', title: 'Pool Swim', status: 'live', template: 'swim' },
        { id: 'open-water-swim', title: 'Open Water Swim', status: 'live', template: 'swim' }
      ]
    },
    {
      category: 'Outdoor',
      sports: [
        { id: 'hike', title: 'Hike', status: 'live', template: 'gpsEndurance' },
        { id: 'walk', title: 'Walk', status: 'live', template: 'gpsEndurance' },
        { id: 'mountaineering', title: 'Mountaineering', status: 'soon' },
        { id: 'horseback-riding', title: 'Horseback Riding', status: 'soon' },
        { id: 'golf', title: 'Golf', status: 'soon' },
        { id: 'fishing', title: 'Fishing', status: 'soon' },
        { id: 'hunting', title: 'Hunting', status: 'soon' },
        { id: 'archery', title: 'Archery', status: 'soon' },
        { id: 'bouldering', title: 'Bouldering', status: 'soon' },
        { id: 'disc-golf', title: 'Disc Golf', status: 'soon' },
        { id: 'inline-skating', title: 'Inline Skating', status: 'soon' }
      ]
    },
    {
      category: 'Winter Sports',
      sports: [
        { id: 'ski', title: 'Ski', status: 'live', template: 'winterSport' },
        { id: 'snowboard', title: 'Snowboard', status: 'live', template: 'winterSport' },
        { id: 'backcountry-ski', title: 'Backcountry Ski', status: 'soon' },
        { id: 'cross-country-ski', title: 'Cross-Country Ski', status: 'soon' },
        { id: 'snowshoe', title: 'Snowshoe', status: 'soon' },
        { id: 'ice-skating', title: 'Ice Skating', status: 'soon' },
        { id: 'snowmobile', title: 'Snowmobile', status: 'soon' }
      ]
    },
    {
      category: 'Water Sports',
      sports: [
        { id: 'kayak', title: 'Kayak', status: 'live', template: 'waterSport' },
        { id: 'sup', title: 'Stand-Up Paddleboard', status: 'live', template: 'waterSport' },
        { id: 'surf', title: 'Surf', status: 'live', template: 'waterSport' },
        { id: 'sail', title: 'Sail', status: 'soon' },
        { id: 'row', title: 'Row', status: 'soon' },
        { id: 'wakeboard', title: 'Wakeboard', status: 'soon' },
        { id: 'wakesurf', title: 'Wakesurf', status: 'soon' },
        { id: 'water-ski', title: 'Water Ski', status: 'soon' },
        { id: 'kiteboard', title: 'Kiteboard', status: 'soon' },
        { id: 'windsurf', title: 'Windsurf', status: 'soon' }
      ]
    },
    {
      category: 'Team Sports',
      sports: [
        { id: 'basketball', title: 'Basketball', status: 'live', template: 'teamSport', extra: 'basketball' },
        { id: 'soccer', title: 'Soccer', status: 'live', template: 'teamSport', extra: 'soccer' },
        { id: 'american-football', title: 'American Football', status: 'live', template: 'teamSport', extra: 'american-football' },
        { id: 'baseball', title: 'Baseball', status: 'soon' },
        { id: 'softball', title: 'Softball', status: 'soon' },
        { id: 'ice-hockey', title: 'Ice Hockey', status: 'soon' },
        { id: 'field-hockey', title: 'Field Hockey', status: 'soon' },
        { id: 'lacrosse', title: 'Lacrosse', status: 'soon' },
        { id: 'rugby', title: 'Rugby', status: 'soon' },
        { id: 'cricket', title: 'Cricket', status: 'soon' },
        { id: 'volleyball', title: 'Volleyball', status: 'soon' },
        { id: 'ultimate-frisbee', title: 'Ultimate Frisbee', status: 'soon' }
      ]
    },
    {
      category: 'Racket Sports',
      sports: [
        { id: 'tennis', title: 'Tennis', status: 'live', template: 'racketSport', extra: 'tennis' },
        { id: 'pickleball', title: 'Pickleball', status: 'live', template: 'racketSport', extra: 'pickleball' },
        { id: 'padel', title: 'Padel', status: 'soon' },
        { id: 'badminton', title: 'Badminton', status: 'soon' },
        { id: 'squash', title: 'Squash', status: 'soon' },
        { id: 'racquetball', title: 'Racquetball', status: 'soon' },
        { id: 'table-tennis', title: 'Table Tennis', status: 'soon' }
      ]
    },
    {
      category: 'Gym',
      sports: [
        { id: 'strength-training', title: 'Strength Training', status: 'live', template: 'strength' },
        { id: 'hiit', title: 'HIIT', status: 'live', template: 'combatInterval' },
        { id: 'yoga', title: 'Yoga', status: 'live', template: 'mindRecovery' },
        { id: 'boxing', title: 'Boxing', status: 'live', template: 'combatInterval' },
        { id: 'elliptical', title: 'Elliptical', status: 'live', template: 'gpsEndurance' },
        { id: 'indoor-row', title: 'Indoor Row', status: 'live', template: 'gpsEndurance' },
        { id: 'cardio', title: 'Cardio', status: 'soon' },
        { id: 'pilates', title: 'Pilates', status: 'soon' },
        { id: 'stair-stepper', title: 'Stair Stepper', status: 'soon' },
        { id: 'jump-rope', title: 'Jump Rope', status: 'soon' },
        { id: 'mobility', title: 'Mobility', status: 'soon' }
      ]
    },
    {
      category: 'Other',
      sports: [
        { id: 'triathlon', title: 'Triathlon', status: 'soon' },
        { id: 'meditation', title: 'Meditation', status: 'soon' },
        { id: 'breathwork', title: 'Breathwork', status: 'soon' }
      ]
    }
  ];

  var SPORT_INDEX = {};
  SPORT_CATALOG.forEach(function (cat) {
    cat.sports.forEach(function (sport) { SPORT_INDEX[sport.id] = sport; });
  });

  function sportDef(id) { return SPORT_INDEX[id]; }
  function sportTitle(id) { var d = sportDef(id); return d ? d.title : id; }

  // ---- Generic field rendering -----------------------------------------

  function fieldInputHtml(f) {
    if (f.type === 'select') {
      var opts = '<option value=""></option>' + f.options.map(function (o) {
        return '<option value="' + escapeHtml(o) + '">' + escapeHtml(o) + '</option>';
      }).join('');
      return '<select name="' + f.key + '">' + opts + '</select>';
    }
    var type = f.type === 'number' ? 'number' : 'text';
    var extra = f.type === 'number' ? ' step="any" inputmode="decimal"' : '';
    var ph = f.placeholder ? ' placeholder="' + escapeHtml(f.placeholder) + '"' : '';
    return '<input type="' + type + '" name="' + f.key + '"' + extra + ph + '>';
  }

  // ---- Module mount -----------------------------------------------------

  function mount(container, api) {
    var data = api.load({});

    // Migrate the old single-sport shape ({ entries: [...] }) into the
    // multi-sport shape, preserving existing Strength Training history.
    var migrated = false;
    if (Array.isArray(data.entries)) {
      data = {
        sports: ['strength-training'],
        currentSport: 'strength-training',
        entries: { 'strength-training': data.entries }
      };
      migrated = true;
    }
    if (!data.sports) data.sports = [];
    if (!data.entries) data.entries = {};
    if (data.currentSport === undefined) data.currentSport = null;

    function save() { api.save(data); }

    if (migrated) save();

    container.innerHTML =
      '<div class="sport-bar">' +
        '<div class="sport-strip"></div>' +
        '<button type="button" class="sport-add" aria-label="Add a sport">+</button>' +
      '</div>' +
      '<div class="sport-screen"></div>';

    var stripEl = container.querySelector('.sport-strip');
    var addBtn = container.querySelector('.sport-add');
    var screenEl = container.querySelector('.sport-screen');

    var pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'overlay';
    pickerOverlay.hidden = true;
    pickerOverlay.innerHTML =
      '<div class="overlay__panel">' +
        '<div class="overlay__header">' +
          '<h2>Add a Sport</h2>' +
          '<button type="button" class="icon-btn sport-picker-close" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div class="overlay__body sport-picker-list"></div>' +
      '</div>';
    container.appendChild(pickerOverlay);

    var confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'overlay overlay--center';
    confirmOverlay.hidden = true;
    confirmOverlay.innerHTML =
      '<div class="confirm-dialog">' +
        '<p class="confirm-dialog__text">Remove <strong class="sport-confirm-name"></strong>?</p>' +
        '<div class="confirm-dialog__actions">' +
          '<button type="button" class="btn-secondary sport-confirm-cancel">Cancel</button>' +
          '<button type="button" class="btn-danger sport-confirm-ok">Remove</button>' +
        '</div>' +
      '</div>';
    container.appendChild(confirmOverlay);

    var pendingRemoveId = null;
    var pickerBuilt = false;

    function openPicker() {
      buildPicker();
      pickerOverlay.hidden = false;
    }
    function closePicker() { pickerOverlay.hidden = true; }

    function openConfirm(sportId) {
      pendingRemoveId = sportId;
      confirmOverlay.querySelector('.sport-confirm-name').textContent = sportTitle(sportId);
      confirmOverlay.hidden = false;
    }
    function closeConfirm() {
      confirmOverlay.hidden = true;
      pendingRemoveId = null;
    }

    pickerOverlay.querySelector('.sport-picker-close').addEventListener('click', closePicker);
    pickerOverlay.addEventListener('click', function (e) { if (e.target === pickerOverlay) closePicker(); });

    confirmOverlay.querySelector('.sport-confirm-cancel').addEventListener('click', closeConfirm);
    confirmOverlay.addEventListener('click', function (e) { if (e.target === confirmOverlay) closeConfirm(); });
    confirmOverlay.querySelector('.sport-confirm-ok').addEventListener('click', function () {
      if (pendingRemoveId) removeSport(pendingRemoveId);
      closeConfirm();
    });

    function buildPickerRow(sport) {
      var row = document.createElement('div');
      row.className = 'picker-tool' + (sport.status !== 'live' ? ' picker-tool--soon' : '');

      var text = document.createElement('div');
      text.className = 'picker-tool__text';
      text.innerHTML = '<span class="picker-tool__title">' + sport.title + '</span>';
      row.appendChild(text);

      if (sport.status === 'live') {
        row.setAttribute('role', 'button');
        row.tabIndex = 0;
        var activate = function () {
          addSport(sport.id);
          closePicker();
        };
        row.addEventListener('click', activate);
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate();
          }
        });
      } else {
        var badge = document.createElement('span');
        badge.className = 'picker-tool__badge';
        badge.textContent = 'Coming Soon';
        row.appendChild(badge);
        row.setAttribute('aria-disabled', 'true');
      }

      return row;
    }

    function buildPickerSection(cat) {
      var section = document.createElement('section');
      section.className = 'picker-section';

      var header = document.createElement('button');
      header.type = 'button';
      header.className = 'picker-section__header';
      header.innerHTML = '<span>' + cat.category + '</span><span class="picker-section__chevron">&#8964;</span>';
      header.addEventListener('click', function () {
        section.classList.toggle('picker-section--collapsed');
      });

      var body = document.createElement('div');
      body.className = 'picker-section__body';
      cat.sports.forEach(function (sport) { body.appendChild(buildPickerRow(sport)); });

      section.appendChild(header);
      section.appendChild(body);
      return section;
    }

    function buildPicker() {
      if (pickerBuilt) return;
      var listEl = pickerOverlay.querySelector('.sport-picker-list');
      SPORT_CATALOG.forEach(function (cat) { listEl.appendChild(buildPickerSection(cat)); });
      pickerBuilt = true;
    }

    addBtn.addEventListener('click', openPicker);

    function addSport(id) {
      if (data.sports.indexOf(id) === -1) data.sports.push(id);
      data.currentSport = id;
      save();
      renderStrip();
      renderScreen();
    }

    function removeSport(id) {
      data.sports = data.sports.filter(function (s) { return s !== id; });
      var wasCurrent = data.currentSport === id;
      if (wasCurrent) data.currentSport = null;
      save();
      renderStrip();
      if (wasCurrent) renderScreen();
    }

    function switchSport(id) {
      if (data.sports.indexOf(id) === -1) return;
      data.currentSport = id;
      save();
      renderScreen();
      renderStrip();
    }

    function buildSportTab(id) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sport-tab' + (id === data.currentSport ? ' sport-tab--active' : '');
      btn.textContent = sportTitle(id);

      var timer = null;
      var longPressed = false;

      function start() {
        longPressed = false;
        timer = setTimeout(function () {
          longPressed = true;
          if (navigator.vibrate) {
            try { navigator.vibrate(15); } catch (e) {}
          }
          openConfirm(id);
        }, LONG_PRESS_MS);
      }
      function cancel() {
        if (timer) { clearTimeout(timer); timer = null; }
      }

      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', cancel);
      btn.addEventListener('pointerleave', cancel);
      btn.addEventListener('pointercancel', cancel);

      btn.addEventListener('click', function () {
        if (longPressed) {
          longPressed = false;
          return;
        }
        switchSport(id);
      });

      return btn;
    }

    function renderStrip() {
      stripEl.innerHTML = '';
      data.sports.forEach(function (id) { stripEl.appendChild(buildSportTab(id)); });
    }

    function renderScreen() {
      screenEl.innerHTML = '';

      if (!data.currentSport || data.sports.indexOf(data.currentSport) === -1) {
        screenEl.innerHTML = '<p class="screen-empty">Tap + to add a sport.</p>';
        return;
      }

      var id = data.currentSport;
      var def = sportDef(id);

      if (id === 'strength-training') {
        renderStrengthTraining(screenEl);
        return;
      }

      if (!def || !def.template) {
        screenEl.innerHTML = '<p class="screen-empty">This sport is not available yet.</p>';
        return;
      }

      renderGenericLog(screenEl, id, def);
    }

    function renderStrengthTraining(target) {
      if (!data.entries['strength-training']) data.entries['strength-training'] = [];
      var entries = data.entries['strength-training'];

      target.innerHTML =
        '<form class="wl-form">' +
          '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
          '<div class="field-row"><label>Exercise<input type="text" name="exercise" placeholder="e.g. Bench Press" required></label></div>' +
          '<div class="field-row field-row--3">' +
            '<label>Sets<input type="number" name="sets" min="0" inputmode="numeric"></label>' +
            '<label>Reps<input type="number" name="reps" min="0" inputmode="numeric"></label>' +
            '<label>Weight<input type="number" name="weight" min="0" step="0.5" inputmode="decimal"></label>' +
          '</div>' +
          '<div class="field-row"><label>Notes<input type="text" name="notes" placeholder="optional"></label></div>' +
          '<button type="submit" class="btn-primary">Add Set</button>' +
        '</form>' +
        '<div class="wl-log"></div>';

      var form = target.querySelector('.wl-form');
      var logEl = target.querySelector('.wl-log');

      function render() {
        logEl.innerHTML = '';
        if (entries.length === 0) {
          logEl.innerHTML = '<p class="empty-hint">No sets logged yet.</p>';
          return;
        }

        var byDate = {};
        entries.forEach(function (e) {
          if (!byDate[e.date]) byDate[e.date] = [];
          byDate[e.date].push(e);
        });

        var dates = Object.keys(byDate).sort().reverse();
        dates.forEach(function (date) {
          var group = document.createElement('div');
          group.className = 'wl-group';

          var heading = document.createElement('h4');
          heading.className = 'wl-group__date';
          heading.textContent = formatDate(date);
          group.appendChild(heading);

          var table = document.createElement('table');
          table.className = 'wl-table';
          table.innerHTML = '<thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Notes</th><th></th></tr></thead>';

          var tbody = document.createElement('tbody');
          byDate[date].forEach(function (entry) {
            var tr = document.createElement('tr');
            tr.innerHTML =
              '<td>' + escapeHtml(entry.exercise) + '</td>' +
              '<td>' + (entry.sets || '') + '</td>' +
              '<td>' + (entry.reps || '') + '</td>' +
              '<td>' + (entry.weight || '') + '</td>' +
              '<td>' + escapeHtml(entry.notes || '') + '</td>' +
              '<td></td>';

            var delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'row-delete';
            delBtn.setAttribute('aria-label', 'Delete row');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', function () {
              entries = entries.filter(function (e) { return e.id !== entry.id; });
              data.entries['strength-training'] = entries;
              save();
              render();
            });
            tr.lastElementChild.appendChild(delBtn);
            tbody.appendChild(tr);
          });

          table.appendChild(tbody);
          group.appendChild(table);
          logEl.appendChild(group);
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var exercise = (fd.get('exercise') || '').toString().trim();
        if (!exercise) return;

        entries.push({
          id: uid(),
          date: fd.get('date') || todayStr(),
          exercise: exercise,
          sets: fd.get('sets') ? Number(fd.get('sets')) : null,
          reps: fd.get('reps') ? Number(fd.get('reps')) : null,
          weight: fd.get('weight') ? Number(fd.get('weight')) : null,
          notes: (fd.get('notes') || '').toString().trim()
        });
        data.entries['strength-training'] = entries;

        save();
        render();
        form.reset();
        form.querySelector('[name="date"]').value = todayStr();
        form.querySelector('[name="exercise"]').focus();
      });

      render();
    }

    function renderGenericLog(target, sportId, def) {
      if (!data.entries[sportId]) data.entries[sportId] = [];
      var entries = data.entries[sportId];
      var fields = templateFields(def.template, def.extra ? EXTRA_FIELDS[def.extra] : null);

      var formFieldsHtml = fields.map(function (f) {
        return '<div class="field-row"><label>' + f.label + fieldInputHtml(f) + '</label></div>';
      }).join('');

      target.innerHTML =
        '<form class="gl-form">' +
          '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
          formFieldsHtml +
          '<button type="submit" class="btn-primary">Add Entry</button>' +
        '</form>' +
        '<div class="gl-log"></div>';

      var form = target.querySelector('.gl-form');
      var logEl = target.querySelector('.gl-log');

      function render() {
        logEl.innerHTML = '';
        if (entries.length === 0) {
          logEl.innerHTML = '<p class="empty-hint">No entries logged yet.</p>';
          return;
        }

        var byDate = {};
        entries.forEach(function (e) {
          if (!byDate[e.date]) byDate[e.date] = [];
          byDate[e.date].push(e);
        });

        var dates = Object.keys(byDate).sort().reverse();
        dates.forEach(function (date) {
          var group = document.createElement('div');
          group.className = 'wl-group';

          var heading = document.createElement('h4');
          heading.className = 'wl-group__date';
          heading.textContent = formatDate(date);
          group.appendChild(heading);

          var wrap = document.createElement('div');
          wrap.className = 'wl-table-wrap';

          var table = document.createElement('table');
          table.className = 'wl-table';
          var headRow = '<tr>' + fields.map(function (f) { return '<th>' + f.label + '</th>'; }).join('') + '<th></th></tr>';
          table.innerHTML = '<thead>' + headRow + '</thead>';

          var tbody = document.createElement('tbody');
          byDate[date].forEach(function (entry) {
            var tr = document.createElement('tr');
            tr.innerHTML = fields.map(function (f) {
              var val = entry[f.key];
              return '<td>' + (val !== undefined && val !== null && val !== '' ? escapeHtml(String(val)) : '') + '</td>';
            }).join('') + '<td></td>';

            var delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'row-delete';
            delBtn.setAttribute('aria-label', 'Delete row');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', function () {
              var idx = entries.indexOf(entry);
              if (idx !== -1) entries.splice(idx, 1);
              save();
              render();
            });
            tr.lastElementChild.appendChild(delBtn);
            tbody.appendChild(tr);
          });

          table.appendChild(tbody);
          wrap.appendChild(table);
          group.appendChild(wrap);
          logEl.appendChild(group);
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var entry = { id: uid(), date: fd.get('date') || todayStr() };

        fields.forEach(function (f) {
          var raw = fd.get(f.key);
          if (raw === null) return;
          raw = raw.toString().trim();
          if (raw === '') return;
          entry[f.key] = f.type === 'number' ? Number(raw) : raw;
        });

        entries.push(entry);
        save();
        render();
        form.reset();
        form.querySelector('[name="date"]').value = todayStr();
      });

      render();
    }

    renderStrip();
    renderScreen();
  }

  ModuleRegistry.register({
    id: 'workout-logger',
    title: 'Workout Logger',
    icon: '🏋️',
    mount: mount
  });
})();
