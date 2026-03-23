import re

with open('neurology.html', 'r') as f:
    content = f.read()

content = content.replace('''        async function callGeminiApi(systemPrompt, userQuery, retries = 3) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            };''', '''        async function callGeminiApi(systemPrompt, userQuery, retries = 3) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            };''')

content = content.replace('''        async function callGeminiText(systemPrompt, userQuery) {
             const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
             const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            };''', '''        async function callGeminiText(systemPrompt, userQuery) {
             const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
             const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            };''')

content = content.replace('''                3. Contraindications (TNK/tPA exclusions, Pregnancy, Contrast allergy).

                Return strictly JSON: { "questions": ["Question 1", "Question 2"...] }''', '''                3. Contraindications (TNK/tPA exclusions, Pregnancy, Contrast allergy).

                Provide 3-4 highly probable multiple-choice options for each question to make it easy for the referring provider to answer.
                Return strictly JSON: { "questions": [ { "question": "Question text?", "options": ["Option A", "Option B", "Option C"] } ] }''')

content = content.replace('''            try {
                const result = await callGeminiApi(prompt, context);
                const container = document.getElementById('questions-container');
                container.innerHTML = '';
                result.questions.forEach(q => {
                    container.innerHTML += `
                        <div class="bg-slate-900 p-3 rounded border border-slate-700">
                            <label class="block text-sm text-indigo-300 mb-1 font-medium">${q}</label>
                            <input type="text" data-q="${q}" class="w-full p-2 border-b border-slate-600 bg-transparent text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Answer...">
                        </div>`;
                });
                showSection('questions');''', '''            try {
                const result = await callGeminiApi(prompt, context);
                state.questions = result.questions; // Save to state
                const container = document.getElementById('questions-container');
                container.innerHTML = '';
                result.questions.forEach((qObj, index) => {
                    const questionText = typeof qObj === 'string' ? qObj : qObj.question;
                    const options = typeof qObj === 'string' ? [] : (qObj.options || []);
                    const qId = `question-input-${index}`;

                    let html = `<div class="bg-slate-900 p-4 rounded border border-slate-700 mb-4" data-q-index="${index}">
                        <label class="block text-sm text-indigo-300 mb-3 font-medium">${questionText}</label>
                        <div class="space-y-2 mb-3">`;

                    if (options.length > 0) {
                        options.forEach((opt, optIndex) => {
                            const optId = `q-${index}-opt-${optIndex}`;
                            html += `
                            <label for="${optId}" class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all">
                                <input type="radio" name="q-${index}-radio" id="${optId}" value="${opt}" class="mt-1 form-radio text-indigo-600 bg-slate-700 border-slate-500 focus:ring-indigo-500 q-radio">
                                <span class="text-sm text-slate-300 group-hover:text-white transition-colors leading-tight">${opt}</span>
                            </label>`;
                        });

                        const otherId = `q-${index}-opt-other`;
                        html += `
                            <label for="${otherId}" class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all">
                                <input type="radio" name="q-${index}-radio" id="${otherId}" value="other" class="mt-1 form-radio text-indigo-600 bg-slate-700 border-slate-500 focus:ring-indigo-500 q-radio">
                                <span class="text-sm text-slate-300 group-hover:text-white transition-colors leading-tight">Other (Type below)</span>
                            </label>`;
                    }

                    html += `</div>
                        <input type="text" id="${qId}" data-q="${questionText}" class="w-full p-2 border-b border-slate-600 bg-slate-800 text-white focus:border-indigo-500 outline-none transition-colors rounded ${options.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}" placeholder="${options.length > 0 ? 'Select an option above, or choose Other to type...' : 'Type answer...'}" ${options.length > 0 ? 'disabled' : ''}>
                    </div>`;

                    container.innerHTML += html;
                });

                document.querySelectorAll('.q-radio').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        const index = e.target.closest('[data-q-index]').dataset.qIndex;
                        const textInput = document.getElementById(`question-input-${index}`);

                        if (e.target.value === 'other') {
                            textInput.disabled = false;
                            textInput.classList.remove('opacity-50', 'cursor-not-allowed');
                            textInput.placeholder = "Type your answer here...";
                            textInput.focus();
                        } else {
                            textInput.disabled = true;
                            textInput.classList.add('opacity-50', 'cursor-not-allowed');
                            textInput.placeholder = "Select an option above, or choose Other to type...";
                        }
                    });
                });

                showSection('questions');''')

