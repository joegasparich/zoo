import { Game, Debug, Camera, Vector, Tileset, Events, Layers } from "engine";
import { Path, PathfindingGrid } from ".";
import { ColliderType } from "engine/managers";
import Mediator from "engine/Mediator";

class MapCell {
    x: number;
    y: number;

    isSolid: boolean;
    tileset: Tileset;
    tileIndex: number;

    constructor(x: number, y: number, tileset: Tileset, id: number) {
        this.x = x;
        this.y = y;

        this.tileset = tileset;
        this.tileIndex = id;
        this.isSolid = tileset.tiles.get(id).solid;
    }
}

export interface MapData {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    tileSetPath: string;
    tileSet?: Tileset;
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

        // Listen for map load requests
        Mediator.on(Events.MapEvent.REQUEST_MAP_LOAD, ((mapData: MapData) => {
            this.loadMap(mapData);
        }));
    }

    setCamera(camera: Camera): void {
        this.camera = camera;
    }

    loadMap(map: MapData): void {
        this.cellSize = map.tileWidth;
        this.pos = new Vector(this.cellSize/2, this.cellSize/2);
        this.rows = map.width;
        this.cols = map.height;

        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols);
        this.setupTileGrid(this.game.stage, map);
    }

    clearMap(): void {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid = null;
        this.groundTiles = null;
    }

    update(game: Game): void {
        if (this.grid?.length) {
            this.drawTiles();
        }
    }

    postUpdate(): void {
        // this.drawDebug();
    }

    setupTileGrid(stage: PIXI.display.Stage, map: MapData): void{
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for  (let j = 0; j < this.rows; j++) {
                const tileIndex = map.tileData[j * map.width + i] - 1;
                this.grid[i][j] = new MapCell(i, j, map.tileSet, tileIndex);
            }
        }
        this.groundTiles = new PIXI.tilemap.CompositeRectTileLayer(0, [map.tileSet.texture]);
        this.groundTiles.parentGroup = Layers.GROUND;
        stage.addChild(this.groundTiles);
        this.updateTiles();
    }

    updateTiles(): void {
        this.groundTiles.clear();
        for (let i = 0; i <= this.cols - 1; i++) {
            for (let j = 0; j <= this.rows - 1; j++) {
                const tile = this.grid[i][j];
                if (!tile) { continue; }

                // Texture
                const texture = tile.tileset.getTexture(tile.tileIndex);
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
