import { Scene, Vector } from "engine";
import { MapCell } from "engine/map";

import ZooGame from "ZooGame";
import World from "world/World";
import Player from "entities/Player";

const MAP_SIZE = 10;

export default class ZooScene extends Scene {

    public name = "Zoo Scene";

    public constructor() {
        super();
    }

    public start(): void {
        this.generateMap();

        // Create Player
        const player = ZooGame.registerEntity(new Player(
            new Vector(4, 4),
        )) as Player;
        player.render.scale = 0.5;
    }

    public stop(): void {
        ZooGame.world.reset();
        ZooGame.map.clearMap();
        ZooGame.clearEntities();
    }

    private async generateMap(): Promise<void> {
        const cells: MapCell[][] = [];

        // Place Grass
        for (let i = 0; i < MAP_SIZE; i++) {
            cells[i] = [];
            for (let j = 0; j < MAP_SIZE; j++) {
                cells[i][j] = {
                    position: new Vector(i, j),
                    isSolid: false,
                };
            }
        }

        // Load Map
        ZooGame.map.setupGrid(cells);

        ZooGame.world = new World();
        await ZooGame.world.setup();
    }
}
