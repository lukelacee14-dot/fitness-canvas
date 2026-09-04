(function () {
  var MAX_DIM = 900;
  var JPEG_QUALITY = 0.75;

  function uid() {
    return 'pp' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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

  function compressImage(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        callback(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function mount(container, api) {
    var data = api.load({ entries: [] });
    if (!data.entries) data.entries = [];

    function save() { api.save(data); }

    var pendingPhoto = null;

    function uploadAreaHtml() {
      return pendingPhoto
        ? '<img class="pp-preview" src="' + pendingPhoto + '" alt="Preview">'
        : '<span class="pp-upload-placeholder">&#128248; Add Photo</span>';
    }

    function render() {
      container.innerHTML =
        '<form class="pp-form">' +
          '<div class="field-row"><label>Date<input type="date" name="date" value="' + todayStr() + '" required></label></div>' +
          '<label class="pp-upload-label">' +
            '<span class="pp-upload-area">' + uploadAreaHtml() + '</span>' +
            '<input type="file" accept="image/*" capture="environment" class="pp-photo-input" hidden>' +
          '</label>' +
          '<button type="submit" class="btn-primary pp-submit-btn" disabled>Save Photo</button>' +
        '</form>' +
        '<div class="pp-gallery"></div>';

      var form = container.querySelector('.pp-form');
      var photoInput = container.querySelector('.pp-photo-input');
      var uploadArea = container.querySelector('.pp-upload-area');
      var submitBtn = container.querySelector('.pp-submit-btn');

      photoInput.addEventListener('change', function () {
        var file = photoInput.files && photoInput.files[0];
        if (!file) return;
        compressImage(file, function (dataUrl) {
          pendingPhoto = dataUrl;
          uploadArea.innerHTML = uploadAreaHtml();
          submitBtn.disabled = false;
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!pendingPhoto) return;
        var fd = new FormData(form);
        data.entries.push({ id: uid(), date: fd.get('date') || todayStr(), photo: pendingPhoto });
        save();
        pendingPhoto = null;
        render();
      });

      renderGallery();
    }

    function renderGallery() {
      var galleryEl = container.querySelector('.pp-gallery');
      if (data.entries.length === 0) {
        galleryEl.innerHTML = '<p class="empty-hint">No progress photos yet.</p>';
        return;
      }

      var sorted = data.entries.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      galleryEl.innerHTML = '';

      sorted.forEach(function (entry) {
        var card = document.createElement('div');
        card.className = 'pp-card';
        card.innerHTML =
          '<img class="pp-card__img" src="' + entry.photo + '" alt="Progress photo">' +
          '<div class="pp-card__footer"><span>' + escapeHtml(formatDate(entry.date)) + '</span></div>';

        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'row-delete';
        delBtn.setAttribute('aria-label', 'Delete photo');
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', function () {
          data.entries = data.entries.filter(function (e) { return e.id !== entry.id; });
          save();
          renderGallery();
        });

        card.querySelector('.pp-card__footer').appendChild(delBtn);
        galleryEl.appendChild(card);
      });
    }

    render();
  }

  ModuleRegistry.register({
    id: 'progress-photos',
    title: 'Progress Photos',
    icon: '📸',
    mount: mount
  });
})();
