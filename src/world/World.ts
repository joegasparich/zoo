import { Game, Vector } from "engine";
import IslandScene from "scenes/IslandScene";
import { randomInt } from "engine/helpers/math";
import { MapGrid } from "engine/map";
import TileObject from "entities/TileObject";

export default class World {
    game: Game;
    map: MapGrid;
    tileObjects: Map<string, TileObject>;

    constructor(game: Game) {
        this.game = game;
        this.map = game.mapGrid;
        this.tileObjects = new Map();
    }

    async loadMap() {
        await this.game.sceneManager.loadScene(
            new IslandScene(this),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );
    }

    getRandomCell(): Vector {
        return new Vector(randomInt(0, this.map.cols), randomInt(0, this.map.rows));
    }

    registerTileObject(tileObject: TileObject) {
        this.game.registerEntity(tileObject);
        this.tileObjects.set(tileObject.id, tileObject);
    }
}
