var Onboarding = (function () {
  var STORAGE_KEY = 'onboardingComplete';

  var overlay = document.getElementById('onboarding');
  var track = overlay.querySelector('.onboarding-track');
  var trackInner = document.getElementById('onboarding-track-inner');
  var slides = Array.prototype.slice.call(overlay.querySelectorAll('.onboarding-slide'));
  var dots = Array.prototype.slice.call(overlay.querySelectorAll('.onboarding-dot'));
  var nextBtn = document.getElementById('onboarding-next');
  var skipBtn = document.getElementById('onboarding-skip');

  var currentIndex = 0;

  function isComplete() {
    return Storage.get(STORAGE_KEY, false) === true;
  }

  function markComplete() {
    Storage.set(STORAGE_KEY, true);
  }

  function render() {
    trackInner.style.transform = 'translateX(-' + (currentIndex * (100 / slides.length)) + '%)';
    dots.forEach(function (dot, i) {
      dot.classList.toggle('onboarding-dot--active', i === currentIndex);
    });
    nextBtn.textContent = currentIndex === slides.length - 1 ? 'Get Started' : 'Next';
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(slides.length - 1, index));
    render();
  }

  function close() {
    overlay.hidden = true;
    markComplete();
    if (window.CanvasHint) CanvasHint.show();
  }

  nextBtn.addEventListener('click', function () {
    if (currentIndex === slides.length - 1) {
      close();
    } else {
      goTo(currentIndex + 1);
    }
  });

  skipBtn.addEventListener('click', close);

  var swipeStartX = null;
  track.addEventListener('pointerdown', function (e) {
    swipeStartX = e.clientX;
  });
  track.addEventListener('pointerup', function (e) {
    if (swipeStartX === null) return;
    var dx = e.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goTo(currentIndex + 1);
    else goTo(currentIndex - 1);
  });
  track.addEventListener('pointercancel', function () {
    swipeStartX = null;
  });

  function maybeShow() {
    if (isComplete()) return;
    currentIndex = 0;
    render();
    overlay.hidden = false;
  }

  return { maybeShow: maybeShow };
})();
