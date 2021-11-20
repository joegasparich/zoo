import { COMPONENT, Component } from "entities/components";
import Game from "Game";
import { Entity } from "..";

export default class PathBlockComponent extends Component {
    public id: COMPONENT = "PATH_BLOCK_COMPONENT";
    public type: COMPONENT = "PATH_BLOCK_COMPONENT";

    public start(entity: Entity): void {
        super.start(entity);

        Game.map.setTileSolid(this.entity.position.floor(), true);
    }

    public end(): void {
        Game.map.setTileSolid(this.entity.position.floor(), false);
    }
}
