import * as path from "path";

import { Game, Debug, Camera, Vector, TileSet, Layers } from "engine";
import { PathfindingGrid, TiledMap } from ".";
import { ColliderType, AssetManager } from "engine/managers";
import { parseTiledMap } from "engine/helpers/parseTiled";

export class MapCell {
    x: number;
    y: number;

    isSolid: boolean;
    texture: PIXI.Texture;
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
    private position: Vector;
    public cellSize: number;

    private camera: Camera;
    private grid: MapCell[][];
    private groundTiles: PIXI.tilemap.CompositeRectTileLayer;
    private pathfindingGrid: PathfindingGrid;

    private isGridSetup = false;

    constructor(game: Game) {
        this.game = game;
        this.position = new Vector();
    }

    public setCamera(camera: Camera): void {
        this.camera = camera;
    }

    private clearMap(): void {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid = null;
        this.groundTiles = null;
        this.isGridSetup = false;
    }

    public update(): void {}

    public postUpdate(): void {
        if (this.grid?.length) {
            this.drawTiles();
        }

        this.drawDebug();
        this.drawDebugPathGrid();
    }

    public setupTileGrid(cells: MapCell[][]): void{
        this.grid = cells;
        this.cols = cells.length;
        this.rows = cells[0].length;
        this.cellSize = cells[0][1].texture.width;

        const textures: PIXI.Texture[] = [];
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i].length; j++) {
                textures.push(cells[i][j].texture);
            }
        }
        this.groundTiles = new PIXI.tilemap.CompositeRectTileLayer(0, textures);
        this.groundTiles.parentGroup = Layers.GROUND;
        this.game.stage.addChild(this.groundTiles);
        this.updateTiles();

        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols);

        this.isGridSetup = true;
    }

    /**
     * Clears and recreates all tiles on the map,
     * this needs to be done because the tile grid is all one big texture
     * TODO: Chunk the map to avoid big updates
     */
    private updateTiles(): void {
        const scale = (this.game.opts.worldScale/this.cellSize); // Ideally this is 1 (16/16)

        this.groundTiles.clear();
        for (let i = 0; i <= this.cols - 1; i++) {
            for (let j = 0; j <= this.rows - 1; j++) {
                const tile = this.grid[i][j];
                if (!tile) { continue; }

                // Texture
                const texture = tile.texture;
                this.groundTiles.addFrame(texture, i * this.cellSize * scale, j * this.cellSize * scale);

                // Collision
                if (tile.isSolid) {
                    this.setTileNotPathable(new Vector(tile.x, tile.y));
                    this.game.physicsManager.createPhysicsObject({
                        collider: {
                            type: ColliderType.Rect,
                            height: 1,
                            width: 1,
                        },
                        position: new Vector(tile.x + 0.5, tile.y + 0.5),
                        isDynamic: false,
                    });
                }
            }
        }
    }

    /**
     * Update the position and scale of the tile grid
     */
    private drawTiles(): void {
        this.groundTiles.position = this.camera.worldToScreenPosition(Vector.Zero).toPoint();
        this.groundTiles.scale.set(this.camera.scale, this.camera.scale);
    }

    public setTileSolid(position: Vector, solid: boolean): void {
        this.grid[position.x][position.y].isSolid = solid;
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

    /**
     * Loads a tiled map from file
     * @param location The file location
     * @param onProgress Callback for progress updates
     */
    public async loadMapFile(location: string, onProgress?: Function): Promise<void> {
        // Load Map File
        const mapResource = await AssetManager.loadResource(location, (progress: number) => onProgress && onProgress(progress/3));
        const tiledMap = parseTiledMap(mapResource.data as TiledMap);
        tiledMap.tileSetPath = path.join(location, "..", tiledMap.tileSetPath);

        // Load Tileset File
        tiledMap.tileSet = await AssetManager.loadTileSetFile(tiledMap.tileSetPath, (progress: number) => onProgress && onProgress(progress * 2/3 + 33.33));

        // Load Map
        this.cellSize = tiledMap.tileWidth;
        this.position = new Vector(this.cellSize/2, this.cellSize/2);
        this.rows = tiledMap.width;
        this.cols = tiledMap.height;

        // Generate cell grid
        const cells: MapCell[][] = [];
        for (let i = 0; i < tiledMap.height; i++) {
            cells[i] = [];
            for  (let j = 0; j < tiledMap.width; j++) {
                const tileIndex = tiledMap.tileData[j * tiledMap.width + i] - 1;
                cells[i][j] = {
                    x: i,
                    y: j,
                    texture: tiledMap.tileSet.getTexture(tileIndex),
                    isSolid: tiledMap.tileSet.tiles.get(tileIndex).solid,
                };
            }
        }

        this.setupTileGrid(cells);
    }

    //-- Pathfinding --//
    public async getPath(start: Vector, end: Vector, opts?: {optimise: boolean}): Promise<Vector[]> {
        let path = await this.pathfindingGrid.getPath(start, end);
        if (!path) return;

        if (opts.optimise) path = this.pathfindingGrid.optimisePath(path);
        return path.map(node => node.add(new Vector(0.5, 0.5)));
    }

    public isPathWalkable(a: Vector, b: Vector): boolean {
        return this.pathfindingGrid.isPathWalkable(a, b);
    }

    public setTileNotPathable(position: Vector): void {
        this.pathfindingGrid.disablePoint(position.x, position.y);
    }

    public setTilePathable(position: Vector): void {
        this.pathfindingGrid.enablePoint(position.x, position.y);
    }

    //-- Debug --//
    private drawDebug(): void {
        Debug.setLineStyle(1, 0xFFFFFF);
        const xOffset =  this.position.x// - this.cellSize / 2;
        const yOffset = this.position.y// - this.cellSize / 2;
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
