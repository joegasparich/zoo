import Vector from "vector";
import { PathFollowComponent, COMPONENT } from "entities/components";
import { PathFollowComponentSaveData } from "entities/components/PathFollowComponent";
import Area from "world/Area";
import Wall from "world/Wall";
import Game from "Game";

interface AreaPathFollowComponentSaveData extends PathFollowComponentSaveData {
    areaPath: string[];
    currentArea: string;
    currentDoor: number[];
    enterDoorPosition: number[];
    targetPosition: number[];
}

export default class AreaPathFollowComponent extends PathFollowComponent {
    public id = COMPONENT.AREA_PATH_FOLLOW_COMPONENT;
    public type = COMPONENT.PATH_FOLLOW_COMPONENT;

    private areaPath: Area[];
    private currentArea: Area;
    private currentDoor: Wall;
    private enterDoorPosition: Vector;
    private targetPosition: Vector;

    public async pathTo(location: Vector): Promise<boolean> {
        this.resetAreaPath();

        const currentArea = Game.world.getAreaAtPosition(this.entity.position);
        const targetArea = Game.world.getAreaAtPosition(location);
        if (currentArea !== targetArea) {
            const path = Game.world.findAreaPath(currentArea, targetArea);
            if (path) {
                this.areaPath = path;
                this.currentArea = this.areaPath.shift();
                this.targetPosition = location;
            }
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
                const targetTile = Game.world.wallGrid.getAdjacentTiles(this.currentDoor).find(tile => Game.world.getAreaAtPosition(tile) === this.currentArea);
                super.pathTo(targetTile);
            }
            // Head to door
            if (super.followPath(speed)) {
                // We've made it to the door
                // Get path through door
                this.enterDoorPosition = Game.world.wallGrid.getAdjacentTiles(this.currentDoor).find(tile => Game.world.getAreaAtPosition(tile) !== this.currentArea).add(new Vector(0.5));
            }
            if (this.enterDoorPosition) {
                // We are going through the door
                if (Vector.Distance(this.entity.position, this.enterDoorPosition) > 0.05) {
                    // Go through door
                    this.currentTarget = this.enterDoorPosition;
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

    public save(): AreaPathFollowComponentSaveData {
        return Object.assign({
            areaPath: this.areaPath?.map(area => area.id),
            currentArea: this.currentArea?.id,
            currentDoor: this.currentDoor && Vector.Serialize(this.currentDoor.gridPos),
            enterDoorPosition: this.enterDoorPosition && Vector.Serialize(this.enterDoorPosition),
            targetPosition: this.targetPosition && Vector.Serialize(this.targetPosition),
        }, super.save());
    }

    public load(data: AreaPathFollowComponentSaveData): void {
        super.load(data);

        this.areaPath = data.areaPath?.map(areaId => Game.world.getAreaById(areaId));
        this.currentArea = data.currentArea && Game.world.getAreaById(data.currentArea);
        if (data.currentDoor) {
            const {x, y} = Vector.Deserialize(data.currentDoor);
            this.currentDoor = Game.world.wallGrid.getWallByGridPos(x, y);
        }
        this.enterDoorPosition = data.enterDoorPosition && Vector.Deserialize(data.enterDoorPosition);
        this.targetPosition = data.targetPosition && Vector.Deserialize(data.targetPosition);
    }
}
