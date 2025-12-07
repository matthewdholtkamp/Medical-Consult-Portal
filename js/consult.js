import { callGeminiApi, callGeminiText } from './api.js';
import { siteContent } from './data.js';
import { API_KEY } from './config.js';

// =============================================================================
// PART 1: GENERIC CONSULT SPA CONTROLLER (The New "Butter" Flow)
// =============================================================================

let activeConsultState = {
    step: 'intake', // intake, questions, review, final
    specialtyId: null,
    data: {
        location: '', cc: '', vitals: '', pe: '', meds: '', labs: '', pmh: ''
    },
    images: [], // New: Store base64 images
    generatedQuestions: [],
    questionAnswers: [],
    finalSoap: null
};

// Start a new consult flow
export function startConsult(specialtyId) {
    const config = siteContent.find(c => c.id === specialtyId);
    if (!config) {
        console.error('Specialty not found:', specialtyId);
        return;
    }

    activeConsultState = {
        step: 'intake',
        specialtyId: specialtyId,
        data: { location: '', cc: '', vitals: '', pe: '', meds: '', labs: '', pmh: '' },
        images: [],
        generatedQuestions: [],
        questionAnswers: [],
        finalSoap: null
    };

    renderConsultView(config);
}

// Main Render Function
// Main Render Function
function renderConsultView(config) {
    const container = document.getElementById('view-active-consult');
    const dashboard = document.getElementById('view-dashboard'); // Hide dashboard

    if (dashboard) dashboard.classList.add('hidden');

    // Force Full Screen Overlay Style
    if (container) {
        container.classList.remove('hidden');
        container.className = "fixed inset-0 z-50 bg-slate-950 overflow-y-auto animate-fade-in custom-scroll";
    }

    // Header (Added max-w-4xl to center it nicely)
    let html = `
        <div class="max-w-4xl mx-auto p-6 md:p-12">
            <div class="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                <div class="flex items-center gap-6">
                    <div class="p-4 rounded-2xl bg-${config.color}-500/20 text-${config.color}-400 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                        <span class="material-symbols-outlined text-4xl">${config.icon || 'medical_services'}</span>
                    </div>
                    <div>
                        <h1 class="text-4xl font-bold text-white mb-2 tracking-tight">${config.title}</h1>
                        <p class="text-slate-400 text-base">${config.desc}</p>
                    </div>
                </div>
                <button onclick="window.closeConsult()" class="group flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition">
                    <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-400 transition">
                         <span class="material-symbols-outlined">close</span>
                    </div>
                    <span class="text-[10px] uppercase font-bold text-slate-500 group-hover:text-red-400">Close</span>
                </button>
            </div>
            
            <div id="consult-stage-area">
                <!-- Dynamic Content Goes Here -->
            </div>
        </div>
    `;

    container.innerHTML = html;
    renderStage(activeConsultState.step, config);
}

// Helper for font consistency
const FONTS = {
    header: "font-family: 'Roboto Condensed', sans-serif; letter-spacing: 0.5px;",
    body: "font-family: 'Inter', sans-serif;"
};

