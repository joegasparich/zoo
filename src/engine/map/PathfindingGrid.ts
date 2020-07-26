import { js as Pathfinder, Direction } from "easystarjs";

import { Game, Vector } from "engine";
import { Side, TAG } from "engine/consts";

const allDirections: Direction[] = ["BOTTOM", "BOTTOM_LEFT", "BOTTOM_RIGHT", "LEFT", "RIGHT", "TOP", "TOP_LEFT", "TOP_RIGHT"];

export default class PathfindingGrid {
    private pathFinder: Pathfinder;

    private grid: number[][];

    public constructor(public game: Game, rows: number, cols: number) {
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
        if (!this.isPositionInGrid(start.x, start.y) ||
            !this.isPositionInGrid(end.x, end.y)) return Promise.resolve();
        if (this.grid[start.x][start.y]) return Promise.resolve(); //(TODO: start from next nearest tile?)
        if (this.grid[end.x][end.y]) return Promise.resolve(); //(TODO: potentially pick adjacent tile?)
        if (start.equals(end)) return Promise.resolve();

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
            if (!this.isLineWalkable(currentNode.add(new Vector(0.5,0.5)), nextNode.add(new Vector(0.5,0.5)))) {
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

    public isLineWalkable(a: Vector, b: Vector): boolean {
        const hit = this.game.physicsManager.rayCast(b, a, [TAG.Solid]);
        if (hit) {
            return false;
        }
        return true;
    }

    public isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this.grid.length) return false;
        if (y < 0 || y >= this.grid[0].length) return false;
        return !this.grid[x][y];
    }

    public isPositionInGrid(x: number, y: number): boolean {
        return x >= 0 &&
               x < this.grid.length &&
               y >= 0 &&
               y < this.grid[0].length;
    }

    public getGrid(): number[][] {
        return this.grid;
    }

    public reset(): void {
        this.grid = [];
        this.pathFinder.setGrid([]);
    }
}
