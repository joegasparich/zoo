import { System } from '.';
import { Vector } from "engine";

const LINEAR_DRAG = 0.1;

export default class PhysicsSystem extends System {

    id = "PHYSICS_SYSTEM"

    velocity: Vector;
    maxSpeed: number;

    constructor(maxSpeed: number) {
        super();

        this.velocity = new Vector(0, 0);
        this.maxSpeed = maxSpeed;
    }

    update(delta: number) {
        super.update(delta);

        this.velocity = this.velocity.multiply(1 - LINEAR_DRAG);
        if (this.velocity.magnitude() > this.maxSpeed) {
            this.velocity = this.velocity.truncate(this.maxSpeed);
        }

        this.entity.position = this.entity.position.add(this.velocity.multiply(delta));
    }

    addForce(force: Vector) {
        this.velocity = this.velocity.add(force);
    }
}