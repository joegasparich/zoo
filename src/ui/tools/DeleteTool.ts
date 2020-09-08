import { Vector } from "engine";
import { Side } from "engine/consts";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { WallData } from "types/AssetTypes";
import Wall, { WallSpriteIndex } from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";
import ZooGame from "ZooGame";

export default class DeleteTool extends Tool {
    public type = ToolType.Wall;

    private currentWall: WallData;

    private ghost: PlacementGhost;

    public set(ghost: PlacementGhost): void {
        this.ghost = ghost;

        this.currentWall =  AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.DoorHorizontal));
        ghost.setPivot(new Vector(0.5, 1));
        ghost.setSnap(true);
        ghost.canPlaceFunction = (pos: Vector): boolean => {
            const wall = ZooGame.world.wallGrid.getWallAtTile(pos.floor(), ZooGame.map.getTileQuadrantAtPos(ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos())));
            return wall?.exists && !wall.isDoor;
        };
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());
        const wallatMousePos = ZooGame.world.wallGrid.getWallAtTile(mouseWorldPos.floor(), ZooGame.map.getTileQuadrantAtPos(mouseWorldPos));

        if (ZooGame.input.isInputReleased(Inputs.LeftMouse)) {
            if (wallatMousePos) {
                ZooGame.world.wallGrid.deleteWallAtTile(mouseWorldPos.floor(), ZooGame.map.getTileQuadrantAtPos(mouseWorldPos));
            }
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        const quadrant = ZooGame.map.getTileQuadrantAtPos(mouseWorldPos);
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        switch (quadrant) {
            case Side.North:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.DoorHorizontal));
                this.ghost.setOffset(new Vector(0, -0.5));
                break;
            case Side.South:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.DoorHorizontal));
                this.ghost.setOffset(new Vector(0, 0.5));
                break;
            case Side.West:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.DoorVertical));
                this.ghost.setOffset(new Vector(-0.5, 0.5));
                break;
            case Side.East:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.DoorVertical));
                this.ghost.setOffset(new Vector(0.5, 0.5));
                break;
            default:
                break;
        }
    }
}
