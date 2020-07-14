import { Vector } from "engine";
import { System } from "engine/entities/systems";

/**
 * Note: this should be added after any movement components
 */
export default class SnapToGridSystem extends System {
    id = "SNAP_TO_GRID_SYSTEM";

    update(delta: number): void {
        super.update(delta);

        this.entity.position = this.entity.position.floor().add(new Vector(0.5, 0.5));
    }
}
