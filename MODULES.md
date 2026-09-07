# Module Catalog

Running reference of every module in Fitness Canvas's scope. Update this file whenever a module's status changes.

## Account Bar
- **Personal Profile** — Name, age, and profile picture (uploaded image is compressed and stored as base64 in localStorage); edit from the profile screen. — Live
- **Search People** — Find and connect with other users. — Coming Soon
- **Sport Info Lookup** — Searchable, categorized reference (same categories as Workout Logger) covering the full ~90-sport catalog regardless of live/logging status: overview, primary muscles/energy systems, training approaches, and equipment for each sport. Sports that are LIVE for logging under Workout Logger show a "Log this sport" shortcut that jumps straight to that sport's tab there. — Live
- **Connect Device** — Sync data from Garmin and other wearables. Depends on real accounts and a backend (a larger, separate step not yet built) — Garmin's sync model pushes data to a server, which requires a real backend, not something that can run client-side against localStorage. — Coming Soon

## Training
- **Workout Logger** — Multi-sport activity logger with its own internal sport tabs; a data-driven template system so each sport logs the fields that make sense for it. — Live
- **Program Builder / Digital PT — Exercise Database** — ~60 exercises across Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, and Core/Abs, each with primary/secondary muscles, equipment, difficulty, and a description of the movement and what it targets. — Live
- **Program Builder / Digital PT — Quick Suggestions** — Pick a muscle group, get matching exercises from the database with descriptions, equipment, and difficulty. — Live
- **Program Builder / Digital PT — Program Generator** — Build a Program form (Goal, Days Per Week, Experience Level, optional Equipment filter) assigns a Full Body / Upper-Lower / Push-Pull-Legs split based on days per week and populates each day with matching exercises and goal-based set/rep/rest prescriptions, as a 4-week program. — Live
- **Program Builder / Digital PT — My Programs** — Save generated programs by name, view their day-by-day breakdown, and delete them. — Live
- **Program Builder / Digital PT — Strength Training Hand-off** — Starting a saved program (only one active at a time) makes its exercises for the current day appear as a planned session at the top of Workout Logger's Strength Training tab, with a Log button per exercise to pre-fill sets/reps for logging actual weight. — Live
- **Workout Logger — Live GPS Tracking** — For the outdoor GPS-relevant sports (Run, Trail Run, Road Bike, Mountain Bike, Gravel Bike, eBike, Bike Commute, Hike, Walk, Horseback Riding): a "Start Live Tracking" button opens a full-screen session using the Geolocation API's watchPosition, calculating live distance (Haversine formula), duration, and current pace/speed, with the route drawn live on a Leaflet/OpenStreetMap map, Pause/Resume, Wake Lock to keep the screen on, and a graceful fallback to manual entry if location permission is denied. Finishing pre-fills the sport's existing Duration/Distance/Avg Pace-Speed fields for review before saving, exactly like manual entry, and stores the route with the entry so it can be viewed again later from that entry's history. Manual entry remains fully available alongside it for all of these sports, and indoor sports on the same GPS Endurance template (Treadmill, Indoor Bike, Elliptical, Indoor Row) intentionally do not get this button. — Live
- **Exercise Library & Muscle Guide** — Standalone browsable/searchable library reusing the same ~60-exercise database as Program Builder (shared via js/exercise-database.js, no duplicate copy) — search by name, filter by muscle group, equipment, or difficulty, for looking up an exercise without going through Program Builder's goal-setting flow. — Live
- **Rest Timer** — Simple countdown (presets or custom duration) with a sound, vibration, and visual alert when it finishes. Shares its implementation (js/rest-timer.js) with a contextual "Start Rest Timer" shortcut inside Workout Logger's Strength Training tab, reachable right after logging a set without leaving the screen. — Live
- **PR Tracker** — A focused, quick-glance PR list (heaviest lifts per exercise, fastest/longest per sport) — no trend charts. Reuses the exact same personal-records computation as Progress & Analytics (shared via js/pr-computation.js, no duplicate logic). — Live

### Workout Logger — Sports

This batch moved 28 sports from Coming Soon to Live, each mapped onto an existing field template (GPS Endurance, Winter Sport, Water Sport, Team Sport, Racket Sport, Combat/Interval, or Mind/Recovery) or, for Golf and Bouldering, a bespoke field set. The remaining 27 niche sports below stay Coming Soon, queued for a future batch.

#### Running
- Run — Live
- Trail Run — Live
- Treadmill — Live
- Track Run — Live
- Ultra Run — Live
- Virtual Run — Coming Soon
- Indoor Track — Live
- Obstacle Racing — Coming Soon

