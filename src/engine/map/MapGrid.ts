import { Game, Debug, Camera, Vector, Tileset } from 'engine';
import { AssetManager } from "engine/managers";
import { MapData, Path, PathfindingGrid } from '.';
import { LAYERS } from 'engine/constants';

export default class MapGrid {
    game: Game;

    rows: number;
    cols: number;
    pos: Vector;
    cellSize: number;

    camera: Camera;
    grid: Tile[][];
    groundTiles: PIXI.tilemap.CompositeRectTileLayer;
    pathfindingGrid: PathfindingGrid;

    constructor(game: Game) {
        this.game = game;
        this.pos = new Vector()

        this.drawDebug();
    }

    setCamera(camera: Camera) {
        this.camera = camera;
    }

    loadMap(map: MapData) {
        this.cellSize = map.tileWidth;
        this.pos = new Vector(this.cellSize/2, this.cellSize/2)
        this.rows = map.width;
        this.cols = map.height;

        this.setupTileGrid(this.game.stage, map);
        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols, this.drawDebugPath.bind(this));
    }

    clearMap() {
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        this.pathfindingGrid = null;
        this.groundTiles = null;
    }

    update(game: Game) {
        if (this.grid?.length) {
            this.drawTiles()
        }
    }

    setupTileGrid(stage: PIXI.display.Stage, map: MapData) {
        const tileSet = AssetManager.getTileset(map.tileSet);

        if (!tileSet) {
            console.error(`No tileset ${map.tileSet} found`);
            return;
        }

        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for  (let j = 0; j < this.rows; j++) {
                const tileIndex = map.tileData[j * map.width + i] - 1
                this.grid[i][j] = new Tile(i, j, tileSet, tileIndex);
            }
        }
        this.groundTiles = new PIXI.tilemap.CompositeRectTileLayer(0, [tileSet.texture]);
        this.groundTiles.parentGroup = LAYERS.GROUND;
        stage.addChild(this.groundTiles);
        this.updateTiles();
    }

    updateTiles() {
        this.groundTiles.clear()
        for (var i = 0; i <= this.cols - 1; i++) {
            for (var j = 0; j <= this.rows - 1; j++) {
                const tile = this.grid[i][j];
                if (!tile) { continue; }

                const texture = tile.tileset.getTile(tile.tileIndex)
                this.groundTiles.addFrame(texture, i * this.cellSize, j * this.cellSize);
            }
        }
    }

    drawTiles() {
        this.groundTiles.pivot.set(this.camera.position.x, this.camera.position.y);
    }

    drawDebug() {
        Debug.setLineStyle(1, 0x00FF00);
        const xOffset = this.pos.x - this.cellSize / 2;
        const yOffset = this.pos.y - this.cellSize / 2;
        // Horizontal
        for(let i = 0; i < this.rows + 1; i++) {
            Debug.drawLine(
                xOffset,
                i * this.cellSize + yOffset,
                this.cols * this.cellSize + xOffset,
                i * this.cellSize + yOffset
            )
        }
        // Vertical
        for(let i = 0; i < this.cols + 1; i++) {
            Debug.drawLine(
                i * this.cellSize + xOffset,
                yOffset,
                i * this.cellSize + xOffset,
                this.rows * this.cellSize + yOffset
            )
        }
    }

    drawDebugPath(path: Path) {
        Debug.setLineStyle(3, 0x0000FF);

        const xOffset = this.cellSize/2;
        const yOffset = this.cellSize/2;

        let lastNode = path[0];
        path.forEach(node => {
            Debug.drawLine(
                lastNode.x * this.cellSize + xOffset,
                lastNode.y * this.cellSize + yOffset,
                node.x * this.cellSize + xOffset,
                node.y * this.cellSize + yOffset
            );
            lastNode = node;
        })
    }
}

class Tile {
    x: number;
    y: number;

    tileset: Tileset;
    tileIndex: number;

    constructor(x: number, y: number, tileset: Tileset, index: number = 0) {
        this.x = x;
        this.y = y;

        this.tileset = tileset;
        this.tileIndex = index;
    }
}