content = content.replace('''            state.answers = [];
            document.querySelectorAll('#questions-container input').forEach(inp => {
                state.answers.push({ q: inp.dataset.q, a: inp.value });
            });''', '''            state.answers = [];
            document.querySelectorAll('#questions-container input[type="text"]').forEach(inp => {
                const questionText = inp.dataset.q;
                const index = inp.id.split('-').pop();
                const checkedRadio = document.querySelector(`input[name="q-${index}-radio"]:checked`);

                let answerText = "";
                if (checkedRadio && checkedRadio.value !== 'other') {
                    answerText = checkedRadio.value;
                } else if (checkedRadio && checkedRadio.value === 'other') {
                    answerText = inp.value;
                } else if (!checkedRadio && !inp.disabled) {
                    answerText = inp.value;
                }

                state.answers.push({ q: questionText, a: answerText });
            });''')

content = content.replace('''                OUTPUT JSON SCHEMA:
                {
                    "subjective": { "hpi_paragraph": "string", "ros_bullets": ["string"] },
                    "assessment": {
                        "synthesis_statement": "Summary of neuro status INCLUDING localization and pathophysiology.",
                        "ddx": [ {"name": "string", "icd10": "string", "desc": "string", "likelihood": "High/Med/Low"} ]
                    },
                    "plan": {
                        "disposition": "string (e.g. Transfer to Level 1, Discharge to Duty, Quarters)",
                        "workup": ["string (Specific MRI sequences, CT, Labs)"],
                        "treatment": ["string (Medication Name with EXACT Dose/Route/Frequency, Nursing orders)"],
                        "profile": {
                            "days": number,
                            "limitations": ["string (e.g. No PT, No Weapons, No Driving)"],
                            "instructions": ["string"]
                        }
                    },
                    "references": [ {"title": "string", "url": "string"} ]
                }''', '''                OUTPUT JSON SCHEMA:
                {
                    "thinking_process": "Extremely detailed internal reasoning narrative explaining pathophysiology, score calculation logic, and exhaustive treatment decisions.",
                    "subjective": { "hpi_paragraph": "string", "ros_bullets": ["string"] },
                    "assessment": {
                        "synthesis_statement": "Summary of neuro status INCLUDING localization and pathophysiology.",
                        "ddx": [ {"name": "string", "icd10": "string", "desc": "string", "likelihood": "High/Med/Low"} ]
                    },
                    "plan": {
                        "disposition": [ {"intervention": "string (e.g., Admit, Transfer to Level 1, Discharge to Duty, Quarters)", "is_primary": boolean, "rationale": "Detailed explanation citing guidelines and pathophysiology"} ],
                        "workup": [ {"intervention": "string (Specific MRI sequences, CT, Labs)", "is_primary": boolean, "rationale": "Detailed explanation of why this test is ordered and what it will change clinically"} ],
                        "treatment": [ {"intervention": "string (Medication Name with EXACT Dose/Route/Frequency, Nursing orders)", "is_primary": boolean, "rationale": "Detailed explanation of drug mechanism, why this dose, and expected physiological change"} ],
                        "profile": {
                            "days": number,
                            "limitations": [ {"intervention": "string (e.g. No PT, No Weapons, No Driving)", "is_primary": boolean, "rationale": "string"} ],
                            "instructions": [ {"intervention": "string", "is_primary": boolean} ]
                        }
                    },
                    "references": [ {"title": "string", "url": "string"} ]
                }''')

