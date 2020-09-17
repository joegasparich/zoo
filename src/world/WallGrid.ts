import { MapEvent, Side } from "consts";
import Mediator from "Mediator";

import Wall, { Orientation } from "./Wall";
import { Config } from "consts";
import Game from "Game";
import Camera from "Camera";
import Vector from "vector";
import Graphics from "Graphics";

export interface WallGridSaveData {
    walls: ({
        assetPath: string;
        isDoor: boolean;
    } | undefined)[][];
}

export default class WallGrid {
    private camera: Camera;

    private isSetup: boolean;
    /* V H V H V
       V H V H V
         H   H  */
    private wallGrid: Wall[][];

    public constructor() {
        this.camera = Game.camera;

        this.isSetup = false;
    }

    public setup(data?: WallGridSaveData): void {
        this.wallGrid = [];

        for (let col = 0; col < (Game.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            this.wallGrid[col] = [];
            for (let row = 0; row < Game.map.rows + orientation; row++) {
                const worldPos = Wall.wallToWorldPos(new Vector(col, row), orientation);
                const wallSaveData = data?.walls[col][row];
                if (wallSaveData) {
                    this.wallGrid[col][row] = new Wall(orientation, worldPos, new Vector(col, row), data?.walls[col][row]?.assetPath);
                    this.wallGrid[col][row].setDoor(wallSaveData.isDoor);
                } else {
                    this.wallGrid[col][row] = new Wall(orientation, worldPos, new Vector(col, row));
                }
            }
        }

        this.isSetup = true;
        this.regeneratePathfinding();
    }

    public postUpdate(): void {
        if (this.isSetup) {
            this.drawWalls();
        }
    }

    public reset(): void {
        for (let col = 0; col < (Game.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < Game.map.rows + orientation; row++) {
                this.wallGrid[col][row].remove();
            }
        }

        this.wallGrid = [];
        this.isSetup = false;
    }

    /**
     * Update the position and scale of the tile grid
     */
    private drawWalls(): void {
        for (let col = 0; col < (Game.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < Game.map.rows + orientation; row++) {
                const wall = this.wallGrid[col][row];
                if (!wall?.exists) { continue; }
                if (!wall?.data) { continue; }

                // Texture
                let wallPos;
                if (orientation === Orientation.Vertical) {
                    wallPos = new Vector((col/2), row+1);
                } else {
                    wallPos = new Vector((col/2), row);
                }
                wall.sprite.position = this.camera.worldToScreenPosition(wallPos).toPoint();
                wall.sprite.scale.set(this.camera.scale);
            }
        }
    }

    /**
     * Places a wall on the side of a tile
     * @param wallData The data for the wall to be placed
     * @param tilePos The tile to place the wall in
     * @param side The side of the tile to place the wall on
     */
    public placeWallAtTile(assetPath: string, tilePos: Vector, side: Side): Wall {
        if (!this.isSetup) return;
        if (!this.isWallPosInMap(tilePos, side)) return;
        if (this.getWallAtTile(tilePos, side)?.exists) return;

        // Get grid position
        const { orientation, x, y } = this.getGridPosition(side, tilePos);

        // Create wall and put in the grid
        const wall = new Wall(orientation, Wall.wallToWorldPos(new Vector(x, y), orientation), new Vector(x, y), assetPath);
        this.wallGrid[x][y] = wall;

        this.updatePathfindingAtWall(tilePos, side);

        Mediator.fire(MapEvent.PLACE_SOLID, {position: Wall.wallToWorldPos(new Vector(x, y), orientation)});

        if (this.shouldCheckForLoop(wall) && this.checkForLoop(wall)) {
            Game.world.formAreas(wall);
        }

        return wall;
    }

    private updatePathfindingAtWall(tilePos: Vector, side: Side): void {
        if (side === Side.North && tilePos.y > 0) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y - 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y - 1)));
        }
        if (side === Side.South && tilePos.y < Game.map.rows - 1) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y + 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y + 1)));
        }
        if (side === Side.West && tilePos.x > 0) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x - 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x - 1, tilePos.y)));
        }
        if (side === Side.East && tilePos.x < Game.map.cols - 1) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x + 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x + 1, tilePos.y)));
        }
    }

    private regeneratePathfinding(): void {
        for (let i = 0; i < Game.map.cols; i++) {
            for (let j = 0; j < Game.map.rows; j++) {
                const tile = new Vector(i, j);
                Game.map.setTileAccess(tile, this.getWalledSides(tile));
            }
        }
    }

    public deleteWall(wall: Wall): void {
        if (!this.isSetup) return;
        this.deleteWallAtTile(wall.position.floor(), wall.orientation === Orientation.Horizontal ? Side.North : Side.West);
    }

    public deleteWallAtTile(tilePos: Vector, side: Side): void {
        if (!this.isSetup) return;
        if (!this.isWallPosInMap(tilePos, side)) return; // Return if out of map
        if (this.getWallAtTile(tilePos, side) && !this.getWallAtTile(tilePos, side).exists) return; // Return if wall doesn't exist here

        // Get grid position
        const { orientation, x, y } = this.getGridPosition(side, tilePos);

        // Set to blank wall
        this.wallGrid[x][y].remove();
        this.wallGrid[x][y] = new Wall(orientation, Wall.wallToWorldPos(new Vector(x, y), orientation), new Vector(x, y));

        const [tile1, tile2] = this.getAdjacentTiles(this.wallGrid[x][y]);
        if (Game.world.getAreaAtPosition(tile1) !== Game.world.getAreaAtPosition(tile2)) {
            Game.world.joinAreas(this.wallGrid[x][y]);
        }

        // Update pathfinding information
        if (side === Side.North && tilePos.y > 0) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y - 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y - 1)));
        }
        if (side === Side.South && tilePos.y < Game.map.rows - 1) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y + 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y + 1)));
        }
        if (side === Side.West && tilePos.x > 0) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x - 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x - 1, tilePos.y)));
        }
        if (side === Side.East && tilePos.x < Game.map.cols - 1) {
            Game.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            Game.map.setTileAccess(new Vector(tilePos.x + 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x + 1, tilePos.y)));
        }
    }

    /**
     * Returns whether or not the wall could potentially have completed a loop
     * @param wall The wall being checked
     */
    private shouldCheckForLoop(wall: Wall): boolean {
        const adjacent = this.getAdjacentWalls(wall);
        if (adjacent.length < 2) return false;

        if (wall.orientation === Orientation.Horizontal) {
            if (adjacent.find(adj => adj.position.x > wall.position.x) &&
                adjacent.find(adj => adj.position.x < wall.position.x) )
                return true;
        } else {
            if (adjacent.find(adj => adj.position.y > wall.position.y) &&
                adjacent.find(adj => adj.position.y < wall.position.y) )
                return true;
        }
        return false;
    }

    /**
     * Recursively loops through walls until it can't find anymore in the chain or it finds a possible loop
     * Note that this can potentially return a false positive in a certain situation (e.g. A horizontal wall next to two walls stacked vertically)
     * @param startWall The wall to start from
     * @param currentWall The current wall to expand
     * @param checkedWalls Walls that have already been expanded
     * @param depth How deep in the recursion we are
     */
    private checkForLoop(startWall: Wall, currentWall?: Wall, checkedWalls: Wall[] = [], depth = 0): boolean {
        currentWall = currentWall ?? startWall;

        // Expand current Node
        checkedWalls.push(currentWall);

        let found = false;
        for(const wall of this.getAdjacentWalls(currentWall)) {
            // console.log("  ".repeat(depth) + "" + currentWall.position + " -> " + wall.position + " === " + startWall.position);
            if (wall === startWall && depth > 1) {
                // console.log("  ".repeat(depth) + "found");
                return true;
            }
            if (!checkedWalls.includes(wall)) {
                // TODO: Remove recursion to avoid callstack issues
                found = this.checkForLoop(startWall, wall, checkedWalls, depth + 1);
            }
            if (found) break;
        };

        return found;
    }

    private getGridPosition(side: Side, tilePos: Vector): { orientation: Orientation; x: number; y: number } {
        let x: number, y: number, orientation: Orientation;
        switch (side) {
            case Side.North:
                x = (tilePos.x * 2) + 1;
                y = tilePos.y;
                orientation = Orientation.Horizontal;
                break;
            case Side.East:
                x = (tilePos.x * 2) + 2;
                y = tilePos.y;
                orientation = Orientation.Vertical;
                break;
            case Side.South:
                x = (tilePos.x * 2) + 1;
                y = tilePos.y + 1;
                orientation = Orientation.Horizontal;
                break;
            case Side.West:
                x = tilePos.x * 2;
                y = tilePos.y;
                orientation = Orientation.Vertical;
                break;
        }
        return { orientation, x, y };
    }

    /**
     * Returns whether a wall position is in the bounds of the wall grid
     * @param tilePos The tile to check
     * @param side The side of the tile
     */
    public isWallPosInMap(tilePos: Vector, side: Side): boolean {
        if (!this.isSetup) return false;

        return Game.map.isPositionInMap(tilePos.floor()) ||
               (Game.map.isPositionInMap(tilePos.floor().add(new Vector(0, 1))) && side === Side.South) ||
               (Game.map.isPositionInMap(tilePos.floor().add(new Vector(0, -1))) && side === Side.North) ||
               (Game.map.isPositionInMap(tilePos.floor().add(new Vector(1, 0))) && side === Side.East) ||
               (Game.map.isPositionInMap(tilePos.floor().add(new Vector(-1, 0))) && side === Side.West);
    }

    /**
     * Returns whether a wall grid position is in the bounds of the grid
     * @param x The grid x position of the wall
     * @param y The grid y position of the wall
     */
    public isWallGridPosInMap(x: number, y: number): boolean {
        if (!this.isSetup) return false;

        return x >= 0 &&
               x < this.wallGrid.length &&
               y >= 0 &&
               y < this.wallGrid[x].length;
    }

    /**
     * Returns a wall at a grid position if it exists
     * @param x The grid x position of the wall
     * @param y The grid y position of the wall
     */
    public getWallByGridPos(x: number, y: number): Wall {
        if (!this.isSetup) return;
        if (!this.isWallGridPosInMap(x, y)) return;

        return this.wallGrid[x][y];
    }

    /**
     * Returns the wall located at a side of a tile
     * @param tilePos The tile to check
     * @param side The side of the tile
     */
    public getWallAtTile(tilePos: Vector, side: Side): Wall {
        if (!this.isSetup) return;

        if (!this.isWallPosInMap(tilePos, side)) {
            // Invert position and side if tile pos is correct but on the outside of the map
            if (Game.map.isPositionInMap(tilePos.floor().add(new Vector(0, 1))) && side === Side.South) {
                tilePos = tilePos.floor().add(new Vector(0, 1));
                side = Side.North;
            }
            else if (Game.map.isPositionInMap(tilePos.floor().add(new Vector(0, -1))) && side === Side.North) {
                tilePos = tilePos.floor().add(new Vector(0, -1));
                side = Side.South;
            }
            else if (Game.map.isPositionInMap(tilePos.floor().add(new Vector(-1, 0))) && side === Side.East) {
                tilePos = tilePos.floor().add(new Vector(-1, 0));
                side = Side.West;
            }
            else if (Game.map.isPositionInMap(tilePos.floor().add(new Vector(1, 0))) && side === Side.West) {
                tilePos = tilePos.floor().add(new Vector(1, 0));
                side = Side.East;
            } else {
                // Position is outside map
                return undefined;
            }
        }

        switch(side) {
            case Side.North: return this.wallGrid[(tilePos.x * 2) + 1][tilePos.y];
            case Side.East: return this.wallGrid[(tilePos.x * 2) + 2][tilePos.y];
            case Side.South: return this.wallGrid[(tilePos.x * 2) + 1][tilePos.y + 1];
            case Side.West: return this.wallGrid[(tilePos.x * 2)][tilePos.y];
        }
    }

    /**
     * Returns an array of walls that are adjacent to the tile
     * @param tilePos The tile to check
     */
    public getWallsAtTile(tilePos: Vector): Wall[] {
        if (!this.isSetup) return [];

        return [
            this.wallGrid[(tilePos.x * 2) + 1][tilePos.y],
            this.wallGrid[(tilePos.x * 2) + 2][tilePos.y],
            this.wallGrid[(tilePos.x * 2) + 1][tilePos.y + 1],
            this.wallGrid[tilePos.x * 2][tilePos.y],
        ];
    }

    /**
     * Returns the sides of the tile that have been walled
     * @param tilePos The tile to check
     */
    public getWalledSides(tilePos: Vector): Side[] {
        if (!this.isSetup) return [];
        if (!Game.map.isPositionInMap(tilePos)) return [];

        const edges: Side[] = [];

        if (this.getWallByGridPos((tilePos.x * 2) + 1, tilePos.y)?.data?.solid) edges.push(Side.North);
        if (this.getWallByGridPos((tilePos.x * 2) + 2, tilePos.y)?.data?.solid) edges.push(Side.East);
        if (this.getWallByGridPos((tilePos.x * 2) + 1, tilePos.y + 1)?.data?.solid) edges.push(Side.South);
        if (this.getWallByGridPos(tilePos.x * 2, tilePos.y)?.data?.solid) edges.push(Side.West);

        return edges;
    }

    /**
     * Returns any existing walls in the 6 possible adjacent positions
     * @param wall The wall to check around
     */
    public getAdjacentWalls(wall: Wall): Wall[] {
        if (!this.isSetup) return [];

        const adjacentWalls: Wall[] = [];
        const {x, y} = wall.gridPos;

        if (wall.orientation === Orientation.Horizontal) {
            if (this.getWallByGridPos(x - 2, y)?.exists) adjacentWalls.push(this.wallGrid[x - 2][y]);
            if (this.getWallByGridPos(x + 2, y)?.exists) adjacentWalls.push(this.wallGrid[x + 2][y]);
            if (this.getWallByGridPos(x - 1, y)?.exists) adjacentWalls.push(this.wallGrid[x - 1][y]);
            if (this.getWallByGridPos(x + 1, y)?.exists) adjacentWalls.push(this.wallGrid[x + 1][y]);
            if (this.getWallByGridPos(x - 1, y - 1)?.exists) adjacentWalls.push(this.wallGrid[x - 1][y - 1]);
            if (this.getWallByGridPos(x + 1, y - 1)?.exists) adjacentWalls.push(this.wallGrid[x + 1][y - 1]);
        } else {
            if (this.getWallByGridPos(x - 1, y)?.exists) adjacentWalls.push(this.wallGrid[x - 1][y]);
            if (this.getWallByGridPos(x + 1, y)?.exists) adjacentWalls.push(this.wallGrid[x + 1][y]);
            if (this.getWallByGridPos(x - 1, y + 1)?.exists) adjacentWalls.push(this.wallGrid[x - 1][y + 1]);
            if (this.getWallByGridPos(x + 1, y + 1)?.exists) adjacentWalls.push(this.wallGrid[x + 1][y + 1]);
            if (this.getWallByGridPos(x, y + 1)?.exists) adjacentWalls.push(this.wallGrid[x][y + 1]);
            if (this.getWallByGridPos(x, y - 1)?.exists) adjacentWalls.push(this.wallGrid[x][y - 1]);
        }

        return adjacentWalls;
    }

    /**
     * Returns up to two tiles that are adjacent to a wall
     * @param wall The wall to check
     */
    public getAdjacentTiles(wall: Wall): Vector[] {
        if (!this.isSetup) return [];

        const adjacentTiles: Vector[] = [];
        const {x, y} = wall.position;

        if (wall.orientation === Orientation.Horizontal) {
            if (Game.map.isPositionInMap(new Vector(x - 0.5, y - 1))) adjacentTiles.push(new Vector(x - 0.5, y - 1));
            if (Game.map.isPositionInMap(new Vector(x - 0.5, y))) adjacentTiles.push(new Vector(x - 0.5, y));
        } else {
            if (Game.map.isPositionInMap(new Vector(x - 1, y - 0.5))) adjacentTiles.push(new Vector(x - 1, y - 0.5));
            if (Game.map.isPositionInMap(new Vector(x, y - 0.5))) adjacentTiles.push(new Vector(x, y - 0.5));
        }

        return adjacentTiles;
    }

    public getWallsInRadius(pos: Vector, radius: number): Wall[] {
        if (!this.isSetup) return [];

        const walls: Wall[] = [];

        for (let col = 0; col < (Game.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < Game.map.rows + orientation; row++) {
                const wall = this.wallGrid[col][row];
                if (!wall?.exists) { continue; }

                if (Vector.Distance(pos, wall.position) < radius) {
                    walls.push(wall);
                }
            }
        }

        return walls;
    }

    public save(): WallGridSaveData {
        if (!this.isSetup) return;

        return {
            walls: this.wallGrid.map(row => row.map(wall => {
                return wall.exists ? {
                    assetPath: wall.data.assetPath,
                    isDoor: !!wall.isDoor, // For some reason need to put a !! here for it to save
                } : undefined;
            })),
        };
    }

    public load(data: WallGridSaveData): void {
        this.reset();
        this.setup(data);
    }

    /**
     * Draws a grid showing active and inactive walls
     */
    public drawDebug(): void {
        if (!this.isSetup) return;

        const xOffset =  Game.map.position.x;
        const yOffset = Game.map.position.y;

        for (let col = 0; col < (Game.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < Game.map.rows + orientation; row++) {
                Graphics.setLineStyle(1, 0x00FF00);
                if (!this.wallGrid[col][row].exists) {
                    Graphics.setLineStyle(1, 0xFF0000);
                }
                if (orientation === Orientation.Vertical) {
                    Graphics.drawLine(
                        (col / 2) * Config.WORLD_SCALE + xOffset,
                        row * Config.WORLD_SCALE + yOffset,
                        (col / 2) * Config.WORLD_SCALE + xOffset,
                        (row + 1) * Config.WORLD_SCALE + yOffset,
                    );
                } else {
                    Graphics.drawLine(
                        ((col - 1) / 2) * Config.WORLD_SCALE + xOffset,
                        row  * Config.WORLD_SCALE + yOffset,
                        (((col - 1) / 2)  + 1) * Config.WORLD_SCALE + xOffset,
                        row  * Config.WORLD_SCALE + yOffset,
                    );
                }
            }
        }
    }
}
