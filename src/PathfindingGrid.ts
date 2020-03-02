import { js as Pathfinder } from "easystarjs";

import Vector from "types/vector";

export type Path = { x: number; y: number; }[];

export default class PathfindingGrid {
    pathFinder: Pathfinder;
    graphics: PIXI.Graphics;

    grid: number[][];
    lastPath: Path;
    drawDebug: Function;

    constructor(rows: number, cols: number, drawDebug: Function) {
        this.grid = this.generateGrid(rows, cols)

        this.pathFinder = new Pathfinder();
        this.pathFinder.enableDiagonals();
        this.pathFinder.disableCornerCutting();
        this.pathFinder.setGrid(this.grid);
        this.pathFinder.setAcceptableTiles([0]);

        this.drawDebug = drawDebug;

        this.disablePoint(new Vector(0, 2));
        this.disablePoint(new Vector(1, 2));
        this.disablePoint(new Vector(2, 2));
        this.disablePoint(new Vector(3, 2));
        this.disablePoint(new Vector(4, 2));
        this.getPath(new Vector(1, 1), new Vector(4, 6));
    }

    generateGrid(rows: number, cols: number): number[][] {
        const grid: number[][] = [];
        for(let i = 0; i < cols; i++) {
            grid[i] = [];
            for(let j = 0; j < rows; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }

    disablePoint(pos: Vector) {
        this.grid[pos.y][pos.x] = 1;
        this.pathFinder.setGrid(this.grid);
    }

    enablePoint(pos: Vector) {
        this.grid[pos.y][pos.x] = 0;
        this.pathFinder.setGrid(this.grid);
    }

    getPath(start: Vector, end: Vector): Promise<Path> {
        return new Promise((resolve, reject) => {
            this.pathFinder.findPath(start.x, start.y, end.x, end.y, (path) => {
                if (path === null) {
                    reject()
                } else {
                    this.lastPath = path;
                    this.drawDebug(this.lastPath);
                    resolve(this.lastPath);
                }
            });
            this.pathFinder.calculate();
        })
    }
}