import { System } from '.';
import { Vector } from "engine";
import { Entity } from '..';
import { PhysicsManager } from 'engine/managers';
import { Body } from 'planck-js';
import { toVector, toVec2 } from 'engine/helpers/util';

export default class PhysicsSystem extends System {

    id = "PHYSICS_SYSTEM"

    body: Body

    start(entity: Entity) {
        super.start(entity);

        this.body = entity.game.physicsManager.createPhysicsObject({
            position: this.entity.position,
            collider: {
                type: PhysicsManager.ColliderType.Circle,
                radius: 1
            },
            isDynamic: true
        });
    }

    update(delta: number) {
        super.update(delta);

        this.entity.position = toVector(this.body.getPosition()); // this.entity.position.add(this.velocity.multiply(delta / FRAME_RATE));
    }

    addForce(force: Vector) {
        this.body.applyForceToCenter(toVec2(force), true);
    }
}