content = content.replace('''            <h2 class="text-xl font-semibold mb-4 text-white pb-2">Review Recommendations</h2>
            <div id="error-message-review" class="error-box hidden"></div>''', '''            <h2 class="text-xl font-semibold mb-4 text-white pb-2 flex justify-between items-center">
                <span>Review Recommendations</span>
                <details id="thinking-process-details" class="bg-slate-900 border border-slate-700 rounded-md text-sm cursor-pointer ml-4">
                    <summary class="font-semibold text-slate-300 p-2 hover:bg-slate-800 transition rounded-md flex items-center outline-none select-none">
                        <i class="fa-solid fa-brain text-indigo-400 mr-2"></i> Thinking Process
                        <i class="fa-solid fa-chevron-down text-slate-500 ml-2 transition-transform"></i>
                    </summary>
                    <div class="p-4 border-t border-slate-700 text-slate-300 bg-slate-800/50 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed" id="thinking-process-content">
                    </div>
                </details>
            </h2>
            <div id="error-message-review" class="error-box hidden"></div>''')

content = content.replace('''                    <div class="bg-slate-900 p-4 rounded border border-slate-700">
                        <h3 class="font-bold text-indigo-400 mb-2 uppercase text-xs tracking-wider">Disposition & Profile</h3>
                        <div class="mb-3">
                            <label class="text-xs text-slate-500 block mb-1">Primary Recommendation</label>
                            <div id="review-disposition" class="text-white font-medium bg-slate-800 p-2 rounded border border-slate-600"></div>
                        </div>
                         <div id="review-profile-container" class="space-y-2"></div>''', '''                    <div class="bg-slate-900 p-4 rounded border border-slate-700">
                        <h3 class="font-bold text-indigo-400 mb-2 uppercase text-xs tracking-wider">Disposition & Profile</h3>
                        <div class="mb-3">
                            <div class="text-xs text-slate-500 block mb-1">Disposition Options</div>
                            <div id="review-disposition-container" class="space-y-2"></div>
                        </div>
                         <div id="review-profile-container" class="space-y-2"></div>''')

content = content.replace('''            // Checkboxes Helper
            const createCheckboxes = (id, items, cat) => {
                const el = document.getElementById(id);
                el.innerHTML = items.map(i => `
                    <label class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group">
                        <input type="checkbox" checked class="mt-1 form-checkbox text-indigo-600 rounded bg-slate-700 border-slate-500 focus:ring-indigo-500 item-check" data-cat="${cat}" data-val="${i}">
                        <span class="text-sm text-slate-300 group-hover:text-white transition-colors">${i}</span>
                    </label>
                `).join('');
            };

            createCheckboxes('review-workup-container', soap.plan.workup, 'workup');
            createCheckboxes('review-treatment-container', soap.plan.treatment, 'treatment');
            createCheckboxes('review-profile-container', soap.plan.profile.limitations, 'profile');

            document.getElementById('review-disposition').textContent = soap.plan.disposition;
            document.getElementById('profile-days').value = soap.plan.profile.days;''', '''            // Thinking Process
            document.getElementById('thinking-process-content').textContent = soap.thinking_process || "No detailed thinking process provided by the model.";

            // Checkboxes Helper
            const createCheckboxes = (id, items, cat) => {
                const el = document.getElementById(id);
                if(!items || items.length === 0) {
                    el.innerHTML = '<span class="text-slate-500 text-sm italic">None</span>';
                    return;
                }
                el.innerHTML = items.map(i => {
                    const val = typeof i === 'object' ? i.intervention : i;
                    const isChecked = typeof i === 'object' ? i.is_primary : true;
                    const rationale = typeof i === 'object' && i.rationale ? i.rationale : null;

                    const safeRationale = rationale ? rationale.replace(/"/g, '&quot;') : '';

                    let html = `
                    <label class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} class="mt-1 form-checkbox text-indigo-600 rounded bg-slate-700 border-slate-500 focus:ring-indigo-500 item-check" data-cat="${cat}" data-val="${val}" data-rationale="${safeRationale}">
                        <div class="flex flex-col">
                            <span class="text-sm ${isChecked ? 'text-slate-200 font-medium' : 'text-slate-400'} group-hover:text-white transition-colors leading-snug">${val}</span>`;

                    if (rationale) {
                        html += `<span class="text-xs text-slate-400 italic mt-1 leading-tight group-hover:text-slate-300 transition-colors"><i class="fa-solid fa-lightbulb text-yellow-500/50 mr-1"></i>${rationale}</span>`;
                    }

                    html += `</div></label>`;
                    return html;
                }).join('');
            };

            createCheckboxes('review-workup-container', soap.plan.workup, 'workup');
            createCheckboxes('review-treatment-container', soap.plan.treatment, 'treatment');
            createCheckboxes('review-profile-container', soap.plan.profile.limitations, 'profile');
            createCheckboxes('review-disposition-container', soap.plan.disposition, 'disposition');

            document.getElementById('profile-days').value = soap.plan.profile.days;''')

