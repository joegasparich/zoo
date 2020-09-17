import { Config, Layers } from "consts";
import Graphics from "Graphics";
import Vector from "vector";

import Game from "Game";
import { SlopeVariant, ELEVATION_HEIGHT } from "./ElevationGrid";

const WATER_COLOUR = 0x4499FF;
const WATER_LEVEL = 0.2;

export default class WaterGrid {
    private grid: boolean[][];
    private width: number;
    private height: number;

    private graphics: PIXI.Graphics;

    public setup(): void {
        this.width = Game.map.cols;
        this.height = Game.map.rows;

        // Initialise grid to empty
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.grid[i][j] = false;
            }
        }

        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = Layers.WATER;
        this.graphics.position = Game.camera.offset.toPoint();
        Game.stage.addChild(this.graphics);
    }

    public postUpdate(): void {
        this.graphics.scale.set(Game.camera.scale, Game.camera.scale);
        this.graphics.position = Game.camera.worldToScreenPosition(Vector.Zero()).toPoint();
    }

    public reset(): void {
        Game.stage.removeChild(this.graphics);
        this.graphics.destroy();
        this.graphics = undefined;
        this.grid = [];
    }

    public draw(): void {
        this.graphics.clear();

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (!this.grid[i][j]) continue;

                this.graphics
                    .beginFill(WATER_COLOUR)
                    .drawPolygon(this.getPolygon(new Vector(i, j)))
                    .endFill();
            }
        }
    }

    private getPolygon(tile: Vector): PIXI.Point[] {
        const slopeVariant = Game.world.elevationGrid.getSlopeVariant(tile);
        let polygon: Vector[] = [];

        switch (slopeVariant) {
            case SlopeVariant.N: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1 - WATER_LEVEL)), tile.add(new Vector(0, 1 - WATER_LEVEL))]; break;
            case SlopeVariant.S: polygon = [tile.add(new Vector(0, WATER_LEVEL)), tile.add(new Vector(1, WATER_LEVEL)), tile.add(new Vector(1, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.W: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1 - WATER_LEVEL, 0)), tile.add(new Vector(1 - WATER_LEVEL, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.E: polygon = [tile.add(new Vector(WATER_LEVEL, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1)), tile.add(new Vector(WATER_LEVEL, 1))]; break;
            case SlopeVariant.NW: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1 - WATER_LEVEL)), tile.add(new Vector(1- WATER_LEVEL, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.NE: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1)), tile.add(new Vector(WATER_LEVEL, 1)), tile.add(new Vector(0, 1- WATER_LEVEL))]; break;
            case SlopeVariant.SW: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1 - WATER_LEVEL, 0)), tile.add(new Vector(1, WATER_LEVEL)), tile.add(new Vector(1, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.SE: polygon = [tile.add(new Vector(0, WATER_LEVEL)), tile.add(new Vector(WATER_LEVEL, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.INW: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1 - WATER_LEVEL, 0)), tile.add(new Vector(1 - WATER_LEVEL, 1 - WATER_LEVEL)), tile.add(new Vector(0, 1 - WATER_LEVEL))]; break;
            case SlopeVariant.INE: polygon = [tile.add(new Vector(WATER_LEVEL, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1 - WATER_LEVEL)), tile.add(new Vector(WATER_LEVEL, 1 - WATER_LEVEL))]; break;
            case SlopeVariant.ISW: polygon = [tile.add(new Vector(0, WATER_LEVEL)), tile.add(new Vector(1 - WATER_LEVEL, WATER_LEVEL)), tile.add(new Vector(1 - WATER_LEVEL, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.ISE: polygon = [tile.add(new Vector(WATER_LEVEL, WATER_LEVEL)), tile.add(new Vector(1, WATER_LEVEL)), tile.add(new Vector(1, 1)), tile.add(new Vector(WATER_LEVEL, 1))]; break;
            case SlopeVariant.I1: polygon = [tile.add(new Vector(0, WATER_LEVEL)), tile.add(new Vector(WATER_LEVEL, 0)), tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1 - WATER_LEVEL)), tile.add(new Vector(1- WATER_LEVEL, 1)), tile.add(new Vector(0, 1))]; break;
            case SlopeVariant.I2: polygon = [tile.add(new Vector(0, 0)), tile.add(new Vector(1 - WATER_LEVEL, 0)), tile.add(new Vector(1, WATER_LEVEL)), tile.add(new Vector(1, 1)), tile.add(new Vector(WATER_LEVEL, 1)), tile.add(new Vector(0, 1- WATER_LEVEL))]; break;
            case SlopeVariant.Flat:
                polygon = [tile, tile.add(new Vector(1, 0)), tile.add(new Vector(1, 1)), tile.add(new Vector(0, 1))]; break;
            default:
                polygon = []; break;
        }

        return polygon.map(point => point.add(new Vector(0, WATER_LEVEL * ELEVATION_HEIGHT)).multiply(Config.WORLD_SCALE).toPoint());
    }

    public getGridCopy(): boolean[][] {
        return this.grid.map(o => [...o]);
    }

    public setGrid(grid: boolean[][]): void {
        this.grid = grid;
    }

    public regenerateGrid(): void {
        const grid: boolean[][] = [];
        for (let i = 0; i < Game.map.cols; i++) {
            grid[i] = [];
            for (let j = 0; j < Game.map.rows; j++) {
                const tile = new Vector(i, j);
                const baseElevation = Game.world.elevationGrid.getBaseElevation(tile);

                grid[i][j] = baseElevation < 0;
            }
        }

        this.setGrid(grid);
        this.draw();
    }

    public isPositionWater(position: Vector): boolean {
        if (!Game.map.isPositionInMap(position)) return false;

        const flPos = position.floor();
        return this.grid[flPos.x][flPos.y];
    }

    public setTileWater(tile: Vector): void {
        if (!Game.map.isPositionInMap(tile)) return;

        // TODO: Optimise whether we need to draw here
        this.draw();
        if (this.grid[tile.x][tile.y]) return;

        this.grid[tile.x][tile.y] = true;
        // Disable pathfinding
    }

    public setTileLand(tile: Vector): void {
        if (!Game.map.isPositionInMap(tile)) return;

        this.draw();
        if (!this.grid[tile.x][tile.y]) return;

        this.grid[tile.x][tile.y] = false;
        // Enable pathfinding
    }

    /**
     * Draws blue & black Xs to show water
     */
    public drawDebug(): void {
        const xOffset = Config.WORLD_SCALE / 2;
        const yOffset = Config.WORLD_SCALE / 2;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j]) {
                    Graphics.setLineStyle(0.5, 0x0000FF);
                    Graphics.drawX(new Vector(i * Config.WORLD_SCALE + xOffset, j * Config.WORLD_SCALE + yOffset), 2);
                } else {
                    Graphics.setLineStyle(0.5, 0x000000);
                    Graphics.drawX(new Vector(i * Config.WORLD_SCALE + xOffset, j * Config.WORLD_SCALE + yOffset), 2);
                }
            }
        }
    }
}
