import { Game, Vector } from "engine";
import { Entity } from "engine/entities";
import { PhysicsSystem, RenderSystem, InputSystem } from "engine/entities/systems";
import { StateMachine, IState, INPUT } from "engine/entities/state";

class Idle implements IState {
    handleInput(input: INPUT): IState | void {
        switch(input) {
        case INPUT.MOVE:
            return new Walking();
        default:
            return;
        }
    }
    enter(): void {}
    exit(): void {}
    update(): void {}
};

class Walking implements IState {
    handleInput(input: INPUT): IState | void {
        switch(input) {
        case INPUT.STILL:
            return new Idle();
        }
    }
    enter(): void {}
    exit(): void {}
    update(actor: Actor, delta: number): void {
        actor.physics.addForce(actor.input.inputVector.multiply(actor.accelleration));
    }
}

export default class Actor extends Entity {
    input: InputSystem;
    physics: PhysicsSystem;
    render: RenderSystem;

    state: StateMachine;

    accelleration = 100; // Temp

    constructor(game: Game, pos: Vector, inputSystem: InputSystem, physicsSystem: PhysicsSystem, renderSystem: RenderSystem) {
        super(game, pos);

        this.input = this.addSystem(inputSystem);
        this.physics = this.addSystem(physicsSystem);
        this.render = this.addSystem(renderSystem);

        this.state = new StateMachine(new Idle());
    }

    update(delta: number): void {
        super.update(delta);
        this.state.update(this, delta);
    }
}
