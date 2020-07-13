import { Entity } from "engine/entities";
import { System, SYSTEM } from ".";
import { Camera } from "engine";

export default class CameraFollowSystem extends System {
    id = SYSTEM.CAMERA_FOLLOW_SYSTEM;

    camera: Camera;

    start(entity: Entity): void {
        super.start(entity);

        this.camera = entity.game.camera;
    }

    postUpdate(delta: number): void {
        super.postUpdate(delta);

        this.camera.goToPosition(this.entity.position);
    }
}
