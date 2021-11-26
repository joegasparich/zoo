import { MapEvent, Side } from "consts";
import { Config } from "consts";
import Game from "Game";
import Graphics from "Graphics";
import { getCellsIntersectedByLine } from "helpers/math";
import Mediator from "Mediator";
import Vector from "vector";
import PathfindingGrid, { NodeType } from "./PathfindingGrid";

export class MapCell {
    public position: Vector;

    public isSolid: boolean;
    public cellSize?: number;
}

export default class MapGrid {
    public rows: number;
    public cols: number;
    public position: Vector;
    public cellSize: number;

    private grid: MapCell[][];
    public pathfindingGrid: PathfindingGrid;

    private isGridSetup = false;

    public constructor() {
        this.position = new Vector();
    }

    /**
     * Sets up the map grid
     * @param cells The map cells to populate the grid with
     * @param useTexture Whether a textured tile grid will be used
     */
    public setupGrid(cells: MapCell[][]): void{
        this.grid = cells;
        this.cols = cells.length;
        this.rows = cells[0].length;

        this.cellSize = Config.WORLD_SCALE;

        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols);

        this.isGridSetup = true;
    }

    public postUpdate(): void {}

    /**
     * Resets the map grid back to an empty state
     */
    public clearMap(): void {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid?.reset();
        this.isGridSetup = false;
    }

    /**
     * Sets the solidity of the tile at a position
     * @param position The position of the tile
     * @param solid Whether or not the tile is solid
     */
    public setTileSolid(position: Vector, solid: boolean): void {
        this.grid[position.x][position.y].isSolid = solid;
        this.setTilePathable(position, solid ? NodeType.CLOSED : NodeType.OPEN);

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
        return position &&
               position.x >= 0 &&
               position.x < this.cols &&
               position.y >= 0 &&
               position.y < this.rows;
    }

    /**
     * Returns the map cell at the position (or undefined if out of bounds)
     * @param position The position to look for the map cell
     */
    public getCell(position: Vector): MapCell {
        if (!this.isPositionInMap(position)) return undefined;

        return this.grid[position.x][position.y];
    }

    public getCellInDirection(position: Vector, direction: Side): MapCell {
        if (!this.isPositionInMap(position)) return undefined;

        switch(direction) {
            case Side.West: return this.isPositionInMap(new Vector(position.x - 1, position.y)) ? this.grid[position.x - 1][position.y] : undefined;
            case Side.East: return this.isPositionInMap(new Vector(position.x + 1, position.y)) ? this.grid[position.x + 1][position.y] : undefined;
            case Side.North: return this.isPositionInMap(new Vector(position.x, position.y - 1)) ? this.grid[position.x][position.y - 1] : undefined;
            case Side.South: return this.isPositionInMap(new Vector(position.x, position.y + 1)) ? this.grid[position.x][position.y + 1] : undefined;
        }
    }

    /**
     * Returns the four cells in the adjacent directions if they exist
     * @param position The position of the cell to get adjacent cells from
     */
    public getAdjacentCells(position: Vector): MapCell[] {
        if (!this.isPositionInMap(position)) return [];

        const adjacentCells: MapCell[] = [];

        if (this.isPositionInMap(new Vector(position.x - 1, position.y))) adjacentCells.push(this.grid[position.x - 1][position.y]);
        if (this.isPositionInMap(new Vector(position.x + 1, position.y))) adjacentCells.push(this.grid[position.x + 1][position.y]);
        if (this.isPositionInMap(new Vector(position.x, position.y - 1))) adjacentCells.push(this.grid[position.x][position.y - 1]);
        if (this.isPositionInMap(new Vector(position.x, position.y + 1))) adjacentCells.push(this.grid[position.x][position.y + 1]);

        return adjacentCells;
    }

    public getTileQuadrantAtPos(pos: Vector): Side {
        const xrel = ((pos.x + 10000) % 1) - 0.5;
        const yrel = ((pos.y + 10000) % 1) - 0.5;

        if (yrel <= 0 && Math.abs(yrel) >= Math.abs(xrel)) return Side.North;
        if (xrel >= 0 && Math.abs(xrel) >= Math.abs(yrel)) return Side.East;
        if (yrel >= 0 && Math.abs(yrel) >= Math.abs(xrel)) return Side.South;
        if (xrel <= 0 && Math.abs(xrel) >= Math.abs(yrel)) return Side.West;
    }

    /**
     * Returns an array of all the cells in the map
     */
    public getAllCells(): MapCell[] {
        const cells: MapCell[] = [];
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                cells.push(this.grid[i][j]);
            }
        }

        return cells;
    }

    //-- Pathfinding --//

    /**
     * Calculates and returns a path to a specified location
     * @param start The start position
     * @param end The target position
     * @param opts Optional arguments
     */
    public async getPath(start: Vector, end: Vector, opts?: {optimise?: boolean, allowedNodes?: NodeType[]}): Promise<Vector[]> {
        let path = await this.pathfindingGrid?.getPath(start, end, opts?.allowedNodes);
        if (!path) return;

        if (opts?.optimise) path = this.pathfindingGrid?.optimisePath(path, this.isLineWalkable.bind(this));
        return path.map(node => node.add(new Vector(0.5, 0.5)));
    }

    /**
     * Enables the pathfinding node at a position
     * @param position The position to set pathable
     */
    public setTilePathable(position: Vector, nodeType: NodeType): void {
        this.pathfindingGrid?.setNode(position.x, position.y, nodeType);
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
                console.log("Path blocked");
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
        // TODO: required for pathfinding updates and optimisation
        const cells = getCellsIntersectedByLine(a.floor(), b.floor());
        let prev: Vector;

        for (const cell of cells) {
            // Check for solid tile
            if (!this.isTileFree(cell)) return false;

            if (prev) {
                // Check for walls
                let prevDir: Side | undefined = undefined;
                if (prev.x > cell.x) prevDir = Side.East;
                if (prev.x < cell.x) prevDir = Side.West;
                if (prev.y > cell.y) prevDir = Side.South;
                if (prev.y < cell.y) prevDir = Side.North;

                if (prevDir === undefined) {
                    console.warn("getCellsIntersectedByLine returned duplicate cells", cells.map(cell => cell.toString()));
                }
                if (Game.world.wallGrid.getWallAtTile(cell, prevDir)?.exists) return false;
            }

            prev = cell;
        }

        return true;
    }

    //-- Debug --//

    /**
     * Draws a grid showing the map cells
     */
    public drawDebug(): void {
        Graphics.setLineStyle(1, 0xFFFFFF);
        const xOffset =  this.position.x;
        const yOffset = this.position.y;
        // Horizontal
        for(let i = 0; i < this.rows + 1; i++) {
            Graphics.drawLine(
                xOffset,
                i * this.cellSize + yOffset,
                this.cols * this.cellSize + xOffset,
                i * this.cellSize + yOffset,
            );
        }
        // Vertical
        for(let i = 0; i < this.cols + 1; i++) {
            Graphics.drawLine(
                i * this.cellSize + xOffset,
                yOffset,
                i * this.cellSize + xOffset,
                this.rows * this.cellSize + yOffset,
            );
        }
    }
}
