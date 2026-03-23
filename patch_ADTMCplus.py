import re

with open('ADTMCplus.html', 'r') as f:
    content = f.read()

content = content.replace('''        async function callGeminiApi(systemPrompt, userQuery, retries = 3) {
            const cleanKey = apiKey ? apiKey.trim() : "";
            const modelId = (typeof GEMINI_MODEL_ID !== 'undefined' && GEMINI_MODEL_ID) ? GEMINI_MODEL_ID : "gemini-3.1-flash-lite-preview";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${cleanKey}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json", temperature: 1.0 }
            };''', '''        async function callGeminiApi(systemPrompt, userQuery, retries = 3) {
            const cleanKey = apiKey ? apiKey.trim() : "";
            const modelId = (typeof GEMINI_MODEL_ID !== 'undefined' && GEMINI_MODEL_ID) ? GEMINI_MODEL_ID : "gemini-3.1-flash-lite-preview";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${cleanKey}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 1.0,
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            };''')

content = content.replace('''        async function callGeminiText(systemPrompt, userQuery) {
            const cleanKey = apiKey ? apiKey.trim() : "";
            const modelId = (typeof GEMINI_MODEL_ID !== 'undefined' && GEMINI_MODEL_ID) ? GEMINI_MODEL_ID : "gemini-3.1-flash-lite-preview";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${cleanKey}`;
             const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            };''', '''        async function callGeminiText(systemPrompt, userQuery) {
            const cleanKey = apiKey ? apiKey.trim() : "";
            const modelId = (typeof GEMINI_MODEL_ID !== 'undefined' && GEMINI_MODEL_ID) ? GEMINI_MODEL_ID : "gemini-3.1-flash-lite-preview";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${cleanKey}`;
             const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            };''')

content = content.replace('''                    You are an expert combat medic assistant.
                    Based on the Chief Complaint, Vitals, and History provided, generate 5-7 concise, targeted follow-up questions to build a complete HPI and ROS.
                    Do NOT ask for data already provided (e.g., if Vitals are present, don't ask for them).
                    Return strictly JSON: { "questions": ["Question 1", "Question 2"...] }''', '''                    You are an expert combat medic assistant.
                    Based on the Chief Complaint, Vitals, and History provided, generate 5-7 concise, targeted follow-up questions to build a complete HPI and ROS.
                    Do NOT ask for data already provided (e.g., if Vitals are present, don't ask for them).
                    Provide 3-4 highly probable multiple-choice options for each question to make it easy for the user to answer.
                    Return strictly JSON: { "questions": [ { "question": "Question text?", "options": ["Option A", "Option B", "Option C"] } ] }''')

