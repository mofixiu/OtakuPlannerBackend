// The planning assistant's rules: what it knows about the user, what it may
// answer with, and how its answers are checked before reaching the app.
// Pure functions only, so they can be tested without a database or network.

const MAX_TURNS = 20;
const MAX_TEXT_LENGTH = 2000;
const MAX_SUGGESTIONS = 5;
const MAX_TASK_LINES = 60;

const ASSISTANT_SCHEMA = {
    type: 'OBJECT',
    properties: {
        reply: { type: 'STRING' },
        suggested_tasks: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    date: { type: 'STRING', description: 'YYYY-MM-DD' },
                    time: { type: 'STRING', description: '24-hour HH:MM' },
                    category: { type: 'STRING' },
                },
                required: ['title', 'date', 'time', 'category'],
            },
        },
    },
    required: ['reply', 'suggested_tasks'],
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRealDate(value) {
    if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function addDays(isoDate, days) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + days));
    return date.toISOString().slice(0, 10);
}

function weekday(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
}

/** Reads a task's date as YYYY-MM-DD, whatever shape the database holds. */
function taskDay(value) {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value !== 'string') return null;
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
}

const MAX_PERSONA_LENGTH = 80;

/**
 * Anime mode sends the character the user picked: { name, series }. Only
 * letters, numbers and everyday punctuation get through, so a name can't
 * smuggle instructions into the prompt. Returns null when there's nothing usable.
 */
function cleanPersona(raw) {
    const clean = (value) =>
        typeof value === 'string'
            ? value.replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} .,'’:!?&()\-]/gu, '').replace(/ {2,}/g, ' ').trim().slice(0, MAX_PERSONA_LENGTH)
            : '';
    const name = clean(raw?.name);
    if (!name) return null;
    return { name, series: clean(raw?.series) };
}

/**
 * Checks the request from the app. Returns { messages, today, now, persona } or
 * { error } with a message fit to show the user.
 */
function validateChatRequest(body, serverNow = new Date()) {
    const raw = body?.messages;
    if (!Array.isArray(raw) || raw.length === 0) {
        return { error: 'Send at least one message.' };
    }
    const recent = raw.slice(-MAX_TURNS);
    const messages = [];
    for (const item of recent) {
        const role = item?.role === 'model' ? 'model' : item?.role === 'user' ? 'user' : null;
        const text = typeof item?.text === 'string' ? item.text.trim() : '';
        if (!role || !text) return { error: 'Each message needs a role and some text.' };
        if (text.length > MAX_TEXT_LENGTH) return { error: `Keep messages under ${MAX_TEXT_LENGTH} characters.` };
        messages.push({ role, text });
    }
    if (messages[messages.length - 1].role !== 'user') {
        return { error: 'The last message must be yours.' };
    }
    // Gemini expects the conversation to open with the user.
    while (messages.length && messages[0].role !== 'user') messages.shift();

    // The phone knows the user's local date and time; the server may not.
    const today = isRealDate(body?.today) ? body.today : serverNow.toISOString().slice(0, 10);
    const now = typeof body?.now === 'string' && TIME_RE.test(body.now) ? body.now : serverNow.toISOString().slice(11, 16);
    return { messages, today, now, persona: cleanPersona(body?.persona) };
}

/** Picks the tasks worth telling the model about: overdue, today and the next two weeks. */
function selectTasks(tasks, today) {
    const from = addDays(today, -7);
    const to = addDays(today, 14);
    return (tasks || [])
        .map((task) => ({ ...task, day: taskDay(task.date) }))
        .filter((task) => task.day && task.day >= from && task.day <= to)
        .sort((a, b) => (a.day + (a.time || '')).localeCompare(b.day + (b.time || '')))
        .slice(0, MAX_TASK_LINES);
}

function describeTask(task, today) {
    const done = task.completed === 1 || task.completed === true || task.completed === '1';
    const overdue = !done && task.day < today;
    const status = done ? ' (done)' : overdue ? ' (overdue)' : '';
    return `- ${task.day} ${task.time || '--:--'} [${task.category || 'Uncategorised'}] ${task.title}${status}`;
}

function describeRecurring(task) {
    return `- ${task.title} [${task.category || 'Uncategorised'}], ${task.frequency || 'repeating'} at ${task.time || 'no set time'}, from ${taskDay(task.date) || 'unknown date'}`;
}

