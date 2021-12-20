import Game from "Game";
import { Config, Inputs, WorldEvent } from "consts";
import PlacementGhost from "ui/PlacementGhost";
import { Elevation, ElevationSaveData } from "world/ElevationGrid";
import { Tool, ToolType } from ".";
import Vector from "vector";
import Graphics from "Graphics";
import Mediator from "Mediator";

const ELEVATION_UPDATE_INTERVAL = 100;

export default class ElevationTool extends Tool {
    public type = ToolType.Elevation;

    private targetElevation: Elevation;
    private prevElevation: ElevationSaveData;

    private placementIntervalRef: number;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.targetElevation = data.elevation;

        ghost.drawFunction = (pos: Vector): void => {
            Graphics.setLineStyle(1, data.colour);
            Graphics.drawCircle(
                pos.multiply(Config.WORLD_SCALE),
                this.toolManager.radius * Config.WORLD_SCALE,
                data.colour,
                0.5,
            );
        };
        ghost.setSpriteVisible(false);

        this.prevElevation = Game.world.elevationGrid.save();
    }

    public update(): void {
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            if (this.placementIntervalRef) return;
            this.placementIntervalRef = window.setInterval(() => {
                const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

                Game.world.elevationGrid.setElevationInCircle(
                    mouseWorldPos,
                    this.toolManager.radius,
                    this.targetElevation,
                );
            }, ELEVATION_UPDATE_INTERVAL);
        } else {
            window.clearInterval(this.placementIntervalRef);
            this.placementIntervalRef = undefined;
        }

        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            Mediator.fire(WorldEvent.ELEVATION_UPDATED);

            this.toolManager.pushAction({
                name: "Adjust Elevation",
                data: JSON.stringify(this.prevElevation),
                undo: (json: string): void => {
                    const data = JSON.parse(json) as ElevationSaveData;
                    Game.world.elevationGrid.load(data);
                    Game.world.biomeGrid.redrawAllChunks(); // TODO: optimise
                    Game.world.wallGrid.getAllWalls().forEach(wall => wall.updateSprite());

                    this.prevElevation = Game.world.elevationGrid.save();
                },
            });

            this.prevElevation = Game.world.elevationGrid.save();
        }
    }

    public postUpdate(): void {}
}
