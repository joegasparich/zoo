import { AssetManager } from "managers";

import { Assets, Inputs, Side } from "consts";
import { WallData } from "types/AssetTypes";
import Wall, { WallSpriteIndex } from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";
import Game from "Game";
import Vector from "vector";

export default class DoorTool extends Tool {
    public type = ToolType.Wall;

    private currentWall: WallData;

    private ghost: PlacementGhost;

    public set(ghost: PlacementGhost): void {
        this.ghost = ghost;

        this.currentWall = AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
        const spriteSheet = AssetManager.getSpriteSheet(this.currentWall.spriteSheet);
        ghost.setSpriteSheet(spriteSheet, WallSpriteIndex.DoorHorizontal);
        ghost.setPivot(new Vector(0.5, 1));
        ghost.setSnap(true);
        ghost.canPlaceFunction = (pos: Vector): boolean => {
            const wall = Game.world.wallGrid.getWallAtTile(
                pos.floor(),
                Game.map.getTileQuadrantAtPos(Game.camera.screenToWorldPosition(Game.input.getMousePos())),
            );
            return wall?.exists && !wall.isDoor && !wall.isSloped();
        };
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());
        const wallatMousePos = Game.world.wallGrid.getWallAtTile(
            mouseWorldPos.floor(),
            Game.map.getTileQuadrantAtPos(mouseWorldPos),
        );

        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            if (wallatMousePos && wallatMousePos.exists && !wallatMousePos.isSloped()) {
                Game.world.placeDoor(wallatMousePos);

                this.toolManager.pushAction({
                    name: "Create door",
                    data: { wall: wallatMousePos },
                    undo: (data: any): void => {
                        Game.world.removeDoor(data.wall);
                    },
                });
            }
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        const quadrant = Game.map.getTileQuadrantAtPos(mouseWorldPos);
        this.setSprite(this.ghost, Vector.Zero(), quadrant);
    }

    private setSprite(ghost: PlacementGhost, offset: Vector, side: Side): void {
        const spriteSheet = AssetManager.getSpriteSheet(this.currentWall.spriteSheet);
        const wall = Game.world.wallGrid.getWallAtTile(ghost.getPosition().floor(), side);
        const [spriteIndex, elevation] = wall?.getSpriteIndex(true) || [0, 0];
        ghost.setSpriteSheet(spriteSheet, spriteIndex);

        switch (side) {
            case Side.North:
                ghost.setOffset(new Vector(0, -0.5 - elevation).subtract(offset));
                break;
            case Side.South:
                ghost.setOffset(new Vector(0, 0.5 - elevation).subtract(offset));
                break;
            case Side.West:
                ghost.setOffset(new Vector(-0.5, 0.5 - elevation).subtract(offset));
                break;
            case Side.East:
                ghost.setOffset(new Vector(0.5, 0.5 - elevation).subtract(offset));
                break;
            default:
                break;
        }
    }
}
