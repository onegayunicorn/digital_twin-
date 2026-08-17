export class StateMachine {
    constructor() {
        this.states = {};
        this.currentState = null;
    }

    addState(name, state) {
        this.states[name] = state;
    }

    transitionTo(name) {
        if (this.currentState && this.states[this.currentState].onExit) {
            this.states[this.currentState].onExit();
        }
        
        this.currentState = name;
        
        if (this.states[this.currentState].onEnter) {
            this.states[this.currentState].onEnter();
        }
    }
}
