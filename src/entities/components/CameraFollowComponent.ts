import Camera from "Camera";
import { Entity } from "entities";
import Game from "Game";
import { Component, COMPONENT } from ".";

export default class CameraFollowComponent extends Component {
    public id: COMPONENT = "CAMERA_FOLLOW_COMPONENT";
    public type: COMPONENT = "CAMERA_FOLLOW_COMPONENT";

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
