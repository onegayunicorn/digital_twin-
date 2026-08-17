import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_CLOCK_SKEW_SECONDS = 300;

export function canonicalEventId(event) {
  return event.id ?? createHmac("sha256", "identity-forge-event-id").update(JSON.stringify(event)).digest("hex");
}

export function verifySignature({ rawBody, signature, secret, timestamp, now = Date.now() }) {
  if (!rawBody || !signature || !secret || !timestamp) return false;
  const age = Math.abs(Math.floor(now / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_CLOCK_SKEW_SECONDS) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const provided = Buffer.from(signature.replace(/^sha256=/, ""), "hex");
  const computed = Buffer.from(expected, "hex");
  return provided.length === computed.length && timingSafeEqual(provided, computed);
}

export function createWebhookHandler({ secret, store, now = () => Date.now() }) {
  if (!store || typeof store.has !== "function" || typeof store.add !== "function") {
    throw new Error("A durable idempotency store is required.");
  }

  return async function handleWebhook({ rawBody, headers = {} }) {
    const timestamp = headers["x-identity-timestamp"] ?? headers["X-Identity-Timestamp"];
    const signature = headers["x-identity-signature"] ?? headers["X-Identity-Signature"];
    if (!verifySignature({ rawBody, signature, secret, timestamp, now: now() })) {
      return { status: 401, body: { ok: false, error: "invalid_signature" } };
    }

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return { status: 400, body: { ok: false, error: "invalid_json" } };
    }

    const eventId = canonicalEventId(event);
    if (await store.has(eventId)) {
      return { status: 200, body: { ok: true, duplicate: true, event_id: eventId } };
    }

    await store.add(eventId, { receivedAt: now(), type: event.type ?? "unknown" });
    return { status: 202, body: { ok: true, accepted: true, event_id: eventId, action: "recorded_for_review" } };
  };
}

export class MemoryIdempotencyStore {
  #events = new Map();
  async has(id) { return this.#events.has(id); }
  async add(id, value) { this.#events.set(id, value); }
}
