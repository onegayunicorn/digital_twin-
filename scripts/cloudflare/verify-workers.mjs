const workers = [
  { name: "genesis-cure-foundation", url: "https://genesis-cure-foundation.onegayunicorn.workers.dev" },
  { name: "alchemical", url: "https://alchemical.onegayunicorn.workers.dev" },
  { name: "kcd2-ai", url: "https://kcd2-ai.onegayunicorn.workers.dev" },
];

const timeoutMs = Number(process.env.WORKER_VERIFY_TIMEOUT_MS ?? 8000);

async function checkWorker(worker) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(worker.url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "identity-forge-worker-verifier/1.0" },
    });
    return { ...worker, ok: response.ok, status: response.status };
  } catch (error) {
    return { ...worker, ok: false, status: null, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

const results = await Promise.all(workers.map(checkWorker));
console.table(results);

if (process.argv.includes("--strict") && results.some((result) => !result.ok)) {
  process.exitCode = 1;
}
