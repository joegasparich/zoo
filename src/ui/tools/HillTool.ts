import { Graphics } from "engine";

import ZooGame from "ZooGame";
import { Config, Inputs } from "consts";
import PlacementGhost from "ui/PlacementGhost";
import { Elevation } from "world/ElevationGrid";
import { Tool, ToolType } from ".";

export default class BiomeTool extends Tool {
    public type = ToolType.Biome;

    private targetElevation: Elevation;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.targetElevation = data.elevation;

        ghost.reset();
        ghost.setDrawFunction(pos => {
            Graphics.setLineStyle(1, 0xFF0000);
            Graphics.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.WORLD_SCALE, 0xFF0000, 0.5);
        });
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        // TODO: Update every quarter of a second or something
        if (ZooGame.input.isInputHeld(Inputs.LeftMouse)) {
            ZooGame.world.elevationGrid.setElevation(mouseWorldPos, this.toolManager.radius, this.targetElevation);
        }
    }

    public postUpdate(): void {}
}
