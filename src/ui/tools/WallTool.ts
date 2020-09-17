import { AssetManager } from "managers";

import { Assets, Inputs, Side } from "consts";
import { WallData } from "types/AssetTypes";
import Wall, { WallSpriteIndex } from "world/Wall";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";
import Game from "Game";
import Vector from "vector";

export default class WallTool extends Tool {
    public type = ToolType.Wall;

    private assetPath: string;
    private wallData: WallData;

    private startWallPos: {pos: Vector; quadrant: Side};
    private ghost: PlacementGhost;
    private wallGhosts: PlacementGhost[];

    public set(ghost: PlacementGhost): void {
        this.ghost = ghost;
        this.ghost.reset();

        this.assetPath =  Assets.WALLS.IRON_BAR;
        this.wallData = AssetManager.getJSON(this.assetPath) as WallData;
        const spriteSheet = Wall.wallSprites.get(this.wallData.spriteSheet);
        this.ghost.setSpriteSheet(spriteSheet, WallSpriteIndex.Horizontal);
        this.ghost.setPivot(new Vector(0.5, 1));
        this.ghost.setSnap(true);
        this.ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        const xDif = mouseWorldPos.floor().x - this.startWallPos?.pos.floor().x;
        const yDif = mouseWorldPos.floor().y - this.startWallPos?.pos.floor().y;
        const horizontal = this.startWallPos?.quadrant === Side.North ||
                           this.startWallPos?.quadrant === Side.South;
        const length = (horizontal ? Math.abs(xDif) : Math.abs(yDif)) + 1;

        let dragQuadrant = Side.North;
        if (horizontal) {
            dragQuadrant = Game.map.getTileQuadrantAtPos(new Vector(0.5, this.startWallPos?.pos.y));
        } else {
            dragQuadrant = Game.map.getTileQuadrantAtPos(new Vector(this.startWallPos?.pos.x, 0.5));
        }

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            const tilePos = mouseWorldPos;
            const quadrant = Game.map.getTileQuadrantAtPos(mouseWorldPos);

            this.wallGhosts = [];

            this.startWallPos = { pos: tilePos, quadrant };
        }
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {

            this.ghost.setSpriteVisible(false);

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
                const ghost = new PlacementGhost();
                ghost.setFollow(false);
                ghost.canPlaceFunction = (pos: Vector): boolean =>  {
                    const wall = Game.world.wallGrid.getWallAtTile(pos.floor(), dragQuadrant);
                    return wall && !wall.exists;
                };
                this.wallGhosts.push(ghost);
            }
            while (this.wallGhosts.length > length) {
                this.wallGhosts.pop().destroy();
            }
        }
        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            this.ghost.setSpriteVisible(true);

            if (!this.wallGhosts) return;

            const walls: Wall[] = [];
            this.wallGhosts.forEach(ghost => {
                const tilePos = ghost.getPosition().floor();

                if (this.canPlace(tilePos)) {
                    walls.push(Game.world.wallGrid.placeWallAtTile(this.assetPath, tilePos, dragQuadrant));
                }

                ghost.destroy();
            });

            this.toolManager.pushAction({
                name: "Place walls",
                data: { walls },
                undo: (data: any): void => {
                    const walls = data.walls as Wall[];

                    walls.forEach(wall => {
                        Game.world.wallGrid.deleteWall(wall);
                    });
                },
            });

            this.wallGhosts = [];
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        this.wallGhosts?.forEach(ghost => ghost.postUpdate());

        const quadrant = Game.map.getTileQuadrantAtPos(mouseWorldPos);
        this.setSprite(this.ghost, Vector.Zero(), quadrant);
    }

    private setSprite(ghost: PlacementGhost, offset: Vector, side: Side): void {
        const spriteSheet = Wall.wallSprites.get(this.wallData.spriteSheet);
        const wall = Game.world.wallGrid.getWallAtTile(ghost.getPosition().floor(), side);
        const [spriteIndex, elevation] = wall?.getSpriteIndex() || [0, 0];
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

    private canPlace(pos: Vector): boolean {
        // TODO: placement is incorrect on vertical walls just outside map
        const quadrant = Game.map.getTileQuadrantAtPos(Game.camera.screenToWorldPosition(Game.input.getMousePos()));

        // Check inside map
        if (!Game.map.isPositionInMap(pos)) return false;

        // Check for existing wall
        const wall = Game.world.wallGrid.getWallAtTile(pos.floor(), quadrant);
        if (wall && wall.exists) return false;

        // Check for water
        let vertexA: Vector, vertexB: Vector;
        const flPos = pos.floor();
        switch(quadrant) {
            case Side.North:
                vertexA = new Vector(flPos.x, flPos.y);
                vertexB = new Vector(flPos.x + 1, flPos.y);
                break;
            case Side.South:
                vertexA = new Vector(flPos.x, flPos.y + 1);
                vertexB = new Vector(flPos.x + 1, flPos.y + 1);
                break;
            case Side.East:
                vertexA = new Vector(flPos.x + 1, flPos.y);
                vertexB = new Vector(flPos.x + 1, flPos.y + 1);
                break;
            case Side.West:
                vertexA = new Vector(flPos.x, flPos.y);
                vertexB = new Vector(flPos.x, flPos.y + 1);
                break;
        }

        const elevA = Game.world.elevationGrid.getElevationAtPoint(vertexA);
        const elevB = Game.world.elevationGrid.getElevationAtPoint(vertexB);

        return elevA >= 0 && elevB >= 0;
    }
}
