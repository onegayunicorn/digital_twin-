# Identity Forge v2.0 — Deployment Guide

## Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0 or yarn ≥ 1.22.0
- Modern browser with WebGL 2.0 support

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts Vite development server at `http://localhost:5173`

## Production Build

```bash
npm run build
```

Outputs to `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- tests/validation/hardening-validation.test.ts
```

## Linting

```bash
npm run lint
```

## Project Configuration

### Environment Variables

Create `.env` file in project root:

```env
VITE_ASSET_BASE_URL=
VITE_APP_TITLE=Identity Forge v2.0
```

### Vite Configuration

`vite.config.ts` — React plugin, port 5173, build output to `dist/`

### TypeScript Configuration

`tsconfig.json` — Strict mode, target ES2020, JSX React 17

## Docker Deployment

```bash
# Build image
docker build -t identity-forge-v2 .

# Run container
docker run -p 3000:80 identity-forge-v2
```

## Asset Deployment

Models and assets are served from:
- `/models/base-character.glb`
- `/models/morph-targets.glb`
- `/models/heritage-material.glb`
- `/assets/manifests/asset-manifest.json`

For CDN deployment, set `VITE_ASSET_BASE_URL` to your CDN base URL.

## Browser Support

| Browser | Minimum Version | WebGL | Notes |
|---------|----------------|-------|-------|
| Chrome | 90+ | ✅ Full | Recommended |
| Firefox | 88+ | ✅ Full | |
| Safari | 15+ | ✅ Full | |
| Edge | 90+ | ✅ Full | |

## Performance Considerations

- Default lattice resolution: 32 (32,768 points)
- For mobile devices, reduce to 16 (4,096 points)
- Frame renderer quality settings:
  - `low`: 8×8 grid
  - `medium`: 16×16 grid
  - `high`: 32×32 grid
  - `ultra`: 64×64 grid

## Security Checklist

✅ All user inputs clamped to valid ranges
✅ JSON imports parsed with try/catch
✅ Zustand state persisted per origin (browser security)
✅ No sensitive data logged
✅ Asset loading from configured base URL only

## Production Hardening

1. **Enable gzip/brotli compression** on static assets
2. **Set proper CORS headers** for CDN assets
3. **Use HTTPS** for all connections
4. **Set Content-Security-Policy** headers
5. **Enable long-term caching** for model files (content hash filenames)

## Troubleshooting

### WebGL Context Lost

The Scene3D component handles context loss gracefully. Reduce quality settings if this occurs frequently.

### Model Loading Issues

- Check browser console for CORS errors
- Verify model files exist in `/public/models/`
- Ensure file server sends correct MIME types for `.glb` files

### State Persistence

Character state is stored in `localStorage` under key `identity-forge-character`. Clear browser storage to reset.

## Monitoring

Key metrics to monitor in production:
- WebGL context loss rate
- Frame rendering time (target: <16ms)
- Memory usage (target: <256MB)
- Asset load success rate
