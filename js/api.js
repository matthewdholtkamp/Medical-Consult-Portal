import { GEMINI_MODEL_ID, FALLBACK_MODEL_ID } from './config.js';

/**
 * Detect errors that justify falling back to the secondary model
 * (model retired, not found, unsupported, or unavailable).
 *
 * @param {Error} error
 * @returns {boolean}
 */
function shouldFallback(error) {
    const msg = (error && error.message) ? error.message.toLowerCase() : "";
    return (
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("not supported") ||
        msg.includes("unsupported") ||
        msg.includes("deprecat") ||
        msg.includes("retired") ||
        msg.includes("unavailable") ||
        msg.includes("503")
    );
}

/**
 * Build the request payload, applying caller-supplied options while
 * preserving backward-compatible defaults.
 *
 * @param {string} systemPrompt
 * @param {string} userQuery
 * @param {Object} options
 * @param {boolean} jsonMode - true to set responseMimeType to application/json by default.
 * @returns {Object} payload
 */
function buildPayload(systemPrompt, userQuery, options, jsonMode) {
    const {
        temperature,
        thinkingBudget,
        maxOutputTokens,
        chatHistory,
        responseMimeType,
        safetySettings,
        tools
    } = options || {};

    // Determine contents: multi-turn chat history overrides single-turn userQuery.
    const contents = Array.isArray(chatHistory) && chatHistory.length > 0
        ? chatHistory
        : [{ parts: [{ text: userQuery }] }];

    const generationConfig = {};

    // responseMimeType: explicit override wins; otherwise JSON mode sets it.
    if (responseMimeType !== undefined) {
        if (responseMimeType !== null) {
            generationConfig.responseMimeType = responseMimeType;
        }
    } else if (jsonMode) {
        generationConfig.responseMimeType = "application/json";
    }

    if (temperature !== undefined && temperature !== null) {
        generationConfig.temperature = temperature;
    }
    if (thinkingBudget !== undefined && thinkingBudget !== null) {
        generationConfig.thinkingConfig = { thinkingBudget };
    }
    if (maxOutputTokens !== undefined && maxOutputTokens !== null) {
        generationConfig.maxOutputTokens = maxOutputTokens;
    }

    const payload = { contents };
    if (systemPrompt) {
        payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }
    if (Object.keys(generationConfig).length > 0) {
        payload.generationConfig = generationConfig;
    }
    if (Array.isArray(safetySettings) && safetySettings.length > 0) {
        payload.safetySettings = safetySettings;
    }
    if (Array.isArray(tools) && tools.length > 0) {
        payload.tools = tools;
    }
    return payload;
}

/**
 * Extract { text, thoughts } from a Gemini candidate response.
 *
 * @param {Object} data
 * @returns {{text: string, thoughts: string}}
 */
function extractCandidate(data) {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    let text = "";
    let thoughts = "";
    for (const part of parts) {
        if (!part || typeof part.text !== "string") continue;
        if (part.thought === true) {
            thoughts += part.text;
        } else {
            text += part.text;
        }
    }
    return { text, thoughts };
}

/**
 * Shared function to call the Gemini API in JSON-response mode.
 *
 * Backward compatible: existing callers passing (apiKey, systemPrompt, userQuery)
 * continue to get the previous behavior (single-turn, temperature 1.0, JSON mode).
 *
 * @param {string} apiKey - The API Key (provided by the calling page).
 * @param {string} systemPrompt - The system instruction for the AI persona.
 * @param {string} userQuery - The user's input/context (ignored if options.chatHistory is provided).
 * @param {number} retries - Number of times to retry on failure (default 3).
 * @param {boolean} useFallback - Whether to use the fallback model (default false).
 * @param {Object} [options] - Optional per-call overrides.
 * @param {number} [options.temperature] - Sampling temperature. If omitted in a fresh call, defaults to 1.0 for backward compatibility.
 * @param {number} [options.thinkingBudget] - Reasoning thinking budget (Gemini 3.x).
 * @param {number} [options.maxOutputTokens] - Maximum output tokens.
 * @param {Array}  [options.chatHistory] - Multi-turn `contents` array (overrides userQuery).
 * @param {string} [options.responseMimeType] - Override response MIME type. Pass null to omit.
 * @param {boolean}[options.returnRaw] - If true, return { text, thoughts } instead of parsed JSON.
 * @param {Array}  [options.safetySettings] - Gemini safety settings (e.g., [{ category, threshold }, ...]).
 * @param {Array}  [options.tools] - Gemini tools array (e.g., [{ google_search: {} }]).
 * @returns {Promise<Object|{text:string,thoughts:string}>}
 */
