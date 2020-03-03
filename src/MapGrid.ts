import PathfindingGrid, { Path } from 'PathfindingGrid';
import AssetManager from 'AssetManager';
import { TILESETS } from 'constants/assets';
import Debug from 'Debug';
import Vector from 'types/vector';
import { Game } from 'Game';
import LAYERS from 'constants/LAYERS';
import Tileset from 'Tileset';

export const CELL_SIZE = 32;

export default class MapGrid {
    rows: number;
    cols: number;
    pos: Vector;

    grid: Tile[][];
    pathfindingGrid: PathfindingGrid;

    constructor(game: Game, rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.pos = new Vector(CELL_SIZE/2, CELL_SIZE/2)

        this.setupTileGrid();
        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols, this.drawDebugPath.bind(this));
        this.drawTiles(game.stage);
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

    setupTileGrid() {
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for  (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Tile(i, j);
            }
        }
    }

    drawTiles(stage: PIXI.display.Stage) {
        const tileTest = AssetManager.getTileset(TILESETS.GRASSLAND).getTile(0);
        const groundTiles = new PIXI.tilemap.CompositeRectTileLayer(0, [tileTest]);
        groundTiles.parentGroup = LAYERS.GROUND;
        stage.addChild(groundTiles);

        for (var i = 0; i <= this.cols - 1; i++) {
            for (var j = 0; j <= this.rows - 1; j++) {
                const tile = this.grid[i][j];
                const texture = tile.tileset.getTile(tile.tileIndex)
                // texture
                groundTiles.addFrame(texture, i * CELL_SIZE, j * CELL_SIZE);
            }
        }
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

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.tileset = AssetManager.getTileset(TILESETS.GRASSLAND);
        this.tileIndex = Math.floor(Math.random() * 4);
    }
}