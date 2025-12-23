import os

# The Master Template (based on rheumatology.html)
# Double curly braces {{ }} are used for literal braces in the output HTML/JS.
# Single curly braces {KEY} are used for Python .format() substitution.

template = r"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{TITLE} (Mil-Comm)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Font Awesome for medical icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {{ font-family: 'Inter', sans-serif; }}
        h1, h2, h3, h4, summary, button {{ font-family: 'Roboto Condensed', sans-serif; letter-spacing: 0.5px; }}
        .hidden {{ display: none !important; }}
        .spinner {{
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px; height: 36px;
            border-radius: 50%;
            border-left-color: #4f46e5; /* Indigo */
            animation: spin 1s ease infinite;
        }}
        @keyframes spin {{ 0% {{ transform: rotate(0deg); }} 100% {{ transform: rotate(360deg); }} }}
        details > summary {{ cursor: pointer; }}

        .error-box {{
            display: none;
            background-color: rgba(127, 29, 29, 0.5);
            border: 1px solid #dc2626;
            color: #fca5a5;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }}
        .error-box.active {{ display: block; }}

        .note-preview::-webkit-scrollbar {{ width: 8px; }}
        .note-preview::-webkit-scrollbar-track {{ background: #1f2937; }}
        .note-preview::-webkit-scrollbar-thumb {{ background: #4b5563; border-radius: 4px; }}
    </style>
</head>
<body class="bg-slate-900 text-slate-200">

    <div class="max-w-5xl mx-auto p-4 sm:p-8">

        <header class="text-center mb-8 border-b border-slate-700 pb-6">
            <div class="flex justify-center items-center mb-2">
                <i class="{ICON} text-indigo-500 text-4xl mr-3"></i>
                <h1 class="text-4xl font-bold text-white tracking-wider">{TITLE}</h1>
            </div>
            <p class="text-lg text-slate-400">{SUBTITLE}</p>
        </header>

        <!-- HIPAA WARNING -->
        <details class="bg-slate-800 border border-slate-600 rounded-md mb-8 shadow-lg">
            <summary class="font-semibold text-slate-300 p-4 cursor-pointer text-lg flex justify-between items-center hover:bg-slate-750 transition">
                <span class="flex items-center"><i class="fa-solid fa-shield-halved mr-2 text-blue-400"></i> NON-HIPAA Compliance</span>
                <span class="text-xs bg-red-900/80 text-red-100 px-2 py-1 rounded border border-red-500">Required Check</span>
            </summary>
            <div class="p-4 border-t border-slate-600 text-sm bg-slate-900/50">
                <p class="font-bold text-red-400 mb-3">YOU MUST REMOVE THE FOLLOWING 18 IDENTIFIERS:</p>
                <ul class="list-disc ml-5 space-y-1 text-slate-400 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                    <li>Names</li>
                    <li>Geographic subdivisions smaller than State</li>
                    <li>All dates (except year) related to an individual</li>
                    <li>Telephone numbers</li>
                    <li>Fax numbers</li>
                    <li>Email addresses</li>
                    <li>Social Security numbers</li>
                    <li>Medical Record numbers</li>
                    <li>Health plan beneficiary numbers</li>
                    <li>Account numbers</li>
                    <li>Certificate/license numbers</li>
                    <li>Vehicle identifiers (license plates)</li>
                    <li>Device identifiers/serial numbers</li>
                    <li>Web URLs</li>
                    <li>IP address numbers</li>
                    <li>Biometric identifiers (finger/voice prints)</li>
                    <li>Full face photos</li>
                    <li>Any other unique identifying number</li>
                </ul>
            </div>
        </details>

        <!-- LOADING SPINNER -->
        <div id="loading-spinner" class="hidden flex flex-col justify-center items-center p-12">
            <div class="spinner mb-4"></div>
            <p class="text-xl font-semibold text-slate-300 animate-pulse" id="loading-text">Consulting Guidelines...</p>
        </div>

        <!-- SECTION 1: INTAKE -->
        <div id="section-intake" class="bg-slate-800 p-6 rounded-lg shadow-xl border-t-4 border-indigo-600">
            <h2 class="text-xl font-semibold mb-6 text-white flex items-center">
                <span class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Clinical Context & Intake
            </h2>
            <div id="error-message-intake" class="error-box hidden"></div>

            <form id="intake-form">

                <!-- Location Selection -->
                <div class="mb-8 bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-inner">
                      <label for="location-input" class="block text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wide">
                        <i class="fa-solid fa-hospital-user mr-1"></i> Patient Location
                      </label>
                      <p class="text-xs text-slate-500 mb-2">Determines urgency and transfer necessity.</p>
                      <select id="location-input" class="w-full p-3 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg">
                          <option value="Outpatient Clinic">Outpatient Clinic / Sick Call</option>
                          <option value="ER">ER</option>
                          <option value="Inpatient">Inpatient</option>
                          <option value="CTMC / BAS">CTMC / BAS</option>
                      </select>
                </div>

                <!-- Chief Complaint Area -->
                <div class="mb-6">
                    <label for="initial-symptoms" class="block text-sm font-bold text-white mb-1">History of Present Illness (HPI):</label>
                    <textarea id="initial-symptoms" rows="3" class="w-full p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-700 text-white placeholder-slate-400" placeholder="e.g., 45M Active Duty. 3 days of worsening symptoms..."></textarea>
                    <div class="flex justify-end space-x-3">
                         <button type="button" id="example-1-btn" class="mt-1 text-xs text-indigo-400 hover:text-indigo-300 underline">{EXAMPLE_1_BTN}</button>
                        <button type="button" id="example-2-btn" class="mt-1 text-xs text-indigo-400 hover:text-indigo-300 underline">{EXAMPLE_2_BTN}</button>
                    </div>
                </div>

                <!-- Vitals & History Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Vitals</label>
                        <textarea id="vitals-input" rows="2" class="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white text-sm focus:border-indigo-500 outline-none" placeholder="BP 120/80, HR 80, Temp 98.6"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Physical Exam</label>
                        <textarea id="pe-input" rows="2" class="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white text-sm focus:border-indigo-500 outline-none" placeholder="Pertinent exam findings..."></textarea>
                    </div>
                    <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Current Meds / Allergies</label>
                            <input type="text" id="meds-input" class="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white text-sm focus:border-indigo-500 outline-none" placeholder="Meds list and NKDA.">
                         </div>
                         <div>
                             <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Labs / Imaging</label>
                             <input type="text" id="prior-labs-input" class="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white text-sm focus:border-indigo-500 outline-none" placeholder="Relevant labs or imaging results...">
                         </div>
                    </div>
                    <div class="md:col-span-2">
                         <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Pertinent History / ROS</label>
                         <textarea id="pmh-input" rows="2" class="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white text-sm focus:border-indigo-500 outline-none" placeholder="{ROS_PLACEHOLDER}"></textarea>
                    </div>
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-indigo-700 to-indigo-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:from-indigo-600 hover:to-indigo-500 transition-all transform hover:-translate-y-1 flex items-center justify-center">
                    <span class="mr-3">Start Assessment</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>
        </div>

        <!-- SECTION 2: FOLLOW-UP QUESTIONS -->
        <div id="section-questions" class="hidden bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
            <h2 class="text-xl font-semibold mb-4 text-white border-b border-slate-700 pb-2 flex items-center">
                <i class="fa-solid fa-user-doctor text-indigo-500 mr-2"></i> Refining the Differential
            </h2>
            <p class="text-sm text-slate-400 mb-6 bg-slate-900 p-3 rounded border-l-4 border-indigo-500">
                To distinguish between possible causes, I need to clarify a few clinical details.
            </p>
            <div id="error-message-questions" class="error-box hidden"></div>
            <form id="questions-form">
                <div id="questions-container" class="space-y-5 mb-8"></div>
                <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button type="button" id="questions-back-btn" class="flex-1 bg-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-600 transition">Back</button>
                    <button type="submit" class="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 transition shadow-lg">Generate Plan & Orders</button>
                </div>
            </form>
        </div>

        <!-- SECTION 3: PLAN REVIEW -->
        <div id="section-review" class="hidden bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
             <!-- Logic Alert Banner -->
             <div id="location-alert-banner" class="mb-6 p-4 rounded-md flex items-start">
                <!-- Populated via JS -->
             </div>

            <h2 class="text-xl font-semibold mb-4 text-white pb-2">Review Recommendations</h2>
            <div id="error-message-review" class="error-box hidden"></div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Assessment Col -->
                <div class="space-y-4">
                    <div class="bg-slate-900 p-4 rounded border border-slate-700">
                        <h3 class="font-bold text-indigo-400 mb-2 uppercase text-xs tracking-wider">Assessment & Synthesis</h3>
                        <p id="review-diagnosis" class="text-sm text-slate-200 mb-3 italic leading-relaxed"></p>

                        <h4 class="text-xs font-bold text-slate-500 uppercase mt-4">Differential Diagnosis</h4>
                        <ul id="review-ddx-list" class="text-sm text-slate-400 list-none space-y-2 mt-2"></ul>
                    </div>

                    <div class="bg-slate-900 p-4 rounded border border-slate-700">
                        <h3 class="font-bold text-indigo-400 mb-2 uppercase text-xs tracking-wider flex justify-between">
                            <span>Labs / Procedures</span>
                            <span id="workup-tag" class="text-[10px] px-2 rounded bg-slate-800 border border-slate-600"></span>
                        </h3>
                        <div id="review-workup-container" class="space-y-2"></div>
                    </div>
                </div>

                <!-- Plan Col -->
                <div class="space-y-4">
                    <div class="bg-slate-900 p-4 rounded border border-slate-700">
                        <h3 class="font-bold text-indigo-400 mb-2 uppercase text-xs tracking-wider flex justify-between">
                            <span>Meds (Acute & Maintenance)</span>
                            <span id="meds-tag" class="text-[10px] px-2 rounded bg-slate-800 border border-slate-600"></span>
                        </h3>
                        <div id="review-treatment-container" class="space-y-2"></div>
                    </div>

                    <div class="bg-slate-900 p-4 rounded border border-slate-700">
                        <h3 class="font-bold text-indigo-400 mb-2 uppercase text-xs tracking-wider">Disposition & Profile</h3>
                        <div class="mb-3">
                            <label class="text-xs text-slate-500 block mb-1">Primary Recommendation</label>
                            <div id="review-disposition" class="text-white font-medium bg-slate-800 p-2 rounded border border-slate-600"></div>
                        </div>
                         <div id="review-profile-container" class="space-y-2"></div>
                         <div class="mt-3 flex items-center bg-slate-800 p-2 rounded">
                             <label class="text-xs text-slate-400 mr-2 font-bold uppercase">Profile Duration (Days)</label>
                             <input type="number" id="profile-days" class="w-20 bg-slate-700 border border-slate-600 text-white text-center text-sm p-1 rounded focus:border-indigo-500 outline-none">
                         </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button type="button" id="review-back-btn" class="flex-1 bg-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-600">Back</button>
                <button type="button" id="review-continue-btn" class="flex-1 bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-lg">Finalize Note</button>
            </div>
        </div>

        <!-- SECTION 4: FINAL NOTE -->
        <div id="section-final" class="hidden bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
            <h2 class="text-xl font-semibold mb-4 text-white border-b border-slate-700 pb-2">Consultation Note</h2>

            <!-- Refinement Box -->
            <div class="bg-slate-700 p-4 rounded-md mb-6 border border-slate-600">
                <label class="block text-xs font-bold text-indigo-300 mb-2 uppercase">Consultant Q&A (Refine the plan)</label>
                <div class="flex space-x-2">
                    <input type="text" id="refine-input" class="flex-1 p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g., 'Dosing for medication?' or 'Criteria for diagnosis?'">
                    <button type="button" id="refine-btn" class="bg-indigo-700 hover:bg-indigo-600 text-white px-4 rounded font-medium text-sm">Ask</button>
                </div>
                <div id="refine-response" class="hidden mt-3 p-3 bg-slate-800 rounded text-sm text-slate-300 border border-slate-600 italic"></div>
            </div>

            <!-- The Note -->
            <div class="bg-white text-black p-6 rounded-md shadow-inner max-h-[600px] overflow-y-auto note-preview font-mono text-sm leading-tight border-2 border-slate-500 mb-4 relative">
                <div class="absolute top-2 right-2 text-[10px] text-gray-400">GENERATED BY AI CONSULTANT</div>
                <pre id="final-note-content" class="whitespace-pre-wrap"></pre>
            </div>

            <button type="button" id="copy-note-btn" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg border border-slate-500 flex items-center justify-center mb-6">
                <i class="fa-regular fa-copy mr-2"></i> Copy to Clipboard
            </button>
            <p id="copy-success" class="hidden mt-2 text-center text-green-400 font-semibold text-sm">Copied to clipboard!</p>

            <!-- References -->
            <div id="references-container" class="bg-slate-900 p-4 rounded border border-slate-600 mb-8">
                <h3 class="text-indigo-400 font-bold mb-2 text-xs uppercase flex items-center">
                    <i class="fa-solid fa-book-medical mr-2"></i> Clinical Guidelines & Evidence
                </h3>
                <ul id="references-list" class="list-disc ml-5 text-sm space-y-2 text-slate-400"></ul>
            </div>

            <div class="mt-6 flex justify-center space-x-6">
                <button type="button" id="final-back-btn" class="text-slate-500 hover:text-white underline text-sm">
                    Back to Review
                </button>
                <button type="button" id="start-over-btn" class="text-slate-500 hover:text-white underline text-sm">
                    Start New Consult
                </button>
            </div>
        </div>

    </div>

    <script type="module">
        import {{ setupSharing }} from './js/sharing.js';

        // --- Global State ---
        const r1 = "AIzaSyBJMITlbJVxqH";
        const r2 = "masWlbcDebs8DkU";
        const r3 = "d0d0cA";
        const apiKey = r1 + r2 + r3;
        const jsonBinKey = "$2a$10$J/Gr0x7KT4o8YHMdHtRgV.MokfRSRnPPdXBI5jJidEiqrvJfbH5Py";

        let state = {{
            location: "",
            chiefComplaint: "",
            vitals: "",
            physicalExam: "",
            pmh: "",
            meds: "",
            labs: "",
            questions: [],
            answers: [],
            generatedPlan: null
        }};

        // --- DOM Elements ---
        const sections = {{
            intake: document.getElementById('section-intake'),
            questions: document.getElementById('section-questions'),
            review: document.getElementById('section-review'),
            final: document.getElementById('section-final')
        }};
        const loadingSpinner = document.getElementById('loading-spinner');
        const errorBoxes = {{
            intake: document.getElementById('error-message-intake'),
            questions: document.getElementById('error-message-questions'),
            review: document.getElementById('error-message-review')
        }};

        // --- Helpers ---
        function showLoading(isLoading, text = "Processing...") {{
            document.getElementById('loading-text').textContent = text;
            loadingSpinner.classList.toggle('hidden', !isLoading);
            if (isLoading) Object.values(sections).forEach(s => s.classList.add('hidden'));
        }}

        function showSection(name) {{
            showLoading(false);
            Object.keys(sections).forEach(key => sections[key].classList.toggle('hidden', key !== name));
            window.scrollTo(0, 0);
        }}

        function showError(section, msg) {{
            if(errorBoxes[section]) {{
                errorBoxes[section].textContent = msg;
                errorBoxes[section].classList.remove('hidden');
                errorBoxes[section].classList.add('active');
            }}
        }}

        function clearErrors() {{
            Object.values(errorBoxes).forEach(box => {{
                box.classList.add('hidden');
                box.classList.remove('active');
            }});
        }}

        // --- API Logic ---
        async function callGeminiApi(systemPrompt, userQuery, retries = 3) {{
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${{apiKey}}`;
            const payload = {{
                contents: [{{ parts: [{{ text: userQuery }}] }}],
                systemInstruction: {{ parts: [{{ text: systemPrompt }}] }},
                generationConfig: {{ responseMimeType: "application/json" }}
            }};

            try {{
                const response = await fetch(url, {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify(payload)
                }});
                if (!response.ok) throw new Error(`API Error: ${{response.status}}`);
                const data = await response.json();

                // ROBUST PARSING LOGIC:
                let textResponse = data.candidates[0].content.parts[0].text;
                // Remove markdown code blocks if the AI adds them
                textResponse = textResponse.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

                return JSON.parse(textResponse);

            }} catch (error) {{
                console.error("Gemini API Failure:", error);
                if (retries > 0) {{
                    await new Promise(r => setTimeout(r, 2000));
                    return callGeminiApi(systemPrompt, userQuery, retries - 1);
                }}
                throw error;
            }}
        }}

        async function callGeminiText(systemPrompt, userQuery) {{
             const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${{apiKey}}`;
             const payload = {{
                contents: [{{ parts: [{{ text: userQuery }}] }}],
                systemInstruction: {{ parts: [{{ text: systemPrompt }}] }}
            }};
            const response = await fetch(url, {{ method: 'POST', headers: {{'Content-Type': 'application/json'}}, body: JSON.stringify(payload)}});
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }}


        // --- Step 1: Intake Logic ---
        document.getElementById('example-1-btn').addEventListener('click', () => {{
            {EXAMPLE_1_JS}
        }});

        document.getElementById('example-2-btn').addEventListener('click', () => {{
            {EXAMPLE_2_JS}
        }});

        document.getElementById('intake-form').addEventListener('submit', async (e) => {{
            e.preventDefault();
            clearErrors();

            state.location = document.getElementById('location-input').value;
            state.chiefComplaint = document.getElementById('initial-symptoms').value.trim();
            state.vitals = document.getElementById('vitals-input').value;
            state.physicalExam = document.getElementById('pe-input').value;
            state.meds = document.getElementById('meds-input').value;
            state.labs = document.getElementById('prior-labs-input').value;
            state.pmh = document.getElementById('pmh-input').value;

            if(state.chiefComplaint.length < 5) return showError('intake', 'Please enter a valid clinical complaint.');

            showLoading(true, "Consulting AI...");

            const prompt = `
                You are an expert {PROMPT_ROLE}.
                Review the intake data.
                Generate 5-7 targeted, high-level diagnostic questions to differentiate diagnoses.

                FOCUS ON:
                {PROMPT_FOCUS}

                Return strictly JSON: {{ "questions": ["Question 1", "Question 2"...] }}
            `;

            const context = `
                Location: ${{state.location}}
                HPI/Complaint: ${{state.chiefComplaint}}
                Vitals: ${{state.vitals}}
                Exam: ${{state.physicalExam}}
                Meds: ${{state.meds}}
                Labs: ${{state.labs}}
                History: ${{state.pmh}}
            `;

            try {{
                const result = await callGeminiApi(prompt, context);
                const container = document.getElementById('questions-container');
                container.innerHTML = '';
                result.questions.forEach(q => {{
                    container.innerHTML += `
                        <div class="bg-slate-900 p-3 rounded border border-slate-700">
                            <label class="block text-sm text-indigo-300 mb-1 font-medium">${{q}}</label>
                            <input type="text" data-q="${{q}}" class="w-full p-2 border-b border-slate-600 bg-transparent text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Answer...">
                        </div>`;
                }});
                showSection('questions');
            }} catch (err) {{
                console.error(err);
                showError('intake', 'Consultation failed. Please check API Key.');
                showSection('intake');
            }}
        }});

        // --- Step 2: Generate Plan ---
        document.getElementById('questions-form').addEventListener('submit', async (e) => {{
            e.preventDefault();
            clearErrors();

            state.answers = [];
            document.querySelectorAll('#questions-container input').forEach(inp => {{
                state.answers.push({{ q: inp.dataset.q, a: inp.value }});
            }});

            showLoading(true, "Developing Plan...");

            // Context construction
            let contextData = `Location: ${{state.location}}\nHPI/CC: ${{state.chiefComplaint}}\n`;
            state.answers.forEach(item => contextData += `Q: ${{item.q}} A: ${{item.a}}\n`);
            contextData += `\nVitals: ${{state.vitals}}\nPE: ${{state.physicalExam}}\nPMH: ${{state.pmh}}\nMeds: ${{state.meds}}\nLabs/Imaging: ${{state.labs}}`;

            const systemPrompt = `
                You are a {PROMPT_ROLE} Consultant for a SMALL MILITARY COMMUNITY HOSPITAL.

                CONTEXT:
                {PLAN_CONTEXT}

                OUTPUT JSON SCHEMA:
                {{
                    "subjective": {{ "hpi_paragraph": "string", "ros_bullets": ["string"] }},
                    "assessment": {{
                        "synthesis_statement": "Comprehensive narrative combining the clinical summary with the specific PATHOPHYSIOLOGY.",
                        "ddx": [ {{ "name": "string", "icd10": "string", "desc": "string", "likelihood": "High/Med/Low" }} ]
                    }},
                    "plan": {{
                        "disposition": "string (e.g. Discharge home with Meds, Transfer to ER)",
                        "workup": ["string (Specific Labs/Imaging)"],
                        "treatment": ["string (Exact drug dosing)"],
                        "profile": {{
                            "days": number,
                            "limitations": ["string (e.g. No Rucking)"],
                            "instructions": ["string (e.g. Return if fever)"]
                        }}
                    }},
                    "references": [ {{ "title": "string", "url": "string" }} ]
                }}
            `;

            try {{
                const result = await callGeminiApi(systemPrompt, contextData);
                state.generatedPlan = result;
                renderReview(result);
                showSection('review');
            }} catch (err) {{
                console.error(err);
                showError('questions', 'Failed to generate plan.');
                showSection('questions');
            }}
        }});

        document.getElementById('questions-back-btn').addEventListener('click', () => showSection('intake'));

        // --- Step 3: Review & Render ---
        function renderReview(soap) {{
            // Dynamic Location Alert
            const alertBanner = document.getElementById('location-alert-banner');
            const workupTag = document.getElementById('workup-tag');
            const medsTag = document.getElementById('meds-tag');

            // Detect severity keywords
            const s = soap.plan.disposition.toLowerCase() + soap.assessment.synthesis_statement.toLowerCase();
            const isCritical = s.includes('septic') || s.includes('aspiration') || s.includes('washout') || s.includes('emergency') || s.includes('admit') || s.includes('icu');

            if(isCritical) {{
                 alertBanner.className = "mb-6 p-4 rounded-md flex items-start bg-red-900/40 border border-red-600 text-red-200";
                 alertBanner.innerHTML = `<i class="fa-solid fa-biohazard mt-1 mr-3 text-2xl animate-pulse"></i><div><strong>CRITICAL CONDITION / ADMISSION</strong><br><span class="text-sm">High acuity detected. Review disposition carefully.</span></div>`;
                 workupTag.textContent = "Urgent";
                 medsTag.textContent = "Acute";
            }} else {{
                alertBanner.className = "mb-6 p-4 rounded-md flex items-start bg-indigo-900/40 border border-indigo-600 text-indigo-200";
                alertBanner.innerHTML = `<i class="fa-solid fa-notes-medical mt-1 mr-3"></i><div><strong>Routine / Outpatient Management</strong><br><span class="text-sm">Standard protocol.</span></div>`;
                workupTag.textContent = "Routine";
                medsTag.textContent = "Maintenance/Flare";
            }}

            // Assessment
            document.getElementById('review-diagnosis').textContent = soap.assessment.synthesis_statement;

            document.getElementById('review-ddx-list').innerHTML = soap.assessment.ddx.map(d => `
                <li class="flex justify-between items-start border-b border-slate-800 pb-1">
                    <span><span class="text-indigo-400 font-bold">${{d.name}}</span> <span class="text-slate-600 text-xs">[${{d.icd10}}]</span></span>
                    <span class="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">${{d.likelihood}}</span>
                </li>`).join('');

            // Checkboxes Helper
            const createCheckboxes = (id, items, cat) => {{
                const el = document.getElementById(id);
                el.innerHTML = items.map(i => `
                    <label class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group">
                        <input type="checkbox" checked class="mt-1 form-checkbox text-indigo-600 rounded bg-slate-700 border-slate-500 focus:ring-indigo-500 item-check" data-cat="${{cat}}" data-val="${{i}}">
                        <span class="text-sm text-slate-300 group-hover:text-white transition-colors">${{i}}</span>
                    </label>
                `).join('');
            }};

            createCheckboxes('review-workup-container', soap.plan.workup, 'workup');
            createCheckboxes('review-treatment-container', soap.plan.treatment, 'treatment');
            createCheckboxes('review-profile-container', soap.plan.profile.limitations, 'profile');

            document.getElementById('review-disposition').textContent = soap.plan.disposition;
            document.getElementById('profile-days').value = soap.plan.profile.days;
        }}

        document.getElementById('review-continue-btn').addEventListener('click', () => {{
            renderFinalNote();
            showSection('final');
        }});
        document.getElementById('review-back-btn').addEventListener('click', () => showSection('questions'));

        // --- Step 4: Final Note ---
        function renderFinalNote() {{
            const soap = state.generatedPlan;
            const getChecked = (cat) => Array.from(document.querySelectorAll(`.item-check[data-cat="${{cat}}"]:checked`)).map(c => c.dataset.val);

            const selWorkup = getChecked('workup');
            const selTx = getChecked('treatment');
            const selProf = getChecked('profile');
            const days = document.getElementById('profile-days').value;

            const now = new Date();
            const timeString = now.toLocaleDateString() + " " + now.toLocaleTimeString();

            let note = `CONSULTATION NOTE\n`;
            note += `Date/Time: ${{timeString}}\n`;
            note += `Location: ${{state.location}} (Mil-Comm Hospital)\n`;
            note += `----------------------------------------\n\n`;

            note += `SUBJECTIVE:\n`;
            note += `${{soap.subjective.hpi_paragraph}}\n\n`;
            note += `Focused History / ROS:\n`;
            soap.subjective.ros_bullets.forEach(b => note += `- ${{b}}\n`);

            note += `\nOBJECTIVE:\n`;
            note += `Vitals: ${{state.vitals || "--"}}\n`;
            note += `Physical Exam: ${{state.physicalExam || "--"}}\n`;
            note += `Meds: ${{state.meds || "--"}}\n`;
            note += `Relevant Labs: ${{state.labs || "--"}}\n`;

            note += `\nASSESSMENT & SYNTHESIS:\n`;
            note += `${{soap.assessment.synthesis_statement}}\n\n`;

            note += `Differential Diagnosis:\n`;
            soap.assessment.ddx.forEach(d => note += `- ${{d.name}} [${{d.icd10}}] (${{d.likelihood}})\n`);

            note += `\nPLAN:\n`;
            note += `Disposition: ${{soap.plan.disposition}}\n\n`;

            note += `Labs & Workup:\n`;
            if(selWorkup.length) selWorkup.forEach(i => note += `• ${{i}}\n`);
            else note += `(None selected)\n`;

            note += `\nPharmacology & Management:\n`;
            if(selTx.length) selTx.forEach(i => note += `• ${{i}}\n`);
            else note += `(None selected)\n`;

            note += `\nDuty Limitations / Profile (${{days}} days):\n`;
            if(selProf.length) selProf.forEach(i => note += `- ${{i}}\n`);

            note += `\nPatient Instructions / Return Precautions:\n`;
            soap.plan.profile.instructions.forEach(i => note += `- ${{i}}\n`);

            document.getElementById('final-note-content').textContent = note;

            // Refs
            const refList = document.getElementById('references-list');
            refList.innerHTML = '';
            if(soap.references && soap.references.length) {{
                soap.references.forEach(r => {{
                    refList.innerHTML += `<li><a href="${{r.url}}" target="_blank" class="text-indigo-400 hover:underline">${{r.title}}</a></li>`;
                }});
                document.getElementById('references-container').classList.remove('hidden');
            }} else {{
                document.getElementById('references-container').classList.add('hidden');
            }}
        }}

        // Refinement Chat
        document.getElementById('refine-btn').addEventListener('click', async () => {{
            const q = document.getElementById('refine-input').value;
            const box = document.getElementById('refine-response');
            if(!q) return;

            box.classList.remove('hidden');
            box.textContent = "Consulting Guidelines...";

            const sys = "You are a concise Specialist. Answer the specific question based on the context of the current patient.";
            const ctx = `Patient Context: ${{state.chiefComplaint}}. Plan: ${{JSON.stringify(state.generatedPlan.plan)}}. Question: ${{q}}`;

            try {{
                const ans = await callGeminiText(sys, ctx);
                box.textContent = `Consultant: ${{ans}}`;
            }} catch(e) {{
                box.textContent = "Connection error.";
            }}
        }});

        // Copy
        document.getElementById('copy-note-btn').addEventListener('click', () => {{
            const text = document.getElementById('final-note-content').textContent;
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {{
                document.execCommand('copy');
                const succ = document.getElementById('copy-success');
                succ.classList.remove('hidden');
                setTimeout(() => succ.classList.add('hidden'), 2000);
            }} catch (err) {{ console.error('Copy failed', err); }}
            document.body.removeChild(textArea);
        }});

        document.getElementById('final-back-btn').addEventListener('click', () => showSection('review'));
        document.getElementById('start-over-btn').addEventListener('click', () => location.reload());

        // --- Sharing Setup ---
        function getPlanModifications() {{
            return {{
                workup: Array.from(document.querySelectorAll('.item-check[data-cat="workup"]:checked')).map(cb => cb.dataset.val),
                treatment: Array.from(document.querySelectorAll('.item-check[data-cat="treatment"]:checked')).map(cb => cb.dataset.val),
                profile: Array.from(document.querySelectorAll('.item-check[data-cat="profile"]:checked')).map(cb => cb.dataset.val),
                days: document.getElementById('profile-days').value
            }};
        }}

        setupSharing({{
            apiKey: jsonBinKey,
            getState: () => {{
                state.location = document.getElementById('location-input').value;
                state.chiefComplaint = document.getElementById('initial-symptoms').value;
                state.vitals = document.getElementById('vitals-input').value;
                state.physicalExam = document.getElementById('pe-input').value;
                state.meds = document.getElementById('meds-input').value;
                state.labs = document.getElementById('prior-labs-input').value;
                state.pmh = document.getElementById('pmh-input').value;

                const qInputs = document.querySelectorAll('#questions-container input');
                if (qInputs.length > 0) {{
                    state.answers = [];
                    qInputs.forEach(inp => {{
                        state.answers.push({{ q: inp.dataset.q, a: inp.value }});
                    }});
                }}

                return {{
                    appState: state,
                    planModifications: getPlanModifications(),
                    currentSection: !document.getElementById('section-final').classList.contains('hidden') ? 'final' :
                                    !document.getElementById('section-review').classList.contains('hidden') ? 'review' :
                                    !document.getElementById('section-questions').classList.contains('hidden') ? 'questions' : 'intake',
                    finalNoteContent: document.getElementById('final-note-content').textContent,
                    refineHistory: document.getElementById('refine-response').textContent
                }};
            }},
            restoreState: (saved) => {{
                if(saved.appState) Object.assign(state, saved.appState);

                document.getElementById('location-input').value = state.location || "Outpatient Clinic";
                document.getElementById('initial-symptoms').value = state.chiefComplaint || "";
                document.getElementById('vitals-input').value = state.vitals || "";
                document.getElementById('pe-input').value = state.physicalExam || "";
                document.getElementById('meds-input').value = state.meds || "";
                document.getElementById('prior-labs-input').value = state.labs || "";
                document.getElementById('pmh-input').value = state.pmh || "";

                if (state.questions && state.questions.length > 0) {{
                    const container = document.getElementById('questions-container');
                    container.innerHTML = '';
                    state.questions.forEach(q => {{
                        const ans = state.answers ? state.answers.find(a => a.q === q) : null;
                        const val = ans ? ans.a : "";
                        container.innerHTML += `
                            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                                <label class="block text-sm text-indigo-300 mb-1 font-medium">${{q}}</label>
                                <input type="text" data-q="${{q}}" value="${{val}}" class="w-full p-2 border-b border-slate-600 bg-transparent text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Answer...">
                            </div>`;
                    }});
                }}

                if (state.generatedPlan) {{
                    renderReview(state.generatedPlan);

                    if (saved.planModifications) {{
                        const mods = saved.planModifications;
                        document.getElementById('profile-days').value = mods.days || "";

                        const applyChecks = (cat, items) => {{
                            if (!items) return;
                            document.querySelectorAll(`.item-check[data-cat="${{cat}}"]`).forEach(cb => {{
                                cb.checked = items.includes(cb.dataset.val);
                            }});
                        }};
                        applyChecks('workup', mods.workup);
                        applyChecks('treatment', mods.treatment);
                        applyChecks('profile', mods.profile);
                    }}
                }}

                if (saved.finalNoteContent) {{
                    document.getElementById('final-note-content').textContent = saved.finalNoteContent;
                }}
                if (saved.refineHistory) {{
                    document.getElementById('refine-response').textContent = saved.refineHistory;
                    document.getElementById('refine-response').classList.remove('hidden');
                }}

                showSection(saved.currentSection || 'intake');
            }}
        }});

        // Init
        if (!new URLSearchParams(window.location.search).get('id')) {{
            showSection('intake');
        }}
    </script>
</body>
</html>
"""

files_data = [
    {
        "filename": "urology.html",
        "title": "AI UROLOGY CONSULTANT",
        "icon": "fa-solid fa-droplet",
        "subtitle": "Small Military Community Hospital (Stones, Retention, Infection)",
        "ros_placeholder": "LUTS (Frequency/Urgency/Nocturia), Hematuria, Dysuria, Flank Pain...",
        "example_1_btn": "Load Kidney Stone",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "45M. Sudden onset L flank pain radiating to groin. Nausea. Hematuria.";
            document.getElementById('vitals-input').value = "BP 140/90, HR 100, Temp 98.7";
            document.getElementById('pe-input').value = "L CVA tenderness. Abdomen soft.";
            document.getElementById('prior-labs-input').value = "UA: +Blood, +Trace protein. CT KUB pending.";
            document.getElementById('pmh-input').value = "Hx of stones.";""",
        "example_2_btn": "Load Urinary Retention",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "72M. Unable to void x 12 hours. Lower abdominal pain.";
            document.getElementById('vitals-input').value = "BP 160/90, HR 88, Temp 98.6";
            document.getElementById('pe-input').value = "Distended bladder. Enlarged prostate on DRE.";
            document.getElementById('prior-labs-input').value = "Cr 1.4 (baseline 1.1).";
            document.getElementById('pmh-input').value = "BPH.";""",
        "prompt_role": "Board-Certified Urologist",
        "prompt_focus": "1. Urgency (Obstructing stone, Retention). 2. Infection (Septic stone?). 3. Malignancy (Painless hematuria).",
        "plan_context": "1. Stones: Tamsulosin if <10mm, Admit if septic/AKI. 2. Retention: Foley, Alpha-blockers. 3. Infection: Cipro/Bactrim (check resistance)."
    },
    {
        "filename": "pulmonary.html",
        "title": "AI PULMONARY CONSULTANT",
        "icon": "fa-solid fa-lungs",
        "subtitle": "Small Military Community Hospital (COPD, Asthma, Pneumonia, PE)",
        "ros_placeholder": "Cough, Sputum, Dyspnea, Wheezing, Hemoptysis, Pleuritic Pain...",
        "example_1_btn": "Load COPD Exacerbation",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "65M smoker. 3 days increased SOB and green sputum. Wheezing.";
            document.getElementById('vitals-input').value = "SpO2 88% RA, RR 24, Temp 99.1";
            document.getElementById('pe-input').value = "Diffuse wheezes, prolonged expiration. Use of accessory muscles.";
            document.getElementById('prior-labs-input').value = "CXR: Hyperinflation. ABG pending.";
            document.getElementById('pmh-input').value = "COPD Gold III, HTN.";""",
        "example_2_btn": "Load Pneumonia",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "22M. High fever, shaking chills, R sided chest pain x 2 days.";
            document.getElementById('vitals-input').value = "Temp 103F, HR 110, BP 110/70, SpO2 94%";
            document.getElementById('pe-input').value = "Bronchial breath sounds RLL. Dullness to percussion.";
            document.getElementById('prior-labs-input').value = "WBC 18k. CXR: RLL consolidation.";
            document.getElementById('pmh-input').value = "None.";""",
        "prompt_role": "Board-Certified Pulmonologist",
        "prompt_focus": "1. Severity (Hypoxia, Work of breathing). 2. Etiology (Infectious vs Obstructive vs Vascular). 3. Risk Stratification (PSI/CURB-65 for PNA).",
        "plan_context": "1. COPD: Steroids, Nebs, Abx if purulence. 2. Asthma: Steroids, Nebs. 3. PNA: Community Acquired guidelines (Azithro/Ceftriaxone)."
    },
    {
        "filename": "endocrinology.html",
        "title": "AI ENDOCRINOLOGY CONSULTANT",
        "icon": "fa-solid fa-dna",
        "subtitle": "Small Military Community Hospital (Diabetes, Thyroid, Adrenal)",
        "ros_placeholder": "Polyuria/Polydipsia, Weight change, Heat/Cold intolerance, Tremors, Palpitations...",
        "example_1_btn": "Load New Diabetes",
        "example_1_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "45F. Fatigue, thirst, frequent urination x 2 months. Wt loss 10lbs.";
            document.getElementById('vitals-input').value = "BP 130/80, BMI 32";
            document.getElementById('pe-input').value = "Acanthosis nigricans. Sensation intact.";
            document.getElementById('prior-labs-input').value = "Random Glucose 280. A1c pending.";
            document.getElementById('pmh-input').value = "Obesity, HTN.";""",
        "example_2_btn": "Load Thyroid Storm",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "30F. Palpitations, high fever, confusion. Stopped taking methimazole.";
            document.getElementById('vitals-input').value = "HR 140 (Afib), Temp 102F, BP 150/60";
            document.getElementById('pe-input').value = "Goiter, Exophthalmos, Tremor, Hyperreflexia.";
            document.getElementById('prior-labs-input').value = "TSH <0.01, Free T4 High.";
            document.getElementById('pmh-input').value = "Graves Disease.";""",
        "prompt_role": "Board-Certified Endocrinologist",
        "prompt_focus": "1. Urgency (DKA/HHS/Storm). 2. Etiology (Type 1 vs 2, Autoimmune). 3. End Organ Damage.",
        "plan_context": "1. Diabetes: Metformin, Insulin if symptomatic/A1c>10. 2. Thyroid: Levothyroxine for hypo, Methimazole/PTU for hyper."
    },
    {
        "filename": "gastroenterology.html",
        "title": "AI GASTROENTEROLOGY CONSULTANT",
        "icon": "fa-solid fa-utensils",
        "subtitle": "Small Military Community Hospital (GI Bleed, Liver, IBD, Pancreas)",
        "ros_placeholder": "Nausea/Vomiting, Hematemesis, Melena, Diarrhea, Abdominal Pain, Jaundice...",
        "example_1_btn": "Load Upper GI Bleed",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "55M. Vomiting bright red blood x 2. Hx of alcohol use.";
            document.getElementById('vitals-input').value = "BP 90/60, HR 115";
            document.getElementById('pe-input').value = "Pale. Epigastric tenderness. Rectal: Melena.";
            document.getElementById('prior-labs-input').value = "Hgb 8.2. INR 1.4.";
            document.getElementById('pmh-input').value = "Alcohol use disorder, Cirrhosis.";""",
        "example_2_btn": "Load Acute Pancreatitis",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "40F. Severe epigastric pain radiating to back. Nausea/Vomiting.";
            document.getElementById('vitals-input').value = "HR 100, BP 130/80";
            document.getElementById('pe-input').value = "Epigastric tenderness. No rebound.";
            document.getElementById('prior-labs-input').value = "Lipase >3000. Liver enzymes normal.";
            document.getElementById('pmh-input').value = "Gallstones.";""",
        "prompt_role": "Board-Certified Gastroenterologist",
        "prompt_focus": "1. Hemodynamic Stability (Bleed). 2. Severity (Pancreatitis scores). 3. Infection (Cholangitis).",
        "plan_context": "1. UGI Bleed: PPI drip, Octreotide (if varices), Scope within 24h. 2. Pancreatitis: Aggressive IV fluids, Pain control, NPO."
    },
    {
        "filename": "ent.html",
        "title": "AI ENT CONSULTANT",
        "icon": "fa-solid fa-ear-listen",
        "subtitle": "Small Military Community Hospital (Ear, Nose, Throat, Head & Neck)",
        "ros_placeholder": "Otalgia, Hearing Loss, Epistaxis, Sore Throat, Hoarseness, Vertigo...",
        "example_1_btn": "Load Peritonsillar Abscess",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "24M. Severe sore throat L side, difficulty opening mouth (trismus), 'hot potato' voice.";
            document.getElementById('vitals-input').value = "Temp 101F, HR 100";
            document.getElementById('pe-input').value = "Uvula deviated to R. Bulging L soft palate. Trismus present.";
            document.getElementById('prior-labs-input').value = "WBC 16k. CT Neck: 2cm fluid collection.";
            document.getElementById('pmh-input').value = "Recurrent tonsillitis.";""",
        "example_2_btn": "Load Vertigo",
        "example_2_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "50F. Room spinning when turning over in bed. Lasts 30 seconds. Nausea.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "Dix-Hallpike: +Rotary nystagmus. Ear exam normal.";
            document.getElementById('prior-labs-input').value = "None.";
            document.getElementById('pmh-input').value = "None.";""",
        "prompt_role": "Board-Certified Otolaryngologist",
        "prompt_focus": "1. Airway Compromise (Epiglottitis/Abscess). 2. Infection vs Structural. 3. Neural (Hearing loss/Vertigo).",
        "plan_context": "1. Abscess: Needle aspiration vs I&D, Abx, Steroids. 2. Vertigo: Epley maneuver for BPPV. 3. Otitis: Topical vs Systemic Abx."
    },
    {
        "filename": "general_surgery.html",
        "title": "AI GENERAL SURGERY CONSULTANT",
        "icon": "fa-solid fa-scalpel",
        "subtitle": "Small Military Community Hospital (Acute Abdomen, Hernia, Trauma)",
        "ros_placeholder": "Abdominal pain, Nausea/Vomiting, Change in bowel habits, Fevers...",
        "example_1_btn": "Load Appendicitis",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "19M. Periumbilical pain moved to RLQ. Anorexia, Nausea.";
            document.getElementById('vitals-input').value = "Temp 100.4, HR 90";
            document.getElementById('pe-input').value = "RLQ tenderness at McBurney's point. +Rovsing.";
            document.getElementById('prior-labs-input').value = "WBC 14k. CT: Dilated appendix 9mm, fat stranding.";
            document.getElementById('pmh-input').value = "None.";""",
        "example_2_btn": "Load SBO",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "60F. Abdominal distension, bilious vomiting, no flatus x 24h.";
            document.getElementById('vitals-input').value = "HR 105, BP 110/70";
            document.getElementById('pe-input').value = "Distended, tympanic. Surgical scar midline.";
            document.getElementById('prior-labs-input').value = "Lactate 1.8. CT: Dilated loops, transition point.";
            document.getElementById('pmh-input').value = "Hysterectomy 2010.";""",
        "prompt_role": "Board-Certified General Surgeon",
        "prompt_focus": "1. Surgical Urgency (Acute Abdomen?). 2. Hemodynamic Stability. 3. Conservative vs Operative management.",
        "plan_context": "1. Appendicitis: NPO, Abx, Lap Appy. 2. SBO: NGT decompression, IVF, serial exams. 3. Cholecystitis: NPO, Abx, Lap Chole."
    },
    {
        "filename": "hematology_oncology.html",
        "title": "AI HEME/ONC CONSULTANT",
        "icon": "fa-solid fa-disease",
        "subtitle": "Small Military Community Hospital (Anemia, Coagulopathy, Cancer)",
        "ros_placeholder": "Fatigue, Easy bruising/bleeding, Weight loss, Night sweats, Lumps/Bumps...",
        "example_1_btn": "Load Anemia",
        "example_1_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "30F. Progressive fatigue, dyspnea on exertion. Heavy menses.";
            document.getElementById('vitals-input').value = "HR 90, BP 110/60";
            document.getElementById('pe-input').value = "Pale conjunctiva. Tachycardic. No hepatosplenomegaly.";
            document.getElementById('prior-labs-input').value = "Hgb 7.1, MCV 72, Ferritin 4.";
            document.getElementById('pmh-input').value = "Menorrhagia.";""",
        "example_2_btn": "Load DVT/PE",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "45M. L calf swelling and pain after long flight.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "L calf 3cm > R. Erythematous, tender.";
            document.getElementById('prior-labs-input').value = "US: Occlusive DVT popliteal vein.";
            document.getElementById('pmh-input').value = "None.";""",
        "prompt_role": "Board-Certified Hematologist/Oncologist",
        "prompt_focus": "1. Malignancy Risk (Red flags). 2. Bleeding/Clotting Risk. 3. Urgency (Transfusion? Anticoagulation?).",
        "plan_context": "1. Iron Deficiency: Oral iron vs IV iron. 2. DVT: DOAC (Eliquis/Xarelto) vs Warfarin. 3. Pancytopenia: Urgent heme referral/bone marrow biopsy."
    },
    {
        "filename": "hepatology.html",
        "title": "AI HEPATOLOGY CONSULTANT",
        "icon": "fa-solid fa-flask",
        "subtitle": "Small Military Community Hospital (Liver Disease, Cirrhosis, Hepatitis)",
        "ros_placeholder": "Jaundice, Abdominal distension, Confusion, Pruritus...",
        "example_1_btn": "Load Alcohol Hepatitis",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "45M. Heavy alcohol use. Yellow eyes, RUQ pain, fever.";
            document.getElementById('vitals-input').value = "Temp 100.5, HR 100";
            document.getElementById('pe-input').value = "Jaundiced. Tender hepatomegaly. Ascites present.";
            document.getElementById('prior-labs-input').value = "AST 300, ALT 120 (2:1 ratio). Bili 8. INR 1.5.";
            document.getElementById('pmh-input').value = "Alcohol Use Disorder.";""",
        "example_2_btn": "Load Cirrhosis/Ascites",
        "example_2_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "60M with known cirrhosis. Worsening abdominal swelling and leg edema.";
            document.getElementById('vitals-input').value = "BP 100/60";
            document.getElementById('pe-input').value = "Distended abdomen, fluid wave +. 2+ pitting edema.";
            document.getElementById('prior-labs-input').value = "Albumin 2.5. Na 130.";
            document.getElementById('pmh-input').value = "Cirrhosis (Hep C).";""",
        "prompt_role": "Board-Certified Hepatologist",
        "prompt_focus": "1. Liver Function (Synthetic function: INR, Albumin, Bili). 2. Complications (Ascites, Encephalopathy, Varices). 3. Etiology (Alcohol, Viral, Autoimmune).",
        "plan_context": "1. Alcoholic Hep: Prednisolone (Maddrey score). 2. Ascites: Spironolactone/Lasix, Salt restriction. 3. Encephalopathy: Lactulose/Rifaximin."
    },
    {
        "filename": "infectious_disease.html",
        "title": "AI INFECTIOUS DISEASE CONSULTANT",
        "icon": "fa-solid fa-virus",
        "subtitle": "Small Military Community Hospital (Sepsis, STI, Tropical, Wound)",
        "ros_placeholder": "Fevers, Chills, Sweats, Exposures (Travel, Animals, Vectors)...",
        "example_1_btn": "Load Cellulitis",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "35M. Red, hot, swollen R lower leg x 3 days. Spreading up leg.";
            document.getElementById('vitals-input').value = "Temp 101, HR 90";
            document.getElementById('pe-input').value = "Erythema R leg, indistinct borders, no fluctuance. Tinea pedis noted.";
            document.getElementById('prior-labs-input').value = "WBC 12k. Lactate 1.0.";
            document.getElementById('pmh-input').value = "Diabetes.";""",
        "example_2_btn": "Load Malaria",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "24M. Just returned from deployment to Africa. Cycling high fevers, chills.";
            document.getElementById('vitals-input').value = "Temp 104F, HR 120";
            document.getElementById('pe-input').value = "Diaphoretic. Splenomegaly.";
            document.getElementById('prior-labs-input').value = "Smear: Plasmodium falciparum positive.";
            document.getElementById('pmh-input').value = "Incomplete prophylaxis.";""",
        "prompt_role": "Board-Certified Infectious Disease Specialist",
        "prompt_focus": "1. Host Factors (Immunocompetent?). 2. Exposure History. 3. Source Control (Abscess?). 4. Antimicrobial Stewardship.",
        "plan_context": "1. SSTI: Keflex/Bactrim (MRSA coverage). 2. Sepsis: Broad spectrum (Vanc/Zosyn) then de-escalate. 3. Travel: Check CDC Yellow Book."
    },
    {
        "filename": "nephrology.html",
        "title": "AI NEPHROLOGY CONSULTANT",
        "icon": "fa-solid fa-filter",
        "subtitle": "Small Military Community Hospital (AKI, CKD, Electrolytes)",
        "ros_placeholder": "Urine output changes, Edema, Hematuria, Foamy urine...",
        "example_1_btn": "Load AKI",
        "example_1_js": """document.getElementById('location-input').value = "Inpatient";
            document.getElementById('initial-symptoms').value = "70M. Post-op Day 2. Creatinine rose from 1.0 to 2.5. Oliguria.";
            document.getElementById('vitals-input').value = "BP 90/60";
            document.getElementById('pe-input').value = "Dry mucous membranes. Poor turgor.";
            document.getElementById('prior-labs-input').value = "FeNa < 1%. UA: Hyaline casts.";
            document.getElementById('pmh-input').value = "HTN.";""",
        "example_2_btn": "Load Hyponatremia",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "45F. Confusion, lethargy. New seizures.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "Euvolemic appearance.";
            document.getElementById('prior-labs-input').value = "Na 115. Urine Osm High. Serum Osm Low.";
            document.getElementById('pmh-input').value = "Taking HCTZ and SSRI.";""",
        "prompt_role": "Board-Certified Nephrologist",
        "prompt_focus": "1. AKI Prerenal/Intra/Post. 2. Electrolyte correction speed. 3. Dialysis Indications (AEIOU).",
        "plan_context": "1. Prerenal AKI: IV Fluids. 2. Hyponatremia: Fluid restriction vs Hypertonic saline (if severe sx). 3. CKD: BP control, Proteinuria management."
    },
    {
        "filename": "neurosurgery.html",
        "title": "AI NEUROSURGERY CONSULTANT",
        "icon": "fa-solid fa-brain",
        "subtitle": "Small Military Community Hospital (Spine, Trauma, Cranial)",
        "ros_placeholder": "Back pain, Radiculopathy, Weakness, Numbness, Headaches, Trauma...",
        "example_1_btn": "Load Lumbar Herniation",
        "example_1_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "35M. Sudden L leg pain radiating to foot. Foot drop.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "L dorsiflexion 3/5. +Straight Leg Raise L.";
            document.getElementById('prior-labs-input').value = "MRI: L4-L5 herniation compressing L5 root.";
            document.getElementById('pmh-input').value = "None.";""",
        "example_2_btn": "Load Subdural",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "80F. Fall 2 weeks ago. Progressive confusion and R sided weakness.";
            document.getElementById('vitals-input').value = "BP 160/90";
            document.getElementById('pe-input').value = "Drifts R arm. Disoriented.";
            document.getElementById('prior-labs-input').value = "CT Head: Chronic SDH with midline shift.";
            document.getElementById('pmh-input').value = "On Warfarin.";""",
        "prompt_role": "Board-Certified Neurosurgeon",
        "prompt_focus": "1. Surgical Emergency (Cauda Equina, Herniation). 2. Neuro Deficits. 3. Conservative vs Surgical.",
        "plan_context": "1. Cauda Equina: STAT Surgery. 2. Radiculopathy: PT/Meds x 6 weeks unless motor deficit. 3. SDH: Reverse anticoagulation, Evacuation if symptomatic."
    },
    {
        "filename": "obgyn.html",
        "title": "AI OB/GYN CONSULTANT",
        "icon": "fa-solid fa-person-pregnant",
        "subtitle": "Small Military Community Hospital (Women's Health, Pregnancy, GYN)",
        "ros_placeholder": "Vaginal bleeding, Discharge, Pelvic pain, LMP, Pregnancy...",
        "example_1_btn": "Load Ectopic",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "25F. Sharp RLQ pain and spotting. LMP 6 weeks ago.";
            document.getElementById('vitals-input').value = "BP 100/60, HR 100";
            document.getElementById('pe-input').value = "RLQ tenderness. Adnexal tenderness R.";
            document.getElementById('prior-labs-input').value = "bHCG 1500. US: Empty uterus, free fluid.";
            document.getElementById('pmh-input').value = "Prior PID.";""",
        "example_2_btn": "Load PID",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "20F. Lower abdominal pain, fever, new discharge.";
            document.getElementById('vitals-input').value = "Temp 101F";
            document.getElementById('pe-input').value = "Cervical Motion Tenderness (CMT) positive.";
            document.getElementById('prior-labs-input').value = "Wet prep: WBCs. GC/Chlam pending.";
            document.getElementById('pmh-input').value = "New partner.";""",
        "prompt_role": "Board-Certified OB/GYN",
        "prompt_focus": "1. Pregnancy Status (Rule out Ectopic). 2. Surgical Abdomen (Ovarian Torsion). 3. Infection.",
        "plan_context": "1. Ectopic: Methotrexate vs Surgery. 2. PID: Ceftriaxone/Doxy/Flagyl. 3. Torsion: Urgent Laparoscopy."
    },
    {
        "filename": "occupational_therapy.html",
        "title": "AI OCCUPATIONAL THERAPY",
        "icon": "fa-solid fa-hands-holding",
        "subtitle": "Small Military Community Hospital (ADLs, Hands, Upper Extremity)",
        "ros_placeholder": "Hand function, ADL difficulty, Ergonomics, Splinting needs...",
        "example_1_btn": "Load Carpal Tunnel",
        "example_1_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "40F. Numbness/tingling in thumb/index finger. Worse at night. Drops objects.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "+Phalen's, +Tinel's. Weak thumb abduction.";
            document.getElementById('prior-labs-input').value = "None.";
            document.getElementById('pmh-input').value = "Office work.";""",
        "example_2_btn": "Load Stroke Rehab",
        "example_2_js": """document.getElementById('location-input').value = "Inpatient";
            document.getElementById('initial-symptoms').value = "65M. R MCA Stroke. L upper extremity weakness and neglect.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "L arm flaccid. Neglects L side of tray.";
            document.getElementById('prior-labs-input').value = "MRI: R MCA infarct.";
            document.getElementById('pmh-input').value = "HTN, DM.";""",
        "prompt_role": "Occupational Therapist / Hand Therapist",
        "prompt_focus": "1. Functional Goals (ADLs). 2. Splinting/Adaptive Equipment. 3. Motor recovery/Sensory re-education.",
        "plan_context": "1. CTS: Wrist splint (neutral), Gliding exercises. 2. Stroke: ADL training, Neuro re-ed, Adaptive devices."
    },
    {
        "filename": "pharmacology.html",
        "title": "AI CLINICAL PHARMACOLOGY",
        "icon": "fa-solid fa-pills",
        "subtitle": "Small Military Community Hospital (Dosing, Interactions, Toxicology)",
        "ros_placeholder": "Current meds, Adverse effects, Dosing questions, Interaction check...",
        "example_1_btn": "Load Vanc Dosing",
        "example_1_js": """document.getElementById('location-input').value = "Inpatient";
            document.getElementById('initial-symptoms').value = "Need Vancomycin dosing for MRSA pneumonia. 70kg Male. CrCl 45.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "n/a";
            document.getElementById('prior-labs-input').value = "Cr 1.6. Wt 70kg.";
            document.getElementById('pmh-input').value = "CKD.";""",
        "example_2_btn": "Load Polypharmacy",
        "example_2_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "80F. Falls. Review meds.";
            document.getElementById('vitals-input').value = "Orthostatic hypotension";
            document.getElementById('pe-input').value = "n/a";
            document.getElementById('prior-labs-input').value = "n/a";
            document.getElementById('pmh-input').value = "Taking: Benadryl, Ambien, Oxycodone, Lisinopril, Lasix.";""",
        "prompt_role": "Clinical Pharmacist",
        "prompt_focus": "1. Safety (Renal/Hepatic dosing). 2. Interactions (CYP450). 3. BEERS criteria (Geriatrics).",
        "plan_context": "1. Vanc: Load 20-25mg/kg, Maint 15mg/kg based on renal fx. 2. Geriatrics: De-prescribe anticholinergics/sedatives."
    },
    {
        "filename": "physical_therapy.html",
        "title": "AI PHYSICAL THERAPY",
        "icon": "fa-solid fa-walking",
        "subtitle": "Small Military Community Hospital (MSK, Gait, Rehab)",
        "ros_placeholder": "Pain, Range of Motion, Strength, Gait, Functional limitations...",
        "example_1_btn": "Load Low Back Pain",
        "example_1_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "25M. Acute low back pain after lifting. No radiation.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "Paraspinal tenderness. ROM limited by pain. Neuro intact.";
            document.getElementById('prior-labs-input').value = "Xray negative.";
            document.getElementById('pmh-input').value = "None.";""",
        "example_2_btn": "Load Knee Injury",
        "example_2_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "19F. Knee pop while playing soccer. Swelling.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "+Lachman, +Anterior Drawer. Effusion.";
            document.getElementById('prior-labs-input').value = "MRI Pending.";
            document.getElementById('pmh-input').value = "None.";""",
        "prompt_role": "Doctor of Physical Therapy",
        "prompt_focus": "1. Functional Impairment. 2. Mechanical Diagnosis. 3. Exercise Prescription.",
        "plan_context": "1. LBP: McKenzie exercises, Core stabilization, Avoid bed rest. 2. ACL: Pre-hab, ROM restoration, Quad strengthening."
    },
    {
        "filename": "pmr.html",
        "title": "AI PM&R CONSULTANT",
        "icon": "fa-solid fa-wheelchair",
        "subtitle": "Small Military Community Hospital (Rehab, TBI, Pain, MSK)",
        "ros_placeholder": "Pain, Spasticity, Mobility, Cognitive function, Prosthetics...",
        "example_1_btn": "Load TBI/Concussion",
        "example_1_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "22M. Blast exposure 2 weeks ago. Headaches, dizziness, memory issues.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "Balance deficits. Photophobia.";
            document.getElementById('prior-labs-input').value = "CT Head negative.";
            document.getElementById('pmh-input').value = "Mild TBI.";""",
        "example_2_btn": "Load Amputee",
        "example_2_js": """document.getElementById('location-input').value = "Clinic";
            document.getElementById('initial-symptoms').value = "Phantom limb pain R AKA. Prosthetic fit issues.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "Residual limb well healed. TTP at distal end.";
            document.getElementById('prior-labs-input').value = "n/a";
            document.getElementById('pmh-input').value = "Traumatic amputation.";""",
        "prompt_role": "Board-Certified PM&R Physician",
        "prompt_focus": "1. Function/Quality of Life. 2. Multimodal Pain Mgmt. 3. Rehab Goals.",
        "plan_context": "1. TBI: Gradual return to duty, Vestibular rehab, Sleep hygiene. 2. Phantom Pain: Mirror therapy, Gabapentin."
    },
    {
        "filename": "radiology.html",
        "title": "AI RADIOLOGY CONSULTANT",
        "icon": "fa-solid fa-x-ray",
        "subtitle": "Small Military Community Hospital (Ordering Guidance, Interpretation Help)",
        "ros_placeholder": "Clinical Question, Region of Interest, Contraindications (Metals, Renal)...",
        "example_1_btn": "Load PE Protocol",
        "example_1_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "Suspect PE. 30F, tachycardia, hypoxia. Pregnant.";
            document.getElementById('vitals-input').value = "HR 110, SpO2 90%";
            document.getElementById('pe-input').value = "L leg swelling.";
            document.getElementById('prior-labs-input').value = "D-dimer high. Cr 0.6.";
            document.getElementById('pmh-input').value = "Pregnancy 2nd trimester.";""",
        "example_2_btn": "Load Contrast Allergy",
        "example_2_js": """document.getElementById('location-input').value = "ER";
            document.getElementById('initial-symptoms').value = "Need CT Abdomen for Appendicitis. Patient has severe anaphylaxis to iodine contrast.";
            document.getElementById('vitals-input').value = "Stable";
            document.getElementById('pe-input').value = "RLQ pain.";
            document.getElementById('prior-labs-input').value = "Cr 1.0.";
            document.getElementById('pmh-input').value = "Allergy.";""",
        "prompt_role": "Board-Certified Radiologist",
        "prompt_focus": "1. Appropriateness Criteria (ACR). 2. Modality Selection (CT vs MRI vs US). 3. Contrast Safety.",
        "plan_context": "1. PE in Pregnancy: V/Q scan or CTPA (low dose). 2. Contrast Allergy: Pre-medication protocol (Prednisone/Benadryl) or MRI/US alternative."
    }
]

for file_data in files_data:
    content = template.format(
        TITLE=file_data["title"],
        ICON=file_data["icon"],
        SUBTITLE=file_data["subtitle"],
        THEME_COLOR="indigo", # Keeping default
        ROS_PLACEHOLDER=file_data["ros_placeholder"],
        EXAMPLE_1_BTN=file_data["example_1_btn"],
        EXAMPLE_1_JS=file_data["example_1_js"],
        EXAMPLE_2_BTN=file_data["example_2_btn"],
        EXAMPLE_2_JS=file_data["example_2_js"],
        PROMPT_ROLE=file_data["prompt_role"],
        PROMPT_FOCUS=file_data["prompt_focus"],
        PLAN_CONTEXT=file_data["plan_context"]
    )

    with open(file_data["filename"], "w") as f:
        f.write(content)
        print(f"Generated {file_data['filename']}")
