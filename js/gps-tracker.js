var GpsTracker = (function () {
  var LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  var LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  var ACCURACY_LIMIT_M = 30;
  var PACE_WINDOW_MS = 60000;
  var METERS_PER_MILE = 1609.344;

  // ---- math / formatting helpers ----------------------------------------

  function haversineMeters(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    function toRad(d) { return d * Math.PI / 180; }
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function metersToMiles(m) { return m / METERS_PER_MILE; }

  function formatDuration(ms) {
    var totalSec = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    return h > 0 ? (h + ':' + pad(m) + ':' + pad(s)) : (m + ':' + pad(s));
  }

  function formatPace(minutesPerMile) {
    if (!isFinite(minutesPerMile) || minutesPerMile <= 0) return '--';
    var m = Math.floor(minutesPerMile);
    var s = Math.round((minutesPerMile - m) * 60);
    if (s === 60) { m += 1; s = 0; }
    return m + ':' + (s < 10 ? '0' + s : s) + '/mi';
  }

  function formatSpeed(mph) {
    if (!isFinite(mph) || mph <= 0) return '--';
    return mph.toFixed(1) + ' mph';
  }

  // ---- Leaflet loader (shared, loaded once) ------------------------------

  var leafletLoadPromise = null;
  function loadLeaflet() {
    if (leafletLoadPromise) return leafletLoadPromise;
    leafletLoadPromise = new Promise(function (resolve, reject) {
      if (window.L) { resolve(window.L); return; }
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);

      var script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.onload = function () { resolve(window.L); };
      script.onerror = function () { reject(new Error('Failed to load map library')); };
      document.body.appendChild(script);
    });
    return leafletLoadPromise;
  }

  // ---- Tracking overlay (singleton) --------------------------------------

  var overlay, titleEl, cancelBtn, permissionEl, permissionTextEl, retryBtn, manualBtn,
      bodyEl, durationEl, distanceEl, paceEl, paceLabelEl, mapEl, pauseBtn, finishBtn;
  var built = false;

  function buildOverlay() {
    if (built) return;
    overlay = document.createElement('div');
    overlay.className = 'overlay overlay--tracker';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="tracker-panel">' +
        '<div class="tracker-header">' +
          '<span class="tracker-header__title"></span>' +
          '<button type="button" class="icon-btn tracker-cancel-btn" aria-label="Cancel tracking">&#10005;</button>' +
        '</div>' +
        '<div class="tracker-permission" hidden>' +
          '<p class="tracker-permission__text"></p>' +
          '<button type="button" class="btn-primary tracker-retry-btn">Try Again</button>' +
          '<button type="button" class="btn-secondary tracker-manual-btn">Use Manual Entry Instead</button>' +
        '</div>' +
        '<div class="tracker-body" hidden>' +
          '<div class="tracker-stats">' +
            '<div class="tracker-stat"><span class="tracker-stat__value tracker-duration">0:00</span><span class="tracker-stat__label">Duration</span></div>' +
            '<div class="tracker-stat"><span class="tracker-stat__value tracker-distance">0.00 mi</span><span class="tracker-stat__label">Distance</span></div>' +
            '<div class="tracker-stat"><span class="tracker-stat__value tracker-pace">--</span><span class="tracker-stat__label tracker-pace-label">Current Pace</span></div>' +
          '</div>' +
          '<div class="tracker-map"></div>' +
          '<p class="tracker-note">Keep this screen open and your phone unlocked for accurate tracking.</p>' +
          '<div class="tracker-actions">' +
            '<button type="button" class="btn-secondary tracker-pause-btn">Pause</button>' +
            '<button type="button" class="btn-primary tracker-finish-btn">Finish</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    titleEl = overlay.querySelector('.tracker-header__title');
    cancelBtn = overlay.querySelector('.tracker-cancel-btn');
    permissionEl = overlay.querySelector('.tracker-permission');
    permissionTextEl = overlay.querySelector('.tracker-permission__text');
    retryBtn = overlay.querySelector('.tracker-retry-btn');
    manualBtn = overlay.querySelector('.tracker-manual-btn');
    bodyEl = overlay.querySelector('.tracker-body');
    durationEl = overlay.querySelector('.tracker-duration');
    distanceEl = overlay.querySelector('.tracker-distance');
    paceEl = overlay.querySelector('.tracker-pace');
    paceLabelEl = overlay.querySelector('.tracker-pace-label');
    mapEl = overlay.querySelector('.tracker-map');
    pauseBtn = overlay.querySelector('.tracker-pause-btn');
    finishBtn = overlay.querySelector('.tracker-finish-btn');

    cancelBtn.addEventListener('click', handleCancel);
    manualBtn.addEventListener('click', handleUseManual);
    retryBtn.addEventListener('click', function () { attemptStart(); });
    pauseBtn.addEventListener('click', togglePause);
    finishBtn.addEventListener('click', handleFinish);

    built = true;
  }

  // ---- Route-view overlay (singleton, read-only) -------------------------

  var routeOverlay, routeTitleEl, routeMapEl, routeCloseBtn, routeMap;
  var routeBuilt = false;

  function buildRouteOverlay() {
    if (routeBuilt) return;
    routeOverlay = document.createElement('div');
    routeOverlay.className = 'overlay overlay--route-view';
    routeOverlay.hidden = true;
    routeOverlay.innerHTML =
      '<div class="route-view-panel">' +
        '<div class="tracker-header">' +
          '<span class="tracker-header__title route-view-title"></span>' +
          '<button type="button" class="icon-btn route-view-close" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div class="route-view-map"></div>' +
      '</div>';
    document.body.appendChild(routeOverlay);

    routeTitleEl = routeOverlay.querySelector('.route-view-title');
    routeMapEl = routeOverlay.querySelector('.route-view-map');
    routeCloseBtn = routeOverlay.querySelector('.route-view-close');
    routeCloseBtn.addEventListener('click', function () {
      routeOverlay.hidden = true;
    });

    routeBuilt = true;
  }

  function viewRoute(options) {
    buildRouteOverlay();
    routeTitleEl.textContent = options.sportTitle + ' Route';
    routeOverlay.hidden = false;

    loadLeaflet().then(function (L) {
      if (routeOverlay.hidden) return;
      if (routeMap) {
        routeMap.remove();
        routeMap = null;
      }
      var latlngs = options.route.map(function (p) { return [p.lat, p.lng]; });
      routeMap = L.map(routeMapEl);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(routeMap);
      var line = L.polyline(latlngs, { color: '#ff6b35', weight: 4 }).addTo(routeMap);
      L.circleMarker(latlngs[0], { radius: 6, color: '#ff6b35', fillColor: '#ff6b35', fillOpacity: 1 }).addTo(routeMap);
      L.circleMarker(latlngs[latlngs.length - 1], { radius: 6, color: '#ff5c5c', fillColor: '#ff5c5c', fillOpacity: 1 }).addTo(routeMap);
      routeMap.fitBounds(line.getBounds(), { padding: [20, 20] });
      setTimeout(function () { routeMap.invalidateSize(); }, 50);
    }).catch(function () {
      routeMapEl.textContent = 'Map library failed to load — check your connection.';
    });
  }

  // ---- Active session state ----------------------------------------------

  var watchId = null;
  var wakeLockSentinel = null;
  var points = [];
  var totalDistanceM = 0;
  var sessionStartTime = null;
  var pausedAccumMs = 0;
  var pauseStartedAt = null;
  var isPaused = false;
  var tickInterval = null;
  var trackingStarted = false;
  var map = null;
  var polyline = null;
  var currentMarker = null;
  var leafletReady = false;
  var mapInitPending = false;

  var currentPaceStyle = 'pace';
  var currentSportTitle = '';
  var currentOnFinish = null;

  function resetState() {
    points = [];
    totalDistanceM = 0;
    sessionStartTime = null;
    pausedAccumMs = 0;
    pauseStartedAt = null;
    isPaused = false;
    trackingStarted = false;
    leafletReady = false;
    mapInitPending = false;
    if (map) { map.remove(); map = null; }
    polyline = null;
    currentMarker = null;
  }

  function stopWatch() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  function stopTick() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(function () {});
      wakeLockSentinel = null;
    }
  }

  function requestWakeLock() {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(function (sentinel) {
        wakeLockSentinel = sentinel;
      }).catch(function () {});
    }
  }

  function elapsedMs() {
    if (!sessionStartTime) return 0;
    var now = isPaused ? pauseStartedAt : Date.now();
    return now - sessionStartTime - pausedAccumMs;
  }

  function updateDurationDisplay() {
    durationEl.textContent = formatDuration(elapsedMs());
  }

  function updateCurrentPace() {
    var now = Date.now();
    var windowPoints = points.filter(function (p) { return now - p.t <= PACE_WINDOW_MS; });
    if (windowPoints.length < 2) { paceEl.textContent = '--'; return; }

    var first = windowPoints[0], last = windowPoints[windowPoints.length - 1];
    var windowTimeMs = last.t - first.t;
    if (windowTimeMs < 5000) { paceEl.textContent = '--'; return; }

    var windowDistM = 0;
    for (var i = 1; i < windowPoints.length; i++) {
      windowDistM += haversineMeters(windowPoints[i - 1].lat, windowPoints[i - 1].lng, windowPoints[i].lat, windowPoints[i].lng);
    }
    var distMiles = metersToMiles(windowDistM);
    if (distMiles <= 0) { paceEl.textContent = '--'; return; }

    var hours = windowTimeMs / 3600000;
    var speedMph = distMiles / hours;
    var paceMinPerMile = (windowTimeMs / 60000) / distMiles;
    paceEl.textContent = currentPaceStyle === 'speed' ? formatSpeed(speedMph) : formatPace(paceMinPerMile);
  }

  function maybeInitMap(lat, lng) {
    if (map || !leafletReady) return;
    var L = window.L;
    map = L.map(mapEl).setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    polyline = L.polyline([], { color: '#ff6b35', weight: 4 }).addTo(map);
    currentMarker = L.circleMarker([lat, lng], { radius: 7, color: '#ff6b35', fillColor: '#ff6b35', fillOpacity: 1 }).addTo(map);
    setTimeout(function () { map.invalidateSize(); }, 50);
  }

  function handlePosition(position) {
    var coords = position.coords;
    if (coords.accuracy && coords.accuracy > ACCURACY_LIMIT_M) return;

    var point = { lat: coords.latitude, lng: coords.longitude, t: Date.now() };

    if (!trackingStarted) {
      trackingStarted = true;
      sessionStartTime = Date.now();
      permissionEl.hidden = true;
      bodyEl.hidden = false;
      tickInterval = setInterval(updateDurationDisplay, 1000);
      requestWakeLock();
    }

    if (points.length > 0 && !isPaused) {
      var prev = points[points.length - 1];
      totalDistanceM += haversineMeters(prev.lat, prev.lng, point.lat, point.lng);
    }
    points.push(point);

    distanceEl.textContent = metersToMiles(totalDistanceM).toFixed(2) + ' mi';
    updateCurrentPace();

    if (leafletReady) {
      maybeInitMap(point.lat, point.lng);
      if (polyline) {
        polyline.addLatLng([point.lat, point.lng]);
        currentMarker.setLatLng([point.lat, point.lng]);
        map.panTo([point.lat, point.lng]);
      }
    }
  }

  function handleError(error) {
    if (error.code === error.PERMISSION_DENIED) {
      showPermissionMessage('Location permission was denied. Live tracking needs GPS access — you can still log this session manually below.');
    }
    // Transient errors (timeout / position unavailable) are ignored; watchPosition keeps retrying.
  }

  function showPermissionMessage(text) {
    stopWatch();
    stopTick();
    releaseWakeLock();
    permissionTextEl.textContent = text;
    permissionEl.hidden = false;
    bodyEl.hidden = true;
  }

  function attemptStart() {
    permissionEl.hidden = true;

    if (!('geolocation' in navigator)) {
      showPermissionMessage("This browser doesn't support location tracking. You can still log this session manually below.");
      return;
    }

    watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 20000
    });
  }

  function togglePause() {
    if (isPaused) {
      pausedAccumMs += Date.now() - pauseStartedAt;
      pauseStartedAt = null;
      isPaused = false;
      pauseBtn.textContent = 'Pause';
      watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 20000
      });
    } else {
      stopWatch();
      pauseStartedAt = Date.now();
      isPaused = true;
      pauseBtn.textContent = 'Resume';
    }
  }

  function closeOverlay() {
    stopWatch();
    stopTick();
    releaseWakeLock();
    overlay.hidden = true;
    resetState();
  }

  function handleCancel() {
    if (points.length > 0) {
      var ok = window.confirm('Discard this tracked session? Your progress will be lost.');
      if (!ok) return;
    }
    closeOverlay();
  }

  function handleUseManual() {
    closeOverlay();
  }

  function handleFinish() {
    var durationMs = elapsedMs();
    var distanceMiles = metersToMiles(totalDistanceM);
    var durationText = formatDuration(durationMs);

    var avgPaceSpeedText;
    if (distanceMiles > 0 && durationMs > 0) {
      var hours = durationMs / 3600000;
      var avgSpeedMph = distanceMiles / hours;
      var avgPaceMinPerMile = (durationMs / 60000) / distanceMiles;
      avgPaceSpeedText = currentPaceStyle === 'speed' ? formatSpeed(avgSpeedMph) : formatPace(avgPaceMinPerMile);
    } else {
      avgPaceSpeedText = '';
    }

    var route = points.slice();
    var onFinish = currentOnFinish;

    closeOverlay();

    if (onFinish) {
      onFinish({
        durationText: durationText,
        distanceMiles: distanceMiles,
        avgPaceSpeedText: avgPaceSpeedText,
        route: route
      });
    }
  }

  function start(options) {
    buildOverlay();
    resetState();

    currentSportTitle = options.sportTitle;
    currentPaceStyle = options.paceStyle || 'pace';
    currentOnFinish = options.onFinish;

    titleEl.textContent = currentSportTitle;
    paceLabelEl.textContent = currentPaceStyle === 'speed' ? 'Current Speed' : 'Current Pace';
    durationEl.textContent = '0:00';
    distanceEl.textContent = '0.00 mi';
    paceEl.textContent = '--';
    pauseBtn.textContent = 'Pause';
    permissionEl.hidden = true;
    bodyEl.hidden = true;

    overlay.hidden = false;

    loadLeaflet().then(function () {
      leafletReady = true;
      if (points.length > 0) maybeInitMap(points[points.length - 1].lat, points[points.length - 1].lng);
    }).catch(function () {
      mapEl.textContent = 'Map preview unavailable — tracking will continue without it.';
    });

    attemptStart();
  }

  return { start: start, viewRoute: viewRoute };
})();
