import { toggleSidebar, switchView, openFrame, filterCards, initDisclaimer } from './ui.js';
import { handleGlobalSearch } from './search.js';
import { askDrHoltkamp, resetConsult, startConsult } from './consult.js';

// --- Global Binding ---
// We bind these functions to the window object so that existing 
// HTML onclick="..." attributes like onclick="switchView('dashboard')" continue to work.
window.toggleSidebar = toggleSidebar;
window.switchView = switchView;
window.openFrame = openFrame;
window.filterCards = filterCards;
window.startConsult = startConsult; // New Function
window.handleGlobalSearch = handleGlobalSearch;
window.askDrHoltkamp = askDrHoltkamp;
window.resetConsult = resetConsult;

// Initialize default view
switchView('dashboard');

// Initialize Disclaimer
initDisclaimer();

// Initialize History
if (window.renderRecentActivity) window.renderRecentActivity();
