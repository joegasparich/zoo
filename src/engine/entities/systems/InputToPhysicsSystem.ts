import { InputSystem, PhysicsSystem, SYSTEM, System } from ".";
import { Entity } from "..";

export default class InputToPhysicsSystem extends System {
    public id = SYSTEM.INPUT_TO_PHYSICS_SYSTEM;
    public type = SYSTEM.INPUT_TO_PHYSICS_SYSTEM;

    public accelleration = 50;

    private input: InputSystem;
    private physics: PhysicsSystem;

    public start(entity: Entity): void {
        super.start(entity);

        this.input = entity.getSystem(SYSTEM.INPUT_SYSTEM) as InputSystem;
        if (!this.input) {
            console.error("InputToPhysicsSystem requires InputSystem");
        }
        this.physics = entity.getSystem(SYSTEM.PHYSICS_SYSTEM) as PhysicsSystem;
        if (!this.physics) {
            console.error("InputToPhysicsSystem requires PhysicsSystem");
        }
    }

    public update(): void {
        this.physics.addForce(this.input.inputVector.multiply(this.accelleration));
    }
}