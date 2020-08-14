import { Vector } from "engine";
import { Side } from "engine/consts";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { WallData } from "types/AssetTypes";
import Wall, { WallSpriteIndex } from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";

export default class DoorTool extends Tool {
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
            const wall = this.game.world.wallGrid.getWallAtTile(pos.floor(), this.game.map.getTileQuadrantAtPos(this.game.camera.screenToWorldPosition(this.game.input.getMousePos())));
            return wall?.exists && !wall.isDoor;
        };
    }

    public update(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());
        const wallatMousePos = this.game.world.wallGrid.getWallAtTile(mouseWorldPos.floor(), this.game.map.getTileQuadrantAtPos(mouseWorldPos));

        if (this.game.input.isInputReleased(Inputs.LeftMouse)) {
            if (wallatMousePos) {
                this.game.world.placeDoor(wallatMousePos);
            }
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        const quadrant = this.game.map.getTileQuadrantAtPos(mouseWorldPos);
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