content = content.replace('''                const result = await callGeminiApi(prompt, userContext);

                const container = document.getElementById('questions-container');
                container.innerHTML = '';
                result.questions.forEach((q, i) => {
                    container.innerHTML += `
                        <div>
                            <label class="block text-sm text-orange-300 mb-1 font-medium">${q}</label>
                            <input type="text" data-q="${q}" class="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 outline-none" required>
                        </div>`;
                });
                showSection('questions');''', '''                const result = await callGeminiApi(prompt, userContext);
                intakeState.questions = result.questions; // Save to state

                const container = document.getElementById('questions-container');
                container.innerHTML = '';
                result.questions.forEach((qObj, index) => {
                    const questionText = typeof qObj === 'string' ? qObj : qObj.question;
                    const options = typeof qObj === 'string' ? [] : (qObj.options || []);
                    const qId = `question-input-${index}`;

                    let html = `<div class="bg-gray-900 p-4 rounded border border-gray-700 mb-4" data-q-index="${index}">
                        <label class="block text-sm text-orange-300 mb-3 font-medium">${questionText}</label>
                        <div class="space-y-2 mb-3">`;

                    if (options.length > 0) {
                        options.forEach((opt, optIndex) => {
                            const optId = `q-${index}-opt-${optIndex}`;
                            html += `
                            <label for="${optId}" class="flex items-start space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer group border border-transparent hover:border-gray-700 transition-all">
                                <input type="radio" name="q-${index}-radio" id="${optId}" value="${opt}" class="mt-1 form-radio text-orange-500 bg-gray-700 border-gray-500 focus:ring-orange-500 q-radio">
                                <span class="text-sm text-gray-300 group-hover:text-white transition-colors leading-tight">${opt}</span>
                            </label>`;
                        });

                        const otherId = `q-${index}-opt-other`;
                        html += `
                            <label for="${otherId}" class="flex items-start space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer group border border-transparent hover:border-gray-700 transition-all">
                                <input type="radio" name="q-${index}-radio" id="${otherId}" value="other" class="mt-1 form-radio text-orange-500 bg-gray-700 border-gray-500 focus:ring-orange-500 q-radio">
                                <span class="text-sm text-gray-300 group-hover:text-white transition-colors leading-tight">Other (Type below)</span>
                            </label>`;
                    }

                    html += `</div>
                        <input type="text" id="${qId}" data-q="${questionText}" class="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 outline-none transition-colors ${options.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}" placeholder="${options.length > 0 ? 'Select an option above, or choose Other to type...' : 'Type answer...'}" ${options.length > 0 ? 'disabled' : ''}>
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

content = content.replace('''            intakeState.answers = [];
            document.querySelectorAll('#questions-container input').forEach(inp => {
                intakeState.answers.push({ q: inp.dataset.q, a: inp.value });
            });''', '''            intakeState.answers = [];
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

                intakeState.answers.push({ q: questionText, a: answerText });
            });''')

content = content.replace('''                OUTPUT JSON ONLY with this exact schema:
                {
                    "subjective": {
                        "hpi_paragraph": "A complete paragraph narrative of the HPI.",
                        "ros_bullets": ["ROS point 1", "ROS point 2"]
                    },
                    "assessment": {
                        "synthesis_statement": "The most likely diagnosis and reasoning supported by evidence.",
                        "ddx": [
                            {"name": "Diagnosis Name", "icd10": "ICD-10 Code", "desc": "One sentence description of why.", "likelihood": "e.g. High, Medium, Low"}
                        ]
                    },
                    "plan": {
                        "disposition": "Triage recommendation (e.g., Maintain Outpatient, ER Transfer, Admission, etc)",
                        "is_emergency": boolean,
                        "emergency_reason": "string or null",
                        "workup": ["Lab 1", "X-Ray View", "Consult Name"],
                        "treatment": ["Medication Name & Dose", "Non-pharm intervention", "Education topic"],
                        "profile": {
                            "days": number,
                            "commander_limitations": ["Limitation 1", "Limitation 2"],
                            "soldier_instructions": ["Instruction 1"]
                        }
                    },
                    "references": [
                        {"title": "Title of the Guideline/Article", "url": "https://valid-url.com"}
                    ]
                }''', '''                OUTPUT JSON ONLY with this exact schema:
                {
                    "thinking_process": "Extremely detailed internal reasoning narrative explaining pathophysiology, score calculation logic, and exhaustive treatment decisions.",
                    "subjective": {
                        "hpi_paragraph": "A complete paragraph narrative of the HPI.",
                        "ros_bullets": ["ROS point 1", "ROS point 2"]
                    },
                    "assessment": {
                        "synthesis_statement": "The most likely diagnosis and reasoning supported by evidence.",
                        "ddx": [
                            {"name": "Diagnosis Name", "icd10": "ICD-10 Code", "desc": "One sentence description of why.", "likelihood": "e.g. High, Medium, Low"}
                        ]
                    },
                    "plan": {
                        "disposition": [ {"intervention": "Triage recommendation (e.g., Maintain Outpatient, ER Transfer, Admission)", "is_primary": boolean, "rationale": "Detailed explanation"} ],
                        "is_emergency": boolean,
                        "emergency_reason": "string or null",
                        "workup": [ {"intervention": "Lab 1, X-Ray View, Consult Name", "is_primary": boolean, "rationale": "Detailed explanation"} ],
                        "treatment": [ {"intervention": "Medication Name & Dose, Non-pharm intervention", "is_primary": boolean, "rationale": "Detailed explanation"} ],
                        "profile": {
                            "days": number,
                            "commander_limitations": [ {"intervention": "Limitation 1", "is_primary": boolean, "rationale": "Detailed explanation"} ],
                            "soldier_instructions": [ {"intervention": "Instruction 1", "is_primary": boolean} ]
                        }
                    },
                    "references": [
                        {"title": "Title of the Guideline/Article", "url": "https://valid-url.com"}
                    ]
                }''')

content = content.replace('''            <h2 class="text-xl font-semibold mb-4 text-orange-500 border-b border-gray-700 pb-2">3. Review & Select Plan Items</h2>
            <p class="text-sm text-gray-400 mb-4">Review the AI suggestions. Uncheck items to exclude them from the final note.</p>
            <div id="error-message-review" class="error-box hidden"></div>''', '''            <h2 class="text-xl font-semibold mb-4 text-orange-500 pb-2 flex justify-between items-center border-b border-gray-700">
                <span>3. Review & Select Plan Items</span>
                <details id="thinking-process-details" class="bg-gray-900 border border-gray-700 rounded-md text-sm cursor-pointer ml-4">
                    <summary class="font-semibold text-gray-300 p-2 hover:bg-gray-800 transition rounded-md flex items-center outline-none select-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Thinking Process
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 text-gray-500 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div class="p-4 border-t border-gray-700 text-gray-300 bg-gray-800/50 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed" id="thinking-process-content">
                    </div>
                </details>
            </h2>
            <p class="text-sm text-gray-400 mb-4 mt-4">Review the AI suggestions. Uncheck items to exclude them from the final note.</p>
            <div id="error-message-review" class="error-box hidden"></div>''')

content = content.replace('''                    <div class="bg-gray-900 p-4 rounded border border-gray-700">
                        <h3 class="font-bold text-orange-400 mb-2 border-b border-gray-700 pb-1">Profile / Limitations</h3>
                        <div id="review-profile-container" class="space-y-2"></div>
                        <div class="mt-3 flex items-center bg-gray-800 p-2 rounded">''', '''                    <div class="bg-gray-900 p-4 rounded border border-gray-700">
                        <h3 class="font-bold text-orange-400 mb-2 border-b border-gray-700 pb-1">Disposition</h3>
                        <div id="review-disposition-container" class="space-y-2 mb-4"></div>

                        <h3 class="font-bold text-orange-400 mb-2 border-b border-gray-700 pb-1">Profile / Limitations</h3>
                        <div id="review-profile-container" class="space-y-2"></div>
                        <div class="mt-3 flex items-center bg-gray-800 p-2 rounded">''')

content = content.replace('''            // Helper for checkboxes
            const createCheckboxes = (containerId, items, category) => {
                const cont = document.getElementById(containerId);
                cont.innerHTML = '';
                items.forEach((item, idx) => {
                    cont.innerHTML += `
                        <label class="flex items-start space-x-2 p-2 rounded hover:bg-gray-800 cursor-pointer border border-transparent hover:border-gray-700 transition-colors">
                            <input type="checkbox" checked class="mt-1 text-orange-600 rounded focus:ring-orange-500 item-check" data-cat="${category}" data-val="${item}">
                            <span class="text-sm text-gray-300 leading-tight">${item}</span>
                        </label>
                    `;
                });
            };

            createCheckboxes('review-workup-container', soap.plan.workup, 'workup');
            createCheckboxes('review-treatment-container', soap.plan.treatment, 'treatment');
            createCheckboxes('review-profile-container', soap.plan.profile.commander_limitations, 'profile');

            document.getElementById('profile-days').value = soap.plan.profile.days;''', '''            // Thinking Process
            document.getElementById('thinking-process-content').textContent = soap.thinking_process || "No detailed thinking process provided by the model.";

            // Helper for checkboxes
            const createCheckboxes = (containerId, items, category) => {
                const cont = document.getElementById(containerId);
                if(!items || items.length === 0) {
                    cont.innerHTML = '<span class="text-gray-500 text-sm italic">None</span>';
                    return;
                }
                cont.innerHTML = items.map((i, idx) => {
                    const val = typeof i === 'object' ? i.intervention : i;
                    const isChecked = typeof i === 'object' ? i.is_primary : true;
                    const rationale = typeof i === 'object' && i.rationale ? i.rationale : null;
                    const safeRationale = rationale ? rationale.replace(/"/g, '&quot;') : '';

                    let html = `
                        <label class="flex items-start space-x-2 p-2 rounded hover:bg-gray-800 cursor-pointer border border-transparent hover:border-gray-700 transition-colors">
                            <input type="checkbox" ${isChecked ? 'checked' : ''} class="mt-1 text-orange-600 rounded focus:ring-orange-500 item-check" data-cat="${category}" data-val="${val}" data-rationale="${safeRationale}">
                            <div class="flex flex-col">
                                <span class="text-sm ${isChecked ? 'text-gray-200 font-medium' : 'text-gray-400'} leading-tight">${val}</span>`;

                    if (rationale) {
                        html += `<span class="text-xs text-gray-400 italic mt-1 leading-tight"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>${rationale}</span>`;
                    }

                    html += `</div></label>`;
                    return html;
                }).join('');
            };

            createCheckboxes('review-workup-container', soap.plan.workup, 'workup');
            createCheckboxes('review-treatment-container', soap.plan.treatment, 'treatment');
            createCheckboxes('review-profile-container', soap.plan.profile.commander_limitations, 'profile');
            createCheckboxes('review-disposition-container', soap.plan.disposition, 'disposition');

            document.getElementById('profile-days').value = soap.plan.profile.days;''')

content = content.replace('''            const getChecked = (cat) => {
                return Array.from(document.querySelectorAll(`.item-check[data-cat="${cat}"]:checked`)).map(cb => cb.dataset.val);
            };

            const selectedWorkup = getChecked('workup');
            const selectedTx = getChecked('treatment');
            const selectedProf = getChecked('profile');
            const profDays = document.getElementById('profile-days').value;''', '''            const getChecked = (cat) => Array.from(document.querySelectorAll(`.item-check[data-cat="${cat}"]:checked`)).map(c => ({
                val: c.dataset.val,
                rationale: c.dataset.rationale
            }));

            const selectedDisposition = getChecked('disposition');
            const selectedWorkup = getChecked('workup');
            const selectedTx = getChecked('treatment');
            const selectedProf = Array.from(document.querySelectorAll(`.item-check[data-cat="profile"]:checked`)).map(c => c.dataset.val);
            const profDays = document.getElementById('profile-days').value;''')

content = content.replace('''            note += `\nPLAN:\n`;
            note += `Disposition: ${soap.plan.disposition}\n\n`;

            note += `Workup (Labs/Rads/Consults):\n`;
            if(selectedWorkup.length) selectedWorkup.forEach(w => note += `- ${w}\n`);
            else note += `- None\n`;

            note += `\nTreatment / Education:\n`;
            if(selectedTx.length) selectedTx.forEach(t => note += `- ${t}\n`);
            else note += `- None\n`;

            note += `\nProfile (Duration: ${profDays} days):\n`;
            note += `Commander Limitations:\n`;
            if(selectedProf.length) selectedProf.forEach(l => note += `- ${l}\n`);
            else note += `- No specific limitations.\n`;''', '''            // Helper function to format items with their rationales
            const formatItems = (items) => {
                let out = "";
                items.forEach(i => {
                    out += `- ${i.val}\n`;
                    if (i.rationale) {
                        out += `    Rationale: ${i.rationale}\n`;
                    }
                });
                return out;
            };

            note += `\nPLAN:\n`;
            note += `Disposition:\n`;
            if(selectedDisposition.length) note += formatItems(selectedDisposition);
            else note += `- None selected\n\n`;

            note += `Workup (Labs/Rads/Consults):\n`;
            if(selectedWorkup.length) note += formatItems(selectedWorkup);
            else note += `- None\n`;

            note += `\nTreatment / Education:\n`;
            if(selectedTx.length) note += formatItems(selectedTx);
            else note += `- None\n`;

            note += `\nProfile (Duration: ${profDays} days):\n`;
            note += `Commander Limitations:\n`;
            if(selectedProf.length) selectedProf.forEach(l => note += `- ${l}\n`);
            else note += `- No specific limitations.\n`;''')

content = content.replace('''        function getPlanModifications() {
            // Helper to capture checkboxes in review section
            return {
                workup: Array.from(document.querySelectorAll('.item-check[data-cat="workup"]:checked')).map(cb => cb.dataset.val),
                treatment: Array.from(document.querySelectorAll('.item-check[data-cat="treatment"]:checked')).map(cb => cb.dataset.val),
                profile: Array.from(document.querySelectorAll('.item-check[data-cat="profile"]:checked')).map(cb => cb.dataset.val),
                profDays: document.getElementById('profile-days').value
            };
        }''', '''        function getPlanModifications() {
            // Helper to capture checkboxes in review section
            if (document.querySelectorAll('.item-check').length > 0) {
                return {
                    disposition: Array.from(document.querySelectorAll('.item-check[data-cat="disposition"]:checked')).map(cb => cb.dataset.val),
                    workup: Array.from(document.querySelectorAll('.item-check[data-cat="workup"]:checked')).map(cb => cb.dataset.val),
                    treatment: Array.from(document.querySelectorAll('.item-check[data-cat="treatment"]:checked')).map(cb => cb.dataset.val),
                    profile: Array.from(document.querySelectorAll('.item-check[data-cat="profile"]:checked')).map(cb => cb.dataset.val),
                    profDays: document.getElementById('profile-days').value
                };
            }
            return null;
        }''')

content = content.replace('''                // Capture Questions Answers
                const qInputs = document.querySelectorAll('#questions-container input');
                if (qInputs.length > 0) {
                    intakeState.answers = [];
                    qInputs.forEach(inp => {
                        intakeState.answers.push({ q: inp.dataset.q, a: inp.value });
                    });
                }''', '''                // Capture Questions Answers from DOM
                const questionInputs = document.querySelectorAll('#questions-container input[type="text"]');
                if (questionInputs.length > 0) {
                    intakeState.answers = [];
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
                        intakeState.answers.push({ q: inp.dataset.q, a: a });
                    });
                }''')

content = content.replace('''                // Restore Questions if they exist
                if (intakeState.questions && intakeState.questions.length > 0) {
                    const container = document.getElementById('questions-container');
                    container.innerHTML = '';
                    intakeState.questions.forEach(q => {
                        const ans = intakeState.answers ? intakeState.answers.find(a => a.q === q) : null;
                        const val = ans ? ans.a : "";
                        container.innerHTML += `
                            <div>
                                <label class="block text-sm text-orange-300 mb-1 font-medium">${q}</label>
                                <input type="text" data-q="${q}" value="${val}" class="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 outline-none" required>
                            </div>`;
                    });
                }

                // Restore Generated Plan/Review
                if (intakeState.generatedSoap) {
                    renderReview(intakeState.generatedSoap);

                    // Apply Modifications
                    if (saved.planModifications) {
                        const mods = saved.planModifications;
                        document.getElementById('profile-days').value = mods.profDays || "";

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
                }''', '''                // Restore Questions if they exist
                if (intakeState.questions && intakeState.questions.length > 0) {
                    const container = document.getElementById('questions-container');
                    container.innerHTML = '';
                    intakeState.questions.forEach((qObj, index) => {
                        const questionText = typeof qObj === 'string' ? qObj : qObj.question;
                        const options = typeof qObj === 'string' ? [] : (qObj.options || []);
                        const ansObj = intakeState.answers ? intakeState.answers.find(a => a.q === questionText) : null;
                        const val = ansObj ? ansObj.a : "";
                        const qId = `question-input-${index}`;

                        let html = `<div class="bg-gray-900 p-4 rounded border border-gray-700 mb-4" data-q-index="${index}">
                            <label class="block text-sm text-orange-300 mb-3 font-medium">${questionText}</label>
                            <div class="space-y-2 mb-3">`;

                        let isOptionSelected = false;
                        let isOtherSelected = false;

                        if (options.length > 0) {
                            options.forEach((opt, optIndex) => {
                                const optId = `q-${index}-opt-${optIndex}`;
                                const isChecked = val === opt;
                                if (isChecked) isOptionSelected = true;

                                html += `
                                <label for="${optId}" class="flex items-start space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer group border border-transparent hover:border-gray-700 transition-all">
                                    <input type="radio" name="q-${index}-radio" id="${optId}" value="${opt}" ${isChecked ? 'checked' : ''} class="mt-1 form-radio text-orange-500 bg-gray-700 border-gray-500 focus:ring-orange-500 q-radio">
                                    <span class="text-sm text-gray-300 group-hover:text-white transition-colors leading-tight">${opt}</span>
                                </label>`;
                            });

                            const otherId = `q-${index}-opt-other`;
                            if (val && !isOptionSelected) isOtherSelected = true;

                            html += `
                                <label for="${otherId}" class="flex items-start space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer group border border-transparent hover:border-gray-700 transition-all">
                                    <input type="radio" name="q-${index}-radio" id="${otherId}" value="other" ${isOtherSelected ? 'checked' : ''} class="mt-1 form-radio text-orange-500 bg-gray-700 border-gray-500 focus:ring-orange-500 q-radio">
                                    <span class="text-sm text-gray-300 group-hover:text-white transition-colors leading-tight">Other (Type below)</span>
                                </label>`;
                        }

                        const shouldDisableText = options.length > 0 && !isOtherSelected;
                        const textValue = isOtherSelected || options.length === 0 ? val : "";

                        html += `</div>
                            <input type="text" id="${qId}" data-q="${questionText}" value="${textValue}" class="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 outline-none transition-colors ${shouldDisableText ? 'opacity-50 cursor-not-allowed' : ''}" placeholder="${options.length > 0 ? 'Select an option above, or choose Other to type...' : 'Type answer...'}" ${shouldDisableText ? 'disabled' : ''}>
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

                // Restore Generated Plan/Review
                if (intakeState.generatedSoap) {
                    renderReview(intakeState.generatedSoap);

                    // Apply Modifications
                    if (saved.planModifications) {
                        const mods = saved.planModifications;
                        document.getElementById('profile-days').value = mods.profDays || "";

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

with open('ADTMCplus.html', 'w') as f:
    f.write(content)
