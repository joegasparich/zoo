import { Vector } from "engine";
import { Side } from "engine/consts";
import { AssetManager } from "engine/managers";

import { Assets, Inputs } from "consts";
import { WallData } from "types/AssetTypes";
import Wall from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";

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
        ghost.setSprite(spriteSheet.getTextureById(0));
        ghost.setPivot(new Vector(0.5, 1));
        ghost.setSnap(true);
        ghost.canPlaceFunction = (pos: Vector): boolean =>
            this.game.world.wallGrid.isWallPosInMap(pos, this.game.map.getTileQuadrantAtPos(this.game.camera.screenToWorldPosition(this.game.input.getMousePos())));
    }

    public update(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        const xDif = mouseWorldPos.floor().x - this.startWallPos?.pos.floor().x;
        const yDif = mouseWorldPos.floor().y - this.startWallPos?.pos.floor().y;
        const horizontal = this.startWallPos?.quadrant === Side.North ||
                           this.startWallPos?.quadrant === Side.South;
        const length = (horizontal ? Math.abs(xDif) : Math.abs(yDif)) + 1;

        if (this.game.input.isInputPressed(Inputs.LeftMouse)) {
            const tilePos = mouseWorldPos;
            const quadrant = this.game.map.getTileQuadrantAtPos(mouseWorldPos);

            this.wallGhosts = [];

            this.startWallPos = { pos: tilePos, quadrant };
        }
        if (this.game.input.isInputHeld(Inputs.LeftMouse)) {

            this.ghost.setVisible(false);

            const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);

            let i = Math.floor(this.startWallPos?.pos.x);
            let j = Math.floor(this.startWallPos?.pos.y);
            for (let w = 0; w < this.wallGhosts.length; w++) {
                const ghost = this.wallGhosts[w];
                ghost.setPosition(new Vector(i, j));

                if (horizontal) {
                    ghost.setSprite(spriteSheet.getTextureById(0));
                    i += Math.sign(mouseWorldPos.floor().x - i);
                    if (this.startWallPos?.quadrant === Side.North) ghost.setOffset(new Vector(0.5, -1));
                    else ghost.setOffset(new Vector(0.5, 0));
                } else {
                    ghost.setSprite(spriteSheet.getTextureById(1));
                    j += Math.sign(mouseWorldPos.floor().y - j);
                    if (this.startWallPos?.quadrant === Side.West) ghost.setOffset(new Vector(0, 0));
                    else ghost.setOffset(new Vector(1, 0));
                }
            };

            // Generate the ghost entities after so that they have a chance to initialise
            while (this.wallGhosts.length < length) {
                const ghost = new PlacementGhost(this.game, false);
                ghost.canPlaceFunction = (pos: Vector): boolean => this.game.world.wallGrid.isWallPosInMap(pos, this.startWallPos?.quadrant);
                this.wallGhosts.push(ghost);
            }
            while (this.wallGhosts.length > length) {
                this.wallGhosts.pop().destroy();
            }
        }
        if (this.game.input.isInputReleased(Inputs.LeftMouse)) {
            this.ghost.setVisible(true);

            if (!this.wallGhosts) return;

            this.wallGhosts.forEach(ghost => {
                const tilePos = ghost.getPosition().floor();
                let quadrant = Side.North;

                if (horizontal) {
                    if (Math.abs(this.startWallPos?.pos.y % 1) < 0.5) quadrant = Side.North;
                    else quadrant = Side.South;
                } else {
                    if (Math.abs(this.startWallPos?.pos.x % 1) < 0.5) quadrant = Side.West;
                    else quadrant = Side.East;
                }

                this.game.world.wallGrid.placeWallAtTile(this.currentWall, tilePos, quadrant);
                ghost.destroy();
            });

            this.wallGhosts = [];
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        this.wallGhosts?.forEach(ghost => ghost.postUpdate());

        const quadrant = this.game.map.getTileQuadrantAtPos(mouseWorldPos);
        const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
        switch (quadrant) {
            case Side.North:
                this.ghost.setSprite(spriteSheet.getTextureById(0));
                this.ghost.setOffset(new Vector(0, -0.5));
                break;
            case Side.South:
                this.ghost.setSprite(spriteSheet.getTextureById(0));
                this.ghost.setOffset(new Vector(0, 0.5));
                break;
            case Side.West:
                this.ghost.setSprite(spriteSheet.getTextureById(1));
                this.ghost.setOffset(new Vector(-0.5, 0.5));
                break;
            case Side.East:
                this.ghost.setSprite(spriteSheet.getTextureById(1));
                this.ghost.setOffset(new Vector(0.5, 0.5));
                break;
            default:
                break;
        }
    }
}
