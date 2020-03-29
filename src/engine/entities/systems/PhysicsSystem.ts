import { System, SYSTEM } from ".";
import { Vector } from "engine";
import { Collider } from "engine/managers";
import { Body } from "planck-js";
import { toVector, toVec2 } from "engine/helpers/util";
import { Entity } from "..";

export default class PhysicsSystem extends System {
    id = SYSTEM.PHYSICS_SYSTEM;

    collider: Collider;
    isDynamic: boolean;
    density: number;
    body: Body;

    constructor(collider: Collider, isDynamic: boolean, density = 10) {
        super();

        this.collider = collider;
        this.isDynamic = isDynamic;
        this.density = density;
    }

    start(entity: Entity) {
        super.start(entity);

        this.body = this.entity.game.physicsManager.createPhysicsObject({
            position: this.entity.position,
            collider: this.collider,
            isDynamic: this.isDynamic,
            density: this.density,
        });
    }

    update(delta: number): void {
        super.update(delta);

        this.entity.position = toVector(this.body.getPosition());
    }

    addForce(force: Vector): void {
        this.body.applyForceToCenter(toVec2(force), true);
    }
}
