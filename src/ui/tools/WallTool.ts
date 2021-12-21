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

    private dragStart: { pos: Vector; quadrant: Side };
    private ghost: PlacementGhost;
    private wallGhosts: PlacementGhost[];
    private isDragging: boolean;

    public set(ghost: PlacementGhost): void {
        this.ghost = ghost;

        this.assetPath = Assets.WALLS.IRON_BAR;
        this.wallData = AssetManager.getJSON(this.assetPath) as WallData;
        const spriteSheet = AssetManager.getSpriteSheet(this.wallData.spriteSheet);
        this.ghost.setSpriteSheet(spriteSheet, WallSpriteIndex.Horizontal);
        this.ghost.setPivot(new Vector(0.5, 1));
        this.ghost.setSnap(true);
        this.ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        const xDif = mouseWorldPos.floor().x - this.dragStart?.pos.floor().x;
        const yDif = mouseWorldPos.floor().y - this.dragStart?.pos.floor().y;
        const horizontal = this.dragStart?.quadrant === Side.North || this.dragStart?.quadrant === Side.South;
        const length = (horizontal ? Math.abs(xDif) : Math.abs(yDif)) + 1;

        let dragQuadrant = Side.North;
        if (horizontal) {
            dragQuadrant = Game.map.getTileQuadrantAtPos(new Vector(0.5, this.dragStart?.pos.y));
        } else {
            dragQuadrant = Game.map.getTileQuadrantAtPos(new Vector(this.dragStart?.pos.x, 0.5));
        }

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            const tilePos = mouseWorldPos;
            const quadrant = Game.map.getTileQuadrantAtPos(mouseWorldPos);

            this.wallGhosts = [];

            this.dragStart = { pos: tilePos, quadrant };
        }
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            this.isDragging = true;

            this.ghost.setSpriteVisible(false);

            let i = Math.floor(this.dragStart?.pos.x);
            let j = Math.floor(this.dragStart?.pos.y);
            for (let w = 0; w < this.wallGhosts.length; w++) {
                const ghost = this.wallGhosts[w];
                ghost.setPosition(new Vector(i, j));
                this.updateSprite(ghost, new Vector(-0.5, 0.5), dragQuadrant);

                if (horizontal) {
                    i += Math.sign(mouseWorldPos.floor().x - i);
                } else {
                    j += Math.sign(mouseWorldPos.floor().y - j);
                }
            }

            // Generate the ghost entities after so that they have a chance to initialise
            while (this.wallGhosts.length < length) {
                const ghost = new PlacementGhost();
                ghost.setFollow(false);
                ghost.canPlaceFunction = this.canPlace.bind(this);
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
            this.isDragging = false;
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        this.wallGhosts?.forEach(ghost => ghost.postUpdate());

        const quadrant = Game.map.getTileQuadrantAtPos(mouseWorldPos);
        this.updateSprite(this.ghost, Vector.Zero(), quadrant);
    }

    private updateSprite(ghost: PlacementGhost, offset: Vector, side: Side): void {
        const wall = Game.world.wallGrid.getWallAtTile(ghost.getPosition().floor(), side);
        const [spriteIndex, elevation] = wall?.getSpriteIndex() || [0, 0];
        ghost.setSpriteSheetIndex(spriteIndex);

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
        let quadrant = Game.map.getTileQuadrantAtPos(Game.camera.screenToWorldPosition(Game.input.getMousePos()));

        if (this.isDragging) {
            if (this.dragStart?.quadrant === Side.North || this.dragStart?.quadrant === Side.South) {
                quadrant = Game.map.getTileQuadrantAtPos(new Vector(0.5, this.dragStart?.pos.y));
            } else {
                quadrant = Game.map.getTileQuadrantAtPos(new Vector(this.dragStart?.pos.x, 0.5));
            }
        }

        // Check inside map
        if (!Game.map.isPositionInMap(pos)) return false;

        // Check for existing wall
        const wall = Game.world.wallGrid.getWallAtTile(pos.floor(), quadrant);
        if (wall && wall.exists) return false;

        // Check for tile object
        const [tileA, tileB] = Game.world.wallGrid.getAdjacentTiles(wall);
        if (
            Game.world.getTileObjectAtPos(tileA) &&
            Game.world.getTileObjectAtPos(tileA) === Game.world.getTileObjectAtPos(tileB)
        ) {
            return false;
        }

        // Check for water
        let vertexA: Vector, vertexB: Vector;
        const flPos = pos.floor();
        switch (quadrant) {
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
