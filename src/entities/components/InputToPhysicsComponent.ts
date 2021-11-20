import { InputComponent, PhysicsComponent, COMPONENT, Component } from ".";
import { Entity } from "..";

export default class InputToPhysicsComponent extends Component {
    public id: COMPONENT = "INPUT_TO_PHYSICS_COMPONENT";
    public type: COMPONENT = "INPUT_TO_PHYSICS_COMPONENT";
    public requires: COMPONENT[] = ["INPUT_COMPONENT", "PHYSICS_COMPONENT"];

    public accelleration = 50;

    private input: InputComponent;
    private physics: PhysicsComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.input = entity.getComponent("INPUT_COMPONENT");
        this.physics = entity.getComponent("PHYSICS_COMPONENT");
    }

    public update(): void {
        this.physics.addForce(this.input.inputVector.multiply(this.accelleration));
    }
}
