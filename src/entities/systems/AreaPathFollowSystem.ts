import { Vector } from "engine";
import { PathFollowSystem } from "engine/entities/systems";
import Wall from "world/Wall";
import ZooGame from "ZooGame";

export default class AreaPathFollowSystem extends PathFollowSystem {
    public game: ZooGame;

    private doorPath: Wall[];
    private currentDoor: Wall;

    public async pathTo(location: Vector): Promise<boolean> {
        const currentArea = this.game.world.getAreaAtPosition(this.entity.position);
        const targetArea = this.game.world.getAreaAtPosition(location);
        if (currentArea !== targetArea) {
            // TODO: Get door path with Djikstra
            // this.doorPath = getPath();
        } else {
            return super.pathTo(location);
        }
    }

    public followPath(speed: number): void {
        if (!this.doorPath) {
            super.followPath(speed);
            return;
        }

        // TODO: Follow door path
    }
}
