import { Game, Debug, Camera, Vector, TileSet } from "engine";
import { PathfindingGrid } from ".";
import { MapEvent, Side } from "engine/consts";
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
export interface MapFileData {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    tileSetPath: string;
    tileSet?: TileSet;
    tileData: number[];
}

export default class MapGrid {
    private game: Game;

    public rows: number;
    public cols: number;
    public position: Vector;
    public cellSize: number;

    private camera: Camera;
    private grid: MapCell[][];
    private pathfindingGrid: PathfindingGrid;
    private tileGrid: TileGrid;

    private isGridSetup = false;

    public constructor(game: Game) {
        this.game = game;
        this.position = new Vector();
    }

    public setCamera(camera: Camera): void {
        this.camera = camera;
    }

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

    public update(): void {}

    public postUpdate(): void {
        this.drawDebug();
        this.drawDebugPathGrid();

        this.tileGrid?.postUpdate();
    }

    private clearMap(): void {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid.reset();
        this.tileGrid.reset();
        this.isGridSetup = false;
    }

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

    public isPositionInMap(position: Vector): boolean {
        return position.x >= 0 &&
               position.x < this.cols &&
               position.y >= 0 &&
               position.y < this.rows;
    }

    public getCell(position: Vector): MapCell {
        return this.grid[position.x][position.y];
    }

    //-- Pathfinding --//
    public async getPath(start: Vector, end: Vector, opts?: {optimise: boolean}): Promise<Vector[]> {
        let path = await this.pathfindingGrid?.getPath(start, end);
        if (!path) return;

        if (opts.optimise) path = this.pathfindingGrid?.optimisePath(path);
        return path.map(node => node.add(new Vector(0.5, 0.5)));
    }

    public isPathWalkable(a: Vector, b: Vector): boolean {
        return this.pathfindingGrid?.isLineWalkable(a, b);
    }

    public setTileNotPathable(position: Vector): void {
        this.pathfindingGrid?.disablePoint(position.x, position.y);
    }

    public setTilePathable(position: Vector): void {
        this.pathfindingGrid?.enablePoint(position.x, position.y);
    }

    public setTileAccess(position: Vector, allowedSides: Side[]): void {
        this.pathfindingGrid?.disableEdges(position, allowedSides);
    }

    /**
     * Returns whether the path is now blocked
     * @param path the path to check
     */
    public checkPath(path: Vector[]): boolean {
        let lastNode: Vector = undefined;
        for(const node of path) {
            if (lastNode && !this.pathfindingGrid?.isLineWalkable(node, lastNode)) {
                return false;
            }
            lastNode = node;
        }

        return true;
    }

    //-- Debug --//
    private drawDebug(): void {
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

    private drawDebugPathGrid(): void {
        if (!this.pathfindingGrid) return;

        const grid = this.pathfindingGrid.getGrid();
        const xOffset = this.cellSize / 2;
        const yOffset = this.cellSize / 2;

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] == 0) {
                    Debug.setLineStyle(0.5, 0x00FF00);
                    Debug.drawX(new Vector(i * this.cellSize + xOffset, j * this.cellSize + yOffset), 2);
                } else {
                    Debug.setLineStyle(0.5, 0x000000);
                    Debug.drawX(new Vector(i * this.cellSize + xOffset, j * this.cellSize + yOffset), 2);
                }
            }
        }
    }
}
