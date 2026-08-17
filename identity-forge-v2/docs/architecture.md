# Identity Forge v2.0 — Architecture

## System Overview

Identity Forge v2.0 is a mathematically hardened identity simulation system built around four core engines:

1. **5D Reflection Grid Engine** — Multi-dimensional reflection mapping
2. **Yee Lattice Morph-Target System** — 5D lattice for facial deformation
3. **Animation & Slide Transition Engine** — Picture stacking to form animations
4. **Digital Mirror & Picture Processing** — Real-time reflection processing

## Core State Model

The system state is represented as:

```
s_t = [g_t, m_t, r_t, a_t, p_t]
```

Where:
- `g_t` = Grid state (5D lattice points)
- `m_t` = Morph state (weighted target blends)
- `r_t` = Reflection state (mirror transforms)
- `a_t` = Animation state (frame sequences)
- `p_t` = Picture state (image processing)

System update: `s_{t+1} = Π_Ω(F(s_t, u_t))`
- `F` = Nonlinear system function
- `u_t` = Control input
- `Π_Ω` = Projection onto feasible set Ω

## Directory Structure

```
src/
├── core/                    # Core types and math utilities
├── engines/
│   ├── reflection/          # 5D reflection grid & Yee lattice
│   ├── animation/           # Slide sequencer & morph targets
│   └── mirror/              # Digital mirror & picture processing
├── components/
│   ├── Viewport/            # 3D viewport & visualization
│   ├── Mirror/              # Mirror UI components
│   ├── Editor/              # Character & animation editors
│   └── UI/                  # Generic UI components
├── store/                   # Zustand state management
├── hooks/                   # React hooks
└── utils/                   # Utilities (GLTF, manifest, compression)
```

## Mathematical Hardening Principles

### 1. Bounded State
All coordinates in `[-1, 1]^5`, all weights in `[0, 1]`

### 2. Deterministic
Seeded PRNG ensures reproducible results

### 3. Stable
Operator norm `||S||₂ ≤ 1` prevents numerical explosion

### 4. Invertible
Reflection transforms use orthogonal matrices: `R^T R = I`

### 5. Robust
Invalid inputs are clamped and projected onto feasible set

### 6. Smooth
Cubic Hermite interpolation guarantees C¹ continuity

## Data Flow

```
User Input → CharacterEditor → characterStore
                                     ↓
                           Scene3D (Three.js)
                                     ↓
                  ┌──────────────────────────────────┐
                  │  HardenedYeeLattice → MorphTargets│
                  │  ReflectionEngine → ReflectionGrid│
                  │  SlideSequencer → SlideTransition │
                  └──────────────────────────────────┘
                                     ↓
                           FrameRenderer → Canvas
```

## Energy Function

```
E_total = λ₁·E_grid + λ₂·E_morph + λ₃·E_anim + λ₄·E_reflect ≤ E_max
```

Default configuration:
- `lambdaGrid = 0.25`
- `lambdaMorph = 0.25`
- `lambdaAnim = 0.25`
- `lambdaReflect = 0.25`
- `maxEnergy = 10.0`

## Performance Characteristics

| Component | Complexity | Notes |
|-----------|-----------|-------|
| Yee Lattice Generation | O(n³) | Default resolution 32 = 32,768 points |
| Morph Weight Blending | O(m) | m = number of morph targets |
| Frame Interpolation | O(f) | f = number of frames |
| Gaussian Blur | O(n) | Separable convolution |
| 5D Reflection | O(1) per point | Orthogonal Givens rotations |

## Technology Stack

- **React 18.2** — UI framework
- **TypeScript 5.2** — Type safety
- **Three.js / React Three Fiber** — 3D rendering
- **Zustand 4.4** — State management (with persist middleware)
- **Vite 5.0** — Build tool
- **Vitest 1.0** — Testing framework
