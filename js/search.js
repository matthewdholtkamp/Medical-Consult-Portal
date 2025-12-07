import { siteContent } from './data.js';
import { switchView } from './ui.js';

// --- GLOBAL SEARCH LOGIC ---
export function handleGlobalSearch(term) {
    const resultsContainer = document.getElementById("search-results-container");
    const currentView = window.currentView || 'dashboard'; // fallback

    // If empty, return to dashboard
    if (!term.trim()) {
        switchView('dashboard');
        return;
    }

    // Switch to unified search view
    if (currentView !== 'search-results') {
        switchView('search-results');
    }

    const lowerTerm = term.toLowerCase();

    // Filter site content
    const results = siteContent.filter(item =>
        item.title.toLowerCase().includes(lowerTerm) ||
        item.desc.toLowerCase().includes(lowerTerm) ||
        item.tags.toLowerCase().includes(lowerTerm)
    );

    // Render results
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                <span class="material-symbols-outlined text-4xl mb-4 opacity-50">search_off</span>
                <p>No matching resources found for "${term}"</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = results.map(item => {
            let iconHtml = '';
            // Customize icon based on type
            if (item.type === 'consult') iconHtml = `<div class="w-10 h-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center mb-4"><span class="material-symbols-outlined text-${item.color}-400">medical_services</span></div>`;
            else if (item.type === 'journal') iconHtml = `<div class="w-10 h-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center mb-4"><span class="material-symbols-outlined text-${item.color}-400">menu_book</span></div>`;
            else if (item.type === 'tool' || item.type === 'military') iconHtml = `<div class="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center mb-4"><span class="material-symbols-outlined text-slate-300">${item.icon || 'link'}</span></div>`;

            // Note: action is a string like "openFrame(...)", we can use it directly in onclick
            // but since we are in a module, we depend on these being globally available or handled specially.
            // For now, we rely on them being globally available as per the plan.
            return `
            <div onclick="${item.action}" class="card bg-gemini-800 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <div class="flex items-start justify-between">
                    ${iconHtml}
                    <span class="text-[10px] uppercase font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded">${item.type}</span>
                </div>
                <h4 class="text-base font-bold text-slate-100 mb-1">${item.title}</h4>
                <p class="text-sm text-slate-500 leading-relaxed">${item.desc}</p>
            </div>
            `;
        }).join('');
    }
}
