(function () {
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Mirrors Workout Logger's SPORT_CATALOG categories/ids/status exactly, so
  // every sport (live or coming-soon for logging) gets a reference entry here.
  var SIL_CATALOG = [
    {
      category: 'Running',
      sports: [
        { id: 'run', title: 'Run', status: 'live',
          overview: 'Running at a steady outdoor pace over roads or paths, the foundation of most endurance sports.',
          muscles: 'Primarily quads, hamstrings, calves, and glutes, with core stabilization; predominantly aerobic energy system at easy paces, shifting to anaerobic/glycolytic at faster efforts.',
          training: 'Base mileage building, tempo runs, interval/speed work, and long runs; progressive overload via weekly mileage increases.',
          equipment: 'Running shoes; optional GPS watch, moisture-wicking clothing.' },
        { id: 'trail-run', title: 'Trail Run', status: 'live',
          overview: 'Running on unpaved, uneven terrain such as forest paths, hills, and rocky trails.',
          muscles: 'Quads, hamstrings, calves, glutes, and ankle stabilizers work harder than road running due to uneven footing; mixed aerobic base with anaerobic surges on climbs.',
          training: 'Hill repeats, technical footwork drills, vert-focused long runs, strength work for ankle/knee stability.',
          equipment: 'Trail running shoes with grippy tread, hydration vest/pack, trekking poles for steep terrain.' },
        { id: 'treadmill', title: 'Treadmill', status: 'live',
          overview: 'Running indoors on a motorized belt at a controlled pace and incline.',
          muscles: 'Same primary movers as outdoor running (quads, hamstrings, calves, glutes); aerobic-dominant, adjustable to anaerobic via speed/incline intervals.',
          training: 'Interval workouts using precise pace/incline control, tempo runs, incline hill simulation.',
          equipment: 'Treadmill; running shoes.' },
        { id: 'track-run', title: 'Track Run', status: 'live',
          overview: 'Structured running on a measured oval track, typically 400m, used for speed and interval training.',
          muscles: 'Fast-twitch quad, hamstring, and calf recruitment for speed; predominantly anaerobic/glycolytic and phosphagen systems for sprint work.',
          training: 'Interval repeats (400s, 800s, etc.), tempo intervals, sprint mechanics drills.',
          equipment: 'Track spikes or racing flats, stopwatch/GPS watch.' },
        { id: 'ultra-run', title: 'Ultra Run', status: 'live',
          overview: 'Foot races beyond marathon distance (typically 50K and up), often on trails, emphasizing endurance over speed.',
          muscles: 'Full lower-body endurance (quads, hamstrings, calves, glutes) plus core and postural muscles for fatigue resistance; almost entirely aerobic with fat-oxidation emphasis.',
          training: 'Very high weekly mileage, back-to-back long runs, night/heat training, nutrition and pacing practice.',
          equipment: 'Trail shoes, hydration/nutrition carrying system, headlamp for night sections.' },
        { id: 'virtual-run', title: 'Virtual Run', status: 'soon',
          overview: 'Running tracked and often raced virtually via GPS or a connected app, indoors or outdoors.',
          muscles: 'Same as standard running; aerobic-dominant with anaerobic effort in virtual races/intervals.',
          training: 'Same structured training as regular running, guided by app-based workouts or virtual race pacing.',
          equipment: 'GPS watch or phone app, running shoes, optional smart trainer/treadmill connection.' },
        { id: 'indoor-track', title: 'Indoor Track', status: 'live',
          overview: 'Running on a short indoor oval track (often 200m), common in winter competition.',
          muscles: 'Similar to outdoor track running with more emphasis on turning/cornering muscles (hip stabilizers); anaerobic/glycolytic for race efforts.',
          training: 'Interval repeats adapted to tight turns, banked-track technique work.',
          equipment: 'Track spikes, indoor facility access.' },
        { id: 'obstacle-racing', title: 'Obstacle Racing', status: 'soon',
          overview: 'Off-road running courses combined with physical obstacles (walls, rope climbs, carries, crawls).',
          muscles: 'Full-body — grip, upper-body pulling/pushing, and lower-body running muscles; mixed aerobic running with anaerobic bursts at obstacles.',
          training: 'Combined running mileage with grip strength, climbing, carrying, and calisthenics work.',
          equipment: 'Trail shoes, gloves, obstacle-specific gear (varies by race).' }
      ]
    },
    {
      category: 'Cycling',
      sports: [
        { id: 'road-bike', title: 'Road Bike', status: 'live',
          overview: 'Cycling on paved roads on a lightweight, drop-bar bike, ridden for fitness or racing.',
          muscles: 'Quads, glutes, hamstrings, and calves drive the pedal stroke; core and lower back stabilize; aerobic-dominant with anaerobic surges on climbs/sprints.',
          training: 'Endurance rides, tempo/threshold intervals, hill repeats, group rides for pacing.',
          equipment: 'Road bike, helmet, cycling shoes/clipless pedals, padded shorts.' },
        { id: 'mountain-bike', title: 'Mountain Bike', status: 'live',
          overview: 'Off-road cycling over trails, rocks, roots, and varied terrain.',
          muscles: 'Quads, glutes, hamstrings, plus significant upper-body and core engagement for bike handling; mixed aerobic base with anaerobic bursts on technical climbs.',
          training: 'Technical skills practice, interval climbs, bike-handling drills on varied terrain.',
          equipment: 'Mountain bike with suspension, helmet, gloves, protective eyewear.' },
        { id: 'indoor-bike', title: 'Indoor Bike', status: 'live',
          overview: 'Stationary cycling indoors, either on a smart trainer or studio bike, often to structured or class-based workouts.',
          muscles: 'Quads, glutes, hamstrings, calves; energy system fully adjustable from aerobic endurance to anaerobic sprint intervals via resistance/cadence.',
          training: 'Structured interval sessions (FTP-based zones), cadence drills, virtual group rides.',
          equipment: 'Stationary/smart trainer bike, cycling shoes (if clipless), heart rate monitor.' },
        { id: 'gravel-bike', title: 'Gravel Bike', status: 'live',
          overview: 'Cycling on unpaved gravel roads and mixed surfaces using a bike built between road and mountain bike geometry.',
          muscles: 'Similar to road cycling with added core/upper-body engagement for stability on loose surfaces; aerobic-dominant.',
          training: 'Long endurance rides on mixed terrain, handling practice on loose surfaces.',
          equipment: 'Gravel bike with wider tires, helmet, hydration/frame bags for longer rides.' },
        { id: 'ebike', title: 'eBike', status: 'live',
          overview: 'Cycling on a pedal-assist electric bike, blending rider effort with motor assistance.',
          muscles: 'Same muscle groups as regular cycling but at reduced intensity depending on assist level; predominantly aerobic at lower effort.',
          training: 'Distance riding with adjustable assist for endurance or recovery days.',
          equipment: 'Electric-assist bicycle, helmet.' },
        { id: 'emtb', title: 'eMTB', status: 'soon',
          overview: 'Off-road mountain biking on an electric-assist bike, allowing longer or steeper technical rides.',
          muscles: 'Similar to mountain biking with reduced climbing load from motor assist; mixed aerobic/anaerobic depending on assist use.',
          training: 'Technical trail riding with more focus on skill/handling since climbing effort is offset.',
          equipment: 'Electric mountain bike, helmet, protective gear.' },
        { id: 'bmx', title: 'BMX', status: 'soon',
          overview: 'Riding a small, sturdy bike for tricks, jumps, or dirt track racing.',
          muscles: 'Explosive leg power for pumping/jumping, plus strong core and upper-body control; primarily anaerobic/phosphagen for short bursts.',
          training: 'Track starts, jump/pump practice, sprint intervals, bike-handling drills.',
          equipment: 'BMX bike, full-face helmet, pads.' },
        { id: 'cyclocross', title: 'Cyclocross', status: 'soon',
          overview: 'Racing on a road-style bike over short off-road circuits with obstacles requiring dismounts and carries.',
          muscles: 'Full-body — legs for riding, upper body/core for carrying and remounting; highly anaerobic, high-intensity intervals.',
          training: 'Short high-intensity intervals, dismount/remount drills, barrier-carrying practice.',
          equipment: 'Cyclocross bike (knobby tires, disc brakes), helmet.' },
        { id: 'bike-commute', title: 'Bike Commute', status: 'live',
          overview: 'Cycling for transportation as part of a daily commute rather than dedicated exercise.',
          muscles: 'Quads, glutes, hamstrings, calves at moderate steady effort; predominantly aerobic.',
          training: 'No structured training typically; consistency and route familiarity build base fitness over time.',
          equipment: 'Commuter or hybrid bike, helmet, lights/reflective gear, pannier or backpack.' },
        { id: 'bike-tour', title: 'Bike Tour', status: 'soon',
          overview: 'Multi-day cycling trips covering long distances, often carrying gear for self-supported travel.',
          muscles: 'Endurance-focused leg muscles plus core/back for carrying load; aerobic-dominant over sustained hours.',
          training: 'Long back-to-back distance rides, loaded-bike practice, saddle-time conditioning.',
          equipment: 'Touring bike, panniers/bikepacking bags, repair kit, helmet.' }
      ]
    },
    {
      category: 'Swimming',
      sports: [
        { id: 'pool-swim', title: 'Pool Swim', status: 'live',
          overview: 'Swimming laps in a pool using structured stroke technique.',
          muscles: 'Lats, shoulders, triceps, chest for pulling, core for body position, legs for kicking; mixed aerobic base with anaerobic sprint sets.',
          training: 'Interval sets (repeats with rest), technique drills, kick/pull-focused sets using equipment.',
          equipment: 'Swimsuit, goggles, pool access; optional kickboard, pull buoy, fins.' },
        { id: 'open-water-swim', title: 'Open Water Swim', status: 'live',
          overview: 'Swimming in natural bodies of water (lakes, rivers, ocean) without lane lines, often for distance or triathlon training.',
          muscles: 'Same primary swimming muscles as pool swimming, with more core/stabilizer demand for navigation and sighting; aerobic-dominant over sustained distance.',
          training: 'Long steady swims, sighting practice, cold/current acclimation, group open-water sessions.',
          equipment: 'Swimsuit or wetsuit, open-water-visible cap, safety buoy.' }
      ]
    },
    {
      category: 'Outdoor',
      sports: [
        { id: 'hike', title: 'Hike', status: 'live',
          overview: 'Walking on natural trails, often with elevation change, for fitness or recreation.',
          muscles: 'Quads, glutes, hamstrings, calves, with added core/stabilizer demand on uneven terrain; aerobic-dominant, higher intensity on climbs.',
          training: 'Progressive distance/elevation increases, weighted pack training for load carrying.',
          equipment: 'Hiking boots/shoes, trekking poles, daypack, weather-appropriate layers.' },
        { id: 'walk', title: 'Walk', status: 'live',
          overview: 'Walking at a comfortable pace for fitness, recovery, or daily activity.',
          muscles: 'Glutes, quads, hamstrings, calves at low intensity; almost entirely aerobic.',
          training: 'Increasing daily step counts or duration, brisk-pace intervals for added intensity.',
          equipment: 'Comfortable walking shoes.' },
        { id: 'mountaineering', title: 'Mountaineering', status: 'soon',
          overview: 'Climbing mountains, often combining hiking, scrambling, and technical alpine skills at altitude.',
          muscles: 'Full-body — legs for ascent, upper body/core for scrambling and carrying loads; aerobic base with anaerobic bursts on steep/technical sections.',
          training: 'Weighted pack hiking, altitude acclimatization, scrambling and rope-skill practice, general strength conditioning.',
          equipment: 'Mountaineering boots, crampons, ice axe, harness/rope, layered alpine clothing.' },
        { id: 'horseback-riding', title: 'Horseback Riding', status: 'live',
          overview: 'Riding and controlling a horse at various gaits for recreation, sport, or trail riding.',
          muscles: 'Core, inner thighs, hip flexors, and lower back for balance and posture; low continuous aerobic demand with brief anaerobic effort during faster gaits.',
          training: 'Riding lessons for posture/balance, core-strengthening off-horse, regular saddle time.',
          equipment: 'Riding boots, helmet, saddle and tack (typically provided by facility).' },
        { id: 'golf', title: 'Golf', status: 'live',
          overview: 'Hitting a ball toward a target hole across a course using a set of clubs, over 9 or 18 holes.',
          muscles: 'Core rotational muscles, shoulders, forearms for the swing; legs and glutes from walking the course; mostly low-level aerobic (walking) with brief anaerobic swing effort.',
          training: 'Swing mechanics practice, rotational core/mobility work, putting/short-game repetition.',
          equipment: 'Golf clubs, balls, tees, golf shoes.' },
        { id: 'fishing', title: 'Fishing', status: 'soon',
          overview: 'Catching fish recreationally from shore, boat, or wading, using rod and line.',
          muscles: 'Forearms and shoulders from casting and reeling; core and legs if wading or standing for long periods; low-intensity aerobic activity overall.',
          training: 'No formal training typically; casting practice improves technique and endurance in forearms.',
          equipment: 'Fishing rod and reel, tackle, bait/lures, waders if applicable.' },
        { id: 'hunting', title: 'Hunting', status: 'soon',
          overview: 'Tracking and pursuing game on foot, often over long distances and rough terrain.',
          muscles: 'Full lower body from extended walking/carrying, core and shoulders from carrying gear or game; aerobic-dominant with occasional load-bearing strain.',
          training: 'Endurance hiking with pack weight, marksmanship practice, scouting terrain.',
          equipment: 'Appropriate weapon/gear, camouflage clothing, pack, boots.' },
        { id: 'archery', title: 'Archery', status: 'soon',
          overview: 'Shooting arrows at a target using a bow, for sport or recreation.',
          muscles: 'Back (rhomboids, rear delts), shoulders, and forearms for draw and hold; core for stance stability; primarily phosphagen/anaerobic in short bursts.',
          training: 'Repetition shooting for form, back/shoulder strengthening, draw-hold endurance work.',
          equipment: 'Bow (recurve/compound), arrows, arm guard, release aid.' },
        { id: 'bouldering', title: 'Bouldering', status: 'live',
          overview: 'Climbing short, unroped rock formations or climbing-gym walls, focused on strength and problem-solving over height.',
          muscles: 'Forearms, fingers, lats, shoulders, and core; primarily anaerobic/phosphagen for powerful short efforts.',
          training: 'Route/problem practice, finger-strength hangboard training, core and pulling-strength conditioning.',
          equipment: 'Climbing shoes, chalk bag, crash pad (outdoors).' },
        { id: 'disc-golf', title: 'Disc Golf', status: 'soon',
          overview: "Throwing a flying disc into a target basket over a course, following golf-style scoring.",
          muscles: 'Core rotation, shoulders, and forearms for the throw; legs from walking the course; low aerobic demand with brief anaerobic throwing effort.',
          training: 'Throwing-form practice, rotational core work, course play for accuracy.',
          equipment: 'Set of golf discs (driver, mid-range, putter).' },
        { id: 'inline-skating', title: 'Inline Skating', status: 'soon',
          overview: 'Skating on wheeled inline skates for fitness, recreation, or speed.',
          muscles: 'Quads, glutes, hip abductors/adductors, and calves for the gliding stride; core for balance; aerobic-dominant with anaerobic effort at higher speeds.',
          training: 'Distance skating, stride-technique drills, balance and edge-control practice.',
          equipment: 'Inline skates, helmet, wrist/knee/elbow pads.' }
      ]
    },
    {
      category: 'Winter Sports',
      sports: [
        { id: 'ski', title: 'Ski', status: 'live',
          overview: 'Downhill skiing on snow-covered slopes using two skis and poles.',
          muscles: 'Quads (heavy eccentric load), glutes, hamstrings, and core for balance/turning; primarily anaerobic in short bursts down a run, aerobic between runs.',
          training: 'Leg strength and eccentric quad conditioning, balance/stability work, interval-style lift-served lapping.',
          equipment: 'Skis, poles, ski boots, helmet, goggles.' },
        { id: 'snowboard', title: 'Snowboard', status: 'live',
          overview: 'Descending snow-covered slopes standing sideways on a single board.',
          muscles: 'Quads, glutes, and core heavily for edge control and balance; obliques for rotational turns; anaerobic in bursts, aerobic overall session.',
          training: 'Balance and edge-control drills, leg strength/mobility work, progressive terrain practice.',
          equipment: 'Snowboard, boots and bindings, helmet, goggles.' },
        { id: 'backcountry-ski', title: 'Backcountry Ski', status: 'soon',
          overview: 'Skiing off-piste terrain accessed by climbing (skinning) uphill rather than lifts.',
          muscles: 'Full lower body plus significant aerobic demand from the uphill climb, in addition to downhill quad/glute loading; mixed aerobic ascent with anaerobic descent.',
          training: 'Uphill endurance training, avalanche safety practice, ski-specific strength conditioning.',
          equipment: 'Touring skis with climbing skins, alpine touring bindings/boots, avalanche safety gear (beacon, probe, shovel).' },
        { id: 'cross-country-ski', title: 'Cross-Country Ski', status: 'live',
          overview: 'Skiing across flat or rolling snow terrain using a striding or skating motion for propulsion.',
          muscles: 'Full-body — legs for striding, arms/shoulders/back for poling, core for stability; highly aerobic with sustained high heart rate.',
          training: 'Long steady-distance sessions, technique drills (classic/skate), interval sessions for race pace.',
          equipment: 'Cross-country skis, poles, boots and bindings, moisture-wicking layers.' },
        { id: 'snowshoe', title: 'Snowshoe', status: 'live',
          overview: 'Walking or hiking over snow using snowshoes to distribute weight and prevent sinking.',
          muscles: 'Quads, glutes, hip flexors, and calves working harder than regular walking due to snow resistance; aerobic-dominant.',
          training: 'Progressive distance hikes, incline practice, general lower-body endurance conditioning.',
          equipment: 'Snowshoes, poles, insulated waterproof boots.' },
        { id: 'ice-skating', title: 'Ice Skating', status: 'live',
          overview: 'Gliding on ice using bladed skates, for recreation, fitness, or figure/speed skating.',
          muscles: 'Glutes, quads, and hip abductors/adductors for stride and balance; core for posture; aerobic-dominant with anaerobic bursts in speed skating.',
          training: 'Stride and balance drills, edge-control practice, interval sessions for speed skating.',
          equipment: 'Ice skates, helmet (for speed/hockey skating).' },
        { id: 'snowmobile', title: 'Snowmobile', status: 'soon',
          overview: 'Riding a motorized, tracked vehicle over snow for recreation or trail travel.',
          muscles: 'Core, arms, and legs for steering and body positioning over rough terrain; primarily low aerobic demand, occasional anaerobic effort in technical terrain.',
          training: 'Minimal formal training; core/upper-body conditioning helps with control over rough terrain.',
          equipment: 'Snowmobile, helmet, insulated riding gear.' }
      ]
    },
    {
      category: 'Water Sports',
      sports: [
        { id: 'kayak', title: 'Kayak', status: 'live',
          overview: 'Paddling a small, narrow boat using a double-bladed paddle, on flat water or rapids.',
          muscles: 'Lats, shoulders, forearms, and core rotation drive the paddle stroke; legs brace against the hull; aerobic-dominant with anaerobic bursts in rapids/sprints.',
          training: 'Steady-distance paddling, stroke-technique drills, core rotational strength work.',
          equipment: 'Kayak, double-bladed paddle, spray skirt, personal flotation device (PFD).' },
        { id: 'sup', title: 'Stand-Up Paddleboard', status: 'live',
          overview: 'Standing on a wide board and propelling with a single-bladed paddle across flat or wavy water.',
          muscles: 'Core and legs heavily for balance, lats/shoulders/back for the paddle stroke; mostly aerobic with balance-driven stabilizer demand throughout.',
          training: 'Balance practice, distance paddling, stroke-technique drills.',
          equipment: 'SUP board, paddle, leash, personal flotation device (PFD).' },
        { id: 'surf', title: 'Surf', status: 'live',
          overview: 'Riding ocean waves standing on a surfboard after paddling out to catch them.',
          muscles: 'Shoulders, lats, and back for paddling; core, legs, and hip stabilizers for standing and balance on the wave; mixed aerobic paddling with anaerobic bursts popping up and riding.',
          training: 'Paddling endurance, pop-up drills, balance training, wave-reading practice.',
          equipment: 'Surfboard, leash, wetsuit (climate-dependent), wax.' },
        { id: 'sail', title: 'Sail', status: 'soon',
          overview: 'Propelling and steering a boat using wind captured by sails.',
          muscles: 'Core, forearms, and back for handling lines and the tiller/wheel; legs for bracing and hiking out; variable aerobic demand with anaerobic bursts during maneuvers.',
          training: 'On-water practice for tacking/jibing technique, core and grip-strength conditioning, tactical racing practice.',
          equipment: 'Sailboat, life jacket, sailing gloves, appropriate weather gear.' },
        { id: 'row', title: 'Row', status: 'live',
          overview: 'Propelling a boat using oars, either sculling (two oars) or sweep (one oar) style, on open water.',
          muscles: 'Legs (major drive), back, lats, and core, with arms finishing the stroke; highly aerobic with anaerobic race-pace efforts.',
          training: 'Steady-state distance rows, interval pieces at race pace, technique drills for the stroke sequence.',
          equipment: 'Rowing shell, oars, life jacket.' },
        { id: 'wakeboard', title: 'Wakeboard', status: 'live',
          overview: "Riding a board while being towed behind a boat, performing turns and jumps across the wake.",
          muscles: 'Core, quads, and grip/forearms heavily for holding the tow line and absorbing impact; primarily anaerobic in short intense bouts.',
          training: 'Balance and edge-control practice, core strength conditioning, progressive trick practice.',
          equipment: 'Wakeboard, tow rope/handle, life jacket, boat with wake-shaping ballast.' },
        { id: 'wakesurf', title: 'Wakesurf', status: 'soon',
          overview: "Surfing a boat's wake without a tow rope after being pulled up to speed.",
          muscles: 'Core and legs for balance similar to ocean surfing but on a steadier wake; sustained low-to-moderate anaerobic/aerobic mix.',
          training: 'Balance and stance practice, core conditioning, progressive wave-riding time.',
          equipment: 'Wakesurf board, boat with a surf wake, life jacket.' },
        { id: 'water-ski', title: 'Water Ski', status: 'live',
          overview: "Being towed behind a boat while gliding on one or two skis across the water's surface.",
          muscles: 'Quads, core, and grip/forearms heavily for holding position against tow tension; primarily anaerobic effort throughout the pull.',
          training: 'Core and leg strength conditioning, deep-water start practice, edge-control drills.',
          equipment: 'Water skis, tow rope/handle, life jacket.' },
        { id: 'kiteboard', title: 'Kiteboard', status: 'soon',
          overview: 'Riding a board across water while being propelled by a large controllable kite.',
          muscles: 'Core, shoulders, and forearms for kite control; legs and core for board control and jumps; mixed aerobic sustained riding with anaerobic bursts on jumps.',
          training: 'Kite-control practice on land and water, board-riding technique, core/shoulder conditioning.',
          equipment: 'Kite, control bar and lines, kiteboard, harness, life jacket.' },
        { id: 'windsurf', title: 'Windsurf', status: 'soon',
          overview: 'Riding a board propelled by a hand-held sail rig across water.',
          muscles: 'Core, forearms, shoulders, and legs for holding the rig and balancing the board; high sustained aerobic demand with anaerobic bursts in gusty conditions.',
          training: 'Sail-handling and balance practice, core/forearm endurance conditioning, progressive wind-condition exposure.',
          equipment: 'Windsurf board, sail rig (mast, boom, sail), harness, wetsuit.' }
      ]
    },
    {
      category: 'Team Sports',
      sports: [
        { id: 'basketball', title: 'Basketball', status: 'live',
          overview: 'A team sport played by shooting a ball through a hoop, combining running, jumping, and ball-handling.',
          muscles: 'Quads, glutes, and calves for jumping/cutting, shoulders/forearms for shooting and ball-handling; mixed aerobic base with frequent anaerobic sprint/jump bursts.',
          training: 'Sprint and agility drills, plyometric jump training, shooting repetition, scrimmage play.',
          equipment: 'Basketball, basketball shoes, hoop/court access.' },
        { id: 'soccer', title: 'Soccer', status: 'live',
          overview: "A team sport where players use mostly their feet to move a ball and score in an opponent's goal.",
          muscles: 'Quads, hamstrings, glutes, and calves for running/kicking; core for balance and shot power; predominantly aerobic with repeated anaerobic sprint bursts.',
          training: 'Interval running for match fitness, agility/cutting drills, technical ball-work, scrimmage play.',
          equipment: 'Soccer cleats, shin guards, ball.' },
        { id: 'american-football', title: 'American Football', status: 'live',
          overview: 'A team sport involving running, passing, and tackling to advance an oval ball down a field.',
          muscles: 'Full-body — legs for running/blocking, upper body for tackling/throwing/catching; primarily anaerobic/phosphagen given short, explosive play-based bursts.',
          training: 'Explosive strength and power training, sprint/agility drills, position-specific skill work.',
          equipment: 'Helmet, pads, cleats, football.' },
        { id: 'baseball', title: 'Baseball', status: 'live',
          overview: 'A team sport of pitching, hitting, and fielding a ball around a diamond-shaped field.',
          muscles: 'Rotational core, shoulders, and forearms for throwing/hitting; legs for sprinting/fielding; primarily anaerobic/phosphagen with short explosive efforts.',
          training: 'Throwing and hitting mechanics work, rotational power training, sprint work for baserunning/fielding.',
          equipment: 'Glove, bat, ball, cleats.' },
        { id: 'softball', title: 'Softball', status: 'soon',
          overview: 'A team sport similar to baseball, played with a larger ball and underhand pitching.',
          muscles: 'Rotational core, shoulders, and forearms for throwing/hitting; legs for sprinting/fielding; primarily anaerobic/phosphagen.',
          training: 'Underhand pitching mechanics, hitting practice, rotational power and sprint training.',
          equipment: 'Glove, bat, softball, cleats.' },
        { id: 'ice-hockey', title: 'Ice Hockey', status: 'live',
          overview: "A team sport played on ice, using sticks to shoot a puck into an opponent's goal while skating.",
          muscles: 'Glutes, hip adductors/abductors, and quads for skating stride; core and shoulders for shooting/checking; highly anaerobic given short shift-based bursts.',
          training: 'Skating stride and edge work, shift-length interval conditioning, shooting/stickhandling drills.',
          equipment: 'Skates, stick, helmet, full protective pads.' },
        { id: 'field-hockey', title: 'Field Hockey', status: 'soon',
          overview: "A team sport played on grass or turf, using curved sticks to move a ball into an opponent's goal.",
          muscles: 'Quads, hamstrings, and calves for running, forearms and core for stick control; mixed aerobic running with anaerobic sprint bursts.',
          training: 'Interval running for match fitness, stick-skill drills, agility/cutting practice.',
          equipment: 'Field hockey stick, ball, shin guards, mouthguard, turf shoes.' },
        { id: 'lacrosse', title: 'Lacrosse', status: 'soon',
          overview: "A team sport using a netted stick to catch, carry, and shoot a ball into an opponent's goal.",
          muscles: 'Legs for running/cutting, shoulders and forearms for stick handling and shooting; mixed aerobic running with anaerobic sprint/shooting bursts.',
          training: 'Sprint and agility conditioning, stick-skill repetition, scrimmage play.',
          equipment: 'Lacrosse stick, ball, helmet, gloves, pads.' },
        { id: 'rugby', title: 'Rugby', status: 'soon',
          overview: 'A full-contact team sport of running, passing, and tackling to advance an oval ball across a try line.',
          muscles: 'Full-body strength for tackling/rucking, legs for running, core for contact stability; mixed aerobic running with high anaerobic contact demand.',
          training: 'Contact/tackling technique practice, strength and conditioning for collisions, interval running for match fitness.',
          equipment: 'Mouthguard, boots, optional padded scrum cap/shoulder guards.' },
        { id: 'cricket', title: 'Cricket', status: 'live',
          overview: 'A bat-and-ball team sport played on a large field with bowling, batting, and fielding phases.',
          muscles: 'Rotational core and shoulders for bowling/batting, legs for running between wickets and fielding; mixed low-intensity aerobic play with anaerobic bursts of bowling/sprinting.',
          training: 'Bowling action and batting technique work, rotational power training, fielding agility drills.',
          equipment: 'Bat, ball, pads, gloves, helmet.' },
        { id: 'volleyball', title: 'Volleyball', status: 'live',
          overview: "A team sport where players hit a ball over a net, aiming to ground it in the opponent's court.",
          muscles: 'Quads and calves for jumping, shoulders and forearms for hitting/serving/blocking; primarily anaerobic given repeated jump-based bursts.',
          training: 'Vertical jump/plyometric training, hitting and serving technique, agility footwork drills.',
          equipment: 'Volleyball, knee pads, court/net access.' },
        { id: 'ultimate-frisbee', title: 'Ultimate Frisbee', status: 'soon',
          overview: 'A team sport of throwing and catching a flying disc to advance it downfield without running while holding it.',
          muscles: 'Legs for sprinting/cutting, shoulders and core for throwing; predominantly anaerobic with repeated sprint bursts across a long match.',
          training: 'Sprint/agility conditioning, throwing-technique practice, endurance work for long points.',
          equipment: 'Flying disc, cleats.' }
      ]
    },
    {
      category: 'Racket Sports',
      sports: [
        { id: 'tennis', title: 'Tennis', status: 'live',
          overview: 'A racket sport played by hitting a ball over a net, in singles or doubles.',
          muscles: 'Shoulders, forearms, and core for strokes; legs for lateral movement and split-stepping; mixed aerobic base with anaerobic bursts per point.',
          training: 'Groundstroke and serve repetition, lateral agility drills, match play for point construction.',
          equipment: 'Tennis racket, balls, court shoes.' },
        { id: 'pickleball', title: 'Pickleball', status: 'live',
          overview: 'A paddle sport played on a smaller court, blending elements of tennis, badminton, and table tennis.',
          muscles: 'Forearms and shoulders for paddle control, legs for quick lateral movement; primarily low-to-moderate aerobic with short anaerobic bursts.',
          training: 'Dinking and volley technique practice, footwork drills, match play.',
          equipment: 'Paddle, plastic perforated ball, court shoes.' },
        { id: 'padel', title: 'Padel', status: 'live',
          overview: 'A racket sport played in an enclosed court where walls are in play, typically in doubles.',
          muscles: 'Forearms and shoulders for shots, legs and core for lateral movement and wall-play positioning; mixed aerobic with anaerobic point bursts.',
          training: 'Wall-play positioning drills, volley/smash technique, doubles tactical practice.',
          equipment: 'Padel racket (solid, perforated), balls, enclosed court access.' },
        { id: 'badminton', title: 'Badminton', status: 'live',
          overview: 'A racket sport played by hitting a shuttlecock over a net, known for very fast reaction exchanges.',
          muscles: 'Shoulders and forearms for rapid strokes, legs for explosive lunges and direction changes; highly anaerobic given rapid rally bursts.',
          training: 'Footwork and lunge drills, rapid-fire shot repetition, match play for reaction speed.',
          equipment: 'Badminton racket, shuttlecocks, indoor court access.' },
        { id: 'squash', title: 'Squash', status: 'live',
          overview: 'A racket sport played in an enclosed four-wall court, known for intense, continuous rallies.',
          muscles: 'Legs for constant lunging and direction change, shoulders/forearms for shots; very high anaerobic and aerobic demand simultaneously due to near-continuous rallying.',
          training: 'High-intensity interval conditioning, ghosting/movement drills, wall-rally practice.',
          equipment: 'Squash racket, ball, enclosed court, eye protection.' },
        { id: 'racquetball', title: 'Racquetball', status: 'soon',
          overview: 'A racket sport played in an enclosed court using a stringed racquet and a lively rubber ball.',
          muscles: 'Shoulders and forearms for swings, legs for rapid multidirectional movement; highly anaerobic given fast continuous rallies.',
          training: 'Movement/agility drills in the enclosed court, shot-repetition practice, conditioning for rally length.',
          equipment: 'Racquetball racquet, ball, eye protection, enclosed court access.' },
        { id: 'table-tennis', title: 'Table Tennis', status: 'live',
          overview: 'A fast-paced paddle sport played on a table divided by a net, using a small lightweight ball.',
          muscles: 'Forearms and wrists for spin/control, core for rotation, legs for quick shuffling; primarily anaerobic given very rapid short exchanges.',
          training: 'Spin and placement drills, reaction-speed practice, footwork shuffling drills.',
          equipment: 'Table tennis paddle, ball, table.' }
      ]
    },
    {
      category: 'Gym',
      sports: [
        { id: 'strength-training', title: 'Strength Training', status: 'live',
          overview: 'Resistance-based exercise using weights, machines, or bodyweight to build muscular strength and size.',
          muscles: 'Targeted muscle groups depend on the exercise (e.g. chest, back, legs); primarily anaerobic/phosphagen and glycolytic systems during sets.',
          training: 'Progressive overload across structured sets/reps, split routines by muscle group or movement pattern, periodized programs.',
          equipment: 'Barbells, dumbbells, weight machines, or bodyweight; bench/rack as needed.' },
        { id: 'hiit', title: 'HIIT', status: 'live',
          overview: 'High-Intensity Interval Training — short bursts of maximal effort alternated with brief recovery periods.',
          muscles: 'Full-body depending on exercises chosen (often legs, core, shoulders); primarily anaerobic/glycolytic with aerobic contribution during recovery.',
          training: 'Timed work/rest intervals (e.g. Tabata, EMOM), varied exercise circuits, progressively shorter rest periods.',
          equipment: 'Minimal — bodyweight, optional kettlebells/dumbbells, interval timer.' },
        { id: 'yoga', title: 'Yoga', status: 'live',
          overview: 'A mind-body practice combining postures (asanas), breath control, and often meditation.',
          muscles: 'Full-body isometric engagement varies by pose (core, hips, shoulders common); predominantly aerobic/low-intensity with isometric strength demand.',
          training: 'Progressive pose sequences (flows), holding postures for time, breathwork integration.',
          equipment: 'Yoga mat, optional blocks/straps.' },
        { id: 'boxing', title: 'Boxing', status: 'live',
          overview: 'A combat sport/training discipline of striking with the fists, often trained via bag work, pad work, or sparring.',
          muscles: 'Shoulders, core (rotational), and legs for footwork and punch power; highly anaerobic/glycolytic in rounds with aerobic recovery between.',
          training: 'Round-based bag/pad work, footwork drills, conditioning circuits mimicking round structure.',
          equipment: 'Boxing gloves, hand wraps, heavy bag, optional headgear for sparring.' },
        { id: 'elliptical', title: 'Elliptical', status: 'live',
          overview: 'Low-impact cardio performed on a stationary elliptical machine simulating running/striding motion.',
          muscles: 'Quads, glutes, hamstrings, calves, with arm engagement if using moving handles; aerobic-dominant, adjustable to anaerobic via resistance/incline intervals.',
          training: 'Steady-state cardio sessions, resistance/incline interval workouts.',
          equipment: 'Elliptical machine.' },
        { id: 'indoor-row', title: 'Indoor Row', status: 'live',
          overview: 'Cardio performed on a stationary rowing machine (ergometer), simulating the on-water rowing stroke.',
          muscles: 'Legs (major drive), back, lats, and core, with arms finishing the stroke; highly aerobic with anaerobic sprint-piece capability.',
          training: 'Steady-state distance pieces, interval sprints (e.g. 500m repeats), stroke-technique drills.',
          equipment: 'Rowing machine (ergometer).' },
        { id: 'cardio', title: 'Cardio', status: 'soon',
          overview: 'General aerobic exercise (machine-based or free movement) aimed at raising heart rate for fitness.',
          muscles: 'Varies by modality, generally full lower-body plus core; predominantly aerobic.',
          training: 'Steady-state sessions at a target heart-rate zone, occasional interval variation.',
          equipment: 'Varies — cardio machine (bike, stair climber, etc.) or open space for bodyweight cardio.' },
        { id: 'pilates', title: 'Pilates', status: 'live',
          overview: 'A low-impact method focused on core strength, control, and controlled movement, often using mat or specialized equipment (reformer).',
          muscles: 'Deep core (transverse abdominis, pelvic floor), hip stabilizers, and postural back muscles; primarily aerobic/low-intensity with strong isometric core demand.',
          training: 'Controlled sequences emphasizing form and breath, progressive core-stability challenges.',
          equipment: 'Mat, optional reformer machine or resistance rings/bands.' },
        { id: 'stair-stepper', title: 'Stair Stepper', status: 'live',
          overview: 'Cardio performed on a machine simulating repeated stair-climbing.',
          muscles: 'Quads, glutes, calves, and hip flexors heavily from repeated climbing motion; aerobic-dominant, adjustable to anaerobic via speed/resistance.',
          training: 'Steady-state climbing sessions, interval speed/resistance changes.',
          equipment: 'Stair-stepper/stairmill machine.' },
        { id: 'jump-rope', title: 'Jump Rope', status: 'live',
          overview: 'Cardio performed by repeatedly jumping over a swinging rope, a classic conditioning tool.',
          muscles: 'Calves, quads, shoulders, and forearms for rope control; core for stability; highly anaerobic in fast/interval bouts, aerobic in steady sustained skipping.',
          training: 'Interval sets of continuous skipping, footwork pattern drills (double-unders, criss-cross).',
          equipment: 'Jump rope.' },
        { id: 'mobility', title: 'Mobility', status: 'soon',
          overview: 'Targeted stretching and joint-mobility work aimed at improving range of motion and movement quality.',
          muscles: 'Varies by focus area (hips, shoulders, ankles, spine common targets); minimal energy-system demand, primarily neuromuscular and flexibility-focused.',
          training: 'Dynamic and static stretching routines, joint circles, targeted mobility drills for tight areas.',
          equipment: 'Mat, optional foam roller or resistance bands.' }
      ]
    },
    {
      category: 'Other',
      sports: [
        { id: 'triathlon', title: 'Triathlon', status: 'soon',
          overview: 'A multi-sport endurance race combining swimming, cycling, and running consecutively.',
          muscles: 'Full-body across all three disciplines — swimming pull muscles, cycling leg muscles, running leg muscles; predominantly aerobic across long distances with anaerobic transitions.',
          training: 'Combined swim/bike/run training blocks, brick workouts (bike-to-run transitions), periodized endurance base-building.',
          equipment: 'Swimsuit/wetsuit, bike, running shoes, transition gear.' },
        { id: 'meditation', title: 'Meditation', status: 'live',
          overview: 'A seated or still practice of focused attention or awareness, used for mental clarity and stress reduction.',
          muscles: 'Minimal muscular demand — postural core and back muscles for seated posture; no significant energy-system demand (rest-state recovery focus).',
          training: 'Progressive session-length building, breath-focused or guided practice, consistency over intensity.',
          equipment: 'Quiet space, optional cushion or chair.' },
        { id: 'breathwork', title: 'Breathwork', status: 'live',
          overview: 'Structured breathing exercises used for relaxation, stress management, or physical conditioning.',
          muscles: 'Diaphragm and intercostal (rib) muscles primarily; can shift between parasympathetic (calming) and controlled hyperventilation techniques depending on style.',
          training: 'Guided breathing patterns/counts, progressive practice of specific techniques (box breathing, etc.).',
          equipment: 'None required; optional guided audio.' }
      ]
    }
  ];

  var SIL_INDEX = {};
  SIL_CATALOG.forEach(function (cat) {
    cat.sports.forEach(function (sport) {
      SIL_INDEX[sport.id] = sport;
      sport.category = cat.category;
    });
  });

  function mount(container) {
    var view = 'list';
    var selectedId = null;
    var searchTerm = '';

    function buildRow(sport) {
      var row = document.createElement('div');
      row.className = 'picker-tool';
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.innerHTML = '<div class="picker-tool__text"><span class="picker-tool__title">' + escapeHtml(sport.title) + '</span></div>';

      var activate = function () {
        selectedId = sport.id;
        view = 'detail';
        render();
      };
      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });

      return row;
    }

    function renderList() {
      container.innerHTML =
        '<input type="text" class="sil-search" placeholder="Search sports..." autocomplete="off">' +
        '<div class="sil-list"></div>';

      var searchInput = container.querySelector('.sil-search');
      var listEl = container.querySelector('.sil-list');
      searchInput.value = searchTerm;

      function applyFilter() {
        var term = searchTerm.trim().toLowerCase();
        listEl.innerHTML = '';
        var anyMatch = false;

        SIL_CATALOG.forEach(function (cat) {
          var matches = cat.sports.filter(function (s) {
            return s.title.toLowerCase().indexOf(term) !== -1;
          });
          if (matches.length === 0) return;
          anyMatch = true;

          var section = document.createElement('section');
          section.className = 'picker-section';

          var header = document.createElement('div');
          header.className = 'picker-section__header';
          header.innerHTML = '<span>' + escapeHtml(cat.category) + '</span>';

          var body = document.createElement('div');
          body.className = 'picker-section__body';
          matches.forEach(function (s) { body.appendChild(buildRow(s)); });

          section.appendChild(header);
          section.appendChild(body);
          listEl.appendChild(section);
        });

        if (!anyMatch) {
          listEl.innerHTML = '<p class="empty-hint">No sports match your search.</p>';
        }
      }

      searchInput.addEventListener('input', function () {
        searchTerm = searchInput.value;
        applyFilter();
      });

      applyFilter();
    }

    function renderDetail() {
      var sport = SIL_INDEX[selectedId];

      container.innerHTML =
        '<button type="button" class="icon-btn sil-back" aria-label="Back to sport list">&#8592;</button>' +
        '<h3 class="sil-detail-title">' + escapeHtml(sport.title) + '</h3>' +
        '<span class="sil-detail-category">' + escapeHtml(sport.category) + '</span>' +
        '<div class="sil-detail-section"><h4>Overview</h4><p>' + escapeHtml(sport.overview) + '</p></div>' +
        '<div class="sil-detail-section"><h4>Muscles &amp; Energy Systems</h4><p>' + escapeHtml(sport.muscles) + '</p></div>' +
        '<div class="sil-detail-section"><h4>Training Approaches</h4><p>' + escapeHtml(sport.training) + '</p></div>' +
        '<div class="sil-detail-section"><h4>Equipment Needed</h4><p>' + escapeHtml(sport.equipment) + '</p></div>' +
        (sport.status === 'live'
          ? '<button type="button" class="btn-primary sil-log-btn">Log this sport in Workout Logger</button>'
          : '<p class="sil-log-note">Not yet available for logging under Workout Logger — reference info only.</p>');

      container.querySelector('.sil-back').addEventListener('click', function () {
        view = 'list';
        render();
      });

      if (sport.status === 'live') {
        container.querySelector('.sil-log-btn').addEventListener('click', function () {
          Storage.set('nav:jump-to-sport', sport.id);
          if (window.TabManager) TabManager.addModule('workout-logger');
        });
      }
    }

    function render() {
      if (view === 'detail' && selectedId) renderDetail();
      else renderList();
    }

    render();
  }

  AccountRegistry.register({
    id: 'sport-info-lookup',
    title: 'Sport Info Lookup',
    icon: '📖',
    mount: mount
  });
})();