content = content.replace('''            const getChecked = (cat) => Array.from(document.querySelectorAll(`.item-check[data-cat="${cat}"]:checked`)).map(c => c.dataset.val);

            const selWorkup = getChecked('workup');
            const selTx = getChecked('treatment');
            const selProf = getChecked('profile');
            const days = document.getElementById('profile-days').value;''', '''            const getChecked = (cat) => Array.from(document.querySelectorAll(`.item-check[data-cat="${cat}"]:checked`)).map(c => ({
                val: c.dataset.val,
                rationale: c.dataset.rationale
            }));

            const selDisposition = getChecked('disposition');
            const selWorkup = getChecked('workup');
            const selTx = getChecked('treatment');
            const selProf = Array.from(document.querySelectorAll(`.item-check[data-cat="profile"]:checked`)).map(c => c.dataset.val);
            const days = document.getElementById('profile-days').value;''')

content = content.replace('''            note += `\nPLAN:\n`;
            note += `Disposition: ${soap.plan.disposition}\n\n`;

            note += `Workup / Orders:\n`;
            if(selWorkup.length) selWorkup.forEach(i => note += `• ${i}\n`);
            else note += `(None selected)\n`;

            note += `\nTreatment / Interventions:\n`;
            if(selTx.length) selTx.forEach(i => note += `• ${i}\n`);
            else note += `(None selected)\n`;

            note += `\nDuty Limitations / Profile (${days} days):\n`;
            if(selProf.length) selProf.forEach(i => note += `- ${i}\n`);''', '''            // Helper function to format items with their rationales
            const formatItems = (items) => {
                let out = "";
                items.forEach(i => {
                    out += `• ${i.val}\n`;
                    if (i.rationale) {
                        out += `    Rationale: ${i.rationale}\n`;
                    }
                });
                return out;
            };

            note += `\nPLAN:\n`;
            note += `Disposition:\n`;
            if(selDisposition.length) note += formatItems(selDisposition);
            else note += `(None selected)\n\n`;

            note += `Workup / Orders:\n`;
            if(selWorkup.length) note += formatItems(selWorkup);
            else note += `(None selected)\n`;

            note += `\nTreatment / Interventions:\n`;
            if(selTx.length) note += formatItems(selTx);
            else note += `(None selected)\n`;

            note += `\nDuty Limitations / Profile (${days} days):\n`;
            if(selProf.length) selProf.forEach(i => note += `- ${i}\n`);''')

