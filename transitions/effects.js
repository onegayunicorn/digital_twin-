export const Transitions = {
    fadeIn: (element, duration = 500) => {
        element.style.opacity = 0;
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms`;
        setTimeout(() => element.style.opacity = 1, 10);
    },
    
    fadeOut: (element, duration = 500) => {
        element.style.opacity = 1;
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 0;
        setTimeout(() => element.style.display = 'none', duration);
    },

    glitchEffect: () => {
        console.log('Glitch effect triggered for digital twin transition');
    }
};
