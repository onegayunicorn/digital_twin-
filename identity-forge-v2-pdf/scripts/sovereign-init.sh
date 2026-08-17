#!/bin/bash
# sovereign-init.sh
# Project Bootstrap Command for Sovereign Application Factory
#
# Usage: ./sovereign-init.sh PROJECT-NAME
#
# Creates the complete universal repository structure for any new project.

set -e

echo "🌌 SOVEREIGN INIT — Project Factory"
echo

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Usage: ./sovereign-init.sh PROJECT-NAME"
  exit 1
fi

echo "📁 Creating project: $PROJECT_NAME"

# ─── Create Directory Structure ──────────────────────────────
mkdir -p "$PROJECT_NAME"/{apps,packages,services,research,contracts,infra,integrations,docs,tests}
mkdir -p "$PROJECT_NAME"/apps/{web,mobile,admin,research}
mkdir -p "$PROJECT_NAME"/packages/{ui,types,api,crypto,ai,quantum}
mkdir -p "$PROJECT_NAME"/services/{api,workers,agents,jobs}
mkdir -p "$PROJECT_NAME"/research/{notebooks,simulations,datasets,experiments}
mkdir -p "$PROJECT_NAME"/contracts/{ethereum,other-chains}
mkdir -p "$PROJECT_NAME"/infra/{cloudflare,vercel,kubernetes,terraform}
mkdir -p "$PROJECT_NAME"/integrations/{github,manus,autohive,accio,lovable,huggingface,cloudflare,vercel,quantum}
mkdir -p "$PROJECT_NAME"/.github/workflows

# ─── Create Genesis Manifest ─────────────────────────────────
cat > "$PROJECT_NAME/PROJECT_GENESIS.yaml" <<EOF
project:
  id: $PROJECT_NAME
  name: $PROJECT_NAME
  version: 0.1.0
  codename: $PROJECT_NAME
  owner:
    organization: "Sovereign Systems"
    maintainer: "owner"

  vision:
    one_sentence: "A sovereign $PROJECT_NAME platform"

  problem:
    statement: "There is a need for $PROJECT_NAME"

  solution:
    statement: "$PROJECT_NAME solves the need"

  users:
    - public
    - enterprise
    - research

  domains:
    - software

  deployment_targets:
    - open_source
    - cloud
    - enterprise

  interfaces:
    - web
    - api

  research:
    required: false

  ai:
    required: true

  quantum:
    required: false

  commercial:
    required: false

  decentralized:
    required: false

  security:
    classification: public
    pii: false

  license:
    software: Apache-2.0
    documentation: CC-BY-4.0

  status:
    phase: genesis
    gate: 0
EOF

# ─── Create Package.json ────────────────────────────────────────
cat > "$PROJECT_NAME/package.json" <<EOF
{
  "version": "0.1.0",
  "name": "$PROJECT_NAME",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "build": "pnpm run --parallel build",
    "test": "pnpm run --parallel test",
    "typecheck": "pnpm run --parallel typecheck",
    "lint": "pnpm run --parallel lint"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "turbo": "^1.10.0"
  }
}
EOF

# ─── Create README ─────────────────────────────────────────────
cat > "$PROJECT_NAME/README.md" <<EOF
# $PROJECT_NAME

🌌 Sovereign Application Factory Project

## Quick Start

\`\`\`bash
cd $PROJECT_NAME
pnpm install
pnpm dev
\`\`\`

## Architecture

- **Sovereign Core** owns all specifications, source, and deployment manifests
- **Replaceable Providers** for all infrastructure services
- **Gated CI/CD** from idea to production

## License

Apache-2.0
EOF

echo ""
echo "✅ Project created: $PROJECT_NAME"
echo ""
echo "📋 Next Steps:"
echo "  cd $PROJECT_NAME"
echo "  pnpm install"
echo "  pnpm dev"
echo ""
echo "🌌 Sovereign by design."