content = content.replace('''        function getPlanModifications() {
            // Helper to capture checkboxes in review section
            return {
                workup: Array.from(document.querySelectorAll('.item-check[data-cat="workup"]:checked')).map(cb => cb.dataset.val),
                treatment: Array.from(document.querySelectorAll('.item-check[data-cat="treatment"]:checked')).map(cb => cb.dataset.val),
                profile: Array.from(document.querySelectorAll('.item-check[data-cat="profile"]:checked')).map(cb => cb.dataset.val),
                days: document.getElementById('profile-days').value
            };
        }''', '''        function getPlanModifications() {
            // Helper to capture checkboxes in review section
            if (document.querySelectorAll('.item-check').length > 0) {
                return {
                    disposition: Array.from(document.querySelectorAll('.item-check[data-cat="disposition"]:checked')).map(cb => cb.dataset.val),
                    workup: Array.from(document.querySelectorAll('.item-check[data-cat="workup"]:checked')).map(cb => cb.dataset.val),
                    treatment: Array.from(document.querySelectorAll('.item-check[data-cat="treatment"]:checked')).map(cb => cb.dataset.val),
                    profile: Array.from(document.querySelectorAll('.item-check[data-cat="profile"]:checked')).map(cb => cb.dataset.val),
                    days: document.getElementById('profile-days').value
                };
            }
            return null;
        }''')

content = content.replace('''                // Sync Question Answers
                const qInputs = document.querySelectorAll('#questions-container input');
                if (qInputs.length > 0) {
                    state.answers = [];
                    qInputs.forEach(inp => {
                        state.answers.push({ q: inp.dataset.q, a: inp.value });
                    });
                }''', '''                // Sync Question Answers
                const questionInputs = document.querySelectorAll('#questions-container input[type="text"]');
                if (questionInputs.length > 0) {
                    state.answers = [];
                    questionInputs.forEach(inp => {
                        const index = inp.id.split('-').pop();
                        const checkedRadio = document.querySelector(`input[name="q-${index}-radio"]:checked`);
                        let a = inp.value;
                        if (checkedRadio && checkedRadio.value !== 'other') {
                            a = checkedRadio.value;
                        } else if (checkedRadio && checkedRadio.value === 'other') {
                            a = inp.value;
                        } else if (!checkedRadio && inp.disabled) {
                            a = "";
                        }
                        state.answers.push({ q: inp.dataset.q, a: a });
                    });
                }''')