#### Cycling
- Road Bike — Live
- Mountain Bike — Live
- Indoor Bike — Live
- Gravel Bike — Live
- eBike — Live
- eMTB — Coming Soon
- BMX — Coming Soon
- Cyclocross — Coming Soon
- Bike Commute — Live
- Bike Tour — Coming Soon

#### Swimming
- Pool Swim — Live
- Open Water Swim — Live

#### Outdoor
- Hike — Live
- Walk — Live
- Mountaineering — Coming Soon
- Horseback Riding — Live
- Golf — Live (bespoke fields: Holes Played, Total Score, Par for the Course, Fairways Hit, Putts, Duration, Calories Burned, Notes)
- Fishing — Coming Soon
- Hunting — Coming Soon
- Archery — Coming Soon
- Bouldering — Live (bespoke fields: Duration, Number of Routes/Problems Completed, Highest Grade Achieved, Calories Burned, Avg Heart Rate, Notes)
- Disc Golf — Coming Soon
- Inline Skating — Coming Soon

#### Winter Sports
- Ski — Live
- Snowboard — Live
- Backcountry Ski — Coming Soon
- Cross-Country Ski — Live
- Snowshoe — Live
- Ice Skating — Live
- Snowmobile — Coming Soon

#### Water Sports
- Kayak — Live
- Stand-Up Paddleboard — Live
- Surf — Live
- Sail — Coming Soon
- Row — Live
- Wakeboard — Live
- Wakesurf — Coming Soon
- Water Ski — Live
- Kiteboard — Coming Soon
- Windsurf — Coming Soon

#### Team Sports
- Basketball — Live
- Soccer — Live
- American Football — Live
- Baseball — Live (own stat fields: Hits, Runs, RBIs, Strikeouts, Innings Played)
- Softball — Coming Soon
- Ice Hockey — Live (own stat fields: Goals, Assists, Penalty Minutes, Shots on Goal)
- Field Hockey — Coming Soon
- Lacrosse — Coming Soon
- Rugby — Coming Soon
- Cricket — Live (own stat fields: Runs Scored, Wickets Taken, Overs Bowled, Catches)
- Volleyball — Live (own stat fields: Kills, Blocks, Aces, Digs, Sets Played)
- Ultimate Frisbee — Coming Soon

#### Racket Sports
- Tennis — Live
- Pickleball — Live
- Padel — Live
- Badminton — Live
- Squash — Live
- Racquetball — Coming Soon
- Table Tennis — Live

#### Gym
- Strength Training — Live
- HIIT — Live
- Yoga — Live
- Boxing — Live
- Elliptical — Live
- Indoor Row — Live
- Cardio — Coming Soon
- Pilates — Live
- Stair Stepper — Live
- Jump Rope — Live
- Mobility — Coming Soon

#### Other
- Triathlon — Coming Soon
- Meditation — Live
- Breathwork — Live

## Nutrition
- **Meal Tracker — Daily Log** — Log food under Breakfast, Lunch, Dinner, or Snacks (manual entry, from a saved meal, or searched from the built-in food database), with a running daily calorie/macro summary. — Live
- **Meal Tracker — Food Database Search** — Built-in, offline nutrition database (~350 common generic whole foods, sourced from real USDA FoodData Central SR Legacy + Foundation Foods data, processed at build time) — no API key or network call required. Search by name, enter grams consumed, and the matching food's per-100g values are scaled and pre-filled into the entry form. — Live
- **Meal Tracker — Saved Meals** — Create, edit, and delete reusable named meal templates (full nutrition fields) to log repeatedly without re-typing. — Live
- **Meal Tracker — Water Intake** — Increment/decrement water for the day (cups or mL) with an optional daily goal. — Live
- **Meal Tracker — Weekly Summary** — 7-day table of daily calorie/macro totals to spot trends at a glance. — Live
- **Water Tracker** — Standalone tab for just water tracking, without the rest of Meal Tracker. Reads and writes the exact same water data as Meal Tracker's built-in water widget (both operate directly on module:meal-tracker — no separate copy), so incrementing water in either place shows up in both. — Live
- **Recipe Builder** — Build a recipe by searching and adding multiple ingredients (with quantities) from the existing nutrition database; calories/macros sum automatically across all added ingredients. Saves the finished recipe into Meal Tracker's existing Saved Meals list, so it logs the same way as any other saved meal. Replaces the earlier "Recipe Importer" placeholder — true URL-based recipe auto-import remains **Coming Soon**, pending the backend/accounts step (point 10), since fetching an external page isn't something that can run client-side. — Live

