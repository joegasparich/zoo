import { Camera, Game, Layers, Vector } from "engine";
import { Side } from "engine/consts";
import { inCircle } from "engine/helpers/math";
import World from "./World";

export enum Biome {
    Grass = 0xb6d53c,
    Sand = 0xf4cca1,
    Snow = 0xdff6f5,
}

class Square {
    public quadrants: Biome[];

    public constructor(biome?: Biome, biomes?: {north: number; south: number; east: number; west: number}) {
        this.quadrants = [];

        this.quadrants[Side.North] = biomes?.north ?? biome ?? Biome.Grass;
        this.quadrants[Side.East] = biomes?.east ?? biome ?? Biome.Grass;
        this.quadrants[Side.South] = biomes?.south ?? biome ?? Biome.Grass;
        this.quadrants[Side.West] = biomes?.west ?? biome ?? Biome.Grass;
    }
}

export default class BiomeGrid {
    public static Biome = Biome;

    private game: Game;
    private camera: Camera;

    private grid: Square[][];
    private graphics: PIXI.Graphics;
    public width: number;
    public height: number;
    private cellSize: number;

    public constructor(world: World, width: number, height: number, cellSize: number) {
        this.game = world.game;
        this.camera = this.game.camera;
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }

    public setup(): void  {
        // Generate grid
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.grid[i][j] = new Square(Biome.Grass);
            }
        }

        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = Layers.GROUND;
        this.graphics.position = this.camera.offset.toPoint();
        this.game.stage.addChild(this.graphics);

        this.draw();
    }

    public draw(): void {
        this.graphics.clear();

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                for (let q = 0; q < 4; q++) {
                    this.graphics.beginFill(this.grid[i][j].quadrants[q]).drawPolygon(this.getQuadrantVertices(i, j, q).map(vertex => {
                        const vec = vertex.multiply(this.cellSize);
                        return new PIXI.Point(vec.x, vec.y);
                    })).endFill();
                }
            }
        }
    }

    private getQuadrantVertices(x: number, y: number, quadrant: Side): Vector[] {
        switch (quadrant) {
            case Side.North:
                return [
                    new Vector(x, y),
                    new Vector((x+1), y),
                    new Vector(x + 0.5, y + 0.5),
                ];
            case Side.East:
                return [
                    new Vector(x, y),
                    new Vector(x, (y+1)),
                    new Vector(x + 0.5, y + 0.5),
                ];
            case Side.South:
                return [
                    new Vector(x, (y+1)),
                    new Vector((x+1), (y+1)),
                    new Vector(x + 0.5, y + 0.5),
                ];
            case Side.West:
                return [
                    new Vector((x+1), y),
                    new Vector((x+1), (y+1)),
                    new Vector(x + 0.5, y + 0.5),
                ];
        }
    }

    public postUpdate(): void {
        this.graphics.scale.set(this.camera.scale, this.camera.scale);
        this.graphics.position = this.camera.worldToScreenPosition(Vector.Zero).toPoint();
    }

    public setBiome(pos: Vector, radius: number, biome: Biome): void {
        if (!this.isPositionInGrid(pos)) return;

        for(let i = pos.x - (radius); i <= pos.x + (radius); i++) {
            for(let j = pos.y - (radius); j <= pos.y + (radius); j++) {
                const cellPos = new Vector(i, j).floor();
                if (!this.isPositionInGrid(cellPos)) continue;
                // Get Triangles in circle
                for (let q = 0; q < 4; q++) {
                    this.getQuadrantVertices(cellPos.x, cellPos.y, q).forEach((point: Vector) => {
                        if (inCircle(pos, radius, point)) {
                            const xflr = Math.floor(cellPos.x);
                            const yflr = Math.floor(cellPos.y);
                            this.grid[xflr][yflr].quadrants[q] = biome;
                            return;
                        }
                    });
                }
            }
        }

        this.draw();
    }

    private isPositionInGrid(pos: Vector): boolean {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }
}
