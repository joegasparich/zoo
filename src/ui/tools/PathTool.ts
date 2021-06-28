import { Inputs } from "consts";
import { PathData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import Game from "Game";
import { AssetManager } from "managers";
import Vector from "vector";
import Path from "world/Path";

export default class PathTool extends Tool {
    public type = ToolType.Path;

    private assetPath: string;
    private pathData: PathData;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.assetPath =  data.assetPath;
        this.pathData = AssetManager.getJSON(this.assetPath) as PathData;
        const spriteSheet = Path.pathSprites.get(this.pathData.spriteSheet);

        ghost.reset();
        ghost.setSpriteSheet(spriteSheet, 0);
        ghost.setSnap(true);
        ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            // if (this.canPlace(mouseWorldPos)) {
            //     const placePos: Vector = mouseWorldPos.floor();

            //     const tileObject = createTileObject(this.assetPath, placePos);

            //     this.toolManager.pushAction({
            //         name: `Place ${this.currentObject.name}`,
            //         data: { tileObject },
            //         undo: (data: any): void => {
            //             data.tileObject.remove();
            //         },
            //     });
            // }
        }
    }

    public postUpdate(): void {}

    private canPlace(position: Vector): boolean {
        if (!Game.map.isPositionInMap(position)) return false;
        if (!Game.map.isTileFree(position)) return false;

        if (Game.world.elevationGrid.isPositionSlopeCorner(position)) return false;
        if (Game.world.waterGrid.isPositionWater(position)) return false;

        return true;
    }
}
