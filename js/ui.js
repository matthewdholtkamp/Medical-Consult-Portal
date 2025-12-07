// State management
// We attach state to window so it's globally accessible if needed, 
// but primarily we manage it here.

// Initialize state
if (typeof window.currentView === 'undefined') window.currentView = 'dashboard';
if (typeof window.isSidebarOpen === 'undefined') window.isSidebarOpen = false;

export function toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    window.isSidebarOpen = !window.isSidebarOpen;

    if (window.isSidebarOpen) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('flex', 'fixed', 'inset-y-0', 'left-0', 'z-50', 'shadow-2xl');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex', 'fixed', 'inset-y-0', 'left-0', 'z-50', 'shadow-2xl');
        overlay.classList.add('hidden');
    }
}

export function switchView(viewId) {
    window.currentView = viewId;

    // Hide all views including iframe and search
    const views = ['view-dashboard', 'view-consults', 'view-journal', 'view-iframe', 'view-search-results'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Remove active styles from nav
    const navIds = ['nav-dashboard', 'nav-consults', 'nav-journal'];
    navIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('bg-blue-600/10', 'border', 'border-blue-600/20', 'text-white');
            el.classList.add('text-slate-400', 'hover:bg-white/5', 'hover:text-white');
        }
    });

    // Show selected view
    const viewEl = document.getElementById(`view-${viewId}`);
    if (viewEl) viewEl.classList.remove('hidden');

    // Set active style on nav (if it exists for this view)
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-400', 'hover:bg-white/5', 'hover:text-white');
        activeNav.classList.add('bg-blue-600/10', 'border', 'border-blue-600/20', 'text-white');
    }

    // Update Page Title
    const titles = {
        'dashboard': 'Dashboard',
        'consults': 'Consult Generator',
        'journal': 'Clinical Updates',
        'search-results': 'Search Results'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titles[viewId] || 'Portal';

    // Hide external link buttons
    const frameControls = document.getElementById('frame-controls');
    if (frameControls) frameControls.classList.add('hidden');

    // Close sidebar if on mobile
    if (window.innerWidth < 768 && window.isSidebarOpen) {
        toggleSidebar();
    }
}

export function openFrame(url, title) {
    // Hide all main views
    const views = ['view-dashboard', 'view-consults', 'view-journal', 'view-search-results'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Show iframe view
    const iframeContainer = document.getElementById('view-iframe');
    if (iframeContainer) iframeContainer.classList.remove('hidden');

    const frame = document.getElementById('main-frame');
    if (frame) frame.src = url;

    // Update Title
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = title;

    // Show External Link Controls
    const controls = document.getElementById('frame-controls');
    if (controls) {
        controls.classList.remove('hidden');
        controls.classList.add('flex');
    }

    const extBtn = document.getElementById('external-link-btn');
    if (extBtn) extBtn.href = url;

    // Reset sidebar active states
    const navIds = ['nav-dashboard', 'nav-consults', 'nav-journal'];
    navIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('bg-blue-600/10', 'border', 'border-blue-600/20', 'text-white');
            el.classList.add('text-slate-400', 'hover:bg-white/5', 'hover:text-white');
        }
    });

    // Close sidebar if on mobile
    if (window.innerWidth < 768 && window.isSidebarOpen) {
        toggleSidebar();
    }
}

export function filterCards() {
    const searchInput = document.getElementById("consult-search");
    if (!searchInput) return;

    const term = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll("#cardContainer .card");

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

// --- DISCLAIMER MODAL LOGIC ---
export function initDisclaimer() {
    const MODAL_KEY = 'consultDisclaimerAck_v2'; // Bumped version for new UI
    const modal = document.getElementById('disclaimerModal');
    const ackCheckbox = document.getElementById('ackCheckbox');
    const ackBtn = document.getElementById('ackBtn');
    const dontShowAgain = document.getElementById('dontShowAgain');
    const ackRow = document.getElementById('ackRow'); // The clickable container

    // Check history
    try {
        if (localStorage.getItem(MODAL_KEY)) {
            if (modal) modal.remove(); // Completely remove from DOM
            document.body.style.overflow = ''; // Ensure scroll is restored
            return;
        }
    } catch (e) { console.error(e); }

    // If we are here, show it
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Lock scroll
    }

    // Toggle Logic
    if (ackRow && ackCheckbox) {
        ackRow.addEventListener('click', (e) => {
            // Prevent double toggle if clicking the checkbox directly
            if (e.target !== ackCheckbox) {
                ackCheckbox.checked = !ackCheckbox.checked;
            }
            updateState();
        });
    }

    function updateState() {
        if (ackCheckbox.checked) {
            ackBtn.disabled = false;
            ackBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'translate-y-4', 'opacity-0');
            ackRow.classList.add('bg-blue-600/20', 'border-blue-500/50');
            ackRow.classList.remove('bg-gemini-800', 'border-slate-700');
        } else {
            ackBtn.disabled = true;
            ackBtn.classList.add('opacity-50', 'cursor-not-allowed');
            ackRow.classList.remove('bg-blue-600/20', 'border-blue-500/50');
            ackRow.classList.add('bg-gemini-800', 'border-slate-700');
        }
    }

    // Accept Logic
    window.acceptDisclaimer = function () {
        try {
            if (dontShowAgain && dontShowAgain.checked) {
                localStorage.setItem(MODAL_KEY, new Date().toISOString());
            }
        } catch (err) { }

        if (modal) {
            modal.style.opacity = '0';
            modal.style.backdropFilter = 'blur(0px)'; // Smooth blur removal
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 500);
        }
    };
}
