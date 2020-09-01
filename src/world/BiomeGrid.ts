import { Camera, Layers, Vector } from "engine";
import { Side } from "engine/consts";
import { circleIntersectsRect, pointInCircle } from "engine/helpers/math";
import ZooGame from "ZooGame";

export enum Biome {
    Grass = 0xb6d53c,
    Sand = 0xf4cca1,
    Snow = 0xdff6f5,
}

const CHUNK_SIZE = 5;

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


    private chunks: BiomeChunk[][];

    public constructor(public width: number, public height: number, private cellSize: number) {}

    public setup(): void  {
        const chunkCols = Math.ceil(this.width / CHUNK_SIZE);
        const chunkRows = Math.ceil(this.height / CHUNK_SIZE);
        this.chunks = [];
        for (let i = 0; i < chunkCols; i++) {
            this.chunks[i] = [];
            for (let j = 0; j < chunkRows; j++) {
                this.chunks[i][j] = new BiomeChunk(
                    new Vector(i * CHUNK_SIZE, j * CHUNK_SIZE),
                    i === chunkCols ? this.width % CHUNK_SIZE : CHUNK_SIZE,
                    j === chunkRows ? this.height % CHUNK_SIZE : CHUNK_SIZE,
                    this.cellSize,
                );
                this.chunks[i][j].setup();
            }
        }

        this.draw();
    }

    public draw(): void {
        for (let i = 0; i < this.chunks.length; i++) {
            for (let j = 0; j < this.chunks[i].length; j++) {
                this.chunks[i][j].draw();
            }
        }
    }

    public postUpdate(): void {
        for (let i = 0; i < this.chunks.length; i++) {
            for (let j = 0; j < this.chunks[i].length; j++) {
                this.chunks[i][j].postUpdate();
            }
        }
    }

    public setBiome(pos: Vector, radius: number, biome: Biome): void {
        this.getChunksInArea(pos, radius).forEach(chunk => {
            chunk.setBiome(new Vector(pos.x - chunk.pos.x, pos.y - chunk.pos.y), radius, biome);
            chunk.draw();
        });
    }

    private getChunksInArea(pos: Vector, radius: number): BiomeChunk[] {
        const { x: flrX, y: flrY } = pos.divide(CHUNK_SIZE).floor();

        const chunks: BiomeChunk[] = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const chunk = this.getChunkAtPos(new Vector(flrX + i, flrY + j));
                if (chunk && circleIntersectsRect(chunk.pos, new Vector(CHUNK_SIZE), pos, radius)) {
                    chunks.push(chunk);
                }
            }
        }

        return chunks;
    }

    private getChunkAtPos(pos: Vector): BiomeChunk {
        const { x, y } = pos.floor();

        if (this.chunks[x] && this.chunks[x][y]) {
            return this.chunks[x][y];
        }

        return undefined;
    }
}

class BiomeChunk {
    public static Biome = Biome;

    private camera: Camera;

    private grid: Square[][];
    private graphics: PIXI.Graphics;

    public constructor(public pos: Vector, public width: number, public height: number, private cellSize: number) {
        this.camera = ZooGame.camera;
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
        ZooGame.stage.addChild(this.graphics);
    }

    public draw(): void {
        this.graphics.clear();

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                for (let q = 0; q < 4; q++) {
                    this.graphics.beginFill(this.grid[i][j].quadrants[q]).drawPolygon(this.getQuadrantVertices(i, j, q).map(vertex => {
                        const vec = vertex.add(new Vector(this.pos.x, this.pos.y)).multiply(this.cellSize);
                        return new PIXI.Point(vec.x, vec.y);
                    })).endFill();
                }
            }
        }
    }

    public postUpdate(): void {
        this.graphics.scale.set(this.camera.scale, this.camera.scale);
        this.graphics.position = this.camera.worldToScreenPosition(Vector.Zero).toPoint();
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

    public setBiome(pos: Vector, radius: number, biome: Biome): void {
        for(let i = pos.x - (radius); i <= pos.x + (radius); i++) {
            for(let j = pos.y - (radius); j <= pos.y + (radius); j++) {
                const cellPos = new Vector(i, j).floor();
                if (!this.isPositionInGrid(cellPos)) continue;
                // Get Triangles in circle
                for (let q = 0; q < 4; q++) {
                    this.getQuadrantVertices(cellPos.x, cellPos.y, q).forEach((point: Vector) => {
                        if (pointInCircle(pos, radius, point)) {
                            const xflr = Math.floor(cellPos.x);
                            const yflr = Math.floor(cellPos.y);
                            this.grid[xflr][yflr].quadrants[q] = biome;
                            return;
                        }
                    });
                }
            }
        }
    }

    private isPositionInGrid(pos: Vector): boolean {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }
}
