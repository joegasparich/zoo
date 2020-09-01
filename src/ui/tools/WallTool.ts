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

        this.currentWall =  AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Horizontal));
        ghost.setPivot(new Vector(0.5, 1));
        ghost.setSnap(true);
        ghost.canPlaceFunction = (pos: Vector): boolean => {
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

            const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);

            let i = Math.floor(this.startWallPos?.pos.x);
            let j = Math.floor(this.startWallPos?.pos.y);
            for (let w = 0; w < this.wallGhosts.length; w++) {
                const ghost = this.wallGhosts[w];
                ghost.setPosition(new Vector(i, j));

                if (horizontal) {
                    ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Horizontal));
                    i += Math.sign(mouseWorldPos.floor().x - i);
                    if (dragQuadrant === Side.North) ghost.setOffset(new Vector(0.5, -1));
                    else ghost.setOffset(new Vector(0.5, 0));
                } else {
                    ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Vertical));
                    j += Math.sign(mouseWorldPos.floor().y - j);
                    if (dragQuadrant === Side.West) ghost.setOffset(new Vector(0, 0));
                    else ghost.setOffset(new Vector(1, 0));
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
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        switch (quadrant) {
            case Side.North:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Horizontal));
                this.ghost.setOffset(new Vector(0, -0.5));
                break;
            case Side.South:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Horizontal));
                this.ghost.setOffset(new Vector(0, 0.5));
                break;
            case Side.West:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Vertical));
                this.ghost.setOffset(new Vector(-0.5, 0.5));
                break;
            case Side.East:
                this.ghost.setSprite(spriteSheet.getTextureById(WallSpriteIndex.Vertical));
                this.ghost.setOffset(new Vector(0.5, 0.5));
                break;
            default:
                break;
        }
    }
}
