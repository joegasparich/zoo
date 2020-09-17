import { Scene, Vector } from "engine";
import { MapCell } from "engine/map";

import ZooGame from "ZooGame";
import World from "world/World";
import UIManager from "ui/UIManager";

const MAP_SIZE = 10;

export default class ZooScene extends Scene {

    public name = "Zoo Scene";

    public constructor() {
        super();
    }

    public start(): void {
        this.generateMap();
    }

    public stop(): void {
        ZooGame.clearEntities();
        ZooGame.world.reset();
        ZooGame.map.clearMap();
        UIManager.reset();
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
