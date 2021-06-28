import { Component } from "entities/components";
import Game from "Game";

export default class FollowMouseComponent extends Component {
    public id = "FOLLOW_MOUSE_COMPONENT";
    public type = "FOLLOW_MOUSE_COMPONENT";

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = Game.camera.screenToWorldPosition(Game.input.getMousePos());
    }
}
