import { System } from "engine/entities/systems";

export default class FollowMouseSystem extends System {
    id = "FOLLOW_MOUSE_SYSTEM";

    update(delta: number): void {
        super.update(delta);

        this.entity.position = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());
    }
}
