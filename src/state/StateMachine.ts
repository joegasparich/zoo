import { State } from ".";

export default class StateMachine {
    private currentState: State;

    public constructor(initialState: State) {
        this.currentState = initialState;
    }

    public update(delta: number, ...opts: any[]): void {
        this.currentState.update && this.currentState.update(delta, ...opts);
    }

    public handleInput(input: string): void {
        const newState = this.currentState.handleInput(input);
        if (newState) {
            this.setState(newState);
        }
    }

    public setState(newState: State): void {
        this.currentState.exit && this.currentState.exit();
        this.currentState = newState;
        this.currentState.enter && this.currentState.enter();
    }

    public getState(): State {
        return this.currentState;
    }
}
