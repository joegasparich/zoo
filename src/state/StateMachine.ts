import { State } from ".";

export default class StateMachine<S extends State> {
    private currentState: S;

    public constructor(initialState: S) {
        this.currentState = initialState;
    }

    public update(delta: number, ...opts: any[]): void {
        this.currentState.update && this.currentState.update(delta, ...opts);
    }

    public setState(newState: S): void {
        this.currentState.exit?.();
        this.currentState = newState;
        this.currentState.enter?.();
    }

    public getState(): S {
        return this.currentState;
    }
}
