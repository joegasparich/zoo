import { Vector } from "engine";

import { Inputs } from "consts";
import { TileObjectData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import ZooGame from "ZooGame";
import { AssetManager } from "engine/managers";
import { createTileObject } from "helpers/entityGenerators";

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
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        if (ZooGame.input.isInputPressed(Inputs.LeftMouse)) {
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
        if (!ZooGame.map.isPositionInMap(position)) return false;
        if (!ZooGame.map.isTileFree(position)) return false;

        if (!this.currentObject.canPlaceOnSlopes && ZooGame.world.elevationGrid.isPositionSloped(position)) return false;
        if (!this.currentObject.canPlaceInWater && ZooGame.world.waterGrid.isPositionWater(position)) return false;


        return true;
    }
}
