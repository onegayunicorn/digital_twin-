# 🌌 Identity Forge v2.0

**5D Reflection Grid · Yee Lattice · Morph-Target Viewport · Animation Engine**

A mathematically hardened identity simulation system built with React, TypeScript, and Three.js.

## ✨ Features

| Component | Description | Status |
|-----------|-------------|--------|
| 5D Reflection Grid | Multi-dimensional reflection mapping | ✅ Complete |
| Yee Lattice | Morph-target lattice for facial deformation | ✅ Complete |
| Slide Transition | Picture stacking to form animations | ✅ Complete |
| Digital Mirror | Real-time reflection processing | ✅ Complete |
| Morph Targets | GLTF/GLB character deformation | ✅ Complete |
| Zustand State | Local draft persistence | ✅ Complete |
| Export/Import | JSON character export | ✅ Complete |
| CDN Asset Packs | Compressed GLB delivery | ✅ Complete |

## 🔬 Mathematical Hardening

The system is built on rigorous mathematical principles:

1. **Bounded State** — All coordinates in `[-1, 1]^5`, all weights in `[0, 1]`
2. **Deterministic** — Seeded PRNG ensures reproducible results
3. **Stable** — Operator norm `||S||₂ ≤ 1` prevents numerical explosion
4. **Invertible** — Reflection transforms use orthogonal matrices: `R^T R = I`
5. **Robust** — Invalid inputs clamped and projected onto feasible set
6. **Smooth** — Cubic Hermite interpolation guarantees C¹ continuity

### Core Formulation

```
s_{t+1} = Π_Ω(F(s_t, u_t))

E_total = λ₁·E_grid + λ₂·E_morph + λ₃·E_anim + λ₄·E_reflect ≤ E_max
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
identity-forge-v2/
├── src/
│   ├── core/                    # Core types & math utilities
│   ├── engines/
│   │   ├── reflection/          # 5D reflection & Yee lattice
│   │   ├── animation/           # Slide sequencer & morph targets
│   │   └── mirror/              # Digital mirror & picture processing
│   ├── components/
│   │   ├── Viewport/            # 3D viewport & visualization
│   │   ├── Mirror/              # Mirror UI components
│   │   ├── Editor/              # Character & animation editors
│   │   └── UI/                  # Generic UI components
│   ├── store/                   # Zustand state management
│   ├── hooks/                   # React hooks
│   └── utils/                   # Utilities
├── public/
│   ├── models/                  # GLB model files
│   └── assets/manifests/        # Asset manifests
├── tests/                       # Unit & integration tests
└── docs/                        # Documentation
```

## 🛠️ Technology Stack

- **React 18.2** — UI framework
- **TypeScript 5.2** — Type safety
- **Three.js / React Three Fiber** — 3D rendering
- **Zustand 4.4** — State management with persistence
- **Vite 5.0** — Build tool
- **Vitest 1.0** — Testing framework

## 📚 Documentation

- [Architecture](./docs/architecture.md) — System design & data flow
- [API Reference](./docs/api-reference.md) — Complete API documentation
- [Deployment](./docs/deployment.md) — Deployment & configuration guide

## 🧪 Testing

```bash
# Run all tests
npm test

# Run mathematical hardening validation
npm test -- tests/validation/hardening-validation.test.ts

# Run with UI
npm run test:ui
```

## 📜 License

MIT License

---

*"A flat picture is still 5D. Lined up behind one another, they form animations."*

🌌 Identity Forge v2.0 — Mathematically Hardened · Sovereign · Production Ready
