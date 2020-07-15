import { Camera, Game, Layers, Vector } from "engine";
import { inCircle } from "engine/helpers/math";

enum Biome {
    Grass = 0x339900,
    Sand = 0x884400,
    Snow = 0xDDDDFF,
}

class Square {
    public quadrants: Biome[];

    public constructor(biome?: Biome, biomes?: {north: number; south: number; east: number; west: number}) {
        this.quadrants = [];

        this.quadrants[0] = biomes?.north ?? biome ?? Biome.Grass;
        this.quadrants[1] = biomes?.east ?? biome ?? Biome.Grass;
        this.quadrants[2] = biomes?.south ?? biome ?? Biome.Grass;
        this.quadrants[3] = biomes?.west ?? biome ?? Biome.Grass;
    }
}

export default class BiomeGrid {
    private game: Game;
    private camera: Camera;

    private grid: Square[][];
    private graphics: PIXI.Graphics;
    public width: number;
    public height: number;
    private cellSize: number;

    public constructor(game: Game, width: number, height: number, cellSize: number) {
        this.game = game;
        this.camera = game.camera;
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;

        this.setup();
    }

    private setup(): void  {
        // Generate grid
        this.grid = [];
        for (let i = 0; i < this.height; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                this.grid[i][j] = new Square(Biome.Grass);
            }
        }

        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = Layers.GROUND;
        this.graphics.position = this.camera.offset.toPoint();
        this.game.stage.addChild(this.graphics);

        this.draw();
        //Test//
        const rad = 4;
        this.setBiome(new Vector(10.5, 10.5), rad, Biome.Snow);
        this.draw();

        this.graphics.lineStyle(1, 0xFF0000);
        this.graphics.drawCircle(10.5*this.cellSize, 10.5*this.cellSize, rad*this.cellSize);
        this.graphics.lineStyle();
    }

    public draw(): void {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                for (let q = 0; q < 4; q++) {
                    this.graphics.beginFill(this.grid[i][j].quadrants[q]).drawPolygon(this.getQuadrantVertices(i, j, q).map(vertex => {
                        const vec = vertex.multiply(this.cellSize);
                        return new PIXI.Point(vec.x, vec.y);
                    })).endFill();
                }
            }
        }
    }

    private getQuadrantVertices(x: number, y: number, quadrant: number): Vector[] {
        switch (quadrant) {
        case 0:
            return [
                new Vector(x, y),
                new Vector((x+1), y),
                new Vector(x + 0.5, y + 0.5),
            ];
        case 1:
            return [
                new Vector(x, y),
                new Vector(x, (y+1)),
                new Vector(x + 0.5, y + 0.5),
            ];
        case 2:
            return [
                new Vector(x, (y+1)),
                new Vector((x+1), (y+1)),
                new Vector(x + 0.5, y + 0.5),
            ];
        case 3:
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

        for(let i = pos.x - (radius+1); i <= pos.x + (radius+1); i++) {
            for(let j = pos.y - (radius+1); j <= pos.y + (radius+1); j++) {
                const cellPos = new Vector(i, j).floor();
                if (!this.isPositionInGrid(cellPos)) return;
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
    }

    private isPositionInGrid(pos: Vector): boolean {
        return pos.x > 0 && pos.x < this.width * this.cellSize && pos.y > 0 && pos.y < this.height * this.cellSize;
    }
}
