import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { createWebhookHandler, MemoryIdempotencyStore } from "./handler.mjs";
import { createTriggerDispatcher } from "./trigger.mjs";

const body = JSON.stringify({ id: "evt-1", type: "preview.refresh" });
const timestamp = 1700000000;
const secret = "test-secret";
const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

const headers = { "x-identity-timestamp": String(timestamp), "x-identity-signature": signature };

function fixedNow() { return timestamp * 1000; }

test("accepts a valid signed event and rejects its duplicate", async () => {
  const handler = createWebhookHandler({ secret, store: new MemoryIdempotencyStore(), now: fixedNow });
  const first = await handler({ rawBody: body, headers });
  const duplicate = await handler({ rawBody: body, headers });
  assert.equal(first.status, 202);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicate, true);
});

test("rejects invalid signatures", async () => {
  const handler = createWebhookHandler({ secret, store: new MemoryIdempotencyStore(), now: fixedNow });
  const result = await handler({ rawBody: body, headers: { ...headers, "x-identity-signature": "00" } });
  assert.equal(result.status, 401);
});

test("keeps trigger execution in dry-run mode by default", async () => {
  const audit = [];
  const dispatch = createTriggerDispatcher({ audit });
  const result = await dispatch({ event_id: "evt-1", action: "refresh_preview" });
  assert.equal(result.mode, "dry_run");
  assert.equal(audit.length, 1);
});
