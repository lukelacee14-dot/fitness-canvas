// Shared exercise database — the single source of truth used by Program
// Builder (Quick Suggestions / Program Generator) and the standalone
// Exercise Library & Muscle Guide, so the ~60-exercise list only exists once.
var ExerciseDatabase = (function () {
  var EXERCISES = [
    // Chest
    { id: 'chest-bench-press', name: 'Barbell Bench Press', group: 'Chest', secondary: ['Shoulders', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A horizontal pressing movement that loads the pectorals through a long range of motion, with the front shoulders and triceps assisting to lock out the weight.' },
    { id: 'chest-incline-db-press', name: 'Incline Dumbbell Press', group: 'Chest', secondary: ['Shoulders', 'Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Pressing on an incline shifts more emphasis onto the upper chest and front delts, and dumbbells allow a deeper stretch at the bottom than a barbell.' },
    { id: 'chest-pushup', name: 'Push-Up', group: 'Chest', secondary: ['Shoulders', 'Triceps', 'Core/Abs'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'A bodyweight press that builds chest and triceps strength while forcing the core to stay braced to keep the body in a straight line.' },
    { id: 'chest-cable-fly', name: 'Cable Fly', group: 'Chest', secondary: ['Shoulders'], equipment: 'Cable', difficulty: 'Beginner', desc: 'An isolation move that keeps constant tension on the chest through a wide arcing motion, stretching and squeezing the pecs without much triceps involvement.' },
    { id: 'chest-db-pullover', name: 'Dumbbell Pullover', group: 'Chest', secondary: ['Back', 'Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Lying across a bench and lowering a dumbbell overhead stretches the chest and lats together, building shoulder mobility along with chest size.' },
    { id: 'chest-machine-press', name: 'Machine Chest Press', group: 'Chest', secondary: ['Shoulders', 'Triceps'], equipment: 'Machine', difficulty: 'Beginner', desc: 'A guided pressing pattern that lets beginners load the chest safely without needing to stabilize a free weight, useful for learning the pressing motion.' },

    // Back
    { id: 'back-deadlift', name: 'Deadlift', group: 'Back', secondary: ['Hamstrings', 'Glutes', 'Core/Abs'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'A full posterior-chain pull from the floor that builds the entire back, grip, and hips at once; one of the best overall strength builders in the gym.' },
    { id: 'back-pullup', name: 'Pull-Up', group: 'Back', secondary: ['Biceps', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'A vertical pulling movement that builds lat width and upper-back strength by pulling your own bodyweight up to a bar.' },
    { id: 'back-bent-over-row', name: 'Barbell Bent-Over Row', group: 'Back', secondary: ['Biceps', 'Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A horizontal pull that thickens the mid-back and lats, hinging at the hips to row the bar into the torso under control.' },
    { id: 'back-lat-pulldown', name: 'Lat Pulldown', group: 'Back', secondary: ['Biceps'], equipment: 'Cable', difficulty: 'Beginner', desc: 'A machine-assisted vertical pull that mimics the pull-up motion, letting you dial in a weight you can control while building lat width.' },
    { id: 'back-seated-row', name: 'Seated Cable Row', group: 'Back', secondary: ['Biceps', 'Shoulders'], equipment: 'Cable', difficulty: 'Beginner', desc: 'A horizontal pulling exercise that targets the mid-back and rear shoulders while keeping tension on the muscle through the full range.' },
    { id: 'back-single-arm-row', name: 'Single-Arm Dumbbell Row', group: 'Back', secondary: ['Biceps', 'Core/Abs'], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Rowing one side at a time lets you focus on pulling with the back rather than momentum, and challenges the core to resist rotation.' },

    // Shoulders
    { id: 'shoulders-overhead-press', name: 'Overhead Press', group: 'Shoulders', secondary: ['Triceps', 'Core/Abs'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A standing vertical press that builds total shoulder strength and stability, requiring the core and legs to brace as you press the bar overhead.' },
    { id: 'shoulders-lateral-raise', name: 'Dumbbell Lateral Raise', group: 'Shoulders', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'An isolation move that targets the side deltoid directly, building shoulder width by raising the arms out to the sides against gravity.' },
    { id: 'shoulders-arnold-press', name: 'Arnold Press', group: 'Shoulders', secondary: ['Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'A rotating overhead press that takes the shoulder through internal-to-external rotation, hitting all three heads of the deltoid in one movement.' },
    { id: 'shoulders-face-pull', name: 'Face Pull', group: 'Shoulders', secondary: ['Back'], equipment: 'Cable', difficulty: 'Beginner', desc: 'Pulling a rope toward the face targets the rear delts and upper back, muscles that are often neglected and important for shoulder health and posture.' },
    { id: 'shoulders-machine-press', name: 'Machine Shoulder Press', group: 'Shoulders', secondary: ['Triceps'], equipment: 'Machine', difficulty: 'Beginner', desc: 'A guided pressing pattern for the shoulders that removes the balance demands of a free-weight press, good for building pressing strength safely.' },
    { id: 'shoulders-kb-push-press', name: 'Kettlebell Push Press', group: 'Shoulders', secondary: ['Triceps', 'Quads'], equipment: 'Kettlebell', difficulty: 'Intermediate', desc: 'A slight leg drive helps launch the kettlebell overhead, letting you press more weight than a strict press while still building shoulder strength.' },

    // Biceps
    { id: 'biceps-barbell-curl', name: 'Barbell Curl', group: 'Biceps', secondary: [], equipment: 'Barbell', difficulty: 'Beginner', desc: 'The classic biceps builder — curling a straight bar from full extension to full flexion isolates the biceps through its whole range of motion.' },
    { id: 'biceps-hammer-curl', name: 'Dumbbell Hammer Curl', group: 'Biceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Curling with a neutral (palms-in) grip shifts some emphasis onto the brachialis and forearms alongside the biceps, building thicker-looking arms.' },
    { id: 'biceps-incline-curl', name: 'Incline Dumbbell Curl', group: 'Biceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Curling while seated on an incline bench stretches the biceps behind the body first, increasing the range of motion and time under tension.' },
    { id: 'biceps-cable-curl', name: 'Cable Curl', group: 'Biceps', secondary: [], equipment: 'Cable', difficulty: 'Beginner', desc: "A cable's constant tension keeps the biceps loaded through the entire curl, including the bottom position where a dumbbell would go slack." },
    { id: 'biceps-preacher-curl', name: 'Preacher Curl', group: 'Biceps', secondary: [], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Bracing the arms against an angled pad removes the ability to swing the weight, isolating the biceps and emphasizing the stretched bottom position.' },
    { id: 'biceps-concentration-curl', name: 'Concentration Curl', group: 'Biceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Curling one arm at a time with the elbow braced against the inner thigh isolates the biceps almost completely, good for building a peak.' },

    // Triceps
    { id: 'triceps-close-grip-bench', name: 'Close-Grip Bench Press', group: 'Triceps', secondary: ['Chest', 'Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A bench press with the hands set close together shifts most of the pressing load onto the triceps while still working the chest and shoulders.' },
    { id: 'triceps-pushdown', name: 'Triceps Pushdown', group: 'Triceps', secondary: [], equipment: 'Cable', difficulty: 'Beginner', desc: 'Pushing a cable attachment down from a bent-elbow position isolates the triceps through extension, a straightforward way to build arm size.' },
    { id: 'triceps-skull-crusher', name: 'Skull Crusher', group: 'Triceps', secondary: [], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Lying down and lowering a bar toward the forehead stretches the triceps at the top before extending back out, a strong isolation builder.' },
    { id: 'triceps-overhead-extension', name: 'Overhead Dumbbell Extension', group: 'Triceps', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Extending a dumbbell overhead stretches the long head of the triceps more than pushdown variations, helping build overall arm size.' },
    { id: 'triceps-dips', name: 'Dips', group: 'Triceps', secondary: ['Chest', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Lowering and pressing your bodyweight between parallel bars builds serious triceps and chest strength, with depth controlling the difficulty.' },
    { id: 'triceps-kb-kickback', name: 'Kettlebell Triceps Kickback', group: 'Triceps', secondary: [], equipment: 'Kettlebell', difficulty: 'Beginner', desc: 'Hinging forward and extending the arm behind the body isolates the triceps at full contraction, a light but effective finishing move.' },

    // Quads
    { id: 'quads-back-squat', name: 'Back Squat', group: 'Quads', secondary: ['Glutes', 'Hamstrings', 'Core/Abs'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'The foundational lower-body lift — squatting a barbell on the back builds quad, glute, and core strength through a deep, controlled range of motion.' },
    { id: 'quads-front-squat', name: 'Front Squat', group: 'Quads', secondary: ['Core/Abs', 'Glutes'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'Holding the bar across the front shoulders keeps the torso more upright than a back squat, placing even more direct emphasis on the quads.' },
    { id: 'quads-leg-press', name: 'Leg Press', group: 'Quads', secondary: ['Glutes', 'Hamstrings'], equipment: 'Machine', difficulty: 'Beginner', desc: 'A machine squat pattern that lets you load the quads and glutes heavily without needing to balance a bar, easier to learn than a free-weight squat.' },
    { id: 'quads-walking-lunge', name: 'Walking Lunge', group: 'Quads', secondary: ['Glutes', 'Hamstrings', 'Core/Abs'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'Stepping forward into a lunge and alternating legs builds single-leg quad and glute strength while also challenging balance and core stability.' },
    { id: 'quads-goblet-squat', name: 'Goblet Squat', group: 'Quads', secondary: ['Glutes', 'Core/Abs'], equipment: 'Kettlebell', difficulty: 'Beginner', desc: 'Holding a kettlebell at chest height while squatting is one of the easiest ways to learn good squat form while still building real quad strength.' },
    { id: 'quads-leg-extension', name: 'Leg Extension', group: 'Quads', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: 'An isolation move that extends the knee against resistance, targeting the quads directly without involving the hips or hamstrings at all.' },

    // Hamstrings
    { id: 'hamstrings-rdl', name: 'Romanian Deadlift', group: 'Hamstrings', secondary: ['Glutes', 'Back'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'A hip-hinge movement that lowers the bar along the legs to stretch the hamstrings under load, one of the best builders of hamstring size and strength.' },
    { id: 'hamstrings-leg-curl', name: 'Leg Curl', group: 'Hamstrings', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: 'An isolation move that curls the heel toward the glutes against resistance, targeting the hamstrings directly without hip involvement.' },
    { id: 'hamstrings-stiff-leg-deadlift', name: 'Dumbbell Stiff-Leg Deadlift', group: 'Hamstrings', secondary: ['Glutes', 'Back'], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Keeping the legs nearly straight while hinging at the hips isolates the hamstrings and glutes more than a standard deadlift.' },
    { id: 'hamstrings-nordic-curl', name: 'Nordic Curl', group: 'Hamstrings', secondary: ['Glutes'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Anchoring the feet and lowering the torso forward under control builds tremendous hamstring strength eccentrically, a demanding bodyweight move.' },
    { id: 'hamstrings-kb-swing', name: 'Kettlebell Swing', group: 'Hamstrings', secondary: ['Glutes', 'Core/Abs', 'Back'], equipment: 'Kettlebell', difficulty: 'Intermediate', desc: 'A ballistic hip-hinge that snaps the hips forward to swing the kettlebell, building explosive hamstring and glute power along with conditioning.' },
    { id: 'hamstrings-good-morning', name: 'Good Morning', group: 'Hamstrings', secondary: ['Glutes', 'Back'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Hinging forward at the hips with a bar on the back stretches and strengthens the hamstrings and lower back through a controlled bow.' },

    // Glutes
    { id: 'glutes-hip-thrust', name: 'Hip Thrust', group: 'Glutes', secondary: ['Hamstrings'], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Driving the hips up with a barbell across the lap directly targets the glutes at the top of the movement better than almost any other exercise.' },
    { id: 'glutes-bridge', name: 'Glute Bridge', group: 'Glutes', secondary: ['Hamstrings'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'A simpler version of the hip thrust performed on the floor, squeezing the glutes at the top to build activation and endurance.' },
    { id: 'glutes-bulgarian-split-squat', name: 'Bulgarian Split Squat', group: 'Glutes', secondary: ['Quads', 'Hamstrings'], equipment: 'Dumbbell', difficulty: 'Intermediate', desc: 'With the rear foot elevated on a bench, this single-leg squat variation loads one glute and quad hard while demanding balance and control.' },
    { id: 'glutes-cable-kickback', name: 'Cable Kickback', group: 'Glutes', secondary: ['Hamstrings'], equipment: 'Cable', difficulty: 'Beginner', desc: 'Kicking one leg back against cable resistance isolates the glute at the end range, a focused finisher for glute activation.' },
    { id: 'glutes-sumo-deadlift', name: 'Sumo Deadlift', group: 'Glutes', secondary: ['Quads', 'Hamstrings', 'Back'], equipment: 'Barbell', difficulty: 'Advanced', desc: 'A wide-stance deadlift variation that shifts more load onto the glutes and inner quads compared to a conventional pull.' },
    { id: 'glutes-banded-walk', name: 'Banded Lateral Walk', group: 'Glutes', secondary: [], equipment: 'Bands', difficulty: 'Beginner', desc: "Stepping sideways against a resistance band targets the glute medius, the side-glute muscle responsible for hip stability." },

    // Calves
    { id: 'calves-standing-raise', name: 'Standing Calf Raise', group: 'Calves', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: 'Rising up onto the toes against resistance targets the larger gastrocnemius muscle, the main muscle that gives the calf its shape.' },
    { id: 'calves-seated-raise', name: 'Seated Calf Raise', group: 'Calves', secondary: [], equipment: 'Machine', difficulty: 'Beginner', desc: "Performing the raise with the knee bent shifts emphasis onto the soleus, the deeper calf muscle that's harder to reach with straight-leg raises." },
    { id: 'calves-db-raise', name: 'Dumbbell Calf Raise', group: 'Calves', secondary: [], equipment: 'Dumbbell', difficulty: 'Beginner', desc: 'Holding dumbbells while rising onto the toes on a raised surface allows a deep stretch at the bottom and a full contraction at the top.' },
    { id: 'calves-bodyweight-raise', name: 'Bodyweight Calf Raise', group: 'Calves', secondary: [], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'A simple, equipment-free way to build calf endurance and size by rising onto the toes repeatedly, easy to do almost anywhere.' },
    { id: 'calves-barbell-raise', name: 'Barbell Calf Raise', group: 'Calves', secondary: [], equipment: 'Barbell', difficulty: 'Intermediate', desc: 'Loading a barbell across the back while raising onto the toes lets more advanced lifters add heavier resistance than bodyweight alone allows.' },
    { id: 'calves-jump-rope', name: 'Jump Rope', group: 'Calves', secondary: ['Core/Abs'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'The repeated push-off of jump rope builds calf endurance and power while doubling as a solid cardio conditioning tool.' },

    // Core/Abs
    { id: 'core-plank', name: 'Plank', group: 'Core/Abs', secondary: ['Shoulders'], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'Holding a straight-body position on the forearms builds anti-extension core strength — the ability to resist your hips sagging under load.' },
    { id: 'core-hanging-leg-raise', name: 'Hanging Leg Raise', group: 'Core/Abs', secondary: [], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Raising the legs while hanging from a bar targets the lower abs and hip flexors, a challenging move that also tests grip endurance.' },
    { id: 'core-cable-woodchop', name: 'Cable Woodchop', group: 'Core/Abs', secondary: ['Shoulders'], equipment: 'Cable', difficulty: 'Intermediate', desc: 'Rotating the torso against cable resistance from high to low builds rotational core strength, useful for sports and everyday twisting movements.' },
    { id: 'core-ab-wheel', name: 'Ab Wheel Rollout', group: 'Core/Abs', secondary: ['Shoulders', 'Back'], equipment: 'Bodyweight', difficulty: 'Advanced', desc: 'Rolling a wheel out from a kneeling position demands serious anti-extension core control to keep the lower back from collapsing.' },
    { id: 'core-russian-twist', name: 'Russian Twist', group: 'Core/Abs', secondary: [], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'Rotating a weight side to side while balanced on the tailbone targets the obliques, the muscles that give the waist its twisting strength.' },
    { id: 'core-dead-bug', name: 'Dead Bug', group: 'Core/Abs', secondary: [], equipment: 'Bodyweight', difficulty: 'Beginner', desc: 'Slowly extending opposite arm and leg while keeping the lower back flat against the floor teaches core bracing without any spinal movement.' }
  ];

  var MUSCLE_GROUPS = [];
  EXERCISES.forEach(function (ex) { if (MUSCLE_GROUPS.indexOf(ex.group) === -1) MUSCLE_GROUPS.push(ex.group); });

  var EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Bands'];

  return {
    EXERCISES: EXERCISES,
    MUSCLE_GROUPS: MUSCLE_GROUPS,
    EQUIPMENT_OPTIONS: EQUIPMENT_OPTIONS
  };
})();
