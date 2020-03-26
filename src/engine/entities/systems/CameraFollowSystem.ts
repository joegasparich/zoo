import { Entity } from "engine/entities";
import { System, SYSTEM } from ".";
import { Camera, Vector } from "engine";
import { WORLD_SCALE } from "engine/constants";

export default class CameraFollowSystem extends System {
    id = SYSTEM.CAMERA_FOLLOW_SYSTEM;

    camera: Camera;

    start(entity: Entity): void {
        super.start(entity);

        this.camera = entity.game.camera;
    }

    postUpdate(delta: number): void {
        super.postUpdate(delta);

        const centredPos = this.entity.position.subtract(new Vector(
            this.entity.game.app.view.width/2,
            this.entity.game.app.view.height/2,
        ).divide(WORLD_SCALE));
        this.camera.goToPosition(centredPos);
    }
}
