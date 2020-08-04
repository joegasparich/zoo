import { Scene, Vector } from "engine";
import { MapGrid, MapCell } from "engine/map";

import World from "world/World";

const MAP_SIZE = 5;

export default class EmptyScene extends Scene {
    private world: World;

    public constructor(world: World) {
        super();

        this.world = world;
    }

    public start(map: MapGrid): void {
        this.generateMap(this.world);
    }

    private generateMap(world: World): void {
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

        world.map.setupGrid(cells, false);
    }
}
