import { Vector } from "engine";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { TileObjectData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";

export default class TreeTool extends Tool {
    public type = ToolType.Tree;

    public set(ghost: PlacementGhost): void {
        const tree =  AssetManager.getJSON(Assets.OBJECTS.TREE) as TileObjectData;
        ghost.setSprite(tree.sprite);
        ghost.setPivot(tree.pivot);
        ghost.setSnap(true);
    }

    public update(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        if (this.game.input.isInputPressed(Inputs.LeftMouse)) {
            const placePos: Vector = mouseWorldPos.floor();

            this.game.placeTileObject(Assets.OBJECTS.TREE, placePos);
        }
    }

    public postUpdate(): void {}
}
