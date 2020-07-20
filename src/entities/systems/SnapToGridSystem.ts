import { Vector } from "engine";
import { System } from "engine/entities/systems";

/**
 * Note: this should be added after any movement components
 */
export default class SnapToGridSystem extends System {
    public id = "SNAP_TO_GRID_SYSTEM";
    public gridSize: number;

    public constructor(gridSize?: number) {
        super();
        this.gridSize = gridSize ?? 1;
    }

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = this.entity.position.divide(this.gridSize).floor().multiply(this.gridSize).add(new Vector(0.5, 0.5));
    }
}
