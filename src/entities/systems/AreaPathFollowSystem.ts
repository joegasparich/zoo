import { Vector } from "engine";
import { PathFollowSystem } from "engine/entities/systems";
import Area from "world/Area";
import Wall from "world/Wall";
import ZooGame from "ZooGame";

export default class AreaPathFollowSystem extends PathFollowSystem {
    private areaPath: Area[];
    private currentArea: Area;
    private currentDoor: Wall;
    private enterDoorPosition: Vector;
    private targetPosition: Vector;

    public async pathTo(location: Vector): Promise<boolean> {
        this.resetAreaPath();

        const currentArea = ZooGame.world.getAreaAtPosition(this.entity.position);
        const targetArea = ZooGame.world.getAreaAtPosition(location);
        if (currentArea !== targetArea) {
            this.areaPath = ZooGame.world.findAreaPath(currentArea, targetArea);
            this.currentArea = this.areaPath.shift();
            this.targetPosition = location;
        } else {
            return super.pathTo(location);
        }
    }

    public followPath(speed: number): boolean {
        if (this.areaPath?.length) {
            // We still have areas left to traverse
            if (!this.currentDoor) {
                // We don't have a new door to go to
                // Find and path to next door
                const nextArea = this.areaPath[0];
                let minDist = Infinity;
                this.currentArea.connectedAreas.get(nextArea).forEach((door: Wall) => {
                    const dist = Vector.Distance(this.entity.position, door.position);
                    if (dist < minDist) {
                        this.currentDoor = door;
                        minDist = dist;
                    }
                });
                // Go to tile just before door
                const targetTile = ZooGame.world.wallGrid.getAdjacentTiles(this.currentDoor).find(tile => ZooGame.world.getAreaAtPosition(tile) === this.currentArea);
                super.pathTo(targetTile);
            }
            // Head to door
            if (super.followPath(speed)) {
                // We've made it to the door
                // Get path through door
                this.enterDoorPosition = ZooGame.world.wallGrid.getAdjacentTiles(this.currentDoor).find(tile => ZooGame.world.getAreaAtPosition(tile) !== this.currentArea).add(new Vector(0.5));
            }
            if (this.enterDoorPosition) {
                // We are going through the door
                if (Vector.Distance(this.entity.position, this.enterDoorPosition) > 0.05) {
                    // Go through door
                    this.moveTowardTarget(this.enterDoorPosition, speed);
                } else {
                    // Finished going through door
                    this.enterDoorPosition = undefined;
                    this.currentDoor = undefined;
                    this.currentArea = this.areaPath.shift();
                    if (!this.areaPath.length) {
                        // Path to final destination
                        super.pathTo(this.targetPosition);
                    }
                }
            }
            return false;
        } else {
            // We have finished traversing areas, path as normal
            this.currentArea = undefined;
            this.currentDoor = undefined;
            return super.followPath(speed);
        }
    }

    private resetAreaPath(): void {
        super.resetPath();

        this.areaPath = undefined;
        this.currentArea = undefined;
        this.currentDoor = undefined;
        this.enterDoorPosition = undefined;
        this.targetPosition = undefined;
    }

    public hasPath(): boolean {
        if (this.areaPath?.length) return true;
        return super.hasPath();
    }
}
