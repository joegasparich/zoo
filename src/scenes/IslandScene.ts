import { Scene, Vector } from "engine";
import { MapGrid, MapCell } from "engine/map";

import GroundTile from "world/GroundTile";
import { TILES, OBJECTS } from "constants/assets";
import World from "world/World";
import TileObject from "entities/TileObject";
import { AssetManager, ColliderType } from "engine/managers";
import { TileObjectData } from "types/AssetTypes";

const MAP_SIZE = 20;
const TREE_RATE = 10;

export default class IslandScene extends Scene {
    world: World;

    constructor(world: World) {
        super();

        this.world = world;
    }

    start(map: MapGrid) {
        this.generateMap(this.world);
    }

    generateMap(world: World): void {
        const cells: MapCell[][] = [];

        // Place Grass
        for (let i = 0; i < MAP_SIZE; i++) {
            cells[i] = [];
            for (let j = 0; j < MAP_SIZE; j++) {
                const tile = new GroundTile(TILES.GRASS);
                cells[i][j] = {
                    x: i,
                    y: j,
                    texture: tile.texture,
                    isSolid: false,
                };
            }
        }

        world.map.setupTileGrid(cells);

        //Place Trees
        for (let i = 0; i < MAP_SIZE * TREE_RATE; i++) {
            world.registerTileObject(new TileObject(
                world.game,
                world.getRandomCell().add(new Vector(0.5, 0.5)),
                AssetManager.getJSON(OBJECTS.TREE) as TileObjectData,
                {
                    type: ColliderType.Rect,
                    height: 0.6,
                    width: 0.6,
                },
                true,
            ));
        }
    }
}
