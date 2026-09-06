// Shared Rest Timer overlay — a single implementation used both by the
// standalone Rest Timer tool and by Workout Logger's contextual shortcut
// inside Strength Training, so there's only one countdown implementation.
var RestTimer = (function () {
  var PRESETS_SEC = [30, 60, 90, 120, 180];

  var overlay, setupEl, countEl, doneEl, countdownDisplay,
      customMinInput, customSecInput, startBtn, cancelBtn, restartBtn, closeDoneBtn, closeBtn;
  var built = false;

  var tickInterval = null;
  var endTime = null;
  var lastDurationSec = 90;

  function formatMMSS(totalSec) {
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function buildOverlay() {
    if (built) return;
    overlay = document.createElement('div');
    overlay.className = 'overlay overlay--rest-timer';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="rest-timer-panel">' +
        '<div class="tracker-header">' +
          '<span class="tracker-header__title">Rest Timer</span>' +
          '<button type="button" class="icon-btn rt-close-btn" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div class="rt-setup">' +
          '<div class="rt-presets"></div>' +
          '<div class="field-row"><label>Custom Duration</label>' +
            '<div class="field-row field-row--3">' +
              '<input type="number" class="rt-custom-min" min="0" placeholder="min" inputmode="numeric">' +
              '<input type="number" class="rt-custom-sec" min="0" max="59" placeholder="sec" inputmode="numeric">' +
            '</div>' +
          '</div>' +
          '<button type="button" class="btn-primary rt-start-btn">Start</button>' +
        '</div>' +
        '<div class="rt-count" hidden>' +
          '<div class="rt-count__display">0:00</div>' +
          '<button type="button" class="btn-secondary rt-cancel-btn">Cancel</button>' +
        '</div>' +
        '<div class="rt-done" hidden>' +
          '<div class="rt-done__text">Time&#8217;s Up!</div>' +
          '<div class="rt-done__actions">' +
            '<button type="button" class="btn-secondary rt-restart-btn">Restart</button>' +
            '<button type="button" class="btn-primary rt-done-close-btn">Close</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    closeBtn = overlay.querySelector('.rt-close-btn');
    setupEl = overlay.querySelector('.rt-setup');
    countEl = overlay.querySelector('.rt-count');
    doneEl = overlay.querySelector('.rt-done');
    countdownDisplay = overlay.querySelector('.rt-count__display');
    startBtn = overlay.querySelector('.rt-start-btn');
    cancelBtn = overlay.querySelector('.rt-cancel-btn');
    restartBtn = overlay.querySelector('.rt-restart-btn');
    closeDoneBtn = overlay.querySelector('.rt-done-close-btn');
    customMinInput = overlay.querySelector('.rt-custom-min');
    customSecInput = overlay.querySelector('.rt-custom-sec');

    var presetsEl = overlay.querySelector('.rt-presets');
    PRESETS_SEC.forEach(function (sec) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rt-preset-btn';
      btn.textContent = formatMMSS(sec);
      btn.addEventListener('click', function () { startCountdown(sec); });
      presetsEl.appendChild(btn);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    startBtn.addEventListener('click', function () {
      var min = Number(customMinInput.value) || 0;
      var sec = Number(customSecInput.value) || 0;
      var total = min * 60 + sec;
      if (total <= 0) return;
      startCountdown(total);
    });
    cancelBtn.addEventListener('click', function () {
      stopTick();
      showSetup();
    });
    restartBtn.addEventListener('click', function () { startCountdown(lastDurationSec); });
    closeDoneBtn.addEventListener('click', close);

    built = true;
  }

  function showSetup() {
    setupEl.hidden = false;
    countEl.hidden = true;
    doneEl.hidden = true;
  }

  function stopTick() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  }

  function startCountdown(seconds) {
    lastDurationSec = seconds;
    endTime = Date.now() + seconds * 1000;
    setupEl.hidden = true;
    doneEl.hidden = true;
    countEl.hidden = false;
    tick();
    tickInterval = setInterval(tick, 250);
  }

  function tick() {
    var remainingMs = endTime - Date.now();
    if (remainingMs <= 0) {
      stopTick();
      countdownDisplay.textContent = '0:00';
      finish();
      return;
    }
    countdownDisplay.textContent = formatMMSS(Math.ceil(remainingMs / 1000));
  }

  function finish() {
    countEl.hidden = true;
    doneEl.hidden = false;
    if (navigator.vibrate) {
      try { navigator.vibrate([200, 100, 200, 100, 200]); } catch (e) {}
    }
    playBeep();
  }

  function playBeep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [0, 0.35].forEach(function (delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.32);
      });
      setTimeout(function () { ctx.close(); }, 800);
    } catch (e) {}
  }

  function close() {
    stopTick();
    overlay.hidden = true;
  }

  function open(options) {
    buildOverlay();
    overlay.hidden = false;
    if (options && options.autoStartSeconds) {
      startCountdown(options.autoStartSeconds);
    } else {
      showSetup();
    }
  }

  return { open: open };
})();
