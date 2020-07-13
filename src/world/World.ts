import { Game, Vector } from "engine";
import IslandScene from "scenes/IslandScene";
import { randomInt } from "engine/helpers/math";
import { MapGrid } from "engine/map";
import TileObject from "entities/TileObject";
import TestScene from "scenes/TestScene";

export default class World {
    game: Game;
    map: MapGrid;
    tileObjects: Map<string, TileObject>;

    constructor(game: Game) {
        this.game = game;
        this.map = game.map;
        this.tileObjects = new Map();
    }

    async loadMap() {
        await this.game.sceneManager.loadScene(
            new IslandScene(this),
            // new TestScene(),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );
    }

    getRandomCell(): Vector {
        return new Vector(randomInt(0, this.map.cols), randomInt(0, this.map.rows));
    }

    registerTileObject(tileObject: TileObject): void {
        this.tileObjects.set(tileObject.id, tileObject);
        // This assumes that tile objects can't move, will need to be reconsidered if that changes
        if (tileObject.blocksPath) {
            this.map.setTileNotPathable(Math.floor(tileObject.position.x), Math.floor(tileObject.position.y));
        }
    }
}
