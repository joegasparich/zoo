import { System } from '.';
import { Vector } from "engine";
import { Entity } from '..';
import { PhysicsManager } from 'engine/managers';
import { FRAME_RATE } from 'engine/constants';

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

    start(entity: Entity) {
        super.start(entity);

        entity.game.physicsManager.createPhysicsObject(
            this.entity.position,
            {
                type: PhysicsManager.ColliderType.Circle,
                radius: 1
            },
            true
        );
    }

    update(delta: number) {
        super.update(delta);

        this.velocity = this.velocity.multiply(1 - LINEAR_DRAG);
        if (this.velocity.magnitude() > this.maxSpeed) {
            this.velocity = this.velocity.truncate(this.maxSpeed);
        }

        this.entity.position = this.entity.position.add(this.velocity.multiply(delta / FRAME_RATE));
    }

    addForce(force: Vector) {
        this.velocity = this.velocity.add(force);
    }
}