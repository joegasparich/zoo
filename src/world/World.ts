import { Config } from "consts";
import { Game, Vector } from "engine";
import { randomInt } from "engine/helpers/math";
import { MapGrid } from "engine/map";

import TileObject from "entities/TileObject";
import EmptyScene from "scenes/EmptyScene";
import BiomeGrid from "./BiomeGrid";
import WallGrid from "./WallGrid";

export default class World {
    public game: Game;
    public map: MapGrid;
    public biomeGrid: BiomeGrid;
    public wallGrid: WallGrid;
    private tileObjects: Map<string, TileObject>;

    public constructor(game: Game) {
        this.game = game;
        this.map = game.map;
        this.tileObjects = new Map();

        this.wallGrid = new WallGrid(this);
        this.biomeGrid = new BiomeGrid(this, 10, 16, Config.BIOME_SCALE);
    }

    public setup(): void {
        // TODO: Figure out how to load map info like biomes after biomeGrid.setup
        this.loadMap();

        this.biomeGrid.setup();
        this.wallGrid.setup();
    }

    public postUpdate(delta: number): void {
        this.biomeGrid.postUpdate();
        this.wallGrid.postUpdate();
    }

    private async loadMap(): Promise<void> {
        await this.game.sceneManager.loadScene(
            new EmptyScene(this),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );
    }

    public getRandomCell(): Vector {
        return new Vector(randomInt(0, this.map.cols), randomInt(0, this.map.rows));
    }

    public registerTileObject(tileObject: TileObject): void {
        this.tileObjects.set(tileObject.id, tileObject);
        // This assumes that tile objects can't move, will need to be reconsidered if that changes
        if (tileObject.blocksPath) {
            this.map.setTileNotPathable(tileObject.position.floor());
            this.map.setTileSolid(tileObject.position.floor(), true);
        }
    }

    public isTileFree(position: Vector): boolean {
        return this.map.isTileFree(position);
    }
}
