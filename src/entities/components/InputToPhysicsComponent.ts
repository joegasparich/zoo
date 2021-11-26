import { InputComponent, COMPONENT, Component, SimplePhysicsComponent } from ".";
import { Entity } from "..";

export default class InputToPhysicsComponent extends Component {
    public id: COMPONENT = "INPUT_TO_PHYSICS_COMPONENT";
    public type: COMPONENT = "INPUT_TO_PHYSICS_COMPONENT";
    public requires: COMPONENT[] = ["INPUT_COMPONENT", "SIMPLE_PHYSICS_COMPONENT"];

    public accelleration = 1;

    private input: InputComponent;
    private physics: SimplePhysicsComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.input = entity.getComponent("INPUT_COMPONENT");
        this.physics = entity.getComponent("SIMPLE_PHYSICS_COMPONENT");
    }

    public update(): void {
        this.physics.addForce(this.input.inputVector.multiply(this.accelleration));
    }
}
