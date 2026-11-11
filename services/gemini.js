// Thin client for the Gemini API's generateContent endpoint.
// The API key stays on this server; the app never sees it.

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

class GeminiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'GeminiError';
        this.status = status;
    }
}

/**
 * Sends a conversation to Gemini and returns the text of its answer.
 * Asks for JSON matching `schema`; callers should still parse defensively.
 */
async function generateJson({
    apiKey,
    model,
    systemInstruction,
    contents,
    schema,
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = 30000,
    fetchImpl = fetch,
}) {
    if (!apiKey) throw new GeminiError('GEMINI_API_KEY is not set', 503);

    const url = `${baseUrl.replace(/\/$/, '')}/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        }),
        signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
        // Keep Google's message for our logs, but never echo the request.
        let detail = '';
        try {
            const body = await response.json();
            detail = body?.error?.message || '';
        } catch (_) { /* not JSON */ }
        throw new GeminiError(`Gemini returned ${response.status}${detail ? `: ${detail}` : ''}`, response.status);
    }

    const data = await response.json();
    if (data?.promptFeedback?.blockReason) {
        return { blocked: true, text: '' };
    }
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((part) => part.text || '').join('');
    return { blocked: false, text };
}

module.exports = { generateJson, GeminiError, DEFAULT_BASE_URL };
