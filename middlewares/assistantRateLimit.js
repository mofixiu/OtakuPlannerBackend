// Caps how often each user can ask the assistant, so a stuck button or a bad
// actor can't spend the Gemini credits. Kept in memory; it resets on restart.

const WINDOW_MS = 60 * 60 * 1000;

function createAssistantRateLimit({ limit = Number(process.env.ASSISTANT_HOURLY_LIMIT) || 30, now = () => Date.now() } = {}) {
    const requests = new Map();

    return function assistantRateLimit(req, res, next) {
        const key = String(req.user?.id ?? req.ip);
        const cutoff = now() - WINDOW_MS;
        const recent = (requests.get(key) || []).filter((time) => time > cutoff);
        if (recent.length >= limit) {
            requests.set(key, recent);
            return res.status(429).json({
                status: 'error',
                message: "You've asked a lot this hour. Try again a bit later.",
            });
        }
        recent.push(now());
        requests.set(key, recent);
        return next();
    };
}

module.exports = { createAssistantRateLimit };
