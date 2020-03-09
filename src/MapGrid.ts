import PathfindingGrid, { Path } from 'PathfindingGrid';
import AssetManager from 'AssetManager';
import { TILESETS } from 'constants/assets';
import Debug from 'Debug';
import Vector from 'types/vector';
import { Game } from 'Game';
import LAYERS from 'constants/LAYERS';
import Tileset from 'Tileset';
import Camera from 'Camera';
import MapData from 'types/Map';

export const CELL_SIZE = 32;

export default class MapGrid {
    rows: number;
    cols: number;
    pos: Vector;

    camera: Camera;
    grid: Tile[][];
    groundTiles: PIXI.tilemap.CompositeRectTileLayer;
    pathfindingGrid: PathfindingGrid;

    constructor(game: Game, map: MapData) {
        this.rows = map.width;
        this.cols = map.height;
        this.pos = new Vector(CELL_SIZE/2, CELL_SIZE/2)

        this.setupTileGrid(game.stage, map);
        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols, this.drawDebugPath.bind(this));
        this.drawDebug();

        // TEST //
        this.pathfindingGrid.disablePoint(new Vector(0, 2));
        this.pathfindingGrid.disablePoint(new Vector(1, 2));
        this.pathfindingGrid.disablePoint(new Vector(2, 2));
        this.pathfindingGrid.disablePoint(new Vector(3, 2));
        this.pathfindingGrid.disablePoint(new Vector(4, 2));
        this.pathfindingGrid.getPath(new Vector(1, 1), new Vector(4, 6)).then((path) => {
            this.drawDebugPath(path);
        });
    }

    setCamera(camera: Camera) {
        this.camera = camera;
    }

    update(game: Game) {
        this.drawTiles()
    }

    setupTileGrid(stage: PIXI.display.Stage, map: MapData) {
        const tileSet = AssetManager.getTileset(TILESETS[map.tileSet as keyof typeof TILESETS]);

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
                this.groundTiles.addFrame(texture, i * CELL_SIZE, j * CELL_SIZE);
            }
        }
    }

    drawTiles() {
        this.groundTiles.pivot.set(this.camera.position.x, this.camera.position.y);
    }

    drawDebug() {
        Debug.setLineStyle(1, 0x00FF00);
        const xOffset = this.pos.x - CELL_SIZE / 2;
        const yOffset = this.pos.y - CELL_SIZE / 2;
        // Horizontal
        for(let i = 0; i < this.rows + 1; i++) {
            Debug.drawLine(
                xOffset,
                i * CELL_SIZE + yOffset,
                this.cols * CELL_SIZE + xOffset,
                i * CELL_SIZE + yOffset
            )
        }
        // Vertical
        for(let i = 0; i < this.cols + 1; i++) {
            Debug.drawLine(
                i * CELL_SIZE + xOffset,
                yOffset,
                i * CELL_SIZE + xOffset,
                this.rows * CELL_SIZE + yOffset
            )
        }
    }

    drawDebugPath(path: Path) {
        Debug.setLineStyle(3, 0x0000FF);

        const xOffset = CELL_SIZE/2;
        const yOffset = CELL_SIZE/2;

        let lastNode = path[0];
        path.forEach(node => {
            Debug.drawLine(
                lastNode.x * CELL_SIZE + xOffset,
                lastNode.y * CELL_SIZE + yOffset,
                node.x * CELL_SIZE + xOffset,
                node.y * CELL_SIZE + yOffset
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