// Builds data/nutrition-database.json from real USDA FoodData Central CSV exports
// (SR Legacy + Foundation Foods). This is a one-time / re-runnable build step —
// it is NOT loaded by the app itself.
//
// Usage:
//   node scripts/build-nutrition-db.js <sr_legacy_csv_dir> <foundation_csv_dir>
//
// Where each dir is the unzipped folder of the corresponding USDA CSV download from
// https://fdc.nal.usda.gov/download-datasets.html (SR Legacy CSV, Foundation Foods CSV).
// Nutrient IDs are resolved by NAME from each dataset's own nutrient.csv at run time —
// never hardcoded — so this keeps working if USDA ever renumbers anything.

var fs = require('fs');
var path = require('path');

var RAW_SR = process.argv[2];
var RAW_FOUNDATION = process.argv[3];
var OUT_PATH = path.join(__dirname, '..', 'data', 'nutrition-database.json');
var DEBUG_PATH = path.join(__dirname, 'joined-debug.json');

if (!RAW_SR || !RAW_FOUNDATION) {
  console.error('Usage: node build-nutrition-db.js <sr_legacy_csv_dir> <foundation_csv_dir>');
  process.exit(1);
}

// ---- Minimal quoted-CSV parser (USDA exports quote every field) ----

function parseCsvLine(line) {
  var fields = [];
  var cur = '';
  var inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { fields.push(cur); cur = ''; }
      else cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function readCsv(filePath) {
  var content = fs.readFileSync(filePath, 'utf8');
  var lines = content.split(/\r?\n/).filter(function (l) { return l.length > 0; });
  var header = parseCsvLine(lines[0]);
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var fields = parseCsvLine(lines[i]);
    var row = {};
    header.forEach(function (h, idx) { row[h] = fields[idx]; });
    rows.push(row);
  }
  return rows;
}

// ---- Resolve target nutrient IDs by name from the reference file ----

function resolveNutrientIds(nutrientRows) {
  function find(name, unit) {
    var row = nutrientRows.filter(function (r) { return r.name === name && r.unit_name === unit; })[0];
    if (!row) throw new Error('Nutrient not found in nutrient.csv: ' + name + ' (' + unit + ')');
    return row.id;
  }
  var sugarCandidates = nutrientRows.filter(function (r) {
    return r.unit_name === 'G' && (r.name === 'Sugars, Total' || r.name === 'Sugars, Total NLEA' || r.name === 'Total Sugars');
  }).map(function (r) { return r.id; });

  return {
    calories: find('Energy', 'KCAL'),
    protein: find('Protein', 'G'),
    fat: find('Total lipid (fat)', 'G'),
    carbs: find('Carbohydrate, by difference', 'G'),
    fiber: find('Fiber, total dietary', 'G'),
    sodium: find('Sodium, Na', 'MG'),
    sugar: sugarCandidates
  };
}

// ---- Load + join one dataset (food.csv + nutrient.csv + food_nutrient.csv) ----

function loadDataset(dir, dataTypeFilter, sourceLabel) {
  var foodRows = readCsv(path.join(dir, 'food.csv'));
  var nutrientRows = readCsv(path.join(dir, 'nutrient.csv'));
  var foodNutrientRows = readCsv(path.join(dir, 'food_nutrient.csv'));
  var ids = resolveNutrientIds(nutrientRows);

  var foods = {};
  foodRows.forEach(function (f) {
    if (f.data_type !== dataTypeFilter) return;
    foods[f.fdc_id] = { fdcId: f.fdc_id, description: f.description, source: sourceLabel, nutrients: {} };
  });

  foodNutrientRows.forEach(function (fn) {
    var food = foods[fn.fdc_id];
    if (!food) return;
    var amount = parseFloat(fn.amount);
    if (isNaN(amount)) return;
    var nid = fn.nutrient_id;

    if (nid === ids.calories) food.nutrients.calories = amount;
    else if (nid === ids.protein) food.nutrients.protein = amount;
    else if (nid === ids.fat) food.nutrients.fat = amount;
    else if (nid === ids.carbs) food.nutrients.carbs = amount;
    else if (nid === ids.fiber) food.nutrients.fiber = amount;
    else if (nid === ids.sodium) food.nutrients.sodium = amount;
    else if (ids.sugar.indexOf(nid) !== -1 && food.nutrients.sugar === undefined) food.nutrients.sugar = amount;
  });

  console.log(sourceLabel + ': ' + Object.keys(foods).length + ' usable foods (data_type=' + dataTypeFilter + ')');
  return Object.keys(foods).map(function (k) { return foods[k]; });
}

