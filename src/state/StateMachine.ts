import { State } from ".";

export default class StateMachine<T extends State> {
    private currentState: T;

    public constructor(initialState: T) {
        this.currentState = initialState;
    }

    public update(delta: number, ...opts: any[]): void {
        this.currentState.update && this.currentState.update(delta, ...opts);
    }

    public setState(newState: T): void {
        this.currentState.exit?.();
        this.currentState = newState;
        this.currentState.enter?.();
    }

    public getState(): T {
        return this.currentState;
    }
}
