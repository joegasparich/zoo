import { Vector } from "engine";
import { System } from "engine/entities/systems";
import { SystemSaveData } from "engine/entities/systems/System";

/**
 * Note: this should be added after any movement components
 */

export interface SnapToGridSystemSaveData extends SystemSaveData {
    gridSize: number;
}
export default class SnapToGridSystem extends System {
    public id = "SNAP_TO_GRID_SYSTEM";
    public type = "SNAP_TO_GRID_SYSTEM";

    public gridSize: number;

    public constructor(gridSize?: number) {
        super();
        this.gridSize = gridSize ?? 1;
    }

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = this.entity.position.divide(this.gridSize).floor().multiply(this.gridSize).add(new Vector(0.5, 0.5));
    }

    public save(): SnapToGridSystemSaveData {
        return Object.assign({
            gridSize: this.gridSize,
        }, super.save());
    }

    public load(data: SnapToGridSystemSaveData): void {
        super.load(data);

        this.gridSize = data.gridSize;
    }
}
