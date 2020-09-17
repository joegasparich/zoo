import Camera from "Camera";
import { Entity } from "entities";
import Game from "Game";
import { System, SYSTEM } from ".";

export default class CameraFollowSystem extends System {
    public id = SYSTEM.CAMERA_FOLLOW_SYSTEM;
    public type = SYSTEM.CAMERA_FOLLOW_SYSTEM;

    private camera: Camera;

    public start(entity: Entity): void {
        super.start(entity);

        this.camera = Game.camera;
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        this.camera.goToPosition(this.entity.position);
    }
}
