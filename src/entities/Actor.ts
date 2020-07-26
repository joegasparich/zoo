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
    public input: InputSystem;
    public physics: PhysicsSystem;
    public render: RenderSystem;
    public state: StateMachine;

    protected accelleration = 50; // Temp

    public constructor(game: Game, pos: Vector, inputSystem: InputSystem, physicsSystem: PhysicsSystem, renderSystem: RenderSystem) {
        super(game, pos);

        this.input = this.addSystem(inputSystem);
        this.physics = this.addSystem(physicsSystem);
        this.render = this.addSystem(renderSystem);

        this.state = new StateMachine(Actor.idle);
    }

    public update(delta: number): void {
        super.update(delta);
        this.state.update(delta, this);
    }

    public static idle: State = {
        handleInput(input) {
            switch(input) {
                case ActorStateInput.MOVE:
                    return Actor.walking;
                default:
                    return;
            }
        },
    };

    public static walking: State = {
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
