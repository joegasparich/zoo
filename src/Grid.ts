import 'pixi-tilemap';

import Vector from "types/vector";
import AssetManager from "AssetManager"
import { TEXTURES } from "constants/assets";
import LAYERS from 'constants/LAYERS';
import { Game } from 'Game';
import PathfindingGrid, { Path } from 'PathfindingGrid';

export default class Grid {
    graphics: PIXI.Graphics;

    game: Game;
    pathfindingGrid: PathfindingGrid;
    pos: Vector;
    rows: number;
    cols: number;
    cellSize: number; // px

    constructor(game: Game, pos: Vector, rows: number, cols: number, cellSize: number, showDebugLines: boolean) {
        this.game = game;
        this.rows = rows;
        this.cols = cols;
        this.pos = pos;
        this.cellSize = cellSize;

        this.graphics = new PIXI.Graphics();

        this.drawTiles(game.stage);
        this.pathfindingGrid = new PathfindingGrid(this.rows, this.cols, this.drawDebugPath.bind(this));

        if (showDebugLines) {
            this.drawDebug(game.stage);
        }
    }

    drawTiles(stage: PIXI.display.Stage) {
        const grassTexture = AssetManager.loader.resources[TEXTURES.GRASS].texture;
        const groundTiles = new PIXI.tilemap.CompositeRectTileLayer(0, [grassTexture]);
        groundTiles.parentGroup = LAYERS.GROUND;
        stage.addChild(groundTiles);

        for (var i = 0; i <= this.cols - 1; i++) {
            for (var j = 0; j <= this.rows - 1; j++) {
                groundTiles.addFrame(grassTexture, i * this.cellSize, j * this.cellSize);
            }
        }
    }

    drawDebug(stage: PIXI.display.Stage) {
        this.graphics.lineStyle(1, 0x00FF00);
        const xOffset = this.pos.x - this.cellSize / 2;
        const yOffset = this.pos.y - this.cellSize / 2;
        // Horizontal
        for(let i = 0; i < this.rows + 1; i++) {
            this.graphics.moveTo(xOffset, i * this.cellSize + yOffset);
            this.graphics.lineTo(this.cols * this.cellSize + xOffset, i * this.cellSize + yOffset);
        }
        // Vertical
        for(let i = 0; i < this.cols + 1; i++) {
            this.graphics.moveTo(i * this.cellSize + xOffset, yOffset);
            this.graphics.lineTo(i * this.cellSize + xOffset, this.rows * this.cellSize + yOffset);
        }

        this.graphics.parentGroup = LAYERS.DEBUG;
        stage.addChild(this.graphics);
    }

    drawDebugPath(path: Path) {
        this.graphics.lineStyle(3, 0x0000FF);

        const xOffset = this.pos.x;
        const yOffset = this.pos.y;

        this.graphics.moveTo(path[0].x * this.cellSize + xOffset, path[0].y * this.cellSize + yOffset);
        path.forEach(node => {
            this.graphics.lineTo(node.x * this.cellSize + xOffset, node.y * this.cellSize + yOffset);
        })
    }

    update() {
    }
}