function buildSystemPrompt({ username, today, now, tasks = [], recurring = [], categories = [], persona = null }) {
    const upcoming = selectTasks(tasks, today);
    const taskLines = upcoming.length
        ? upcoming.map((task) => describeTask(task, today)).join('\n')
        : '(none in the last week or the next two weeks)';
    const recurringLines = recurring.length
        ? recurring.slice(0, 20).map(describeRecurring).join('\n')
        : '(none)';
    const categoryList = categories.length ? categories.join(', ') : 'Personal, Work, Study';

    return `You are the assistant inside OtakuPlanner, a planner app for anime fans.
The user is ${username || 'the user'}. For them it is ${weekday(today)} ${today}, ${now}.

Their tasks (date, 24-hour time, [category], title):
${taskLines}

Their repeating tasks:
${recurringLines}

Their categories: ${categoryList}

How to answer:
- Use their real tasks when they ask about their schedule. Never invent tasks they don't have.
- Keep "reply" short: a few sentences, or a short list with "- " bullets. Plain text only: no markdown, bold, headings or tables.
${persona ? '' : "- A little anime flavour is fine; don't overdo it.\n"}- When they ask you to add, schedule or plan something, put each concrete task in "suggested_tasks" with a date (YYYY-MM-DD), a 24-hour time (HH:MM) and one of their categories (use Personal if none fits). The app shows these as cards they tap to add, so say "Tap Add on the ones you want". Never claim you've added anything yourself.
- Never suggest a task earlier than ${today} ${now}. Suggest at most ${MAX_SUGGESTIONS}.
- Otherwise leave "suggested_tasks" empty.
- If the question has nothing to do with planning, answer briefly and kindly.${persona ? voiceSection(persona) : ''}`;
}

/** How to sound in Anime mode. The name and show are quoted as data. */
function voiceSection({ name, series }) {
    const who = series ? `${JSON.stringify(name)} from ${JSON.stringify(series)}` : JSON.stringify(name);
    return `

Voice:
- The user picked the character ${who}. Answer as them, and make it unmistakable from the first sentence: their personality, attitude, confidence or bluntness and way of talking, the way a fan would recognise it. Speak as yourself to the user ("I"), but never introduce yourself or say your own name: just sound like them.
- Being in character never changes the facts: their tasks, dates, times and suggestions must be exactly what they'd be without the voice.
- Keep it light and short. No long quotes from the show and no spoilers.
- If they ask for plain answers or seem stressed, drop the act and help plainly.`;
}

function toGeminiContents(messages) {
    return messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] }));
}

function cleanSuggestion(item, { today, now, categories }) {
    const title = typeof item?.title === 'string' ? item.title.trim().slice(0, 100) : '';
    if (!title) return null;
    if (!isRealDate(item?.date) || item.date < today) return null;
    if (typeof item?.time !== 'string' || !TIME_RE.test(item.time)) return null;
    if (item.date === today && item.time < now) return null;

    let category = typeof item?.category === 'string' ? item.category.trim().slice(0, 50) : '';
    const known = categories.find((name) => name.toLowerCase() === category.toLowerCase());
    if (known) category = known;
    if (!category) category = 'Personal';
    return { title, date: item.date, time: item.time, category };
}

/**
 * Turns the model's text into { reply, suggested_tasks }, dropping anything
 * malformed or in the past. Never throws.
 */
function parseAssistantReply(text, { today, now, categories = [] }) {
    let parsed = null;
    try {
        parsed = JSON.parse(text);
    } catch (_) {
        parsed = null;
    }
    if (!parsed || typeof parsed !== 'object') {
        const reply = typeof text === 'string' ? text.trim() : '';
        return { reply: reply || "Sorry, I didn't catch that. Could you ask again?", suggested_tasks: [] };
    }
    const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Sorry, I didn't catch that. Could you ask again?";
    const suggestions = Array.isArray(parsed.suggested_tasks) ? parsed.suggested_tasks : [];
    const seen = new Set();
    const suggested_tasks = [];
    for (const item of suggestions) {
        const clean = cleanSuggestion(item, { today, now, categories });
        if (!clean) continue;
        const key = `${clean.title.toLowerCase()}|${clean.date}|${clean.time}`;
        if (seen.has(key)) continue;
        seen.add(key);
        suggested_tasks.push(clean);
        if (suggested_tasks.length === MAX_SUGGESTIONS) break;
    }
    return { reply, suggested_tasks };
}

module.exports = {
    ASSISTANT_SCHEMA,
    MAX_TURNS,
    MAX_TEXT_LENGTH,
    validateChatRequest,
    cleanPersona,
    selectTasks,
    buildSystemPrompt,
    toGeminiContents,
    parseAssistantReply,
};
