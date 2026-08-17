const ALLOWED_ACTIONS = new Set(["record_event", "request_review", "refresh_preview"]);

export function createTriggerDispatcher({ handler, audit = [], liveMode = false }) {
  return async function dispatch(event) {
    const action = event.action ?? "record_event";
    if (!ALLOWED_ACTIONS.has(action)) {
      return { ok: false, status: 400, error: "action_not_allowed" };
    }
    const record = {
      event_id: event.event_id,
      action,
      mode: liveMode ? "enabled" : "dry_run",
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    audit.push(record);
    if (!liveMode) return { ok: true, status: 202, ...record };
    return handler(event, record);
  };
}
