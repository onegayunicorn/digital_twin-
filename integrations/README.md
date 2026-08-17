# Integrations

This directory contains provider adapters and event contracts. Provider credentials are never committed. Each adapter must expose a dry-run mode, validate payloads, and record an idempotency key before any external write.

Current boundaries include GitHub, Manus, Accio, Autohive, Hugging Face, Vercel, Cloudflare, and IPFS as planned integration surfaces. No provider is enabled by default.
