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
        ghost.setPivot(new Vector(
            1/this.currentObject.size.x * this.currentObject.pivot.x,
            1/this.currentObject.size.y * this.currentObject.pivot.y,
        ));
        ghost.setScale(this.currentObject.scale || 1);
        ghost.setSnap(true);
        ghost.applyElevation();
        ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            if (this.canPlace(mouseWorldPos)) {
                const placePos: Vector = mouseWorldPos.floor();

                const tileObject = createTileObject(this.assetPath, placePos, this.currentObject.size);

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

    private canPlace(pos: Vector): boolean {
        const position = pos.floor();
        for (let i=0; i< this.currentObject.size.x; i++) {
            for (let j=0; j< this.currentObject.size.y; j++) {
                const pos = new Vector(position.x + i, position.y + j);
                if (!Game.map.isTileFree(pos)) return false;
                if (!Game.map.isPositionInMap(pos)) return false;
                if (!this.currentObject.canPlaceOnSlopes && Game.world.elevationGrid.isPositionSloped(pos)) return false;
                if (!this.currentObject.canPlaceInWater && Game.world.waterGrid.isPositionWater(pos)) return false;
            }
        }

        if (Game.world.wallGrid.areWallsInArea(position, this.currentObject.size)) return false;

        return true;
    }
}
