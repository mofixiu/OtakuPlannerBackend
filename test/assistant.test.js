const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const {
    validateChatRequest,
    buildSystemPrompt,
    parseAssistantReply,
    toGeminiContents,
    ASSISTANT_SCHEMA,
} = require('../services/assistant');
const { generateJson, GeminiError } = require('../services/gemini');
const { createAssistantRateLimit } = require('../middlewares/assistantRateLimit');
const requireUser = require('../middlewares/requireUser');

const today = '2026-11-11';
const now = '14:00';

function fakeRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

test('a normal chat request passes and keeps the phone\'s date and time', () => {
    const result = validateChatRequest({
        messages: [{ role: 'user', text: ' What is due tomorrow? ' }],
        today,
        now,
    });
    assert.deepEqual(result, { messages: [{ role: 'user', text: 'What is due tomorrow?' }], today, now });
});

test('bad chat requests are refused with a message for the user', () => {
    assert.ok(validateChatRequest({}).error);
    assert.ok(validateChatRequest({ messages: [] }).error);
    assert.ok(validateChatRequest({ messages: [{ role: 'user', text: '   ' }] }).error);
    assert.ok(validateChatRequest({ messages: [{ role: 'admin', text: 'hi' }] }).error);
    assert.ok(validateChatRequest({ messages: [{ role: 'user', text: 'x'.repeat(2001) }] }).error);
    assert.ok(validateChatRequest({ messages: [{ role: 'user', text: 'hi' }, { role: 'model', text: 'hello' }] }).error);
});

test('a conversation is trimmed to the last 20 turns and starts with the user', () => {
    const messages = [];
    for (let i = 0; i < 25; i++) messages.push({ role: i % 2 ? 'model' : 'user', text: `m${i}` });
    messages.push({ role: 'user', text: 'last' });
    const result = validateChatRequest({ messages, today, now });
    assert.ok(result.messages.length <= 20);
    assert.equal(result.messages[0].role, 'user');
    assert.equal(result.messages.at(-1).text, 'last');
});

test('missing or nonsense dates fall back to the server clock', () => {
    const result = validateChatRequest(
        { messages: [{ role: 'user', text: 'hi' }], today: '2026-02-30', now: '25:00' },
        new Date('2026-11-11T09:30:00Z')
    );
    assert.equal(result.today, '2026-11-11');
    assert.equal(result.now, '09:30');
});

test('the prompt lists overdue, done and upcoming tasks, and leaves out far-off ones', () => {
    const prompt = buildSystemPrompt({
        username: 'mofi',
        today,
        now,
        tasks: [
            { title: 'Finish essay', date: '2026-11-09', time: '10:00', category: 'Study', completed: 0 },
            { title: 'Gym', date: '2026-11-11T00:00:00.000Z', time: '18:00', category: 'Personal', completed: 1 },
            { title: 'Watch Frieren', date: '2026-11-12', time: '20:00', category: 'Anime', completed: 0 },
            { title: 'Far away', date: '2027-03-01', time: '09:00', category: 'Work', completed: 0 },
        ],
        recurring: [{ title: 'Laundry', date: '2026-11-01', time: '09:00', category: 'Personal', frequency: 'weekly' }],
        categories: ['Anime', 'Personal', 'Study'],
    });
    assert.match(prompt, /Wednesday 2026-11-11, 14:00/);
    assert.match(prompt, /2026-11-09 10:00 \[Study\] Finish essay \(overdue\)/);
    assert.match(prompt, /2026-11-11 18:00 \[Personal\] Gym \(done\)/);
    assert.match(prompt, /2026-11-12 20:00 \[Anime\] Watch Frieren\n/);
    assert.doesNotMatch(prompt, /Far away/);
    assert.match(prompt, /Laundry \[Personal\], weekly at 09:00/);
    assert.match(prompt, /Their categories: Anime, Personal, Study/);
});

test('a well-formed reply comes through, with categories matched to the user\'s own', () => {
    const text = JSON.stringify({
        reply: 'Here is a plan. Tap Add on the ones you want.',
        suggested_tasks: [
            { title: 'Revise chapter 3', date: '2026-11-12', time: '09:00', category: 'study' },
            { title: 'Rest', date: '2026-11-12', time: '11:00', category: '' },
        ],
    });
    const result = parseAssistantReply(text, { today, now, categories: ['Study'] });
    assert.equal(result.reply, 'Here is a plan. Tap Add on the ones you want.');
    assert.deepEqual(result.suggested_tasks, [
        { title: 'Revise chapter 3', date: '2026-11-12', time: '09:00', category: 'Study' },
        { title: 'Rest', date: '2026-11-12', time: '11:00', category: 'Personal' },
    ]);
});

