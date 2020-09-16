import { System } from "engine/entities/systems";
import ZooGame from "ZooGame";

export default class FollowMouseSystem extends System {
    public id = "FOLLOW_MOUSE_SYSTEM";
    public type = "FOLLOW_MOUSE_SYSTEM";

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());
    }
}
