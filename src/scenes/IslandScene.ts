import { Scene, Vector } from "engine";
import { MapGrid, MapCell } from "engine/map";

import GroundTile from "world/GroundTile";
import { Assets } from "consts";
import World from "world/World";

const MAP_SIZE = 5;

export default class IslandScene extends Scene {
    private world: World;

    public constructor(world: World) {
        super();

        this.world = world;
    }

    public start(map: MapGrid) {
        this.generateMap(this.world);
    }

    public generateMap(world: World): void {
        const cells: MapCell[][] = [];

        // Place Grass
        for (let i = 0; i < MAP_SIZE; i++) {
            cells[i] = [];
            for (let j = 0; j < MAP_SIZE; j++) {
                const tile = new GroundTile(Assets.TILES.GRASS);
                cells[i][j] = {
                    position: new Vector(i, j),
                    texture: tile.texture,
                    isSolid: false,
                };
            }
        }

        world.map.setupGrid(cells, true);
    }
}
