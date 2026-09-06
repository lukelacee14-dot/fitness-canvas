(function () {
  function mount(container) {
    container.innerHTML =
      '<p class="rt-intro">Set a rest period, start the countdown, and get a sound, vibration, and visual alert when it finishes. You can also start a rest timer right from Strength Training under Workout Logger, without leaving that screen.</p>' +
      '<button type="button" class="btn-primary rt-open-btn">Start Rest Timer</button>';

    container.querySelector('.rt-open-btn').addEventListener('click', function () {
      RestTimer.open();
    });
  }

  ModuleRegistry.register({
    id: 'rest-timer',
    title: 'Rest Timer',
    icon: '⏱️',
    mount: mount
  });
})();
