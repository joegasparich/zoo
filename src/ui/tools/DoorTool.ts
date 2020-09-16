import { Vector } from "engine";
import { Side } from "engine/consts";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { WallData } from "types/AssetTypes";
import Wall, { WallSpriteIndex } from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";
import ZooGame from "ZooGame";

export default class DoorTool extends Tool {
    public type = ToolType.Wall;

    private currentWall: WallData;

    private ghost: PlacementGhost;

    public set(ghost: PlacementGhost): void {
        this.ghost = ghost;
        this.ghost.reset();

        this.currentWall =  AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        ghost.setSpriteSheet(spriteSheet, WallSpriteIndex.DoorHorizontal);
        ghost.setPivot(new Vector(0.5, 1));
        ghost.setSnap(true);
        ghost.canPlaceFunction = (pos: Vector): boolean => {
            const wall = ZooGame.world.wallGrid.getWallAtTile(pos.floor(), ZooGame.map.getTileQuadrantAtPos(ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos())));
            return wall?.exists && !wall.isDoor && !wall.isSloped();
        };
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());
        const wallatMousePos = ZooGame.world.wallGrid.getWallAtTile(mouseWorldPos.floor(), ZooGame.map.getTileQuadrantAtPos(mouseWorldPos));

        if (ZooGame.input.isInputReleased(Inputs.LeftMouse)) {
            if (wallatMousePos && !wallatMousePos.isSloped()) {
                ZooGame.world.placeDoor(wallatMousePos);

                this.toolManager.pushAction({
                    name: "Create door",
                    data: { wall: wallatMousePos },
                    undo: (data: any): void => {
                        ZooGame.world.removeDoor(data.wall);
                    },
                });
            }
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        const quadrant = ZooGame.map.getTileQuadrantAtPos(mouseWorldPos);
        this.setSprite(this.ghost, Vector.Zero(), quadrant);
    }

    private setSprite(ghost: PlacementGhost, offset: Vector, side: Side): void {
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        const wall = ZooGame.world.wallGrid.getWallAtTile(ghost.getPosition().floor(), side);
        const [spriteIndex, elevation] = wall?.getSpriteIndex(true) || [0, 0];
        ghost.setSpriteSheet(spriteSheet, spriteIndex);

        switch (side) {
            case Side.North:
                ghost.setOffset(new Vector(0, -0.5 - elevation * 0.5).subtract(offset));
                break;
            case Side.South:
                ghost.setOffset(new Vector(0, 0.5 - elevation * 0.5).subtract(offset));
                break;
            case Side.West:
                ghost.setOffset(new Vector(-0.5, 0.5 - elevation * 0.5).subtract(offset));
                break;
            case Side.East:
                ghost.setOffset(new Vector(0.5, 0.5 - elevation * 0.5).subtract(offset));
                break;
            default:
                break;
        }
    }
}
