
// js/sharing.js

const JSONBIN_BASE_URL = "https://api.jsonbin.io/v3/b";

/**
 * Saves the current state to JSONBin.io
 * @param {string} apiKey - The JSONBin Master Key
 * @param {Object} state - The state object to save
 * @returns {Promise<string>} - The Bin ID
 */
export async function saveStateToBin(apiKey, state) {
    if (!apiKey) throw new Error("JSONBin API Key is missing. Please ask Dr. Holtkamp for the key or update the code.");
    if (!state) throw new Error("No state to save.");

    const response = await fetch(JSONBIN_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey,
            'X-Bin-Private': 'true', // Keeps it from being listed in public collection
            'X-Bin-Name': 'MedCon_Consult_' + Date.now()
        },
        body: JSON.stringify(state)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save state (Status ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.metadata.id;
}

/**
 * Loads the state from JSONBin.io using the Bin ID
 * @param {string} apiKey - The JSONBin Master Key
 * @param {string} binId - The Bin ID
 * @returns {Promise<Object>} - The saved state object
 */
export async function loadStateFromBin(apiKey, binId) {
    if (!apiKey) throw new Error("JSONBin API Key is missing.");
    if (!binId) throw new Error("Bin ID is missing.");

    const response = await fetch(`${JSONBIN_BASE_URL}/${binId}`, {
        method: 'GET',
        headers: {
            'X-Master-Key': apiKey
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to load state (Status ${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return data.record;
}

/**
 * Sets up the Share UI and Logic
 * @param {Object} config
 * @param {string} config.apiKey - The JSONBin API Key
 * @param {Function} config.getState - Function that returns the current state object to save
 * @param {Function} config.restoreState - Function that takes a state object and restores the UI
 */
export function setupSharing({ apiKey, getState, restoreState }) {
    // 1. Inject Share Button into Header
    // Looks for 'header' tag. If found, appends the button.
    const header = document.querySelector('header');
    if (header) {
        // Ensure header is relative for absolute positioning of button
        if(window.getComputedStyle(header).position === 'static') {
            header.style.position = 'relative';
        }

        const shareBtn = document.createElement('button');
        shareBtn.id = 'share-btn';
        shareBtn.className = "absolute top-0 right-0 mt-4 mr-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-md border border-slate-600 text-sm font-medium transition flex items-center shadow-sm z-10";
        shareBtn.innerHTML = `<i class="fa-solid fa-share-nodes mr-2 text-blue-400"></i> Share`;

        // Add font-awesome if missing (Consult pages might not have it)
        if (!document.querySelector('link[href*="font-awesome"]')) {
             const fa = document.createElement('link');
             fa.rel = "stylesheet";
             fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
             document.head.appendChild(fa);
        }

        header.appendChild(shareBtn);

        // 2. Inject Modal HTML
        const modalHtml = `
        <div id="share-modal" class="hidden fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm font-sans">
            <div class="bg-slate-800 p-6 rounded-lg shadow-2xl border border-slate-600 max-w-lg w-full mx-4 relative">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center">
                        <i class="fa-solid fa-share-nodes mr-2 text-blue-500"></i> Share Consult
                    </h3>
                    <button id="close-share-modal" class="text-slate-400 hover:text-white transition">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <p class="text-slate-300 text-sm mb-4">
                    Generate a secure link to share this consult with another physician.
                    They will see the exact current state and can make edits.
                </p>

                <div id="share-loading" class="hidden text-center py-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p class="text-slate-400 text-xs">Generating Link...</p>
                </div>

                <div id="share-result" class="hidden">
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Shareable Link</label>
                    <div class="flex space-x-2 mb-4">
                        <input type="text" id="share-link-input" readonly class="flex-1 bg-slate-900 border border-slate-600 text-white text-sm p-2 rounded focus:outline-none focus:border-blue-500">
                        <button id="copy-link-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition">
                            Copy
                        </button>
                    </div>
                    <p id="share-copy-msg" class="text-green-400 text-xs text-center hidden mb-2">Link copied to clipboard!</p>
                </div>

                <div id="share-error" class="hidden bg-red-900/30 border border-red-800 text-red-200 p-3 rounded text-sm mb-4"></div>

                <button id="generate-link-btn" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition border border-slate-500">
                    Generate Link
                </button>
            </div>
        </div>`;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // 2a. Inject Loading Overlay HTML
        const loadingOverlayHtml = `
        <div id="consult-loading-overlay" class="hidden fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] font-sans">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-slate-200 text-lg font-medium animate-pulse">Loading Shared Consult...</p>
        </div>`;
        const loadingOverlayContainer = document.createElement('div');
        loadingOverlayContainer.innerHTML = loadingOverlayHtml;
        document.body.appendChild(loadingOverlayContainer);

        // 3. Event Listeners
        const shareModal = document.getElementById('share-modal');
        const closeShareBtn = document.getElementById('close-share-modal');
        const generateLinkBtn = document.getElementById('generate-link-btn');
        const shareResult = document.getElementById('share-result');
        const shareLoading = document.getElementById('share-loading');
        const shareError = document.getElementById('share-error');
        const shareLinkInput = document.getElementById('share-link-input');
        const copyLinkBtn = document.getElementById('copy-link-btn');

        shareBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission if inside form
            shareModal.classList.remove('hidden');
            resetShareModal();
        });

        closeShareBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
        shareModal.addEventListener('click', (e) => {
            if(e.target === shareModal) shareModal.classList.add('hidden');
        });

        function resetShareModal() {
            shareResult.classList.add('hidden');
            shareLoading.classList.add('hidden');
            shareError.classList.add('hidden');
            generateLinkBtn.classList.remove('hidden');
        }

        generateLinkBtn.addEventListener('click', async () => {
            if(!apiKey) {
                shareError.textContent = "Error: JSONBin API Key is missing. Please update the 'jsonBinKey' variable in the HTML file.";
                shareError.classList.remove('hidden');
                return;
            }

            shareLoading.classList.remove('hidden');
            generateLinkBtn.classList.add('hidden');
            shareError.classList.add('hidden');

            try {
                const stateToSave = getState();
                if (!stateToSave) throw new Error("No state returned to save.");

                const binId = await saveStateToBin(apiKey, stateToSave);
                const url = new URL(window.location.href);
                url.searchParams.set('id', binId);

                shareLinkInput.value = url.toString();
                shareResult.classList.remove('hidden');
                shareLoading.classList.add('hidden');
            } catch (err) {
                console.error(err);
                shareError.textContent = "Failed to generate link: " + err.message;
                shareError.classList.remove('hidden');
                shareLoading.classList.add('hidden');
                generateLinkBtn.classList.remove('hidden');
            }
        });

        copyLinkBtn.addEventListener('click', () => {
            shareLinkInput.select();
            document.execCommand('copy');
            const msg = document.getElementById('share-copy-msg');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 2000);
        });

        // 4. Initialize Load State Logic
        async function initLoad() {
            const urlParams = new URLSearchParams(window.location.search);
            const binId = urlParams.get('id');

            if (binId) {
                if(!apiKey) {
                    console.warn("Consult ID found, but JSONBin API Key is missing.");
                    return;
                }

                const loadingOverlay = document.getElementById('consult-loading-overlay');
                if(loadingOverlay) loadingOverlay.classList.remove('hidden');

                try {
                    const loadedState = await loadStateFromBin(apiKey, binId);
                    restoreState(loadedState);
                    console.log("State restored from shared link.");
                } catch (err) {
                    console.error("Failed to load shared consult:", err);
                    alert("Failed to load shared consult: " + err.message);
                } finally {
                    if(loadingOverlay) loadingOverlay.classList.add('hidden');
                }
            }
        }

        // Run init immediately
        initLoad();
    }
}
