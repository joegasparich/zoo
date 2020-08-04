import { Camera, Debug, Game, Layers, Vector } from "engine";
import { AssetManager } from "engine/managers";
import { MapGrid } from "engine/map";
import { MapEvent, Side } from "engine/consts";

import World from "./World";
import Wall from "./Wall";
import { WallData } from "types/AssetTypes";
import { Config } from "consts";
import Mediator from "engine/Mediator";

export default class WallGrid {
    private game: Game;
    private world: World;
    private map: MapGrid;
    private camera: Camera;

    /* V H V H V
       V H V H V
         H   H  */
    private wallGrid: (Wall | undefined)[][];

    public constructor(world: World) {
        this.game = world.game;
        this.world = world;
        this.map = world.map;
        this.camera = this.game.camera;
    }

    public setup(): void {
        this.wallGrid = [];

        for (let col = 0; col < (this.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            this.wallGrid[col] = [];
            for (let row = 0; row < this.map.rows + orientation; row++) {
                this.wallGrid[col][row] = new Wall(this.game, orientation, Wall.wallToWorldPos(new Vector(col, row), orientation), new Vector(col, row));
            }
        }
    }

    public postUpdate(): void {
        this.drawWalls();
    }

    /**
     * Update the position and scale of the tile grid
     */
    private drawWalls(): void {
        for (let col = 0; col < (this.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < this.map.rows + orientation; row++) {
                const wall = this.wallGrid[col][row];
                if (!wall?.data) { continue; }

                // Texture
                let wallPos;
                if (orientation === 0) {
                    // Vertical
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
     * Returns whether a wall position is in the bounds of the wall grid
     * @param tilePos The tile to check
     * @param side The side of the tile
     */
    public isWallPosInMap(tilePos: Vector, side: Side): boolean {
        return this.map.isPositionInMap(tilePos.floor()) ||
               tilePos.floor().y === -1 && side === Side.South ||
               tilePos.floor().y === this.map.rows && side === Side.North ||
               tilePos.floor().x === -1 && side === Side.East ||
               tilePos.floor().x === this.map.cols && side === Side.West;
    }

    /**
     * Returns whether a wall grid position is in the bounds of the grid
     * @param x The grid x position of the wall
     * @param y The grid y position of the wall
     */
    public isWallGridPosInMap(x: number, y: number): boolean {
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
        if (!this.isWallGridPosInMap(x, y)) return;
        return this.wallGrid[x][y];
    }

    /**
     * Returns the wall located at a side of a tile
     * @param tilePos The tile to check
     * @param side The side of the tile
     */
    public getWallAtTile(tilePos: Vector, side: Side): Wall {
        switch(side) {
            case Side.North: return this.wallGrid[(tilePos.x * 2) + 1][tilePos.y];
            case Side.East: return this.wallGrid[(tilePos.x * 2) + 2][tilePos.y];
            case Side.South: return this.wallGrid[(tilePos.x * 2) + 1][tilePos.y + 1];
            case Side.West: return this.wallGrid[tilePos.x * 2][tilePos.y];
        }
    }

    /**
     * Returns an array of walls that are adjacent to the tile
     * @param tilePos The tile to check
     */
    public getWallsAtTile(tilePos: Vector): Wall[] {
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
        if (!this.map.isPositionInMap(tilePos)) return [];

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
        const adjacentWalls: Wall[] = [];
        const {x, y} = wall.gridPos;

        if (wall.orientation) {
            // Horizontal
            if (this.getWallByGridPos(x - 2, y)?.data) adjacentWalls.push(this.wallGrid[x - 2][y]);
            if (this.getWallByGridPos(x + 2, y)?.data) adjacentWalls.push(this.wallGrid[x + 2][y]);
            if (this.getWallByGridPos(x - 1, y)?.data) adjacentWalls.push(this.wallGrid[x - 1][y]);
            if (this.getWallByGridPos(x + 1, y)?.data) adjacentWalls.push(this.wallGrid[x + 1][y]);
            if (this.getWallByGridPos(x - 1, y - 1)?.data) adjacentWalls.push(this.wallGrid[x - 1][y - 1]);
            if (this.getWallByGridPos(x + 1, y - 1)?.data) adjacentWalls.push(this.wallGrid[x + 1][y - 1]);
        } else {
            // Vertical
            if (this.getWallByGridPos(x - 1, y)?.data) adjacentWalls.push(this.wallGrid[x - 1][y]);
            if (this.getWallByGridPos(x + 1, y)?.data) adjacentWalls.push(this.wallGrid[x + 1][y]);
            if (this.getWallByGridPos(x - 1, y + 1)?.data) adjacentWalls.push(this.wallGrid[x - 1][y + 1]);
            if (this.getWallByGridPos(x + 1, y + 1)?.data) adjacentWalls.push(this.wallGrid[x + 1][y + 1]);
            if (this.getWallByGridPos(x, y + 1)?.data) adjacentWalls.push(this.wallGrid[x][y + 1]);
            if (this.getWallByGridPos(x, y - 1)?.data) adjacentWalls.push(this.wallGrid[x][y - 1]);
        }

        return adjacentWalls;
    }

    /**
     * Returns up to two tiles that are adjacent to a wall
     * @param wall The wall to check
     */
    public getAdjacentTiles(wall: Wall): Vector[] {
        const adjacentTiles: Vector[] = [];
        const {x, y} = wall.position;

        if (wall.orientation) {
            // Horizontal
            if (this.map.isPositionInMap(new Vector(x - 0.5, y - 1))) adjacentTiles.push(new Vector(x - 0.5, y - 1));
            if (this.map.isPositionInMap(new Vector(x - 0.5, y))) adjacentTiles.push(new Vector(x - 0.5, y));
        } else {
            // Vertical
            if (this.map.isPositionInMap(new Vector(x - 1, y - 0.5))) adjacentTiles.push(new Vector(x - 1, y - 0.5));
            if (this.map.isPositionInMap(new Vector(x, y - 0.5))) adjacentTiles.push(new Vector(x, y - 0.5));
        }

        return adjacentTiles;
    }

    /**
     * Places a wall on the side of a tile
     * @param wallData The data for the wall to be placed
     * @param tilePos The tile to place the wall in
     * @param side The side of the tile to place the wall on
     */
    public placeWallAtTile(wallData: (WallData | string), tilePos: Vector, side: Side): Wall {
        if (!this.isWallPosInMap(tilePos, side)) return;
        if (this.getWallAtTile(tilePos, side).data) return;

        // Get wall data if not already available
        if (typeof wallData === "string") {
            wallData = AssetManager.getJSON(wallData) as WallData;
        }

        // Get grid position
        let x: number, y: number, orientation: number;
        switch(side) {
            case Side.North:
                x = (tilePos.x * 2) + 1;
                y = tilePos.y;
                orientation = 1;
                break;
            case Side.East:
                x = (tilePos.x * 2) + 2;
                y = tilePos.y;
                orientation = 0;
                break;
            case Side.South:
                x = (tilePos.x * 2) + 1;
                y = tilePos.y + 1;
                orientation = 1;
                break;
            case Side.West:
                x = tilePos.x * 2;
                y = tilePos.y;
                orientation = 0;
                break;
        }

        // Create wall and put in the grid
        const wall = new Wall(this.game, orientation, Wall.wallToWorldPos(new Vector(x, y), orientation), new Vector(x, y), wallData);
        this.wallGrid[x][y] = wall;

        // Update pathfinding information
        if (side === Side.North && tilePos.y > 0) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y - 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y - 1)));
        }
        if (side === Side.South && tilePos.y < this.map.rows - 1) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y + 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y + 1)));
        }
        if (side === Side.West && tilePos.x > 0) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x - 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x - 1, tilePos.y)));
        }
        if (side === Side.East && tilePos.x < this.map.cols - 1) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x + 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x + 1, tilePos.y)));
        }

        // Add new sprite
        const texture = wall.spriteSheet.getTextureById(orientation ? 0 : 1);
        wall.sprite = new PIXI.Sprite(texture);
        this.game.app.stage.addChild(wall.sprite);
        wall.sprite.parentGroup = Layers.ENTITIES;
        wall.sprite.anchor.set(0.5, 1);

        Mediator.fire(MapEvent.PLACE_SOLID, {position: Wall.wallToWorldPos(new Vector(x, y), orientation)});

        if (this.shouldCheckForLoop(wall) && this.checkForLoop(wall)) {
            this.world.formAreas(wall);
        }

        return wall;
    }

    /**
     * Returns whether or not the wall could potentially have completed a loop
     * @param wall The wall being checked
     */
    private shouldCheckForLoop(wall: Wall): boolean {
        const adjacent = this.getAdjacentWalls(wall);
        if (adjacent.length < 2) return false;

        if (wall.orientation) {
            // Horizontal
            if (adjacent.find(adj => adj.position.x > wall.position.x) &&
                adjacent.find(adj => adj.position.x < wall.position.x) )
                return true;
        } else {
            // Vertical
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
        // this.getAdjacentWalls(currentWall).forEach(wall => {
        for(const wall of this.getAdjacentWalls(currentWall)) {
            // console.log("  ".repeat(depth) + "" + currentWall.position + " -> " + wall.position + " === " + startWall.position);
            if (wall === startWall && depth > 1) {
                // console.log("  ".repeat(depth) + "found");
                return true;
            }
            if (!checkedWalls.includes(wall)) {
                found = this.checkForLoop(startWall, wall, checkedWalls, depth + 1);
            }
            if (found) break;
        };

        return found;
    }

    /**
     * Draws a grid showing active and inactive walls
     */
    public drawDebug(): void {
        const xOffset =  this.map.position.x;
        const yOffset = this.map.position.y;

        for (let col = 0; col < (this.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < this.map.rows + orientation; row++) {
                Debug.setLineStyle(1, 0x00FF00);
                if (!this.wallGrid[col][row].data) {
                    Debug.setLineStyle(1, 0xFF0000);
                }
                if (orientation === 0) {
                    // Vertical
                    Debug.drawLine(
                        (col / 2) * Config.WORLD_SCALE + xOffset,
                        row * Config.WORLD_SCALE + yOffset,
                        (col / 2) * Config.WORLD_SCALE + xOffset,
                        (row + 1) * Config.WORLD_SCALE + yOffset,
                    );
                } else {
                    // Horizontal
                    Debug.drawLine(
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
