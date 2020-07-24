import { js as Pathfinder, Direction } from "easystarjs";

import { Vector } from "engine";
import { Side } from "engine/consts";

const allDirections: Direction[] = ["BOTTOM", "BOTTOM_LEFT", "BOTTOM_RIGHT", "LEFT", "RIGHT", "TOP", "TOP_LEFT", "TOP_RIGHT"];

export default class PathfindingGrid {
    private pathFinder: Pathfinder;

    private grid: number[][];

    public constructor(rows: number, cols: number) {
        this.grid = this.generateGrid(rows, cols);

        this.pathFinder = new Pathfinder();
        this.pathFinder.enableDiagonals();
        this.pathFinder.disableCornerCutting();
        this.pathFinder.setGrid(this.grid);
        this.pathFinder.setAcceptableTiles([0]);
    }

    private generateGrid(rows: number, cols: number): number[][] {
        const grid: number[][] = [];
        for(let i = 0; i < cols; i++) {
            grid[i] = [];
            for(let j = 0; j < rows; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }

    public disableEdges(point: Vector, sides: Side[]): void {
        let allowedDirections: Direction[] = [...allDirections];

        if (sides.includes(Side.North)) allowedDirections = allowedDirections.filter(dir => !dir.includes("LEFT"));
        if (sides.includes(Side.South)) allowedDirections = allowedDirections.filter(dir => !dir.includes("RIGHT"));
        if (sides.includes(Side.West)) allowedDirections = allowedDirections.filter(dir => !dir.includes("TOP"));
        if (sides.includes(Side.East)) allowedDirections = allowedDirections.filter(dir => !dir.includes("BOTTOM"));

        this.pathFinder.setDirectionalCondition(point.y, point.x, allowedDirections);
    }

    public disablePoint(x: number, y: number): void {
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            console.error("Tile position must be integers");
            return;
        }

        this.grid[x][y] = 1;
        this.pathFinder.setGrid(this.grid);
    }

    public enablePoint(x: number, y: number): void {
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            console.error("Tile position must be integers");
            return;
        }

        this.grid[x][y] = 0;
        this.pathFinder.setGrid(this.grid);
    }

    public getPath(start: Vector, end: Vector): Promise<Vector[] | void> {
        // if start is on a solid tile then return (TODO: start from next nearest tile?)
        if (this.grid[start.x][start.y]) return Promise.resolve();
        // if end is on a solid tile then return (TODO: potentially pick adjacent tile?)
        if (this.grid[end.x][end.y]) return Promise.resolve();

        console.log("Getting path from " + start + " to " + end);
        return new Promise((resolve) => {
            // Note that the pathfinder expects the grid to be the inverse of what we have it here.
            // I have set it up so that the grid is in the format [x][y] for readability
            // But we need to swap it here for the pathfinder
            this.pathFinder.findPath(start.y, start.x, end.y, end.x, (path) => {
                if (path === null) {
                    resolve();
                } else {
                    resolve(path.map(point => new Vector(point.y, point.x)));
                }
            });
            this.pathFinder.calculate();
        });
    }

    public optimisePath(path: Vector[]): Vector[] {
        if (path.length < 3) return path;

        let currentNode = path.shift();
        const newPath: Vector[] = [currentNode];
        let checkNode = path.shift();
        let nextNode: Vector;
        while (path.length) {
            nextNode = path.shift();
            if (!this.isPathWalkable(currentNode, nextNode)) {
                // We can't skip this node
                newPath.push(checkNode);
                currentNode = checkNode;
            } else {
                // We can skip this node
            }
            checkNode = nextNode;
        }
        newPath.push(nextNode); // Add last node
        return newPath;
    }

    // http://playtechs.blogspot.com/2007/03/raytracing-on-grid.html
    public isPathWalkable(a: Vector, b: Vector): boolean {
        let dx = Math.abs(b.x - a.x);
        let dy = Math.abs(b.y - a.y);
        let x = a.x;
        let y = a.y;
        let n = 1 + dx + dy;
        const xinc = (b.x > a.x) ? 1 : -1;
        const yinc = (b.y > a.y) ? 1 : -1;
        let error = dx - dy;
        dx *= 2;
        dy *= 2;

        for (; n > 0; --n) {
            if (!this.isWalkable(x, y)) {
                return false;
            }

            if (error > 0) {
                x += xinc;
                error -= dy;
            }
            else if (error < 0) {
                y += yinc;
                error += dx;
            } else {
                x += xinc;
                y += yinc;
                error += dx + dx;
            }
        }
        return true;
    }

    public isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this.grid.length) return false;
        if (y < 0 || y >= this.grid[0].length) return false;
        return !this.grid[x][y];
    }

    public getGrid(): number[][] {
        return this.grid;
    }
}
