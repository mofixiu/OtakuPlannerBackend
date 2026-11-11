const db = require('../../models/Connection');
const { generateJson, DEFAULT_BASE_URL } = require('../../services/gemini');
const {
    ASSISTANT_SCHEMA,
    validateChatRequest,
    buildSystemPrompt,
    toGeminiContents,
    parseAssistantReply,
} = require('../../services/assistant');

const DEFAULT_MODEL = 'gemini-3.6-flash';

async function loadPlannerContext(userId) {
    const [tasks] = await db.execute(
        'SELECT title, date, time, category, completed FROM tasks WHERE user_id = ?',
        [userId]
    );
    const [recurring] = await db.execute(
        'SELECT title, date, time, category, frequency FROM recurring_tasks WHERE user_id = ?',
        [userId]
    );
    const [categoryRows] = await db.execute(
        'SELECT name FROM categories WHERE user_id = ? ORDER BY name',
        [userId]
    );
    return { tasks, recurring, categories: categoryRows.map((row) => row.name) };
}

/**
 * POST /api/assistant/chat
 * Body: { messages: [{ role: 'user' | 'model', text }], today: 'YYYY-MM-DD', now: 'HH:MM' }
 * Replies: { status, data: { reply, suggested_tasks: [{ title, date, time, category }] } }
 */
const chat = async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ status: 'error', message: "The assistant isn't set up on the server yet." });
    }

    const request = validateChatRequest(req.body);
    if (request.error) {
        return res.status(400).json({ status: 'error', message: request.error });
    }

    try {
        const context = await loadPlannerContext(req.user.id);
        const systemInstruction = buildSystemPrompt({
            username: req.user.username,
            today: request.today,
            now: request.now,
            ...context,
        });

        const result = await generateJson({
            apiKey,
            model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
            baseUrl: process.env.GEMINI_API_BASE || DEFAULT_BASE_URL,
            systemInstruction,
            contents: toGeminiContents(request.messages),
            schema: ASSISTANT_SCHEMA,
        });

        const data = result.blocked
            ? { reply: "I can't help with that one. Ask me about your plans instead?", suggested_tasks: [] }
            : parseAssistantReply(result.text, {
                today: request.today,
                now: request.now,
                categories: context.categories,
            });

        return res.json({ status: 'success', data });
    } catch (error) {
        // Log what went wrong, never what the user wrote.
        console.error('Assistant request failed:', error.name, error.status || '', error.message);
        return res.status(502).json({
            status: 'error',
            message: "The assistant couldn't answer just now. Try again in a moment.",
        });
    }
};

module.exports = { chat };
