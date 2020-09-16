import { Entity } from "engine/entities";
import { System, SYSTEM } from ".";
import { Camera } from "engine";

export default class CameraFollowSystem extends System {
    public id = SYSTEM.CAMERA_FOLLOW_SYSTEM;
    public type = SYSTEM.CAMERA_FOLLOW_SYSTEM;

    private camera: Camera;

    public start(entity: Entity): void {
        super.start(entity);

        this.camera = this.game.camera;
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        this.camera.goToPosition(this.entity.position);
    }
}