var srFoods = loadDataset(RAW_SR, 'sr_legacy_food', 'sr_legacy');
var foundationFoods = loadDataset(RAW_FOUNDATION, 'foundation_food', 'foundation');
var allFoods = srFoods.concat(foundationFoods);

fs.writeFileSync(DEBUG_PATH, JSON.stringify(allFoods));
console.log('Joined pool: ' + allFoods.length + ' foods -> ' + DEBUG_PATH);

// ---- Curated target list: [category, displayName, requiredKeywords[], excludeKeywords[]] ----
// Keywords are matched case-insensitively as substrings against the USDA description.
// Shortest matching description wins (closest match, avoids composite/mixed dishes).

var TARGETS = require('./nutrition-targets.js');

// USDA SR Legacy embeds branded products in the same file, prefixed with the
// brand name in ALL CAPS — either comma-separated ("MORI-NU, Tofu, silken,
// firm") or run into the rest of the name ("HOUSE FOODS Premium Firm Tofu").
// Generic entries are always Title Case. Requiring the description to START
// with a 2+ letter all-caps word is a reliable, general signature for
// excluding branded/packaged products (real ingredient names never open
// with an all-caps word).
var BRAND_PREFIX_RE = /^[A-Z]{2,}\b/;

function isBranded(description) {
  return BRAND_PREFIX_RE.test(description);
}

function findBestMatch(keywords, excludeKeywords) {
  var kws = keywords.map(function (k) { return k.toLowerCase(); });
  var excl = (excludeKeywords || []).map(function (k) { return k.toLowerCase(); });

  var candidates = allFoods.filter(function (f) {
    if (isBranded(f.description)) return false;
    var desc = f.description.toLowerCase();
    if (!kws.every(function (k) { return desc.indexOf(k) !== -1; })) return false;
    if (excl.some(function (k) { return desc.indexOf(k) !== -1; })) return false;
    var n = f.nutrients;
    return n.calories !== undefined && n.protein !== undefined && n.fat !== undefined && n.carbs !== undefined;
  });

  if (candidates.length === 0) return null;
  candidates.sort(function (a, b) { return a.description.length - b.description.length; });
  return candidates[0];
}

function round(n, decimals) {
  var m = Math.pow(10, decimals);
  return Math.round((n || 0) * m) / m;
}

var results = [];
var misses = [];
var usedFdcIds = {};

TARGETS.forEach(function (t) {
  var match = findBestMatch(t.keywords, t.exclude);
  if (!match || usedFdcIds[match.fdcId]) {
    // retry without exclude list in case it was too strict, still requiring no dup
    match = findBestMatch(t.keywords, []);
  }
  if (!match || usedFdcIds[match.fdcId]) {
    misses.push(t.name + '  [' + t.keywords.join(', ') + ']');
    return;
  }
  usedFdcIds[match.fdcId] = true;

  results.push({
    name: t.name,
    category: t.category,
    calories: round(match.nutrients.calories, 1),
    protein: round(match.nutrients.protein, 1),
    carbs: round(match.nutrients.carbs, 1),
    fat: round(match.nutrients.fat, 1),
    fiber: round(match.nutrients.fiber, 1),
    sugar: round(match.nutrients.sugar, 1),
    sodium: round(match.nutrients.sodium, 1),
    sourceDescription: match.description,
    fdcId: match.fdcId
  });
});

console.log('\nMatched: ' + results.length + ' / ' + TARGETS.length);
if (misses.length) {
  console.log('\nMISSES (' + misses.length + '):');
  misses.forEach(function (m) { console.log('  - ' + m); });
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
console.log('\nWrote ' + results.length + ' entries to ' + OUT_PATH);
