import { State } from ".";

export default class StateMachine {
    currentState: State;

    constructor(initialState: State) {
        this.currentState = initialState;
    }

    update(delta: number, ...opts: any[]): void {
        this.currentState.update && this.currentState.update(delta, ...opts);
    }

    handleInput(input: string): void {
        const newState = this.currentState.handleInput(input);
        if (newState) {
            this.setState(newState);
        }
    }

    setState(newState: State): void {
        this.currentState.exit && this.currentState.exit();
        this.currentState = newState;
        this.currentState.enter && this.currentState.enter();
    }

    getState(): State {
        return this.currentState;
    }
}
