(function () {
  var MAX_DIM = 256;
  var JPEG_QUALITY = 0.7;

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

  function avatarHtml(photo) {
    return photo
      ? '<img class="profile-avatar-img" src="' + photo + '" alt="Profile picture">'
      : '<div class="profile-avatar-placeholder">&#128100;</div>';
  }

  function mount(container, api) {
    var data = api.load({ name: '', age: null, photo: null });
    var editing = false;

    function save() { api.save(data); }

    function renderView() {
      container.innerHTML =
        '<div class="profile-view">' +
          '<div class="profile-avatar">' + avatarHtml(data.photo) + '</div>' +
          '<h3 class="profile-name">' + (data.name ? escapeHtml(data.name) : 'Add your name') + '</h3>' +
          '<p class="profile-age">' + (data.age ? 'Age ' + escapeHtml(String(data.age)) : 'Add your age') + '</p>' +
          '<button type="button" class="btn-primary profile-edit-btn">Edit Profile</button>' +
        '</div>';

      container.querySelector('.profile-edit-btn').addEventListener('click', function () {
        editing = true;
        render();
      });
    }

    function renderEdit() {
      container.innerHTML =
        '<form class="profile-form">' +
          '<div class="profile-avatar-edit">' +
            '<div class="profile-avatar">' + avatarHtml(data.photo) + '</div>' +
            '<label class="profile-photo-label">Change Photo' +
              '<input type="file" accept="image/*" class="profile-photo-input" hidden>' +
            '</label>' +
          '</div>' +
          '<div class="field-row"><label>Name<input type="text" name="name" placeholder="Your name" value="' + escapeHtml(data.name || '') + '"></label></div>' +
          '<div class="field-row"><label>Age<input type="number" name="age" min="0" inputmode="numeric" value="' + (data.age || '') + '"></label></div>' +
          '<div class="profile-form-actions">' +
            '<button type="button" class="btn-secondary profile-cancel-btn">Cancel</button>' +
            '<button type="submit" class="btn-primary">Save</button>' +
          '</div>' +
        '</form>';

      var form = container.querySelector('.profile-form');
      var photoInput = container.querySelector('.profile-photo-input');
      var avatarEl = container.querySelector('.profile-avatar');
      var pendingPhoto = data.photo;

      photoInput.addEventListener('change', function () {
        var file = photoInput.files && photoInput.files[0];
        if (!file) return;
        compressImage(file, function (dataUrl) {
          pendingPhoto = dataUrl;
          avatarEl.innerHTML = avatarHtml(pendingPhoto);
        });
      });

      container.querySelector('.profile-cancel-btn').addEventListener('click', function () {
        editing = false;
        render();
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        data.name = (fd.get('name') || '').toString().trim();
        var ageRaw = (fd.get('age') || '').toString().trim();
        data.age = ageRaw ? Number(ageRaw) : null;
        data.photo = pendingPhoto;
        save();
        editing = false;
        render();
      });
    }

    function render() {
      if (editing) renderEdit();
      else renderView();
    }

    render();
  }

  AccountRegistry.register({
    id: 'profile',
    title: 'Personal Profile',
    icon: '👤',
    mount: mount
  });
})();
