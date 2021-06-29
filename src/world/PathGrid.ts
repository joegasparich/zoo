
import { Config } from "consts";
import Game from "Game";
import Graphics from "Graphics";
import Vector from "vector";
import Path from "./Path";
import { NodeType } from "./PathfindingGrid";

export interface PathGridSaveData {
    paths: ({
        assetPath: string;
    } | undefined)[][];
}

export default class PathGrid {
    private grid: Path[][];
    private width: number;
    private height: number;

    public setup(data?: PathGridSaveData): void {
        this.width = Game.map.cols;
        this.height = Game.map.rows;

        // Initialise grid to empty
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j++) {
                const { assetPath } = data?.paths?.[i]?.[j] ?? {};
                if (assetPath) {
                    this.grid[i][j] = new Path(new Vector(i, j), assetPath);
                } else {
                    this.grid[i][j] = undefined;
                }
            }
        }

        // this.regeneratePathfinding();

        this.regeneratePathSprites();
    }

    public regeneratePathSprites(): void {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const path = this.grid?.[i]?.[j];
                if (!path) continue;
                path.updateSprite();
            }
        }
    }

    public reset(): void {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.grid?.[i]?.[j]?.remove();
            }
        }

        this.grid = [];
    }

    public placePathAtTile(assetPath: string, tilePos: Vector): Path {
        if (!Game.map.isPositionInMap(tilePos)) return;
        if (this.getPathAtTile(tilePos)) {
            // TODO: Handle path replacement
            return;
        }

        const {x, y} = tilePos;

        const path = new Path(tilePos, assetPath);
        this.grid[x][y] = path;

        // TODO: this.updatePathfindingAtWall(tilePos, side);
        Game.map.setTilePathable(tilePos, NodeType.PATH);

        return path;
    }

    public getPathAtTile(tilePos: Vector): Path | undefined {
        if (!Game.map.isPositionInMap(tilePos)) return undefined;

        return this.grid[tilePos.floor().x][tilePos.floor().y];
    }

    public deletePathAtPosition(pos: Vector): void {
        if (!Game.map.isPositionInMap(pos)) return;
        const path = this.grid[pos.x][pos.y];
        if (path) this.deletePath(path);
    }

    public deletePath(path: Path): void {
        this.grid[path.position.x][path.position.y] = undefined;
        path.remove();
        Game.map.setTilePathable(path.position, NodeType.OPEN);
    }

    public save(): PathGridSaveData {
        return {
            paths: this.grid.map(row => row.map(path => {
                return path ? {
                    assetPath: path.data.assetPath,
                } : undefined;
            })),
        };
    }

    public load(data: PathGridSaveData): void {
        this.reset();
        this.setup(data);
    }

    /**
     * Draws green & red Xs to show where paths are
     */
    public drawDebug(): void {
        const xOffset = Config.WORLD_SCALE / 2;
        const yOffset = Config.WORLD_SCALE / 2;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] == undefined) {
                    Graphics.setLineStyle(0.5, 0xFF0000);
                    Graphics.drawX(new Vector(i * Config.WORLD_SCALE + xOffset, j * Config.WORLD_SCALE + yOffset), 2);
                } else {
                    Graphics.setLineStyle(0.5, 0x00FF00);
                    Graphics.drawX(new Vector(i * Config.WORLD_SCALE + xOffset, j * Config.WORLD_SCALE + yOffset), 2);
                }
            }
        }
    }
}
