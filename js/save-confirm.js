// Shared save-confirmation sheet, triggered from any tool's save/log action.
// Callers hand over an auto-generated one-line summary (editable by the user)
// plus their own onSave callback that performs the actual save exactly as it
// already worked before this existed. "Save & Post to Timeline" runs that same
// onSave callback, then drops a matching post into Activity Feed's own
// storage (module:activity-feed) using its existing post shape, so it renders
// there identically to a post made from the feed's own composer.
var SaveConfirm = (function () {
  var overlay, captionInput, saveBtn, saveAndPostBtn, closeBtn;
  var built = false;
  var pendingOnSave = null;
  var pendingTaggedLabel = null;

  function uid() {
    return 'sc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    var d = new Date();
    var localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    return new Date(localMs).toISOString().slice(0, 10);
  }

  function addFeedPost(text, taggedLabel) {
    var data = Storage.get('module:activity-feed', { posts: [] });
    if (!data.posts) data.posts = [];
    data.posts.unshift({
      id: uid(),
      date: todayStr(),
      text: text,
      taggedLabel: taggedLabel || null,
      kudos: 0
    });
    Storage.set('module:activity-feed', data);
  }

  function buildOverlay() {
    if (built) return;
    overlay = document.createElement('div');
    overlay.className = 'overlay overlay--save-confirm';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="overlay__panel">' +
        '<div class="overlay__header">' +
          '<h2>Save</h2>' +
          '<button type="button" class="icon-btn sc-close" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div class="overlay__body">' +
          '<div class="field-row"><label>Caption for the timeline post<textarea class="sc-caption" rows="2"></textarea></label></div>' +
          '<div class="sc-actions">' +
            '<button type="button" class="btn-primary sc-save-post-btn">Save &amp; Post to Timeline</button>' +
            '<button type="button" class="btn-secondary sc-save-btn">Save</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    captionInput = overlay.querySelector('.sc-caption');
    saveBtn = overlay.querySelector('.sc-save-btn');
    saveAndPostBtn = overlay.querySelector('.sc-save-post-btn');
    closeBtn = overlay.querySelector('.sc-close');

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    saveBtn.addEventListener('click', function () {
      var onSave = pendingOnSave;
      close();
      if (onSave) onSave();
    });

    saveAndPostBtn.addEventListener('click', function () {
      var onSave = pendingOnSave;
      var taggedLabel = pendingTaggedLabel;
      var caption = captionInput.value.trim();
      close();
      if (onSave) onSave();
      if (caption) addFeedPost(caption, taggedLabel);
    });

    built = true;
  }

  function close() {
    overlay.hidden = true;
    pendingOnSave = null;
    pendingTaggedLabel = null;
  }

  function show(options) {
    buildOverlay();
    pendingOnSave = options.onSave || null;
    pendingTaggedLabel = options.taggedLabel || null;
    captionInput.value = options.summary || '';
    overlay.hidden = false;
    captionInput.focus();
  }

  return { show: show };
})();
