import { Vector } from "engine";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { TileObjectData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import ZooGame from "ZooGame";

export default class TreeTool extends Tool {
    public type = ToolType.Tree;

    public set(ghost: PlacementGhost): void {
        const tree =  AssetManager.getJSON(Assets.OBJECTS.TREE) as TileObjectData;
        ghost.setSprite(tree.sprite);
        ghost.setPivot(tree.pivot);
        ghost.setSnap(true);
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        if (ZooGame.input.isInputPressed(Inputs.LeftMouse)) {
            const placePos: Vector = mouseWorldPos.floor();

            ZooGame.placeTileObject(Assets.OBJECTS.TREE, placePos);
        }
    }

    public postUpdate(): void {}
}
