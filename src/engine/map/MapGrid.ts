import * as path from "path";

import { Game, Debug, Camera, Vector, TileSet, Layers } from "engine";
import { Path, PathfindingGrid, TiledMap } from ".";
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
    game: Game;

    rows: number;
    cols: number;
    pos: Vector;
    cellSize: number;

    camera: Camera;
    grid: MapCell[][];
    groundTiles: PIXI.tilemap.CompositeRectTileLayer;
    pathfindingGrid: PathfindingGrid;

    constructor(game: Game) {
        this.game = game;
        this.pos = new Vector();

        this.drawDebug();
    }

    setCamera(camera: Camera): void {
        this.camera = camera;
    }

    clearMap(): void {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid = null;
        this.groundTiles = null;
    }

    update(): void {
        if (this.grid?.length) {
            this.drawTiles();
        }
    }

    postUpdate(): void {
        // this.drawDebug();
    }

    setupTileGrid(cells: MapCell[][]): void{
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
    }

    updateTiles(): void {
        this.groundTiles.clear();
        for (let i = 0; i <= this.cols - 1; i++) {
            for (let j = 0; j <= this.rows - 1; j++) {
                const tile = this.grid[i][j];
                if (!tile) { continue; }

                // Texture
                const texture = tile.texture;
                this.groundTiles.addFrame(texture, i * this.cellSize, j * this.cellSize);

                // Collision
                if (tile.isSolid) {
                    this.pathfindingGrid.disablePoint(new Vector(tile.x, tile.y));
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

    drawTiles(): void {
        this.groundTiles.pivot.set(this.camera.screenPosition.x, this.camera.screenPosition.y);
    }

    public async loadMapFile(location: string, onProgress?: Function): Promise<void> {
        // Load Map File
        const mapResource = await AssetManager.loadResource(location, (progress: number) => onProgress && onProgress(progress/3));
        const tiledMap = parseTiledMap(mapResource.data as TiledMap);
        tiledMap.tileSetPath = path.join(location, "..", tiledMap.tileSetPath);

        // Load Tileset File
        tiledMap.tileSet = await AssetManager.loadTileSetFile(tiledMap.tileSetPath, (progress: number) => onProgress && onProgress(progress * 2/3 + 33.33));

        // Load Map
        this.cellSize = tiledMap.tileWidth;
        this.pos = new Vector(this.cellSize/2, this.cellSize/2);
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

        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols);
        this.setupTileGrid(cells);
    }

    drawDebug(): void {
        Debug.setLineStyle(1, 0x00FF00);
        const xOffset = this.pos.x - this.cellSize / 2;
        const yOffset = this.pos.y - this.cellSize / 2;
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

    drawDebugPath(path: Path): void {
        Debug.setLineStyle(3, 0x0000FF);

        const xOffset = this.cellSize/2;
        const yOffset = this.cellSize/2;

        let lastNode = path[0];
        path.forEach(node => {
            Debug.drawLine(
                lastNode.x * this.cellSize + xOffset,
                lastNode.y * this.cellSize + yOffset,
                node.x * this.cellSize + xOffset,
                node.y * this.cellSize + yOffset,
            );
            lastNode = node;
        });
    }
}
