import { Config } from "consts";
import { Graphics, Vector } from "engine";
import { Side } from "engine/consts";
import { pointInCircle } from "engine/helpers/math";

import ZooGame from "ZooGame";
import Wall from "./Wall";

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

    public setElevation(centre: Vector, radius: number, elevation: Elevation): void {
        if (!ZooGame.map.isPositionInMap(centre)) return;

        for(let i = centre.x - radius; i <= centre.x + radius; i++) {
            for(let j = centre.y - radius; j <= centre.y + radius; j++) {
                const gridPos = new Vector(i, j).floor();
                if (!this.isPositionInGrid(gridPos)) continue;

                if (pointInCircle(centre, radius, gridPos)) {
                    // TODO: Allow elevation if all required points are being elevated
                    if (this.canElevate(gridPos)) {
                        this.grid[gridPos.x][gridPos.y] = elevation;
                    }
                }
            }
        }

        ZooGame.world.biomeGrid.redrawChunksInRadius(centre.multiply(2), radius + 3);
        ZooGame.world.wallGrid.getWallsInRadius(centre, radius + 1).forEach(wall => wall.updateSprite());
    }

    public canElevate(gridPos: Vector): boolean {
        // Check 4 surrounding tiles for tileObjects that can't be on slopes
        for (const tile of this.getSurroundingTiles(gridPos)) {
            const object = ZooGame.world.getTileObjectAtPos(tile);
            if (object && !object.data.canPlaceOnSlopes) return false;
        }

        // Check 4 surrounding wall slots for gates
        for (const wall of this.getSurroundingWalls(gridPos)) {
            if (wall?.exists && wall?.isDoor) return false;
        }

        return true;
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

    public getSlopeVariant(tile: Vector): SlopeVariant {
        const {x, y} = tile;
        const nw = this.getElevationAtGridPoint(new Vector(x, y));         // Top Left
        const ne = this.getElevationAtGridPoint(new Vector(x + 1, y));     // Top Right
        const sw = this.getElevationAtGridPoint(new Vector(x, y + 1));     // Bottom Left
        const se = this.getElevationAtGridPoint(new Vector(x + 1, y + 1)); // Bottom Right

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

    public isPositionSloped(position: Vector): boolean {
        const slopeVariant = this.getSlopeVariant(position.floor());

        return slopeVariant === SlopeVariant.Cliff || slopeVariant === SlopeVariant.Flat;
    }

    private isPositionInGrid(pos: Vector): boolean {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }

    private getElevationAtGridPoint(gridPos: Vector): number {
        return this.grid[gridPos.x] && this.grid[gridPos.x][gridPos.y] ? this.grid[gridPos.x][gridPos.y] : 0;
    }

    private getSurroundingTiles(gridPos: Vector): Vector[] {
        const tiles: Vector[] = [];
        for (let i = -1; i < 1; i++) {
            for (let j = -1; j < 1; j++) {
                tiles.push(gridPos.add(new Vector(i, j)));
            }
        }

        return tiles;
    }

    private getSurroundingWalls(gridPos: Vector): Wall[] {
        return [
            ZooGame.world.wallGrid.getWallAtTile(gridPos, Side.North),
            ZooGame.world.wallGrid.getWallAtTile(gridPos, Side.West),
            ZooGame.world.wallGrid.getWallAtTile(gridPos.subtract(new Vector(1)), Side.South),
            ZooGame.world.wallGrid.getWallAtTile(gridPos.subtract(new Vector(1)), Side.East),
        ];
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
