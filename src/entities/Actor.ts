import { Game, Vector } from "engine";
import { Entity } from "engine/entities";
import { PhysicsSystem, RenderSystem, InputSystem } from "engine/entities/systems";
import { StateMachine, State } from "engine/state";

export enum ActorStateInput {
    MOVE= "MOVE",
    STILL = "STILL",
    USE = "USE",
};

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

        this.state = new StateMachine(Actor.idle);
    }

    update(delta: number): void {
        super.update(delta);
        this.state.update(delta, this);
    }

    static idle: State = {
        handleInput(input) {
            switch(input) {
            case ActorStateInput.MOVE:
                return Actor.walking;
            default:
                return;
            }
        },
    };

    static walking: State = {
        handleInput(input) {
            switch(input) {
            case ActorStateInput.STILL:
                return Actor.idle;
            default:
                return;
            }
        },
        update(delta: number, actor: Actor): void {
            actor.physics.addForce(actor.input.inputVector.multiply(actor.accelleration));
        },
    };
}
