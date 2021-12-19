import { COMPONENT, Component } from "entities/components";
import { ComponentSaveData } from "entities/components/Component";
import Vector from "vector";

/**
 * Note: this should be added after any movement components
 */

export interface SnapToGridComponentSaveData extends ComponentSaveData {
    gridSize: number;
}
export default class SnapToGridComponent extends Component {
    public id: COMPONENT = "SNAP_TO_GRID_COMPONENT";
    public type: COMPONENT = "SNAP_TO_GRID_COMPONENT";

    public gridSize: number;

    public constructor(gridSize?: number) {
        super();
        this.gridSize = gridSize ?? 1;
    }

    public update(delta: number): void {
        super.update(delta);

        this.entity.position = this.entity.position
            .divide(this.gridSize)
            .floor()
            .multiply(this.gridSize)
            .add(new Vector(0.5, 0.5));
    }

    public save(): SnapToGridComponentSaveData {
        return {
            ...super.save(),
            gridSize: this.gridSize,
        };
    }

    public load(data: SnapToGridComponentSaveData): void {
        super.load(data);

        this.gridSize = data.gridSize;
    }
}
