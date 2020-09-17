import { System } from "entities/systems";
import Game from "Game";

export default class FollowMouseSystem extends System {
    public id = "FOLLOW_MOUSE_SYSTEM";
    public type = "FOLLOW_MOUSE_SYSTEM";

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = Game.camera.screenToWorldPosition(Game.input.getMousePos());
    }
}
