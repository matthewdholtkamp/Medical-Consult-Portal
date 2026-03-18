
file_content = r"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Behavioral Neurology Clinical Navigator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="js/theme.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <!-- Google Icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }

        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Report Styles */
        .prose-content h1 { font-size: 1.5rem; font-weight: 800; color: #f8fafc; margin-top: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
        .prose-content h2 { font-size: 1.25rem; font-weight: 700; color: #e2e8f0; margin-top: 1.25rem; }
        .prose-content h3 { font-size: 1.1rem; font-weight: 600; color: #cbd5e1; margin-top: 1rem; }
        .prose-content p { color: #cbd5e1; line-height: 1.7; margin-bottom: 1rem; }
        .prose-content ul { list-style-type: disc; padding-left: 1.5rem; color: #94a3b8; margin-bottom: 1rem; }
        .prose-content li { margin-bottom: 0.25rem; }
        .prose-content strong { color: #60a5fa; }
    </style>
</head>
<body class="bg-gemini-900 text-slate-200 h-screen flex flex-col overflow-hidden">

    <!-- START SCREEN (Mode Selection) -->
    <div id="startScreen" class="absolute inset-0 z-50 flex items-center justify-center bg-gemini-900 p-6">
        <div class="max-w-md w-full bg-gemini-800 border border-slate-700 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20">
                    <span class="material-symbols-outlined text-indigo-400 text-5xl">psychology</span>
                </div>
                <h1 class="text-2xl font-black text-slate-100">Neuro Navigator</h1>
                <p class="text-slate-500 mt-2 font-medium italic">Behavioral Neurology Suite</p>
            </div>
            <div class="space-y-4">
                <button onclick="setExamMode('screening')" class="w-full p-6 bg-slate-800 border-2 border-slate-700 rounded-2xl text-left hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-black text-slate-200 uppercase tracking-tight group-hover:text-indigo-400">MoCA Screening</span>
                        <span class="material-symbols-outlined text-slate-500 group-hover:text-indigo-500">check_box</span>
                    </div>
                    <p class="text-xs text-slate-500 font-bold uppercase">Rapid Assessment</p>
                </button>
                <button onclick="setExamMode('full')" class="w-full p-6 bg-gemini-900 border-2 border-slate-800 rounded-2xl text-left hover:border-slate-600 hover:bg-slate-800 transition-all group shadow-lg">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-black text-white uppercase tracking-tight">Full Comprehensive Exam</span>
                        <span class="material-symbols-outlined text-indigo-400">cardiology</span>
                    </div>
                    <p class="text-xs text-slate-500 font-bold uppercase">General Neuro + Localization + Report</p>
                </button>
            </div>
        </div>
    </div>

    <!-- MAIN APP INTERFACE -->
    <div id="mainApp" class="flex flex-col h-full hidden opacity-0 transition-opacity duration-500">

        <!-- Header -->
        <header class="bg-gemini-800 text-white p-4 md:p-6 flex justify-between items-center border-b border-slate-700 shrink-0">
            <div class="flex items-center gap-4">
                <div class="p-2 bg-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20" onclick="resetApp()">
                    <span class="material-symbols-outlined text-white">psychology</span>
                </div>
                <div>
                    <h1 class="text-lg md:text-xl font-black uppercase tracking-tight text-slate-100">Behavioral Neurology Clinical Navigator</h1>
                    <p class="text-slate-400 text-[10px] font-bold flex items-center gap-2 uppercase tracking-wider">
                        <span class="material-symbols-outlined text-indigo-400 text-[14px]">stethoscope</span>
                        <span id="modeLabel">--</span>
                    </p>
                </div>
            </div>
            <div class="text-right">
                <div class="text-[10px] font-black text-slate-500 uppercase mb-1">MoCA Score</div>
                <div class="text-3xl font-black text-indigo-400 font-mono tracking-tighter leading-none">
                    <span id="totalMocaDisplay">0</span><span class="text-slate-600 text-base">/30</span>
                </div>
            </div>
        </header>

        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar Navigation -->
            <nav class="w-64 bg-gemini-800 border-r border-slate-700 p-3 space-y-1 overflow-y-auto shrink-0 hidden md:block">
                <div id="sidebarButtons" class="space-y-1">
                    <!-- Dynamic Tabs -->
                </div>
                <div class="pt-6 px-1">
                    <button onclick="showAnalysisView()" class="w-full p-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500">
                        <span class="material-symbols-outlined text-[18px]">auto_awesome</span> Generate AI Report
                    </button>
                </div>
            </nav>

            <!-- Main Content Area -->
            <main id="contentArea" class="flex-1 bg-gemini-900 overflow-y-auto scroll-smooth p-6 md:p-10 relative">

                <!-- INPUT VIEW -->
                <div id="inputView" class="max-w-4xl mx-auto pb-20 animate-fade-in">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-8 w-1 bg-indigo-500 rounded-full"></div>
                        <h2 id="sectionTitle" class="text-2xl font-black text-white tracking-tight">--</h2>
                    </div>

                    <!-- TAB CONTENT CONTAINER -->
                    <div id="tabContent" class="space-y-6">
                        <!-- Dynamic Content Injected Here -->
                    </div>

                    <!-- Navigation Footer -->
                    <div class="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
                        <button onclick="prevTab()" class="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">chevron_left</span> Previous
                        </button>
                        <button onclick="nextTab()" class="flex items-center gap-2 px-6 py-3 bg-slate-100 text-gemini-900 rounded-xl font-bold hover:bg-white transition-all shadow-lg">
                            Next Section <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

                <!-- REPORT VIEW -->
                <div id="reportView" class="hidden h-full flex flex-col max-w-5xl mx-auto animate-fade-in">
                    <div class="flex justify-between items-center mb-6 border-b border-slate-700 pb-4 shrink-0">
                        <h2 class="text-2xl font-black text-white">Final Clinical Report</h2>
                        <div class="flex gap-2">
                            <button onclick="generateReport()" class="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs hover:bg-indigo-500/20 transition-all uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm">refresh</span> Regenerate
                            </button>
                            <button onclick="copyReport()" id="copyBtn" class="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs hover:bg-emerald-500/20 transition-all uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm">content_copy</span> Copy
                            </button>
                            <button onclick="hideAnalysisView()" class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white font-bold hover:bg-slate-800 rounded-lg transition-colors">
                                <span class="material-symbols-outlined">close</span> Close
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl relative overflow-hidden flex flex-col">
                        <!-- Loading Overlay -->
                        <div id="loadingOverlay" class="absolute inset-0 bg-gemini-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 hidden">
                            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-sm font-black text-indigo-400 uppercase tracking-widest animate-pulse">Consulting AI Neurologist...</p>
                        </div>

                        <div class="flex-1 p-6 overflow-y-auto custom-scroll">
                            <div id="reportOutput" class="prose-content font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 outline-none" contenteditable="true"></div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>

    <!-- Hidden Input for Image Upload -->
    <input type="file" id="mocaImageInput" accept="image/*" class="hidden">

    <script type="module">
        import { API_KEYS } from './js/config.js?v=secure';

        // --- CONSTANTS & DATA ---
        const DEFAULT_CN = `II: PERRLA, No APD. VFFTC
Fundi: Disks are sharp without papilledema. No optic atrophy. No retinal hemorrhages
III,IV,VI: Versions full. Convergence normal. Saccades are rapid and accurate vertically and horizontally. Horizontal pursuits smooth. No nystagmus is noted in primary position or in any direction of gaze. No ptosis.
V: intact to LT, intact in V1-3. MOMI.
VII: Face is symmetric, MOE intact/symmetric in U and L fields
VIII: Hearing is grossly intact.
IX/X: Palate volitionally rises symmetrically. Speech is w/o hypophonia, dysphonia, dysarthria, or hoarseness
XI: SCM/TPZ are 5/5 and symmetric without atrophy.
XII: Tongue is midline with normal strength and no atrophy.`;

        const DEFAULT_MOTOR = `Strength R/L
Deltoid (C5,6/Axillary) 5/5
Biceps (C5,6/Musculocutaneous) 5/5
Triceps (C6,7/Radial) 5/5
Forearm pronation (C6,7/Median) 5/5
Wrist Extension (C6,7/Radial) 5/5
Wrist Flexion (C6,7/Median) 5/5
Flexor digitorum (C8/Median) 5/5
Finger abduction (T1/Ulnar) 5/5
Thumb opposition (C8,T1/Median) 5/5
Hip adduction (L2,3,4) 5/5
Knee extension (L3,4/Femoral) 5/5
Knee flexion (L5,S1/Sciatic) 5/5
Ankle dorsiflexion (L4,5/Peroneal) 5/5
Ankle plantarflexion (S1,S2/Tibial nerve) 5/5
Extensor hallicus longus (L5) 5/5

Tone/Bulk:
No Matched effort, no give-way strength, no dramatic effort
No spasticity, no clonus, no fasciculations
No pronator drift, no posting
No atrophy or hypertrophy
No tremor, bradykinesia, dystonic posturing, dyskinesias, chorea, myoclonus.`;

        const DEFAULT_COORD = "Finger-to-nose and heel-to-shin are without dysmetria or past-pointing.";
        const DEFAULT_SENSORY = "Light touch, and temperature sensation intact in all 4 limbs.\\nVibration is intact in both great toes and distal fingers.\\nRomberg negative.";
        const DEFAULT_REFLEXES = "REFLEXES R/L\\nBiceps (C5) 2/2\\nTriceps (C7) 2/2\\nBrachioradialis(C6) 2/2\\nPatellar (L4) 2/2\\nAchilles (S1) 2/2\\nPlantar (L4-5,S1-2) Downgoing/Downgoing\\nAnkle clonus Absent/Absent";
        const DEFAULT_GAIT = "Rises from sitting normally. Posture and stance are normal. No start hesitation. Native gait with normal stride length, height, speed and arm swing. Turns easily.";

        const MOCA_SECTIONS = [
            { id: 'moca-visuo', title: "Visuospatial / Executive", tests: [
                { id: 'moca_trails', label: 'Alt. Trail Making', max: 1, instructions: "1 -> A -> 2 -> B -> 3 -> C..." },
                { id: 'moca_cube', label: 'Cube Copy', max: 1, instructions: "Copy the cube exactly." },
                { id: 'moca_clock', label: 'Clock Drawing', max: 3, instructions: "Draw clock, put in numbers, set time to 10 past 11." }
            ]},
            { id: 'moca-naming', title: "Naming", tests: [
                { id: 'moca_naming', label: 'Animal Naming', max: 3, instructions: "Lion, Rhinoceros, Camel." }
            ]},
            { id: 'moca-attention', title: "Attention", tests: [
                { id: 'moca_digits_f', label: 'Digits Forward', max: 1, instructions: "2-1-8-5-4" },
                { id: 'moca_digits_b', label: 'Digits Backward', max: 1, instructions: "7-4-2" },
                { id: 'moca_tapping', label: 'Vigilance (Tap A)', max: 1, instructions: "Tap on letter A." },
                { id: 'moca_serial7', label: 'Serial 7s', max: 3, instructions: "100 - 7..." }
            ]},
            { id: 'moca-language', title: "Language", tests: [
                { id: 'moca_repeat', label: 'Sentence Repetition', max: 2, instructions: "Repeat exact sentences." },
                { id: 'moca_fluency', label: 'Verbal Fluency (F)', max: 1, instructions: "Words starting with F (>11 in 60s)." }
            ]},
            { id: 'moca-abstract', title: "Abstraction", tests: [
                { id: 'moca_abstract', label: 'Similarities', max: 2, instructions: "Train/Bicycle, Watch/Ruler." }
            ]},
            { id: 'moca-memory', title: "Delayed Recall", tests: [
                { id: 'moca_recall', label: 'Delayed Recall', max: 5, instructions: "Recall words from earlier (Face, Velvet, Church, Daisy, Red)." }
            ]},
            { id: 'moca-orient', title: "Orientation", tests: [
                { id: 'moca_orient', label: 'Orientation', max: 6, instructions: "Date, Month, Year, Day, Place, City." }
            ]}
        ];

        const EXAM_SECTIONS = [
            { id: 'right-frontal', lobe: "Right Dorsolateral Frontal", icon: "neurology", tests: [
                { id: 'figural_fluency', label: 'Figural Fluency', note: "Tests non-verbal divergent thinking.", instructions: "Draw unique designs with 4 lines in 1 min (>8)." },
                { id: 'novel_design', label: 'Novel Design Fluency', note: "Inhibition of familiar patterns.", instructions: "Draw non-real shapes." },
                { id: 'affective_prosody', label: 'Affective Motor Prosody', note: "RH emotional expression.", instructions: "Repeat sentence with Angry, Happy, Sad tone." },
                { id: 'picture_sequencing', label: 'Picture Sequencing', note: "Social/Contextual integration.", instructions: "Order mixed-up cartoon cards." }
            ]},
            { id: 'left-frontal', lobe: "Left Dorsolateral Frontal", icon: "translate", tests: [
                { id: 'digit_reverse', label: 'Digit Span Reverse', note: "Working memory.", instructions: "Repeat numbers backwards." },
                { id: 'wisconsin_bedside', label: 'Bedside Wisconsin (Coin)', note: "Set-shifting.", instructions: "Guess hand with coin. Switch pattern after 3 correct." },
                { id: 'animal_fluency', label: 'Verbal Fluency (Animals)', note: "Semantic retrieval.", instructions: "Name animals in 1 min (>12)." },
                { id: 'fas_fluency', label: 'Phonemic Fluency (F-A-S)', note: "Executive search.", instructions: "Words starting with F/A/S in 1 min (>10)." },
                { id: 'little_big', label: '“Little-Big” Stroop', note: "Response inhibition.", instructions: "Read word vs say size (Big/Little)." },
                { id: 'trails_b', label: 'Trails B (Oral)', note: "Cognitive flexibility.", instructions: "1-A, 2-B, 3-C..." },
                { id: 'luria_seq', label: 'Luria Motor Seq', note: "Premotor/SMA.", instructions: "Fist-Edge-Palm." },
                { id: 'gonogo', label: 'Go / No-Go', note: "Inhibition.", instructions: "Tap once when I tap once. Do not tap when I tap twice." }
            ]},
            { id: 'right-parietal', lobe: "Right Parietal (Spatial)", icon: "visibility", tests: [
                { id: 'cube_strategy', label: 'Cube/Complex Drawing', note: "Spatial construction.", instructions: "Copy cube." },
                { id: 'neglect_battery', label: 'Neglect Battery', note: "Hemispatial Neglect.", instructions: "Line bisection, double simultaneous stimulation." },
                { id: 'line_orientation', label: 'Line Orientation', note: "Visuospatial perception.", instructions: "Match angled lines." },
                { id: 'dressing_praxis', label: 'Dressing Apraxia', note: "Body-in-space.", instructions: "Put on jacket with sleeve inside out." }
            ]},
            { id: 'left-parietal', lobe: "Left Parietal (Gerstmann's)", icon: "fingerprint", tests: [
                { id: 'finger_agnosia', label: 'Finger Agnosia', note: "Gerstmann's.", instructions: "Identify fingers by touch." },
                { id: 'calculation', label: 'Calculation', note: "Acalculia.", instructions: "100-7, or written math." },
                { id: 'rl_orientation', label: 'Right-Left Orientation', note: "Spatial-symbolic.", instructions: "Touch right ear with left hand." },
                { id: 'drawing_details', label: 'Drawing Details', note: "Object details.", instructions: "Draw a house (look for windows, door)." }
            ]},
            { id: 'right-temporal', lobe: "Right Temporal (Visual Memory)", icon: "music_note", tests: [
                { id: 'visual_recall', label: 'Visual Memory', note: "RH Hippocampal.", instructions: "Recall hidden shape after 5 mins." },
                { id: 'object_location', label: 'Object Location', note: "Contextual memory.", instructions: "Recall location of 3 hidden objects." },
                { id: 'melody_rec', label: 'Melody Recognition', note: "Amusia.", instructions: "Identify hummed songs." }
            ]},
            { id: 'left-temporal', lobe: "Left Temporal (Verbal/Semantic)", icon: "translate", tests: [
                { id: 'verbal_memory', label: '8-Word List Recall', note: "Hippocampal.", instructions: "Recall 8 words after 5 mins." },
                { id: 'semantic_knowledge', label: 'Semantic/Category', note: "Semantic Dementia.", instructions: "Define low frequency items (e.g. Stethoscope)." },
                { id: 'aphasia_screen', label: 'Comprehension/Repetition', note: "Wernicke's/Conduction.", instructions: "Complex commands, Repetition." }
            ]},
            { id: 'occipital', lobe: "Occipital (Visual Agnosias)", icon: "visibility", tests: [
                { id: 'prosopagnosia', label: 'Prosopagnosia', note: "Face blindness.", instructions: "Identify famous faces." },
                { id: 'simultanagnosia', label: 'Simultanagnosia', note: "Balint's.", instructions: "Cookie Theft picture (whole scene)." },
                { id: 'optic_ataxia', label: 'Optic Ataxia', note: "Visuomotor.", instructions: "Reach for object in periphery." },
                { id: 'visual_agnosia', label: 'Visual Agnosia', note: "Ventral stream.", instructions: "Name object by sight vs touch." },
                { id: 'color_agnosia', label: 'Color Imagery', note: "Color knowledge.", instructions: "What color is a strawberry?" }
            ]}
        ];

        // --- GLOBAL STATE ---
        let appState = {
            mode: null, // 'screening', 'full'
            activeTab: 0,
            scores: {},
            notes: {},
            textInputs: {
                reason: "",
                appearance: "",
                cn: DEFAULT_CN,
                motor: DEFAULT_MOTOR,
                coord: DEFAULT_COORD,
                sensory: DEFAULT_SENSORY,
                reflexes: DEFAULT_REFLEXES,
                gait: DEFAULT_GAIT,
                mocaNotes: ""
            },
            mocaImage: null
        };

        // --- EXPOSE FUNCTIONS TO WINDOW ---
        window.setExamMode = (mode) => {
            appState.mode = mode;
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            document.getElementById('mainApp').classList.remove('opacity-0');
            document.getElementById('modeLabel').textContent = mode === 'full' ? 'Comprehensive Exam' : 'Screening Mode';

            // Set initial tab
            appState.activeTab = mode === 'full' ? 0 : 1;
            renderSidebar();
            renderContent();
        };

        window.resetApp = () => {
            if(confirm("Reset all data and return to menu?")) {
                location.reload();
            }
        };

        window.setActiveTab = (idx) => {
            appState.activeTab = idx;
            hideAnalysisView();
            renderSidebar();
            renderContent();
        };

        window.nextTab = () => {
            const tabsCount = (appState.mode === 'full' ? EXAM_SECTIONS.length + 2 : 2); // 0=Gen, 1=MoCA, 2...=Loc
            if (appState.activeTab < tabsCount - 1) {
                appState.activeTab++;
                renderSidebar();
                renderContent();
            } else {
                showAnalysisView();
            }
        };

        window.prevTab = () => {
            if (appState.activeTab > 0) {
                appState.activeTab--;
                renderSidebar();
                renderContent();
            } else {
                location.reload();
            }
        };

        window.updateScore = (id, val) => {
            const num = parseFloat(val);
            appState.scores[id] = isNaN(num) ? val : num;
            updateMocaTotal();
            // Re-render only if needed, but for inputs we usually bind direct
        };

        window.updateNote = (id, val) => {
            appState.notes[id] = val;
        };

        window.updateTextInput = (field, val) => {
            appState.textInputs[field] = val;
        };

        window.handleImageUpload = () => {
            document.getElementById('mocaImageInput').click();
        };

        // --- RENDER FUNCTIONS ---

        function renderSidebar() {
            const container = document.getElementById('sidebarButtons');
            let html = '';

            const tabs = [];
            if (appState.mode === 'full') {
                tabs.push({ label: 'General Neuro Exam', icon: 'person' });
            }
            tabs.push({ label: 'MoCA Screening', icon: 'check_box' });

            if (appState.mode === 'full') {
                EXAM_SECTIONS.forEach(sec => tabs.push({ label: sec.lobe, icon: sec.icon }));
            }

            // Adjust index mapping
            // If mode is 'screening', tab 0 is MoCA. If 'full', tab 0 is Gen, 1 is MoCA.
            // But my appState.activeTab logic assumes: 0=Gen, 1=MoCA, 2...
            // If screening, we only show MoCA (which is logically tab 1).
            // To simplify, let's keep the index logic consistent:
            // Full: 0, 1, 2, 3...
            // Screening: Just start at 1.

            tabs.forEach((tab, idx) => {
                // Determine actual logical index
                let logicalIdx = idx;
                if (appState.mode === 'screening') logicalIdx = 1; // Only MoCA

                const isActive = appState.activeTab === logicalIdx;
                const classes = isActive
                    ? 'bg-slate-700 text-white shadow-md border-l-4 border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white';

                html += `<button onclick="setActiveTab(${logicalIdx})" class="w-full flex items-center gap-3 p-3 rounded-r-xl transition-all text-xs font-bold text-left mb-1 ${classes}">
                    <span class="material-symbols-outlined text-[18px]">${tab.icon}</span>
                    <span class="truncate">${tab.label}</span>
                </button>`;
            });

            container.innerHTML = html;
        }

        function renderContent() {
            const container = document.getElementById('tabContent');
            const title = document.getElementById('sectionTitle');

            // 0: General Neuro
            if (appState.activeTab === 0) {
                title.textContent = "General Neuro Exam";
                container.innerHTML = `
                    <div class="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 mb-6 flex gap-3">
                        <span class="material-symbols-outlined text-indigo-400">info</span>
                        <p class="text-xs text-indigo-200 leading-relaxed">Complete patient history. Physical exam fields are pre-populated with "Normal" findings.</p>
                    </div>
                    <div class="space-y-6">
                        <div>
                            <label class="text-xs font-black uppercase text-indigo-400 mb-1 block">Reason for Exam / HPI</label>
                            <textarea oninput="updateTextInput('reason', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none h-32">${appState.textInputs.reason}</textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">General Appearance</label>
                                <textarea oninput="updateTextInput('appearance', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none h-24">${appState.textInputs.appearance}</textarea>
                            </div>
                            <div>
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">Cranial Nerves</label>
                                <textarea oninput="updateTextInput('cn', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:border-indigo-500 outline-none h-48">${appState.textInputs.cn}</textarea>
                            </div>
                            <div class="md:col-span-2">
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">Motor / Tone / Bulk</label>
                                <textarea oninput="updateTextInput('motor', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:border-indigo-500 outline-none h-64">${appState.textInputs.motor}</textarea>
                            </div>
                            <div>
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">Coordination</label>
                                <textarea oninput="updateTextInput('coord', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:border-indigo-500 outline-none h-24">${appState.textInputs.coord}</textarea>
                            </div>
                             <div>
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">Sensory</label>
                                <textarea oninput="updateTextInput('sensory', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:border-indigo-500 outline-none h-24">${appState.textInputs.sensory}</textarea>
                            </div>
                             <div>
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">Reflexes</label>
                                <textarea oninput="updateTextInput('reflexes', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:border-indigo-500 outline-none h-40">${appState.textInputs.reflexes}</textarea>
                            </div>
                             <div>
                                <label class="text-xs font-black uppercase text-slate-500 mb-1 block">Gait</label>
                                <textarea oninput="updateTextInput('gait', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:border-indigo-500 outline-none h-40">${appState.textInputs.gait}</textarea>
                            </div>
                        </div>
                    </div>
                `;
            }
            // 1: MoCA
            else if (appState.activeTab === 1) {
                title.textContent = "MoCA Screening";

                let sectionsHtml = MOCA_SECTIONS.map(sec => `
                    <div class="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">${sec.title}</h3>
                        <div class="space-y-3">
                            ${sec.tests.map(t => `
                                <div class="bg-gemini-900 border border-slate-700 p-4 rounded-xl flex justify-between items-start gap-3">
                                    <div class="flex-1">
                                        <h4 class="font-bold text-slate-200 text-sm">${t.label}</h4>
                                        <p class="text-[11px] text-slate-500 italic mt-1 leading-tight">${t.instructions}</p>
                                    </div>
                                    <div class="flex flex-col items-end gap-1">
                                        <select onchange="updateScore('${t.id}', this.value)" class="bg-slate-800 text-white border border-slate-600 rounded-lg text-sm p-1 w-16 text-center font-bold outline-none focus:border-indigo-500">
                                            ${[...Array(t.max + 1).keys()].map(n =>
                                                `<option value="${n}" ${appState.scores[t.id] == n ? 'selected' : ''}>${n}</option>`
                                            ).join('')}
                                        </select>
                                        <span class="text-[9px] font-bold text-slate-600 uppercase">Max ${t.max}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');

                container.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        ${sectionsHtml}
                    </div>
                    <div class="border-t border-slate-800 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="text-xs font-black uppercase text-indigo-400 mb-2 block">Clinical Notes (MoCA)</label>
                            <textarea oninput="updateTextInput('mocaNotes', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none h-32 placeholder-slate-600" placeholder="e.g. Tremor noted during clock draw...">${appState.textInputs.mocaNotes}</textarea>
                        </div>
                        <div>
                             <label class="text-xs font-black uppercase text-slate-500 mb-2 block">Upload Exam Sheet</label>
                             <div onclick="handleImageUpload()" class="border-2 border-dashed border-slate-700 rounded-xl h-32 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800 hover:border-indigo-500 transition-all cursor-pointer relative overflow-hidden group">
                                ${appState.mocaImage
                                    ? `<img src="${appState.mocaImage}" class="w-full h-full object-contain absolute inset-0 z-10"><div class="absolute inset-0 bg-black/50 z-20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white">Change Image</div>`
                                    : `<span class="material-symbols-outlined mb-2 text-3xl">cloud_upload</span><span class="text-xs font-bold">Click to Upload</span>`
                                }
                             </div>
                        </div>
                    </div>
                `;
            }
            // 2+: Localization
            else {
                const secIdx = appState.activeTab - 2;
                const section = EXAM_SECTIONS[secIdx];
                title.textContent = section.lobe;

                container.innerHTML = `
                    <div class="grid grid-cols-1 gap-4">
                        ${section.tests.map(t => `
                             <div class="border border-slate-700 rounded-xl p-5 bg-slate-800/50 hover:border-indigo-500/50 transition-all">
                                <div class="flex justify-between items-start gap-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <h3 class="text-base font-bold text-slate-200">${t.label}</h3>
                                        </div>
                                        <p class="text-xs text-slate-500 font-medium italic mb-3">${t.note}</p>

                                        <div class="p-3 bg-gemini-900 rounded-lg border border-slate-700/50 text-xs text-slate-400 leading-relaxed mb-3">
                                            <strong class="text-indigo-400 uppercase text-[10px]">Instruction:</strong> ${t.instructions}
                                        </div>

                                        <input type="text"
                                            placeholder="Specific observations..."
                                            value="${appState.notes[t.id] || ''}"
                                            oninput="updateNote('${t.id}', this.value)"
                                            class="w-full bg-gemini-900 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-slate-300 placeholder-slate-600">
                                    </div>

                                    <div class="shrink-0">
                                        <select onchange="updateScore('${t.id}', this.value)" class="w-32 p-2 rounded-xl text-center font-bold text-sm outline-none cursor-pointer border-2 ${
                                            appState.scores[t.id] === 'Pass' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' :
                                            appState.scores[t.id] === 'Fail' ? 'bg-red-900/30 border-red-500/50 text-red-400' :
                                            'bg-slate-900 border-slate-700 text-slate-500'
                                        }">
                                            <option value="">Select...</option>
                                            <option value="Pass" ${appState.scores[t.id] === 'Pass' ? 'selected' : ''}>Pass</option>
                                            <option value="Fail" ${appState.scores[t.id] === 'Fail' ? 'selected' : ''}>Fail</option>
                                            <option value="Not Performed" ${appState.scores[t.id] === 'Not Performed' ? 'selected' : ''}>Deferred</option>
                                        </select>
                                    </div>
                                </div>
                             </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        // --- MOCA CALCULATION ---
        function calculateTotal() {
            let total = 0;
            MOCA_SECTIONS.forEach(s => {
                s.tests.forEach(t => {
                    const val = appState.scores[t.id];
                    if (typeof val === 'number') total += val;
                });
            });
            return total;
        }

        function updateMocaTotal() {
            document.getElementById('totalMocaDisplay').textContent = calculateTotal();
        }

        // --- IMAGE HANDLING ---
        document.getElementById('mocaImageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    appState.mocaImage = evt.target.result;
                    renderContent(); // Re-render to show image
                };
                reader.readAsDataURL(file);
            }
        });

        // --- AI REPORT GENERATION ---

        window.showAnalysisView = () => {
            document.getElementById('inputView').classList.add('hidden');
            document.getElementById('reportView').classList.remove('hidden');
            // If report empty, generate
            const output = document.getElementById('reportOutput');
            if(!output.textContent.trim()) {
                generateReport();
            }
        };

        window.hideAnalysisView = () => {
             document.getElementById('reportView').classList.add('hidden');
             document.getElementById('inputView').classList.remove('hidden');
        };

        window.generateReport = async () => {
            const output = document.getElementById('reportOutput');
            const loading = document.getElementById('loadingOverlay');

            output.innerHTML = "";
            loading.classList.remove('hidden');

            const mocaTotal = calculateTotal();
            const mocaScores = {};
            MOCA_SECTIONS.forEach(s => {
                s.tests.forEach(t => mocaScores[t.label] = appState.scores[t.id] ?? 'Not Assessed');
            });

            const localizationData = EXAM_SECTIONS.map(sec => {
                return {
                    lobe: sec.lobe,
                    findings: sec.tests.map(t => ({
                        test: t.label,
                        result: appState.scores[t.id] || "Not Performed",
                        notes: appState.notes[t.id] || ""
                    }))
                };
            });

            const prompt = `
Act as an expert Behavioral Neurologist (MD). Write a professional, high-level consultation note based on the following exam data.

PATIENT CONTEXT:
Reason for Exam/HPI: "${appState.textInputs.reason}"

NEUROLOGICAL PHYSICAL EXAM:
General Appearance: ${appState.textInputs.appearance}
Cranial Nerves: ${appState.textInputs.cn}
Motor: ${appState.textInputs.motor}
Coordination: ${appState.textInputs.coord}
Sensory: ${appState.textInputs.sensory}
Reflexes: ${appState.textInputs.reflexes}
Gait: ${appState.textInputs.gait}

COGNITIVE SCREENING (MoCA):
Total Score: ${mocaTotal}/30
Breakdown: ${JSON.stringify(mocaScores)}
Clinical Notes: ${appState.textInputs.mocaNotes}

DETAILED LOCALIZATION EXAM (Pass/Fail):
${JSON.stringify(localizationData, null, 2)}

INSTRUCTIONS FOR REPORT GENERATION:
1. **Cognitive & Behavioral Assessment**:
    - Start with a detailed paragraph analyzing the MoCA performance.
    - If the "Detailed Localization Exam" contains results (Pass/Fail), write separate paragraphs for each major brain region. Interpret "Fail" as clinical deficits.
    - If mostly "Not Performed", state testing was deferred and focus on MoCA/History.

2. **Diagnostic Formulation**:
    - Identify likely syndrome (e.g., Amnestic AD, PPA, bvFTD, DLB, MCI).
    - Explain localization.
    - Discuss probable pathophysiology (Amyloid/Tau, TDP-43).

3. **Plan & Recommendations**:
    - Diagnostic Workup (MRI, PET, Labs).
    - Medications: Assess eligibility for Anti-Amyloid vs Symptomatic (Donepezil) based on severity.
    - Safety/Social.

Format with clear Markdown headings. Professional medical terminology.
            `;

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEYS.NEUROLOGY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error.message);

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

                output.innerHTML = marked.parse(text);

            } catch (err) {
                output.innerHTML = `<div class="p-4 bg-red-900/20 text-red-400 border border-red-500/50 rounded-xl">Error: ${err.message}</div>`;
            } finally {
                loading.classList.add('hidden');
            }
        };

        window.copyReport = () => {
             const text = document.getElementById('reportOutput').innerText;
             navigator.clipboard.writeText(text);
             const btn = document.getElementById('copyBtn');
             const original = btn.innerHTML;
             btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> COPIED';
             setTimeout(() => btn.innerHTML = original, 2000);
        };

    </script>
</body>
</html>"""

with open("Cognitive.html", "w") as f:
    f.write(file_content)
