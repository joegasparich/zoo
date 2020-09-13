import { Graphics, Vector } from "engine";

import ZooGame from "ZooGame";
import { Config, Inputs } from "consts";
import PlacementGhost from "ui/PlacementGhost";
import { Elevation } from "world/ElevationGrid";
import { Tool, ToolType } from ".";

export default class WaterTool extends Tool {
    public type = ToolType.Water;

    private targetElevation: Elevation;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.targetElevation = data.elevation;

        ghost.reset();
        ghost.drawFunction = (pos: Vector): void => {
            Graphics.setLineStyle(1, 0x0000FF);
            Graphics.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.WORLD_SCALE, 0x0000FF, 0.5);
        };
        ghost.setSpriteVisible(false);
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        // TODO: Update every quarter of a second or something
        if (ZooGame.input.isInputHeld(Inputs.LeftMouse)) {
            ZooGame.world.elevationGrid.setElevationInCircle(mouseWorldPos, this.toolManager.radius, this.targetElevation);
            // ZooGame.world.waterGrid.setWaterInCircle(mouseWorldPos, this.toolManager.radius, !!this.targetElevation);
        }
    }

    public postUpdate(): void {}
}
