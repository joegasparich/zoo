import { COMPONENT, Component } from "entities/components";
import Game from "Game";

export default class FollowMouseComponent extends Component {
    public id: COMPONENT = "FOLLOW_MOUSE_COMPONENT";
    public type: COMPONENT = "FOLLOW_MOUSE_COMPONENT";

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = Game.camera.screenToWorldPosition(Game.input.getMousePos());
    }
}
