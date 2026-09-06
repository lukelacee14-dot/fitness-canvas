(function () {
  var SPORT_TITLES = {
    run: 'Run', 'trail-run': 'Trail Run', treadmill: 'Treadmill',
    'road-bike': 'Road Bike', 'mountain-bike': 'Mountain Bike', 'indoor-bike': 'Indoor Bike',
    hike: 'Hike', walk: 'Walk', elliptical: 'Elliptical', 'indoor-row': 'Indoor Row',
    'pool-swim': 'Pool Swim', 'open-water-swim': 'Open Water Swim',
    ski: 'Ski', snowboard: 'Snowboard',
    kayak: 'Kayak', sup: 'Stand-Up Paddleboard', surf: 'Surf',
    basketball: 'Basketball', soccer: 'Soccer', 'american-football': 'American Football',
    tennis: 'Tennis', pickleball: 'Pickleball',
    hiit: 'HIIT', boxing: 'Boxing', yoga: 'Yoga'
  };

  function sportTitle(id) {
    return SPORT_TITLES[id] || id.split('-').map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  function uid() {
    return 'fd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getTaggableActivities() {
    var items = [];

    var wl = Storage.get('module:workout-logger', null);
    if (wl && wl.entries) {
      Object.keys(wl.entries).forEach(function (sportId) {
        (wl.entries[sportId] || []).forEach(function (e) {
          var label = sportId === 'strength-training' ? (e.exercise || 'Strength Training') : sportTitle(sportId);
          items.push({ date: e.date, label: label + ' — ' + formatDate(e.date) });
        });
      });
    }

    var mt = Storage.get('module:meal-tracker', null);
    if (mt && mt.days) {
      Object.keys(mt.days).forEach(function (date) {
        var day = mt.days[date];
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(function (section) {
          (day[section] || []).forEach(function (entry) {
            items.push({ date: date, label: (entry.name || 'Meal') + ' — ' + formatDate(date) });
          });
        });
      });
    }

    var bm = Storage.get('module:body-measurements', null);
    if (bm && bm.entries) {
      bm.entries.forEach(function (e) {
        items.push({ date: e.date, label: 'Body Measurement — ' + formatDate(e.date) });
      });
    }

    items.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return items.slice(0, 30);
  }

  function mount(container, api) {
    var data = api.load({ posts: [] });
    if (!data.posts) data.posts = [];

    function save() { api.save(data); }

    render();

    function render() {
      var streaks = ActivityLog.computeStreaks();
      var taggable = getTaggableActivities();

      container.innerHTML =
        '<div class="sk-hero sk-hero--compact">' +
          '<div class="sk-hero__item"><span class="sk-hero__value">&#128293; ' + streaks.current + '</span><span class="sk-hero__label">Day Streak</span></div>' +
        '</div>' +
        '<form class="af-post-form">' +
          '<div class="field-row"><label>Share an update<textarea name="text" rows="2" placeholder="e.g. Hit a new PR on bench press" required></textarea></label></div>' +
          (taggable.length
            ? '<div class="field-row"><label>Tag a Logged Activity (optional)<select name="tag"><option value="">None</option>' +
              taggable.map(function (t, i) { return '<option value="' + i + '">' + escapeHtml(t.label) + '</option>'; }).join('') +
              '</select></label></div>'
            : '') +
          '<button type="submit" class="btn-primary">Post</button>' +
        '</form>' +
        '<p class="fd-solo-note">Solo preview — friends and shared feeds arrive once accounts are added.</p>' +
        '<div class="af-posts"></div>';

      var form = container.querySelector('.af-post-form');
      var postsEl = container.querySelector('.af-posts');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var text = (fd.get('text') || '').toString().trim();
        if (!text) return;

        var tagRaw = fd.get('tag');
        var tagged = tagRaw !== null && tagRaw !== '' ? taggable[Number(tagRaw)] : null;

        data.posts.unshift({
          id: uid(),
          date: todayStr(),
          text: text,
          taggedLabel: tagged ? tagged.label : null,
          kudos: 0
        });
        save();
        form.reset();
        renderPosts();
      });

      renderPosts();

      function renderPosts() {
        if (data.posts.length === 0) {
          postsEl.innerHTML = '<p class="empty-hint">No updates yet — share your first one above.</p>';
          return;
        }

        postsEl.innerHTML = '';
        data.posts.forEach(function (post) {
          var card = document.createElement('div');
          card.className = 'af-post';
          card.innerHTML =
            '<div class="af-post__header"><span class="af-post__date">' + escapeHtml(formatDate(post.date)) + '</span></div>' +
            '<p class="af-post__text">' + escapeHtml(post.text) + '</p>' +
            (post.taggedLabel ? '<span class="af-post__tag">' + escapeHtml(post.taggedLabel) + '</span>' : '');

          var footer = document.createElement('div');
          footer.className = 'af-post__footer';

          var kudosBtn = document.createElement('button');
          kudosBtn.type = 'button';
          kudosBtn.className = 'af-kudos-btn';
          kudosBtn.innerHTML = '&#128079; <span class="af-kudos-count">' + post.kudos + '</span>';
          kudosBtn.addEventListener('click', function () {
            post.kudos++;
            save();
            kudosBtn.querySelector('.af-kudos-count').textContent = post.kudos;
          });

          var delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'row-delete';
          delBtn.setAttribute('aria-label', 'Delete post');
          delBtn.textContent = '✕';
          delBtn.addEventListener('click', function () {
            data.posts = data.posts.filter(function (p) { return p.id !== post.id; });
            save();
            renderPosts();
          });

          footer.appendChild(kudosBtn);
          footer.appendChild(delBtn);
          card.appendChild(footer);
          postsEl.appendChild(card);
        });
      }
    }
  }

  ModuleRegistry.register({
    id: 'activity-feed',
    title: 'Activity Feed',
    icon: '📣',
    mount: mount
  });
})();
