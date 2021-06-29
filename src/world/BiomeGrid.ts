import { Graphics } from "pixi.js";

import Camera from "Camera";
import { Layer, Side } from "consts";
import { circleIntersectsRect, clamp, hexToHsl, hslToHex, pointInCircle } from "helpers/math";
import Vector from "vector";
import Game from "Game";
import Area from "./Area";
import { SlopeVariant } from "./ElevationGrid";
import { toObservablePoint } from "helpers/vectorHelper";

export enum Biome {
    Grass = 0xb6d53c,
    Sand = 0xf4cca1,
    Snow = 0xdff6f5,
}

const CHUNK_SIZE = 5;

export interface BiomeSaveData {
    chunks: Biome[][][][][];
}

class Square {
    private quadrants: Biome[];

    public constructor(biome?: Biome, biomes?: number[]) {
        this.quadrants = [];

        if (biomes) {
            this.quadrants = biomes;
            return;
        }

        this.quadrants[Side.North] = biome ?? Biome.Grass;
        this.quadrants[Side.East] = biome ?? Biome.Grass;
        this.quadrants[Side.South] = biome ?? Biome.Grass;
        this.quadrants[Side.West] = biome ?? Biome.Grass;
    }

    public setQuadrant(side: Side, biome: Biome): void {
        this.quadrants[side] = biome;
    }

    public getQuadrants(): Biome[] {
        return this.quadrants;
    }
}

export default class BiomeGrid {

    private chunks: BiomeChunk[][];

    public constructor(public width: number, public height: number, private cellSize: number) {}

    public setup(data?: BiomeSaveData): void  {
        const chunkCols = Math.ceil(this.width / CHUNK_SIZE);
        const chunkRows = Math.ceil(this.height / CHUNK_SIZE);
        this.chunks = [];
        for (let i = 0; i < chunkCols; i++) {
            this.chunks[i] = [];
            for (let j = 0; j < chunkRows; j++) {
                this.chunks[i][j] = new BiomeChunk(
                    new Vector(i * CHUNK_SIZE, j * CHUNK_SIZE),
                    i === chunkCols - 1 && this.width % CHUNK_SIZE !== 0 ? this.width % CHUNK_SIZE : CHUNK_SIZE,
                    j === chunkRows - 1 && this.width % CHUNK_SIZE !== 0 ? this.height % CHUNK_SIZE : CHUNK_SIZE,
                    this.cellSize,
                );
                this.chunks[i][j].setup(data?.chunks[i][j]);
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

    public reset(): void {
        for (let i = 0; i < this.chunks.length; i++) {
            for (let j = 0; j < this.chunks[i].length; j++) {
                this.chunks[i][j].remove();
            }
        }
        this.chunks = [];
    }

    public setBiome(pos: Vector, radius: number, biome: Biome, area?: Area): void {
        this.getChunksInRadius(pos, radius).forEach(chunk => {
            chunk.setBiome(new Vector(pos.x - chunk.pos.x, pos.y - chunk.pos.y), radius, biome, area);
        });
    }

    public redrawChunksInRadius(pos: Vector, radius: number): void {
        this.getChunksInRadius(pos, radius).forEach(chunk => {
            chunk.shouldRedraw = true;
        });
    }

    public redrawAllChunks(): void {
        for (let i = 0; i < this.chunks.length; i++) {
            for (let j = 0; j < this.chunks[i].length; j++) {
                this.chunks[i][j].shouldRedraw = true;
            }
        }
    }

    public getChunksInRadius(pos: Vector, radius: number): BiomeChunk[] {
        const { x: flrX, y: flrY } = pos.divide(CHUNK_SIZE).floor();

        const chunks: BiomeChunk[] = [];

        // TODO: Only handles 3x3 around position. May potentially need to handle more chunks?
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

    public save(): BiomeSaveData {
        return {
            chunks: this.chunks.map(row => row.map(chunk => chunk.getCopy())),
        };
    }

    public load(data: BiomeSaveData): void {
        this.reset();
        this.setup(data);
    }
}

export class BiomeChunk {
    public static Biome = Biome;

    private camera: Camera;

    private grid: Square[][];
    private graphics: Graphics;

    public shouldRedraw: boolean;

    public constructor(public pos: Vector, public width: number, public height: number, private cellSize: number) {
        this.camera = Game.camera;
    }

    public setup(data?: Biome[][][]): void  {
        // Generate grid
        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j++) {
                if (data) {
                    this.grid[i][j] = new Square(undefined, data[i][j]);
                } else {
                    this.grid[i][j] = new Square(Biome.Grass);
                }
            }
        }

        this.graphics = new Graphics();
        Game.addToStage(this.graphics, Layer.GROUND);

        this.shouldRedraw = true;
    }

    public draw(): void {
        this.graphics.clear();

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                for (let q = 0; q < 4; q++) {
                    // this.graphics.lineStyle(0.2, 0xFFFFFF); // White borders on biome grid
                    let colour = this.grid[i][j].getQuadrants()[q];
                    const {h,s,l} = hexToHsl(colour);
                    const slopeColour = this.getQuadrantSlopeColour(i + this.pos.x, j + this.pos.y, q) * 0.1;
                    colour = hslToHex(h, s, clamp(l + slopeColour, 0, 1));
                    this.graphics
                        .beginFill(colour)
                        .drawPolygon(this.getQuadrantVertices(i, j, q).map(vertex => {
                            let vec = vertex.add(new Vector(this.pos.x, this.pos.y));
                            // Add elevation
                            const elevation = Game.world.elevationGrid.getElevationAtPoint(vec.divide(2));
                            vec = vec.add(new Vector(0, -(elevation * 2)));

                            // Convert to screen space
                            return toObservablePoint(vec.multiply(this.cellSize));
                        }))
                        .endFill();
                }
            }
        }
    }

