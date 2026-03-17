import { GEMINI_MODEL, GEMINI_THINKING_LEVEL, GEMINI_API_VERSION } from './model_config.js';

/**
 * Shared function to call the Gemini API.
 */
export async function callGeminiApi(apiKey, systemPrompt, userQuery, retries = 3) {
    const cleanKey = apiKey ? apiKey.trim() : "";
    const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${cleanKey}`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 1.0,
            thinkingConfig: { thinkingLevel: GEMINI_THINKING_LEVEL }
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error && errorData.error.message) {
                    errorMsg += ` - ${errorData.error.message}`;
                }
            } catch (e) {}
            throw new Error(errorMsg);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No content generated");

        text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
        return JSON.parse(text);
    } catch (error) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000 + (3 - retries) * 1000));
            return callGeminiApi(apiKey, systemPrompt, userQuery, retries - 1);
        }
        throw error;
    }
}

/**
 * Shared function for simple text responses.
 */
export async function callGeminiText(apiKey, systemPrompt, userQuery) {
    const cleanKey = apiKey ? apiKey.trim() : "";
    const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${cleanKey}`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
            temperature: 1.0,
            thinkingConfig: { thinkingLevel: GEMINI_THINKING_LEVEL }
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = `API Error: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.error && errorData.error.message) {
                errorMsg += ` - ${errorData.error.message}`;
            }
        } catch (e) {}
        throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}
