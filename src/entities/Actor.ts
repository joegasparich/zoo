import { Game } from "Game";
import Vector from "types/vector";
import Entity from "entities/Entity";
import { PhysicsSystem, RenderSystem, InputSystem } from "entities/systems";
import { StateMachine } from "entities/state/StateMachine";
import IState, { INPUT } from "entities/state/State";

class Idle implements IState {
    handleInput(input: INPUT): IState | void {
        switch(input) {
            case INPUT.MOVE:
                return new Walking();
            default:
                return;
        }
    }
    enter() {}
    exit() {}
    update() {}
};

class Walking implements IState {
    handleInput(input: INPUT): IState | void {
        switch(input) {
            case INPUT.STILL:
                return new Idle();
        }
    }
    enter() {}
    exit() {}
    update(actor: Actor, delta: number) {
        actor.physics.addForce(actor.input.inputVector.multiply(actor.speed));
    }
}

export default class Actor extends Entity {
    input: InputSystem;
    physics: PhysicsSystem;
    render: RenderSystem;

    state: StateMachine;

    speed: number = 5; // Temp

    constructor(game: Game, pos: Vector, inputSystem: InputSystem, physicsSystem: PhysicsSystem, renderSystem: RenderSystem) {
        super(game, pos);

        this.input = this.addSystem(inputSystem);
        this.physics = this.addSystem(physicsSystem);
        this.render = this.addSystem(renderSystem);

        this.state = new StateMachine(new Idle());
    }

    update(delta: number) {
        super.update(delta);
        this.state.update(this, delta);
    }
}