    public postUpdate(): void {
        if (this.shouldRedraw) {
            // TODO: Investigate drawing one chunk per frame or something
            this.draw();
            this.shouldRedraw = false;
        }
    }

    public remove(): void {
        Game.removeFromStage(this.graphics, Layer.GROUND);
        this.graphics.destroy();
    }

    private getQuadrantVertices(x: number, y: number, quadrant: Side): Vector[] {
        switch (quadrant) {
            case Side.North:
                return [
                    new Vector(x, y),
                    new Vector((x+1), y),
                    new Vector(x + 0.5, y + 0.5),
                ];
            case Side.West:
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
            case Side.East:
                return [
                    new Vector((x+1), y),
                    new Vector((x+1), (y+1)),
                    new Vector(x + 0.5, y + 0.5),
                ];
        }
    }

    private getQuadrantSlopeColour(x: number, y: number, quadrant: Side): number {
        const slopeVariant = Game.world.elevationGrid.getSlopeVariant(new Vector(x, y).divide(2).floor());

        const NW = 1, N = 0.75, W = 0.5, NE = 0.25, F = 0, SW = -0.25, E = -0.5, S = -0.75, SE = -1;
        const xRel = x/2 % 1;
        const yRel = y/2 % 1;

        switch(slopeVariant) {
            case SlopeVariant.N: return N;
            case SlopeVariant.S: return S;
            case SlopeVariant.W: return W;
            case SlopeVariant.E: return E;
            case SlopeVariant.NW: return (xRel + yRel) > 0.5 || ((xRel + yRel) === 0.5 && (quadrant === Side.South || quadrant === Side.East)) ? NW : F;
            case SlopeVariant.NE: return (xRel - yRel) < 0 || ((xRel - yRel) === 0 && (quadrant === Side.South || quadrant === Side.West)) ? NE : F;
            case SlopeVariant.SW: return (yRel - xRel) < 0 || ((yRel - xRel) === 0 && (quadrant === Side.North || quadrant === Side.East)) ? SW : F;
            case SlopeVariant.SE: return (xRel + yRel) < 0.5 || ((xRel + yRel) === 0.5 && (quadrant === Side.North || quadrant === Side.West)) ? SE : F;
            case SlopeVariant.INW: return (xRel - yRel) < 0 || ((xRel - yRel) === 0 && (quadrant === Side.South || quadrant === Side.West)) ? N : W;
            case SlopeVariant.INE: return (xRel + yRel) > 0.5 || ((xRel + yRel) === 0.5 && (quadrant === Side.South || quadrant === Side.East)) ? N : E;
            case SlopeVariant.ISW: return (xRel + yRel) < 0.5 || ((xRel + yRel) === 0.5 && (quadrant === Side.North || quadrant === Side.West)) ? S : W;
            case SlopeVariant.ISE: return (yRel - xRel) < 0 || ((yRel - xRel) === 0 && (quadrant === Side.North || quadrant === Side.East)) ? S : E;
            case SlopeVariant.I1: return (xRel + yRel) > 0.5 || ((xRel + yRel) === 0.5 && (quadrant === Side.South || quadrant === Side.East)) ? NW : SE;
            case SlopeVariant.I2: return (xRel - yRel) < 0 || ((xRel - yRel) === 0 && (quadrant === Side.South || quadrant === Side.West)) ? NE : SW;
            case SlopeVariant.Flat:
            default:
                return F;
        }
    }

    public setBiome(pos: Vector, radius: number, biome: Biome, area?: Area): void {
        let changed = false;

        for(let i = pos.x - (radius); i <= pos.x + (radius); i++) {
            for(let j = pos.y - (radius); j <= pos.y + (radius); j++) {
                const cellPos = new Vector(i, j).floor();
                if (!this.isPositionInGrid(cellPos)) continue;
                if (area && area !== Game.world.getAreaAtPosition(cellPos.add(this.pos).multiply(0.5))) continue;

                // Get Triangles in circle
                for (let q = 0; q < 4; q++) {
                    this.getQuadrantVertices(cellPos.x, cellPos.y, q).forEach((point: Vector) => {
                        if (pointInCircle(pos, radius, point)) {
                            const xflr = Math.floor(cellPos.x);
                            const yflr = Math.floor(cellPos.y);
                            this.grid[xflr][yflr].setQuadrant(q, biome);
                            changed = true;
                        }
                    });
                }
            }
        }

        if (changed) {
            this.draw();
        }
    }

    public getCopy(): Biome[][][] {
        return this.grid.map(r => r.map(sq => [...sq.getQuadrants()]));
    }

    public setData(data: Biome[][][]): void {
        this.grid = [];

        for (let i = 0; i < data.length; i++) {
            this.grid[i] = [];
            for (let j = 0; j < data[i].length; j++) {
                this.grid[i][j] = new Square(undefined, data[i][j]);
            }
        }
    }

    private isPositionInGrid(pos: Vector): boolean {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }
}
