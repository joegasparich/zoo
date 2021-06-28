import { InputComponent, PhysicsComponent, COMPONENT, Component } from ".";
import { Entity } from "..";

export default class InputToPhysicsComponent extends Component {
    public id = COMPONENT.INPUT_TO_PHYSICS_COMPONENT;
    public type = COMPONENT.INPUT_TO_PHYSICS_COMPONENT;

    public accelleration = 50;

    private input: InputComponent;
    private physics: PhysicsComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.input = entity.getComponent(COMPONENT.INPUT_COMPONENT) as InputComponent;
        if (!this.input) {
            console.error("InputToPhysicsComponent requires InputComponent");
        }
        this.physics = entity.getComponent(COMPONENT.PHYSICS_COMPONENT) as PhysicsComponent;
        if (!this.physics) {
            console.error("InputToPhysicsComponent requires PhysicsComponent");
        }
    }

    public update(): void {
        this.physics.addForce(this.input.inputVector.multiply(this.accelleration));
    }
}