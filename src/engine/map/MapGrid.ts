import { Game, Debug, Vector } from "engine";
import { PathfindingGrid } from ".";
import { MapEvent, Side, TAG } from "engine/consts";
import { Config } from "consts";
import Mediator from "engine/Mediator";
import TileGrid from "./TileGrid";

export class MapCell {
    public x: number;
    public y: number;

    public isSolid: boolean;
    public texture?: PIXI.Texture;
    public cellSize?: number;
}

export default class MapGrid {
    private game: Game;

    public rows: number;
    public cols: number;
    public position: Vector;
    public cellSize: number;

    private grid: MapCell[][];
    private pathfindingGrid: PathfindingGrid;
    private tileGrid: TileGrid;

    private isGridSetup = false;

    public constructor(game: Game) {
        this.game = game;
        this.position = new Vector();
    }

    /**
     * Sets up the map grid
     * @param cells The map cells to populate the grid with
     * @param useTexture Whether a textured tile grid will be used
     */
    public setupGrid(cells: MapCell[][], useTexture: boolean): void{
        this.grid = cells;
        this.cols = cells.length;
        this.rows = cells[0].length;

        if (useTexture) {
            this.cellSize = cells[0][1].texture?.width ?? cells[0][1].cellSize;
            this.tileGrid = new TileGrid(this.game, this, cells);
        } else {
            this.cellSize = Config.WORLD_SCALE;
        }

        this.pathfindingGrid = new PathfindingGrid(this.game, this.rows, this.cols);

        this.isGridSetup = true;
    }

    public postUpdate(): void {
        this.tileGrid?.postUpdate();
    }

    /**
     * Resets the map grid back to an empty state
     */
    private clearMap(): void {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid?.reset();
        this.tileGrid?.reset();
        this.isGridSetup = false;
    }

    /**
     * Sets the solidity of the tile at a position
     * @param position The position of the tile
     * @param solid Whether or not the tile is solid
     */
    public setTileSolid(position: Vector, solid: boolean): void {
        this.grid[position.x][position.y].isSolid = solid;
        if (solid) this.setTileNotPathable(position);

        Mediator.fire(MapEvent.PLACE_SOLID, { position });
    }

    /**
     * Returns whether the cell is solid at a position
     * @param position The position to check
     */
    public isTileFree(position: Vector): boolean {
        position = position.floor();

        if (!this.isPositionInMap(position)) return false;
        if (!this.isGridSetup) return false;

        return !this.grid[position.x][position.y].isSolid;
    }

    /**
     * Returns whether the position is within the bounds of the map
     * @param position The position to check
     */
    public isPositionInMap(position: Vector): boolean {
        return position.x >= 0 &&
               position.x < this.cols &&
               position.y >= 0 &&
               position.y < this.rows;
    }

    /**
     * Returns the map cell at the position (or undefined if out of bounds)
     * @param position The position to look for the map cell
     */
    public getCell(position: Vector): MapCell {
        if (!this.isPositionInMap) return undefined;

        return this.grid[position.x][position.y];
    }

    //-- Pathfinding --//

    /**
     * Calculates and returns a path to a specified location
     * @param start The start position
     * @param end The target position
     * @param opts Optional arguments
     */
    public async getPath(start: Vector, end: Vector, opts?: {optimise: boolean}): Promise<Vector[]> {
        let path = await this.pathfindingGrid?.getPath(start, end);
        if (!path) return;

        if (opts.optimise) path = this.pathfindingGrid?.optimisePath(path, this.isLineWalkable);
        return path.map(node => node.add(new Vector(0.5, 0.5)));
    }

    /**
     * Disables the pathfinding node at a position
     * @param position The position to set not pathable
     */
    private setTileNotPathable(position: Vector): void {
        this.pathfindingGrid?.disableNode(position.x, position.y);
    }

    /**
     * Enables the pathfinding node at a position
     * @param position The position to set pathable
     */
    private setTilePathable(position: Vector): void {
        this.pathfindingGrid?.enableNode(position.x, position.y);
    }

    /**
     * Sets the sides of the tile which it is allowed to be pathed to
     * @param position The position of the tile
     * @param allowedSides The sides that the tile can be entered from
     */
    public setTileAccess(position: Vector, allowedSides: Side[]): void {
        this.pathfindingGrid?.disableEdges(Math.floor(position.x), Math.floor(position.y), allowedSides);
    }

    /**
     * Returns whether the path is now blocked
     * @param path the path to check
     */
    public checkPath(path: Vector[]): boolean {
        let lastNode: Vector = undefined;
        for(const node of path) {
            if (lastNode && !this.isLineWalkable(node, lastNode)) {
                return false;
            }
            lastNode = node;
        }

        return true;
    }

    /**
     * Returns whether the line between position A & B is blocked by a solid object
     * @param a Position A
     * @param b Position B
     */
    public isLineWalkable(a: Vector, b: Vector): boolean {
        const hit = this.game.physicsManager.rayCast(b, a, [TAG.Solid]);
        if (hit) {
            return false;
        }
        return true;
    }

    //-- Debug --//

    /**
     * Draws a grid showing the map cells
     */
    public drawDebug(): void {
        Debug.setLineStyle(1, 0xFFFFFF);
        const xOffset =  this.position.x;
        const yOffset = this.position.y;
        // Horizontal
        for(let i = 0; i < this.rows + 1; i++) {
            Debug.drawLine(
                xOffset,
                i * this.cellSize + yOffset,
                this.cols * this.cellSize + xOffset,
                i * this.cellSize + yOffset,
            );
        }
        // Vertical
        for(let i = 0; i < this.cols + 1; i++) {
            Debug.drawLine(
                i * this.cellSize + xOffset,
                yOffset,
                i * this.cellSize + xOffset,
                this.rows * this.cellSize + yOffset,
            );
        }
    }

    public drawPathfinderDebug(): void {
        this.pathfindingGrid.drawDebugPathGrid();
    }
}
