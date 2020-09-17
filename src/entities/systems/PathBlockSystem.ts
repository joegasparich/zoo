import { SYSTEM, System } from "entities/systems";
import Game from "Game";
import { Entity } from "..";

export default class PathBlockSystem extends System {
    public id = SYSTEM.PATH_BLOCK_SYSTEM;
    public type = SYSTEM.PATH_BLOCK_SYSTEM;

    public start(entity: Entity): void {
        super.start(entity);

        Game.map.setTileSolid(this.entity.position.floor(), true);
    }

    public end(): void {
        Game.map.setTileSolid(this.entity.position.floor(), false);
    }
}
