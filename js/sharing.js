// js/sharing.js

const JSONBIN_BASE_URL = "https://api.jsonbin.io/v3/b";

/**
 * Saves the current state to JSONBin.io
 * @param {string} apiKey - The JSONBin Master Key
 * @param {Object} state - The state object to save
 * @returns {Promise<string>} - The Bin ID
 */
export async function saveStateToBin(apiKey, state) {
    // Basic validation
    if (!apiKey) throw new Error("JSONBin API Key is missing.");
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
