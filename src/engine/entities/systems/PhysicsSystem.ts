import { System, SYSTEM } from ".";
import { Vector } from "engine";
import { Collider } from "engine/managers";
import * as Planck from "planck-js";
import { Entity } from "..";

export default class PhysicsSystem extends System {
    id = SYSTEM.PHYSICS_SYSTEM;

    collider: Collider;
    isDynamic: boolean;
    density: number;
    body: Planck.Body;

    lastPosition: Vector;

    constructor(collider: Collider, isDynamic: boolean, density = 10) {
        super();

        this.collider = collider;
        this.isDynamic = isDynamic;
        this.density = density;
    }

    start(entity: Entity): void {
        super.start(entity);

        this.body = this.entity.game.physicsManager.createPhysicsObject({
            position: this.entity.position,
            collider: this.collider,
            isDynamic: this.isDynamic,
            density: this.density,
        });
        this.entity.game.physicsManager.registerBody(entity, this.body);
        this.lastPosition = this.entity.position;
    }

    update(delta: number): void {
        super.update(delta);
        if (this.entity.position !== this.lastPosition) {
            // Position has been altered somewhere, compensate
            this.body.setPosition(this.entity.position.toVec2());
        }

        this.entity.position = Vector.FromVec2(this.body.getPosition());
        this.lastPosition = this.entity.position;
    }

    addForce(force: Vector): void {
        this.body.applyForceToCenter(force.toVec2(), true);
    }
}
