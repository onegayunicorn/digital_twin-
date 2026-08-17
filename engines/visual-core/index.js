import { VisualCore } from './viewer.js';

document.addEventListener('DOMContentLoaded', () => {
    const core = new VisualCore('viewer-container');
    console.log('Visual Core Initialized');
    
    // Placeholder for loading character model
    // core.loadModel('/3d/skull-commander/scene.gltf')
    //     .then(() => console.log('Model loaded'))
    //     .catch(err => console.error('Error loading model:', err));
});
