import { Vector } from "engine";
import { Side } from "engine/consts";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { WallData } from "types/AssetTypes";
import Wall, { WallSpriteIndex } from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";
import ZooGame from "ZooGame";

export default class WallTool extends Tool {
    public type = ToolType.Wall;

    private currentWall: WallData;

    private startWallPos: {pos: Vector; quadrant: Side};
    private ghost: PlacementGhost;
    private wallGhosts: PlacementGhost[];

    public set(ghost: PlacementGhost): void {
        this.ghost = ghost;
        this.ghost.reset();

        this.currentWall =  AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Horizontal));
        this.ghost.setPivot(new Vector(0.5, 1));
        this.ghost.setSnap(true);
        this.ghost.canPlaceFunction = (pos: Vector): boolean => {
            // TODO: placement is incorrect on vertical walls just outside map
            const wall = ZooGame.world.wallGrid.getWallAtTile(pos.floor(), ZooGame.map.getTileQuadrantAtPos(ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos())));
            return wall && !wall.exists;
        };
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        const xDif = mouseWorldPos.floor().x - this.startWallPos?.pos.floor().x;
        const yDif = mouseWorldPos.floor().y - this.startWallPos?.pos.floor().y;
        const horizontal = this.startWallPos?.quadrant === Side.North ||
                           this.startWallPos?.quadrant === Side.South;
        const length = (horizontal ? Math.abs(xDif) : Math.abs(yDif)) + 1;

        let dragQuadrant = Side.North;
        if (horizontal) {
            dragQuadrant = ZooGame.map.getTileQuadrantAtPos(new Vector(0.5, this.startWallPos?.pos.y));
        } else {
            dragQuadrant = ZooGame.map.getTileQuadrantAtPos(new Vector(this.startWallPos?.pos.x, 0.5));
        }

        if (ZooGame.input.isInputPressed(Inputs.LeftMouse)) {
            const tilePos = mouseWorldPos;
            const quadrant = ZooGame.map.getTileQuadrantAtPos(mouseWorldPos);

            this.wallGhosts = [];

            this.startWallPos = { pos: tilePos, quadrant };
        }
        if (ZooGame.input.isInputHeld(Inputs.LeftMouse)) {

            this.ghost.setVisible(false);

            let i = Math.floor(this.startWallPos?.pos.x);
            let j = Math.floor(this.startWallPos?.pos.y);
            for (let w = 0; w < this.wallGhosts.length; w++) {
                const ghost = this.wallGhosts[w];
                ghost.setPosition(new Vector(i, j));
                this.setSprite(ghost, new Vector(-0.5, 0.5), dragQuadrant);

                if (horizontal) {
                    i += Math.sign(mouseWorldPos.floor().x - i);
                } else {
                    j += Math.sign(mouseWorldPos.floor().y - j);
                }
            };

            // Generate the ghost entities after so that they have a chance to initialise
            while (this.wallGhosts.length < length) {
                const ghost = new PlacementGhost(false);
                ghost.canPlaceFunction = (pos: Vector): boolean =>  {
                    const wall = ZooGame.world.wallGrid.getWallAtTile(pos.floor(), dragQuadrant);
                    return wall && !wall.exists;
                };
                this.wallGhosts.push(ghost);
            }
            while (this.wallGhosts.length > length) {
                this.wallGhosts.pop().destroy();
            }
        }
        if (ZooGame.input.isInputReleased(Inputs.LeftMouse)) {
            this.ghost.setVisible(true);

            if (!this.wallGhosts) return;

            this.wallGhosts.forEach(ghost => {
                const tilePos = ghost.getPosition().floor();

                ZooGame.world.wallGrid.placeWallAtTile(this.currentWall, tilePos, dragQuadrant);
                ghost.destroy();
            });

            this.wallGhosts = [];
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        this.wallGhosts?.forEach(ghost => ghost.postUpdate());

        const quadrant = ZooGame.map.getTileQuadrantAtPos(mouseWorldPos);
        this.setSprite(this.ghost, Vector.Zero(), quadrant);
    }

    private setSprite(ghost: PlacementGhost, offset: Vector, side: Side): void {
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        const wall = ZooGame.world.wallGrid.getWallAtTile(ghost.getPosition().floor(), side);
        const [spriteIndex, elevation] = wall?.getSpriteIndex() || [0, 0];
        ghost.setSprite(spriteSheet.getTextureById(spriteIndex));

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