test('suggestions in the past, at impossible times or repeated are dropped', () => {
    const text = JSON.stringify({
        reply: 'ok',
        suggested_tasks: [
            { title: 'Yesterday', date: '2026-11-10', time: '09:00', category: 'Study' },
            { title: 'Earlier today', date: today, time: '13:59', category: 'Study' },
            { title: 'Later today', date: today, time: '15:00', category: 'Study' },
            { title: 'Later today', date: today, time: '15:00', category: 'Study' },
            { title: 'Bad time', date: '2026-11-12', time: '13pm', category: 'Study' },
            { title: 'Bad date', date: '2026-02-30', time: '09:00', category: 'Study' },
            { title: '', date: '2026-11-12', time: '09:00', category: 'Study' },
        ],
    });
    const result = parseAssistantReply(text, { today, now, categories: [] });
    assert.deepEqual(result.suggested_tasks.map((task) => task.title), ['Later today']);
});

test('no more than five suggestions get through', () => {
    const suggested_tasks = Array.from({ length: 8 }, (_, i) => ({
        title: `Task ${i}`, date: '2026-11-20', time: `1${i}:00`, category: 'Work',
    }));
    const result = parseAssistantReply(JSON.stringify({ reply: 'ok', suggested_tasks }), { today, now });
    assert.equal(result.suggested_tasks.length, 5);
});

test('a reply that isn\'t JSON is shown as plain text, never an error', () => {
    assert.deepEqual(parseAssistantReply('Just text', { today, now }), { reply: 'Just text', suggested_tasks: [] });
    assert.equal(parseAssistantReply('', { today, now }).reply.length > 0, true);
    assert.equal(parseAssistantReply('{"reply": 5}', { today, now }).reply.length > 0, true);
});

test('the Gemini call sends the key in a header, the prompt and the JSON schema', async () => {
    let seen = null;
    const fetchImpl = async (url, options) => {
        seen = { url, options };
        return {
            ok: true,
            json: async () => ({ candidates: [{ content: { parts: [{ text: '{"reply":"hi",' }, { text: '"suggested_tasks":[]}' }] } }] }),
        };
    };
    const result = await generateJson({
        apiKey: 'test-key',
        model: 'gemini-test',
        baseUrl: 'https://example.test/v1beta/',
        systemInstruction: 'rules',
        contents: toGeminiContents([{ role: 'user', text: 'hello' }]),
        schema: ASSISTANT_SCHEMA,
        fetchImpl,
    });
    assert.equal(result.text, '{"reply":"hi","suggested_tasks":[]}');
    assert.equal(seen.url, 'https://example.test/v1beta/models/gemini-test:generateContent');
    assert.equal(seen.options.headers['x-goog-api-key'], 'test-key');
    assert.ok(!seen.url.includes('test-key'));
    const body = JSON.parse(seen.options.body);
    assert.equal(body.systemInstruction.parts[0].text, 'rules');
    assert.deepEqual(body.contents, [{ role: 'user', parts: [{ text: 'hello' }] }]);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
});

test('Gemini errors and blocked prompts are reported, not thrown blindly', async () => {
    const failing = async () => ({ ok: false, status: 429, json: async () => ({ error: { message: 'quota' } }) });
    await assert.rejects(
        generateJson({ apiKey: 'k', model: 'm', systemInstruction: '', contents: [], schema: {}, fetchImpl: failing }),
        (error) => error instanceof GeminiError && error.status === 429 && /quota/.test(error.message)
    );
    const blocked = async () => ({ ok: true, json: async () => ({ promptFeedback: { blockReason: 'SAFETY' } }) });
    const result = await generateJson({ apiKey: 'k', model: 'm', systemInstruction: '', contents: [], schema: {}, fetchImpl: blocked });
    assert.equal(result.blocked, true);
    await assert.rejects(generateJson({ apiKey: '', model: 'm', systemInstruction: '', contents: [], schema: {} }), GeminiError);
});

test('each user is limited per hour, separately', () => {
    let clock = 0;
    const limit = createAssistantRateLimit({ limit: 2, now: () => clock });
    const call = (id) => {
        const res = fakeRes();
        let passed = false;
        limit({ user: { id } }, res, () => { passed = true; });
        return passed ? 'ok' : res.statusCode;
    };
    assert.equal(call(1), 'ok');
    assert.equal(call(1), 'ok');
    assert.equal(call(1), 429);
    assert.equal(call(2), 'ok');
    clock += 60 * 60 * 1000 + 1;
    assert.equal(call(1), 'ok');
});

test('only requests with a valid login token reach the assistant', () => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const good = jwt.sign({ userId: 7, username: 'mofi' }, secret);
    const bad = jwt.sign({ userId: 7 }, 'some-other-secret');
    const attempt = (authorization) => {
        const req = { headers: authorization ? { authorization } : {} };
        const res = fakeRes();
        let passed = false;
        requireUser(req, res, () => { passed = true; });
        return passed ? req.user : res.statusCode;
    };
    assert.deepEqual(attempt(`Bearer ${good}`), { id: 7, username: 'mofi' });
    assert.equal(attempt(`Bearer ${bad}`), 401);
    assert.equal(attempt('Bearer nonsense'), 401);
    assert.equal(attempt(undefined), 401);
});
