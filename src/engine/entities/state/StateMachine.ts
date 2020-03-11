import { Entity } from "engine/entities";
import { IState, INPUT } from ".";

export default class StateMachine {
    currentState: IState;

    constructor(initialState: IState) {
        this.currentState = initialState;
    }

    update(entity: Entity, delta: number): void {
        this.currentState.update(entity, delta);
    }

    handleInput(input: INPUT): void {
        const newState = this.currentState.handleInput(input);
        if (newState) {
            this.setState(newState);
        }
    }

    setState(newState: IState): void {
        this.currentState.exit();
        this.currentState = newState;
        this.currentState.enter();
    }

    getState(): IState {
        return this.currentState;
    }
}