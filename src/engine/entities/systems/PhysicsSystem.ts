import { System } from ".";
import { Vector } from "engine";
import { Entity } from "..";
import { PhysicsManager } from "engine/managers";
import { Body } from "planck-js";
import { toVector, toVec2 } from "engine/helpers/util";

export default class PhysicsSystem extends System {

    id = "PHYSICS_SYSTEM";

    body: Body;

    start(entity: Entity): void {
        super.start(entity);

        this.body = entity.game.physicsManager.createPhysicsObject({
            position: this.entity.position,
            collider: {
                type: PhysicsManager.ColliderType.Circle,
                radius: 1,
            },
            isDynamic: true,
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
