import { Vector } from "engine";

import { Inputs } from "consts";
import { TileObjectData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import ZooGame from "ZooGame";

export default class TileObjectTool extends Tool {
    public type = ToolType.TileObject;

    private currentObject: TileObjectData;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.currentObject =  data.object;

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

                const tileObject = ZooGame.world.placeTileObject(this.currentObject, placePos);

                this.toolManager.pushAction({
                    name: `Place ${this.currentObject.name}`,
                    data: { tileObject },
                    undo: (data: any): void => {
                        ZooGame.world.deleteTileObject(data.tileObject);
                    },
                });
            }
        }
    }

    public postUpdate(): void {}

    private canPlace(position: Vector): boolean {
        if (!ZooGame.map.isPositionInMap(position)) return false;

        if (!this.currentObject.canPlaceOnSlopes && ZooGame.world.elevationGrid.isPositionSloped(position)) return false;
        if (!this.currentObject.canPlaceInWater && ZooGame.world.waterGrid.isPositionWater(position)) return false;

        return true;
    }
}
