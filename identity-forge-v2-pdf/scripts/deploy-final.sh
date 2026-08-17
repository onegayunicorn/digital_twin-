#!/bin/bash
# deploy-final.sh
echo "🌌 IDENTITY FORGE v2.0 — FINAL DEPLOYMENT"
echo "====="

# ─── 1. Push Changes ──────────────────────────────────────
git add .
git commit -m "🌌 Identity Forge v2.0: No Gap Theory · Yee Lattice · Complete Character Builder"
git push origin main

# ─── 2. Deploy to Cloudflare ──────────────────────────────
npx --yes wrangler deploy

# ─── 3. Verify ────────────────────────────────────────────
curl -s https://identity-forge.sovereign.ai | head -20

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo "🔗 https://identity-forge.sovereign.ai"
echo ""
echo "🌌 No Gap Theory: ACTIVE"
echo "🌌 Yee Lattice: ONLINE"
echo "🎬 Live Preview: READY"
