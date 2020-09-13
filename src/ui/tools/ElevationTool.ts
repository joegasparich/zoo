import { Graphics, Vector } from "engine";

import ZooGame from "ZooGame";
import { Config, Inputs } from "consts";
import PlacementGhost from "ui/PlacementGhost";
import { Elevation } from "world/ElevationGrid";
import { Tool, ToolType } from ".";

const ELEVATION_UPDATE_INTERVAL = 50;

export default class ElevationTool extends Tool {
    public type = ToolType.Elevation;

    private targetElevation: Elevation;
    private prevElevation: Elevation[][];
    private prevWater: boolean[][];

    private placementIntervalRef: number;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.targetElevation = data.elevation;

        ghost.reset();
        ghost.drawFunction = (pos: Vector): void => {
            Graphics.setLineStyle(1, data.colour);
            Graphics.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.WORLD_SCALE, data.colour, 0.5);
        };
        ghost.setSpriteVisible(false);

        this.prevElevation = ZooGame.world.elevationGrid.getGridCopy();
        this.prevWater = ZooGame.world.waterGrid.getGridCopy();
    }

    public update(): void {

        // TODO: Update every quarter of a second or something
        if (ZooGame.input.isInputHeld(Inputs.LeftMouse)) {
            if (this.placementIntervalRef) return;
            this.placementIntervalRef = window.setInterval(() => {
                const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

                ZooGame.world.elevationGrid.setElevationInCircle(mouseWorldPos, this.toolManager.radius, this.targetElevation);
            }, ELEVATION_UPDATE_INTERVAL);
        } else {
            window.clearInterval(this.placementIntervalRef);
            this.placementIntervalRef = undefined;
        }

        if (ZooGame.input.isInputReleased(Inputs.LeftMouse)) {
            this.toolManager.pushAction({
                name: "Adjust Elevation",
                data: {
                    prevElevation: this.prevElevation,
                    prevWater: this.prevWater,
                },
                undo: (data: any): void => {
                    ZooGame.world.elevationGrid.setGrid(data.prevElevation);
                    ZooGame.world.biomeGrid.redrawAllChunks();
                    ZooGame.world.waterGrid.setGrid(data.prevWater);
                    ZooGame.world.waterGrid.draw();

                    this.prevElevation = ZooGame.world.elevationGrid.getGridCopy();
                    this.prevWater = ZooGame.world.waterGrid.getGridCopy();
                },
            });
        }
    }

    public postUpdate(): void {}
}
