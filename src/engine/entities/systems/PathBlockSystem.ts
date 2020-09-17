import { SYSTEM, System } from "engine/entities/systems";
import ZooGame from "ZooGame";
import { Entity } from "..";

export default class PathBlockSystem extends System {
    public id = SYSTEM.PATH_BLOCK_SYSTEM;
    public type = SYSTEM.PATH_BLOCK_SYSTEM;

    public start(entity: Entity): void {
        super.start(entity);

        ZooGame.map.setTileSolid(this.entity.position.floor(), true);
    }

    public end(): void {
        ZooGame.map.setTileSolid(this.entity.position.floor(), false);
    }
}
