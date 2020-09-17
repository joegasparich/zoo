import Game from "Game";
import { Config, Inputs } from "consts";
import PlacementGhost from "ui/PlacementGhost";
import { Elevation } from "world/ElevationGrid";
import { Tool, ToolType } from ".";
import Vector from "vector";
import Graphics from "Graphics";

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

        this.prevElevation = Game.world.elevationGrid.getGridCopy();
        this.prevWater = Game.world.waterGrid.getGridCopy();
    }

    public update(): void {

        // TODO: Update every quarter of a second or something
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            if (this.placementIntervalRef) return;
            this.placementIntervalRef = window.setInterval(() => {
                const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

                Game.world.elevationGrid.setElevationInCircle(mouseWorldPos, this.toolManager.radius, this.targetElevation);
            }, ELEVATION_UPDATE_INTERVAL);
        } else {
            window.clearInterval(this.placementIntervalRef);
            this.placementIntervalRef = undefined;
        }

        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            this.toolManager.pushAction({
                name: "Adjust Elevation",
                data: {
                    prevElevation: this.prevElevation,
                    prevWater: this.prevWater,
                },
                undo: (data: any): void => {
                    Game.world.elevationGrid.setGrid(data.prevElevation);
                    Game.world.biomeGrid.redrawAllChunks();
                    Game.world.waterGrid.setGrid(data.prevWater);
                    Game.world.waterGrid.draw();

                    this.prevElevation = Game.world.elevationGrid.getGridCopy();
                    this.prevWater = Game.world.waterGrid.getGridCopy();
                },
            });
        }
    }

    public postUpdate(): void {}
}
