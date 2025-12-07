import { GEMINI_MODEL_ID } from './config.js';

/**
 * Shared function to call the Gemini API.
 *
 * @param {string} apiKey - The API Key (provided by the calling page).
 * @param {string} systemPrompt - The system instruction for the AI persona.
 * @param {string} userQuery - The user's input/context.
 * @param {number} retries - Number of times to retry on failure (default 3).
 * @returns {Promise<Object>} - The parsed JSON response from the AI.
 */
export async function callGeminiApi(apiKey, systemPrompt, userQuery, images = [], retries = 3) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${apiKey}`;

    // Construct Parts
    const parts = [{ text: userQuery }];

    // Append Images if present
    if (images && images.length > 0) {
        images.forEach(img => {
            // img should be { mime: "image/jpeg", data: "base64..." }
            parts.push({
                inline_data: {
                    mime_type: img.mime,
                    data: img.data
                }
            });
        });
    }

    const payload = {
        contents: [{ parts: parts }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No content generated");

        return JSON.parse(text);
    } catch (error) {
        if (retries > 0) {
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 + (3 - retries) * 1000));
            return callGeminiApi(apiKey, systemPrompt, userQuery, images, retries - 1);
        }
        throw error;
    }
}

/**
 * Shared function for simple text responses (chat/refinement).
 *
 * @param {string} apiKey - The API Key.
 * @param {string} systemPrompt - The system instruction.
 * @param {string} userQuery - The user's question.
 * @returns {Promise<string>} - The raw text response.
 */
export async function callGeminiText(apiKey, systemPrompt, userQuery) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}