## Body & Recovery
- **Body Measurements** — Log weight, body fat %, and circumference measurements (waist, chest, hips, arms, thighs, neck), with a date-grouped history and a per-metric trend chart. — Live
- **Progress Photos** — Add a dated photo (upload or mobile camera capture), stored compressed as base64 in localStorage; shown in a scrollable gallery to compare over time. — Live
- **Sleep Tracker** — Log duration, sleep quality (Poor/Fair/Good/Great), and optional bedtime/wake time, with a history list and a 7-day rolling average duration. — Live
- **Soreness/RPE Log** — Quick daily log of overall soreness (1-10), optional sore muscle groups, and optional training RPE (1-10), with a date-grouped history. — Live

## Analytics
- **Progress & Analytics** — Read-only summary tool: draws from other modules' existing localStorage data rather than storing any of its own. Strength Progress (pick a logged exercise, see a weight-over-time trend plus best set), Body Trend (weight over time from Body Measurements), Calorie Trend (rolling 30-day daily totals + average from Meal Tracker), and Personal Records by Sport (best distance/duration/score/etc. per sport logged under Workout Logger, only shown where the sport has data and a metric that makes sense). — Live

## Motivation
- **Streaks** — Current and longest streak of consecutive days with any logged activity in any tool (Workout Logger, Meal Tracker, Body Measurements, Sleep Tracker, Soreness/RPE Log, Progress Photos), plus a 4-week activity grid. Read-only, shared by Activity Feed and Achievements. — Live
- **Activity Feed** — Post text updates to your own feed, optionally tagged to a specific logged activity, with a kudos reaction button and post history. **Single-user preview mode** — friends and shared feeds require real accounts, which don't exist yet; this is labeled honestly in the UI. — Live
- **Leaderboards** — Framed as a personal-bests leaderboard, not a social one: top-5 ranked list of your own performances per sport logged under Workout Logger (distance/duration/score/etc., same metric-per-sport logic as Progress & Analytics). **Single-user preview mode** — real multi-user leaderboards require accounts; labeled honestly in the UI. — Live
- **Achievements** — Genuinely functional (not simulated): badges computed and permanently awarded from real logged data across the app (First Workout Logged, First 5K, 7-Day Streak, 30-Day Streak, 10 Workouts Logged, First Meal Logged, First Program Started, First Measurement Logged, Strength Century, First Update Shared), shown alongside locked/greyed badges still to unlock. — Live

## Platform
- **PWA Installability & Offline Support** — Full manifest.json (name, description, standalone display, portrait orientation, background/theme colors, 192/512/maskable icons) plus a service worker that precaches the full app shell (HTML, CSS, all JS modules, the nutrition database JSON, and the icon set) with a cache-first strategy, so the app installs to a home screen and works fully offline after the first visit. Cache name is versioned and old versions are cleared on activate, so a new deploy isn't stuck being served stale. Includes apple-touch-icon and related meta tags for iOS home-screen behavior, and an in-app splash (not per-device native splash images) styled to match the manifest's colors so launch doesn't flash blank white. Icons are a placeholder geometric mark — a real designed icon set is queued behind the designer pass noted in IDEAS.md. — Live
- **First-Run Onboarding** — A 4-screen Next/swipe-navigated intro (blank canvas concept, the "+"/bottom bar/tabs, the top account bar, a closing "Get Started" screen) shown only the very first time the app is opened, with a "Skip" option on every screen; either path sets a permanent localStorage flag so it never shows again on that device. Once dismissed, the "+" button gets a brief pulse animation plus a small one-time tooltip ("Tap here to add your first tool") so the empty canvas doesn't feel like a cold drop-off. — Live
- **Unified Color System** — A single palette of CSS custom properties defined in css/canvas.css's `:root` (`--color-canvas-bg` #FFFFFF, `--color-surface-dark` #121212, `--color-surface-dark-alt` #1E1E1E, `--color-accent-blue` #2F6FED, `--color-accent-blue-deep` #16305C, `--color-text-on-dark` #FFFFFF, `--color-text-on-light` #111111, `--color-text-muted` #8A8A8A, `--color-border-subtle` #E5E5E5) now drives every tool's colors app-wide — the bottom tab bar, top account bar, every tool's screen-header banner, all buttons/icons/links, and every "Coming Soon" disabled state. No tool is left on its old ad hoc colors. — Live
