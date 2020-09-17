import { Inputs } from "consts";
import { TileObjectData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import Game from "Game";
import { AssetManager } from "managers";
import { createTileObject } from "helpers/entityGenerators";
import Vector from "vector";

export default class TileObjectTool extends Tool {
    public type = ToolType.TileObject;

    private assetPath: string;
    private currentObject: TileObjectData;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.assetPath =  data.assetPath;
        this.currentObject = AssetManager.getJSON(this.assetPath) as TileObjectData;

        ghost.reset();
        ghost.setSprite(this.currentObject.sprite);
        ghost.setPivot(this.currentObject.pivot);
        ghost.setSnap(true);
        ghost.applyElevation();
        ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            if (this.canPlace(mouseWorldPos)) {
                const placePos: Vector = mouseWorldPos.floor();

                const tileObject = createTileObject(this.assetPath, placePos);

                this.toolManager.pushAction({
                    name: `Place ${this.currentObject.name}`,
                    data: { tileObject },
                    undo: (data: any): void => {
                        data.tileObject.remove();
                    },
                });
            }
        }
    }

    public postUpdate(): void {}

    private canPlace(position: Vector): boolean {
        if (!Game.map.isPositionInMap(position)) return false;
        if (!Game.map.isTileFree(position)) return false;

        if (!this.currentObject.canPlaceOnSlopes && Game.world.elevationGrid.isPositionSloped(position)) return false;
        if (!this.currentObject.canPlaceInWater && Game.world.waterGrid.isPositionWater(position)) return false;


        return true;
    }
}
