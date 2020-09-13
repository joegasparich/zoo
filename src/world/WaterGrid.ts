import { Config } from "consts";
import { Graphics, Layers, Vector } from "engine";

import ZooGame from "ZooGame";
import { SlopeVariant, ELEVATION_HEIGHT } from "./ElevationGrid";

const WATER_COLOUR = 0x4499FF;
const WATER_LEVEL = 0.2;

export default class WaterGrid {
    private grid: boolean[][];
    private width: number;
    private height: number;

    private graphics: PIXI.Graphics;

    public setup(): void {
        this.width = ZooGame.map.cols + 1;
        this.height = ZooGame.map.rows + 1;

        // Initialise grid to empty
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.grid[i][j] = false;
            }
        }

        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = Layers.GROUND;
        this.graphics.position = ZooGame.camera.offset.toPoint();
        ZooGame.stage.addChild(this.graphics);
    }

    public postUpdate(): void {
        this.graphics.scale.set(ZooGame.camera.scale, ZooGame.camera.scale);
        this.graphics.position = ZooGame.camera.worldToScreenPosition(Vector.Zero()).toPoint();
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
        const slopeVariant = ZooGame.world.elevationGrid.getSlopeVariant(tile);
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

    public isPositionWater(position: Vector): boolean {
        if (!ZooGame.map.isPositionInMap(position)) return false;

        const flPos = position.floor();
        return this.grid[flPos.x][flPos.y];
    }

    public setTileWater(tile: Vector): void {
        // TODO: Optimise whether we need to draw here
        this.draw();
        if (this.grid[tile.x][tile.y]) return;

        this.grid[tile.x][tile.y] = true;
        // Disable pathfinding
    }

    public setTileLand(tile: Vector): void {
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