export async function callGeminiApi(apiKey, systemPrompt, userQuery, retries = 3, useFallback = false, options) {
    const cleanKey = apiKey ? apiKey.trim() : "";
    const modelId = useFallback ? FALLBACK_MODEL_ID : GEMINI_MODEL_ID;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${cleanKey}`;

    // Backward-compat default: temperature 1.0 when caller did not pass options at all.
    const effectiveOptions = options ? { ...options } : { temperature: 1.0 };
    const payload = buildPayload(systemPrompt, userQuery, effectiveOptions, true);

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
            } catch (e) {
                // Ignore JSON parse error
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const { text: rawText, thoughts } = extractCandidate(data);

        if (effectiveOptions.returnRaw) {
            return { text: rawText, thoughts };
        }

        if (!rawText) throw new Error("No content generated");

        // Clean Markdown code blocks if present (e.g., ```json ... ```)
        const cleaned = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        // If the primary model is unavailable/retired, switch to fallback immediately.
        if (!useFallback && shouldFallback(error)) {
            console.warn(`Primary model ${GEMINI_MODEL_ID} failed (${error.message}); switching to fallback ${FALLBACK_MODEL_ID}.`);
            return callGeminiApi(apiKey, systemPrompt, userQuery, 3, true, options);
        }
        if (retries > 0) {
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 + (3 - retries) * 1000));
            return callGeminiApi(apiKey, systemPrompt, userQuery, retries - 1, useFallback, options);
        }
        // Last-chance fallback if we exhausted retries on the primary.
        if (!useFallback) {
            console.warn(`Primary model ${GEMINI_MODEL_ID} exhausted retries; trying fallback ${FALLBACK_MODEL_ID}.`);
            return callGeminiApi(apiKey, systemPrompt, userQuery, 3, true, options);
        }
        throw error;
    }
}

/**
 * Shared function for simple text responses (chat/refinement).
 *
 * Backward compatible: existing callers passing (apiKey, systemPrompt, userQuery)
 * continue to get the previous behavior (single-turn, temperature 1.0, plain text).
 *
 * @param {string} apiKey - The API Key.
 * @param {string} systemPrompt - The system instruction.
 * @param {string} userQuery - The user's question (ignored if options.chatHistory is provided).
 * @param {number} retries - Number of times to retry on failure (default 3).
 * @param {boolean} useFallback - Whether to use the fallback model (default false).
 * @param {Object} [options] - Optional per-call overrides (same shape as callGeminiApi).
 * @param {Array}  [options.safetySettings] - Gemini safety settings (e.g., [{ category, threshold }, ...]).
 * @param {Array}  [options.tools] - Gemini tools array (e.g., [{ google_search: {} }]).
 * @returns {Promise<string|{text:string,thoughts:string}>}
 */
export async function callGeminiText(apiKey, systemPrompt, userQuery, retries = 3, useFallback = false, options) {
    const cleanKey = apiKey ? apiKey.trim() : "";
    const modelId = useFallback ? FALLBACK_MODEL_ID : GEMINI_MODEL_ID;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${cleanKey}`;

    // Backward-compat default: temperature 1.0 when caller did not pass options at all.
    const effectiveOptions = options ? { ...options } : { temperature: 1.0 };
    const payload = buildPayload(systemPrompt, userQuery, effectiveOptions, false);

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
            } catch (e) {
                // Ignore JSON parse error
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const { text, thoughts } = extractCandidate(data);

        if (effectiveOptions.returnRaw) {
            return { text, thoughts };
        }
        return text || "No response.";
    } catch (error) {
        // If the primary model is unavailable/retired, switch to fallback immediately.
        if (!useFallback && shouldFallback(error)) {
            console.warn(`Primary model ${GEMINI_MODEL_ID} failed (${error.message}); switching to fallback ${FALLBACK_MODEL_ID}.`);
            return callGeminiText(apiKey, systemPrompt, userQuery, 3, true, options);
        }
        if (retries > 0) {
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 + (3 - retries) * 1000));
            return callGeminiText(apiKey, systemPrompt, userQuery, retries - 1, useFallback, options);
        }
        // Last-chance fallback if we exhausted retries on the primary.
        if (!useFallback) {
            console.warn(`Primary model ${GEMINI_MODEL_ID} exhausted retries; trying fallback ${FALLBACK_MODEL_ID}.`);
            return callGeminiText(apiKey, systemPrompt, userQuery, 3, true, options);
        }
        throw error;
    }
}