function renderStage(step, config) {
    const area = document.getElementById('consult-stage-area');
    const color = config.color;
    let content = '';

    if (step === 'intake') {
        content = `
            <!-- HIPAA Section (Collapsed) -->
            <details class="bg-slate-800 border border-slate-600 rounded-md mb-8 shadow-lg max-w-4xl mx-auto">
                <summary class="font-semibold text-slate-300 p-3 cursor-pointer text-sm flex justify-between items-center hover:bg-slate-750 transition">
                    <span class="flex items-center"><span class="material-symbols-outlined mr-2 text-blue-400 text-lg">shield</span> HIPAA Compliance Check</span>
                    <span class="text-[10px] bg-red-900/80 text-red-100 px-2 py-0.5 rounded border border-red-500 uppercase">Required</span>
                </summary>
                <div class="p-4 border-t border-slate-600 text-xs bg-slate-900/50 text-slate-400">
                    <p class="font-bold text-red-400 mb-2">DO NOT INCLUDE: Names, Dates (except year), Phone #s, SSN, MRN.</p>
                </div>
            </details>

            <div class="max-w-4xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl border-t-4 border-${color}-600 animate-fade-in">
                <div class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700">
                    <span class="flex items-center justify-center w-10 h-10 rounded-full bg-${color}-600 text-white font-bold text-lg shadow-lg">1</span>
                    <h2 class="text-2xl font-bold text-white tracking-wide uppercase" style="${FONTS.header}">Clinical Intake</h2>
                </div>

                <form id="consult-form" onsubmit="event.preventDefault(); window.submitIntake()">
                    
                    <!-- Location -->
                    <div class="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                         <label class="block text-xs font-bold text-${color}-400 mb-2 uppercase tracking-wider">
                            <span class="material-symbols-outlined text-sm align-bottom mr-1">ward</span> Patient Location
                         </label>
                         <select id="in-loc" class="w-full p-3 border border-slate-600 rounded bg-slate-800 text-white focus:border-${color}-500 outline-none text-base">
                             <option value="Inpatient">Inpatient Ward (Admitted)</option>
                             <option value="ER">Emergency Room (ER/Trauma)</option>
                             <option value="Clinic">Outpatient Clinic</option>
                             <option value="Field">Forward Aid Station / Deployed</option>
                         </select>
                    </div>
                
                    <div class="space-y-6 mb-8">
                        <div>
                             <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-bold text-white uppercase tracking-wide">Chief Complaint / One-Liner</label>
                                <button type="button" onclick="window.loadExample('${config.id}')" class="text-xs font-bold text-${color}-400 hover:text-${color}-300 hover:underline">Load Example Case</button>
                             </div>
                             <textarea id="in-cc" rows="2" class="w-full p-4 border border-slate-600 rounded-lg bg-slate-900 text-white focus:border-${color}-500 focus:ring-1 focus:ring-${color}-500 outline-none text-lg shadow-inner placeholder-slate-500" placeholder="e.g. 55M with crushing chest pain x2 hours..."></textarea>
                        </div>

                        <div><label class="label-sm">History of Present Illness (HPI)</label><textarea id="in-pmh" rows="3" class="input-neuro"></textarea></div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div><label class="label-sm">Vitals</label><textarea id="in-vitals" rows="3" class="input-neuro" placeholder="BP, HR, RR, SpO2, Temp"></textarea></div>
                             <div><label class="label-sm">Physical Exam</label><textarea id="in-pe" rows="3" class="input-neuro" placeholder="Pertinent positives/negatives"></textarea></div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label class="label-sm">Medications</label><textarea id="in-meds" rows="2" class="input-neuro"></textarea></div>
                            <div><label class="label-sm">Labs / Imaging</label><textarea id="in-labs" rows="2" class="input-neuro"></textarea></div>
                        </div>
                    </div>

                    <!-- Vision Section -->
                     <div class="mb-8 p-1 border border-dashed border-slate-600 rounded-xl bg-slate-900/30 hover:bg-slate-900/60 transition cursor-pointer group" onclick="document.getElementById('in-image').click()">
                        <div id="upload-prompt" class="p-6 flex flex-col items-center justify-center text-center">
                            <span class="material-symbols-outlined text-slate-500 text-3xl group-hover:text-${color}-400 transition mb-2">add_a_photo</span>
                            <h3 class="text-sm font-bold text-slate-300 group-hover:text-white">Add Visual Context</h3>
                            <p class="text-xs text-slate-500">ECG, X-Ray, Rash, Wound</p>
                        </div>
                        <input type="file" id="in-image" accept="image/*" capture="environment" class="hidden" onchange="window.previewImage(this)">
                        
                        <div id="image-preview" class="hidden relative w-full h-64 rounded-lg overflow-hidden bg-black">
                             <img id="preview-img" class="w-full h-full object-contain">
                             <button type="button" onclick="event.stopPropagation(); window.clearImage()" class="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-2 shadow-lg z-10">
                                <span class="material-symbols-outlined text-sm font-bold">close</span>
                             </button>
                        </div>
                    </div>

                    <div class="pt-6 border-t border-slate-700">
                        <button type="submit" class="w-full bg-gradient-to-r from-${color}-700 to-${color}-600 hover:from-${color}-600 hover:to-${color}-500 text-white font-bold text-xl py-4 px-8 rounded-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-3">
                            <span>Start ${config.title} Assessment</span>
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
            <style>
                .label-sm { display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:0.5rem; letter-spacing:0.05em; }
                .input-neuro { width:100%; padding:0.75rem; border:1px solid #475569; border-radius:0.5rem; background-color:#0f172a; color:white; font-size:0.95rem; line-height:1.5; outline:none; transition: all 0.2s; }
                .input-neuro:focus { border-color: var(--tw-color-${color}-500); ring: 2px solid var(--tw-color-${color}-500); }
            </style>
        `;
    }
    else if (step === 'loading') {
        content = `
            <div class="flex flex-col items-center justify-center h-[80vh]">
                <div class="w-24 h-24 rounded-full border-[6px] border-${color}-900 border-l-${color}-500 animate-spin mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]"></div>
                <h3 class="text-3xl font-bold text-white mb-3 tracking-tight" style="${FONTS.header}">Consulting Specialist...</h3>
                <p class="text-slate-400 text-lg animate-pulse">Analyzing clinical data & visuals</p>
            </div>
        `;
    }
    else if (step === 'questions') {
        content = `
            <div class="max-w-4xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl border-t-4 border-${color}-600 animate-fade-in">
                <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                    <span class="flex items-center justify-center w-10 h-10 rounded-full bg-${color}-600 text-white font-bold text-lg">2</span>
                    <h2 class="text-2xl font-bold text-white uppercase" style="${FONTS.header}">Refine Differential</h2>
                </div>
                
                <div class="bg-slate-900 border-l-4 border-${color}-500 p-4 mb-8 rounded shadow-inner">
                    <p class="text-slate-300 text-sm italic">"Based on the clinical picture, I need to clarify a few key points to rule out critical conditions."</p>
                </div>

                <form id="questions-form" onsubmit="event.preventDefault(); window.submitAnswers()">
                    <div class="space-y-6 mb-8">
                        ${activeConsultState.generatedQuestions.map((q, i) => `
                            <div>
                                <label class="block text-sm font-semibold text-${color}-200 mb-2">${q}</label>
                                <input type="text" data-idx="${i}" class="w-full bg-slate-900 border-b-2 border-slate-600 focus:border-${color}-500 px-4 py-3 text-white outline-none transition-colors rounded-t-md" placeholder="Enter patient response...">
                            </div>
                        `).join('')}
                    </div>
                    <button type="submit" class="w-full bg-${color}-600 hover:bg-${color}-500 text-white font-bold py-4 rounded-lg shadow-lg transition text-lg flex items-center justify-center gap-2">
                        <span>Generate Final Plan</span>
                        <span class="material-symbols-outlined">assignment_turned_in</span>
                    </button>
                </form>
            </div>
        `;
    }
    else if (step === 'final') {
        const soap = activeConsultState.finalSoap;
        content = `
            <div class="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
                 <!-- Actions -->
                 <div class="flex justify-end gap-3 mb-4 sticky top-4 z-40 bg-slate-950/80 p-2 rounded-xl backdrop-blur-md border border-white/5 inline-flex ml-auto">
                    <button onclick="window.copyNote()" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-bold transition flex items-center gap-2 shadow-lg">
                        <span class="material-symbols-outlined text-sm">content_copy</span> Copy
                    </button>
                    <button onclick="window.closeConsult()" class="px-5 py-2 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">close</span> Close
                    </button>
                 </div>

                 <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <!-- Left Col: Assessment -->
                     <div class="lg:col-span-2 space-y-6">
                        <div class="bg-slate-800 rounded-lg border-t-4 border-${color}-600 p-6 shadow-xl">
                            <h3 class="text-${color}-400 font-bold uppercase text-sm tracking-wider mb-4 border-b border-slate-700 pb-2">Assessment & Synthesis</h3>
                            <p class="text-slate-100 leading-relaxed mb-6 text-lg font-medium">${soap.assessment.synthesis_statement}</p>
                            
                            <h4 class="text-xs font-bold text-slate-500 uppercase mb-3">Differential Diagnosis</h4>
                            <div class="space-y-2">
                                 ${soap.assessment.ddx.map(d => `
                                    <div class="flex justify-between items-center text-sm bg-slate-900 p-3 rounded border border-slate-700">
                                        <span class="font-bold text-slate-200">${d.name}</span>
                                        <span class="text-xs font-bold bg-${d.likelihood === 'High' ? 'red' : 'yellow'}-900/50 text-${d.likelihood === 'High' ? 'red' : 'yellow'}-200 px-2 py-0.5 rounded border border-${d.likelihood === 'High' ? 'red' : 'yellow'}-700/50">${d.likelihood || 'Possible'}</span>
                                    </div>
                                 `).join('')}
                            </div>
                        </div>
                        
                        <div class="bg-slate-800 rounded-lg border-t-4 border-${color}-600 p-6 shadow-xl">
                            <h3 class="text-${color}-400 font-bold uppercase text-sm tracking-wider mb-4 border-b border-slate-700 pb-2">Treatment Plan</h3>
                            <ul class="space-y-4">
                                ${[...soap.plan.workup, ...soap.plan.treatment].map(item => `
                                    <li class="flex items-start gap-4 p-3 rounded hover:bg-slate-900/50 transition">
                                        <span class="material-symbols-outlined text-${color}-500 mt-0.5">check_circle</span>
                                        <span class="text-slate-200 leading-relaxed">${item}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                     </div>

                     <!-- Right Col: Dispo & Profile -->
                     <div class="space-y-6">
                        <div class="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
                            <h3 class="text-slate-400 font-bold uppercase text-xs mb-2">Disposition</h3>
                            <div class="text-xl font-bold text-white bg-slate-900 p-4 rounded border-l-4 border-${color}-500">
                                ${soap.plan.disposition}
                            </div>
                        </div>

                         <div class="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
                            <h3 class="text-slate-400 font-bold uppercase text-xs mb-2">Duty Limitations</h3>
                            <ul class="space-y-2 text-sm text-slate-300">
                                ${(soap.plan.profile && soap.plan.profile.limitations) ? soap.plan.profile.limitations.map(l => `<li class="flex gap-2"><span class="text-red-400">•</span> ${l}</li>`).join('') : '<li class="text-slate-500 italic">None listed</li>'}
                            </ul>
                        </div>
                     </div>
                 </div>
            </div>
        `;
    }

    area.innerHTML = content;

    // UI Helpers remain same
    if (step === 'intake') {
        window.updateImageUI = function (hasImage) {
            const prompt = document.getElementById('upload-prompt');
            const preview = document.getElementById('image-preview');
            if (hasImage) {
                prompt.classList.add('hidden');
                preview.classList.remove('hidden');
            } else {
                prompt.classList.remove('hidden');
                preview.classList.add('hidden');
            }
        }
    }
}

// Logic Functions bound to Window
window.loadExample = function (id) {
    const config = siteContent.find(c => c.id === id);
    if (config && config.example) {
        document.getElementById('in-loc').value = config.example.location;
        document.getElementById('in-cc').value = config.example.cc;
        document.getElementById('in-vitals').value = config.example.vitals;
        document.getElementById('in-pe').value = config.example.pe;
        document.getElementById('in-meds').value = config.example.meds;
        document.getElementById('in-labs').value = config.example.labs;
        document.getElementById('in-pmh').value = config.example.pmh;
    }
}

// Image Helpers
// Image Helpers
window.previewImage = function (input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('preview-img').src = e.target.result;
            window.updateImageUI(true);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

window.clearImage = function () {
    const input = document.getElementById('in-image');
    if (input) input.value = '';
    window.updateImageUI(false);
}

// Convert File to Base64 wrapper
const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix (e.g. "data:image/jpeg;base64,")
            const base64String = reader.result.split(',')[1];
            resolve({
                mime: file.type,
                data: base64String
            });
        };
        reader.onerror = error => reject(error);
    });
};

window.submitIntake = async function () {
    const config = siteContent.find(c => c.id === activeConsultState.specialtyId);

    // Scrape Data
    activeConsultState.data = {
        location: document.getElementById('in-loc').value,
        cc: document.getElementById('in-cc').value,
        vitals: document.getElementById('in-vitals').value,
        pe: document.getElementById('in-pe').value,
        meds: document.getElementById('in-meds').value,
        labs: document.getElementById('in-labs').value,
        pmh: document.getElementById('in-pmh').value
    };

    // Grab Image if present
    const fileInput = document.getElementById('in-image');
    activeConsultState.images = [];
    if (fileInput && fileInput.files.length > 0) {
        try {
            const imgData = await convertFileToBase64(fileInput.files[0]);
            activeConsultState.images.push(imgData);
        } catch (err) {
            console.error("Image processing error", err);
        }
    }

    renderStage('loading', config);

    // AI Call
    try {
        const context = JSON.stringify(activeConsultState.data) + (activeConsultState.images.length > 0 ? "\n[IMAGE UPLOADED: Analyze this visual data as part of the case]" : "");
        const result = await callGeminiApi(API_KEY, config.prompts.questions, context, activeConsultState.images);
        activeConsultState.generatedQuestions = result.questions || ["No questions generated."];
        activeConsultState.step = 'questions';
        renderStage('questions', config);
    } catch (e) {
        console.error("Consult Error:", e);
        alert("Consult Failed. Try again.");
        renderStage('intake', config);
    }
}

window.submitAnswers = async function () {
    const config = siteContent.find(c => c.id === activeConsultState.specialtyId);

    // Scrape Answers
    const answers = [];
    activeConsultState.generatedQuestions.forEach((q, idx) => {
        const inp = document.querySelector(`input[data-idx="${idx}"]`);
        if (inp) answers.push(`Q: ${q} A: ${inp.value}`);
    });

    renderStage('loading', config);

    // AI Call
    try {
        const context = JSON.stringify(activeConsultState.data) + "\n\nFollow Up:\n" + answers.join('\n');
        // We pass images again so the context is fully preserved for the plan generation
        const result = await callGeminiApi(API_KEY, config.prompts.plan, context, activeConsultState.images);
        activeConsultState.finalSoap = result;

        // Save to History
        saveToHistory(config, result);

        activeConsultState.step = 'final';
        renderStage('final', config);
    } catch (e) {
        console.error("Plan Gen Error:", e);
        alert("Plan Generation Failed.");
        renderStage('questions', config);
    }
}

function saveToHistory(config, soap) {
    const history = JSON.parse(localStorage.getItem('consultHistory') || '[]');
    const newEntry = {
        id: Date.now(),
        specialty: config.title,
        color: config.color,
        date: new Date().toLocaleDateString(),
        diagnosis: soap.assessment.synthesis_statement.split('.')[0] + '...', // First sentence
        disposition: soap.plan.disposition
    };
    history.unshift(newEntry); // Add to top
    if (history.length > 3) history.pop(); // Keep max 3
    localStorage.setItem('consultHistory', JSON.stringify(history));
}

window.renderRecentActivity = function () {
    const list = document.getElementById('recent-activity-list');
    if (!list) return;

    const history = JSON.parse(localStorage.getItem('consultHistory') || '[]');

    if (history.length === 0) {
        list.innerHTML = '<p class="text-slate-500 text-sm col-span-full italic py-4 text-center">No recent consults found.</p>';
        return;
    }

    list.innerHTML = history.map(item => `
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-${item.color}-500/50 transition cursor-default">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-${item.color}-400 uppercase tracking-wider">${item.specialty}</span>
                <span class="text-[10px] text-slate-500">${item.date}</span>
            </div>
            <p class="text-white text-sm font-medium mb-1 truncate">${item.diagnosis}</p>
            <p class="text-slate-400 text-xs truncate">${item.disposition}</p>
        </div>
    `).join('');
}

window.closeConsult = function () {
    document.getElementById('view-active-consult').classList.add('hidden');
    document.getElementById('view-dashboard').classList.remove('hidden');
    window.switchView('dashboard');
    window.renderRecentActivity(); // Refresh list
}

window.copyNote = function () {
    const soap = activeConsultState.finalSoap;
    const text = `ASSESSMENT: ${soap.assessment.synthesis_statement}\n\nPLAN: ${soap.plan.disposition}`;
    navigator.clipboard.writeText(text);
    alert("Note copied!");
}


// =============================================================================
// PART 2: LEGACY DR. HOLTKAMP CHAT (Dashboard)
// =============================================================================

function cleanMedicalResponse(html) {
    if (!html) return '';
    let clean = html.replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>');
    clean = clean.replace(/\* /g, '<br>• ');
    clean = clean.replace(/\n\n/g, '<br><br>');
    return clean;
}

export async function askDrHoltkamp() {
    const queryInput = document.getElementById("dr-h-query");
    const responseArea = document.getElementById("dr-h-response");
    const thinking = document.getElementById("dr-h-thinking");
    const consultBtn = document.getElementById("consult-btn");

    if (!queryInput) return;
    const term = queryInput.value.trim();
    if (!term) return;

    // UI Updates
    queryInput.disabled = true;
    if (consultBtn) {
        consultBtn.disabled = true;
        consultBtn.classList.add("opacity-50");
    }
    if (responseArea) responseArea.classList.add("hidden");
    if (thinking) thinking.classList.remove("hidden");

    const sysPrompt = `Respond as Dr. Holtkamp, serving in the role of Expert Medical Educator. Limit to 300 words.`;

    try {
        const text = await callGeminiText(API_KEY, sysPrompt, term);
        let formatted = (typeof marked !== 'undefined') ? marked.parse(text) : cleanMedicalResponse(text);

        if (responseArea) {
            responseArea.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <span class="text-white font-bold text-lg">H</span>
                    </div>
                    <div class="prose prose-invert prose-sm max-w-none">
                        ${formatted}
                    </div>
                </div>
            `;
            responseArea.classList.remove("hidden");
        }
    } catch (error) {
        console.error(error);
        if (responseArea) {
            responseArea.innerHTML = `<p class="text-red-400">Consultation interrupted. Please try again.</p>`;
            responseArea.classList.remove("hidden");
        }
    } finally {
        if (thinking) thinking.classList.add("hidden");
        queryInput.disabled = false;
        queryInput.value = "";
        if (consultBtn) {
            consultBtn.disabled = false;
            consultBtn.classList.remove("opacity-50");
        }
    }
}

export function resetConsult() {
    const responseArea = document.getElementById("dr-h-response");
    const queryInput = document.getElementById("dr-h-query");
    if (responseArea) responseArea.classList.add("hidden");
    if (queryInput) queryInput.value = "";
}
