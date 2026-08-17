# Identity Forge v2.0 — API Reference

## Zustand Stores

### useCharacterStore

Character state management with persistence.

```typescript
interface CharacterState {
  id: string;
  name: string;
  morphWeights: MorphWeights;
  appearance: { hair, clothing, facialFeatures, skinTone };
  animation: { currentFrame, isPlaying, fps };
  reflection: { intensity, depth, quality };
  yeeLattice: LatticePoint[];
  slideFrames: FrameData[];
}

// Actions
setMorphWeight(key: string, value: number)
setAppearance(key: string, value: any)
setAnimation(key: string, value: any)
setReflection(key: string, value: any)
setYeeLattice(lattice: LatticePoint[])
setSlideFrames(frames: FrameData[])
exportCharacter(): string
importCharacter(data: string)
reset()
```

### useAnimationStore

Animation sequence management.

```typescript
createAnimation(name: string, frames: FrameData[]): string
deleteAnimation(id: string)
addFrame(animationId: string, frame: FrameData)
removeFrame(animationId: string, frameIndex: number)
updateFrame(animationId: string, frameIndex: number, updates: Partial<FrameData>)
play() / pause()
setTime(time: number)
saveSnapshot(label: string)
restoreSnapshot(timestamp: number)
```

### useAssetStore

Asset loading and management.

```typescript
loadManifest(url?: string): Promise<void>
loadAsset(id: string): Promise<void>
loadAllAssets(): Promise<void>
getAssetUrl(id: string): string | null
isLoaded(id: string): boolean
getOverallProgress(): number
```

## React Hooks

### useReflection

```typescript
const {
  engine, points, intensity, depth, lastResult,
  setIntensity, setDepth, applyReflection,
  getIntensityAt, getGradient, reset, isReady
} = useReflection({ resolution, seed, initialIntensity, initialDepth });
```

### useYeeLattice

```typescript
const {
  engine, points, isGenerating, energy, morphCenters,
  generate, computeMemberships, computeReflection,
  getMorphWeights, enforceEnergyBound, reseed
} = useYeeLattice({ resolution, morphTargets, beta, seed, maxEnergy });
```

### useAnimation

```typescript
const {
  sequencer, animations, currentAnimation, currentTime, isPlaying,
  createAnimation, addFrame, play, stop,
  getFrameAtTime, computeSmoothness, optimizeSmoothness,
  exportAnimation, importAnimation, deleteAnimation
} = useAnimation({ autoPlay, defaultFps });
```

## Engine Classes

### HardenedYeeLatticeEngine

```typescript
new HardenedYeeLatticeEngine(config?)
generateLattice(): LatticePoint[]
computeMemberships(position: Vector5D): Map<string, number>
computeReflection(point: LatticePoint, depth: number): LatticePoint
getMorphWeights(target: string): Float32Array
computeEnergy(): number
enforceEnergyBound(): boolean
```

### HardenedMorphProcessor

```typescript
new HardenedMorphProcessor()
registerTarget(target: MorphTarget)
setWeight(targetId: string, value: number)
getNormalizedWeights(): MorphWeights
blendTargets(targetIds: string[], blendWeights?: number[]): Float32Array
computeRegularizationEnergy(): number
projectToFeasibleSet()
optimizeWeights(targetWeights, learningRate?)
```

### HardenedSlideSequencer

```typescript
new HardenedSlideSequencer()
createAnimation(name, frames, options?): HardenedAnimation
addFrame(animationId, frame)
play(animationId) / stop()
getFrameAtTime(animation, time): FrameData | null
computeSmoothness(animation): number
optimizeSmoothness(animationId)
exportAnimation(animationId): string
importAnimation(data): HardenedAnimation | null
```

### DigitalMirrorEngine

```typescript
new DigitalMirrorEngine()
processImage(imageData, options?): MirrorFrame
apply5DReflection(frame, depth): MirrorFrame
applyBlur(frame, radius?): MirrorFrame
getCurrentFrame(): MirrorFrame | null
getFrames(): MirrorFrame[]
setMaxFrames(max: number)
```

### PictureProcessor

```typescript
new PictureProcessor()
processPicture(image, depth?): Promise<PictureData>
generateDepthMap(imageData, maxDepth): Float32Array
generateReflectionMap(imageData): Float32Array
equalizeHistogram(imageData): ImageData
adjustBrightnessContrast(imageData, brightness, contrast): ImageData
createSlideTransition(pictureIds, baseDuration?): PictureData[]
```

### ReflectionFilter

```typescript
new ReflectionFilter(config?)
apply(imageData): ImageData
convolve(imageData, kernel): ImageData
applyBlur(imageData, radius): ImageData
applySharpen(imageData, strength?): ImageData
detectEdges(imageData): ImageData
enhanceEdges(imageData, strength): ImageData
adjustBrightnessContrast(imageData, brightness, contrast): ImageData
adjustSaturation(imageData, saturation): ImageData
toGrayscale(imageData): ImageData
invert(imageData): ImageData
mix(imageA, imageB, t): ImageData
```

### FiveDTransformEngine

```typescript
new FiveDTransformEngine()
createTransform(id, config?): Transform5DConfig
applyTransform(point, transform): Vector5D
reflectAcrossAxis(point, axis): Vector5D
rotate5D(point, angles): Vector5D
createReflectionMatrix(depth): Float32Array
composeTransforms(t1, t2): Transform5DConfig
validateTransform(transform): { valid, operatorNorm, orthogonal, issues }
projectToStable(transform): Transform5DConfig
```

## Core Utilities

### Math Functions

```typescript
clamp(value, min, max): number
clampVector5D(v): Vector5D
normalizeWeights(weights, epsilon?): MorphWeights
lerp(a, b, t): number
cubicHermite(t): number
hermiteInterpolation(p0, m0, p1, m1, t): number
operatorNorm(matrix): number
isOrthogonal(matrix, tolerance?): boolean
createIdentityMatrix5D(): Float32Array
```

### Compression

```typescript
compressJSON(obj): string
decompressJSON<T>(compressed): T | null
encodeRLE(values, tolerance?): Array<[number, number]>
decodeRLE(encoded): number[]
serializeFloat32Array(arr): string
deserializeFloat32Array(str): Float32Array
```

### GLTF Loading

```typescript
new GLTFLoaderUtil(manager?)
load(url, onProgress?): Promise<GLTFLoadResult>
applyMorphWeights(result, weights)
isCached(url): boolean
```
