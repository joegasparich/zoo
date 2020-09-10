import { Config } from "consts";
import { Graphics, Vector } from "engine";
import { pointInCircle } from "engine/helpers/math";
import ZooGame from "ZooGame";

const ELEVATION_HEIGHT = 0.5;

export enum Elevation {
    // Water = -1,
    Flat = 0,
    Hill = 1,
}

export enum SlopeVariant {
    Flat, Cliff,
    S, E, W, N,
    NW, NE, SW, SE,
    INW, INE, ISW, ISE,
    I1, I2
}

export default class ElevationGrid {
    private grid: Elevation[][];
    private width: number;
    private height: number;

    public setup(): void {
        this.width = ZooGame.map.cols + 1;
        this.height = ZooGame.map.rows + 1;

        // Initialise grid to flat
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.grid[i][j] = Elevation.Flat;
            }
        }
    }

    public setElevation(pos: Vector, radius: number, elevation: Elevation): void {
        if (!ZooGame.map.isPositionInMap(pos)) return;

        for(let i = pos.x - radius; i <= pos.x + radius; i++) {
            for(let j = pos.y - radius; j <= pos.y + radius; j++) {
                const gridPos = new Vector(i, j).floor();
                if (!this.isPositionInGrid(gridPos)) continue;

                if (pointInCircle(pos, radius, gridPos)) {
                    this.grid[gridPos.x][gridPos.y] = elevation;
                }
            }
        }

        ZooGame.world.biomeGrid.redrawChunksInRadius(pos.multiply(2), radius + 3);
        ZooGame.world.wallGrid.getWallsInRadius(pos, radius + 1).forEach(wall => wall.updateSprite());
    }

    public getElevationAtPoint(pos: Vector): number {
        if (!this.isPositionInGrid(pos)) {
            return 0;
        }

        const relX = pos.x % 1;
        const relY = pos.y % 1;

        // Tried to come up with a formula instead of using enums but I'm too dumb
        switch (this.getSlopeVariant(pos.floor())) {
            case SlopeVariant.Flat: return 0;
            case SlopeVariant.Cliff: return ELEVATION_HEIGHT;
            case SlopeVariant.N: return ELEVATION_HEIGHT * relY;
            case SlopeVariant.S: return ELEVATION_HEIGHT * (1 - relY);
            case SlopeVariant.W: return ELEVATION_HEIGHT * relX;
            case SlopeVariant.E: return ELEVATION_HEIGHT * (1 - relX);
            case SlopeVariant.SE: return ELEVATION_HEIGHT * Math.max((1 - relX - relY), 0);
            case SlopeVariant.SW: return ELEVATION_HEIGHT * Math.max((1 - (1 - relX) - relY), 0);
            case SlopeVariant.NE: return ELEVATION_HEIGHT * Math.max((1 - relX - (1 - relY)), 0);
            case SlopeVariant.NW: return ELEVATION_HEIGHT * Math.max((1 - (1 - relX) - (1 - relY)), 0);
            case SlopeVariant.ISE: return ELEVATION_HEIGHT * Math.max((1 - relX), (1 - relY));
            case SlopeVariant.ISW: return ELEVATION_HEIGHT * Math.max(relX, (1 - relY));
            case SlopeVariant.INE: return ELEVATION_HEIGHT * Math.max((1 - relX), relY);
            case SlopeVariant.INW: return ELEVATION_HEIGHT * Math.max(relX, relY);
            case SlopeVariant.I1: return ELEVATION_HEIGHT * Math.max((1 - relX - relY), (1 - (1 - relX) - (1 - relY)));
            case SlopeVariant.I2: return ELEVATION_HEIGHT * Math.max((1 - (1 - relX) - relY), (1 - relX - (1 - relY)));
            default:
                console.error("You shouldn't be here");
                return 0;
        }
    }

    public getSlopeVariant(cell: Vector): SlopeVariant {
        if (!ZooGame.map.isPositionInMap(cell)) {
            return SlopeVariant.Flat;
        }

        const {x, y} = cell;
        const nw = this.grid[x][y];         // Top Left
        const ne = this.grid[x + 1][y];     // Top Right
        const sw = this.grid[x][y + 1];     // Bottom Left
        const se = this.grid[x + 1][y + 1]; // Bottom Right

        if (nw && ne && sw && se) return SlopeVariant.Cliff;
        if (!nw && !ne && !sw && !se) return SlopeVariant.Flat;
        if (!nw && !ne && sw && se) return SlopeVariant.N;
        if (nw && !ne && sw && !se) return SlopeVariant.E;
        if (nw && ne && !sw && !se) return SlopeVariant.S;
        if (!nw && ne && !sw && se) return SlopeVariant.W;
        if (nw && !ne && !sw && !se) return SlopeVariant.SE;
        if (!nw && ne && !sw && !se) return SlopeVariant.SW;
        if (!nw && !ne && sw && !se) return SlopeVariant.NE;
        if (!nw && !ne && !sw && se) return SlopeVariant.NW;
        if (!nw && ne && sw && se) return SlopeVariant.INW;
        if (nw && !ne && sw && se) return SlopeVariant.INE;
        if (nw && ne && !sw && se) return SlopeVariant.ISW;
        if (nw && ne && sw && !se) return SlopeVariant.ISE;
        if (nw && !ne && !sw && se) return SlopeVariant.I1;
        if (!nw && ne && sw && !se) return SlopeVariant.I2;

        console.error("How did you get here?");
        return undefined;
    }

    private isPositionInGrid(pos: Vector): boolean {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }

    /**
     * Draws green & red Xs to show which nodes are pathable
     */
    public drawDebug(): void {
        const cellSize = Config.WORLD_SCALE;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                Graphics.setLineStyle(1, 0xFF0000);
                if (i < this.grid.length - 1) {
                    Graphics.drawLine(
                        i * cellSize,
                        (j - this.grid[i][j] * ELEVATION_HEIGHT) * cellSize,
                        (i + 1) * cellSize,
                        (j - this.grid[i + 1][j] * ELEVATION_HEIGHT) * cellSize,
                    );
                }
                if (j < this.grid[i].length - 1) {
                    Graphics.drawLine(
                        i * cellSize,
                        (j - this.grid[i][j] * ELEVATION_HEIGHT) * cellSize,
                        i * cellSize,
                        (j - this.grid[i][j + 1] * ELEVATION_HEIGHT + 1) * cellSize,
                    );
                }
            }
        }
    }
}