content = content.replace('''                // Restore Questions
                if (state.questions && state.questions.length > 0) {
                    const container = document.getElementById('questions-container');
                    container.innerHTML = '';
                    state.questions.forEach(q => {
                        const ans = state.answers ? state.answers.find(a => a.q === q) : null;
                        const val = ans ? ans.a : "";
                        container.innerHTML += `
                            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                                <label class="block text-sm text-indigo-300 mb-1 font-medium">${q}</label>
                                <input type="text" data-q="${q}" value="${val}" class="w-full p-2 border-b border-slate-600 bg-transparent text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Answer...">
                            </div>`;
                    });
                }

                // Restore Review
                if (state.generatedPlan) {
                    renderReview(state.generatedPlan);

                    if (saved.planModifications) {
                        const mods = saved.planModifications;
                        document.getElementById('profile-days').value = mods.days || "";

                        const applyChecks = (cat, items) => {
                            if (!items) return;
                            document.querySelectorAll(`.item-check[data-cat="${cat}"]`).forEach(cb => {
                                cb.checked = items.includes(cb.dataset.val);
                            });
                        };
                        applyChecks('workup', mods.workup);
                        applyChecks('treatment', mods.treatment);
                        applyChecks('profile', mods.profile);
                    }
                }''', '''                // Restore Questions
                if (state.questions && state.questions.length > 0) {
                    const container = document.getElementById('questions-container');
                    container.innerHTML = '';
                    state.questions.forEach((qObj, index) => {
                        const questionText = typeof qObj === 'string' ? qObj : qObj.question;
                        const options = typeof qObj === 'string' ? [] : (qObj.options || []);
                        const ansObj = state.answers ? state.answers.find(a => a.q === questionText) : null;
                        const val = ansObj ? ansObj.a : "";
                        const qId = `question-input-${index}`;

                        let html = `<div class="bg-slate-900 p-4 rounded border border-slate-700 mb-4" data-q-index="${index}">
                            <label class="block text-sm text-indigo-300 mb-3 font-medium">${questionText}</label>
                            <div class="space-y-2 mb-3">`;

                        let isOptionSelected = false;
                        let isOtherSelected = false;

                        if (options.length > 0) {
                            options.forEach((opt, optIndex) => {
                                const optId = `q-${index}-opt-${optIndex}`;
                                const isChecked = val === opt;
                                if (isChecked) isOptionSelected = true;

                                html += `
                                <label for="${optId}" class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all">
                                    <input type="radio" name="q-${index}-radio" id="${optId}" value="${opt}" ${isChecked ? 'checked' : ''} class="mt-1 form-radio text-indigo-600 bg-slate-700 border-slate-500 focus:ring-indigo-500 q-radio">
                                    <span class="text-sm text-slate-300 group-hover:text-white transition-colors leading-tight">${opt}</span>
                                </label>`;
                            });

                            const otherId = `q-${index}-opt-other`;
                            if (val && !isOptionSelected) isOtherSelected = true;

                            html += `
                                <label for="${otherId}" class="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all">
                                    <input type="radio" name="q-${index}-radio" id="${otherId}" value="other" ${isOtherSelected ? 'checked' : ''} class="mt-1 form-radio text-indigo-600 bg-slate-700 border-slate-500 focus:ring-indigo-500 q-radio">
                                    <span class="text-sm text-slate-300 group-hover:text-white transition-colors leading-tight">Other (Type below)</span>
                                </label>`;
                        }

                        const shouldDisableText = options.length > 0 && !isOtherSelected;
                        const textValue = isOtherSelected || options.length === 0 ? val : "";

                        html += `</div>
                            <input type="text" id="${qId}" data-q="${questionText}" value="${textValue}" class="w-full p-2 border-b border-slate-600 bg-slate-800 text-white focus:border-indigo-500 outline-none transition-colors rounded ${shouldDisableText ? 'opacity-50 cursor-not-allowed' : ''}" placeholder="${options.length > 0 ? 'Select an option above, or choose Other to type...' : 'Type answer...'}" ${shouldDisableText ? 'disabled' : ''}>
                        </div>`;

                        container.innerHTML += html;
                    });

                    document.querySelectorAll('.q-radio').forEach(radio => {
                        radio.addEventListener('change', (e) => {
                            const index = e.target.closest('[data-q-index]').dataset.qIndex;
                            const textInput = document.getElementById(`question-input-${index}`);

                            if (e.target.value === 'other') {
                                textInput.disabled = false;
                                textInput.classList.remove('opacity-50', 'cursor-not-allowed');
                                textInput.placeholder = "Type your answer here...";
                                textInput.focus();
                            } else {
                                textInput.disabled = true;
                                textInput.classList.add('opacity-50', 'cursor-not-allowed');
                                textInput.placeholder = "Select an option above, or choose Other to type...";
                            }
                        });
                    });
                }

                // Restore Review
                if (state.generatedPlan) {
                    renderReview(state.generatedPlan);

                    if (saved.planModifications) {
                        const mods = saved.planModifications;
                        document.getElementById('profile-days').value = mods.days || "";

                        const applyChecks = (cat, items) => {
                            if (!items) return;
                            document.querySelectorAll(`.item-check[data-cat="${cat}"]`).forEach(cb => {
                                cb.checked = items.includes(cb.dataset.val);
                            });
                        };
                        applyChecks('disposition', mods.disposition);
                        applyChecks('workup', mods.workup);
                        applyChecks('treatment', mods.treatment);
                        applyChecks('profile', mods.profile);
                    }
                }''')

with open('neurology.html', 'w') as f:
    f.write(content)
