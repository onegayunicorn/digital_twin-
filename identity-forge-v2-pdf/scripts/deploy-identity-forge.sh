#!/bin/bash
# deploy-identity-forge.sh
echo "🌌 IDENTITY FORGE v2.0 — DEPLOYMENT PIPELINE"
echo "====="

# ─── Phase 1: Clean Install ──────────────────────────────
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# ─── Phase 2: Type Check ──────────────────────────────────
echo "🔍 Running TypeScript check..."
pnpm tsc --noEmit

# ─── Phase 3: Build ───────────────────────────────────────
echo "🏗️ Building application..."
pnpm build

# ─── Phase 4: Test ────────────────────────────────────────
echo "🧪 Running tests..."
pnpm test

# ─── Phase 5: Deploy ──────────────────────────────────────
echo "🚀 Deploying to Cloudflare..."
npx --yes wrangler deploy

echo "✅ DEPLOYMENT COMPLETE"
echo "🔗 https://identity-forge.sovereign.ai"
